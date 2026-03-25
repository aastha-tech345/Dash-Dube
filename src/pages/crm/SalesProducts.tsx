import { useState } from 'react';
import { ShoppingBag, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCrmProducts } from '@/hooks/useCrmProducts';
import { crmApi } from '@/services/crmApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { CrmSalesProductRequest, CrmSalesProductResponse } from '@/types/api';

const EMPTY: CrmSalesProductRequest = {
  itemType: 'PRODUCT', isPurchase: true, isSales: true,
  itemCode: '', name: '', purchasePrice: 0, salesPrice: 0,
};

type Errors = Partial<Record<keyof CrmSalesProductRequest, string>>;

function validate(form: CrmSalesProductRequest): Errors {
  const e: Errors = {};
  if (!form.itemCode.trim()) e.itemCode = 'Item code is required';
  if (!form.name.trim()) e.name = 'Name is required';
  if (form.purchasePrice < 0) e.purchasePrice = 'Must be ≥ 0';
  if (form.salesPrice < 0) e.salesPrice = 'Must be ≥ 0';
  return e;
}

export default function SalesProducts() {
  const { products, loading, error, page, setPage, totalPages, createProduct, updateProduct, deleteProduct } = useCrmProducts();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CrmSalesProductRequest>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<CrmSalesProductResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const openCreate = () => { setForm(EMPTY); setEditId(null); setImageFile(undefined); setErrors({}); setOpen(true); };

  const openEdit = async (p: CrmSalesProductResponse) => {
    setEditId(p.id);
    setImageFile(undefined);
    setErrors({});
    setOpen(true);
    // prefill with list data immediately, then refresh with server data
    const prefill = (data: CrmSalesProductResponse) => setForm({
      itemType: data.itemType,
      isPurchase: data.isPurchase === true || (data.isPurchase as unknown) === 'true',
      isSales: data.isSales === true || (data.isSales as unknown) === 'true',
      itemCode: data.itemCode,
      name: data.name,
      description: data.description,
      unitOfMeasure: data.unitOfMeasure,
      reorderLimit: data.reorderLimit,
      vatClassificationCode: data.vatClassificationCode,
      purchasePrice: data.purchasePrice,
      salesPrice: data.salesPrice,
      tax: data.tax,
      taxRate: data.taxRate,
    });
    prefill(p);
    try {
      const fresh = await crmApi.getSalesProductById(p.id);
      prefill(fresh);
    } catch { /* keep list data */ }
  };

  const set = (k: keyof CrmSalesProductRequest, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const setNum = (k: keyof CrmSalesProductRequest, v: string) => {
    if (v === '') { set(k, undefined); return; }
    const n = Number(v);
    set(k, isNaN(n) ? undefined : n);
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editId) { await updateProduct(editId, form, imageFile); toast.success('Product updated'); }
      else { await createProduct(form, imageFile); toast.success('Product created'); }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save product');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><ShoppingBag className="w-6 h-6" style={{ color: '#1a237e' }} /> CRM Sales Products</h1>
          <p className="page-subtitle">Products and services used in quotations and sales</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      {error && <div className="section-card mb-4 p-4 bg-red-50 border-red-200 text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="section-card p-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>UoM</th><th>Purchase Price</th><th>Sales Price</th><th>Tax</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="font-medium text-sm">{p.itemCode}</td>
                  <td>{p.name}</td>
                  <td><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p.itemType}</span></td>
                  <td className="text-sm">{p.unitOfMeasure ?? '—'}</td>
                  <td className="text-sm">₹{p.purchasePrice.toLocaleString()}</td>
                  <td className="text-sm">₹{p.salesPrice.toLocaleString()}</td>
                  <td className="text-xs">{p.tax ?? '—'} {p.taxRate ? `(${p.taxRate}%)` : ''}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(p)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No products found</td></tr>}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Item Code *</label>
              <input className={`input-field ${errors.itemCode ? 'border-red-400' : ''}`} value={form.itemCode} onChange={e => set('itemCode', e.target.value)} />
              {errors.itemCode && <p className="text-xs text-red-500 mt-0.5">{errors.itemCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
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
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Unit of Measure</label><input className="input-field" value={form.unitOfMeasure ?? ''} onChange={e => set('unitOfMeasure', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Reorder Limit</label><input type="number" className="input-field" value={form.reorderLimit ?? ''} onChange={e => setNum('reorderLimit', e.target.value)} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Purchase Price *</label>
              <input type="number" className={`input-field ${errors.purchasePrice ? 'border-red-400' : ''}`} value={form.purchasePrice} onChange={e => set('purchasePrice', Number(e.target.value))} />
              {errors.purchasePrice && <p className="text-xs text-red-500 mt-0.5">{errors.purchasePrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sales Price *</label>
              <input type="number" className={`input-field ${errors.salesPrice ? 'border-red-400' : ''}`} value={form.salesPrice} onChange={e => set('salesPrice', Number(e.target.value))} />
              {errors.salesPrice && <p className="text-xs text-red-500 mt-0.5">{errors.salesPrice}</p>}
            </div>
            <div><label className="block text-sm font-medium mb-1">Tax Name</label><input className="input-field" value={form.tax ?? ''} onChange={e => set('tax', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Tax Rate (%)</label><input type="number" className="input-field" value={form.taxRate ?? ''} onChange={e => setNum('taxRate', e.target.value)} /></div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Product Image</label>
              <input type="file" accept="image/*" className="input-field text-sm" onChange={e => setImageFile(e.target.files?.[0])} />
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <input type="checkbox" id="isPurchase" checked={form.isPurchase} onChange={e => set('isPurchase', e.target.checked)} />
              <label htmlFor="isPurchase" className="text-sm">For Purchase</label>
              <input type="checkbox" id="isSales" checked={form.isSales} onChange={e => set('isSales', e.target.checked)} className="ml-4" />
              <label htmlFor="isSales" className="text-sm">For Sales</label>
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
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
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
