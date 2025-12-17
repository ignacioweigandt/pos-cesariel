import { XMarkIcon } from '@heroicons/react/24/outline';
import { getOrderStatusColor } from '@/shared/utils/format/status';

interface Sale {
  id: number;
  sale_number: string;
  total_amount: number;
  order_status: string;
  sale_items: Array<{
    product: { name: string };
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

interface SimpleSaleDetailsModalProps {
  sale: Sale;
  onClose: () => void;
}

/**
 * Modal simple para mostrar detalles de venta
 */
export function SimpleSaleDetailsModal({
  sale,
  onClose,
}: SimpleSaleDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Detalles de Venta #{sale.sale_number}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Sale Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Total</label>
              <p className="text-lg font-semibold text-gray-900">
                ${parseFloat(sale.total_amount.toString()).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Estado</label>
              <p
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                  sale.order_status
                )}`}
              >
                {sale.order_status}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Productos</h4>
            <div className="space-y-2">
              {sale.sale_items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Cantidad: {item.quantity} × $
                      {parseFloat(item.unit_price.toString()).toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${parseFloat(item.total_price.toString()).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
