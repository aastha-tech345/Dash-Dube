import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses, useZones } from '@/hooks/useWarehouses';
import type { StockTransaction } from '@/types/inventory';

interface StockTransactionFormProps {
  type: 'in' | 'out';
  onSubmit: (transaction: Omit<StockTransaction, 'id'>) => Promise<void>;
  onCancel?: () => void;
}

export default function StockTransactionForm({ type, onSubmit, onCancel }: StockTransactionFormProps) {
  const { products } = useProducts();
  const { warehouses } = useWarehouses();
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const { zones } = useZones(selectedWarehouse);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    warehouse: '',
    zone: '',
    reference: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    setLoading(true);
    try {
      await onSubmit({
        productId: formData.productId,
        productName: product.name,
        quantity: parseInt(formData.quantity),
        type,
        warehouse: formData.warehouse,
        zone: formData.zone || undefined,
        date: new Date().toISOString(),
        reference: formData.reference,
        notes: formData.notes || undefined,
      });
      
      // Reset form
      setFormData({
        productId: '',
        quantity: '',
        warehouse: '',
        zone: '',
        reference: '',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to create transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Product</label>
        <select
          className="input-field"
          value={formData.productId}
          onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
          required
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.id})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input
          type="number"
          className="input-field"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          min="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Warehouse</label>
        <select
          className="input-field"
          value={formData.warehouse}
          onChange={(e) => {
            setFormData({ ...formData, warehouse: e.target.value, zone: '' });
            setSelectedWarehouse(e.target.value);
          }}
          required
        >
          <option value="">Select warehouse</option>
          {warehouses.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name} ({w.code})
            </option>
          ))}
        </select>
      </div>

      {formData.warehouse && zones.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Zone (Optional)</label>
          <select
            className="input-field"
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
          >
            <option value="">Select zone</option>
            {zones.map((z) => (
              <option key={z.name} value={z.name}>
                {z.name} ({z.type})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Reference Number</label>
        <input
          type="text"
          className="input-field"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          placeholder={type === 'in' ? 'PO-2024-001' : 'SO-2024-001'}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
        <textarea
          className="input-field"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Processing...' : `Record Stock ${type === 'in' ? 'In' : 'Out'}`}
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
