import { useState, useEffect } from 'react';
import { ArrowLeftRight, Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { warehouseApi } from '@/services/warehouseApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type {
  TransferOrderResponse,
  TransferOrderRequest,
  TransferItemRequest,
  TransferDispatchItem,
  TransferReceiveItem,
} from '@/types/api';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  APPROVED: 'bg-blue-100 text-blue-700',
  DISPATCHED: 'bg-orange-100 text-orange-700',
  IN_TRANSIT: 'bg-yellow-100 text-yellow-700',
  RECEIVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const EMPTY_ITEM: TransferItemRequest = { productId: 0, requestedQty: 1 };

const EMPTY_FORM: TransferOrderRequest = {
  sourceWarehouseId: 0,
  destinationWarehouseId: 0,
  requestedDate: new Date().toISOString().split('T')[0],
  items: [{ ...EMPTY_ITEM }],
};

type FormErrors = {
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  requestedDate?: string;
  items?: string;
};

function validate(form: TransferOrderRequest): FormErrors {
  const e: FormErrors = {};
  if (!form.sourceWarehouseId) e.sourceWarehouseId = 'Required';
  if (!form.destinationWarehouseId) e.destinationWarehouseId = 'Required';
  if (form.sourceWarehouseId && form.destinationWarehouseId && form.sourceWarehouseId === form.destinationWarehouseId)
    e.destinationWarehouseId = 'Must differ from source';
  if (!form.requestedDate) e.requestedDate = 'Required';
  if (!form.items.length) e.items = 'At least one item required';
  if (form.items.some(i => !i.productId || i.requestedQty <= 0))
    e.items = 'Each item needs a valid Product ID and qty > 0';
  return e;
}

const numOrUndef = (v: string) => { const n = Number(v); return v === '' || isNaN(n) ? undefined : n; };

