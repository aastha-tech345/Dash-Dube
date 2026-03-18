import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CopyPlus, FileDown, Download, TrendingUp, AlertTriangle } from "lucide-react";
import { inventorySummary } from "@/data/mockData";
import { useWarehouseProducts } from "@/hooks/useWarehouseProducts";
import { warehouseApi } from "@/services/warehouseApi";
import { useToast } from "@/hooks/use-toast";
import BulkUploadModal from "@/components/inventory/BulkUploadModal";
import ProductFilters from "@/components/inventory/ProductFilters";
import ProductTable from "@/components/inventory/ProductTable";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [templateDownloading, setTemplateDownloading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const triggerDownload = (blob: Blob, fallbackName: string, disposition: string | null) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_self';
    a.download = disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? fallbackName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://thegtrgroup.com/api';
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_BASE_URL}/warehouse/products/export${query}`, {
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
      });
      if (!response.ok) throw new Error(`Export failed: ${response.statusText}`);
      const blob = await response.blob();
      triggerDownload(blob, 'products_export.xlsx', response.headers.get('content-disposition'));
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to export",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setTemplateDownloading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://thegtrgroup.com/api';
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/warehouse/product/template`, {
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
      });
      if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
      const blob = await response.blob();
      triggerDownload(blob, 'product_template.xlsx', response.headers.get('content-disposition'));
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to download template",
        variant: "destructive",
      });
    } finally {
      setTemplateDownloading(false);
    }
  };
  
  const { products: apiProducts, loading, error, refetch } = useWarehouseProducts();
  
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
    id: p.id.toString(), // Use actual numeric ID
    sku: p.sku, // Keep SKU separate
    name: p.name,
    sub: p.categoryName,
    category: p.categoryName,
    purchasePrice: `$${p.purchasePrice.toFixed(2)}`,
    salePrice: `$${p.salePrice.toFixed(2)}`,
    status: p.isActive ? 'Active' : 'Inactive' as 'Active' | 'Inactive'
  }));
  
  const categories = [...new Set(apiProducts.map((p) => p.categoryName))];

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await warehouseApi.deleteProduct(Number(productId));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      refetch(); // Refresh the product list
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  return (
    <>
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">Product Inventory</h1>
          <p className="page-subtitle">Warehouse Management / Inventory</p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <button onClick={() => navigate('/inventory/add')} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <button onClick={() => setBulkUploadOpen(true)} className="btn-primary flex items-center gap-2">
            <CopyPlus className="w-4 h-4" /> Add Multiple Product
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            <FileDown className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <button
            onClick={handleDownloadTemplate}
            disabled={templateDownloading}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {templateDownloading ? 'Downloading...' : 'Download Template'}
          </button>
        </div>
        
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
        onDelete={handleDelete}
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

    {bulkUploadOpen && (
      <BulkUploadModal
        onClose={() => setBulkUploadOpen(false)}
        onSuccess={() => { setBulkUploadOpen(false); refetch(); }}
      />
    )}
    </>
  );
}
