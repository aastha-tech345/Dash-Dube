import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { salesApi } from '@/services/salesApi';
import type { SalesOrderResponse } from '@/types/api';

const STATUS_COLORS: Record<string, string> = {
  ORDERED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  CONVERTED: 'bg-purple-100 text-purple-700',
};

export default function SalesOrders() {
  const [orders, setOrders] = useState<SalesOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    salesApi.getSalesOrders({ page, size: 10 })
      .then(data => {
        setOrders(data.content ?? (data as unknown as SalesOrderResponse[]));
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(e => toast.error(e instanceof Error ? e.message : 'Failed to fetch sales orders'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><ShoppingCart className="w-6 h-6" style={{ color: '#1a237e' }} /> Sales Orders</h1>
          <p className="page-subtitle">Orders converted from quotations</p>
        </div>
      </div>

      {loading ? (
        <div className="section-card p-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Order #</th><th>Customer</th><th>Status</th><th>Net Total</th><th>Created</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="font-medium text-sm">{o.salesOrderNumber}</td>
                  <td>{o.customerName}</td>
                  <td><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>{o.status}</span></td>
                  <td className="text-sm">₹{(o.netTotal ?? 0).toLocaleString()}</td>
                  <td className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No sales orders found</td></tr>}
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
    </div>
  );
}
