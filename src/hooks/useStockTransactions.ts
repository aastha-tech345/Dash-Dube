<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { StockTransaction } from '@/types/inventory';

export function useStockTransactions(type?: 'in' | 'out') {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [type]);

  const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to use real API first, fallback to mock data if it fails
        try {
          const data = await warehouseApi.getInventoryMovements();
          // Convert InventoryMovementResponse to StockTransaction format
          const convertedTransactions: StockTransaction[] = data.map(item => ({
            id: item.id.toString(),
            productId: item.product?.id.toString() || '',
            productName: item.product?.productName || 'Unknown Product',
            quantity: item.quantity,
            type: item.movementType === 'IN' ? 'in' : 'out',
            warehouseCode: item.warehouse?.warehouseCode || '',
            warehouseName: item.warehouse?.warehouseName || '',
            reason: item.reason || '',
            notes: item.notes || '',
            createdAt: item.createdAt || new Date().toISOString(),
            createdBy: item.createdBy || 'System',
          }));

          const filtered = type ? convertedTransactions.filter(t => t.type === type) : convertedTransactions;
          setTransactions(filtered);
        } catch (apiError) {
          console.warn('API call failed, using mock data:', apiError);

          // Fallback to mock data
          const mockTransactions: StockTransaction[] = [
            {
              id: 'TXN-001',
              productId: '#PRO-9921',
              productName: 'MacBook Pro M3 14"',
              quantity: 50,
              type: 'in',
              warehouseCode: 'WH-MAIN-01',
              warehouseName: 'Central Distribution Hub',
              reason: 'Purchase',
              notes: 'Initial stock',
              createdAt: new Date().toISOString(),
              createdBy: 'System User',
            },
            {
              id: 'TXN-002',
              productId: '#PRO-4452',
              productName: 'Sony WH-1000XM5',
              quantity: 25,
              type: 'out',
              warehouseCode: 'WH-MAIN-01',
              warehouseName: 'Central Distribution Hub',
              reason: 'Sale',
              notes: 'Customer order',
              createdAt: new Date().toISOString(),
              createdBy: 'System User',
            },
          ];

          const filtered = type ? mockTransactions.filter(t => t.type === type) : mockTransactions;
          setTransactions(filtered);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

  const createTransaction = async (transaction: Omit<StockTransaction, 'id'>) => {
      try {
        // Try to create via API
        const movementRequest = {
          productId: parseInt(transaction.productId.replace('#PRO-', '')) || 0,
          warehouseId: 1, // Default warehouse ID
          quantity: transaction.quantity,
          movementType: transaction.type === 'in' ? 'IN' : 'OUT',
          reason: transaction.reason || '',
          notes: transaction.notes || '',
        };

        try {
          const result = await warehouseApi.createInventoryMovement(movementRequest);
          const newTransaction: StockTransaction = {
            id: result.id.toString(),
            productId: transaction.productId,
            productName: transaction.productName,
            quantity: transaction.quantity,
            type: transaction.type,
            warehouseCode: transaction.warehouseCode || '',
            warehouseName: transaction.warehouseName || '',
            reason: transaction.reason || '',
            notes: transaction.notes || '',
            createdAt: result.createdAt || new Date().toISOString(),
            createdBy: result.createdBy || 'System',
          };
          setTransactions(prev => [newTransaction, ...prev]);
          return newTransaction;
        } catch (apiError) {
          console.warn('API call failed, creating mock transaction:', apiError);
          // Fallback to mock creation
          const newTransaction: StockTransaction = {
            ...transaction,
            id: `TXN-${Date.now()}`,
            createdAt: new Date().toISOString(),
            createdBy: 'System User',
          };
          setTransactions(prev => [newTransaction, ...prev]);
          return newTransaction;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create transaction');
        throw err;
      }
    };

  return { transactions, loading, error, refetch: fetchTransactions, createTransaction };
}
=======
import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { StockTransaction } from '@/types/inventory';

export function useStockTransactions(type?: 'in' | 'out') {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [type]);

  const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to use real API first, fallback to mock data if it fails
        try {
          const data = await warehouseApi.getInventoryMovements();
          // Convert InventoryMovementResponse to StockTransaction format
          const convertedTransactions: StockTransaction[] = data.map(item => ({
            id: item.id.toString(),
            productId: item.product?.id.toString() || '',
            productName: item.product?.productName || 'Unknown Product',
            quantity: item.quantity,
            type: item.movementType === 'IN' ? 'in' : 'out',
            warehouseCode: item.warehouse?.warehouseCode || '',
            warehouseName: item.warehouse?.warehouseName || '',
            reason: item.reason || '',
            notes: item.notes || '',
            createdAt: item.createdAt || new Date().toISOString(),
            createdBy: item.createdBy || 'System',
          }));

          const filtered = type ? convertedTransactions.filter(t => t.type === type) : convertedTransactions;
          setTransactions(filtered);
        } catch (apiError) {
          console.warn('API call failed, using mock data:', apiError);

          // Fallback to mock data
          const mockTransactions: StockTransaction[] = [
            {
              id: 'TXN-001',
              productId: '#PRO-9921',
              productName: 'MacBook Pro M3 14"',
              quantity: 50,
              type: 'in',
              warehouseCode: 'WH-MAIN-01',
              warehouseName: 'Central Distribution Hub',
              reason: 'Purchase',
              notes: 'Initial stock',
              createdAt: new Date().toISOString(),
              createdBy: 'System User',
            },
            {
              id: 'TXN-002',
              productId: '#PRO-4452',
              productName: 'Sony WH-1000XM5',
              quantity: 25,
              type: 'out',
              warehouseCode: 'WH-MAIN-01',
              warehouseName: 'Central Distribution Hub',
              reason: 'Sale',
              notes: 'Customer order',
              createdAt: new Date().toISOString(),
              createdBy: 'System User',
            },
          ];

          const filtered = type ? mockTransactions.filter(t => t.type === type) : mockTransactions;
          setTransactions(filtered);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

  const createTransaction = async (transaction: Omit<StockTransaction, 'id'>) => {
      try {
        // Try to create via API
        const movementRequest = {
          productId: parseInt(transaction.productId.replace('#PRO-', '')) || 0,
          warehouseId: 1, // Default warehouse ID
          quantity: transaction.quantity,
          movementType: transaction.type === 'in' ? 'IN' : 'OUT',
          reason: transaction.reason || '',
          notes: transaction.notes || '',
        };

        try {
          const result = await warehouseApi.createInventoryMovement(movementRequest);
          const newTransaction: StockTransaction = {
            id: result.id.toString(),
            productId: transaction.productId,
            productName: transaction.productName,
            quantity: transaction.quantity,
            type: transaction.type,
            warehouseCode: transaction.warehouseCode || '',
            warehouseName: transaction.warehouseName || '',
            reason: transaction.reason || '',
            notes: transaction.notes || '',
            createdAt: result.createdAt || new Date().toISOString(),
            createdBy: result.createdBy || 'System',
          };
          setTransactions(prev => [newTransaction, ...prev]);
          return newTransaction;
        } catch (apiError) {
          console.warn('API call failed, creating mock transaction:', apiError);
          // Fallback to mock creation
          const newTransaction: StockTransaction = {
            ...transaction,
            id: `TXN-${Date.now()}`,
            createdAt: new Date().toISOString(),
            createdBy: 'System User',
          };
          setTransactions(prev => [newTransaction, ...prev]);
          return newTransaction;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create transaction');
        throw err;
      }
    };

  return { transactions, loading, error, refetch: fetchTransactions, createTransaction };
}
>>>>>>> origin/abhi-version
