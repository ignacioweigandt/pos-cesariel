import { useEffect } from "react";
import { usePOSWebSocket } from "@/lib/websocket";

interface UseRealTimeUpdatesProps {
  branchId: number;
  token: string;
  enabled: boolean;
  onUpdate: () => void;
}

export function useRealTimeUpdates({
  branchId,
  token,
  enabled,
  onUpdate,
}: UseRealTimeUpdatesProps) {
  const { lastMessage } = usePOSWebSocket(branchId, token, enabled);

  useEffect(() => {
    if (!lastMessage || !enabled) return;

    // Trigger refresh when relevant events occur
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
