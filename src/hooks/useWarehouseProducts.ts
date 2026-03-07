import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { WareProductResponse, WareProductRequest } from '@/types/api';

export function useWarehouseProducts() {
  const [products, setProducts] = useState<WareProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await warehouseApi.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: WareProductRequest) => {
    try {
      const newProduct = await warehouseApi.createProduct(product);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  };

  const updateProduct = async (id: number, product: WareProductRequest) => {
    try {
      const updated = await warehouseApi.updateProduct(id, product);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await warehouseApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  return { products, loading, error, refetch: fetchProducts, createProduct, updateProduct, deleteProduct };
}
