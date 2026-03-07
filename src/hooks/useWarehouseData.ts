import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { 
  WareHouseResponse, 
  FloorResponse, 
  ZoneResponse, 
  RackResponse, 
  ShelfResponse, 
  BinResponse 
} from '@/types/api';

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState<WareHouseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await warehouseApi.getWarehouses();
      console.log('Warehouses fetched from API:', data);
      setWarehouses(data);
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouses');
      setWarehouses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  return { warehouses, loading, error, refetch: fetchWarehouses };
}

export function useFloors(warehouseId?: number) {
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFloors();
  }, [warehouseId]);

  const fetchFloors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: FloorResponse[] = [];
      if (warehouseId) {
        data = await warehouseApi.getFloorsByWarehouse(warehouseId);
      } else {
        data = await warehouseApi.getFloors();
      }
      
      console.log('Floors fetched from API:', data);
      setFloors(data);
    } catch (err) {
      console.error('Failed to fetch floors:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch floors');
      setFloors([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  return { floors, loading, error, refetch: fetchFloors };
}

export function useZones() {
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await warehouseApi.getZones();
      console.log('Zones fetched from API:', data);
      setZones(data);
    } catch (err) {
      console.error('Failed to fetch zones:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch zones');
      setZones([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  return { zones, loading, error, refetch: fetchZones };
}

export function useRacks() {
  const [racks, setRacks] = useState<RackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRacks();
  }, []);

  const fetchRacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await warehouseApi.getRacks();
      console.log('Racks fetched from API:', data);
      setRacks(data);
    } catch (err) {
      console.error('Failed to fetch racks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch racks');
      setRacks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  return { racks, loading, error, refetch: fetchRacks };
}

export function useShelves() {
  const [shelves, setShelves] = useState<ShelfResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShelves();
  }, []);

  const fetchShelves = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await warehouseApi.getShelves();
      console.log('Shelves fetched from API:', data);
      setShelves(data);
    } catch (err) {
      console.error('Failed to fetch shelves:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shelves');
      setShelves([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  return { shelves, loading, error, refetch: fetchShelves };
}

export function useBins() {
  const [bins, setBins] = useState<BinResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await warehouseApi.getBins();
      console.log('Bins fetched from API:', data);
      setBins(data);
    } catch (err) {
      console.error('Failed to fetch bins:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bins');
      setBins([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  return { bins, loading, error, refetch: fetchBins };
}
