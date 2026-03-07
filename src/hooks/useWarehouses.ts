import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { Warehouse, Zone } from '@/types/inventory';
import { warehouses as mockWarehouses, zones as mockZones } from '@/data/mockData';

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to use real API first, fallback to mock data if it fails
        try {
          const data = await warehouseApi.getWarehouses();
          // Convert WareHouseResponse to Warehouse format
          const convertedWarehouses: Warehouse[] = data.map(item => ({
            code: item.warehouseCode,
            name: item.warehouseName,
            type: item.warehouseType || 'Main Facility',
            address: item.address || 'Address not specified',
            capacity: item.capacity || 0,
            currentUtilization: item.currentUtilization || 0,
            status: item.isActive ? 'Active' : 'Inactive',
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
          }));
          setWarehouses(convertedWarehouses);
        } catch (apiError) {
          console.warn('API call failed, using mock data:', apiError);
          setWarehouses(mockWarehouses);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch warehouses');
      } finally {
        setLoading(false);
      }
    };

  return { warehouses, loading, error, refetch: fetchWarehouses };
}

export function useZones(warehouseCode?: string) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchZones();
  }, [warehouseCode]);

  const fetchZones = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to use real API first, fallback to mock data if it fails
        try {
          const data = await warehouseApi.getZones();
          // Convert ZoneResponse to Zone format
          const convertedZones: Zone[] = data.map(item => ({
            id: item.id.toString(),
            name: item.zoneName,
            warehouseCode: item.warehouse?.warehouseCode || '',
            type: item.zoneType as any,
            capacity: item.capacity || 0,
            currentUtilization: item.currentUtilization || 0,
            pickPriority: item.pickPriority || 1,
            putAwayPriority: item.putAwayPriority || 1,
            status: item.isActive ? 'Active' : 'Inactive',
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
          }));

          const filtered = warehouseCode 
            ? convertedZones.filter(z => z.warehouseCode === warehouseCode)
            : convertedZones;
          setZones(filtered);
        } catch (apiError) {
          console.warn('API call failed, using mock data:', apiError);
          const filtered = warehouseCode 
            ? mockZones.filter(z => z.warehouse === warehouseCode)
            : mockZones;
          setZones(filtered);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch zones');
      } finally {
        setLoading(false);
      }
    };

  return { zones, loading, error, refetch: fetchZones };
}
