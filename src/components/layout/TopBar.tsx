import { Bell, RefreshCw, Menu } from "lucide-react";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0">
      <button className="lg:hidden" onClick={onMenuToggle}>
        <Menu className="w-5 h-5 text-muted-foreground" />
      </button>
      <div className="lg:hidden" />
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
          JD
        </div>
      </div>
    </header>
  );
}
