import { useState, useEffect } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { warehouseApi } from '@/services/warehouseApi';
import type { WareProductResponse, WareHouseResponse, BinResponse, UoMResponse, InventoryMovementResponse } from '@/types/api';

interface StockTransactionFormProps {
  type: 'in' | 'out';
  onSubmit: (data: FormPayload) => Promise<void>;
  onCancel?: () => void;
}

export interface FormPayload {
  productId: number;
  warehouseId: number;
  binId?: number;
  uomId: number;
  quantity: number;
  unitCost?: number;
  referenceType: string;
  referenceId?: number;
  remarks?: string;
  batchId?: number;
  status: string;
  previousStatus?: string;
  newStatus: string;
}

// Inward movement types
const INWARD_TYPES = ['INWARD', 'INBOUND_RECEIPT', 'ADJUSTMENT_IN', 'PRODUCTION_RECEIPT', 'TRANSFER_RECEIVE'];
// Outward movement types
const OUTWARD_TYPES = ['OUTWARD', 'DISPATCH', 'ADJUSTMENT_OUT', 'PRODUCTION_ISSUE', 'PICK', 'PACK', 'TRANSFER_DISPATCH'];

function calcNetStock(movements: InventoryMovementResponse[], productId: number, warehouseId: number): number {
  return movements
    .filter(m => m.productId === productId && m.warehouseId === warehouseId)
    .reduce((acc, m) => {
      if (INWARD_TYPES.includes(m.type)) return acc + m.quantity;
      if (OUTWARD_TYPES.includes(m.type)) return acc - m.quantity;
      return acc;
    }, 0);
}

