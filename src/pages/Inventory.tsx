import { Link } from "react-router-dom";
import { Plus, Search, Package, TrendingUp, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { inventoryProducts, inventorySummary } from "@/data/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import Pagination from "@/components/shared/Pagination";

export default function Inventory() {
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
            <input type="text" placeholder="Search products, SKU..." className="input-field pl-9" />
          </div>
          <button className="btn-outline text-xs">Category</button>
          <button className="btn-outline text-xs">Brand</button>
          <button className="btn-outline text-xs">Location</button>
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
            {inventoryProducts.map((p) => (
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
                  <span className={`flex items-center gap-1 text-xs font-medium ${p.status === "Active" ? "text-emerald-500" : "text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination current={1} total={3} showingText="Showing 1 to 5 of 42 products" />
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
