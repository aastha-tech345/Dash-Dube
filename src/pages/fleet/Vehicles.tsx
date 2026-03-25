import { useState } from 'react';
import { Truck, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useVehicles, useDrivers } from '@/hooks/useFleet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { VehicleRequest, VehicleResponse } from '@/types/api';

const EMPTY: VehicleRequest = {
  plateNumber: '', vehicleType: 'TRUCK', make: '', model: '',
  year: new Date().getFullYear(), fuelType: 'DIESEL',
};

type Errors = Partial<Record<keyof VehicleRequest, string>>;

function validate(form: VehicleRequest): Errors {
  const e: Errors = {};
  if (!form.plateNumber.trim()) e.plateNumber = 'Plate number is required';
  if (!form.make.trim()) e.make = 'Make is required';
  if (!form.model.trim()) e.model = 'Model is required';
  if (!form.year || form.year < 1990 || form.year > new Date().getFullYear() + 1)
    e.year = 'Enter a valid year';
  return e;
}

// parse optional number — empty string → undefined
const num = (v: string) => v === '' ? undefined : Number(v);

export default function Vehicles() {
  const { vehicles, loading, error, page, setPage, totalPages, createVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const { drivers } = useDrivers();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VehicleRequest>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setForm(EMPTY); setErrors({}); setEditId(null); setOpen(true); };

  const openEdit = (v: VehicleResponse) => {
    setForm({
      plateNumber: v.plateNumber,
      vehicleType: v.vehicleType as VehicleRequest['vehicleType'],
      make: v.make,
      model: v.model,
      year: v.year,
      color: v.color,
      vinNumber: v.vinNumber,
      fuelType: v.fuelType as VehicleRequest['fuelType'],
      capacityWeight: v.capacityWeight,
      capacityVolume: v.capacityVolume,
      odometerReading: v.odometerReading,
      insuranceNumber: v.insuranceNumber,
      insuranceExpiry: v.insuranceExpiry,
      registrationExpiry: v.registrationExpiry,
      assignedDriverId: v.assignedDriverId,
      notes: v.notes,
    });
    setErrors({});
    setEditId(v.id);
    setOpen(true);
  };

  const setStr = (k: keyof VehicleRequest, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const setOptNum = (k: keyof VehicleRequest, v: string) =>
    setForm(f => ({ ...f, [k]: num(v) }));

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateVehicle(editId, form);
        toast.success('Vehicle updated');
      } else {
        await createVehicle(form);
        toast.success('Vehicle created');
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVehicle(deleteTarget!.id);
      toast.success('Vehicle deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete vehicle');
    }
  };

  const ErrMsg = ({ k }: { k: keyof VehicleRequest }) =>
    errors[k] ? <p className="text-xs text-red-500 mt-0.5">{errors[k]}</p> : null;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><Truck className="w-6 h-6" style={{ color: '#1a237e' }} /> Vehicles</h1>
          <p className="page-subtitle">Manage fleet vehicles</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Vehicle</button>
      </div>

      {error && <div className="section-card mb-4 p-4 bg-red-50 border-red-200 text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="section-card p-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Plate</th><th>Type</th><th>Make / Model</th><th>Year</th><th>Fuel</th><th>Capacity (kg)</th><th>Driver</th><th>Insurance Expiry</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td className="font-medium">{v.plateNumber}</td>
                  <td className="text-sm">{v.vehicleType}</td>
                  <td className="text-sm">{v.make} {v.model}</td>
                  <td className="text-sm">{v.year}</td>
                  <td className="text-xs">{v.fuelType}</td>
                  <td className="text-sm">{v.capacityWeight ?? '—'}</td>
                  <td className="text-sm">{v.assignedDriverName ?? '—'}</td>
                  <td className="text-xs">{v.insuranceExpiry ?? '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(v)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(v)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && <tr><td colSpan={9} className="text-center text-muted-foreground py-8">No vehicles found</td></tr>}
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

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setErrors({}); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">

            <div>
              <label className="block text-sm font-medium mb-1">Plate Number *</label>
              <input
                className={`input-field ${errors.plateNumber ? 'border-red-400' : ''}`}
                value={form.plateNumber}
                onChange={e => { setStr('plateNumber', e.target.value); setErrors(x => ({ ...x, plateNumber: undefined })); }}
              />
              <ErrMsg k="plateNumber" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Vehicle Type</label>
              <select className="input-field" value={form.vehicleType} onChange={e => setStr('vehicleType', e.target.value)}>
                {['TRUCK', 'VAN', 'BIKE', 'CAR', 'TEMPO'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Make *</label>
              <input
                className={`input-field ${errors.make ? 'border-red-400' : ''}`}
                value={form.make}
                onChange={e => { setStr('make', e.target.value); setErrors(x => ({ ...x, make: undefined })); }}
              />
              <ErrMsg k="make" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Model *</label>
              <input
                className={`input-field ${errors.model ? 'border-red-400' : ''}`}
                value={form.model}
                onChange={e => { setStr('model', e.target.value); setErrors(x => ({ ...x, model: undefined })); }}
              />
              <ErrMsg k="model" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Year *</label>
              <input
                type="number"
                className={`input-field ${errors.year ? 'border-red-400' : ''}`}
                value={form.year}
                onChange={e => { setForm(f => ({ ...f, year: Number(e.target.value) })); setErrors(x => ({ ...x, year: undefined })); }}
              />
              <ErrMsg k="year" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fuel Type</label>
              <select className="input-field" value={form.fuelType} onChange={e => setStr('fuelType', e.target.value)}>
                {['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input className="input-field" value={form.color ?? ''} onChange={e => setStr('color', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">VIN Number</label>
              <input className="input-field" value={form.vinNumber ?? ''} onChange={e => setStr('vinNumber', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Capacity Weight (kg)</label>
              <input type="number" className="input-field" value={form.capacityWeight ?? ''} onChange={e => setOptNum('capacityWeight', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Capacity Volume (m³)</label>
              <input type="number" className="input-field" value={form.capacityVolume ?? ''} onChange={e => setOptNum('capacityVolume', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Odometer (km)</label>
              <input type="number" className="input-field" value={form.odometerReading ?? ''} onChange={e => setOptNum('odometerReading', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assigned Driver</label>
              <select className="input-field" value={form.assignedDriverId ?? ''} onChange={e => setOptNum('assignedDriverId', e.target.value)}>
                <option value="">None</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.employeeCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Insurance No.</label>
              <input className="input-field" value={form.insuranceNumber ?? ''} onChange={e => setStr('insuranceNumber', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Insurance Expiry</label>
              <input type="date" className="input-field" value={form.insuranceExpiry ?? ''} onChange={e => setStr('insuranceExpiry', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Registration Expiry</label>
              <input type="date" className="input-field" value={form.registrationExpiry ?? ''} onChange={e => setStr('registrationExpiry', e.target.value)} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea className="input-field" rows={2} value={form.notes ?? ''} onChange={e => setStr('notes', e.target.value)} />
            </div>

          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>{deleteTarget?.plateNumber}</strong>? This cannot be undone.</AlertDialogDescription>
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
