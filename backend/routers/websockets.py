from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from websocket_manager import manager
import json
import logging
import asyncio
from typing import Optional
from datetime import datetime
from jose import jwt, JWTError
from config.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Configuración de keepalive
HEARTBEAT_INTERVAL = 20  # Enviar heartbeat cada 20 segundos
RECEIVE_TIMEOUT = 60  # Timeout para recibir mensajes (segundos)


def validate_ws_token(token: str) -> Optional[str]:
    """
    Valida el token JWT y retorna el username si es válido.
    Retorna None si el token es inválido.
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError as e:
        logger.debug(f"Token JWT inválido: {e}")
        return None


async def server_heartbeat(websocket: WebSocket, username: str, branch_id: int):
    """
    Tarea asíncrona que envía heartbeats del servidor al cliente.
    Esto mantiene la conexión activa incluso si el cliente no envía mensajes.
    Importante para proxies como Railway que cierran conexiones idle.
    """
    try:
        while True:
            await asyncio.sleep(HEARTBEAT_INTERVAL)
            try:
                await websocket.send_json({
                    "type": "server_heartbeat",
                    "timestamp": datetime.now().isoformat(),
                    "branch_id": branch_id
                })
                logger.debug(f"Heartbeat enviado a usuario={username}, sucursal={branch_id}")
            except Exception as e:
                logger.debug(f"Error enviando heartbeat: {e}")
                break
    except asyncio.CancelledError:
        # Tarea cancelada normalmente cuando la conexión se cierra
        pass


@router.websocket("/ws/{branch_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    branch_id: int,
    token: Optional[str] = Query(None)
):
    """
    Endpoint WebSocket para conexiones en tiempo real por sucursal.

    El flujo es:
    1. Aceptar la conexión WebSocket
    2. Validar el token JWT
    3. Si es inválido, enviar error y cerrar
    4. Si es válido, registrar en el manager y escuchar mensajes
    """
    # Bandera para saber si la conexión fue registrada en el manager
    connection_registered = False

    try:
        # IMPORTANTE: Primero aceptar la conexión WebSocket
        await websocket.accept()

        # Validar que se proporcionó un token
        if not token:
            await websocket.send_json({
                "type": "error",
                "code": 4001,
                "message": "Token de autenticación requerido"
            })
            await websocket.close(code=4001, reason="Token requerido")
            return

        # Validar el token JWT
        username = validate_ws_token(token)
        if not username:
            await websocket.send_json({
                "type": "error",
                "code": 4003,
                "message": "Token de autenticación inválido o expirado"
            })
            await websocket.close(code=4003, reason="Token inválido")
            return

        # Token válido - registrar la conexión en el manager
        await manager.register_connection(websocket, branch_id, username)
        connection_registered = True

        logger.info(f"WebSocket conectado: usuario={username}, sucursal={branch_id}")

        # Enviar estado inicial
        await websocket.send_json({
            "type": "connection_established",
            "username": username,
            "branch_id": branch_id,
            "connected_branches": manager.get_connected_branches(),
            "total_connections": manager.get_connection_count()
        })

        # Crear tarea de heartbeat del servidor para mantener conexión activa
        heartbeat_task = asyncio.create_task(
            server_heartbeat(websocket, username, branch_id)
        )

        try:
            # Mantener conexión activa y escuchar mensajes
            while True:
                try:
                    # Recibir mensaje del cliente con timeout
                    data = await asyncio.wait_for(
                        websocket.receive_text(),
                        timeout=RECEIVE_TIMEOUT
                    )
                    message = json.loads(data)

                    # Procesar diferentes tipos de mensajes
                    await handle_websocket_message(message, websocket, branch_id)

                except asyncio.TimeoutError:
                    # No se recibió mensaje en el tiempo esperado, pero la conexión sigue activa
                    # El heartbeat mantiene la conexión viva
                    continue
                except WebSocketDisconnect:
                    logger.info(f"WebSocket desconectado: usuario={username}, sucursal={branch_id}")
                    break
                except json.JSONDecodeError:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Formato de mensaje inválido (JSON esperado)"
                    })
                except Exception as e:
                    logger.error(f"Error procesando mensaje WebSocket: {e}")
                    # No enviar mensaje de error aquí para evitar loops
                    break
        finally:
            # Cancelar la tarea de heartbeat cuando termina la conexión
            heartbeat_task.cancel()
            try:
                await heartbeat_task
            except asyncio.CancelledError:
                pass

    except WebSocketDisconnect:
        # La conexión se cerró antes de completar el handshake
        logger.debug(f"WebSocket desconectado durante handshake: sucursal={branch_id}")
    except Exception as e:
        logger.error(f"Error en conexión WebSocket: {e}")
    finally:
        # Solo desconectar si la conexión fue registrada
        if connection_registered:
            manager.disconnect(websocket)


async def handle_websocket_message(message: dict, websocket: WebSocket, branch_id: int):
    """
    Maneja diferentes tipos de mensajes WebSocket del cliente.
    """
    message_type = message.get("type")

    if message_type == "ping":
        # Responder a ping con pong (keep-alive)
        await websocket.send_json({
            "type": "pong",
            "timestamp": message.get("timestamp")
        })

    elif message_type == "subscribe":
        # Suscribirse a tipos específicos de notificaciones
        subscription_types = message.get("subscription_types", [])
        await websocket.send_json({
            "type": "subscription_confirmed",
            "subscription_types": subscription_types
        })

    elif message_type == "request_status":
        # Solicitar estado actual del sistema
        await websocket.send_json({
            "type": "system_status",
            "connected_branches": manager.get_connected_branches(),
            "total_connections": manager.get_connection_count(),
            "branch_connections": manager.get_branch_connection_count(branch_id)
        })

    elif message_type == "broadcast_test":
        # Mensaje de prueba para broadcast (solo para testing)
        scope = message.get("scope", "branch")
        if scope == "branch":
            await manager.broadcast_to_branch({
                "type": "test_message",
                "message": f"Mensaje de prueba desde sucursal {branch_id}",
                "from_branch": branch_id
            }, branch_id)
        elif scope == "all":
            await manager.broadcast_to_all({
                "type": "test_message",
                "message": f"Mensaje global desde sucursal {branch_id}",
                "from_branch": branch_id
            })
        elif scope == "others":
            await manager.broadcast_to_other_branches({
                "type": "test_message",
                "message": f"Mensaje a otras sucursales desde sucursal {branch_id}",
                "from_branch": branch_id
            }, branch_id)

    else:
        await websocket.send_json({
            "type": "error",
            "message": f"Tipo de mensaje no reconocido: {message_type}"
        })


@router.get("/ws/status")
async def get_websocket_status():
    """
    Endpoint REST para obtener el estado de las conexiones WebSocket.
    """
    return {
        "connected_branches": manager.get_connected_branches(),
        "total_connections": manager.get_connection_count(),
        "branch_connections": {
            branch_id: manager.get_branch_connection_count(branch_id)
            for branch_id in manager.get_connected_branches()
        }
    }
