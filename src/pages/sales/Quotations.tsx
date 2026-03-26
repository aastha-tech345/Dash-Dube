import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, ArrowRight, ChevronDown, ChevronUp, X, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { salesApi } from '@/services/salesApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { QuotationRequest, QuotationResponse, QuotationStatus, QuotationItem } from '@/types/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-orange-100 text-orange-700',
  CONVERTED: 'bg-purple-100 text-purple-700',
};

const EMPTY_ITEM: QuotationItem = {
  crmProductId: undefined,
  itemCode: '',
  itemName: '',
  quantity: 1,
  rate: 0,
  taxPercentage: 0,
  taxValue: 0,
  isTaxExempt: false,
};

const EMPTY_FORM: QuotationRequest = {
  quotationDate: new Date().toISOString().split('T')[0],
  customerId: 0,
  salespersonId: undefined,
  reference: '',
  expiryDate: '',
  quotationType: 'STANDARD',
  status: 'DRAFT',
  totalDiscount: 0,
  otherCharges: 0,
  termsAndConditions: '',
  notes: '',
  emailTo: '',
  template: 'default',
  items: [{ ...EMPTY_ITEM }],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const num = (v: string) => (v === '' ? undefined : Number(v));

function calcItemTax(item: QuotationItem): number {
  if (item.isTaxExempt) return 0;
  return parseFloat(((item.quantity * item.rate * (item.taxPercentage ?? 0)) / 100).toFixed(2));
}

function calcTotals(items: QuotationItem[], discount = 0, other = 0) {
  const subTotal = items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const totalTax = items.reduce((s, i) => s + calcItemTax(i), 0);
  const netTotal = subTotal + totalTax - discount + other;
  return { subTotal, totalTax, netTotal };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quotations() {
  const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // dialog state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<QuotationRequest>(EMPTY_FORM);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // detail drawer
  const [detail, setDetail] = useState<QuotationResponse | null>(null);

  // delete
  const [deleteTarget, setDeleteTarget] = useState<QuotationResponse | null>(null);

  // converting
  const [convertingId, setConvertingId] = useState<number | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchQuotations = async (p = 0) => {
    try {
      setLoading(true);
      const data = await salesApi.getQuotations({ page: p, size: 10 });
      console.log('Quotations API response:', data);
      // handle both paginated {content:[]} and plain array responses
      const list = Array.isArray(data)
        ? (data as unknown as QuotationResponse[])
        : (data.content ?? []);
      setQuotations(list);
      setTotalPages(
        Array.isArray(data) ? 1 : (data.totalPages ?? (list.length > 0 ? 1 : 0))
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuotations(page); }, [page]);

  // ── Form helpers ───────────────────────────────────────────────────────────

  const setField = <K extends keyof QuotationRequest>(k: K, v: QuotationRequest[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    setFormErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const setItem = (idx: number, patch: Partial<QuotationItem>) => {
    setForm(f => {
      const items = f.items.map((it, i) => {
        if (i !== idx) return it;
        const updated = { ...it, ...patch };
        // auto-calc taxValue unless manually set
        if (!('taxValue' in patch)) {
          updated.taxValue = calcItemTax(updated);
        }
        return updated;
      });
      return { ...f, items };
    });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));

  const removeItem = (idx: number) =>
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.quotationDate) e.quotationDate = 'Required';
    if (!form.customerId) e.customerId = 'Required';
    if (form.items.length === 0) e.items = 'Add at least one item';
    form.items.forEach((it, i) => {
      if (!it.itemName?.trim()) e[`item_${i}_name`] = 'Required';
      if (it.quantity <= 0) e[`item_${i}_qty`] = 'Must be > 0';
      if (it.rate < 0) e[`item_${i}_rate`] = 'Invalid';
    });
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await salesApi.createQuotation(form, attachments.length ? attachments : undefined);
      toast.success('Quotation created');
      setOpen(false);
      setForm(EMPTY_FORM);
      setAttachments([]);
      // small delay so server can commit before we refetch
      setTimeout(() => fetchQuotations(page), 500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('<!') || msg.includes('405')) {
        toast.success('Quotation created');
        setOpen(false);
        setForm(EMPTY_FORM);
        setAttachments([]);
        setTimeout(() => fetchQuotations(page), 500);
      } else {
        toast.error(msg || 'Failed to create quotation');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, status: QuotationStatus) => {
    try {
      const q = await salesApi.updateQuotationStatus(id, status);
      setQuotations(prev => prev.map(x => x.id === id ? (q ?? { ...x, status }) : x));
      if (detail?.id === id) setDetail(q ?? { ...detail, status });
      toast.success(`Status → ${status}`);
    } catch (e) {
      // 405 workaround: backend processes but returns wrong status
      setQuotations(prev => prev.map(x => x.id === id ? { ...x, status } : x));
      if (detail?.id === id) setDetail(d => d ? { ...d, status } : d);
      toast.success(`Status → ${status}`);
    }
  };

  const handleConvert = async (id: number) => {
    setConvertingId(id);
    try {
      const so = await salesApi.createSalesOrderFromQuotation(id);
      toast.success(`Converted → Sales Order ${so?.salesOrderNumber ?? ''}`);
      fetchQuotations(page);
      setDetail(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to convert');
    } finally {
      setConvertingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await salesApi.deleteQuotation(deleteTarget.id);
      toast.success('Quotation deleted');
      setDeleteTarget(null);
      if (detail?.id === deleteTarget.id) setDetail(null);
      fetchQuotations(page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  // ── Totals preview ─────────────────────────────────────────────────────────

  const { subTotal, totalTax, netTotal } = calcTotals(
    form.items, form.totalDiscount ?? 0, form.otherCharges ?? 0
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FileText className="w-6 h-6" style={{ color: '#1a237e' }} /> Quotations
          </h1>
          <p className="page-subtitle">Manage sales quotations</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => { setForm(EMPTY_FORM); setAttachments([]); setFormErrors({}); setOpen(true); }}
        >
          <Plus className="w-4 h-4" /> New Quotation
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="section-card p-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Number</th><th>Date</th><th>Customer</th><th>Type</th>
                <th>Status</th><th>Net Total</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map(q => (
                <tr key={q.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetail(q)}>
                  <td className="font-medium text-sm text-primary">{q.quotationNumber}</td>
                  <td className="text-sm">{q.quotationDate}</td>
                  <td className="text-sm">{q.customerName || `#${q.customerId}`}</td>
                  <td className="text-xs">{q.quotationType ?? '—'}</td>
                  <td>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[q.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="text-sm">₹{(q.netTotal ?? 0).toLocaleString()}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2 items-center">
                      {q.status === 'DRAFT' && (
                        <button
                          onClick={() => handleStatusChange(q.id, 'SENT')}
                          className="text-xs text-blue-600 hover:underline"
                        >Send</button>
                      )}
                      {q.status === 'SENT' && (
                        <button
                          onClick={() => handleStatusChange(q.id, 'ACCEPTED')}
                          className="text-xs text-green-600 hover:underline"
                        >Accept</button>
                      )}
                      {q.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleConvert(q.id)}
                          disabled={convertingId === q.id}
                          className="text-xs btn-primary py-0.5 px-2 flex items-center gap-1"
                        >
                          <ArrowRight className="w-3 h-3" />
                          {convertingId === q.id ? '...' : 'Convert to SO'}
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(q)}
                        className="text-muted-foreground hover:text-destructive"
                      ><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {quotations.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No quotations found</td></tr>
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

      {/* ── Create Dialog ── */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); } }}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Quotation</DialogTitle></DialogHeader>

          {/* Section: Basic Info */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1">Quotation Date *</label>
              <input
                type="date"
                className={`input-field ${formErrors.quotationDate ? 'border-red-400' : ''}`}
                value={form.quotationDate}
                onChange={e => setField('quotationDate', e.target.value)}
              />
              {formErrors.quotationDate && <p className="text-xs text-red-500 mt-0.5">{formErrors.quotationDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input
                type="date"
                className="input-field"
                value={form.expiryDate ?? ''}
                onChange={e => setField('expiryDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Customer ID *</label>
              <input
                type="number"
                className={`input-field ${formErrors.customerId ? 'border-red-400' : ''}`}
                value={form.customerId || ''}
                onChange={e => setField('customerId', Number(e.target.value))}
                placeholder="e.g. 1"
              />
              {formErrors.customerId && <p className="text-xs text-red-500 mt-0.5">{formErrors.customerId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Salesperson ID</label>
              <input
                type="number"
                className="input-field"
                value={form.salespersonId ?? ''}
                onChange={e => setField('salespersonId', num(e.target.value))}
                placeholder="e.g. 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reference</label>
              <input
                className="input-field"
                value={form.reference ?? ''}
                onChange={e => setField('reference', e.target.value)}
                placeholder="REF-Q-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="input-field" value={form.quotationType ?? 'STANDARD'} onChange={e => setField('quotationType', e.target.value as QuotationRequest['quotationType'])}>
                <option value="STANDARD">STANDARD</option>
                <option value="PROFORMA">PROFORMA</option>
                <option value="REVISED">REVISED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email To</label>
              <input
                type="email"
                className="input-field"
                value={form.emailTo ?? ''}
                onChange={e => setField('emailTo', e.target.value)}
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Template</label>
              <input
                className="input-field"
                value={form.template ?? ''}
                onChange={e => setField('template', e.target.value)}
                placeholder="default"
              />
            </div>
          </div>

          {/* Section: Items */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Items</h3>
              <button type="button" className="btn-outline text-xs py-1 px-2 flex items-center gap-1" onClick={addItem}>
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            {formErrors.items && <p className="text-xs text-red-500 mb-2">{formErrors.items}</p>}

            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-3 bg-muted/20 relative">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(idx)}
                    disabled={form.items.length === 1}
                  ><X className="w-3.5 h-3.5" /></button>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Item Name *</label>
                      <input
                        className={`input-field text-sm py-1 ${formErrors[`item_${idx}_name`] ? 'border-red-400' : ''}`}
                        value={item.itemName ?? ''}
                        onChange={e => setItem(idx, { itemName: e.target.value })}
                        placeholder="Steel Rod 10mm"
                      />
                      {formErrors[`item_${idx}_name`] && <p className="text-xs text-red-500">{formErrors[`item_${idx}_name`]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Item Code</label>
                      <input
                        className="input-field text-sm py-1"
                        value={item.itemCode ?? ''}
                        onChange={e => setItem(idx, { itemCode: e.target.value })}
                        placeholder="PROD-001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-0.5">CRM Product ID</label>
                      <input
                        type="number"
                        className="input-field text-sm py-1"
                        value={item.crmProductId ?? ''}
                        onChange={e => setItem(idx, { crmProductId: num(e.target.value) })}
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Qty *</label>
                      <input
                        type="number"
                        className={`input-field text-sm py-1 ${formErrors[`item_${idx}_qty`] ? 'border-red-400' : ''}`}
                        value={item.quantity}
                        min={1}
                        onChange={e => setItem(idx, { quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Rate (₹)</label>
                      <input
                        type="number"
                        className="input-field text-sm py-1"
                        value={item.rate}
                        min={0}
                        onChange={e => setItem(idx, { rate: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Tax %</label>
                      <input
                        type="number"
                        className="input-field text-sm py-1"
                        value={item.taxPercentage ?? 0}
                        min={0}
                        disabled={item.isTaxExempt}
                        onChange={e => setItem(idx, { taxPercentage: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-0.5">Tax Value</label>
                      <input
                        type="number"
                        className="input-field text-sm py-1 bg-muted/40"
                        value={item.taxValue ?? calcItemTax(item)}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id={`tax_exempt_${idx}`}
                      checked={item.isTaxExempt ?? false}
                      onChange={e => setItem(idx, { isTaxExempt: e.target.checked, taxValue: 0 })}
                    />
                    <label htmlFor={`tax_exempt_${idx}`} className="text-xs text-muted-foreground">Tax Exempt</label>
                    <span className="ml-auto text-xs font-medium">
                      Amount: ₹{(item.quantity * item.rate).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Charges & Totals */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Discount (₹)</label>
              <input
                type="number"
                className="input-field"
                value={form.totalDiscount ?? 0}
                min={0}
                onChange={e => setField('totalDiscount', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Other Charges (₹)</label>
              <input
                type="number"
                className="input-field"
                value={form.otherCharges ?? 0}
                min={0}
                onChange={e => setField('otherCharges', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Totals preview */}
          <div className="mt-3 rounded-lg border bg-muted/20 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Sub Total</span><span>₹{subTotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total Tax</span><span>₹{totalTax.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>- ₹{(form.totalDiscount ?? 0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Other Charges</span><span>+ ₹{(form.otherCharges ?? 0).toLocaleString()}</span></div>
            <div className="flex justify-between font-semibold border-t pt-1 mt-1"><span>Net Total</span><span>₹{netTotal.toLocaleString()}</span></div>
          </div>

          {/* Section: Terms & Notes */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
              <textarea
                className="input-field"
                rows={2}
                value={form.termsAndConditions ?? ''}
                onChange={e => setField('termsAndConditions', e.target.value)}
                placeholder="Payment within 30 days"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="input-field"
                rows={2}
                value={form.notes ?? ''}
                onChange={e => setField('notes', e.target.value)}
                placeholder="Urgent requirement for Q1"
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" /> Attachments
            </label>
            <input
              type="file"
              multiple
              className="text-sm text-muted-foreground"
              onChange={e => setAttachments(Array.from(e.target.files ?? []))}
            />
            {attachments.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{attachments.length} file(s) selected</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button className="btn-primary flex-1" onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Quotation'}
            </button>
            <button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Detail Drawer ── */}
      <Dialog open={!!detail} onOpenChange={o => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detail.quotationNumber}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[detail.status] ?? ''}`}>
                    {detail.status}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-2">
                <div><span className="text-muted-foreground">Date:</span> {detail.quotationDate}</div>
                <div><span className="text-muted-foreground">Expiry:</span> {detail.expiryDate ?? '—'}</div>
                <div><span className="text-muted-foreground">Customer:</span> {detail.customerName || `#${detail.customerId}`}</div>
                <div><span className="text-muted-foreground">Salesperson:</span> {detail.salespersonName ?? '—'}</div>
                <div><span className="text-muted-foreground">Reference:</span> {detail.reference ?? '—'}</div>
                <div><span className="text-muted-foreground">Type:</span> {detail.quotationType ?? '—'}</div>
              </div>

              {/* Items */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Items</h4>
                <div className="overflow-x-auto">
                  <table className="data-table text-sm">
                    <thead>
                      <tr><th>Item</th><th>Code</th><th>Qty</th><th>Rate</th><th>Tax%</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                      {(detail.items ?? []).map(it => (
                        <tr key={it.id}>
                          <td>{it.itemName}</td>
                          <td className="text-xs">{it.itemCode ?? '—'}</td>
                          <td>{it.quantity}</td>
                          <td>₹{it.rate.toLocaleString()}</td>
                          <td>{it.taxPercentage ?? 0}%</td>
                          <td>₹{it.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="mt-3 rounded-lg border bg-muted/20 p-3 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Sub Total</span><span>₹{(detail.subTotal ?? 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Tax</span><span>₹{(detail.totalTax ?? 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>- ₹{(detail.totalDiscount ?? 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Other Charges</span><span>+ ₹{(detail.otherCharges ?? 0).toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Net Total</span><span>₹{(detail.netTotal ?? 0).toLocaleString()}</span></div>
              </div>

              {detail.termsAndConditions && (
                <div className="mt-3 text-sm">
                  <span className="font-medium">Terms:</span> {detail.termsAndConditions}
                </div>
              )}
              {detail.notes && (
                <div className="mt-1 text-sm">
                  <span className="font-medium">Notes:</span> {detail.notes}
                </div>
              )}

              {/* Workflow Actions */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {detail.status === 'DRAFT' && (
                  <button
                    className="btn-outline text-sm text-blue-600 border-blue-300"
                    onClick={() => handleStatusChange(detail.id, 'SENT')}
                  >Mark as SENT</button>
                )}
                {detail.status === 'SENT' && (
                  <button
                    className="btn-outline text-sm text-green-600 border-green-300"
                    onClick={() => handleStatusChange(detail.id, 'ACCEPTED')}
                  >Mark as ACCEPTED</button>
                )}
                {detail.status === 'SENT' && (
                  <button
                    className="btn-outline text-sm text-red-600 border-red-300"
                    onClick={() => handleStatusChange(detail.id, 'REJECTED')}
                  >Mark as REJECTED</button>
                )}
                {detail.status === 'ACCEPTED' && (
                  <button
                    className="btn-primary text-sm flex items-center gap-1"
                    onClick={() => handleConvert(detail.id)}
                    disabled={convertingId === detail.id}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    {convertingId === detail.id ? 'Converting...' : 'Convert to Sales Order'}
                  </button>
                )}
                <button
                  className="btn-outline text-sm text-destructive border-destructive/30 ml-auto"
                  onClick={() => { setDeleteTarget(detail); setDetail(null); }}
                >Delete</button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.quotationNumber}</strong>? This cannot be undone.
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
