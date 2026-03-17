// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Guide from "./pages/Guide";
import Library from "./pages/Library";
import Blog from "./pages/Blog";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import NotFound from "./pages/NotFound";
import Referral from "./pages/Referral";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminLibrary from "./pages/admin/AdminLibrary";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminBlog from "./pages/admin/AdminBlog";
import BlogPost from "./pages/BlogPost";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => {
  // Save referral code from URL on any page load, before auth modal opens
  const refCode = new URLSearchParams(window.location.search).get('ref');
  if (refCode) {
    localStorage.setItem('pending_referral', refCode);
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
         {/* <Toaster /> */}
          <Sonner />
          <BrowserRouter basename="/poetai1/">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/library" element={<Library />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="library" element={<AdminLibrary />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="blog" element={<AdminBlog />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
