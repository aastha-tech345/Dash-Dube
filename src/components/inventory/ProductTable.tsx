import { Package, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types/inventory';
import Pagination from '@/components/shared/Pagination';

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  onStatusToggle?: (id: string, status: 'Active' | 'Inactive') => void;
  onDelete?: (id: string) => void;
}

export default function ProductTable({ products, loading, onStatusToggle, onDelete }: ProductTableProps) {
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/inventory/add?id=${id}`);
  };

  if (loading) {
    return (
      <div className="section-card p-12 text-center">
        <div className="text-muted-foreground">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="section-card mb-6 overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Purchase Price</th>
            <th>Sale Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="text-muted-foreground text-xs">{p.id}</td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sub}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className={`text-xs font-medium ${
                  p.category === "Electronics" ? "category-electronics" :
                  p.category === "Furniture" ? "category-furniture" : "category-appliances"
                }`}>
                  {p.category}
                </span>
              </td>
              <td>{p.purchasePrice}</td>
              <td className="font-medium">{p.salePrice}</td>
              <td>
                <button
                  onClick={() => onStatusToggle?.(p.id, p.status === "Active" ? "Inactive" : "Active")}
                  className={`flex items-center gap-1 text-xs font-medium cursor-pointer ${
                    p.status === "Active" ? "text-emerald-500" : "text-muted-foreground"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    p.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground"
                  }`} />
                  {p.status}
                </button>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(p.id)}
                    className="p-1.5 hover:bg-primary/10 rounded text-primary transition-colors"
                    title="Edit product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete?.(p.id)}
                    className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-muted-foreground py-8">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {products.length > 0 && (
        <Pagination 
          current={1} 
          total={1} 
          showingText={`Showing ${products.length} products`} 
        />
      )}
    </div>
  );
}
