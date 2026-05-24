import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index.tsx";
import Products from "./pages/Products.tsx";
import About from "./pages/About.tsx";
import Awards from "./pages/Awards.tsx";
import Cart from "./pages/Cart.tsx";
import Profile from "./pages/Profile.tsx";
import Dealer from "./pages/Dealer.tsx";
import Admin from "./pages/Admin.tsx";
import StaffLogin from "./pages/StaffLogin.tsx";
import EmployeeProduction from "./pages/EmployeeProduction.tsx";
import EmployeeSales from "./pages/EmployeeSales.tsx";
import EmployeeService from "./pages/EmployeeService.tsx";
import NotFound from "./pages/NotFound.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PERMISSIONS } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" richColors />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/about" element={<About />} />
                <Route path="/awards" element={<Awards />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/staff-login" element={<StaffLogin />} />
                <Route path="/dealer" element={<ProtectedRoute allow={["dealer", "admin"]}><Dealer /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute allow={["admin"]}><Admin /></ProtectedRoute>} />

                {/* Employee Routes */}
                <Route
                  path="/employee/production"
                  element={
                    <ProtectedRoute
                      allow={["employee", "admin"]}
                      requiresPermission={[
                        PERMISSIONS.VIEW_INVENTORY,
                        PERMISSIONS.VIEW_RAW_MATERIALS,
                        PERMISSIONS.VIEW_PRODUCTION_STATUS
                      ]}
                    >
                      <EmployeeProduction />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee/sales"
                  element={
                    <ProtectedRoute
                      allow={["employee", "admin"]}
                      requiresPermission={[
                        PERMISSIONS.VIEW_DEALERS,
                        PERMISSIONS.VIEW_ORDERS
                      ]}
                    >
                      <EmployeeSales />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee/service"
                  element={
                    <ProtectedRoute
                      allow={["employee", "admin"]}
                      requiresPermission={[
                        PERMISSIONS.VIEW_TICKETS
                      ]}
                    >
                      <EmployeeService />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
