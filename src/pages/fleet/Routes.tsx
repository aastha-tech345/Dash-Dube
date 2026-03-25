import { useState } from 'react';
import { MapPin, Plus, ChevronDown, ChevronUp, Trash2, Pencil, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useRoutes, useDrivers, useVehicles } from '@/hooks/useFleet';
import { fleetApi } from '@/services/fleetApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { RouteRequest, RouteResponse, RouteStop } from '@/types/api';

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STOP_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  ARRIVED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

type FormErrors = { routeName?: string; driverId?: string; vehicleId?: string; routeDate?: string };

const EMPTY_STOP: RouteStop = {
  deliveryOrderId: 0, stopOrder: 1, customerName: '', address: '',
  latitude: undefined, longitude: undefined, estimatedArrival: '',
};

const EMPTY: RouteRequest = {
  routeName: '', driverId: 0, vehicleId: 0,
  routeDate: new Date().toISOString().split('T')[0],
  status: 'PLANNED', totalDistanceKm: undefined, estimatedDurationMins: undefined, stops: [],
};

function validate(form: RouteRequest): FormErrors {
  const e: FormErrors = {};
  if (!form.routeName.trim()) e.routeName = 'Route name is required';
  if (!form.driverId) e.driverId = 'Driver is required';
  if (!form.vehicleId) e.vehicleId = 'Vehicle is required';
  if (!form.routeDate) e.routeDate = 'Route date is required';
  return e;
}

function routeToRequest(r: RouteResponse): RouteRequest {
  return {
    routeName: r.routeName,
    driverId: r.driverId,
    vehicleId: r.vehicleId,
    routeDate: r.routeDate,
    status: r.status as RouteRequest['status'],
    totalDistanceKm: r.totalDistanceKm,
    estimatedDurationMins: r.estimatedDurationMins,
    stops: r.stops?.map(s => ({
      deliveryOrderId: s.deliveryOrderId,
      stopOrder: s.stopOrder,
      customerName: s.customerName,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
      estimatedArrival: s.estimatedArrival ?? '',
    })) ?? [],
  };
}

