from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Almacena conexiones por branch_id para envios dirigidos
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Almacena todas las conexiones para broadcasts globales
        self.all_connections: List[WebSocket] = []
        # Mapea websockets a branch_id para identificación
        self.connection_branch_map: Dict[WebSocket, int] = {}

    async def register_connection(self, websocket: WebSocket, branch_id: int, username: str = None):
        """
        Registra una conexión WebSocket ya aceptada.
        NOTA: La conexión debe ser aceptada ANTES de llamar a este método.
        """
        # Agregar a la lista de todas las conexiones
        if websocket not in self.all_connections:
            self.all_connections.append(websocket)

        # Agregar a la lista de conexiones por sucursal
        if branch_id not in self.active_connections:
            self.active_connections[branch_id] = []
        if websocket not in self.active_connections[branch_id]:
            self.active_connections[branch_id].append(websocket)

        # Mapear conexión a sucursal
        self.connection_branch_map[websocket] = branch_id

        logger.info(f"Conexión WebSocket registrada: usuario={username}, sucursal={branch_id}")

    async def connect(self, websocket: WebSocket, branch_id: int):
        """
        Acepta y registra una nueva conexión WebSocket.
        DEPRECATED: Usar register_connection() después de aceptar manualmente.
        """
        await websocket.accept()
        await self.register_connection(websocket, branch_id)

        # Enviar mensaje de bienvenida
        await self.send_personal_message({
            "type": "connection_established",
            "message": f"Conectado a la sucursal {branch_id}",
            "timestamp": datetime.now().isoformat()
        }, websocket)

    def disconnect(self, websocket: WebSocket):
        """Desconecta un WebSocket"""
        try:
            # Remover de todas las conexiones
            if websocket in self.all_connections:
                self.all_connections.remove(websocket)
            
            # Remover de conexiones por sucursal
            branch_id = self.connection_branch_map.get(websocket)
            if branch_id and branch_id in self.active_connections:
                if websocket in self.active_connections[branch_id]:
                    self.active_connections[branch_id].remove(websocket)
                
                # Limpiar lista vacía
                if not self.active_connections[branch_id]:
                    del self.active_connections[branch_id]
            
            # Remover del mapeo
            if websocket in self.connection_branch_map:
                del self.connection_branch_map[websocket]
                
            logger.info(f"Conexión WebSocket desconectada para sucursal {branch_id}")
            
        except Exception as e:
            logger.error(f"Error al desconectar WebSocket: {e}")

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Envía un mensaje a una conexión específica"""
        try:
            # Check if websocket is still connected before sending
            if websocket not in self.all_connections:
                return
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            # Log error but don't disconnect here to avoid infinite loops
            logger.debug(f"Error enviando mensaje personal: {e}")
            # Remove from connections silently
            self._silent_disconnect(websocket)

    async def broadcast_to_branch(self, message: Dict[str, Any], branch_id: int):
        """Envía un mensaje a todas las conexiones de una sucursal"""
        if branch_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[branch_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.debug(f"Error enviando mensaje a sucursal {branch_id}: {e}")
                    disconnected.append(connection)
            
            # Limpiar conexiones desconectadas silenciosamente
            for connection in disconnected:
                self._silent_disconnect(connection)

    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Envía un mensaje a todas las conexiones activas"""
        disconnected = []
        for connection in self.all_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.debug(f"Error enviando broadcast: {e}")
                disconnected.append(connection)
        
        # Limpiar conexiones desconectadas silenciosamente
        for connection in disconnected:
            self._silent_disconnect(connection)

    async def broadcast_to_other_branches(self, message: Dict[str, Any], exclude_branch_id: int):
        """Envía un mensaje a todas las sucursales excepto la especificada"""
        for branch_id, connections in self.active_connections.items():
            if branch_id != exclude_branch_id:
                await self.broadcast_to_branch(message, branch_id)

    def get_connected_branches(self) -> List[int]:
        """Retorna lista de sucursales con conexiones activas"""
        return list(self.active_connections.keys())

    def get_connection_count(self) -> int:
        """Retorna el número total de conexiones activas"""
        return len(self.all_connections)

    def get_branch_connection_count(self, branch_id: int) -> int:
        """Retorna el número de conexiones para una sucursal específica"""
        return len(self.active_connections.get(branch_id, []))
    
    def _silent_disconnect(self, websocket: WebSocket):
        """Desconecta silenciosamente sin logging para evitar loops infinitos"""
        try:
            # Remover de todas las conexiones
            if websocket in self.all_connections:
                self.all_connections.remove(websocket)
            
            # Remover de conexiones por sucursal
            branch_id = self.connection_branch_map.get(websocket)
            if branch_id and branch_id in self.active_connections:
                if websocket in self.active_connections[branch_id]:
                    self.active_connections[branch_id].remove(websocket)
                
                # Limpiar lista vacía
                if not self.active_connections[branch_id]:
                    del self.active_connections[branch_id]
            
            # Remover del mapeo
            if websocket in self.connection_branch_map:
                del self.connection_branch_map[websocket]
                
        except Exception:
            # Silent fail - no logging to avoid infinite loops
            pass