export default function StockTransactionForm({ type, onSubmit, onCancel }: StockTransactionFormProps) {
  const [products, setProducts] = useState<WareProductResponse[]>([]);
  const [warehouses, setWarehouses] = useState<WareHouseResponse[]>([]);
  const [bins, setBins] = useState<BinResponse[]>([]);
  const [uoms, setUoms] = useState<UoMResponse[]>([]);
  const [allMovements, setAllMovements] = useState<InventoryMovementResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [availableStock, setAvailableStock] = useState<number | null>(null);

  const referenceTypes = type === 'in'
    ? ['PURCHASE_GRN', 'RETURN_GRN', 'ADJUSTMENT', 'PRODUCTION_REC']
    : ['SALES_ORDER', 'TRANSFER', 'PRODUCTION_ISSUE', 'ADJUSTMENT'];

  const statusOptions = ['AVAILABLE', 'UNDER_QC', 'HOLD', 'DAMAGED', 'EXPIRED', 'TRANSIT', 'RESERVED'];

  const [form, setForm] = useState({
    productId: '',
    warehouseId: '',
    binId: '',
    uomId: '',
    quantity: '',
    unitCost: '',
    referenceType: referenceTypes[0],
    referenceId: '',
    remarks: '',
    status: type === 'in' ? 'UNDER_QC' : 'AVAILABLE',
    newStatus: type === 'in' ? 'UNDER_QC' : 'AVAILABLE',
    previousStatus: '',
  });

  useEffect(() => {
    Promise.all([
      warehouseApi.getProducts().catch(() => []),
      warehouseApi.getWarehouses().catch(() => []),
      warehouseApi.getUoMs().catch(() => []),
    ]).then(([p, w, u]) => {
      setProducts(p);
      setWarehouses(w);
      setUoms(u);
    });
  }, []);

  // Fetch movements when product + warehouse selected (only for stock out)
  useEffect(() => {
    if (type !== 'out' || !form.productId || !form.warehouseId) {
      setAvailableStock(null);
      return;
    }
    setStockLoading(true);
    warehouseApi.getInventoryMovementsByWarehouse(Number(form.warehouseId))
      .then(data => {
        setAllMovements(data);
        const net = calcNetStock(data, Number(form.productId), Number(form.warehouseId));
        setAvailableStock(net);
      })
      .catch(() => setAvailableStock(null))
      .finally(() => setStockLoading(false));
  }, [form.productId, form.warehouseId, type]);

  useEffect(() => {
    if (form.warehouseId) {
      warehouseApi.getBins().then(all => {
        setBins(all.filter(b => b.warehouseId === Number(form.warehouseId)));
      }).catch(() => setBins([]));
    } else {
      setBins([]);
    }
  }, [form.warehouseId]);

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const requestedQty = Number(form.quantity) || 0;
  const isInsufficientStock = type === 'out' && availableStock !== null && requestedQty > availableStock;
  const isLowStockWarning = type === 'out' && availableStock !== null && requestedQty > 0 && availableStock > 0 && requestedQty <= availableStock && (availableStock - requestedQty) < availableStock * 0.1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInsufficientStock) return; // block submit
    setLoading(true);
    try {
      await onSubmit({
        productId: Number(form.productId),
        warehouseId: Number(form.warehouseId),
        binId: form.binId ? Number(form.binId) : undefined,
        uomId: Number(form.uomId),
        quantity: Number(form.quantity),
        unitCost: form.unitCost ? Number(form.unitCost) : undefined,
        referenceType: form.referenceType,
        referenceId: form.referenceId ? Number(form.referenceId) : undefined,
        remarks: form.remarks || undefined,
        status: form.status,
        previousStatus: form.previousStatus || undefined,
        newStatus: form.newStatus,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Product */}
      <div>
        <label className="block text-sm font-medium mb-1">Product *</label>
        <select className="input-field" value={form.productId} onChange={e => set('productId', e.target.value)} required>
          <option value="">Select product</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name} — {p.sku}</option>
          ))}
        </select>
      </div>

      {/* Warehouse */}
      <div>
        <label className="block text-sm font-medium mb-1">Warehouse *</label>
        <select className="input-field" value={form.warehouseId} onChange={e => { set('warehouseId', e.target.value); set('binId', ''); }} required>
          <option value="">Select warehouse</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
          ))}
        </select>
      </div>

      {/* Available Stock Info (only for stock out) */}
      {type === 'out' && form.productId && form.warehouseId && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
          availableStock === null ? 'bg-muted text-muted-foreground' :
          availableStock <= 0 ? 'bg-red-50 text-red-600 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          <Info className="w-4 h-4 shrink-0" />
          {stockLoading
            ? 'Checking available stock...'
            : availableStock === null
            ? 'Could not fetch stock info'
            : `Available stock: ${availableStock} units`}
        </div>
      )}

      {/* Bin */}
      {bins.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Bin (Optional)</label>
          <select className="input-field" value={form.binId} onChange={e => set('binId', e.target.value)}>
            <option value="">Select bin</option>
            {bins.map(b => (
              <option key={b.id} value={b.id}>{b.binCode} — {b.binType}</option>
            ))}
          </select>
        </div>
      )}

      {/* Quantity & UoM */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Quantity *</label>
          <input
            type="number"
            className={`input-field ${isInsufficientStock ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.quantity}
            onChange={e => set('quantity', e.target.value)}
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">UoM *</label>
          <select className="input-field" value={form.uomId} onChange={e => set('uomId', e.target.value)} required>
            <option value="">Select UoM</option>
            {uoms.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.shortName})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Insufficient stock error */}
      {isInsufficientStock && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Insufficient stock. Available: <strong>{availableStock}</strong>, Requested: <strong>{requestedQty}</strong>
        </div>
      )}

      {/* Low stock warning */}
      {isLowStockWarning && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-md">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Low stock after this transaction. Remaining: <strong>{(availableStock! - requestedQty).toFixed(2)}</strong> units
        </div>
      )}

      {/* Unit Cost */}
      <div>
        <label className="block text-sm font-medium mb-1">Unit Cost (Optional)</label>
        <input type="number" className="input-field" value={form.unitCost} onChange={e => set('unitCost', e.target.value)} min="0" step="0.01" placeholder="0.00" />
      </div>

      {/* Reference */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Reference Type *</label>
          <select className="input-field" value={form.referenceType} onChange={e => set('referenceType', e.target.value)} required>
            {referenceTypes.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reference ID</label>
          <input type="number" className="input-field" value={form.referenceId} onChange={e => set('referenceId', e.target.value)} placeholder="e.g. 101" />
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Status *</label>
          <select className="input-field" value={form.status} onChange={e => { set('status', e.target.value); set('newStatus', e.target.value); }} required>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Previous Status</label>
          <select className="input-field" value={form.previousStatus} onChange={e => set('previousStatus', e.target.value)}>
            <option value="">None</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-sm font-medium mb-1">Remarks</label>
        <textarea className="input-field" value={form.remarks} onChange={e => set('remarks', e.target.value)} rows={2} placeholder="Optional notes..." />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading || isInsufficientStock}>
          {loading ? 'Processing...' : `Record Stock ${type === 'in' ? 'In' : 'Out'}`}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
        )}
      </div>
    </form>
  );
}
