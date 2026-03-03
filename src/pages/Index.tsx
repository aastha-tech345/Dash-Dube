import { useState } from "react";
import { Plus, Package, DollarSign, RefreshCw, Truck, ClipboardCheck, AlertTriangle, Search } from "lucide-react";
import { dashboardStats, storageCapacity, recentActivity, inDemandItems as initialItems } from "@/data/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import NewEntryDialog from "@/components/dashboard/NewEntryDialog";

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items] = useState(initialItems);
  const [search, setSearch] = useState("");

  const filteredItems = items.filter((item) =>
    !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title text-2xl">Warehouse Dashboard</h1>
          <p className="page-subtitle">Welcome to the Warehouse Management Module.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue"><Package className="w-5 h-5" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Products</span>
              <span className="text-xs text-emerald-500 font-medium">+{dashboardStats.totalProductsChange}%</span>
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">{dashboardStats.totalProducts.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple"><Package className="w-5 h-5" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Active Warehouses</span>
              <span className="text-xs text-muted-foreground font-medium">No Change</span>
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">{dashboardStats.activeWarehouses}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow"><DollarSign className="w-5 h-5" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current Stock Value</span>
              <span className="text-xs text-emerald-500 font-medium">+{dashboardStats.stockValueChange}%</span>
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">${dashboardStats.currentStockValue}M</div>
          </div>
        </div>
      </div>

      {/* Storage Capacity & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="section-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold">Storage Capacity Utilization</h3>
            <button className="text-xs text-primary font-medium">View Details</button>
          </div>
          <div className="space-y-4">
            {storageCapacity.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-foreground font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.percent}% Full</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-bar-fill ${item.color}`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground">Available Space</div>
              <div className="text-lg font-bold text-foreground">4,200 sq ft</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Inbound (Next 24h)</div>
              <div className="text-lg font-bold text-foreground">1,250 Units</div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3 className="text-sm font-semibold mb-5">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((item, i) => {
              const IconMap: Record<string, React.ElementType> = { package: Package, clipboard: ClipboardCheck, truck: Truck, alert: AlertTriangle };
              const Icon = IconMap[item.icon] || Package;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.color} bg-muted`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-4 pt-3 border-t border-border text-xs text-muted-foreground font-medium text-center hover:text-foreground transition-colors">
            See All Activity
          </button>
        </div>
      </div>

      {/* In-Demand Items */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">In-Demand Items</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="input-field pl-9 w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.sku}>
                  <td className="font-medium">{item.name}</td>
                  <td className="text-muted-foreground">{item.sku}</td>
                  <td>{item.stock}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td className="text-muted-foreground">{item.location}</td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No items found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewEntryDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
