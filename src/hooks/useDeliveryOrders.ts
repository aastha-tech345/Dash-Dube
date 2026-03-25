import { useState, useEffect } from 'react';
import { salesApi } from '@/services/salesApi';
import type { DeliveryOrderResponse, DeliveryOrderRequest, DeliveryOrderStatus, PODRequest } from '@/types/api';

export function useDeliveryOrders() {
  const [orders, setOrders] = useState<DeliveryOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;

  const fetch = async (p = page, search?: string, fromDate?: string, toDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await salesApi.getDeliveryOrders({ page: p, size: PAGE_SIZE, search, fromDate, toDate });
      setOrders(data.content ?? (data as unknown as DeliveryOrderResponse[]));
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch delivery orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data: DeliveryOrderRequest, attachments?: File[]) => {
    const o = await salesApi.createDeliveryOrder(data, attachments);
    fetch(page);
    return o;
  };

  const updateStatus = async (id: number, status: DeliveryOrderStatus) => {
    const o = await salesApi.updateStatus(id, status);
    setOrders(prev => prev.map(x => x.id === id ? o : x));
    return o;
  };

  const assignFleet = async (id: number, driverId: number, vehicleId: number) => {
    const o = await salesApi.assignFleet(id, driverId, vehicleId);
    setOrders(prev => prev.map(x => x.id === id ? o : x));
    return o;
  };

  const startPicking = async (id: number) => {
    const o = await salesApi.startPicking(id);
    setOrders(prev => prev.map(x => x.id === id ? o : x));
    return o;
  };

  const confirmPacked = async (id: number) => {
    const o = await salesApi.confirmPacked(id);
    setOrders(prev => prev.map(x => x.id === id ? o : x));
    return o;
  };

  const dispatch = async (id: number) => {
    const o = await salesApi.dispatch(id);
    setOrders(prev => prev.map(x => x.id === id ? o : x));
    return o;
  };

  const markDelivered = async (id: number) => {
    const o = await salesApi.markDelivered(id);
    setOrders(prev => prev.map(x => x.id === id ? o : x));
    return o;
  };

  const submitPOD = async (doId: number, data: PODRequest, signature?: File, photo?: File) => {
    return salesApi.submitPOD(doId, data, signature, photo);
  };

  const deleteOrder = async (id: number) => {
    await salesApi.deleteDeliveryOrder(id);
    fetch(page);
  };

  return {
    orders, loading, error, page, setPage, totalPages, refetch: fetch,
    createOrder, updateStatus, assignFleet,
    startPicking, confirmPacked, dispatch, markDelivered,
    submitPOD, deleteOrder,
  };
}
