import { useState, useEffect } from "react";
import { ArrowRight, BarChart3, Boxes, ShoppingBag } from "lucide-react";
import { Button, MetricCard, Card, SectionHeader, Badge } from "../../../components/ui";
import { fetchStats } from "../../../lib/api/queries";
import "./DashboardPage.css";

export function DashboardPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    orderCount: 0,
    userCount: 0,
    lowStockCount: 0,
    recentOrders: [],
    recentProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <SectionHeader
        eyebrow="Admin control room"
        title="Command Center"
        description="Monitor sales, manage inventory, and track fulfillment status in real-time."
      >
        <Button className="header-action" onClick={() => navigate("/products")}>
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
        <MetricCard label="Revenue" value={`৳${stats.revenue}`} delta="Total lifetime" />
        <MetricCard label="Orders" value={stats.orderCount.toString()} delta="Total lifetime" />
        <MetricCard label="Customers" value={stats.userCount.toString()} delta="Registered users" />
        <MetricCard label="Low stock" value={stats.lowStockCount.toString()} delta="Needs attention" />
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
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="activity-item">
                <div className="item-info">
                  <span className="item-id">{order.orderId}</span>
                  <span className="item-meta">{order.user?.name || order.guestInfo?.name}</span>
                </div>
                <Badge variant={order.status === 'delivered' ? 'success' : 'warning'}>
                  {order.status}
                </Badge>
                <span className="item-amount">৳{order.totalAmount}</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="panel-footer" onClick={() => navigate("/orders")}>
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
            {stats.recentProducts.map((product) => (
              <div key={product._id} className="activity-item">
                <div className="item-info">
                  <span className="item-id">{product.name}</span>
                  <span className="item-meta">{product.stock} units</span>
                </div>
                <Badge variant={product.status === 'Live' ? 'success' : 'warning'}>
                  {product.status}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="panel-footer" onClick={() => navigate("/products")}>
            Manage inventory
          </Button>
        </Card>
      </div>
    </div>
  );
}
