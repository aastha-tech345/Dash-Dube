import { useState } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { 
  WareHouseRequest, 
  WareHouseResponse,
  ZoneRequest,
  ZoneResponse,
  RackRequest,
  RackResponse,
  ShelfRequest,
  ShelfResponse,
  BinRequest,
  BinResponse,
  FloorRequest,
  FloorResponse
} from '@/types/api';

// Warehouse CRUD operations
export function useWarehouseCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWarehouse = async (data: WareHouseRequest): Promise<WareHouseResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.createWarehouse(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create warehouse';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWarehouse = async (id: number, data: WareHouseRequest): Promise<WareHouseResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.updateWarehouse(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update warehouse';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWarehouse = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await warehouseApi.deleteWarehouse(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete warehouse';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    loading,
    error,
  };
}

// Floor CRUD operations
export function useFloorCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFloor = async (data: FloorRequest): Promise<FloorResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.createFloor(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create floor';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFloor = async (id: number, data: FloorRequest): Promise<FloorResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.updateFloor(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update floor';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFloor = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await warehouseApi.deleteFloor(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete floor';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createFloor,
    updateFloor,
    deleteFloor,
    loading,
    error,
  };
}

// Zone CRUD operations
export function useZoneCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createZone = async (data: ZoneRequest): Promise<ZoneResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.createZone(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create zone';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateZone = async (id: number, data: ZoneRequest): Promise<ZoneResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.updateZone(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update zone';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteZone = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await warehouseApi.deleteZone(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete zone';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createZone,
    updateZone,
    deleteZone,
    loading,
    error,
  };
}

// Rack CRUD operations
export function useRackCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRack = async (data: RackRequest): Promise<RackResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.createRack(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create rack';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRack = async (id: number, data: RackRequest): Promise<RackResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.updateRack(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update rack';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRack = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await warehouseApi.deleteRack(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete rack';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createRack,
    updateRack,
    deleteRack,
    loading,
    error,
  };
}

// Shelf CRUD operations
export function useShelfCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShelf = async (data: ShelfRequest): Promise<ShelfResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.createShelf(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create shelf';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateShelf = async (id: number, data: ShelfRequest): Promise<ShelfResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.updateShelf(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update shelf';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteShelf = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await warehouseApi.deleteShelf(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete shelf';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createShelf,
    updateShelf,
    deleteShelf,
    loading,
    error,
  };
}

// Bin CRUD operations
export function useBinCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBin = async (data: BinRequest): Promise<BinResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.createBin(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bin';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBin = async (id: number, data: BinRequest): Promise<BinResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await warehouseApi.updateBin(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bin';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBin = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await warehouseApi.deleteBin(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bin';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBin,
    updateBin,
    deleteBin,
    loading,
    error,
  };
}