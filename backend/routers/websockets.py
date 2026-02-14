"""
Router de WebSockets - Comunicación en Tiempo Real.

Sistema de WebSockets para notificaciones y actualizaciones en tiempo real
entre frontends y backend. Conexiones por sucursal con autenticación JWT.

Endpoints:
    WS /ws/{branch_id}: Conexión WebSocket por sucursal

Autenticación:
    - Query param: ?token=<jwt_token>
    - Validación JWT antes de aceptar conexión
    - Extracción de username y role desde token

Características:
    - Conexiones separadas por sucursal (multi-tenant)
    - Server heartbeat cada 20s (mantiene conexión activa)
    - Receive timeout de 60s
    - Filtrado de mensajes por suscripción
    - Rate limiting por conexión (60 msg/min)
    - broadcast_test restringido a ADMIN
    - Manejo de desconexiones automáticas

Mensajes Soportados:
    - inventory_change: Cambios de stock
    - new_sale: Nueva venta registrada
    - low_stock_alert: Alerta de stock bajo
    - product_update: Actualización de producto
    - sale_status_change: Cambio de estado de orden
    - dashboard_update: Actualización de métricas
    - server_heartbeat: Keepalive del servidor
"""
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


def validate_ws_token(token: str) -> Optional[dict]:
    """
    Valida el token JWT y retorna info del usuario si es válido.
    Retorna None si el token es inválido.
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            return None
        return {
            "username": username,
            "role": payload.get("role"),
        }
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
    connection_registered = False

    try:
        await websocket.accept()

        if not token:
            await websocket.send_json({
                "type": "error",
                "code": 4001,
                "message": "Token de autenticación requerido"
            })
            await websocket.close(code=4001, reason="Token requerido")
            return

        user_info = validate_ws_token(token)
        if not user_info:
            await websocket.send_json({
                "type": "error",
                "code": 4003,
                "message": "Token de autenticación inválido o expirado"
            })
            await websocket.close(code=4003, reason="Token inválido")
            return

        username = user_info["username"]
        role = user_info.get("role")

        await manager.register_connection(websocket, branch_id, username, role)
        connection_registered = True

        logger.info(f"WebSocket conectado: usuario={username}, sucursal={branch_id}, role={role}")

        await websocket.send_json({
            "type": "connection_established",
            "username": username,
            "branch_id": branch_id,
            "connected_branches": manager.get_connected_branches(),
            "total_connections": manager.get_connection_count()
        })

        heartbeat_task = asyncio.create_task(
            server_heartbeat(websocket, username, branch_id)
        )

        try:
            while True:
                try:
                    data = await asyncio.wait_for(
                        websocket.receive_text(),
                        timeout=RECEIVE_TIMEOUT
                    )
                    message = json.loads(data)

                    # Rate limiting check
                    if not manager.check_rate_limit(websocket):
                        await websocket.send_json({
                            "type": "error",
                            "message": "Rate limit excedido. Máximo 60 mensajes por minuto."
                        })
                        continue

                    await handle_websocket_message(message, websocket, branch_id)

                except asyncio.TimeoutError:
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
                    break
        finally:
            heartbeat_task.cancel()
            try:
                await heartbeat_task
            except asyncio.CancelledError:
                pass

    except WebSocketDisconnect:
        logger.debug(f"WebSocket desconectado durante handshake: sucursal={branch_id}")
    except Exception as e:
        logger.error(f"Error en conexión WebSocket: {e}")
    finally:
        if connection_registered:
            manager.disconnect(websocket)


async def handle_websocket_message(message: dict, websocket: WebSocket, branch_id: int):
    """
    Maneja diferentes tipos de mensajes WebSocket del cliente.
    """
    message_type = message.get("type")

    if message_type == "ping":
        await websocket.send_json({
            "type": "pong",
            "timestamp": message.get("timestamp")
        })

    elif message_type == "subscribe":
        subscription_types = message.get("subscription_types", [])
        manager.set_subscriptions(websocket, subscription_types)
        await websocket.send_json({
            "type": "subscription_confirmed",
            "subscription_types": subscription_types
        })

    elif message_type == "request_status":
        await websocket.send_json({
            "type": "system_status",
            "connected_branches": manager.get_connected_branches(),
            "total_connections": manager.get_connection_count(),
            "branch_connections": manager.get_branch_connection_count(branch_id)
        })

    elif message_type == "broadcast_test":
        # Solo ADMIN puede hacer broadcast de prueba
        role = manager.get_role(websocket)
        if role != "ADMIN":
            await websocket.send_json({
                "type": "error",
                "message": "Broadcast de prueba requiere rol ADMIN"
            })
            return

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
