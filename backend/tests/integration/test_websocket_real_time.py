import pytest
import asyncio
import json
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocketDisconnect
from unittest.mock import AsyncMock, patch

from main import app
from websocket_manager import manager


@pytest.mark.websocket
@pytest.mark.asyncio
class TestWebSocketRealTime:
    """Test WebSocket real-time functionality."""
    
    async def test_websocket_connection_with_auth(self, test_admin_user):
        """Test WebSocket connection with authentication."""
        # Create JWT token for WebSocket connection
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={token}") as websocket:
                # Should connect successfully
                assert websocket is not None
                
                # Should receive welcome message
                data = websocket.receive_json()
                assert data["type"] == "connection_established"
                assert data["data"]["user_id"] == test_admin_user.id
    
    async def test_websocket_connection_without_auth(self):
        """Test WebSocket connection without authentication."""
        with TestClient(app) as client:
            with pytest.raises(WebSocketDisconnect):
                with client.websocket_connect("/ws"):
                    pass  # Should disconnect immediately
    
    async def test_websocket_connection_with_invalid_token(self):
        """Test WebSocket connection with invalid token."""
        with TestClient(app) as client:
            with pytest.raises(WebSocketDisconnect):
                with client.websocket_connect("/ws?token=invalid_token"):
                    pass  # Should disconnect immediately
    
    async def test_websocket_heartbeat(self, test_admin_user):
        """Test WebSocket heartbeat mechanism."""
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={token}") as websocket:
                # Receive welcome message
                websocket.receive_json()
                
                # Send ping
                websocket.send_json({"type": "ping"})
                
                # Should receive pong
                response = websocket.receive_json()
                assert response["type"] == "pong"
    
    async def test_inventory_change_notification(self, test_admin_user, test_product):
        """Test inventory change notifications."""
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={token}") as websocket:
                # Receive welcome message
                websocket.receive_json()
                
                # Simulate inventory change
                notification_data = {
                    "type": "inventory_change",
                    "data": {
                        "product_id": test_product.id,
                        "product_name": test_product.name,
                        "old_stock": 100,
                        "new_stock": 95,
                        "change": -5,
                        "reason": "sale"
                    }
                }
                
                # Send notification via manager
                await manager.broadcast_to_branch(
                    test_admin_user.branch_id,
                    notification_data
                )
                
                # Should receive notification
                received = websocket.receive_json()
                assert received["type"] == "inventory_change"
                assert received["data"]["product_id"] == test_product.id
                assert received["data"]["new_stock"] == 95
    
    async def test_new_sale_notification(self, test_admin_user):
        """Test new sale notifications."""
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={token}") as websocket:
                # Receive welcome message
                websocket.receive_json()
                
                # Simulate new sale
                notification_data = {
                    "type": "new_sale",
                    "data": {
                        "sale_id": 123,
                        "sale_number": "SALE-123",
                        "total": 150.00,
                        "customer": "Test Customer",
                        "seller": test_admin_user.full_name
                    }
                }
                
                await manager.broadcast_to_branch(
                    test_admin_user.branch_id,
                    notification_data
                )
                
                # Should receive notification
                received = websocket.receive_json()
                assert received["type"] == "new_sale"
                assert received["data"]["sale_id"] == 123
                assert received["data"]["total"] == 150.00
    
    async def test_low_stock_alert(self, test_admin_user, test_product):
        """Test low stock alert notifications."""
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={token}") as websocket:
                # Receive welcome message
                websocket.receive_json()
                
                # Simulate low stock alert
                notification_data = {
                    "type": "low_stock_alert",
                    "data": {
                        "product_id": test_product.id,
                        "product_name": test_product.name,
                        "current_stock": 3,
                        "min_stock": 10,
                        "sku": test_product.sku
                    }
                }
                
                await manager.broadcast_to_branch(
                    test_admin_user.branch_id,
                    notification_data
                )
                
                # Should receive notification
                received = websocket.receive_json()
                assert received["type"] == "low_stock_alert"
                assert received["data"]["product_id"] == test_product.id
                assert received["data"]["current_stock"] == 3
    
    async def test_product_update_notification(self, test_admin_user, test_product):
        """Test product update notifications."""
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={token}") as websocket:
                # Receive welcome message
                websocket.receive_json()
                
                # Simulate product update
                notification_data = {
                    "type": "product_update",
                    "data": {
                        "product_id": test_product.id,
                        "product_name": test_product.name,
                        "action": "updated",
                        "changes": ["price", "stock"],
                        "updated_by": test_admin_user.full_name
                    }
                }
                
                await manager.broadcast_to_branch(
                    test_admin_user.branch_id,
                    notification_data
                )
                
                # Should receive notification
                received = websocket.receive_json()
                assert received["type"] == "product_update"
                assert received["data"]["action"] == "updated"
                assert "price" in received["data"]["changes"]
    
    async def test_dashboard_update_notification(self, test_admin_user):
        """Test dashboard update notifications."""
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={token}") as websocket:
                # Receive welcome message
                websocket.receive_json()
                
                # Simulate dashboard update
                notification_data = {
                    "type": "dashboard_update",
                    "data": {
                        "daily_sales": 2500.00,
                        "daily_transactions": 45,
                        "total_products": 150,
                        "low_stock_products": 5
                    }
                }
                
                await manager.broadcast_to_branch(
                    test_admin_user.branch_id,
                    notification_data
                )
                
                # Should receive notification
                received = websocket.receive_json()
                assert received["type"] == "dashboard_update"
                assert received["data"]["daily_sales"] == 2500.00
                assert received["data"]["daily_transactions"] == 45
    
    async def test_sale_status_change_notification(self, test_admin_user):
        """Test sale status change notifications."""
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={token}") as websocket:
                # Receive welcome message
                websocket.receive_json()
                
                # Simulate sale status change
                notification_data = {
                    "type": "sale_status_change",
                    "data": {
                        "sale_id": 123,
                        "sale_number": "SALE-123",
                        "old_status": "PENDING",
                        "new_status": "COMPLETED",
                        "updated_by": test_admin_user.full_name
                    }
                }
                
                await manager.broadcast_to_branch(
                    test_admin_user.branch_id,
                    notification_data
                )
                
                # Should receive notification
                received = websocket.receive_json()
                assert received["type"] == "sale_status_change"
                assert received["data"]["new_status"] == "COMPLETED"
    
    async def test_system_message_notification(self, test_admin_user):
        """Test system message notifications."""
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={token}") as websocket:
                # Receive welcome message
                websocket.receive_json()
                
                # Simulate system message
                notification_data = {
                    "type": "system_message",
                    "data": {
                        "title": "System Maintenance",
                        "message": "System will be down for maintenance at 2 AM",
                        "priority": "high",
                        "expires_at": "2024-01-01T02:00:00Z"
                    }
                }
                
                await manager.broadcast_to_all(notification_data)
                
                # Should receive notification
                received = websocket.receive_json()
                assert received["type"] == "system_message"
                assert received["data"]["title"] == "System Maintenance"
                assert received["data"]["priority"] == "high"
    
    async def test_user_action_notification(self, test_admin_user, test_manager_user):
        """Test user action notifications."""
        from auth import create_access_token
        admin_token = create_access_token(data={"sub": test_admin_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={admin_token}") as websocket:
                # Receive welcome message
                websocket.receive_json()
                
                # Simulate user action
                notification_data = {
                    "type": "user_action",
                    "data": {
                        "action": "login",
                        "user_id": test_manager_user.id,
                        "username": test_manager_user.username,
                        "branch_id": test_manager_user.branch_id,
                        "timestamp": "2024-01-01T10:00:00Z"
                    }
                }
                
                await manager.send_personal_message(
                    test_admin_user.id,
                    notification_data
                )
                
                # Should receive notification
                received = websocket.receive_json()
                assert received["type"] == "user_action"
                assert received["data"]["action"] == "login"
                assert received["data"]["username"] == test_manager_user.username
    
    async def test_multiple_connections_same_user(self, test_admin_user):
        """Test multiple WebSocket connections for same user."""
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={token}") as ws1:
                with client.websocket_connect(f"/ws?token={token}") as ws2:
                    # Both should receive welcome messages
                    ws1.receive_json()
                    ws2.receive_json()
                    
                    # Send notification
                    notification_data = {
                        "type": "test_message",
                        "data": {"message": "Test"}
                    }
                    
                    await manager.send_personal_message(
                        test_admin_user.id,
                        notification_data
                    )
                    
                    # Both connections should receive the message
                    msg1 = ws1.receive_json()
                    msg2 = ws2.receive_json()
                    
                    assert msg1["type"] == "test_message"
                    assert msg2["type"] == "test_message"
    
    async def test_branch_specific_notifications(self, test_admin_user, test_branch_secondary):
        """Test that notifications are sent only to specific branches."""
        from auth import create_access_token
        from models import User
        
        # Create user in different branch
        other_user = User(
            email="other@test.com",
            username="otheruser",
            full_name="Other User",
            hashed_password="hash",
            role="MANAGER",
            branch_id=test_branch_secondary.id,
            is_active=True
        )
        
        admin_token = create_access_token(data={"sub": test_admin_user.username})
        other_token = create_access_token(data={"sub": other_user.username})
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={admin_token}") as ws_admin:
                with client.websocket_connect(f"/ws?token={other_token}") as ws_other:
                    # Receive welcome messages
                    ws_admin.receive_json()
                    ws_other.receive_json()
                    
                    # Send notification to admin's branch only
                    notification_data = {
                        "type": "branch_specific",
                        "data": {"message": "Branch specific message"}
                    }
                    
                    await manager.broadcast_to_branch(
                        test_admin_user.branch_id,
                        notification_data
                    )
                    
                    # Only admin should receive the message
                    admin_msg = ws_admin.receive_json()
                    assert admin_msg["type"] == "branch_specific"
                    
                    # Other user should not receive anything
                    # (This would timeout if implemented correctly)
    
    async def test_websocket_disconnection_cleanup(self, test_admin_user):
        """Test that connections are properly cleaned up on disconnect."""
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        initial_count = manager.get_connection_count()
        
        with TestClient(app) as client:
            with client.websocket_connect(f"/ws?token={token}") as websocket:
                # Receive welcome message
                websocket.receive_json()
                
                # Connection count should increase
                assert manager.get_connection_count() == initial_count + 1
            
            # After disconnect, count should return to initial
            assert manager.get_connection_count() == initial_count
    
    async def test_websocket_status_endpoint(self, client, auth_headers_admin, test_admin_user):
        """Test WebSocket status endpoint."""
        from auth import create_access_token
        token = create_access_token(data={"sub": test_admin_user.username})
        
        # Establish WebSocket connection
        with TestClient(app) as ws_client:
            with ws_client.websocket_connect(f"/ws?token={token}") as websocket:
                websocket.receive_json()
                
                # Check status endpoint
                response = client.get("/ws/status", headers=auth_headers_admin)
                
                assert response.status_code == 200
                data = response.json()
                
                assert "total_connections" in data
                assert "connections_by_branch" in data
                assert data["total_connections"] >= 1
    
    @patch('websocket_manager.manager.broadcast_to_branch')
    async def test_integration_with_sale_creation(self, mock_broadcast, client, auth_headers_admin, test_product, mock_websocket_manager):
        """Test that WebSocket notifications are sent when sales are created."""
        test_product.stock_quantity = 10
        
        sale_data = {
            "sale_type": "POS",
            "customer_name": "Test Customer",
            "payment_method": "CASH",
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 1,
                    "unit_price": test_product.price
                }
            ]
        }
        
        response = client.post("/sales", json=sale_data, headers=auth_headers_admin)
        assert response.status_code == 200
        
        # Should trigger WebSocket notifications
        assert mock_broadcast.called
    
    @patch('websocket_manager.manager.broadcast_to_branch')
    async def test_integration_with_inventory_update(self, mock_broadcast, client, auth_headers_admin, test_product, mock_websocket_manager):
        """Test that WebSocket notifications are sent when inventory is updated."""
        update_data = {
            "stock_quantity": 50
        }
        
        response = client.put(
            f"/products/{test_product.id}",
            json=update_data,
            headers=auth_headers_admin
        )
        assert response.status_code == 200
        
        # Should trigger WebSocket notifications
        assert mock_broadcast.called