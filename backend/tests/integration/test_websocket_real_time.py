import pytest
import json
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock

from main import app
from websocket_manager import ConnectionManager


@pytest.mark.websocket
class TestWebSocketRealTime:
    """Test WebSocket real-time functionality with actual endpoint."""

    def _get_token(self, user):
        """Helper to create a JWT token for WebSocket connection."""
        from auth import create_access_token
        return create_access_token(
            data={"sub": user.username, "role": user.role.value if hasattr(user.role, 'value') else str(user.role)}
        )

    def test_websocket_connection_with_auth(self, client, test_admin_user):
        """Test WebSocket connection with valid authentication."""
        token = self._get_token(test_admin_user)

        with client.websocket_connect(f"/ws/{test_admin_user.branch_id}?token={token}") as websocket:
            data = websocket.receive_json()
            assert data["type"] == "connection_established"
            assert data["username"] == test_admin_user.username
            assert data["branch_id"] == test_admin_user.branch_id

    def test_websocket_connection_without_token(self, client):
        """Test WebSocket connection without token sends error and closes."""
        with client.websocket_connect("/ws/1") as websocket:
            data = websocket.receive_json()
            assert data["type"] == "error"
            assert data["code"] == 4001

    def test_websocket_connection_with_invalid_token(self, client):
        """Test WebSocket connection with invalid token sends error and closes."""
        with client.websocket_connect("/ws/1?token=invalid_token") as websocket:
            data = websocket.receive_json()
            assert data["type"] == "error"
            assert data["code"] == 4003

    def test_websocket_ping_pong(self, client, test_admin_user):
        """Test WebSocket ping/pong mechanism."""
        token = self._get_token(test_admin_user)

        with client.websocket_connect(f"/ws/{test_admin_user.branch_id}?token={token}") as websocket:
            # Receive welcome message
            websocket.receive_json()

            # Send ping
            websocket.send_json({"type": "ping", "timestamp": "2024-01-01T00:00:00Z"})

            # Should receive pong
            response = websocket.receive_json()
            assert response["type"] == "pong"
            assert response["timestamp"] == "2024-01-01T00:00:00Z"

    def test_websocket_subscribe(self, client, test_admin_user):
        """Test WebSocket subscription confirmation."""
        token = self._get_token(test_admin_user)

        with client.websocket_connect(f"/ws/{test_admin_user.branch_id}?token={token}") as websocket:
            websocket.receive_json()

            # Send subscription
            websocket.send_json({
                "type": "subscribe",
                "subscription_types": ["new_sale", "inventory_change"]
            })

            response = websocket.receive_json()
            assert response["type"] == "subscription_confirmed"
            assert "new_sale" in response["subscription_types"]
            assert "inventory_change" in response["subscription_types"]

    def test_websocket_request_status(self, client, test_admin_user):
        """Test WebSocket status request."""
        token = self._get_token(test_admin_user)

        with client.websocket_connect(f"/ws/{test_admin_user.branch_id}?token={token}") as websocket:
            websocket.receive_json()

            websocket.send_json({"type": "request_status"})

            response = websocket.receive_json()
            assert response["type"] == "system_status"
            assert "connected_branches" in response
            assert "total_connections" in response
            assert "branch_connections" in response

    def test_websocket_broadcast_test_admin_only(self, client, test_seller_user):
        """Test that broadcast_test is restricted to ADMIN role."""
        token = self._get_token(test_seller_user)

        with client.websocket_connect(f"/ws/{test_seller_user.branch_id}?token={token}") as websocket:
            websocket.receive_json()

            websocket.send_json({"type": "broadcast_test", "scope": "all"})

            response = websocket.receive_json()
            assert response["type"] == "error"
            assert "ADMIN" in response["message"]

    def test_websocket_broadcast_test_admin_allowed(self, client, test_admin_user):
        """Test that ADMIN can use broadcast_test."""
        token = self._get_token(test_admin_user)

        with client.websocket_connect(f"/ws/{test_admin_user.branch_id}?token={token}") as websocket:
            websocket.receive_json()

            websocket.send_json({"type": "broadcast_test", "scope": "branch"})

            response = websocket.receive_json()
            assert response["type"] == "test_message"
            assert response["from_branch"] == test_admin_user.branch_id

    def test_websocket_unknown_message_type(self, client, test_admin_user):
        """Test that unknown message types return error."""
        token = self._get_token(test_admin_user)

        with client.websocket_connect(f"/ws/{test_admin_user.branch_id}?token={token}") as websocket:
            websocket.receive_json()

            websocket.send_json({"type": "unknown_type"})

            response = websocket.receive_json()
            assert response["type"] == "error"
            assert "unknown_type" in response["message"]

    def test_websocket_status_rest_endpoint(self, client):
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


