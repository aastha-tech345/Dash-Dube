import { useState, useMemo } from 'react';
import { ArrowUpCircle, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useInventoryMovements } from '@/hooks/useInventoryMovements';
import StockTransactionForm, { type FormPayload } from '@/components/inventory/StockTransactionForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { InventoryMovementRequest, InventoryMovementResponse } from '@/types/api';

const INWARD_TYPES = ['INWARD', 'INBOUND_RECEIPT', 'ADJUSTMENT_IN', 'PRODUCTION_RECEIPT', 'TRANSFER_RECEIVE'];
const OUTWARD_TYPES = ['OUTWARD', 'DISPATCH', 'ADJUSTMENT_OUT', 'PRODUCTION_ISSUE', 'PICK', 'PACK', 'TRANSFER_DISPATCH'];

export default function StockOut() {
  const { movements, loading, error, createMovement, updateQuantity, deleteMovement } = useInventoryMovements();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryMovementResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryMovementResponse | null>(null);
  const [editQty, setEditQty] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const outwardMovements = movements.filter(m =>
    OUTWARD_TYPES.includes(m.type)
  );

  // For a given movement being edited, calculate max allowed quantity:
  // net stock of that product+warehouse + the movement's own current qty (since it's already deducted)
  const getMaxEditableQty = (mov: InventoryMovementResponse): number => {
    const netStock = movements
      .filter(m => m.productId === mov.productId && m.warehouseId === mov.warehouseId)
      .reduce((acc, m) => {
        if (INWARD_TYPES.includes(m.type)) return acc + m.quantity;
        if (OUTWARD_TYPES.includes(m.type)) return acc - m.quantity;
        return acc;
      }, 0);
    // add back current movement's qty since we're replacing it
    return netStock + mov.quantity;
  };

  const maxEditQty = useMemo(() => editTarget ? getMaxEditableQty(editTarget) : 0, [editTarget, movements]);
  const editQtyNum = Number(editQty) || 0;
  const isEditInsufficient = !!editTarget && editQtyNum > maxEditQty;

  const handleSubmit = async (payload: FormPayload) => {
    const now = new Date().toISOString();
    const movementData: InventoryMovementRequest = {
      movementNo: `MOV-OUT-${Date.now()}`,
      type: 'OUTWARD',
      status: payload.status as InventoryMovementRequest['status'],
      previousStatus: payload.previousStatus || undefined,
      newStatus: payload.newStatus,
      productId: payload.productId,
      warehouseId: payload.warehouseId,
      sourceWarehouseId: payload.warehouseId,
      binId: payload.binId,
      sourceBinId: payload.binId,
      uomId: payload.uomId,
      quantity: payload.quantity,
      unitCost: payload.unitCost,
      totalCost: payload.unitCost ? payload.unitCost * payload.quantity : undefined,
      referenceType: payload.referenceType,
      referenceId: payload.referenceId,
      remarks: payload.remarks,
      movementAt: now,
      clientTime: now,
      syncStatus: 'PENDING_SYNC',
    };
    await createMovement(movementData);
    setDialogOpen(false);
  };

  const handleEditSave = async () => {
    if (!editTarget || !editQty || isEditInsufficient) return;
    setActionLoading(true);
    try {
      await updateQuantity(editTarget.id, Number(editQty));
      setEditTarget(null);
    } catch {
      // error shown via hook
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteMovement(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // error shown via hook
    } finally {
      setActionLoading(false);
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
            <StockTransactionForm type="out" onSubmit={handleSubmit} onCancel={() => setDialogOpen(false)} />
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
                <th>Qty</th>
                <th>Warehouse</th>
                <th>Bin</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Cost</th>
                <th>Date</th>
                <th>Actions</th>
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
                  <td className="text-xs text-muted-foreground">{mov.sourceBinCode || mov.binCode || '—'}</td>
                  <td>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {mov.status}
                    </span>
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {mov.referenceType}{mov.referenceId ? `-${mov.referenceId}` : ''}
                  </td>
                  <td className="text-xs">
                    {mov.totalCost != null ? `₹${mov.totalCost.toLocaleString()}` : '—'}
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {new Date(mov.movementAt || mov.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditTarget(mov); setEditQty(String(mov.quantity)); }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Edit quantity"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(mov)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {outwardMovements.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-muted-foreground py-8">
                    No stock out transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Quantity Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Quantity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Movement: <span className="font-medium text-foreground">{editTarget?.movementNo}</span>
            </p>
            <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-md">
              Max allowed: <strong>{maxEditQty}</strong> units (available stock + current qty)
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Quantity</label>
              <input
                type="number"
                className={`input-field ${isEditInsufficient ? 'border-red-400 focus:ring-red-400' : ''}`}
                value={editQty}
                onChange={(e) => setEditQty(e.target.value)}
                min="0.01"
                step="0.01"
                autoFocus
              />
            </div>
            {isEditInsufficient && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Insufficient stock. Max: <strong>{maxEditQty}</strong>, Entered: <strong>{editQtyNum}</strong>
              </div>
            )}
            <div className="flex gap-3">
              <button className="btn-primary flex-1" onClick={handleEditSave} disabled={actionLoading || isEditInsufficient}>
                {actionLoading ? 'Saving...' : 'Save'}
              </button>
              <button className="btn-outline" onClick={() => setEditTarget(null)}>Cancel</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Movement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.movementNo}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={actionLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {actionLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
