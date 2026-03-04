import { useState } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { WareHouseRequest } from '@/types/api';

export default function ApiDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setDebugInfo(null);

    try {
      // Check token
      const token = localStorage.getItem('auth_token');
      console.log('Token from localStorage:', token ? 'Present' : 'Missing');

      // Test API call
      const warehouses = await warehouseApi.getWarehouses();
      
      setDebugInfo({
        success: true,
        token: token ? 'Present' : 'Missing',
        warehousesCount: warehouses.length,
        warehouses: warehouses
      });
    } catch (error) {
      console.error('API Debug Error:', error);
      setDebugInfo({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        token: localStorage.getItem('auth_token') ? 'Present' : 'Missing'
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateWarehouse = async () => {
    setLoading(true);
    setDebugInfo(null);

    try {
      const testWarehouse: WareHouseRequest = {
        code: 'TEST-WH-001',
        name: 'Test Warehouse',
        address: 'Test Address 123',
        contactPerson: 'Test Person',
        contactPhone: '+1-555-0123',
        contactEmail: 'test@example.com',
        qcRequired: false,
        binTrackingEnabled: true,
        isActive: true,
        description: 'Test warehouse for API testing',
        warehouseType: 'NORMAL',
        defaultPickStrategy: 'FIFO',
        allowNegativeStock: false,
        openTime: '08:00:00',
        closeTime: '20:00:00',
        latitude: 40.7128,
        longitude: -74.0060,
        totalCapacityWeight: 5000,
        totalCapacityVolume: 2500,
        locationId: 1,
      };

      console.log('Testing POST with data:', testWarehouse);
      const result = await warehouseApi.createWarehouse(testWarehouse);
      
      setDebugInfo({
        success: true,
        action: 'CREATE_WAREHOUSE',
        result: result
      });
    } catch (error) {
      console.error('Create Warehouse Error:', error);
      setDebugInfo({
        success: false,
        action: 'CREATE_WAREHOUSE',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">API Debug Tool</h3>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test GET API'}
        </button>

        <button 
          onClick={testCreateWarehouse}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test POST API'}
        </button>
      </div>

      {debugInfo && (
        <div className="mt-4 p-3 border rounded">
          <h4 className="font-semibold">Debug Results:</h4>
          <pre className="text-sm mt-2 whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}