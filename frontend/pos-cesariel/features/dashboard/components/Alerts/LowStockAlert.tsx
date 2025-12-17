import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface LowStockAlertProps {
  lowStockCount: number;
}

export function LowStockAlert({ lowStockCount }: LowStockAlertProps) {
  if (lowStockCount === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Atención:</strong> Hay {lowStockCount} productos con stock
            bajo.{" "}
            <a
              href="/inventory"
              className="font-medium underline text-yellow-700 hover:text-yellow-600"
            >
              Ver inventario
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
