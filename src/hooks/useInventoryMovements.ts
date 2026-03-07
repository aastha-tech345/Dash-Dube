import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { InventoryMovementResponse, InventoryMovementRequest } from '@/types/api';

export function useInventoryMovements(warehouseId?: number) {
  const [movements, setMovements] = useState<InventoryMovementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovements();
  }, [warehouseId]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = warehouseId
        ? await warehouseApi.getInventoryMovementsByWarehouse(warehouseId)
        : await warehouseApi.getInventoryMovements();
      setMovements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movements');
    } finally {
      setLoading(false);
    }
  };

  const createMovement = async (movement: InventoryMovementRequest) => {
    try {
      const newMovement = await warehouseApi.createInventoryMovement(movement);
      setMovements(prev => [newMovement, ...prev]);
      return newMovement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create movement');
      throw err;
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      const updated = await warehouseApi.updateInventoryMovementQuantity(id, quantity);
      setMovements(prev => prev.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
      throw err;
    }
  };

  const deleteMovement = async (id: number) => {
    try {
      await warehouseApi.deleteInventoryMovement(id);
      setMovements(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete movement');
      throw err;
    }
  };

  return { movements, loading, error, refetch: fetchMovements, createMovement, updateQuantity, deleteMovement };
}
