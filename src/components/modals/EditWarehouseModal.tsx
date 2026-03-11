<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { warehouseApi } from '@/services/warehouseApi';
import type { WareHouseResponse, WareHouseRequest } from '@/types/api';

interface EditWarehouseModalProps {
  warehouse: WareHouseResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditWarehouseModal({ warehouse, isOpen, onClose, onSuccess }: EditWarehouseModalProps) {
  const [formData, setFormData] = useState<WareHouseRequest>({
    code: '',
    name: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    qcRequired: false,
    binTrackingEnabled: false,
    isActive: true,
    description: '',
    warehouseType: 'NORMAL',
    defaultPickStrategy: 'FIFO',
    allowNegativeStock: false,
    openTime: '08:00:00',
    closeTime: '18:00:00',
    latitude: 0,
    longitude: 0,
    totalCapacityWeight: 0,
    totalCapacityVolume: 0,
    locationId: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (warehouse) {
      setFormData({
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address,
        contactPerson: warehouse.contactPerson || '',
        contactPhone: warehouse.contactPhone || '',
        contactEmail: warehouse.contactEmail || '',
        qcRequired: warehouse.qcRequired,
        binTrackingEnabled: warehouse.binTrackingEnabled,
        isActive: warehouse.isActive,
        description: warehouse.description || '',
        warehouseType: warehouse.warehouseType as any,
        defaultPickStrategy: warehouse.defaultPickStrategy as any,
        allowNegativeStock: warehouse.allowNegativeStock,
        openTime: warehouse.openTime || '08:00:00',
        closeTime: warehouse.closeTime || '18:00:00',
        latitude: warehouse.latitude || 0,
        longitude: warehouse.longitude || 0,
        totalCapacityWeight: warehouse.totalCapacityWeight || 0,
        totalCapacityVolume: warehouse.totalCapacityVolume || 0,
        locationId: warehouse.locationId
      });
    }
  }, [warehouse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouse) return;

    setLoading(true);
    try {
      await warehouseApi.updateWarehouse(warehouse.id, formData);
      alert('Warehouse updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert(`Failed to update warehouse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Warehouse</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Warehouse Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Warehouse Type</label>
              <select
                value={formData.warehouseType}
                onChange={(e) => setFormData({ ...formData, warehouseType: e.target.value as any })}
                className="input-field"
              >
                <option value="NORMAL">Normal</option>
                <option value="COLD_STORAGE">Cold Storage</option>
                <option value="BONDED">Bonded</option>
                <option value="DISTRIBUTION_CENTER">Distribution Center</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pick Strategy</label>
              <select
                value={formData.defaultPickStrategy}
                onChange={(e) => setFormData({ ...formData, defaultPickStrategy: e.target.value as any })}
                className="input-field"
              >
                <option value="FIFO">FIFO</option>
                <option value="LIFO">LIFO</option>
                <option value="FEFO">FEFO</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.qcRequired}
                onChange={(e) => setFormData({ ...formData, qcRequired: e.target.checked })}
              />
              QC Required
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.binTrackingEnabled}
                onChange={(e) => setFormData({ ...formData, binTrackingEnabled: e.target.checked })}
              />
              Bin Tracking
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
              {loading ? 'Updating...' : 'Update Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
=======
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { warehouseApi } from '@/services/warehouseApi';
import type { WareHouseResponse, WareHouseRequest } from '@/types/api';

interface EditWarehouseModalProps {
  warehouse: WareHouseResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditWarehouseModal({ warehouse, isOpen, onClose, onSuccess }: EditWarehouseModalProps) {
  const [formData, setFormData] = useState<WareHouseRequest>({
    code: '',
    name: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    qcRequired: false,
    binTrackingEnabled: false,
    isActive: true,
    description: '',
    warehouseType: 'NORMAL',
    defaultPickStrategy: 'FIFO',
    allowNegativeStock: false,
    openTime: '08:00:00',
    closeTime: '18:00:00',
    latitude: 0,
    longitude: 0,
    totalCapacityWeight: 0,
    totalCapacityVolume: 0,
    locationId: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (warehouse) {
      setFormData({
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address,
        contactPerson: warehouse.contactPerson || '',
        contactPhone: warehouse.contactPhone || '',
        contactEmail: warehouse.contactEmail || '',
        qcRequired: warehouse.qcRequired,
        binTrackingEnabled: warehouse.binTrackingEnabled,
        isActive: warehouse.isActive,
        description: warehouse.description || '',
        warehouseType: warehouse.warehouseType as any,
        defaultPickStrategy: warehouse.defaultPickStrategy as any,
        allowNegativeStock: warehouse.allowNegativeStock,
        openTime: warehouse.openTime || '08:00:00',
        closeTime: warehouse.closeTime || '18:00:00',
        latitude: warehouse.latitude || 0,
        longitude: warehouse.longitude || 0,
        totalCapacityWeight: warehouse.totalCapacityWeight || 0,
        totalCapacityVolume: warehouse.totalCapacityVolume || 0,
        locationId: warehouse.locationId
      });
    }
  }, [warehouse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouse) return;

    setLoading(true);
    try {
      await warehouseApi.updateWarehouse(warehouse.id, formData);
      alert('Warehouse updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert(`Failed to update warehouse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Warehouse</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Warehouse Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Warehouse Type</label>
              <select
                value={formData.warehouseType}
                onChange={(e) => setFormData({ ...formData, warehouseType: e.target.value as any })}
                className="input-field"
              >
                <option value="NORMAL">Normal</option>
                <option value="COLD_STORAGE">Cold Storage</option>
                <option value="BONDED">Bonded</option>
                <option value="DISTRIBUTION_CENTER">Distribution Center</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pick Strategy</label>
              <select
                value={formData.defaultPickStrategy}
                onChange={(e) => setFormData({ ...formData, defaultPickStrategy: e.target.value as any })}
                className="input-field"
              >
                <option value="FIFO">FIFO</option>
                <option value="LIFO">LIFO</option>
                <option value="FEFO">FEFO</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.qcRequired}
                onChange={(e) => setFormData({ ...formData, qcRequired: e.target.checked })}
              />
              QC Required
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.binTrackingEnabled}
                onChange={(e) => setFormData({ ...formData, binTrackingEnabled: e.target.checked })}
              />
              Bin Tracking
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
              {loading ? 'Updating...' : 'Update Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
>>>>>>> origin/abhi-version
}