<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { warehouseApi } from '@/services/warehouseApi';
import type { ZoneResponse, ZoneRequest } from '@/types/api';

interface EditZoneModalProps {
  zone: ZoneResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditZoneModal({ zone, isOpen, onClose, onSuccess }: EditZoneModalProps) {
  const [formData, setFormData] = useState<ZoneRequest>({
    warehouseId: 1,
    floorId: 1,
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
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (zone) {
      setFormData({
        warehouseId: zone.warehouseId,
        floorId: zone.floorId,
        name: zone.name,
        zoneType: zone.zoneType as any,
        pickPriority: zone.pickPriority,
        putAwayPriority: zone.putAwayPriority,
        fastMovingZone: zone.fastMovingZone,
        temperatureControlled: zone.temperatureControlled,
        minTemp: zone.minTemp,
        maxTemp: zone.maxTemp,
        hazardous: zone.hazardous,
        hazardClass: zone.hazardClass,
        restrictedAccess: zone.restrictedAccess,
        isActive: zone.isActive,
        maxWeight: zone.maxWeight,
        maxVolume: zone.maxVolume,
        description: zone.description || ''
      });
    }
  }, [zone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zone) return;

    setLoading(true);
    try {
      await warehouseApi.updateZone(zone.id, formData);
      alert('Zone updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert(`Failed to update zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Zone</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Zone Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zone Type</label>
              <select
                value={formData.zoneType}
                onChange={(e) => setFormData({ ...formData, zoneType: e.target.value as any })}
                className="input-field"
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
                value={formData.pickPriority}
                onChange={(e) => setFormData({ ...formData, pickPriority: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Put Away Priority</label>
              <input
                type="number"
                value={formData.putAwayPriority}
                onChange={(e) => setFormData({ ...formData, putAwayPriority: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                required
              />
            </div>
          </div>

          {formData.temperatureControlled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min Temperature (°C)</label>
                <input
                  type="number"
                  value={formData.minTemp || ''}
                  onChange={(e) => setFormData({ ...formData, minTemp: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Temperature (°C)</label>
                <input
                  type="number"
                  value={formData.maxTemp || ''}
                  onChange={(e) => setFormData({ ...formData, maxTemp: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="input-field"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Max Weight (kg)</label>
              <input
                type="number"
                value={formData.maxWeight || ''}
                onChange={(e) => setFormData({ ...formData, maxWeight: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Volume (m³)</label>
              <input
                type="number"
                value={formData.maxVolume || ''}
                onChange={(e) => setFormData({ ...formData, maxVolume: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.fastMovingZone}
                onChange={(e) => setFormData({ ...formData, fastMovingZone: e.target.checked })}
              />
              Fast Moving Zone
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.temperatureControlled}
                onChange={(e) => setFormData({ ...formData, temperatureControlled: e.target.checked })}
              />
              Temperature Controlled
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hazardous}
                onChange={(e) => setFormData({ ...formData, hazardous: e.target.checked })}
              />
              Hazardous
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Zone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
=======
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { warehouseApi } from '@/services/warehouseApi';
import type { ZoneResponse, ZoneRequest } from '@/types/api';

interface EditZoneModalProps {
  zone: ZoneResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditZoneModal({ zone, isOpen, onClose, onSuccess }: EditZoneModalProps) {
  const [formData, setFormData] = useState<ZoneRequest>({
    warehouseId: 1,
    floorId: 1,
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
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (zone) {
      setFormData({
        warehouseId: zone.warehouseId,
        floorId: zone.floorId,
        name: zone.name,
        zoneType: zone.zoneType as any,
        pickPriority: zone.pickPriority,
        putAwayPriority: zone.putAwayPriority,
        fastMovingZone: zone.fastMovingZone,
        temperatureControlled: zone.temperatureControlled,
        minTemp: zone.minTemp,
        maxTemp: zone.maxTemp,
        hazardous: zone.hazardous,
        hazardClass: zone.hazardClass,
        restrictedAccess: zone.restrictedAccess,
        isActive: zone.isActive,
        maxWeight: zone.maxWeight,
        maxVolume: zone.maxVolume,
        description: zone.description || ''
      });
    }
  }, [zone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zone) return;

    setLoading(true);
    try {
      await warehouseApi.updateZone(zone.id, formData);
      alert('Zone updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert(`Failed to update zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Zone</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Zone Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zone Type</label>
              <select
                value={formData.zoneType}
                onChange={(e) => setFormData({ ...formData, zoneType: e.target.value as any })}
                className="input-field"
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
                value={formData.pickPriority}
                onChange={(e) => setFormData({ ...formData, pickPriority: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Put Away Priority</label>
              <input
                type="number"
                value={formData.putAwayPriority}
                onChange={(e) => setFormData({ ...formData, putAwayPriority: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                required
              />
            </div>
          </div>

          {formData.temperatureControlled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min Temperature (°C)</label>
                <input
                  type="number"
                  value={formData.minTemp || ''}
                  onChange={(e) => setFormData({ ...formData, minTemp: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Temperature (°C)</label>
                <input
                  type="number"
                  value={formData.maxTemp || ''}
                  onChange={(e) => setFormData({ ...formData, maxTemp: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="input-field"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Max Weight (kg)</label>
              <input
                type="number"
                value={formData.maxWeight || ''}
                onChange={(e) => setFormData({ ...formData, maxWeight: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Volume (m³)</label>
              <input
                type="number"
                value={formData.maxVolume || ''}
                onChange={(e) => setFormData({ ...formData, maxVolume: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.fastMovingZone}
                onChange={(e) => setFormData({ ...formData, fastMovingZone: e.target.checked })}
              />
              Fast Moving Zone
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.temperatureControlled}
                onChange={(e) => setFormData({ ...formData, temperatureControlled: e.target.checked })}
              />
              Temperature Controlled
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hazardous}
                onChange={(e) => setFormData({ ...formData, hazardous: e.target.checked })}
              />
              Hazardous
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Zone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
>>>>>>> origin/abhi-version
