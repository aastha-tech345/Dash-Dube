import { useState } from 'react';
import { ArrowUpCircle, Plus } from 'lucide-react';
import { useInventoryMovements } from '@/hooks/useInventoryMovements';
import StockTransactionForm from '@/components/inventory/StockTransactionForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { InventoryMovementRequest } from '@/types/api';

export default function StockOut() {
  const { movements, loading, error, createMovement } = useInventoryMovements();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter only OUTWARD movements
  const outwardMovements = movements.filter(m => m.type === 'OUTWARD' || m.type === 'DISPATCH');

  const handleSubmit = async (transaction: any) => {
    try {
      const movementData: InventoryMovementRequest = {
        movementNo: `OUT-${Date.now()}`,
        type: 'OUTWARD',
        status: 'AVAILABLE',
        productId: parseInt(transaction.productId),
        warehouseId: parseInt(transaction.warehouse.split('-')[1]) || 1,
        binId: transaction.zone ? 1 : undefined,
        uomId: 1,
        quantity: transaction.quantity,
        referenceType: 'SO',
        referenceId: parseInt(transaction.reference.split('-')[1]) || Date.now(),
        remarks: transaction.notes,
      };

      await createMovement(movementData);
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to create stock out:', err);
      alert('Failed to record stock out');
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ArrowUpCircle className="w-6 h-6 text-blue-500" />
            Stock Out
          </h1>
          <p className="page-subtitle">Record outgoing stock and shipments</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Stock Out
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Record Stock Out</DialogTitle>
            </DialogHeader>
            <StockTransactionForm
              type="out"
              onSubmit={handleSubmit}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="section-card mb-6 p-4 bg-red-50 border-red-200">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="section-card p-12 text-center">
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      ) : (
        <div className="section-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Movement No</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Warehouse</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {outwardMovements.map((mov) => (
                <tr key={mov.id}>
                  <td className="text-primary font-medium text-xs">{mov.movementNo}</td>
                  <td>
                    <div className="font-medium text-sm">{mov.productName || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">ID: {mov.productId}</div>
                  </td>
                  <td className="font-medium">{mov.quantity} {mov.uomName}</td>
                  <td className="text-sm">{mov.warehouseName}</td>
                  <td>
                    <span className="text-xs font-medium text-blue-500">
                      {mov.status}
                    </span>
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {mov.referenceType}-{mov.referenceId}
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {new Date(mov.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {outwardMovements.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted-foreground py-8">
                    No stock out transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
