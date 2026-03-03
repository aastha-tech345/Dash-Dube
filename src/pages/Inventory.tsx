import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { inventoryProducts as initialProducts, inventorySummary } from "@/data/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import Pagination from "@/components/shared/Pagination";

export default function Inventory() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(initialProducts.map((p) => p.category))];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">Product Inventory</h1>
          <p className="page-subtitle">Warehouse Management / Inventory</p>
        </div>
        <Link to="/inventory/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="section-card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products, SKU..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
              className={`btn-outline text-xs ${categoryFilter === cat ? "ring-2 ring-primary/30" : ""}`}
            >
              {cat}
            </button>
          ))}
          {categoryFilter && (
            <button onClick={() => setCategoryFilter(null)} className="text-xs text-muted-foreground hover:text-foreground">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
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
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="text-muted-foreground text-xs">{p.id}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground" /></div>
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
                  }`}>{p.category}</span>
                </td>
                <td>{p.purchasePrice}</td>
                <td className="font-medium">{p.salePrice}</td>
                <td>
                  <button
                    onClick={() => setProducts(products.map((item) => item.id === p.id ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item))}
                    className={`flex items-center gap-1 text-xs font-medium cursor-pointer ${p.status === "Active" ? "text-emerald-500" : "text-muted-foreground"}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${p.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    {p.status}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No products found.</td></tr>
            )}
          </tbody>
        </table>
        {filtered.length > 0 && <Pagination current={1} total={1} showingText={`Showing ${filtered.length} of ${products.length} products`} />}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="section-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Inventory Value</span>
            <div className="stat-icon stat-icon-green w-7 h-7"><TrendingUp className="w-3.5 h-3.5" /></div>
          </div>
          <div className="text-2xl font-bold">{inventorySummary.totalValue}</div>
          <div className="text-xs text-emerald-500 mt-1">✓ {inventorySummary.totalValueChange}</div>
        </div>
        <div className="section-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Low Stock Alerts</span>
            <div className="stat-icon stat-icon-yellow w-7 h-7"><AlertTriangle className="w-3.5 h-3.5" /></div>
          </div>
          <div className="text-2xl font-bold">{inventorySummary.lowStockAlerts} Items</div>
          <div className="text-xs text-muted-foreground mt-1">{inventorySummary.lowStockSub}</div>
        </div>
        <div className="section-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Stock In / Out (Today)</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{inventorySummary.stockInOut.total}</span>
            <span className="text-sm text-muted-foreground">/ {inventorySummary.stockInOut.transactions} transactions</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Last entry: {inventorySummary.stockInOut.lastEntry}</div>
        </div>
      </div>
    </div>
  );
}
