import { useState, useEffect } from "react";
import { ArrowRight, BarChart3, Boxes, ShoppingBag } from "lucide-react";
import { Button, MetricCard, Card, SectionHeader, Badge } from "../../../components/ui";
import { orders as mockOrders, products } from "../data/mockData";
import "./DashboardPage.css";

export function DashboardPage() {
  const [orders, setOrders] = useState(mockOrders);

  useEffect(() => {
    // Attempt to load "real" orders from the storefront's localStorage
    try {
      const storedOrders = JSON.parse(localStorage.getItem("sirat_orders") || "[]");
      if (storedOrders.length > 0) {
        // Combine real orders with mock orders, putting real ones first
        // We limit to 5 recent for the dashboard view
        const combined = [...storedOrders.reverse(), ...mockOrders].slice(0, 5);
        setOrders(combined);
      }
    } catch (err) {
      console.error("Failed to load orders from localStorage", err);
    }
  }, []);
  return (
    <div className="dashboard">
      <SectionHeader
        eyebrow="Admin control room"
        title="Command Center"
        description="Monitor sales, manage inventory, and track fulfillment status in real-time."
      >
        <Button className="header-action">
          <ArrowRight size={18} /> Add product
        </Button>
      </SectionHeader>

      <div className="status-bar">
        <span className="status-item">
          <BarChart3 size={14} /> Sales live
        </span>
        <span className="status-item">
          <Boxes size={14} /> Inventory synced
        </span>
        <span className="status-item">
          <ShoppingBag size={14} /> Orders tracking
        </span>
      </div>

      <div className="metrics-grid">
        <MetricCard label="Revenue" value="$48.2k" delta="+12.4% this week" />
        <MetricCard label="Orders" value="1,284" delta="+8.1% this week" />
        <MetricCard label="Conversion" value="4.9%" delta="+0.7% this week" />
        <MetricCard label="Low stock" value="12" delta="Needs attention" />
      </div>

      <div className="content-grid">
        <Card className="dashboard-panel">
          <SectionHeader 
            eyebrow="Orders" 
            title="Recent Activity" 
            description="Latest orders pending fulfillment."
            className="panel-header"
          />
          <div className="activity-list">
            {orders.map((order) => (
              <div key={order.orderId || order.id} className="activity-item">
                <div className="item-info">
                  <span className="item-id">{order.orderId || order.id}</span>
                  <span className="item-meta">{order.name || order.customer}</span>
                </div>
                <Badge variant={order.status === 'Packed' || order.status === 'received' ? 'success' : 'warning'}>
                  {order.status}
                </Badge>
                <span className="item-amount">{order.estimatedTotal ? `৳${order.estimatedTotal}` : order.total}</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="panel-footer">
            View all orders
          </Button>
        </Card>

        <Card className="dashboard-panel">
          <SectionHeader 
            eyebrow="Inventory" 
            title="Stock Health" 
            description="Monitoring stock levels for current drops."
            className="panel-header"
          />
          <div className="activity-list">
            {products.map((product) => (
              <div key={product.name} className="activity-item">
                <div className="item-info">
                  <span className="item-id">{product.name}</span>
                  <span className="item-meta">{product.stock}</span>
                </div>
                <Badge variant={product.status === 'Live' ? 'success' : 'error'}>
                  {product.status}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="panel-footer">
            Manage inventory
          </Button>
        </Card>
      </div>
    </div>
  );
}
