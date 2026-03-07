import { useState } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { WareHouseRequest } from '@/types/api';

interface WarehouseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function WarehouseForm({ onSuccess, onCancel }: WarehouseFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WareHouseRequest>({
    code: '',
    name: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    qcRequired: false,
    binTrackingEnabled: true,
    isActive: true,
    description: '',
    warehouseType: 'NORMAL',
    defaultPickStrategy: 'FIFO',
    allowNegativeStock: false,
    locationId: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await warehouseApi.createWarehouse(formData);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create warehouse:', error);
      alert('Failed to create warehouse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Code *</label>
          <input
            type="text"
            className="input-field"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address *</label>
        <input
          type="text"
          className="input-field"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Contact Person</label>
          <input
            type="text"
            className="input-field"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact Phone</label>
          <input
            type="tel"
            className="input-field"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact Email</label>
          <input
            type="email"
            className="input-field"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Warehouse Type</label>
          <select
            className="input-field"
            value={formData.warehouseType}
            onChange={(e) => setFormData({ ...formData, warehouseType: e.target.value as any })}
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
            className="input-field"
            value={formData.defaultPickStrategy}
            onChange={(e) => setFormData({ ...formData, defaultPickStrategy: e.target.value as any })}
          >
            <option value="FIFO">FIFO (First In First Out)</option>
            <option value="LIFO">LIFO (Last In First Out)</option>
            <option value="FEFO">FEFO (First Expired First Out)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.qcRequired}
            onChange={(e) => setFormData({ ...formData, qcRequired: e.target.checked })}
          />
          <span className="text-sm">QC Required</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.binTrackingEnabled}
            onChange={(e) => setFormData({ ...formData, binTrackingEnabled: e.target.checked })}
          />
          <span className="text-sm">Bin Tracking</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.allowNegativeStock}
            onChange={(e) => setFormData({ ...formData, allowNegativeStock: e.target.checked })}
          />
          <span className="text-sm">Allow Negative Stock</span>
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
          {loading ? 'Creating...' : 'Create Warehouse'}
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
