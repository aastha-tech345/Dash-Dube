import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Package, Grid3X3, CheckSquare, ArrowUpRight, Settings, LogOut, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Inventory", path: "/inventory", icon: Package },
  { label: "Infrastructure", path: "/infrastructure", icon: Grid3X3 },
  { label: "Stock In", path: "/stock-in", icon: CheckSquare },
  { label: "Stock Out", path: "/stock-out", icon: ArrowUpRight },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: Props) {
  const location = useLocation();
  const { logout } = useAuth();
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/20 z-40" onClick={onClose} />
      <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-card border-r border-border z-50 flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <div>
              <div className="text-sm font-semibold text-foreground">Ware House</div>
              <div className="text-xs text-muted-foreground">Warehouse Management</div>
            </div>
          </Link>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="px-4 pt-5 pb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Warehouse Management</span>
        </div>
        <nav className="flex-1 px-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={onClose} className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}>
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-2 pb-4 mt-auto border-t border-border pt-2">
          <button className="sidebar-link w-full"><Settings className="w-4 h-4" /><span>Settings</span></button>
          <button className="sidebar-link w-full text-red-500" onClick={handleLogout}><LogOut className="w-4 h-4" /><span>Logout</span></button>
        </div>
      </aside>
    </>
  );
}
