import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { FeaturePlaceholder } from "../components/layout/FeaturePlaceholder";
import { Boxes, ShoppingBag, Users, MessageSquare, BadgePercent, Settings } from "lucide-react";

const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage").then(module => ({ default: module.DashboardPage })));
const OrdersPage = lazy(() => import("../features/orders/pages/OrdersPage").then(module => ({ default: module.OrdersPage })));
const ProductsPage = lazy(() => import("../features/products/pages/ProductsPage").then(module => ({ default: module.ProductsPage })));
const HeroPage = lazy(() => import("../features/hero/pages/HeroPage"));
const ReviewsPage = lazy(() => import("../features/reviews/pages/ReviewsPage"));
const CouponsPage = lazy(() => import("../features/coupons/pages/CouponsPage"));
const MessagesPage = lazy(() => import("../features/contact/pages/MessagesPage"));

export function AppRouter() {
  return (
    <Suspense fallback={<div className="admin-loader" />}>
      <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/hero" element={<HeroPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/coupons" element={<CouponsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route 
        path="/customers" 
        element={
          <FeaturePlaceholder 
            title="Customers" 
            description="View and manage customer profiles." 
            icon={Users} 
          />
        } 
      />
      <Route 
        path="/settings" 
        element={
          <FeaturePlaceholder 
            title="Settings" 
            description="Configure store and admin preferences." 
            icon={Settings} 
          />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
