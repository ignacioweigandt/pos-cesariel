import pytest
import asyncio
import json
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from websocket_manager import (
    ConnectionManager, 
    notify_inventory_change,
    notify_new_sale,
    notify_low_stock,
    notify_system_message
)


@pytest.mark.integration
@pytest.mark.websocket
class TestWebSocketManager:
    """Test WebSocket manager functionality."""
    
    @pytest.fixture
    def manager(self):
        """Create a fresh connection manager for each test."""
        return ConnectionManager()
    
    @pytest.fixture
    def mock_websocket(self):
        """Create a mock WebSocket connection."""
        websocket = AsyncMock()
        websocket.send_text = AsyncMock()
        return websocket
    
    def test_connection_manager_initialization(self, manager):
        """Test that connection manager initializes correctly."""
        assert manager.active_connections == {}
        assert manager.all_connections == []
        assert manager.connection_branch_map == {}
        assert manager.get_connection_count() == 0
        assert manager.get_connected_branches() == []
    
    @pytest.mark.asyncio
    async def test_connect_websocket(self, manager, mock_websocket):
        """Test connecting a WebSocket."""
        branch_id = 1
        
        await manager.connect(mock_websocket, branch_id)
        
        # Check that connection was registered
        assert mock_websocket in manager.all_connections
        assert branch_id in manager.active_connections
        assert mock_websocket in manager.active_connections[branch_id]
        assert manager.connection_branch_map[mock_websocket] == branch_id
        assert manager.get_connection_count() == 1
        assert manager.get_branch_connection_count(branch_id) == 1
        
        # Check that accept and welcome message were sent
        mock_websocket.accept.assert_called_once()
        mock_websocket.send_text.assert_called()
    
    def test_disconnect_websocket(self, manager, mock_websocket):
        """Test disconnecting a WebSocket."""
        branch_id = 1
        
        # Manually add connection (since we can't await in sync test)
        manager.all_connections.append(mock_websocket)
        manager.active_connections[branch_id] = [mock_websocket]
        manager.connection_branch_map[mock_websocket] = branch_id
        
        manager.disconnect(mock_websocket)
        
        # Check that connection was removed
        assert mock_websocket not in manager.all_connections
        assert branch_id not in manager.active_connections
        assert mock_websocket not in manager.connection_branch_map
        assert manager.get_connection_count() == 0
    
    @pytest.mark.asyncio
    async def test_send_personal_message(self, manager, mock_websocket):
        """Test sending personal message to a specific connection."""
        message = {"type": "test", "content": "hello"}
        
        await manager.send_personal_message(message, mock_websocket)
        
        mock_websocket.send_text.assert_called_once_with(json.dumps(message))
    
    @pytest.mark.asyncio
    async def test_broadcast_to_branch(self, manager, mock_websocket):
        """Test broadcasting message to all connections in a branch."""
        branch_id = 1
        message = {"type": "test", "content": "broadcast"}
        
        # Add connection to branch
        manager.active_connections[branch_id] = [mock_websocket]
        
        await manager.broadcast_to_branch(message, branch_id)
        
        mock_websocket.send_text.assert_called_once_with(json.dumps(message))
    
    @pytest.mark.asyncio
    async def test_broadcast_to_all(self, manager, mock_websocket):
        """Test broadcasting message to all connections."""
        message = {"type": "test", "content": "broadcast_all"}
        
        # Add connection
        manager.all_connections.append(mock_websocket)
        
        await manager.broadcast_to_all(message)
        
        mock_websocket.send_text.assert_called_once_with(json.dumps(message))
    
    @pytest.mark.asyncio
    async def test_broadcast_to_other_branches(self, manager):
        """Test broadcasting to other branches excluding one."""
        branch1_ws = AsyncMock()
        branch2_ws = AsyncMock()
        branch3_ws = AsyncMock()
        
        manager.active_connections = {
            1: [branch1_ws],
            2: [branch2_ws], 
            3: [branch3_ws]
        }
        
        message = {"type": "test", "content": "other_branches"}
        exclude_branch = 2
        
        await manager.broadcast_to_other_branches(message, exclude_branch)
        
        # Should send to branch 1 and 3, but not 2
        branch1_ws.send_text.assert_called_once()
        branch2_ws.send_text.assert_not_called()
        branch3_ws.send_text.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_notify_inventory_change(self, mocker):
        """Test inventory change notification."""
        mock_manager = mocker.patch("websocket_manager.manager")
        mock_manager.broadcast_to_other_branches = mocker.AsyncMock()
        
        await notify_inventory_change(
            product_id=1,
            old_stock=100,
            new_stock=95,
            branch_id=1,
            user_name="Test User"
        )
        
        mock_manager.broadcast_to_other_branches.assert_called_once()
        call_args = mock_manager.broadcast_to_other_branches.call_args
        message = call_args[0][0]
        branch_id = call_args[0][1]
        
        assert message["type"] == "inventory_change"
        assert message["product_id"] == 1
        assert message["old_stock"] == 100
        assert message["new_stock"] == 95
        assert branch_id == 1
    
    @pytest.mark.asyncio
    async def test_notify_new_sale(self, mocker):
        """Test new sale notification."""
        mock_manager = mocker.patch("websocket_manager.manager")
        mock_manager.broadcast_to_all = mocker.AsyncMock()
        
        await notify_new_sale(
            sale_id=1,
            total_amount=25.99,
            branch_id=1,
            user_name="Test User"
        )
        
        mock_manager.broadcast_to_all.assert_called_once()
        call_args = mock_manager.broadcast_to_all.call_args
        message = call_args[0][0]
        
        assert message["type"] == "new_sale"
        assert message["sale_id"] == 1
        assert message["total_amount"] == 25.99
        assert message["branch_id"] == 1
    
    @pytest.mark.asyncio
    async def test_notify_low_stock(self, mocker):
        """Test low stock alert notification."""
        mock_manager = mocker.patch("websocket_manager.manager")
        mock_manager.broadcast_to_all = mocker.AsyncMock()
        
        await notify_low_stock(
            product_id=1,
            product_name="Test Product",
            current_stock=2,
            min_stock=10,
            branch_id=1
        )
        
        mock_manager.broadcast_to_all.assert_called_once()
        call_args = mock_manager.broadcast_to_all.call_args
        message = call_args[0][0]
        
        assert message["type"] == "low_stock_alert"
        assert message["product_id"] == 1
        assert message["product_name"] == "Test Product"
        assert message["current_stock"] == 2
        assert message["min_stock"] == 10
    
    @pytest.mark.asyncio
    async def test_notify_system_message(self, mocker):
        """Test system message notification."""
        mock_manager = mocker.patch("websocket_manager.manager")
        mock_manager.broadcast_to_all = mocker.AsyncMock()
        
        await notify_system_message("Test system message", "info")
        
        mock_manager.broadcast_to_all.assert_called_once()
        call_args = mock_manager.broadcast_to_all.call_args
        message = call_args[0][0]
        
        assert message["type"] == "system_message"
        assert message["message"] == "Test system message"
        assert message["message_type"] == "info"
    
    def test_websocket_status_endpoint(self, client: TestClient):
        """Test WebSocket status REST endpoint."""
        response = client.get("/ws/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "connected_branches" in data
        assert "total_connections" in data
        assert "branch_connections" in data
        assert isinstance(data["connected_branches"], list)
        assert isinstance(data["total_connections"], int)
        assert isinstance(data["branch_connections"], dict)


@pytest.mark.integration  
@pytest.mark.websocket
class TestWebSocketEndpoint:
    """Test WebSocket endpoint integration."""
    
    def test_websocket_endpoint_requires_token(self, client: TestClient):
        """Test that WebSocket endpoint requires authentication token."""
        # This would require a more complex WebSocket client test
        # For now, we'll test the endpoint structure
        pass
    
    def test_websocket_connection_flow(self):
        """Test the complete WebSocket connection flow."""
        # This would test:
        # 1. Connect with valid token
        # 2. Send subscription message
        # 3. Receive confirmation
        # 4. Receive notifications
        # 5. Handle ping/pong
        # 6. Disconnect gracefully
        pass