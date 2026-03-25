import { useState, useEffect } from 'react';
import { FileText, Plus, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { salesApi } from '@/services/salesApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { QuotationRequest, QuotationResponse, QuotationStatus } from '@/types/api';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-orange-100 text-orange-700',
  CONVERTED: 'bg-purple-100 text-purple-700',
};

const EMPTY: QuotationRequest = {
  quotationDate: new Date().toISOString().split('T')[0],
  customerId: 0,
  status: 'DRAFT',
  items: [],
};

type Errors = Partial<Record<keyof QuotationRequest, string>>;

function validate(form: QuotationRequest): Errors {
  const e: Errors = {};
  if (!form.quotationDate) e.quotationDate = 'Date is required';
  if (!form.customerId) e.customerId = 'Customer is required';
  return e;
}

export default function Quotations() {
  const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<QuotationRequest>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<QuotationResponse | null>(null);
  const [convertingId, setConvertingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchQuotations = async (p = page) => {
    try {
      setLoading(true);
      const data = await salesApi.getQuotations({ page: p, size: 10 });
      setQuotations(data.content ?? (data as unknown as QuotationResponse[]));
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to fetch quotations');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQuotations(page); }, [page]);

  const set = (k: keyof QuotationRequest, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const handleCreate = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await salesApi.createQuotation(form);
      toast.success('Quotation created');
      setOpen(false);
      setForm(EMPTY);
      fetchQuotations(page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create quotation');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id: number, status: QuotationStatus) => {
    try {
      const q = await salesApi.updateQuotationStatus(id, status);
      setQuotations(prev => prev.map(x => x.id === id ? q : x));
      toast.success(`Status updated to ${status}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

  const handleConvert = async (id: number) => {
    setConvertingId(id);
    try {
      await salesApi.createSalesOrderFromQuotation(id);
      toast.success('Converted to Sales Order');
      fetchQuotations(page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to convert quotation');
    } finally { setConvertingId(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await salesApi.deleteQuotation(deleteTarget.id);
      toast.success('Quotation deleted');
      setDeleteTarget(null);
      fetchQuotations(page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete quotation');
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><FileText className="w-6 h-6" style={{ color: '#1a237e' }} /> Quotations</h1>
          <p className="page-subtitle">Manage sales quotations</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm(EMPTY); setErrors({}); setOpen(true); }}><Plus className="w-4 h-4" /> New Quotation</button>
      </div>

      {loading ? (
        <div className="section-card p-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Number</th><th>Date</th><th>Customer</th><th>Status</th><th>Net Total</th><th>Actions</th></tr></thead>
            <tbody>
              {quotations.map(q => (
                <tr key={q.id}>
                  <td className="font-medium text-sm">{q.quotationNumber}</td>
                  <td className="text-sm">{q.quotationDate}</td>
                  <td>{q.customerName}</td>
                  <td><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[q.status] ?? 'bg-gray-100 text-gray-600'}`}>{q.status}</span></td>
                  <td className="text-sm">₹{(q.netTotal ?? 0).toLocaleString()}</td>
                  <td>
                    <div className="flex gap-2 items-center">
                      {q.status === 'DRAFT' && (
                        <button onClick={() => handleStatusChange(q.id, 'SENT')} className="text-xs text-blue-600 hover:underline">Send</button>
                      )}
                      {q.status === 'SENT' && (
                        <button onClick={() => handleStatusChange(q.id, 'ACCEPTED')} className="text-xs text-green-600 hover:underline">Accept</button>
                      )}
                      {q.status === 'ACCEPTED' && (
                        <button onClick={() => handleConvert(q.id)} disabled={convertingId === q.id} className="text-xs btn-primary py-0.5 px-2 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />{convertingId === q.id ? '...' : 'Convert'}
                        </button>
                      )}
                      <button onClick={() => setDeleteTarget(q)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {quotations.length === 0 && <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No quotations found</td></tr>}
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
          <DialogHeader><DialogTitle>New Quotation</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Quotation Date *</label>
              <input type="date" className={`input-field ${errors.quotationDate ? 'border-red-400' : ''}`} value={form.quotationDate} onChange={e => set('quotationDate', e.target.value)} />
              {errors.quotationDate && <p className="text-xs text-red-500 mt-0.5">{errors.quotationDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer ID *</label>
              <input type="number" className={`input-field ${errors.customerId ? 'border-red-400' : ''}`} value={form.customerId || ''} onChange={e => set('customerId', Number(e.target.value))} />
              {errors.customerId && <p className="text-xs text-red-500 mt-0.5">{errors.customerId}</p>}
            </div>
            <div><label className="block text-sm font-medium mb-1">Expiry Date</label><input type="date" className="input-field" value={form.expiryDate ?? ''} onChange={e => set('expiryDate', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Reference</label><input className="input-field" value={form.reference ?? ''} onChange={e => set('reference', e.target.value)} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="input-field" value={form.quotationType ?? 'STANDARD'} onChange={e => set('quotationType', e.target.value)}>
                <option value="STANDARD">STANDARD</option>
                <option value="PROFORMA">PROFORMA</option>
                <option value="REVISED">REVISED</option>
              </select>
            </div>
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
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>{deleteTarget?.quotationNumber}</strong>? This cannot be undone.</AlertDialogDescription>
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
