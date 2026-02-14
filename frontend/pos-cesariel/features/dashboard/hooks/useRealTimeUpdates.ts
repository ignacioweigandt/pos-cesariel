/** Hook para actualizaciones en tiempo real vía WebSocket (new_sale, inventory_change, etc.) */

import { useEffect } from "react";
import { useWebSocketContext } from "@/shared/contexts/WebSocketContext";

interface UseRealTimeUpdatesProps {
  enabled: boolean;
  onUpdate: () => void;
}

export function useRealTimeUpdates({
  enabled,
  onUpdate,
}: UseRealTimeUpdatesProps) {
  const { lastMessage } = useWebSocketContext();

  useEffect(() => {
    if (!lastMessage || !enabled) return;

    const relevantEvents = [
      "new_sale",
      "inventory_change",
      "low_stock_alert",
      "dashboard_update",
    ];

    if (relevantEvents.includes(lastMessage.type)) {
      onUpdate();
    }
  }, [lastMessage, enabled, onUpdate]);

  return { lastMessage };
}
