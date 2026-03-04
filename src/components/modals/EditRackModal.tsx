import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { warehouseApi } from '@/services/warehouseApi';
import type { RackResponse, RackRequest } from '@/types/api';

interface EditRackModalProps {
  rack: RackResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditRackModal({ rack, isOpen, onClose, onSuccess }: EditRackModalProps) {
  const [formData, setFormData] = useState<RackRequest>({
    zoneId: 1,
    rackCode: '',
    barcodeTag: '',
    rackType: 'STORAGE',
    aisle: '',
    pickSequence: 1,
    isActive: true,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rack) {
      setFormData({
        zoneId: rack.zoneId,
        rackCode: rack.rackCode,
        barcodeTag: rack.barcodeTag || '',
        rackType: rack.rackType as any,
        aisle: rack.aisle || '',
        pickSequence: rack.pickSequence,
        maxWeight: rack.maxWeight,
        maxVolume: rack.maxVolume,
        isActive: rack.isActive,
        description: rack.description || ''
      });
    }
  }, [rack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rack) return;

    setLoading(true);
    try {
      await warehouseApi.updateRack(rack.id, formData);
      alert('Rack updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert(`Failed to update rack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Rack</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rack Code</label>
              <input
                type="text"
                value={formData.rackCode}
                onChange={(e) => setFormData({ ...formData, rackCode: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rack Type</label>
              <select
                value={formData.rackType}
                onChange={(e) => setFormData({ ...formData, rackType: e.target.value as any })}
                className="input-field"
              >
                <option value="STORAGE">Storage</option>
                <option value="PALLET">Pallet</option>
                <option value="CANTILEVER">Cantilever</option>
                <option value="MEZZANINE">Mezzanine</option>
                <option value="MOBILE">Mobile</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Aisle</label>
              <input
                type="text"
                value={formData.aisle}
                onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pick Sequence</label>
              <input
                type="number"
                value={formData.pickSequence}
                onChange={(e) => setFormData({ ...formData, pickSequence: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                required
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-1">Barcode Tag</label>
            <input
              type="text"
              value={formData.barcodeTag}
              onChange={(e) => setFormData({ ...formData, barcodeTag: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-4">
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
              {loading ? 'Updating...' : 'Update Rack'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}