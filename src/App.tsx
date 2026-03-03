import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import AddProduct from "./pages/AddProduct";
import Infrastructure from "./pages/Infrastructure";
import CreateWarehouse from "./pages/CreateWarehouse";
import CreateZone from "./pages/CreateZone";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/add" element={<AddProduct />} />
            <Route path="/infrastructure" element={<Infrastructure />} />
            <Route path="/infrastructure/create-warehouse" element={<CreateWarehouse />} />
            <Route path="/infrastructure/create-zone" element={<CreateZone />} />
            <Route path="/stock-in" element={<StockIn />} />
            <Route path="/stock-out" element={<StockOut />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
