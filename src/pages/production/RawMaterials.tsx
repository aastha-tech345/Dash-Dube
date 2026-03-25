import { useState, useRef } from 'react';
import { FlaskConical, Plus, Pencil, Trash2, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useRawMaterials } from '@/hooks/useProduction';
import { useProductionMeta } from '@/hooks/useProductionMeta';
import { productionApi } from '@/services/productionApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { RawMaterialRequest, RawMaterialResponse } from '@/types/api';

const EMPTY: RawMaterialRequest = {
  itemCode: '', name: '', itemType: 'PRODUCT',
  forPurchase: true, forSales: false, purchasePrice: 0,
};

type Errors = Partial<Record<keyof RawMaterialRequest, string>>;

function validate(form: RawMaterialRequest): Errors {
  const e: Errors = {};
  if (!form.itemCode.trim()) e.itemCode = 'Item code is required';
  if (!form.name.trim()) e.name = 'Name is required';
  if (form.purchasePrice < 0) e.purchasePrice = 'Must be ≥ 0';
  return e;
}

export default function RawMaterials() {
  const { items, loading, error, page, setPage, totalPages, create, update, remove } = useRawMaterials();
  const { categories, taxes } = useProductionMeta();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RawMaterialRequest>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<RawMaterialResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const bulkRef = useRef<HTMLInputElement>(null);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      const blob = await productionApi.exportRawMaterials();
      downloadBlob(blob, 'raw-materials.xlsx');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await productionApi.downloadBulkTemplate();
      downloadBlob(blob, 'raw-materials-template.xlsx');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Template download failed');
    }
  };

  const openCreate = () => { setEditId(null); setErrors({}); setForm(EMPTY); setImageFile(undefined); setOpen(true); };

  const openEdit = async (r: RawMaterialResponse) => {
    setOpen(true);
    let data = r;
    try { data = await productionApi.getRawMaterialById(r.id); } catch { /* fallback */ }
    setForm({
      itemCode: data.itemCode,
      name: data.name,
      itemType: data.itemType as 'PRODUCT' | 'SERVICE',
      forPurchase: data.forPurchase === true || (data.forPurchase as unknown) === 'true',
      forSales: data.forSales === true || (data.forSales as unknown) === 'true',
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId,
      barcode: data.barcode,
      description: data.description,
      issueUnitId: data.issueUnitId,
      purchaseUnitId: data.purchaseUnitId,
      unitRelation: data.unitRelation,
      reorderLimit: data.reorderLimit,
      taxId: data.taxId,
      purchasePrice: data.purchasePrice,
      salesPrice: data.salesPrice,
      stockQuantity: data.stockQuantity,
      discontinued: data.discontinued === true || (data.discontinued as unknown) === 'true',
    });
    setEditId(data.id);
    setImageFile(undefined);
    setErrors({});
  };

  const set = (k: keyof RawMaterialRequest, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const setNum = (k: keyof RawMaterialRequest, v: string) => {
    if (v === '') { set(k, undefined); return; }
    const n = Number(v);
    set(k, isNaN(n) ? undefined : n);
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editId) {
        await update(editId, form, imageFile);
        toast.success('Raw material updated');
      } else {
        await create(form, imageFile);
        toast.success('Raw material created');
      }
      setOpen(false);
      setForm(EMPTY);
      setEditId(null);
      setImageFile(undefined);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      toast.success('Raw material deleted');
      setDeleteTarget(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      toast.error(msg.startsWith('405') ? 'Delete not supported by server' : (msg || 'Failed to delete'));
      setDeleteTarget(null);
    }
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await productionApi.bulkImportRawMaterials(file);
      toast.success('Bulk import successful');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bulk import failed');
    } finally {
      if (bulkRef.current) bulkRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><FlaskConical className="w-6 h-6" style={{ color: '#1a237e' }} /> Raw Materials</h1>
          <p className="page-subtitle">Manage production raw materials</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex items-center gap-1 text-sm py-1.5 px-3" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4" /> Template
          </button>
          <button className="btn-outline flex items-center gap-1 text-sm py-1.5 px-3" onClick={() => bulkRef.current?.click()}>
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <input ref={bulkRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleBulkImport} />
          <button className="btn-outline flex items-center gap-1 text-sm py-1.5 px-3" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Material</button>
        </div>
      </div>

      {error && <div className="section-card mb-4 p-4 bg-red-50 border-red-200 text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="section-card p-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Code</th><th>Name</th><th>Type</th><th>Category</th><th>Tax</th><th>Purchase Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id}>
                  <td className="font-medium text-sm">{r.itemCode}</td>
                  <td>{r.name}</td>
                  <td className="text-xs">{r.itemType}</td>
                  <td className="text-sm">{r.categoryName ?? r.categoryId ?? '—'}</td>
                  <td className="text-sm">{r.taxName ?? r.taxCode ?? r.taxId ?? '—'}</td>
                  <td className="text-sm">₹{r.purchasePrice.toLocaleString()}</td>
                  <td className="text-sm font-medium">{r.stockQuantity}</td>
                  <td><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.discontinued ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{r.discontinued ? 'Discontinued' : 'Active'}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(r)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={9} className="text-center text-muted-foreground py-8">No raw materials found</td></tr>}
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

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditId(null); setForm(EMPTY); setImageFile(undefined); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Raw Material' : 'Add Raw Material'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Item Code *</label>
              <input className={`input-field ${errors.itemCode ? 'border-red-400' : ''}`} value={form.itemCode} onChange={e => set('itemCode', e.target.value)} />
              {errors.itemCode && <p className="text-xs text-red-500 mt-0.5">{errors.itemCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Item Type</label>
              <select className="input-field" value={form.itemType} onChange={e => set('itemType', e.target.value)}>
                <option value="PRODUCT">PRODUCT</option>
                <option value="SERVICE">SERVICE</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input className={`input-field ${errors.name ? 'border-red-400' : ''}`} value={form.name} onChange={e => set('name', e.target.value)} />
              {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="input-field" rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purchase Price *</label>
              <input type="number" className={`input-field ${errors.purchasePrice ? 'border-red-400' : ''}`} value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value === '' ? 0 : Number(e.target.value))} />
              {errors.purchasePrice && <p className="text-xs text-red-500 mt-0.5">{errors.purchasePrice}</p>}
            </div>
            <div><label className="block text-sm font-medium mb-1">Sales Price</label><input type="number" className="input-field" value={form.salesPrice ?? ''} onChange={e => setNum('salesPrice', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Stock Qty</label><input type="number" className="input-field" value={form.stockQuantity ?? ''} onChange={e => setNum('stockQuantity', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Reorder Limit</label><input type="number" className="input-field" value={form.reorderLimit ?? ''} onChange={e => setNum('reorderLimit', e.target.value)} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="input-field" value={form.categoryId ?? ''} onChange={e => setNum('categoryId', e.target.value)}>
                <option value="">— Select —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Sub Category ID</label><input type="number" className="input-field" value={form.subCategoryId ?? ''} onChange={e => setNum('subCategoryId', e.target.value)} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Tax</label>
              <select className="input-field" value={form.taxId ?? ''} onChange={e => setNum('taxId', e.target.value)}>
                <option value="">— Select —</option>
                {taxes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.percentage}%)</option>)}
              </select>
            </div>            <div><label className="block text-sm font-medium mb-1">Issue Unit ID</label><input type="number" className="input-field" value={form.issueUnitId ?? ''} onChange={e => setNum('issueUnitId', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Purchase Unit ID</label><input type="number" className="input-field" value={form.purchaseUnitId ?? ''} onChange={e => setNum('purchaseUnitId', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Unit Relation</label><input type="number" className="input-field" value={form.unitRelation ?? ''} onChange={e => setNum('unitRelation', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Barcode</label><input className="input-field" value={form.barcode ?? ''} onChange={e => set('barcode', e.target.value)} /></div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Image</label>
              <input type="file" accept="image/*" className="input-field text-sm" onChange={e => setImageFile(e.target.files?.[0])} />
            </div>
            <div className="flex items-center gap-4 col-span-2">
              {([['forPurchase', 'For Purchase'], ['forSales', 'For Sales'], ['discontinued', 'Discontinued']] as [keyof RawMaterialRequest, string][]).map(([k, label]) => (
                <label key={k} className="flex items-center gap-1 text-sm cursor-pointer">
                  <input type="checkbox" checked={Boolean(form[k])} onChange={e => set(k, e.target.checked)} />
                  {label}
                </label>
              ))}
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
            <AlertDialogTitle>Delete Raw Material</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</AlertDialogDescription>
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
