import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loading } from "@/components/ui/loading";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import AddProduct from "./pages/AddProduct";
import Infrastructure from "./pages/Infrastructure";
import CreateWarehouse from "./pages/CreateWarehouse";
import CreateZone from "./pages/CreateZone";
import CreateRack from "./pages/CreateRack";
import CreateShelf from "./pages/CreateShelf";
import CreateBin from "./pages/CreateBin";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading message="Initializing application..." />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/inventory/add" element={<AddProduct />} />
                <Route path="/infrastructure" element={<Infrastructure />} />
                <Route path="/infrastructure/create-warehouse" element={<CreateWarehouse />} />
                <Route path="/infrastructure/create-zone" element={<CreateZone />} />
                <Route path="/infrastructure/create-rack" element={<CreateRack />} />
                <Route path="/infrastructure/create-shelf" element={<CreateShelf />} />
                <Route path="/infrastructure/create-bin" element={<CreateBin />} />
                <Route path="/stock-in" element={<StockIn />} />
                <Route path="/stock-out" element={<StockOut />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
