import { useState, useRef, useEffect } from 'react';
import { UserCheck, Plus, Pencil, Trash2, Upload, Image as ImageIcon, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useDrivers } from '@/hooks/useFleet';
import { fleetApi } from '@/services/fleetApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { DriverRequest, DriverResponse } from '@/types/api';

// Fetches an image URL with auth token, returns a blob URL
function useAuthImage(url: string | null) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!url) { setSrc(null); return; }
    const token = localStorage.getItem('auth_token');
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.blob() : null)
      .then(blob => { if (blob) setSrc(URL.createObjectURL(blob)); })
      .catch(() => setSrc(null));
    return () => { setSrc(prev => { if (prev) URL.revokeObjectURL(prev); return null; }); };
  }, [url]);
  return src;
}

function DriverAvatar({ driver }: { driver: DriverResponse }) {
  const apiBase = import.meta.env.VITE_API_URL || '';
  const src = useAuthImage(driver.profileImageUrl ? `${apiBase}/api/fleet/drivers/${driver.id}/profile-image` : null);
  if (src) return <img src={src} alt={driver.name} className="w-8 h-8 rounded-full object-cover" />;
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
      {driver.name.charAt(0).toUpperCase()}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  ON_TRIP: 'bg-blue-100 text-blue-700',
  OFF_DUTY: 'bg-gray-100 text-gray-600',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
};