@pytest.mark.websocket
class TestWebSocketManager:
    """Test ConnectionManager in isolation."""

    @pytest.fixture
    def ws_manager(self):
        """Fresh ConnectionManager for each test."""
        return ConnectionManager()

    @pytest.fixture
    def mock_ws(self):
        """Mock WebSocket."""
        ws = AsyncMock()
        ws.send_text = AsyncMock()
        return ws

    def test_initialization(self, ws_manager):
        assert ws_manager.get_connection_count() == 0
        assert ws_manager.get_connected_branches() == []

    @pytest.mark.asyncio
    async def test_register_and_disconnect(self, ws_manager, mock_ws):
        await ws_manager.register_connection(mock_ws, 1, "testuser", "ADMIN")

        assert ws_manager.get_connection_count() == 1
        assert ws_manager.get_branch_connection_count(1) == 1
        assert ws_manager.get_role(mock_ws) == "ADMIN"

        ws_manager.disconnect(mock_ws)

        assert ws_manager.get_connection_count() == 0
        assert ws_manager.get_branch_connection_count(1) == 0

    @pytest.mark.asyncio
    async def test_broadcast_to_branch(self, ws_manager, mock_ws):
        await ws_manager.register_connection(mock_ws, 1, "user1")

        message = {"type": "new_sale", "sale_id": 1}
        await ws_manager.broadcast_to_branch(message, 1)

        mock_ws.send_text.assert_called_once_with(json.dumps(message))

    @pytest.mark.asyncio
    async def test_broadcast_to_all(self, ws_manager):
        ws1 = AsyncMock()
        ws2 = AsyncMock()

        await ws_manager.register_connection(ws1, 1, "user1")
        await ws_manager.register_connection(ws2, 2, "user2")

        message = {"type": "system_message", "message": "hello"}
        await ws_manager.broadcast_to_all(message)

        ws1.send_text.assert_called_once()
        ws2.send_text.assert_called_once()

    @pytest.mark.asyncio
    async def test_broadcast_to_other_branches(self, ws_manager):
        ws1 = AsyncMock()
        ws2 = AsyncMock()
        ws3 = AsyncMock()

        await ws_manager.register_connection(ws1, 1, "user1")
        await ws_manager.register_connection(ws2, 2, "user2")
        await ws_manager.register_connection(ws3, 3, "user3")

        message = {"type": "inventory_change", "product_id": 1}
        await ws_manager.broadcast_to_other_branches(message, 2)

        # Branch 1 and 3 should receive, branch 2 excluded
        ws1.send_text.assert_called_once()
        ws2.send_text.assert_not_called()
        ws3.send_text.assert_called_once()

    @pytest.mark.asyncio
    async def test_subscription_filtering(self, ws_manager):
        ws1 = AsyncMock()
        ws2 = AsyncMock()

        await ws_manager.register_connection(ws1, 1, "user1")
        await ws_manager.register_connection(ws2, 1, "user2")

        # ws1 subscribes only to new_sale
        ws_manager.set_subscriptions(ws1, ["new_sale"])
        # ws2 has no subscriptions (receives everything)

        sale_msg = {"type": "new_sale", "sale_id": 1}
        await ws_manager.broadcast_to_branch(sale_msg, 1)

        ws1.send_text.assert_called_once()
        ws2.send_text.assert_called_once()

        ws1.send_text.reset_mock()
        ws2.send_text.reset_mock()

        # Now send inventory_change - ws1 should NOT receive
        inv_msg = {"type": "inventory_change", "product_id": 1}
        await ws_manager.broadcast_to_branch(inv_msg, 1)

        ws1.send_text.assert_not_called()
        ws2.send_text.assert_called_once()

    def test_rate_limiting(self, ws_manager):
        ws = AsyncMock()
        ws_manager._rate_limits[ws] = []

        # Send up to limit
        for _ in range(ws_manager.RATE_LIMIT_MAX_MESSAGES):
            assert ws_manager.check_rate_limit(ws) is True

        # Next one should be rate limited
        assert ws_manager.check_rate_limit(ws) is False

    @pytest.mark.asyncio
    async def test_silent_disconnect_on_send_error(self, ws_manager):
        ws = AsyncMock()
        ws.send_text.side_effect = Exception("Connection closed")

        await ws_manager.register_connection(ws, 1, "user1")
        assert ws_manager.get_connection_count() == 1

        await ws_manager.broadcast_to_branch({"type": "test"}, 1)

        # Should be silently disconnected
        assert ws_manager.get_connection_count() == 0


