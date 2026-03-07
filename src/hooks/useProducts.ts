import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { Product } from '@/types/inventory';
import { inventoryProducts } from '@/data/mockData';

export function useProducts(search?: string, category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to use real API first, fallback to mock data if it fails
      try {
        const data = await warehouseApi.getProducts();
        // Convert WareProductResponse to Product format
        const convertedProducts: Product[] = data.map(item => ({
          id: item.id.toString(),
          name: item.productName,
          sku: item.productCode,
          category: item.category?.categoryName || 'Uncategorized',
          subcategory: item.subCategory?.subCategoryName || '',
          purchasePrice: item.purchasePrice || 0,
          salePrice: item.salePrice || 0,
          currentStock: item.currentStock || 0,
          minStockLevel: item.minStockLevel || 0,
          maxStockLevel: item.maxStockLevel || 1000,
          status: item.isActive ? 'Active' : 'Inactive',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));

        // Apply filters
        let filtered = convertedProducts;
        if (search) {
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (category) {
          filtered = filtered.filter(p => p.category === category);
        }

        setProducts(filtered);
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);

        // Fallback to mock data
        let filtered = inventoryProducts;
        if (search) {
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (category) {
          filtered = filtered.filter(p => p.category === category);
        }

        setProducts(filtered);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (id: string, status: 'Active' | 'Inactive') => {
    try {
      // Try to update via API
      const numericId = parseInt(id.replace('#PRO-', ''));
      if (!isNaN(numericId)) {
        await warehouseApi.updateProduct(numericId, { isActive: status === 'Active' });
      }
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  return { products, loading, error, refetch: fetchProducts, updateProductStatus };
}
