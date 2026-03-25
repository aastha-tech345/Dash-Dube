import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  CheckSquare,
  ArrowUpRight,
  Settings,
  LogOut,
  ArrowLeftRight,
  Truck,
  UserCheck,
  MapPin,
  PackageCheck,
  ShoppingBag,
  FlaskConical,
  Layers,
  Package2,
  FileText,
  ShoppingCart,
  Receipt,
} from "lucide-react";

const warehouseNav = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Inventory", path: "/inventory", icon: Package },
  { label: "Infrastructure", path: "/infrastructure", icon: Grid3X3 },
  { label: "Stock In", path: "/stock-in", icon: CheckSquare },
  { label: "Stock Out", path: "/stock-out", icon: ArrowUpRight },
  { label: "Transfers", path: "/warehouse/transfers", icon: ArrowLeftRight },
];

const fleetNav = [
  { label: "Drivers", path: "/fleet/drivers", icon: UserCheck },
  { label: "Vehicles", path: "/fleet/vehicles", icon: Truck },
  { label: "Routes", path: "/fleet/routes", icon: MapPin },
];

const salesNav = [
  { label: "Quotations", path: "/sales/quotations", icon: FileText },
  { label: "Sales Orders", path: "/sales/orders", icon: ShoppingCart },
  { label: "Delivery Orders", path: "/sales/delivery-orders", icon: PackageCheck },
  { label: "Invoices", path: "/sales/invoices", icon: Receipt },
];

const crmNav = [
  { label: "Sales Products", path: "/crm/sales-products", icon: ShoppingBag },
];

const productionNav = [
  { label: "Raw Materials", path: "/production/raw-materials", icon: FlaskConical },
  { label: "Semi-Finished", path: "/production/semi-finished", icon: Layers },
  { label: "Finished Goods", path: "/production/finished-goods", icon: Package2 },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-[220px] h-screen border-r border-border bg-card flex flex-col flex-shrink-0 max-lg:hidden overflow-hidden">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a237e, #1a237e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "900",
              fontSize: "17px",
              padding: "13px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            WH
          </div>
          <div>
            {/* Icon Circle */}

            {/* Brand Text */}
            <div style={{ lineHeight: "1" }}>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  letterSpacing: "1px",
                  color: "#1a237e",
                }}
              >
                Ware
                <span style={{ color: "#1a237e", marginLeft: "4px" }}>
                  House
                </span>
              </div>

              {/* <div
      style={{
        fontSize: "11px",
        letterSpacing: "2px",
        color: "#6c757d",
        marginTop: "2px",
      }}
    >
      MANAGEMENT
    </div> */}
            </div>
            <div className="text-xs text-muted-foreground">
              Back to Dashboard
            </div>
          </div>
        </Link>
      </div>

      <div className="px-4 pt-5 pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Warehouse Management
        </span>
      </div>

      <nav className="flex-1 px-2 overflow-y-auto">
        {warehouseNav.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="px-2 pt-4 pb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fleet</span>
        </div>
        {fleetNav.map((item) => (
          <Link key={item.path} to={item.path} className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}>
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="px-2 pt-4 pb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sales</span>
        </div>
        {salesNav.map((item) => (
          <Link key={item.path} to={item.path} className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}>
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="px-2 pt-4 pb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">CRM</span>
        </div>
        {crmNav.map((item) => (
          <Link key={item.path} to={item.path} className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}>
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="px-2 pt-4 pb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Production</span>
        </div>
        {productionNav.map((item) => (
          <Link key={item.path} to={item.path} className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}>
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-2 pb-4 mt-auto border-t border-border pt-2">
        <button className="sidebar-link w-full">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        <button className="sidebar-link w-full text-red-500" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
