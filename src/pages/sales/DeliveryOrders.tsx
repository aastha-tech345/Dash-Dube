import { useState, useRef } from 'react';
import { PackageCheck, Plus, Trash2, Pencil, Eye, Search, Truck, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { salesApi } from '@/services/salesApi';
import { useDrivers } from '@/hooks/useFleet';
import { useWarehouses } from '@/hooks/useWarehouses';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { DeliveryOrderRequest, DeliveryOrderResponse, DeliveryOrderStatus, DeliveryOrderItem, PODRequest } from '@/types/api';

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

const EMPTY_ITEM: DeliveryOrderItem = { quantity: 1, unitPrice: 0 };

const EMPTY: DeliveryOrderRequest = {
  deliveryOrderDate: new Date().toISOString().split('T')[0],
  customerId: 0, warehouseId: 0, status: 'DRAFT', items: [],
};

const EMPTY_POD: PODRequest = { status: 'DELIVERED', receivedByName: '' };

type FormErrors = { deliveryOrderDate?: string; customerId?: string; warehouseId?: string };

function validate(f: DeliveryOrderRequest): FormErrors {
  const e: FormErrors = {};
  if (!f.deliveryOrderDate) e.deliveryOrderDate = 'Date is required';
  if (!f.customerId) e.customerId = 'Customer ID is required';
  if (!f.warehouseId) e.warehouseId = 'Warehouse ID is required';
  return e;
}

export default function DeliveryOrders() {
  const { orders, loading, error, page, setPage, totalPages, refetch,
    createOrder, updateStatus, assignFleet,
    startPicking, confirmPacked, dispatch, markDelivered,
    submitPOD, deleteOrder } = useDeliveryOrders();

  const { drivers } = useDrivers();
  const { warehouses } = useWarehouses();

  // search/filter
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // form
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<DeliveryOrderRequest>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const attachRef = useRef<HTMLInputElement>(null);

  // view
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

  const set = (k: keyof DeliveryOrderRequest, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof FormErrors]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const setItem = (i: number, k: keyof DeliveryOrderItem, v: unknown) =>
    setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await createOrder(form, attachments.length ? attachments : undefined);
      toast.success('Delivery order created');
      setFormOpen(false); setForm(EMPTY); setErrors({}); setAttachments([]);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to create'); }
    finally { setSaving(false); }
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
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Action failed'); }
    finally { setActionLoading(null); }
  };

  const openAssign = async (o: DeliveryOrderResponse) => {
    setAssignTarget(o);
    setAssignDriverId(o.driverId ?? 0);
    setAssignVehicleId(o.vehicleId ?? 0);
    // fetch vehicles lazily
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

  const handleSearch = () => refetch(0);

  const NEXT_ACTIONS: Record<string, { label: string; action: string }[]> = {
    DRAFT: [{ label: 'Confirm', action: 'CONFIRMED' }, { label: 'Start Picking', action: 'start-picking' }],
    CONFIRMED: [{ label: 'Start Picking', action: 'start-picking' }],
    PICKING: [{ label: 'Confirm Packed', action: 'confirm-packed' }],
    PACKED: [{ label: 'Dispatch', action: 'dispatch' }],
    DISPATCHED: [{ label: 'Out for Delivery', action: 'OUT_FOR_DELIVERY' }],
    OUT_FOR_DELIVERY: [{ label: 'Mark Delivered', action: 'mark-delivered' }],
  };

  const ErrMsg = ({ k }: { k: keyof FormErrors }) =>
    errors[k] ? <p className="text-xs text-red-500 mt-0.5">{errors[k]}</p> : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><PackageCheck className="w-6 h-6" style={{ color: '#1a237e' }} /> Delivery Orders</h1>
          <p className="page-subtitle">Manage outbound delivery orders</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm(EMPTY); setErrors({}); setAttachments([]); setFormOpen(true); }}><Plus className="w-4 h-4" /> New DO</button>
      </div>

      {/* Search / Filter */}
      <div className="section-card mb-4 p-3 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium mb-1">Search</label>
          <div className="relative"><Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" /><input className="input-field pl-8" placeholder="Customer, DO number..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div><label className="block text-xs font-medium mb-1">From Date</label><input type="date" className="input-field" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
        <div><label className="block text-xs font-medium mb-1">To Date</label><input type="date" className="input-field" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
        <button className="btn-primary py-2 px-4" onClick={handleSearch}>Search</button>
        <button className="btn-outline py-2 px-4" onClick={() => { setSearch(''); setFromDate(''); setToDate(''); refetch(0); }}>Clear</button>
      </div>

      {error && <div className="section-card mb-4 p-4 bg-red-50 border-red-200 text-red-600 text-sm">{error}</div>}

      {/* Table */}
      {loading ? <div className="section-card p-12 text-center text-muted-foreground">Loading...</div> : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>DO Number</th><th>Date</th><th>Customer</th><th>Warehouse</th><th>Driver</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="font-medium text-sm text-primary">{o.deliveryOrderNumber}</td>
                  <td className="text-sm">{o.deliveryOrderDate}</td>
                  <td className="text-sm">{o.customerName}</td>
                  <td className="text-sm">{o.warehouseName}</td>
                  <td className="text-sm">{o.driverName ?? '—'}</td>
                  <td><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>{o.status}</span></td>
                  <td>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button onClick={() => openView(o)} className="text-muted-foreground hover:text-primary" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openAssign(o)} className="text-muted-foreground hover:text-primary" title="Assign Fleet"><Truck className="w-4 h-4" /></button>
                      {o.status === 'DELIVERED' && (
                        <button onClick={() => openPOD(o)} className="text-muted-foreground hover:text-green-600" title="Submit POD"><FileCheck className="w-4 h-4" /></button>
                      )}
                      {(NEXT_ACTIONS[o.status] ?? []).map(a => (
                        <button key={a.action} className="text-xs btn-outline py-0.5 px-2" disabled={actionLoading === o.id} onClick={() => handleAction(o, a.action)}>{a.label}</button>
                      ))}
                      <button onClick={() => setDeleteTarget(o)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No delivery orders found</td></tr>}
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

      {/* Create DO Dialog */}
      <Dialog open={formOpen} onOpenChange={o => { if (!o) { setFormOpen(false); setErrors({}); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Delivery Order</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">DO Date *</label>
                <input type="date" className={`input-field ${errors.deliveryOrderDate ? 'border-red-400' : ''}`} value={form.deliveryOrderDate} onChange={e => set('deliveryOrderDate', e.target.value)} />
                <ErrMsg k="deliveryOrderDate" />
              </div>
              <div><label className="block text-sm font-medium mb-1">Shipment Date</label><input type="date" className="input-field" value={form.shipmentDate ?? ''} onChange={e => set('shipmentDate', e.target.value)} /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer ID *</label>
                <input type="number" className={`input-field ${errors.customerId ? 'border-red-400' : ''}`} value={form.customerId || ''} onChange={e => set('customerId', Number(e.target.value))} />
                <ErrMsg k="customerId" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Warehouse *</label>
                <select className={`input-field ${errors.warehouseId ? 'border-red-400' : ''}`} value={form.warehouseId || ''} onChange={e => set('warehouseId', Number(e.target.value))}>
                  <option value="">Select warehouse</option>
                  {(warehouses as unknown as { id: number; name: string }[]).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <ErrMsg k="warehouseId" />
              </div>
              <div><label className="block text-sm font-medium mb-1">Sales Order ID</label><input type="number" className="input-field" value={form.salesOrderId ?? ''} onChange={e => set('salesOrderId', e.target.value ? Number(e.target.value) : undefined)} /></div>
              <div><label className="block text-sm font-medium mb-1">Reference</label><input className="input-field" value={form.reference ?? ''} onChange={e => set('reference', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1">PO Number</label><input className="input-field" value={form.poNumber ?? ''} onChange={e => set('poNumber', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1">Salesperson ID</label><input type="number" className="input-field" value={form.salespersonId ?? ''} onChange={e => set('salespersonId', e.target.value ? Number(e.target.value) : undefined)} /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Driver</label>
                <select className="input-field" value={form.driverId ?? ''} onChange={e => set('driverId', e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">None</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.employeeCode})</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Other Charges</label><input type="number" className="input-field" value={form.otherCharges ?? ''} onChange={e => set('otherCharges', e.target.value ? Number(e.target.value) : undefined)} /></div>
              <div><label className="block text-sm font-medium mb-1">Total Discount</label><input type="number" className="input-field" value={form.totalDiscount ?? ''} onChange={e => set('totalDiscount', e.target.value ? Number(e.target.value) : undefined)} /></div>
              <div className="col-span-2"><label className="block text-sm font-medium mb-1">Notes</label><textarea className="input-field" rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} /></div>
              <div className="col-span-2"><label className="block text-sm font-medium mb-1">Route Notes</label><input className="input-field" value={form.routeNotes ?? ''} onChange={e => set('routeNotes', e.target.value)} /></div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Items ({form.items.length})</label>
                <button type="button" className="btn-outline text-xs py-1 px-3 flex items-center gap-1" onClick={addItem}><Plus className="w-3 h-3" /> Add Item</button>
              </div>
              {form.items.length === 0 && <div className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-lg">No items added</div>}
              <div className="space-y-2">
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 items-end border rounded-lg p-2 bg-muted/20">
                    <div><label className="block text-xs font-medium mb-0.5">Product ID</label><input type="number" className="input-field text-sm py-1.5" value={item.productId ?? ''} onChange={e => setItem(i, 'productId', e.target.value ? Number(e.target.value) : undefined)} /></div>
                    <div><label className="block text-xs font-medium mb-0.5">Qty</label><input type="number" className="input-field text-sm py-1.5" value={item.quantity} onChange={e => setItem(i, 'quantity', Number(e.target.value))} /></div>
                    <div><label className="block text-xs font-medium mb-0.5">Unit Price</label><input type="number" className="input-field text-sm py-1.5" value={item.unitPrice} onChange={e => setItem(i, 'unitPrice', Number(e.target.value))} /></div>
                    <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 pb-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium mb-1">Attachments</label>
              <input ref={attachRef} type="file" multiple className="hidden" onChange={e => setAttachments(Array.from(e.target.files ?? []))} />
              <button type="button" className="btn-outline text-sm py-1.5 px-3" onClick={() => attachRef.current?.click()}>Choose Files</button>
              {attachments.length > 0 && <p className="text-xs text-muted-foreground mt-1">{attachments.map(f => f.name).join(', ')}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
            <button className="btn-outline" onClick={() => setFormOpen(false)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={o => !o && setViewOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Delivery Order Details</DialogTitle></DialogHeader>
          {viewOrder && (
            <div className="space-y-4 py-2 text-sm">
              {viewLoading && <p className="text-xs text-muted-foreground">Refreshing...</p>}
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">DO Number</p><p className="font-medium">{viewOrder.deliveryOrderNumber}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[viewOrder.status] ?? ''}`}>{viewOrder.status}</span></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p>{viewOrder.deliveryOrderDate}</p></div>
                <div><p className="text-xs text-muted-foreground">Shipment Date</p><p>{viewOrder.shipmentDate ?? '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Customer</p><p>{viewOrder.customerName}</p></div>
                <div><p className="text-xs text-muted-foreground">Warehouse</p><p>{viewOrder.warehouseName}</p></div>
                <div><p className="text-xs text-muted-foreground">Driver</p><p>{viewOrder.driverName ?? '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Vehicle</p><p>{viewOrder.vehiclePlateNumber ?? '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Reference</p><p>{viewOrder.reference ?? '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Net Total</p><p>{viewOrder.netTotal ? `₹${viewOrder.netTotal.toLocaleString()}` : '—'}</p></div>
                {viewOrder.dispatchedAt && <div><p className="text-xs text-muted-foreground">Dispatched At</p><p>{new Date(viewOrder.dispatchedAt).toLocaleString()}</p></div>}
                {viewOrder.deliveredAt && <div><p className="text-xs text-muted-foreground">Delivered At</p><p>{new Date(viewOrder.deliveredAt).toLocaleString()}</p></div>}
                {viewOrder.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground">Notes</p><p>{viewOrder.notes}</p></div>}
                {viewOrder.routeNotes && <div className="col-span-2"><p className="text-xs text-muted-foreground">Route Notes</p><p>{viewOrder.routeNotes}</p></div>}
              </div>
              {viewOrder.items?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">ITEMS</p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50"><tr><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Price</th><th className="text-right p-2">Amount</th></tr></thead>
                      <tbody>
                        {viewOrder.items.map(it => (
                          <tr key={it.id} className="border-t">
                            <td className="p-2">{it.itemName ?? it.productName ?? `Product #${it.productId}`}</td>
                            <td className="p-2 text-right">{it.quantity}</td>
                            <td className="p-2 text-right">₹{it.unitPrice.toLocaleString()}</td>
                            <td className="p-2 text-right">₹{it.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t">
                {viewOrder.status === 'DELIVERED' && (
                  <button className="btn-primary flex-1" onClick={() => { setViewOrder(null); openPOD(viewOrder); }}>Submit POD</button>
                )}
                <button className="btn-outline flex-1" onClick={() => setViewOrder(null)}>Close</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Fleet Dialog */}
      <Dialog open={assignOpen} onOpenChange={o => !o && setAssignOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Assign Fleet</DialogTitle></DialogHeader>
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

      {/* POD Dialog */}
      <Dialog open={podOpen} onOpenChange={o => !o && setPodOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Submit Proof of Delivery</DialogTitle></DialogHeader>
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
              <input className="input-field" value={pod.receivedByName} onChange={e => setPod(p => ({ ...p, receivedByName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input className="input-field" value={pod.receivedByPhone ?? ''} onChange={e => setPod(p => ({ ...p, receivedByPhone: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium mb-1">GPS Latitude</label><input type="number" step="any" className="input-field" value={pod.gpsLatitude ?? ''} onChange={e => setPod(p => ({ ...p, gpsLatitude: e.target.value ? Number(e.target.value) : undefined }))} /></div>
              <div><label className="block text-sm font-medium mb-1">GPS Longitude</label><input type="number" step="any" className="input-field" value={pod.gpsLongitude ?? ''} onChange={e => setPod(p => ({ ...p, gpsLongitude: e.target.value ? Number(e.target.value) : undefined }))} /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Remarks</label><textarea className="input-field" rows={2} value={pod.remarks ?? ''} onChange={e => setPod(p => ({ ...p, remarks: e.target.value }))} /></div>
            {pod.status === 'REJECTED' && (
              <div><label className="block text-sm font-medium mb-1">Rejection Reason</label><input className="input-field" value={pod.rejectionReason ?? ''} onChange={e => setPod(p => ({ ...p, rejectionReason: e.target.value }))} /></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Signature</label>
                <input type="file" accept="image/*" className="input-field text-xs py-1.5" onChange={e => setPodSignature(e.target.files?.[0])} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Photo</label>
                <input type="file" accept="image/*" className="input-field text-xs py-1.5" onChange={e => setPodPhoto(e.target.files?.[0])} />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <button className="btn-primary flex-1" onClick={handlePOD} disabled={podSaving}>{podSaving ? 'Submitting...' : 'Submit POD'}</button>
            <button className="btn-outline" onClick={() => setPodOpen(false)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Order</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>{deleteTarget?.deliveryOrderNumber}</strong>? This cannot be undone.</AlertDialogDescription>
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
