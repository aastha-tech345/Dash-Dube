import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, TrendingUp, AlertTriangle } from "lucide-react";
import { inventorySummary } from "@/data/mockData";
import { useWarehouseProducts } from "@/hooks/useWarehouseProducts";
import ProductFilters from "@/components/inventory/ProductFilters";
import ProductTable from "@/components/inventory/ProductTable";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const { products: apiProducts, loading, error } = useWarehouseProducts();
  
  // Filter products based on search and category
  const filteredProducts = apiProducts.filter((p) => {
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.categoryName === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Convert API products to display format
  const products = filteredProducts.map(p => ({
    id: p.sku,
    name: p.name,
    sub: p.categoryName,
    category: p.categoryName,
    purchasePrice: `$${p.purchasePrice.toFixed(2)}`,
    salePrice: `$${p.salePrice.toFixed(2)}`,
    status: p.isActive ? 'Active' : 'Inactive' as 'Active' | 'Inactive'
  }));
  
  const categories = [...new Set(apiProducts.map((p) => p.categoryName))];

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

      {error && (
        <div className="section-card mb-6 p-4 bg-red-50 border-red-200">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        selectedCategory={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      <ProductTable
        products={products}
        loading={loading}
        onStatusToggle={(id, status) => {
          console.log('Toggle status:', id, status);
          // Implement status toggle with API
        }}
      />

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
