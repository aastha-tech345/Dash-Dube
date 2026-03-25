import { useState, useEffect } from 'react';
import { fleetApi } from '@/services/fleetApi';
import type { DriverResponse, DriverRequest, VehicleResponse, VehicleRequest, RouteResponse, RouteRequest } from '@/types/api';

export function useDrivers(status?: string) {
  const [allDrivers, setAllDrivers] = useState<DriverResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch a large page to get all drivers for client-side filtering
      const data = await fleetApi.getDrivers({ page: 0, size: 100 });
      setAllDrivers(data.content ?? (data as unknown as DriverResponse[]));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Client-side filter + paginate
  const filtered = status ? allDrivers.filter(d => d.status === status) : allDrivers;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const drivers = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const createDriver = async (data: DriverRequest) => {
    const d = await fleetApi.createDriver(data);
    fetchAll();
    return d;
  };

  const updateDriver = async (id: number, data: DriverRequest) => {
    const d = await fleetApi.updateDriver(id, data);
    setAllDrivers(prev => prev.map(x => x.id === id ? d : x));
    return d;
  };

  const deleteDriver = async (id: number) => {
    await fleetApi.deleteDriver(id);
    fetchAll();
  };

  return { drivers, loading, error, page, setPage, totalPages, refetch: fetchAll, createDriver, updateDriver, deleteDriver };
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;

  const fetch = async (p = page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetApi.getVehicles({ page: p, size: PAGE_SIZE });
      setVehicles(data.content ?? (data as unknown as VehicleResponse[]));
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(page); }, [page]);

  const createVehicle = async (data: VehicleRequest) => {
    const v = await fleetApi.createVehicle(data);
    fetch(page);
    return v;
  };

  const updateVehicle = async (id: number, data: VehicleRequest) => {
    const v = await fleetApi.updateVehicle(id, data);
    setVehicles(prev => prev.map(x => x.id === id ? v : x));
    return v;
  };

  const deleteVehicle = async (id: number) => {
    await fleetApi.deleteVehicle(id);
    fetch(page);
  };

  return { vehicles, loading, error, page, setPage, totalPages, refetch: fetch, createVehicle, updateVehicle, deleteVehicle };
}

export function useRoutes() {
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetApi.getRoutes();
      setRoutes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const createRoute = async (data: RouteRequest) => {
    const r = await fleetApi.createRoute(data);
    setRoutes(prev => [r, ...prev]);
    return r;
  };

  const updateRoute = async (id: number, data: RouteRequest) => {
    const r = await fleetApi.updateRoute(id, data);
    setRoutes(prev => prev.map(x => x.id === id ? (r ?? { ...x }) : x));
    return r;
  };

  const deleteRoute = async (id: number) => {
    await fleetApi.deleteRoute(id);
    setRoutes(prev => prev.filter(x => x.id !== id));
  };

  return { routes, loading, error, refetch: fetch, createRoute, updateRoute, deleteRoute };
}
