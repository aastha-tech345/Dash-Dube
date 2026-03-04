import { Package, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import type { StockTransaction } from '@/types/inventory';

interface StockTransactionListProps {
  transactions: StockTransaction[];
  loading?: boolean;
}

export default function StockTransactionList({ transactions, loading }: StockTransactionListProps) {
  if (loading) {
    return (
      <div className="section-card p-12 text-center">
        <div className="text-muted-foreground">Loading transactions...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="section-card p-12 text-center">
        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <div className="text-muted-foreground">No transactions found</div>
      </div>
    );
  }

  return (
    <div className="section-card overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Warehouse</th>
            <th>Zone</th>
            <th>Reference</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id}>
              <td>
                <div className="flex items-center gap-2">
                  {txn.type === 'in' ? (
                    <ArrowDownCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowUpCircle className="w-4 h-4 text-blue-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    txn.type === 'in' ? 'text-emerald-500' : 'text-blue-500'
                  }`}>
                    {txn.type === 'in' ? 'Stock In' : 'Stock Out'}
                  </span>
                </div>
              </td>
              <td>
                <div>
                  <div className="font-medium text-sm">{txn.productName}</div>
                  <div className="text-xs text-muted-foreground">{txn.productId}</div>
                </div>
              </td>
              <td className="font-medium">{txn.quantity}</td>
              <td className="text-sm">{txn.warehouse}</td>
              <td className="text-sm text-muted-foreground">{txn.zone || '-'}</td>
              <td className="text-xs text-muted-foreground">{txn.reference}</td>
              <td className="text-xs text-muted-foreground">
                {new Date(txn.date).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
