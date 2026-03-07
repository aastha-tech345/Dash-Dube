import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { ZoneRequest, WareHouseResponse, FloorResponse } from '@/types/api';

interface ZoneFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ZoneForm({ onSuccess, onCancel }: ZoneFormProps) {
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<WareHouseResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [formData, setFormData] = useState<ZoneRequest>({
    warehouseId: 0,
    floorId: 0,
    name: '',
    zoneType: 'STORAGE',
    pickPriority: 1,
    putAwayPriority: 1,
    fastMovingZone: false,
    temperatureControlled: false,
    minTemp: null,
    maxTemp: null,
    hazardous: false,
    hazardClass: null,
    restrictedAccess: false,
    isActive: true,
    maxWeight: 0,
    maxVolume: 0,
    description: '',
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (formData.warehouseId > 0) {
      fetchFloors(formData.warehouseId);
    }
  }, [formData.warehouseId]);

  const fetchWarehouses = async () => {
    try {
      const data = await warehouseApi.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  const fetchFloors = async (warehouseId: number) => {
    try {
      const data = await warehouseApi.getFloorsByWarehouse(warehouseId);
      setFloors(data);
    } catch (error) {
      console.error('Failed to fetch floors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data - ensure null values for optional fields when not used
      const submitData: ZoneRequest = {
        ...formData,
        minTemp: formData.temperatureControlled ? formData.minTemp : null,
        maxTemp: formData.temperatureControlled ? formData.maxTemp : null,
        hazardClass: formData.hazardous ? formData.hazardClass : null,
      };

      await warehouseApi.createZone(submitData);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create zone:', error);
      alert('Failed to create zone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Warehouse *</label>
          <select
            className="input-field"
            value={formData.warehouseId}
            onChange={(e) => setFormData({ ...formData, warehouseId: parseInt(e.target.value) })}
            required
          >
            <option value={0}>Select Warehouse</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Floor *</label>
          <select
            className="input-field"
            value={formData.floorId}
            onChange={(e) => setFormData({ ...formData, floorId: parseInt(e.target.value) })}
            required
            disabled={!formData.warehouseId}
          >
            <option value={0}>Select Floor</option>
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.name} (Level {floor.levelNo})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Zone Name *</label>
          <input
            type="text"
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Zone Type</label>
          <select
            className="input-field"
            value={formData.zoneType}
            onChange={(e) => setFormData({ ...formData, zoneType: e.target.value as any })}
          >
            <option value="STORAGE">Storage</option>
            <option value="RECEIVING">Receiving</option>
            <option value="QC">QC (Quality Control)</option>
            <option value="QUARANTINE">Quarantine</option>
            <option value="DISPATCH">Dispatch</option>
            <option value="RETURNS">Returns</option>
            <option value="PRODUCTION_STAGING">Production Staging</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pick Priority</label>
          <input
            type="number"
            className="input-field"
            value={formData.pickPriority}
            onChange={(e) => setFormData({ ...formData, pickPriority: parseInt(e.target.value) })}
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Put Away Priority</label>
          <input
            type="number"
            className="input-field"
            value={formData.putAwayPriority}
            onChange={(e) => setFormData({ ...formData, putAwayPriority: parseInt(e.target.value) })}
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Max Weight (kg)</label>
          <input
            type="number"
            className="input-field"
            value={formData.maxWeight}
            onChange={(e) => setFormData({ ...formData, maxWeight: parseFloat(e.target.value) })}
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max Volume (m³)</label>
          <input
            type="number"
            className="input-field"
            value={formData.maxVolume}
            onChange={(e) => setFormData({ ...formData, maxVolume: parseFloat(e.target.value) })}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.fastMovingZone}
            onChange={(e) => setFormData({ ...formData, fastMovingZone: e.target.checked })}
          />
          <span className="text-sm">Fast Moving Zone</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.temperatureControlled}
            onChange={(e) => setFormData({ ...formData, temperatureControlled: e.target.checked })}
          />
          <span className="text-sm">Temperature Controlled</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.hazardous}
            onChange={(e) => setFormData({ ...formData, hazardous: e.target.checked })}
          />
          <span className="text-sm">Hazardous</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.restrictedAccess}
            onChange={(e) => setFormData({ ...formData, restrictedAccess: e.target.checked })}
          />
          <span className="text-sm">Restricted Access</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <span className="text-sm">Active</span>
        </label>
      </div>

      {formData.temperatureControlled && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Min Temperature (°C)</label>
            <input
              type="number"
              className="input-field"
              value={formData.minTemp || ''}
              onChange={(e) => setFormData({ ...formData, minTemp: parseFloat(e.target.value) })}
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Temperature (°C)</label>
            <input
              type="number"
              className="input-field"
              value={formData.maxTemp || ''}
              onChange={(e) => setFormData({ ...formData, maxTemp: parseFloat(e.target.value) })}
              step="0.1"
            />
          </div>
        </div>
      )}

      {formData.hazardous && (
        <div>
          <label className="block text-sm font-medium mb-1">Hazard Class</label>
          <input
            type="text"
            className="input-field"
            value={formData.hazardClass || ''}
            onChange={(e) => setFormData({ ...formData, hazardClass: e.target.value })}
            placeholder="e.g., Class 3 - Flammable Liquids"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="input-field"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Creating...' : 'Create Zone'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
