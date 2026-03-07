import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { warehouseApi } from '@/services/warehouseApi';
import type { BinResponse, BinRequest } from '@/types/api';

interface EditBinModalProps {
  bin: BinResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditBinModal({ bin, isOpen, onClose, onSuccess }: EditBinModalProps) {
  const [formData, setFormData] = useState<BinRequest>({
    shelfId: 1,
    warehouseId: 1,
    binCode: '',
    barcodeTag: '',
    binType: 'STORAGE',
    capacityQty: 0,
    isActive: true,
    blocked: false,
    pickSequence: 1,
    hazardousAllowed: false,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bin) {
      setFormData({
        shelfId: bin.shelfId,
        warehouseId: bin.warehouseId,
        binCode: bin.binCode,
        barcodeTag: bin.barcodeTag || '',
        binType: bin.binType as any,
        capacityQty: bin.capacityQty,
        capacityWeight: bin.capacityWeight,
        capacityVolume: bin.capacityVolume,
        isActive: bin.isActive,
        blocked: bin.blocked,
        blockReason: bin.blockReason,
        pickSequence: bin.pickSequence,
        hazardousAllowed: bin.hazardousAllowed,
        minTemp: bin.minTemp,
        maxTemp: bin.maxTemp,
        description: bin.description || ''
      });
    }
  }, [bin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bin) return;

    setLoading(true);
    try {
      await warehouseApi.updateBin(bin.id, formData);
      alert('Bin updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert(`Failed to update bin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Bin</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bin Code</label>
              <input
                type="text"
                value={formData.binCode}
                onChange={(e) => setFormData({ ...formData, binCode: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bin Type</label>
              <select
                value={formData.binType}
                onChange={(e) => setFormData({ ...formData, binType: e.target.value as any })}
                className="input-field"
              >
                <option value="STORAGE">Storage</option>
                <option value="RECEIVING">Receiving</option>
                <option value="QC">QC</option>
                <option value="QUARANTINE">Quarantine</option>
                <option value="DISPATCH">Dispatch</option>
                <option value="DAMAGE">Damage</option>
                <option value="RETURNS">Returns</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Capacity Qty</label>
              <input
                type="number"
                value={formData.capacityQty}
                onChange={(e) => setFormData({ ...formData, capacityQty: parseInt(e.target.value) })}
                className="input-field"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity Weight (kg)</label>
              <input
                type="number"
                value={formData.capacityWeight || ''}
                onChange={(e) => setFormData({ ...formData, capacityWeight: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity Volume (m³)</label>
              <input
                type="number"
                value={formData.capacityVolume || ''}
                onChange={(e) => setFormData({ ...formData, capacityVolume: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="input-field"
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

          {formData.blocked && (
            <div>
              <label className="block text-sm font-medium mb-1">Block Reason</label>
              <input
                type="text"
                value={formData.blockReason || ''}
                onChange={(e) => setFormData({ ...formData, blockReason: e.target.value })}
                className="input-field"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.blocked}
                onChange={(e) => setFormData({ ...formData, blocked: e.target.checked })}
              />
              Blocked
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hazardousAllowed}
                onChange={(e) => setFormData({ ...formData, hazardousAllowed: e.target.checked })}
              />
              Hazardous Allowed
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
              {loading ? 'Updating...' : 'Update Bin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
