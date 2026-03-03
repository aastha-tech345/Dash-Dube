export const dashboardStats = {
  totalProducts: 24592,
  totalProductsChange: 12,
  activeWarehouses: 12,
  activeWarehousesChange: 0,
  currentStockValue: 1.2,
  stockValueChange: 5.4,
};

export const storageCapacity = [
  { name: "Main Hub - Seattle", percent: 85, color: "bg-primary" },
  { name: "Regional - Chicago", percent: 42, color: "bg-blue-500" },
  { name: "Distribution - Miami", percent: 92, color: "bg-red-500" },
];

export const recentActivity = [
  { icon: "package", color: "text-primary", title: "Stock Received - Batch #8812", subtitle: "Electronics Hub • 2 mins ago" },
  { icon: "clipboard", color: "text-blue-500", title: "Inventory Audit Completed", subtitle: "Aisle 4B, Zone 2 • 45 mins ago" },
  { icon: "truck", color: "text-red-500", title: "Outbound Shipment - Order #5541", subtitle: "Loading Dock A • 2 hours ago" },
  { icon: "alert", color: "text-amber-500", title: "Low Stock Alert: Item PX-50", subtitle: "Main Hub • 5 hours ago" },
];

export const inDemandItems = [
  { name: "Premium Wireless Headphones", sku: "WH-700-BK", stock: "1,240 Units", status: "Healthy", location: "Aisle 2, Bin 12" },
  { name: "Mechanical Keyboard RGB", sku: "KB-MEC-88", stock: "12 Units", status: "Low Stock", location: "Aisle 4, Bin 01" },
  { name: "Ultra-Wide Gaming Monitor", sku: "MN-34W-4K", stock: "420 Units", status: "Healthy", location: "Aisle 1, Bin 15" },
];

export const inventoryProducts = [
  { id: "#PRO-9921", name: "MacBook Pro M3 14\"", sub: "Tech / Computers", category: "Electronics", purchasePrice: "$1,499.00", salePrice: "$1,999.00", status: "Active" },
  { id: "#PRO-4452", name: "Sony WH-1000XM5", sub: "Tech / Audio", category: "Electronics", purchasePrice: "$298.00", salePrice: "$349.00", status: "Active" },
  { id: "#PRO-1123", name: "Ergonomic Desk", sub: "Home / Office", category: "Furniture", purchasePrice: "$450.00", salePrice: "$650.00", status: "Inactive" },
  { id: "#PRO-5561", name: "Smart Watch Series 9", sub: "Tech / Wearables", category: "Electronics", purchasePrice: "$320.00", salePrice: "$399.00", status: "Active" },
  { id: "#PRO-8832", name: "Nespresso Vertuo", sub: "Home / Kitchen", category: "Appliances", purchasePrice: "$150.00", salePrice: "$189.00", status: "Active" },
];

export const inventorySummary = {
  totalValue: "$142,480.00",
  totalValueChange: "+12.5% from last month",
  lowStockAlerts: 14,
  lowStockSub: "Across 3 categories",
  stockInOut: { total: 28, transactions: 12, lastEntry: "4 mins ago" },
};

export const warehouses = [
  { code: "WH-MAIN-01", name: "Central Distribution Hub", type: "Main Facility", zones: "12 Zones", status: "Active" },
  { code: "WH-COLD-02", name: "Cold Storage Unit A", type: "Refrigerated", zones: "4 Zones", status: "Active" },
  { code: "WH-ZONE-03", name: "Third-Party Logistics Point", type: "3PL Partner", zones: "2 Zones", status: "In Maintenance" },
  { code: "WH-RTRN-04", name: "Returns & Processing Center", type: "Processing", zones: "8 Zones", status: "Active" },
  { code: "WH-EAST-05", name: "Eastern Regional Annex", type: "Satellite Facility", zones: "0 Zones", status: "Inactive" },
];

export const zones = [
  { name: "FAST-PICK-A", warehouse: "WH-MAIN-01", type: "PICKING", pickPriority: 1, putAwayPriority: 5, status: "Active" },
  { name: "BULK-STORAGE-01", warehouse: "WH-MAIN-01", type: "STORAGE", pickPriority: 10, putAwayPriority: 1, status: "Active" },
  { name: "COLD-VAL-A", warehouse: "WH-COLD-02", type: "REFRIGERATED", pickPriority: 2, putAwayPriority: 2, status: "Active" },
  { name: "QA-HOLD-01", warehouse: "WH-RTRN-04", type: "QUALITY_CONTROL", pickPriority: 99, putAwayPriority: 3, status: "Inactive" },
  { name: "SHIP-STAGE-E", warehouse: "WH-EAST-05", type: "STAGING", pickPriority: 1, putAwayPriority: 20, status: "Active" },
];

export const racks = [
  { code: "RCK-A01-01", zone: "Fast Moving Zone", type: "PALLET", aisle: "Aisle 01", pickSeq: 100, status: "Active" },
  { code: "RCK-A01-02", zone: "Fast Moving Zone", type: "PALLET", aisle: "Aisle 01", pickSeq: 110, status: "Active" },
  { code: "RCK-M01-01", zone: "Hazardous Goods", type: "MOBILE", aisle: "Aisle 05", pickSeq: 500, status: "Maintenance" },
  { code: "RCK-S02-01", zone: "Small Parts Zone", type: "STATIC", aisle: "Aisle 02", pickSeq: 205, status: "Active" },
  { code: "RCK-C01-01", zone: "Cold Storage", type: "DRIVE-IN", aisle: "Aisle 09", pickSeq: 900, status: "Inactive" },
];

export const shelves = [
  { code: "SH-01-A-01", rack: "RK-A1-001", level: "Level 1", pickSeq: 101, maxWeight: "500 kg" },
  { code: "SH-01-A-02", rack: "RK-A1-001", level: "Level 2", pickSeq: 102, maxWeight: "500 kg" },
  { code: "SH-01-A-03", rack: "RK-A1-001", level: "Level 3", pickSeq: 103, maxWeight: "300 kg" },
  { code: "SH-01-B-01", rack: "RK-B1-002", level: "Level 1", pickSeq: 201, maxWeight: "750 kg" },
  { code: "SH-02-C-01", rack: "RK-C2-005", level: "Level 1", pickSeq: 512, maxWeight: "450 kg" },
];
