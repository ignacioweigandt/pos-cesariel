from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from app.models import User
from auth_compat import get_current_active_user
from websocket_manager import manager
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/{branch_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    branch_id: int,
    token: Optional[str] = Query(None)
):
    """
    Endpoint WebSocket para conexiones en tiempo real por sucursal
    """
    try:
        # Validar token de autenticación
        if not token:
            await websocket.close(code=4001, reason="Token requerido")
            return
        
        # Aquí podrías validar el token JWT si es necesario
        # Por simplicidad, asumimos que el token es válido
        
        # Establecer conexión
        await manager.connect(websocket, branch_id)
        
        # Enviar estado inicial
        await manager.send_personal_message({
            "type": "status_update",
            "connected_branches": manager.get_connected_branches(),
            "total_connections": manager.get_connection_count(),
            "branch_connections": manager.get_branch_connection_count(branch_id)
        }, websocket)
        
        # Mantener conexión activa y escuchar mensajes
        while True:
            try:
                # Recibir mensaje del cliente
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Procesar diferentes tipos de mensajes
                await handle_websocket_message(message, websocket, branch_id)
                
            except WebSocketDisconnect:
                logger.info(f"Cliente de sucursal {branch_id} desconectado")
                break
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Formato de mensaje inválido"
                }, websocket)
            except Exception as e:
                logger.error(f"Error procesando mensaje WebSocket: {e}")
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Error procesando mensaje"
                }, websocket)
                
    except Exception as e:
        logger.error(f"Error en conexión WebSocket: {e}")
    finally:
        manager.disconnect(websocket)

async def handle_websocket_message(message: dict, websocket: WebSocket, branch_id: int):
    """
    Maneja diferentes tipos de mensajes WebSocket del cliente
    """
    message_type = message.get("type")
    
    if message_type == "ping":
        # Responder a ping con pong
        await manager.send_personal_message({
            "type": "pong",
            "timestamp": message.get("timestamp")
        }, websocket)
        
    elif message_type == "subscribe":
        # Suscribirse a tipos específicos de notificaciones
        subscription_types = message.get("subscription_types", [])
        await manager.send_personal_message({
            "type": "subscription_confirmed",
            "subscription_types": subscription_types
        }, websocket)
        
    elif message_type == "broadcast_test":
        # Mensaje de prueba para broadcast
        if message.get("scope") == "branch":
            await manager.broadcast_to_branch({
                "type": "test_message",
                "message": f"Mensaje de prueba desde sucursal {branch_id}",
                "from_branch": branch_id
            }, branch_id)
        elif message.get("scope") == "all":
            await manager.broadcast_to_all({
                "type": "test_message",
                "message": f"Mensaje global desde sucursal {branch_id}",
                "from_branch": branch_id
            })
        elif message.get("scope") == "others":
            await manager.broadcast_to_other_branches({
                "type": "test_message",
                "message": f"Mensaje a otras sucursales desde sucursal {branch_id}",
                "from_branch": branch_id
            }, branch_id)
            
    elif message_type == "request_status":
        # Solicitar estado actual del sistema
        await manager.send_personal_message({
            "type": "system_status",
            "connected_branches": manager.get_connected_branches(),
            "total_connections": manager.get_connection_count(),
            "branch_connections": manager.get_branch_connection_count(branch_id)
        }, websocket)
        
    else:
        await manager.send_personal_message({
            "type": "error",
            "message": f"Tipo de mensaje no reconocido: {message_type}"
        }, websocket)

@router.get("/ws/status")
async def get_websocket_status():
    """
    Endpoint REST para obtener el estado de las conexiones WebSocket
    """
    return {
        "connected_branches": manager.get_connected_branches(),
        "total_connections": manager.get_connection_count(),
        "branch_connections": {
            branch_id: manager.get_branch_connection_count(branch_id)
            for branch_id in manager.get_connected_branches()
        }
    }