export default function Routes() {
  const { routes, loading, error, createRoute, updateRoute, deleteRoute, refetch } = useRoutes();
  const { drivers } = useDrivers();
  const { vehicles } = useVehicles();

  const [formOpen, setFormOpen] = useState(false);
  const [viewRoute, setViewRoute] = useState<RouteResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RouteResponse | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RouteRequest>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});

  const openCreate = () => { setForm(EMPTY); setErrors({}); setEditId(null); setFormOpen(true); };

  const openView = async (r: RouteResponse) => {
    setViewRoute(r); // show immediately with existing data
    try {
      const fresh = await fleetApi.getRouteById(r.id);
      setViewRoute(fresh);
    } catch { /* keep existing data */ }
  };
  const openEdit = (r: RouteResponse) => { setForm(routeToRequest(r)); setErrors({}); setEditId(r.id); setFormOpen(true); };

  const set = (k: keyof RouteRequest, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof FormErrors]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const addStop = () => setForm(f => ({
    ...f, stops: [...f.stops, { ...EMPTY_STOP, stopOrder: f.stops.length + 1 }],
  }));

  const removeStop = (idx: number) => setForm(f => ({
    ...f, stops: f.stops.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stopOrder: i + 1 })),
  }));

  const setStop = (idx: number, k: keyof RouteStop, v: unknown) => setForm(f => ({
    ...f, stops: f.stops.map((s, i) => i === idx ? { ...s, [k]: v } : s),
  }));

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateRoute(editId, form);
        toast.success('Route updated');
      } else {
        await createRoute(form);
        toast.success('Route created');
      }
      setFormOpen(false);
      setForm(EMPTY);
      setErrors({});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save route');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRoute(deleteTarget!.id);
      toast.success('Route deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete route');
    }
  };

  const handleStopAction = async (stopId: number, action: 'arrive' | 'complete') => {
    try {
      if (action === 'arrive') await fleetApi.markStopArrived(stopId);
      else await fleetApi.markStopCompleted(stopId);
      toast.success(action === 'arrive' ? 'Marked as arrived' : 'Stop completed');
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    }
  };

  const ErrMsg = ({ k }: { k: keyof FormErrors }) =>
    errors[k] ? <p className="text-xs text-red-500 mt-0.5">{errors[k]}</p> : null;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><MapPin className="w-6 h-6" style={{ color: '#1a237e' }} /> Routes</h1>
          <p className="page-subtitle">Plan and track delivery routes</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Create Route</button>
      </div>

      {error && <div className="section-card mb-4 p-4 bg-red-50 border-red-200 text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="section-card p-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-3">
          {routes.map(r => (
            <div key={r.id} className="section-card">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                >
                  <div>
                    <div className="font-medium">{r.routeName}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.routeDate} · {r.driverName} · {r.vehiclePlateNumber}
                      {r.totalDistanceKm ? ` · ${r.totalDistanceKm} km` : ''}
                      {r.estimatedDurationMins ? ` · ${r.estimatedDurationMins} mins` : ''}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                  <span className="text-xs text-muted-foreground">{r.stops?.length ?? 0} stops</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => openView(r)} className="text-muted-foreground hover:text-primary" title="View"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => openEdit(r)} className="text-muted-foreground hover:text-primary" title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(r)} className="text-muted-foreground hover:text-destructive" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="text-muted-foreground">
                    {expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expanded === r.id && (
                <div className="mt-4 border-t pt-4 space-y-2">
                  {r.stops?.length > 0 ? r.stops.map(stop => (
                    <div key={stop.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="text-sm font-medium">#{stop.stopOrder} — {stop.customerName}</div>
                        <div className="text-xs text-muted-foreground">{stop.address}</div>
                        {stop.estimatedArrival && <div className="text-xs text-muted-foreground">ETA: {new Date(stop.estimatedArrival).toLocaleString()}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STOP_STATUS_COLORS[stop.status] ?? ''}`}>{stop.status}</span>
                        {stop.status === 'PENDING' && (
                          <button className="text-xs btn-outline py-1 px-2" onClick={() => handleStopAction(stop.id, 'arrive')}>Mark Arrived</button>
                        )}
                        {stop.status === 'ARRIVED' && (
                          <button className="text-xs btn-primary py-1 px-2" onClick={() => handleStopAction(stop.id, 'complete')}>Complete</button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-2">No stops</p>
                  )}
                </div>
              )}
            </div>
          ))}
          {routes.length === 0 && <div className="section-card p-12 text-center text-muted-foreground">No routes found</div>}
        </div>
      )}

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={formOpen} onOpenChange={o => { if (!o) { setFormOpen(false); setErrors({}); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Route' : 'Create Route'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Route Name *</label>
              <input className={`input-field ${errors.routeName ? 'border-red-400' : ''}`} placeholder="e.g. Bengaluru South Route - Morning" value={form.routeName} onChange={e => set('routeName', e.target.value)} />
              <ErrMsg k="routeName" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Driver *</label>
                <select className={`input-field ${errors.driverId ? 'border-red-400' : ''}`} value={form.driverId || ''} onChange={e => set('driverId', Number(e.target.value))}>
                  <option value="">Select driver</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.employeeCode})</option>)}
                </select>
                <ErrMsg k="driverId" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle *</label>
                <select className={`input-field ${errors.vehicleId ? 'border-red-400' : ''}`} value={form.vehicleId || ''} onChange={e => set('vehicleId', Number(e.target.value))}>
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} — {v.make} {v.model}</option>)}
                </select>
                <ErrMsg k="vehicleId" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Route Date *</label>
                <input type="date" className={`input-field ${errors.routeDate ? 'border-red-400' : ''}`} value={form.routeDate} onChange={e => set('routeDate', e.target.value)} />
                <ErrMsg k="routeDate" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Distance (km)</label>
                <input type="number" className="input-field" placeholder="45.5" value={form.totalDistanceKm ?? ''} onChange={e => set('totalDistanceKm', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (mins)</label>
                <input type="number" className="input-field" placeholder="120" value={form.estimatedDurationMins ?? ''} onChange={e => set('estimatedDurationMins', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>
            {editId && (
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                  {['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Stops ({form.stops.length})</label>
                <button type="button" className="btn-outline text-xs py-1 px-3 flex items-center gap-1" onClick={addStop}><Plus className="w-3 h-3" /> Add Stop</button>
              </div>
              {form.stops.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">No stops added yet.</div>
              )}
              <div className="space-y-3">
                {form.stops.map((stop, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Stop #{stop.stopOrder}</span>
                      <button type="button" onClick={() => removeStop(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-0.5">Delivery Order ID</label>
                        <input type="number" className="input-field text-sm py-1.5" placeholder="DO ID" value={stop.deliveryOrderId || ''} onChange={e => setStop(idx, 'deliveryOrderId', Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-0.5">Customer Name</label>
                        <input className="input-field text-sm py-1.5" placeholder="Customer name" value={stop.customerName} onChange={e => setStop(idx, 'customerName', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Address</label>
                      <input className="input-field text-sm py-1.5" placeholder="Delivery address" value={stop.address} onChange={e => setStop(idx, 'address', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-0.5">Latitude</label>
                        <input type="number" step="any" className="input-field text-sm py-1.5" placeholder="12.8996" value={stop.latitude ?? ''} onChange={e => setStop(idx, 'latitude', e.target.value ? Number(e.target.value) : undefined)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-0.5">Longitude</label>
                        <input type="number" step="any" className="input-field text-sm py-1.5" placeholder="77.5963" value={stop.longitude ?? ''} onChange={e => setStop(idx, 'longitude', e.target.value ? Number(e.target.value) : undefined)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-0.5">Est. Arrival</label>
                        <input type="datetime-local" className="input-field text-sm py-1.5" value={stop.estimatedArrival ?? ''} onChange={e => setStop(idx, 'estimatedArrival', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editId ? 'Update Route' : 'Create Route'}</button>
            <button className="btn-outline" onClick={() => setFormOpen(false)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={!!viewRoute} onOpenChange={o => !o && setViewRoute(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Route Details</DialogTitle></DialogHeader>
          {viewRoute && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Route Name</p><p className="font-medium">{viewRoute.routeName}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[viewRoute.status] ?? ''}`}>{viewRoute.status}</span></div>
                <div><p className="text-xs text-muted-foreground">Driver</p><p>{viewRoute.driverName}</p></div>
                <div><p className="text-xs text-muted-foreground">Vehicle</p><p>{viewRoute.vehiclePlateNumber}</p></div>
                <div><p className="text-xs text-muted-foreground">Route Date</p><p>{viewRoute.routeDate}</p></div>
                <div><p className="text-xs text-muted-foreground">Distance</p><p>{viewRoute.totalDistanceKm ? `${viewRoute.totalDistanceKm} km` : '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Duration</p><p>{viewRoute.estimatedDurationMins ? `${viewRoute.estimatedDurationMins} mins` : '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Total Stops</p><p>{viewRoute.stops?.length ?? 0}</p></div>
              </div>
              {viewRoute.stops?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">STOPS</p>
                  <div className="space-y-2">
                    {viewRoute.stops.map(stop => (
                      <div key={stop.id} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">#{stop.stopOrder} — {stop.customerName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STOP_STATUS_COLORS[stop.status] ?? ''}`}>{stop.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{stop.address}</p>
                        {stop.estimatedArrival && <p className="text-xs text-muted-foreground">ETA: {new Date(stop.estimatedArrival).toLocaleString()}</p>}
                        {stop.arrivedAt && <p className="text-xs text-muted-foreground">Arrived: {new Date(stop.arrivedAt).toLocaleString()}</p>}
                        {stop.completedAt && <p className="text-xs text-muted-foreground">Completed: {new Date(stop.completedAt).toLocaleString()}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t">
                <button className="btn-primary flex-1" onClick={() => { setViewRoute(null); openEdit(viewRoute); }}>Edit Route</button>
                <button className="btn-outline" onClick={() => setViewRoute(null)}>Close</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>{deleteTarget?.routeName}</strong>? This cannot be undone.</AlertDialogDescription>
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
