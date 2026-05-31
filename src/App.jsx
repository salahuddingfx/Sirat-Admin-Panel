import { Route, Routes } from "react-router-dom";
import { Button, MetricCard, Panel, SectionHeader, AppShell } from "./lib/ui";
import { BarChart3, Boxes, ShoppingBag, Users, MessageSquare, BadgePercent, Settings2, ArrowRight } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Orders", href: "/orders" },
  { label: "Customers", href: "/customers" },
  { label: "Reviews", href: "/reviews" },
  { label: "Coupons", href: "/coupons" },
  { label: "Settings", href: "/settings" }
];

const orders = [
  { id: "#SRT-1001", customer: "Amina", status: "Packed", total: "$280" },
  { id: "#SRT-1002", customer: "James", status: "In transit", total: "$190" },
  { id: "#SRT-1003", customer: "Mia", status: "Awaiting pickup", total: "$140" }
];

const products = [
  { name: "Lumina Coat", stock: "24 in stock", status: "Live" },
  { name: "Nova Set", stock: "18 in stock", status: "Live" },
  { name: "Orbit Tee", stock: "6 low stock", status: "Alert" }
];

function DashboardPage() {
  return (
    <div className="admin-dashboard__grid">
      <div className="admin-dashboard__top">
        <SectionHeader
          eyebrow="Admin control room"
          title="Manage Sirat from one high-contrast dashboard."
          description="This panel is built for product operations, order movement, customer support, and launch analytics across the same server as the storefront."
        >
          <Button>
            <ArrowRight size={16} /> Add product
          </Button>
        </SectionHeader>
        <div className="admin-toolbar">
          <span className="admin-status">
            <BarChart3 size={14} /> Sales live
          </span>
          <span className="admin-status">
            <Boxes size={14} /> Inventory synced
          </span>
          <span className="admin-status">
            <ShoppingBag size={14} /> Orders tracking
          </span>
        </div>
      </div>

      <div className="admin-dashboard__metrics">
        <MetricCard label="Revenue" value="$48.2k" delta="+12.4% this week" />
        <MetricCard label="Orders" value="1,284" delta="+8.1% this week" />
        <MetricCard label="Conversion" value="4.9%" delta="+0.7% this week" />
        <MetricCard label="Low stock" value="12" delta="Needs attention" />
      </div>

      <div className="admin-dashboard__panels">
        <Panel className="page-card">
          <SectionHeader eyebrow="Orders" title="Live order queue" description="Recent orders and fulfillment states are displayed here once the backend is connected." />
          <div className="admin-list">
            {orders.map((order) => (
              <div key={order.id} className="admin-list__item">
                <div>
                  <strong>{order.id}</strong>
                  <span className="helper">{order.customer}</span>
                </div>
                <span className="admin-status">{order.status}</span>
                <strong>{order.total}</strong>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="page-card">
          <SectionHeader eyebrow="Inventory" title="Stock health" description="Keep the fashion drops available without overselling or missing a launch window." />
          <div className="admin-list">
            {products.map((product) => (
              <div key={product.name} className="admin-list__item">
                <div>
                  <strong>{product.name}</strong>
                  <span className="helper">{product.stock}</span>
                </div>
                <span className="admin-status">{product.status}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ManagementPage({ title, description, icon: Icon }) {
  return (
    <Panel className="page-card">
      <SectionHeader eyebrow={title} title={title} description={description}>
        <Icon size={18} />
      </SectionHeader>
      <p className="page-section__text">This section is ready for API-backed management screens in the next step.</p>
    </Panel>
  );
}

function SettingsPage() {
  return (
    <div className="settings-grid">
      <Panel className="page-card">
        <SectionHeader eyebrow="Branding" title="Store identity" description="Control logo, copy, and launch banners." />
      </Panel>
      <Panel className="page-card">
        <SectionHeader eyebrow="Operations" title="Shipping and taxes" description="Configure delivery regions, tax logic, and fulfillment rules." />
      </Panel>
      <Panel className="page-card">
        <SectionHeader eyebrow="Access" title="Roles and permissions" description="Separate support, marketing, and super-admin access." />
      </Panel>
    </div>
  );
}

function NotFoundPage() {
  return <ManagementPage title="404" description="This admin route does not exist yet." icon={Settings2} />;
}

export function App() {
  return (
    <AppShell
      brand="SIRAT"
      tagline="Admin command center"
      navItems={navItems}
      rightSlot={<span className="admin-status"><MessageSquare size={14} /> Support online</span>}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ManagementPage title="Products" description="Create, edit, categorize, and publish product data." icon={Boxes} />} />
        <Route path="/orders" element={<ManagementPage title="Orders" description="Manage fulfilment, tracking, cancellations, and refunds." icon={ShoppingBag} />} />
        <Route path="/customers" element={<ManagementPage title="Customers" description="See accounts, addresses, and purchase history." icon={Users} />} />
        <Route path="/reviews" element={<ManagementPage title="Reviews" description="Moderate rating data and feature verified customer feedback." icon={MessageSquare} />} />
        <Route path="/coupons" element={<ManagementPage title="Coupons" description="Launch discounts, campaigns, and flash offers." icon={BadgePercent} />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
