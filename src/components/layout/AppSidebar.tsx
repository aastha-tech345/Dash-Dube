import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Package, Grid3X3, CheckSquare, ArrowUpRight, Settings, LogOut, ArrowLeft } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Inventory", path: "/inventory", icon: Package },
  { label: "Infrastructure", path: "/infrastructure", icon: Grid3X3 },
  { label: "Stock In", path: "/stock-in", icon: CheckSquare },
  { label: "Stock Out", path: "/stock-out", icon: ArrowUpRight },
];

export default function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-[220px] min-h-screen border-r border-border bg-card flex flex-col flex-shrink-0 max-lg:hidden">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Company Hub</div>
            <div className="text-xs text-muted-foreground">Back to Dashboard</div>
          </div>
        </Link>
      </div>

      <div className="px-4 pt-5 pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Warehouse Management
        </span>
      </div>

      <nav className="flex-1 px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
          >
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
        <button className="sidebar-link w-full text-red-500">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
