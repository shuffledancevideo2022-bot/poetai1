import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Guide from "./pages/Guide";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminPayments from "./pages/admin/AdminPayments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