const STATUSES = ['', 'AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'ON_LEAVE'];

const EMPTY: DriverRequest = {
  employeeCode: '', name: '', phone: '', email: '', address: '',
  licenseNumber: '', licenseType: 'LMV', licenseExpiry: '',
  status: 'AVAILABLE', notes: '',
};

export default function Drivers() {
  const [statusFilter, setStatusFilter] = useState('');
  const { drivers, loading, error, page, setPage, totalPages, createDriver, updateDriver, deleteDriver, refetch } = useDrivers(statusFilter || undefined);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<DriverRequest>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DriverResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Profile image
  const [imageTarget, setImageTarget] = useState<DriverResponse | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // blob URL for new file
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Auth-fetched existing photo for dialog preview
  const existingPhotoUrl = useAuthImage(
    imageTarget?.profileImageUrl ? `/api/fleet/drivers/${imageTarget.id}/profile-image` : null
  );

  const openCreate = () => { setForm(EMPTY); setEditId(null); setEmailError(''); setOpen(true); };
  const openEdit = (d: DriverResponse) => {
    setForm({
      employeeCode: d.employeeCode, name: d.name, phone: d.phone,
      email: d.email ?? '', address: d.address ?? '',
      dateOfBirth: d.dateOfBirth, joiningDate: d.joiningDate,
      emergencyContact: d.emergencyContact,
      licenseNumber: d.licenseNumber,
      licenseType: d.licenseType as DriverRequest['licenseType'],
      licenseExpiry: d.licenseExpiry, status: d.status,
      assignedVehicleId: d.assignedVehicleId,
      notes: d.notes ?? '',
    });
    setEditId(d.id);
    setEmailError('');
    setOpen(true);
  };

  const set = (k: keyof DriverRequest, v: string | number | undefined) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (emailError) return;
    setSaving(true);
    try {
      if (editId) {
        await updateDriver(editId, form);
        toast.success('Driver updated');
      } else {
        await createDriver(form);
        toast.success('Driver created');
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save driver');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDriver(deleteTarget!.id);
      toast.success('Driver deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete driver');
    }
  };

  // ── Profile image ──────────────────────────────────────────────────────────
  const openImageDialog = (d: DriverResponse) => {
    setImageTarget(d);
    setImageFile(null);
    // Show existing photo via the GET profile-image endpoint
    setImagePreview(d.profileImageUrl ? `/api/fleet/drivers/${d.id}/profile-image` : null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!imageTarget || !imageFile) return;
    setUploadingImage(true);
    try {
      await fleetApi.uploadDriverProfileImage(imageTarget.id, imageFile);
      toast.success('Profile image uploaded');
      setImageTarget(null);
      setImageFile(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <UserCheck className="w-6 h-6" style={{ color: '#1a237e' }} /> Drivers
          </h1>
          <p className="page-subtitle">Manage fleet drivers</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              statusFilter === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {error && <div className="section-card mb-4 p-4 bg-red-50 border-red-200 text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="section-card p-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Photo</th><th>Code</th><th>Name</th><th>Phone</th>
                <th>License No.</th><th>Type</th><th>Expiry</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d.id}>
                  <td>
                    <DriverAvatar driver={d} />
                  </td>
                  <td className="font-medium text-sm">{d.employeeCode}</td>
                  <td>{d.name}</td>
                  <td className="text-sm">{d.phone}</td>
                  <td className="text-sm">{d.licenseNumber}</td>
                  <td className="text-xs">{d.licenseType}</td>
                  <td className="text-xs">{d.licenseExpiry}</td>
                  <td>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button title="Upload photo" onClick={() => openImageDialog(d)} className="text-muted-foreground hover:text-primary">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button title="Edit" onClick={() => openEdit(d)} className="text-muted-foreground hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button title="Delete" onClick={() => setDeleteTarget(d)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr><td colSpan={9} className="text-center text-muted-foreground py-8">No drivers found</td></tr>
              )}
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

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Driver' : 'Add Driver'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Employee Code *</label>
              <input
                className={`input-field ${editId ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={form.employeeCode}
                onChange={e => set('employeeCode', e.target.value)}
                disabled={!!editId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                {['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'ON_LEAVE'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                className="input-field" inputMode="tel" placeholder="+91-9999999999"
                value={form.phone}
                onChange={e => { if (/^\+?[\d\s\-]*$/.test(e.target.value)) set('phone', e.target.value); }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                className={`input-field ${emailError ? 'border-red-400' : ''}`}
                inputMode="email" placeholder="example@email.com"
                value={form.email ?? ''}
                onChange={e => {
                  set('email', e.target.value);
                  setEmailError(e.target.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) ? 'Invalid email' : '');
                }}
              />
              {emailError && <p className="text-xs text-red-500 mt-0.5">{emailError}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input className="input-field" value={form.address ?? ''} onChange={e => set('address', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input type="date" className="input-field" value={form.dateOfBirth ?? ''} onChange={e => set('dateOfBirth', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Joining Date</label>
              <input type="date" className="input-field" value={form.joiningDate ?? ''} onChange={e => set('joiningDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Number *</label>
              <input className="input-field" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Type</label>
              <select className="input-field" value={form.licenseType} onChange={e => set('licenseType', e.target.value)}>
                {['LMV', 'HMV', 'HPMV', 'TRANS'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Expiry *</label>
              <input type="date" className="input-field" value={form.licenseExpiry} onChange={e => set('licenseExpiry', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Emergency Contact</label>
              <input className="input-field" value={form.emergencyContact ?? ''} onChange={e => set('emergencyContact', e.target.value)} />
            </div>
            {editId && (
              <div>
                <label className="block text-sm font-medium mb-1">Assigned Vehicle ID</label>
                <input
                  type="number" className="input-field" placeholder="Optional"
                  value={form.assignedVehicleId ?? ''}
                  onChange={e => set('assignedVehicleId', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            )}
            <div className={editId ? '' : 'col-span-2'}>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea className="input-field" rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            {editId && (
              <button
                type="button"
                className="btn-outline flex items-center gap-1"
                onClick={() => {
                  const driver = drivers.find(d => d.id === editId);
                  if (driver) { setOpen(false); openImageDialog(driver); }
                }}
              >
                <Upload className="w-4 h-4" /> Photo
              </button>
            )}
            <button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Profile Image Dialog ── */}
      <Dialog open={!!imageTarget} onOpenChange={o => { if (!o) setImageTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Profile Image — {imageTarget?.name}</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {(imagePreview || existingPhotoUrl) ? (
              <img src={imagePreview ?? existingPhotoUrl!} alt="Preview" className="w-32 h-32 rounded-full object-cover border" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center text-3xl text-muted-foreground">
                {imageTarget?.name.charAt(0).toUpperCase()}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button className="btn-outline flex items-center gap-2 w-full justify-center" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" /> Choose Image
            </button>
            {imageFile && (
              <button className="btn-primary w-full" onClick={handleImageUpload} disabled={uploadingImage}>
                {uploadingImage ? 'Uploading...' : 'Upload'}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
