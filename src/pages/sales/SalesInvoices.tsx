import { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { salesApi } from '@/services/salesApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { SalesInvoiceRequest, SalesInvoiceResponse } from '@/types/api';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  OPEN: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  PARTIAL: 'bg-yellow-100 text-yellow-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const EMPTY: SalesInvoiceRequest = {
  invoiceDate: new Date().toISOString().split('T')[0],
  customerId: 0,
  saleType: 'CREDIT',
  status: 'OPEN',
  items: [],
};

type Errors = Partial<Record<keyof SalesInvoiceRequest, string>>;

function validate(form: SalesInvoiceRequest): Errors {
  const e: Errors = {};
  if (!form.invoiceDate) e.invoiceDate = 'Date is required';
  if (!form.customerId) e.customerId = 'Customer is required';
  return e;
}

export default function SalesInvoices() {
  const [invoices, setInvoices] = useState<SalesInvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SalesInvoiceRequest>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SalesInvoiceResponse | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchInvoices = async (p = page) => {
    setLoading(true);
    salesApi.getSalesInvoices({ page: p, size: 10 })
      .then(data => {
        setInvoices(data.content ?? (data as unknown as SalesInvoiceResponse[]));
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(e => toast.error(e instanceof Error ? e.message : 'Failed to fetch invoices'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInvoices(page); }, [page]);

  const set = (k: keyof SalesInvoiceRequest, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const handleCreate = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await salesApi.createSalesInvoice(form);
      toast.success('Invoice created');
      setOpen(false);
      setForm(EMPTY);
      fetchInvoices(page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create invoice');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await salesApi.deleteSalesInvoice(deleteTarget.id);
      toast.success('Invoice deleted');
      setDeleteTarget(null);
      fetchInvoices(page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete invoice');
    }
  };

  const downloadPdf = (id: number) => {
    window.open(salesApi.getSalesInvoicePdfUrl(id), '_blank');
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><Receipt className="w-6 h-6" style={{ color: '#1a237e' }} /> Sales Invoices</h1>
          <p className="page-subtitle">Manage sales invoices</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm(EMPTY); setErrors({}); setOpen(true); }}><Plus className="w-4 h-4" /> New Invoice</button>
      </div>

      {loading ? (
        <div className="section-card p-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Invoice #</th><th>Date</th><th>Customer</th><th>Type</th><th>Status</th><th>Net Total</th><th>Actions</th></tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="font-medium text-sm">{inv.invoiceNumber}</td>
                  <td className="text-sm">{inv.invoiceDate}</td>
                  <td>{inv.customerName}</td>
                  <td className="text-xs">{inv.saleType}</td>
                  <td><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>{inv.status}</span></td>
                  <td className="text-sm">₹{(inv.netTotal ?? 0).toLocaleString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => downloadPdf(inv.id)} className="text-muted-foreground hover:text-primary" title="Download PDF"><Download className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(inv)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No invoices found</td></tr>}
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
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Sales Invoice</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Invoice Date *</label>
              <input type="date" className={`input-field ${errors.invoiceDate ? 'border-red-400' : ''}`} value={form.invoiceDate} onChange={e => set('invoiceDate', e.target.value)} />
              {errors.invoiceDate && <p className="text-xs text-red-500 mt-0.5">{errors.invoiceDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer ID *</label>
              <input type="number" className={`input-field ${errors.customerId ? 'border-red-400' : ''}`} value={form.customerId || ''} onChange={e => set('customerId', Number(e.target.value))} />
              {errors.customerId && <p className="text-xs text-red-500 mt-0.5">{errors.customerId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sale Type</label>
              <select className="input-field" value={form.saleType} onChange={e => set('saleType', e.target.value)}>
                <option value="CREDIT">CREDIT</option>
                <option value="CASH">CASH</option>
                <option value="ADVANCE">ADVANCE</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Due Date</label><input type="date" className="input-field" value={form.dueDate ?? ''} onChange={e => set('dueDate', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Order Number</label><input className="input-field" value={form.orderNumber ?? ''} onChange={e => set('orderNumber', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Reference</label><input className="input-field" value={form.reference ?? ''} onChange={e => set('reference', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Notes</label><textarea className="input-field" rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} /></div>
            <p className="text-xs text-muted-foreground">Items can be added after creation.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
            <button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>{deleteTarget?.invoiceNumber}</strong>? This cannot be undone.</AlertDialogDescription>
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
