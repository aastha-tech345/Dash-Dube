import { useState } from 'react';
import { Package2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useFinishedGoods } from '@/hooks/useProduction';
import { useProductionMeta } from '@/hooks/useProductionMeta';
import { productionApi } from '@/services/productionApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { FinishedGoodRequest, FinishedGoodResponse } from '@/types/api';

const EMPTY: FinishedGoodRequest = {
  name: '', itemCode: '', itemType: 'PRODUCT',
  forPurchase: false, forSales: true, purchasePrice: 0, salesPrice: 0,
};

type Errors = Partial<Record<keyof FinishedGoodRequest, string>>;

function validate(form: FinishedGoodRequest): Errors {
  const e: Errors = {};
  if (!form.itemCode.trim()) e.itemCode = 'Item code is required';
  if (!form.name.trim()) e.name = 'Name is required';
  if (form.purchasePrice < 0) e.purchasePrice = 'Must be ≥ 0';
  if (form.salesPrice < 0) e.salesPrice = 'Must be ≥ 0';
  return e;
}

export default function FinishedGoods() {
  const { items, loading, error, page, setPage, totalPages, create, update, remove } = useFinishedGoods();
  const { categories, taxes } = useProductionMeta();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FinishedGoodRequest>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinishedGoodResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const openCreate = () => { setEditId(null); setErrors({}); setForm(EMPTY); setOpen(true); };
  const openEdit = async (r: FinishedGoodResponse) => {
    setOpen(true);
    let data = r;
    try { data = await productionApi.getFinishedGoodById(r.id); } catch { /* fallback to list data */ }
    setForm({
      name: data.name,
      itemCode: data.itemCode,
      barcode: data.barcode,
      hsnSacCode: data.hsnSacCode,
      description: data.description,
      inventoryTypeId: data.inventoryTypeId,
      itemType: data.itemType as 'PRODUCT' | 'SERVICE',
      forPurchase: data.forPurchase === true || (data.forPurchase as unknown) === 'true',
      forSales: data.forSales === true || (data.forSales as unknown) === 'true',
      isTaxInclusive: (data.taxInclusive ?? data.isTaxInclusive) === true
        || ((data.taxInclusive ?? data.isTaxInclusive) as unknown) === 'true',
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId,
      issueUnitId: data.issueUnitId,
      purchaseUnitId: data.purchaseUnitId,
      taxId: data.taxId ?? undefined,
      unitRelation: data.unitRelation,
      tolerancePercentage: data.tolerancePercentage,
      reorderLimit: data.reorderLimit,
      stockQuantity: data.stockQuantity,
      purchasePrice: data.purchasePrice,
      salesPrice: data.salesPrice,
    });
    setEditId(data.id);
    setErrors({});
  };

  const set = (k: keyof FinishedGoodRequest, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const setNum = (k: keyof FinishedGoodRequest, v: string) => {
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
        await update(editId, form);
        toast.success('Item updated');
      } else {
        await create(form);
        toast.success('Item created');
      }
      setOpen(false);
      setForm(EMPTY);
      setEditId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save item');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      toast.success('Item deleted');
      setDeleteTarget(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.startsWith('405') || msg.includes('Method Not Allowed')) {
        toast.error('Server does not support delete for this item. Contact backend team.');
      } else {
        toast.error(msg || 'Failed to delete item');
      }
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><Package2 className="w-6 h-6" style={{ color: '#1a237e' }} /> Finished Goods</h1>
          <p className="page-subtitle">Manage finished production goods</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Item</button>
      </div>

      {error && <div className="section-card mb-4 p-4 bg-red-50 border-red-200 text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="section-card p-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Code</th><th>Name</th><th>HSN/SAC</th><th>Purchase Price</th><th>Sales Price</th><th>Stock</th><th>Reorder</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id}>
                  <td className="font-medium text-sm">{r.itemCode}</td>
                  <td>{r.name}</td>
                  <td className="text-xs">{r.hsnSacCode ?? '—'}</td>
                  <td className="text-sm">₹{r.purchasePrice.toLocaleString()}</td>
                  <td className="text-sm">₹{r.salesPrice.toLocaleString()}</td>
                  <td className="text-sm font-medium">{r.stockQuantity}</td>
                  <td className="text-sm">{r.reorderLimit ?? '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(r)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No finished goods found</td></tr>}
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
          <DialogHeader><DialogTitle>{editId ? 'Edit Item' : 'Add Finished Good'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Item Code *</label>
              <input className={`input-field ${errors.itemCode ? 'border-red-400' : ''}`} value={form.itemCode} onChange={e => set('itemCode', e.target.value)} />
              {errors.itemCode && <p className="text-xs text-red-500 mt-0.5">{errors.itemCode}</p>}
            </div>
            <div><label className="block text-sm font-medium mb-1">HSN/SAC Code</label><input className="input-field" value={form.hsnSacCode ?? ''} onChange={e => set('hsnSacCode', e.target.value)} /></div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input className={`input-field ${errors.name ? 'border-red-400' : ''}`} value={form.name} onChange={e => set('name', e.target.value)} />
              {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
            </div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value)} /></div>
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
            <div><label className="block text-sm font-medium mb-1">Stock Qty</label><input type="number" className="input-field" value={form.stockQuantity ?? ''} onChange={e => setNum('stockQuantity', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Reorder Limit</label><input type="number" className="input-field" value={form.reorderLimit ?? ''} onChange={e => setNum('reorderLimit', e.target.value)} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="input-field" value={form.categoryId ?? ''} onChange={e => setNum('categoryId', e.target.value)}>
                <option value="">— Select —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tax</label>
              <select className="input-field" value={form.taxId ?? ''} onChange={e => setNum('taxId', e.target.value)}>
                <option value="">— Select —</option>
                {taxes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.percentage}%)</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Tolerance %</label><input type="number" className="input-field" value={form.tolerancePercentage ?? ''} onChange={e => setNum('tolerancePercentage', e.target.value)} /></div>
            <div className="flex items-center gap-3 col-span-2 flex-wrap">
              {([['forPurchase', 'For Purchase'], ['forSales', 'For Sales'], ['isTaxInclusive', 'Tax Inclusive']] as [keyof FinishedGoodRequest, string][]).map(([k, label]) => (
                <label key={k} className="flex items-center gap-1 text-sm">
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
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
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
