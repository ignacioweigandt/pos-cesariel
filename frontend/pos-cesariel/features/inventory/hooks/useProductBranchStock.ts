import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface BranchSizeData {
  branch_id: number;
  branch_name: string;
  sizes: {
    [size: string]: {
      size: string;
      stock_quantity: number;
    };
  };
}

export interface MultiBranchSizeData {
  product_id: number;
  product_name: string;
  has_sizes: boolean;
  all_sizes: string[];
  size_totals: { [size: string]: number };
  total_stock: number;
  branches: BranchSizeData[];
}

/** Hook para stock multi-sucursal con desglose por talles de un producto específico */
export function useProductBranchStock(productId: number | null) {
  const [multiBranchData, setMultiBranchData] =
    useState<MultiBranchSizeData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadMultiBranchSizes = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    try {
      console.log(`🔍 Loading multi-branch data for product ${productId}...`);
      const response = await api.get(`/products/${productId}/sizes-by-branch`);
      console.log('📊 Multi-branch API response:', response.data);

      if (response.data?.branches) {
        console.log('🏢 Branch breakdown:');
        response.data.branches.forEach((branch: any) => {
          const branchTotal = Object.values(branch.sizes || {}).reduce(
            (sum: number, size: any) => sum + (size.stock_quantity || 0),
            0
          );
          console.log(`   ${branch.branch_name}: ${branchTotal} total stock`);
        });
      }

      setMultiBranchData(response.data);
    } catch (err: any) {
      console.error('Load multi-branch sizes error:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const reset = useCallback(() => {
    setMultiBranchData(null);
  }, []);

  return {
    multiBranchData,
    loading,
    loadMultiBranchSizes,
    reset,
  };
}
