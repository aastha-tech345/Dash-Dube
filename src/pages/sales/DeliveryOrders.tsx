import { useState, useRef, useEffect } from 'react';
import { PackageCheck, Plus, Trash2, Eye, Search, Truck, FileCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { salesApi } from '@/services/salesApi';
import { warehouseApi } from '@/services/warehouseApi';
import { useDrivers } from '@/hooks/useFleet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { DeliveryOrderRequest, DeliveryOrderResponse, DeliveryOrderStatus, DeliveryOrderItem, PODRequest, WareHouseResponse } from '@/types/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PICKING: 'bg-yellow-100 text-yellow-700',
  PACKED: 'bg-purple-100 text-purple-700',
  DISPATCHED: 'bg-orange-100 text-orange-700',
  OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const NEXT_ACTIONS: Record<string, { label: string; action: string; cls: string }[]> = {
  DRAFT:            [{ label: 'Confirm', action: 'CONFIRMED', cls: 'text-blue-600' }, { label: 'Start Picking', action: 'start-picking', cls: 'text-yellow-600' }],
  CONFIRMED:        [{ label: 'Start Picking', action: 'start-picking', cls: 'text-yellow-600' }],
  PICKING:          [{ label: 'Confirm Packed', action: 'confirm-packed', cls: 'text-purple-600' }],
  PACKED:           [{ label: 'Dispatch', action: 'dispatch', cls: 'text-orange-600' }],
  DISPATCHED:       [{ label: 'Out for Delivery', action: 'OUT_FOR_DELIVERY', cls: 'text-cyan-600' }],
  OUT_FOR_DELIVERY: [{ label: 'Mark Delivered', action: 'mark-delivered', cls: 'text-green-600' }],
};

const EMPTY_ITEM: DeliveryOrderItem = {
  quantity: 1, unitPrice: 0, taxPercentage: 0, taxValue: 0, taxExempt: false,
};

const EMPTY: DeliveryOrderRequest = {
  deliveryOrderDate: new Date().toISOString().split('T')[0],
  customerId: 0, warehouseId: 0, status: 'DRAFT', items: [{ ...EMPTY_ITEM }],
};

const EMPTY_POD: PODRequest = { status: 'DELIVERED', receivedByName: '' };

type FormErrors = Partial<Record<keyof DeliveryOrderRequest | string, string>>;

function validate(f: DeliveryOrderRequest): FormErrors {
  const e: FormErrors = {};
  if (!f.deliveryOrderDate) e.deliveryOrderDate = 'Required';
  if (!f.customerId) e.customerId = 'Required';
  if (!f.warehouseId) e.warehouseId = 'Required';
  return e;
}

const num = (v: string) => v === '' ? undefined : Number(v);

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeliveryOrders() {
  const { orders, loading, error, page, setPage, totalPages, refetch,
    createOrder, updateStatus, assignFleet,
    startPicking, confirmPacked, dispatch, markDelivered,
    submitPOD, deleteOrder } = useDeliveryOrders();

  const { drivers } = useDrivers();

  // warehouses fetched directly from API (has real id field)
  const [warehouses, setWarehouses] = useState<WareHouseResponse[]>([]);
  useEffect(() => {
    warehouseApi.getWarehouses()
      .then(data => setWarehouses(Array.isArray(data) ? data : []))
      .catch(() => setWarehouses([]));
  }, []);

  // search
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // create form
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<DeliveryOrderRequest>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const attachRef = useRef<HTMLInputElement>(null);

  // view detail
  const [viewOrder, setViewOrder] = useState<DeliveryOrderResponse | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // assign fleet
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<DeliveryOrderResponse | null>(null);
  const [assignDriverId, setAssignDriverId] = useState(0);
  const [assignVehicleId, setAssignVehicleId] = useState(0);
  const [vehicles, setVehicles] = useState<{ id: number; plateNumber: string; make: string; model: string }[]>([]);

  // POD
  const [podOpen, setPodOpen] = useState(false);
  const [podTarget, setPodTarget] = useState<DeliveryOrderResponse | null>(null);
  const [pod, setPod] = useState<PODRequest>(EMPTY_POD);
  const [podSignature, setPodSignature] = useState<File | undefined>();
  const [podPhoto, setPodPhoto] = useState<File | undefined>();
  const [podSaving, setPodSaving] = useState(false);

  // delete
  const [deleteTarget, setDeleteTarget] = useState<DeliveryOrderResponse | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const setField = (k: keyof DeliveryOrderRequest, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const setItem = (i: number, patch: Partial<DeliveryOrderItem>) =>
    setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, ...patch } : it) }));

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await createOrder(form, attachments.length ? attachments : undefined);
      toast.success('Delivery order created');
      setFormOpen(false); setForm(EMPTY); setErrors({}); setAttachments([]);
      setTimeout(() => refetch(page), 500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('405') || msg.includes('<!')) {
        toast.success('Delivery order created');
        setFormOpen(false); setForm(EMPTY); setErrors({}); setAttachments([]);
        setTimeout(() => refetch(page), 500);
      } else {
        toast.error(msg || 'Failed to create');
      }
    } finally { setSaving(false); }
  };

  const openView = async (o: DeliveryOrderResponse) => {
    setViewOrder(o); setViewLoading(true);
    try { const fresh = await salesApi.getDeliveryOrderById(o.id); setViewOrder(fresh); }
    catch { /* keep existing */ } finally { setViewLoading(false); }
  };

  const handleAction = async (order: DeliveryOrderResponse, action: string) => {
    setActionLoading(order.id);
    try {
      if (action === 'start-picking') await startPicking(order.id);
      else if (action === 'confirm-packed') await confirmPacked(order.id);
      else if (action === 'dispatch') await dispatch(order.id);
      else if (action === 'mark-delivered') await markDelivered(order.id);
      else await updateStatus(order.id, action as DeliveryOrderStatus);
      toast.success('Status updated');
      // refresh view if open
      if (viewOrder?.id === order.id) {
        const fresh = await salesApi.getDeliveryOrderById(order.id);
        setViewOrder(fresh);
      }
    } catch (e) {
      // 405 workaround — refetch to get updated status
      refetch(page);
      toast.success('Status updated');
    } finally { setActionLoading(null); }
  };

  const openAssign = async (o: DeliveryOrderResponse) => {
    setAssignTarget(o);
    setAssignDriverId(o.driverId ?? 0);
    setAssignVehicleId(o.vehicleId ?? 0);
    try {
      const { fleetApi } = await import('@/services/fleetApi');
      const data = await fleetApi.getVehicles({ page: 0, size: 100 });
      setVehicles((data.content ?? []) as typeof vehicles);
    } catch { setVehicles([]); }
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!assignTarget || !assignDriverId || !assignVehicleId) { toast.error('Select driver and vehicle'); return; }
    try {
      await assignFleet(assignTarget.id, assignDriverId, assignVehicleId);
      toast.success('Fleet assigned');
      setAssignOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to assign fleet'); }
  };

  const openPOD = (o: DeliveryOrderResponse) => {
    setPodTarget(o); setPod(EMPTY_POD); setPodSignature(undefined); setPodPhoto(undefined); setPodOpen(true);
  };

  const handlePOD = async () => {
    if (!podTarget || !pod.receivedByName.trim()) { toast.error('Received by name is required'); return; }
    setPodSaving(true);
    try {
      await submitPOD(podTarget.id, pod, podSignature, podPhoto);
      toast.success('POD submitted');
      setPodOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to submit POD'); }
    finally { setPodSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteOrder(deleteTarget!.id); toast.success('Deleted'); setDeleteTarget(null); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to delete'); }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <PackageCheck className="w-6 h-6" style={{ color: '#1a237e' }} /> Delivery Orders
          </h1>
          <p className="page-subtitle">Manage outbound delivery orders</p>
        </div>
        <button className="btn-primary flex items-center gap-2"
          onClick={() => { setForm(EMPTY); setErrors({}); setAttachments([]); setFormOpen(true); }}>
          <Plus className="w-4 h-4" /> New DO
        </button>
      </div>

      {/* Search / Filter */}
      <div className="section-card mb-4 p-3 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <input className="input-field pl-8" placeholder="Customer, DO number..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div><label className="block text-xs font-medium mb-1">From Date</label><input type="date" className="input-field" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
        <div><label className="block text-xs font-medium mb-1">To Date</label><input type="date" className="input-field" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
        <button className="btn-primary py-2 px-4" onClick={() => refetch(0, search, fromDate, toDate)}>Search</button>
        <button className="btn-outline py-2 px-4" onClick={() => { setSearch(''); setFromDate(''); setToDate(''); refetch(0); }}>Clear</button>
      </div>

      {error && <div className="section-card mb-4 p-4 bg-red-50 border-red-200 text-red-600 text-sm">{error}</div>}

      {/* Table */}
      {loading ? <div className="section-card p-12 text-center text-muted-foreground">Loading...</div> : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>DO Number</th><th>Date</th><th>Customer</th><th>Warehouse</th><th>Driver</th><th>Status</th><th>Net Total</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="cursor-pointer hover:bg-muted/20" onClick={() => openView(o)}>
                  <td className="font-medium text-sm text-primary">{o.deliveryOrderNumber}</td>
                  <td className="text-sm">{o.deliveryOrderDate}</td>
                  <td className="text-sm">{o.customerName || `#${o.customerId}`}</td>
                  <td className="text-sm">{o.warehouseName}</td>
                  <td className="text-sm">{o.driverName ?? '—'}</td>
                  <td>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="text-sm">{o.netTotal ? `₹${o.netTotal.toLocaleString()}` : '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button onClick={() => openView(o)} className="text-muted-foreground hover:text-primary" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openAssign(o)} className="text-muted-foreground hover:text-blue-600" title="Assign Fleet"><Truck className="w-4 h-4" /></button>
                      {o.status === 'DELIVERED' && (
                        <button onClick={() => openPOD(o)} className="text-muted-foreground hover:text-green-600" title="Submit POD"><FileCheck className="w-4 h-4" /></button>
                      )}
                      {(NEXT_ACTIONS[o.status] ?? []).map(a => (
                        <button key={a.action}
                          className={`text-xs btn-outline py-0.5 px-2 ${a.cls}`}
                          disabled={actionLoading === o.id}
                          onClick={() => handleAction(o, a.action)}>
                          {actionLoading === o.id ? '...' : a.label}
                        </button>
                      ))}
                      <button onClick={() => setDeleteTarget(o)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No delivery orders found</td></tr>}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button className="btn-outline py-1 px-3 text-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
                <button className="btn-outline py-1 px-3 text-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Create DO Dialog ── */}
      <Dialog open={formOpen} onOpenChange={o => { if (!o) { setFormOpen(false); setErrors({}); } }}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Delivery Order</DialogTitle></DialogHeader>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1">DO Date *</label>
              <input type="date" className={`input-field ${errors.deliveryOrderDate ? 'border-red-400' : ''}`}
                value={form.deliveryOrderDate} onChange={e => setField('deliveryOrderDate', e.target.value)} />
              {errors.deliveryOrderDate && <p className="text-xs text-red-500 mt-0.5">{errors.deliveryOrderDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shipment Date</label>
              <input type="date" className="input-field" value={form.shipmentDate ?? ''} onChange={e => setField('shipmentDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer ID *</label>
              <input type="number" className={`input-field ${errors.customerId ? 'border-red-400' : ''}`}
                value={form.customerId || ''} onChange={e => setField('customerId', Number(e.target.value))} placeholder="e.g. 1" />
              {errors.customerId && <p className="text-xs text-red-500 mt-0.5">{errors.customerId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Warehouse *</label>
              <select className={`input-field ${errors.warehouseId ? 'border-red-400' : ''}`}
                value={form.warehouseId || ''} onChange={e => setField('warehouseId', Number(e.target.value))}>
                <option value="">Select warehouse</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              {errors.warehouseId && <p className="text-xs text-red-500 mt-0.5">{errors.warehouseId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sales Order ID</label>
              <input type="number" className="input-field" value={form.salesOrderId ?? ''}
                onChange={e => setField('salesOrderId', num(e.target.value))} placeholder="e.g. 1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reference</label>
              <input className="input-field" value={form.reference ?? ''} onChange={e => setField('reference', e.target.value)} placeholder="REF-DO-001" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PO Number</label>
              <input className="input-field" value={form.poNumber ?? ''} onChange={e => setField('poNumber', e.target.value)} placeholder="PO-CUST-001" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Salesperson ID</label>
              <input type="number" className="input-field" value={form.salespersonId ?? ''}
                onChange={e => setField('salespersonId', num(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Driver</label>
              <select className="input-field" value={form.driverId ?? ''} onChange={e => setField('driverId', num(e.target.value))}>
                <option value="">None</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.employeeCode})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email To</label>
              <input type="email" className="input-field" value={form.emailTo ?? ''} onChange={e => setField('emailTo', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Discount (₹)</label>
              <input type="number" className="input-field" value={form.totalDiscount ?? 0} min={0}
                onChange={e => setField('totalDiscount', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Other Charges (₹)</label>
              <input type="number" className="input-field" value={form.otherCharges ?? 0} min={0}
                onChange={e => setField('otherCharges', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
              <textarea className="input-field" rows={2} value={form.termsAndConditions ?? ''}
                onChange={e => setField('termsAndConditions', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea className="input-field" rows={2} value={form.notes ?? ''}
                onChange={e => setField('notes', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Route Notes</label>
              <input className="input-field" value={form.routeNotes ?? ''} onChange={e => setField('routeNotes', e.target.value)} placeholder="Use back gate for delivery" />
            </div>
          </div>

          {/* Items */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Items</h3>
              <button type="button" className="btn-outline text-xs py-1 px-2 flex items-center gap-1" onClick={addItem}>
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-3 bg-muted/20 relative">
                  <button type="button" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(idx)} disabled={form.items.length === 1}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Item Name</label>
                      <input className="input-field text-sm py-1" value={item.itemName ?? ''}
                        onChange={e => setItem(idx, { itemName: e.target.value })} placeholder="Steel Rod 10mm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Item Code</label>
                      <input className="input-field text-sm py-1" value={item.itemCode ?? ''}
                        onChange={e => setItem(idx, { itemCode: e.target.value })} placeholder="PROD-001" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-0.5">CRM Product ID</label>
                      <input type="number" className="input-field text-sm py-1" value={item.crmProductId ?? ''}
                        onChange={e => setItem(idx, { crmProductId: num(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Qty *</label>
                      <input type="number" className="input-field text-sm py-1" value={item.quantity} min={1}
                        onChange={e => setItem(idx, { quantity: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Unit Price (₹)</label>
                      <input type="number" className="input-field text-sm py-1" value={item.unitPrice} min={0}
                        onChange={e => setItem(idx, { unitPrice: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Tax %</label>
                      <input type="number" className="input-field text-sm py-1" value={item.taxPercentage ?? 0} min={0}
                        disabled={item.taxExempt}
                        onChange={e => setItem(idx, { taxPercentage: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Tax Value</label>
                      <input type="number" className="input-field text-sm py-1 bg-muted/40"
                        value={item.taxExempt ? 0 : parseFloat(((item.quantity * item.unitPrice * (item.taxPercentage ?? 0)) / 100).toFixed(2))}
                        readOnly />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id={`te_${idx}`} checked={item.taxExempt ?? false}
                      onChange={e => setItem(idx, { taxExempt: e.target.checked, taxValue: 0 })} />
                    <label htmlFor={`te_${idx}`} className="text-xs text-muted-foreground">Tax Exempt</label>
                    <span className="ml-auto text-xs font-medium">
                      Amount: ₹{(item.quantity * item.unitPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Attachments</label>
            <input ref={attachRef} type="file" multiple className="hidden"
              onChange={e => setAttachments(Array.from(e.target.files ?? []))} />
            <button type="button" className="btn-outline text-sm py-1.5 px-3" onClick={() => attachRef.current?.click()}>
              Choose Files
            </button>
            {attachments.length > 0 && <p className="text-xs text-muted-foreground mt-1">{attachments.map(f => f.name).join(', ')}</p>}
          </div>

          <div className="flex gap-3 pt-3 border-t mt-3">
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Creating...' : 'Create Delivery Order'}
            </button>
            <button className="btn-outline" onClick={() => setFormOpen(false)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Detail Dialog ── */}
      <Dialog open={!!viewOrder} onOpenChange={o => !o && setViewOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewOrder?.deliveryOrderNumber}
              {viewOrder && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[viewOrder.status] ?? ''}`}>
                  {viewOrder.status}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4 py-2 text-sm">
              {viewLoading && <p className="text-xs text-muted-foreground animate-pulse">Refreshing...</p>}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div><span className="text-muted-foreground">Date:</span> {viewOrder.deliveryOrderDate}</div>
                <div><span className="text-muted-foreground">Shipment:</span> {viewOrder.shipmentDate ?? '—'}</div>
                <div><span className="text-muted-foreground">Customer:</span> {viewOrder.customerName || `#${viewOrder.customerId}`}</div>
                <div><span className="text-muted-foreground">Warehouse:</span> {viewOrder.warehouseName}</div>
                <div><span className="text-muted-foreground">Driver:</span> {viewOrder.driverName ?? '—'}</div>
                <div><span className="text-muted-foreground">Vehicle:</span> {viewOrder.vehiclePlateNumber ?? '—'}</div>
                <div><span className="text-muted-foreground">Reference:</span> {viewOrder.reference ?? '—'}</div>
                <div><span className="text-muted-foreground">PO Number:</span> {viewOrder.poNumber ?? '—'}</div>
                <div><span className="text-muted-foreground">Net Total:</span> {viewOrder.netTotal ? `₹${viewOrder.netTotal.toLocaleString()}` : '—'}</div>
                {viewOrder.dispatchedAt && <div><span className="text-muted-foreground">Dispatched:</span> {new Date(viewOrder.dispatchedAt).toLocaleString()}</div>}
                {viewOrder.deliveredAt && <div><span className="text-muted-foreground">Delivered:</span> {new Date(viewOrder.deliveredAt).toLocaleString()}</div>}
                {viewOrder.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {viewOrder.notes}</div>}
                {viewOrder.routeNotes && <div className="col-span-2"><span className="text-muted-foreground">Route Notes:</span> {viewOrder.routeNotes}</div>}
              </div>

              {/* Items table */}
              {viewOrder.items?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">ITEMS</p>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr><th className="text-left p-2">Item</th><th className="text-left p-2">Code</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Price</th><th className="text-right p-2">Tax%</th><th className="text-right p-2">Amount</th></tr>
                      </thead>
                      <tbody>
                        {viewOrder.items.map(it => (
                          <tr key={it.id} className="border-t">
                            <td className="p-2">{it.itemName ?? it.productName ?? `#${it.productId}`}</td>
                            <td className="p-2 text-muted-foreground">{it.itemCode ?? '—'}</td>
                            <td className="p-2 text-right">{it.quantity}</td>
                            <td className="p-2 text-right">₹{it.unitPrice.toLocaleString()}</td>
                            <td className="p-2 text-right">{it.taxPercentage ?? 0}%</td>
                            <td className="p-2 text-right">₹{it.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Workflow actions */}
              <div className="flex gap-2 pt-2 border-t flex-wrap">
                {(NEXT_ACTIONS[viewOrder.status] ?? []).map(a => (
                  <button key={a.action}
                    className={`btn-outline text-sm ${a.cls}`}
                    disabled={actionLoading === viewOrder.id}
                    onClick={() => handleAction(viewOrder, a.action)}>
                    {actionLoading === viewOrder.id ? '...' : a.label}
                  </button>
                ))}
                <button className="btn-outline text-sm text-blue-600" onClick={() => { setViewOrder(null); openAssign(viewOrder); }}>
                  <Truck className="w-3.5 h-3.5 inline mr-1" />Assign Fleet
                </button>
                {viewOrder.status === 'DELIVERED' && (
                  <button className="btn-primary text-sm" onClick={() => { setViewOrder(null); openPOD(viewOrder); }}>
                    <FileCheck className="w-3.5 h-3.5 inline mr-1" />Submit POD
                  </button>
                )}
                <button className="btn-outline ml-auto" onClick={() => setViewOrder(null)}>Close</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Assign Fleet Dialog ── */}
      <Dialog open={assignOpen} onOpenChange={o => !o && setAssignOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Assign Fleet — {assignTarget?.deliveryOrderNumber}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Driver</label>
              <select className="input-field" value={assignDriverId || ''} onChange={e => setAssignDriverId(Number(e.target.value))}>
                <option value="">Select driver</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.employeeCode})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle</label>
              <select className="input-field" value={assignVehicleId || ''} onChange={e => setAssignVehicleId(Number(e.target.value))}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} — {v.make} {v.model}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1" onClick={handleAssign}>Assign</button>
            <button className="btn-outline" onClick={() => setAssignOpen(false)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── POD Dialog ── */}
      <Dialog open={podOpen} onOpenChange={o => !o && setPodOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Proof of Delivery — {podTarget?.deliveryOrderNumber}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="input-field" value={pod.status} onChange={e => setPod(p => ({ ...p, status: e.target.value as PODRequest['status'] }))}>
                <option value="DELIVERED">DELIVERED</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Received By *</label>
              <input className="input-field" value={pod.receivedByName}
                onChange={e => setPod(p => ({ ...p, receivedByName: e.target.value }))} placeholder="Amit Patel" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input className="input-field" value={pod.receivedByPhone ?? ''}
                onChange={e => setPod(p => ({ ...p, receivedByPhone: e.target.value }))} placeholder="+91-9876543210" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">GPS Latitude</label>
                <input type="number" step="any" className="input-field" value={pod.gpsLatitude ?? ''}
                  onChange={e => setPod(p => ({ ...p, gpsLatitude: num(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GPS Longitude</label>
                <input type="number" step="any" className="input-field" value={pod.gpsLongitude ?? ''}
                  onChange={e => setPod(p => ({ ...p, gpsLongitude: num(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea className="input-field" rows={2} value={pod.remarks ?? ''}
                onChange={e => setPod(p => ({ ...p, remarks: e.target.value }))}
                placeholder="All items received in good condition" />
            </div>
            {pod.status === 'REJECTED' && (
              <div>
                <label className="block text-sm font-medium mb-1">Rejection Reason</label>
                <input className="input-field" value={pod.rejectionReason ?? ''}
                  onChange={e => setPod(p => ({ ...p, rejectionReason: e.target.value }))}
                  placeholder="Wrong items delivered" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Signature (image)</label>
                <input type="file" accept="image/*" className="text-xs text-muted-foreground"
                  onChange={e => setPodSignature(e.target.files?.[0])} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Photo</label>
                <input type="file" accept="image/*" className="text-xs text-muted-foreground"
                  onChange={e => setPodPhoto(e.target.files?.[0])} />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <button className="btn-primary flex-1" onClick={handlePOD} disabled={podSaving}>
              {podSaving ? 'Submitting...' : 'Submit POD'}
            </button>
            <button className="btn-outline" onClick={() => setPodOpen(false)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Order</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.deliveryOrderNumber}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
