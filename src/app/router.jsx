import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { FeaturePlaceholder } from "../components/layout/FeaturePlaceholder";
import { Boxes, ShoppingBag, Users, MessageSquare, BadgePercent, Settings } from "lucide-react";

import { OrdersPage } from "../features/orders/pages/OrdersPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/orders" element={<OrdersPage />} />
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
        path="/reviews" 
        element={
          <FeaturePlaceholder 
            title="Reviews" 
            description="Moderate customer feedback and ratings." 
            icon={MessageSquare} 
          />
        } 
      />
      <Route 
        path="/coupons" 
        element={
          <FeaturePlaceholder 
            title="Coupons" 
            description="Create and manage discount codes." 
            icon={BadgePercent} 
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
  );
}
