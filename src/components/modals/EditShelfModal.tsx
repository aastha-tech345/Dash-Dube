import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { warehouseApi } from '@/services/warehouseApi';
import type { ShelfResponse, ShelfRequest } from '@/types/api';

interface EditShelfModalProps {
  shelf: ShelfResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditShelfModal({ shelf, isOpen, onClose, onSuccess }: EditShelfModalProps) {
  const [formData, setFormData] = useState<ShelfRequest>({
    rackId: 1,
    shelfCode: '',
    barcodeTag: '',
    levelNo: 1,
    pickSequence: 1,
    isActive: true,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shelf) {
      setFormData({
        rackId: shelf.rackId,
        shelfCode: shelf.shelfCode,
        barcodeTag: shelf.barcodeTag || '',
        levelNo: shelf.levelNo,
        pickSequence: shelf.pickSequence,
        maxWeight: shelf.maxWeight,
        maxVolume: shelf.maxVolume,
        isActive: shelf.isActive,
        description: shelf.description || ''
      });
    }
  }, [shelf]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shelf) return;

    setLoading(true);
    try {
      await warehouseApi.updateShelf(shelf.id, formData);
      alert('Shelf updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert(`Failed to update shelf: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Shelf</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Shelf Code</label>
              <input
                type="text"
                value={formData.shelfCode}
                onChange={(e) => setFormData({ ...formData, shelfCode: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Level Number</label>
              <input
                type="number"
                value={formData.levelNo}
                onChange={(e) => setFormData({ ...formData, levelNo: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium mb-1">Barcode Tag</label>
              <input
                type="text"
                value={formData.barcodeTag}
                onChange={(e) => setFormData({ ...formData, barcodeTag: e.target.value })}
                className="input-field"
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
              {loading ? 'Updating...' : 'Update Shelf'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}