import { ArrowRight, BarChart3, Boxes, ShoppingBag } from "lucide-react";
import { Button, MetricCard, Card, SectionHeader, Badge } from "../../../components/ui";
import { orders, products } from "../data/mockData";
import "./DashboardPage.css";

export function DashboardPage() {
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
              <div key={order.id} className="activity-item">
                <div className="item-info">
                  <span className="item-id">{order.id}</span>
                  <span className="item-meta">{order.customer}</span>
                </div>
                <Badge variant={order.status === 'Packed' ? 'success' : 'warning'}>
                  {order.status}
                </Badge>
                <span className="item-amount">{order.total}</span>
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
