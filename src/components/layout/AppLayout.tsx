import { Outlet } from "react-router-dom";
import { useState } from "react";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import MobileSidebar from "./MobileSidebar";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex w-full bg-background overflow-hidden">
      <AppSidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
