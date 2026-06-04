import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { FeaturePlaceholder } from "../components/layout/FeaturePlaceholder";
import { Boxes, ShoppingBag, Users, MessageSquare, BadgePercent, Settings, Zap, UserCog } from "lucide-react";

const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage").then(module => ({ default: module.DashboardPage })));
const OrdersPage = lazy(() => import("../features/orders/pages/OrdersPage").then(module => ({ default: module.OrdersPage })));
const ProductsPage = lazy(() => import("../features/products/pages/ProductsPage").then(module => ({ default: module.ProductsPage })));
const HeroPage = lazy(() => import("../features/hero/pages/HeroPage"));
const ReviewsPage = lazy(() => import("../features/reviews/pages/ReviewsPage"));
const CouponsPage = lazy(() => import("../features/coupons/pages/CouponsPage"));
const MessagesPage = lazy(() => import("../features/contact/pages/MessagesPage"));
const CustomersPage = lazy(() => import("../features/customers/pages/CustomersPage"));
const SettingsPage = lazy(() => import("../features/settings/pages/SettingsPage").then(module => ({ default: module.SettingsPage })));
const SalesPage = lazy(() => import("../features/sales/pages/SalesPage").then(module => ({ default: module.SalesPage })));
const CategoriesPage = lazy(() => import("../features/categories/pages/CategoriesPage").then(module => ({ default: module.CategoriesPage })));
const FlashSalePage = lazy(() => import("../features/flashSale/pages/FlashSalePage"));
const AnalyticsPage = lazy(() => import("../features/analytics/pages/AnalyticsPage").then(module => ({ default: module.AnalyticsPage })));
const TeamPage = lazy(() => import("../features/team/pages/TeamPage"));

export function AppRouter() {
  return (
    <Suspense fallback={<div className="admin-loader" />}>
      <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/sales" element={<SalesPage />} />
      <Route path="/hero" element={<HeroPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/coupons" element={<CouponsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/flash-sale" element={<FlashSalePage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
