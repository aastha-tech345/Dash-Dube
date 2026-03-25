import { useState, useEffect } from 'react';
import { productionApi } from '@/services/productionApi';
import type {
  RawMaterialResponse, RawMaterialRequest,
  SemiFinishedResponse, SemiFinishedRequest,
  FinishedGoodResponse, FinishedGoodRequest,
} from '@/types/api';

const PAGE_SIZE = 10;

export function useRawMaterials() {
  const [items, setItems] = useState<RawMaterialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetch = async (p = page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productionApi.getRawMaterials({ page: p, size: PAGE_SIZE });
      setItems(data.content ?? (data as unknown as RawMaterialResponse[]));
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch raw materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(page); }, [page]);

  const create = async (data: RawMaterialRequest, image?: File) => {
    const r = await productionApi.createRawMaterial(data, image);
    fetch(page);
    return r;
  };

  const update = async (id: number, data: Partial<RawMaterialRequest>, image?: File) => {
    const r = await productionApi.updateRawMaterial(id, data, image);
    // re-fetch list to get server's actual saved values
    fetch(page);
    return r;
  };

  const remove = async (id: number) => {
    await productionApi.deleteRawMaterial(id);
    fetch(page);
  };

  const updateStock = async (id: number, quantity: number) => {
    const r = await productionApi.updateRawMaterialStock(id, quantity);
    setItems(prev => prev.map(x => x.id === id ? r : x));
    return r;
  };

  return { items, loading, error, page, setPage, totalPages, refetch: fetch, create, update, remove, updateStock };
}

export function useSemiFinished() {
  const [items, setItems] = useState<SemiFinishedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetch = async (p = page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productionApi.getSemiFinished({ page: p, size: PAGE_SIZE });
      setItems(data.content ?? (data as unknown as SemiFinishedResponse[]));
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch semi-finished goods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(page); }, [page]);

  const create = async (data: SemiFinishedRequest, image?: File) => {
    const r = await productionApi.createSemiFinished(data, image);
    fetch(page);
    return r;
  };

  const update = async (id: number, data: Partial<SemiFinishedRequest>, image?: File) => {
    const r = await productionApi.updateSemiFinished(id, data, image);
    fetch(page);
    return r;
  };

  const remove = async (id: number) => {
    await productionApi.deleteSemiFinished(id);
    fetch(page);
  };

  return { items, loading, error, page, setPage, totalPages, refetch: fetch, create, update, remove };
}

export function useFinishedGoods() {
  const [items, setItems] = useState<FinishedGoodResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetch = async (p = page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productionApi.getFinishedGoods({ page: p, size: PAGE_SIZE });
      setItems(data.content ?? (data as unknown as FinishedGoodResponse[]));
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch finished goods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(page); }, [page]);

  const create = async (data: FinishedGoodRequest, image?: File) => {
    const r = await productionApi.createFinishedGood(data, image);
    fetch(page);
    return r;
  };

  const update = async (id: number, data: Partial<FinishedGoodRequest>, image?: File) => {
    const r = await productionApi.updateFinishedGood(id, data, image);
    fetch(page);
    return r;
  };

  const remove = async (id: number) => {
    await productionApi.deleteFinishedGood(id);
    fetch(page);
  };

  return { items, loading, error, page, setPage, totalPages, refetch: fetch, create, update, remove };
}
