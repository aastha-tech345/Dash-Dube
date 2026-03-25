import { useState, useEffect } from 'react';
import { crmApi } from '@/services/crmApi';
import type { CrmSalesProductResponse, CrmSalesProductRequest } from '@/types/api';

export function useCrmProducts() {
  const [products, setProducts] = useState<CrmSalesProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;

  const fetch = async (p = page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await crmApi.getSalesProducts({ page: p, size: PAGE_SIZE });
      setProducts(data.content ?? (data as unknown as CrmSalesProductResponse[]));
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch CRM products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(page); }, [page]);

  const createProduct = async (data: CrmSalesProductRequest, image?: File) => {
    const p = await crmApi.createSalesProduct(data, image);
    fetch(page);
    return p;
  };

  const updateProduct = async (id: number, data: CrmSalesProductRequest, image?: File) => {
    const p = await crmApi.updateSalesProduct(id, data, image);
    fetch(page);
    return p;
  };

  const deleteProduct = async (id: number) => {
    await crmApi.deleteSalesProduct(id);
    fetch(page);
  };

  return { products, loading, error, page, setPage, totalPages, refetch: fetch, createProduct, updateProduct, deleteProduct };
}