export default function TransferOrders() {
  const [transfers, setTransfers] = useState<TransferOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<TransferOrderRequest>({ ...EMPTY_FORM, items: [{ ...EMPTY_ITEM }] });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Dispatch dialog
  const [dispatchTarget, setDispatchTarget] = useState<TransferOrderResponse | null>(null);
  const [dispatchItems, setDispatchItems] = useState<TransferDispatchItem[]>([]);

  // Receive dialog
  const [receiveTarget, setReceiveTarget] = useState<TransferOrderResponse | null>(null);
  const [receiveItems, setReceiveItems] = useState<TransferReceiveItem[]>([]);

  const fetchTransfers = async (p = page) => {
    try {
      setLoading(true);
      const data = await warehouseApi.getTransfers({ page: p, size: 10, sort: 'createdAt,desc' });
      if (Array.isArray(data)) {
        setTransfers(data as unknown as TransferOrderResponse[]);
        setTotalPages(1);
      } else {
        setTransfers(data.content ?? []);
        setTotalPages(data.totalPages ?? 1);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to fetch transfers');
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransfers(page); }, [page]);

  // ── Create helpers ────────────────────────────────────────────────────────
  const setField = (k: keyof TransferOrderRequest, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const setItem = (idx: number, k: keyof TransferItemRequest, v: unknown) =>
    setForm(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [k]: v } : item) }));

  const handleCreate = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload: TransferOrderRequest = {
        sourceWarehouseId: form.sourceWarehouseId,
        destinationWarehouseId: form.destinationWarehouseId,
        requestedDate: form.requestedDate,
        ...(form.remarks ? { remarks: form.remarks } : {}),
        items: form.items.map(item => ({
          productId: item.productId,
          requestedQty: item.requestedQty,
          ...(item.batchId ? { batchId: item.batchId } : {}),
          ...(item.sourceBinId ? { sourceBinId: item.sourceBinId } : {}),
          ...(item.destinationBinId ? { destinationBinId: item.destinationBinId } : {}),
          ...(item.remarks ? { remarks: item.remarks } : {}),
        })),
      };
      await warehouseApi.createTransfer(payload);
      toast.success('Transfer order created');
      setCreateOpen(false);
      setForm({ ...EMPTY_FORM, items: [{ ...EMPTY_ITEM }] });
      setErrors({});
      fetchTransfers(page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create transfer');
    } finally {
      setSaving(false);
    }
  };

  // ── Status actions ────────────────────────────────────────────────────────
  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const updated = await warehouseApi.approveTransfer(id);
      setTransfers(prev => prev.map(x => x.id === id ? updated : x));
      toast.success('Transfer approved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Approve failed');
    } finally { setActionLoading(null); }
  };

  const handleCancel = async (id: number) => {
    setActionLoading(id);
    try {
      const updated = await warehouseApi.cancelTransfer(id);
      setTransfers(prev => prev.map(x => x.id === id ? updated : x));
      toast.success('Transfer cancelled');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cancel failed');
    } finally { setActionLoading(null); }
  };

  // ── Dispatch ──────────────────────────────────────────────────────────────
  const openDispatch = (t: TransferOrderResponse) => {
    setDispatchTarget(t);
    setDispatchItems(t.items.map(i => ({
      productId: i.productId,
      batchId: i.batchId,
      dispatchedQty: i.requestedQty,
      sourceBinId: i.sourceBinId,
      remarks: i.remarks,
    })));
  };

  const setDispatchItem = (idx: number, k: keyof TransferDispatchItem, v: unknown) =>
    setDispatchItems(prev => prev.map((item, i) => i === idx ? { ...item, [k]: v } : item));

  const handleDispatch = async () => {
    if (!dispatchTarget) return;
    setActionLoading(dispatchTarget.id);
    try {
      const updated = await warehouseApi.dispatchTransfer(dispatchTarget.id, dispatchItems);
      setTransfers(prev => prev.map(x => x.id === dispatchTarget.id ? updated : x));
      toast.success('Transfer dispatched');
      setDispatchTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Dispatch failed');
    } finally { setActionLoading(null); }
  };

  // ── Receive ───────────────────────────────────────────────────────────────
  const openReceive = (t: TransferOrderResponse) => {
    setReceiveTarget(t);
    setReceiveItems(t.items.map(i => ({
      productId: i.productId,
      batchId: i.batchId,
      receivedQty: i.dispatchedQty ?? i.requestedQty,
      destinationBinId: i.destinationBinId,
      remarks: i.remarks,
    })));
  };

  const setReceiveItem = (idx: number, k: keyof TransferReceiveItem, v: unknown) =>
    setReceiveItems(prev => prev.map((item, i) => i === idx ? { ...item, [k]: v } : item));

  const handleReceive = async () => {
    if (!receiveTarget) return;
    setActionLoading(receiveTarget.id);
    try {
      const updated = await warehouseApi.receiveTransfer(receiveTarget.id, receiveItems);
      setTransfers(prev => prev.map(x => x.id === receiveTarget.id ? updated : x));
      toast.success('Transfer received');
      setReceiveTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Receive failed');
    } finally { setActionLoading(null); }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6" style={{ color: '#1a237e' }} /> Transfer Orders
          </h1>
          <p className="page-subtitle">Inter-warehouse stock transfers</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => { setForm({ ...EMPTY_FORM, items: [{ ...EMPTY_ITEM }] }); setErrors({}); setCreateOpen(true); }}
        >
          <Plus className="w-4 h-4" /> New Transfer
        </button>
      </div>

      {loading ? (
        <div className="section-card p-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-3">
          {transfers.map(t => (
            <div key={t.id} className="section-card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium text-sm">Transfer #{t.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.sourceWarehouseName} → {t.destinationWarehouseName} · {t.requestedDate}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {t.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.items?.length ?? 0} items</span>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {t.status === 'DRAFT' && (
                    <button className="text-xs btn-primary py-1 px-2" disabled={actionLoading === t.id}
                      onClick={() => handleApprove(t.id)}>Approve</button>
                  )}
                  {t.status === 'APPROVED' && (
                    <button className="text-xs btn-primary py-1 px-2" disabled={actionLoading === t.id}
                      onClick={() => openDispatch(t)}>Dispatch</button>
                  )}
                  {(t.status === 'DISPATCHED' || t.status === 'IN_TRANSIT') && (
                    <button className="text-xs btn-primary py-1 px-2" disabled={actionLoading === t.id}
                      onClick={() => openReceive(t)}>Receive</button>
                  )}
                  {['DRAFT', 'APPROVED'].includes(t.status) && (
                    <button className="text-xs btn-outline py-1 px-2 text-red-600 border-red-300"
                      disabled={actionLoading === t.id} onClick={() => handleCancel(t.id)}>Cancel</button>
                  )}
                  {expanded === t.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {expanded === t.id && t.items?.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th><th>Requested</th><th>Dispatched</th>
                        <th>Received</th><th>Source Bin</th><th>Dest Bin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.items.map(item => (
                        <tr key={item.id}>
                          <td className="text-sm">{item.productName}</td>
                          <td className="text-sm">{item.requestedQty}</td>
                          <td className="text-sm">{item.dispatchedQty ?? '—'}</td>
                          <td className="text-sm">{item.receivedQty ?? '—'}</td>
                          <td className="text-xs">{item.sourceBinCode ?? '—'}</td>
                          <td className="text-xs">{item.destinationBinCode ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {t.remarks && <p className="text-xs text-muted-foreground mt-2">Remarks: {t.remarks}</p>}
                </div>
              )}
            </div>
          ))}
          {transfers.length === 0 && (
            <div className="section-card p-12 text-center text-muted-foreground">No transfer orders found</div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 mt-2">
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button className="btn-outline py-1 px-3 text-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
            <button className="btn-outline py-1 px-3 text-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={o => { if (!o) { setCreateOpen(false); setErrors({}); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Transfer Order</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Source Warehouse ID *</label>
              <input type="number" className={`input-field ${errors.sourceWarehouseId ? 'border-red-400' : ''}`}
                value={form.sourceWarehouseId || ''} onChange={e => setField('sourceWarehouseId', Number(e.target.value))} />
              {errors.sourceWarehouseId && <p className="text-xs text-red-500 mt-0.5">{errors.sourceWarehouseId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Destination Warehouse ID *</label>
              <input type="number" className={`input-field ${errors.destinationWarehouseId ? 'border-red-400' : ''}`}
                value={form.destinationWarehouseId || ''} onChange={e => setField('destinationWarehouseId', Number(e.target.value))} />
              {errors.destinationWarehouseId && <p className="text-xs text-red-500 mt-0.5">{errors.destinationWarehouseId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Requested Date *</label>
              <input type="date" className={`input-field ${errors.requestedDate ? 'border-red-400' : ''}`}
                value={form.requestedDate} onChange={e => setField('requestedDate', e.target.value)} />
              {errors.requestedDate && <p className="text-xs text-red-500 mt-0.5">{errors.requestedDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <input className="input-field" value={form.remarks ?? ''} onChange={e => setField('remarks', e.target.value)} />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Items *</label>
              <button type="button" className="btn-outline py-1 px-2 text-xs flex items-center gap-1" onClick={addItem}>
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            {errors.items && <p className="text-xs text-red-500 mb-2">{errors.items}</p>}
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Product ID *</label>
                      <input type="number" className="input-field text-sm" placeholder="Product ID"
                        value={item.productId === 0 ? '' : item.productId}
                        onChange={e => setItem(idx, 'productId', e.target.value === '' ? 0 : Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Requested Qty *</label>
                      <input type="number" className="input-field text-sm" min={1}
                        value={item.requestedQty === 0 ? '' : item.requestedQty}
                        onChange={e => setItem(idx, 'requestedQty', e.target.value === '' ? 0 : Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Batch ID</label>
                      <input type="number" className="input-field text-sm" placeholder="Optional"
                        value={item.batchId ?? ''} onChange={e => setItem(idx, 'batchId', numOrUndef(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Source Bin ID</label>
                      <input type="number" className="input-field text-sm" placeholder="Optional"
                        value={item.sourceBinId ?? ''} onChange={e => setItem(idx, 'sourceBinId', numOrUndef(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Destination Bin ID</label>
                      <input type="number" className="input-field text-sm" placeholder="Optional"
                        value={item.destinationBinId ?? ''} onChange={e => setItem(idx, 'destinationBinId', numOrUndef(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Item Remarks</label>
                      <input className="input-field text-sm" placeholder="Optional"
                        value={item.remarks ?? ''} onChange={e => setItem(idx, 'remarks', e.target.value)} />
                    </div>
                  </div>
                  {form.items.length > 1 && (
                    <button type="button" className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      onClick={() => removeItem(idx)}>
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button className="btn-primary flex-1" onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </button>
            <button className="btn-outline" onClick={() => setCreateOpen(false)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dispatch Dialog ── */}
      <Dialog open={!!dispatchTarget} onOpenChange={o => { if (!o) setDispatchTarget(null); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Dispatch Transfer #{dispatchTarget?.id}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {dispatchItems.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                <p className="text-sm font-medium mb-2">
                  {dispatchTarget?.items[idx]?.productName ?? `Product #${item.productId}`}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Dispatched Qty *</label>
                    <input type="number" className="input-field text-sm" min={0}
                      value={item.dispatchedQty}
                      onChange={e => setDispatchItem(idx, 'dispatchedQty', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Source Bin ID</label>
                    <input type="number" className="input-field text-sm" placeholder="Optional"
                      value={item.sourceBinId ?? ''}
                      onChange={e => setDispatchItem(idx, 'sourceBinId', numOrUndef(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Remarks</label>
                    <input className="input-field text-sm" placeholder="Optional"
                      value={item.remarks ?? ''}
                      onChange={e => setDispatchItem(idx, 'remarks', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1" disabled={actionLoading === dispatchTarget?.id} onClick={handleDispatch}>
              {actionLoading === dispatchTarget?.id ? 'Dispatching...' : 'Confirm Dispatch'}
            </button>
            <button className="btn-outline" onClick={() => setDispatchTarget(null)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Receive Dialog ── */}
      <Dialog open={!!receiveTarget} onOpenChange={o => { if (!o) setReceiveTarget(null); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Receive Transfer #{receiveTarget?.id}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {receiveItems.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                <p className="text-sm font-medium mb-2">
                  {receiveTarget?.items[idx]?.productName ?? `Product #${item.productId}`}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Received Qty *</label>
                    <input type="number" className="input-field text-sm" min={0}
                      value={item.receivedQty}
                      onChange={e => setReceiveItem(idx, 'receivedQty', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Destination Bin ID</label>
                    <input type="number" className="input-field text-sm" placeholder="Optional"
                      value={item.destinationBinId ?? ''}
                      onChange={e => setReceiveItem(idx, 'destinationBinId', numOrUndef(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Remarks</label>
                    <input className="input-field text-sm" placeholder="Optional"
                      value={item.remarks ?? ''}
                      onChange={e => setReceiveItem(idx, 'remarks', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1" disabled={actionLoading === receiveTarget?.id} onClick={handleReceive}>
              {actionLoading === receiveTarget?.id ? 'Receiving...' : 'Confirm Receive'}
            </button>
            <button className="btn-outline" onClick={() => setReceiveTarget(null)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