# Instancia global del manager
manager = ConnectionManager()

# Funciones de utilidad para enviar notificaciones específicas

async def notify_inventory_change(product_id: int, old_stock: int, new_stock: int, branch_id: int, user_name: str):
    """Notifica cambios en el inventario"""
    message = {
        "type": "inventory_change",
        "product_id": product_id,
        "old_stock": old_stock,
        "new_stock": new_stock,
        "branch_id": branch_id,
        "user_name": user_name,
        "timestamp": datetime.now().isoformat(),
        "message": f"Stock actualizado por {user_name}: {old_stock} → {new_stock}"
    }
    await manager.broadcast_to_other_branches(message, branch_id)

async def notify_new_sale(sale_id: int, total_amount: float, branch_id: int, user_name: str):
    """Notifica nuevas ventas"""
    message = {
        "type": "new_sale",
        "sale_id": sale_id,
        "total_amount": total_amount,
        "branch_id": branch_id,
        "user_name": user_name,
        "timestamp": datetime.now().isoformat(),
        "message": f"Nueva venta por ${total_amount:.2f} en sucursal {branch_id}"
    }
    await manager.broadcast_to_all(message)

async def notify_low_stock(product_id: int, product_name: str, current_stock: int, min_stock: int, branch_id: int):
    """Notifica stock bajo"""
    message = {
        "type": "low_stock_alert",
        "product_id": product_id,
        "product_name": product_name,
        "current_stock": current_stock,
        "min_stock": min_stock,
        "branch_id": branch_id,
        "timestamp": datetime.now().isoformat(),
        "message": f"⚠️ Stock bajo: {product_name} ({current_stock} unidades)"
    }
    await manager.broadcast_to_all(message)

async def notify_user_action(action: str, user_name: str, branch_id: int, details: str = ""):
    """Notifica acciones de usuarios"""
    message = {
        "type": "user_action",
        "action": action,
        "user_name": user_name,
        "branch_id": branch_id,
        "details": details,
        "timestamp": datetime.now().isoformat(),
        "message": f"{user_name}: {action} {details}".strip()
    }
    await manager.broadcast_to_other_branches(message, branch_id)

async def notify_system_message(message_text: str, message_type: str = "info"):
    """Envía mensajes del sistema a todas las conexiones"""
    message = {
        "type": "system_message",
        "message_type": message_type,  # info, warning, error, success
        "message": message_text,
        "timestamp": datetime.now().isoformat()
    }
    await manager.broadcast_to_all(message)

async def notify_product_update(product_id: int, product_name: str, action: str, user_name: str, branch_id: int):
    """Notifica actualizaciones de productos"""
    message = {
        "type": "product_update",
        "product_id": product_id,
        "product_name": product_name,
        "action": action,  # created, updated, deleted
        "user_name": user_name,
        "branch_id": branch_id,
        "timestamp": datetime.now().isoformat(),
        "message": f"Producto {product_name}: {action} por {user_name}"
    }
    await manager.broadcast_to_all(message)

async def notify_sale_status_change(sale_id: int, sale_number: str, old_status: str, new_status: str, branch_id: int):
    """Notifica cambios de estado de ventas"""
    message = {
        "type": "sale_status_change",
        "sale_id": sale_id,
        "sale_number": sale_number,
        "old_status": old_status,
        "new_status": new_status,
        "branch_id": branch_id,
        "timestamp": datetime.now().isoformat(),
        "message": f"Venta {sale_number}: {old_status} → {new_status}"
    }
    await manager.broadcast_to_all(message)

async def notify_dashboard_update(branch_id: int, update_type: str, data: dict):
    """Notifica actualizaciones del dashboard"""
    message = {
        "type": "dashboard_update",
        "update_type": update_type,  # sales_today, new_transaction, stock_alert
        "branch_id": branch_id,
        "data": data,
        "timestamp": datetime.now().isoformat(),
        "message": f"Dashboard actualizado: {update_type}"
    }
    await manager.broadcast_to_all(message)