@pytest.mark.websocket
class TestNotificationFunctions:
    """Test notification utility functions."""

    @pytest.mark.asyncio
    async def test_notify_inventory_change(self, mocker):
        from websocket_manager import notify_inventory_change
        mock_mgr = mocker.patch("websocket_manager.manager")
        mock_mgr.broadcast_to_other_branches = AsyncMock()

        await notify_inventory_change(1, 100, 95, 1, "Test User")

        mock_mgr.broadcast_to_other_branches.assert_called_once()
        msg = mock_mgr.broadcast_to_other_branches.call_args[0][0]
        assert msg["type"] == "inventory_change"
        assert msg["product_id"] == 1
        assert msg["old_stock"] == 100
        assert msg["new_stock"] == 95

    @pytest.mark.asyncio
    async def test_notify_new_sale(self, mocker):
        from websocket_manager import notify_new_sale
        mock_mgr = mocker.patch("websocket_manager.manager")
        mock_mgr.broadcast_to_all = AsyncMock()

        await notify_new_sale(1, 25.99, 1, "Test User")

        mock_mgr.broadcast_to_all.assert_called_once()
        msg = mock_mgr.broadcast_to_all.call_args[0][0]
        assert msg["type"] == "new_sale"
        assert msg["sale_id"] == 1
        assert msg["total_amount"] == 25.99

    @pytest.mark.asyncio
    async def test_notify_low_stock(self, mocker):
        from websocket_manager import notify_low_stock
        mock_mgr = mocker.patch("websocket_manager.manager")
        mock_mgr.broadcast_to_all = AsyncMock()

        await notify_low_stock(1, "Test Product", 2, 10, 1)

        mock_mgr.broadcast_to_all.assert_called_once()
        msg = mock_mgr.broadcast_to_all.call_args[0][0]
        assert msg["type"] == "low_stock_alert"
        assert msg["product_name"] == "Test Product"
        assert msg["current_stock"] == 2

    @pytest.mark.asyncio
    async def test_notify_system_message(self, mocker):
        from websocket_manager import notify_system_message
        mock_mgr = mocker.patch("websocket_manager.manager")
        mock_mgr.broadcast_to_all = AsyncMock()

        await notify_system_message("Test message", "info")

        mock_mgr.broadcast_to_all.assert_called_once()
        msg = mock_mgr.broadcast_to_all.call_args[0][0]
        assert msg["type"] == "system_message"
        assert msg["message"] == "Test message"
        assert msg["message_type"] == "info"

    @pytest.mark.asyncio
    async def test_notify_product_update(self, mocker):
        from websocket_manager import notify_product_update
        mock_mgr = mocker.patch("websocket_manager.manager")
        mock_mgr.broadcast_to_all = AsyncMock()

        await notify_product_update(1, "Producto X", "updated", "Admin", 1)

        mock_mgr.broadcast_to_all.assert_called_once()
        msg = mock_mgr.broadcast_to_all.call_args[0][0]
        assert msg["type"] == "product_update"
        assert msg["product_name"] == "Producto X"
        assert msg["action"] == "updated"

    @pytest.mark.asyncio
    async def test_notify_sale_status_change(self, mocker):
        from websocket_manager import notify_sale_status_change
        mock_mgr = mocker.patch("websocket_manager.manager")
        mock_mgr.broadcast_to_all = AsyncMock()

        await notify_sale_status_change(1, "SALE-001", "PENDING", "COMPLETED", 1)

        mock_mgr.broadcast_to_all.assert_called_once()
        msg = mock_mgr.broadcast_to_all.call_args[0][0]
        assert msg["type"] == "sale_status_change"
        assert msg["sale_number"] == "SALE-001"
        assert msg["new_status"] == "COMPLETED"

    @pytest.mark.asyncio
    async def test_notify_dashboard_update(self, mocker):
        from websocket_manager import notify_dashboard_update
        mock_mgr = mocker.patch("websocket_manager.manager")
        mock_mgr.broadcast_to_all = AsyncMock()

        await notify_dashboard_update(1, "sales_today", {"total": 500})

        mock_mgr.broadcast_to_all.assert_called_once()
        msg = mock_mgr.broadcast_to_all.call_args[0][0]
        assert msg["type"] == "dashboard_update"
        assert msg["update_type"] == "sales_today"
        assert msg["data"]["total"] == 500
