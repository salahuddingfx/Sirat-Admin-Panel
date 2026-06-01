import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Boxes, ShoppingBag } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button, MetricCard, Card, SectionHeader, Badge } from "../../../components/ui";
import { fetchStats, fetchOrders } from "../../../lib/api/queries";
import "./DashboardPage.css";

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    revenue: 0,
    orderCount: 0,
    userCount: 0,
    lowStockCount: 0,
    recentOrders: [],
    recentProducts: []
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([fetchStats(), fetchOrders()]);
        if (statsRes.success) {
          setStats(prev => ({ ...prev, ...statsRes.data }));
        }
        if (ordersRes.success && ordersRes.data) {
          setOrders(ordersRes.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const chartData = useMemo(() => {
    // Generate dates for the last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dates.push({ date: dateStr, revenue: 0, orders: 0 });
    }

    // Populate with order data
    orders.forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayBucket = dates.find(d => d.date === dateStr);
      if (dayBucket) {
        // Exclude shipping charge from revenue
        const netAmt = o.totalAmount - (o.shippingCharge || 0);
        dayBucket.revenue += netAmt;
        dayBucket.orders += 1;
      }
    });

    return dates;
  }, [orders]);

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
        <MetricCard label="Orders" value={(stats.orderCount || 0).toString()} delta="Total lifetime" />
        <MetricCard label="Customers" value={(stats.userCount || 0).toString()} delta="Registered users" />
        <MetricCard label="Low stock" value={(stats.lowStockCount || 0).toString()} delta="Needs attention" />
      </div>

      {/* Sales Overview Graph */}
      {orders.length > 0 && (
        <Card className="dashboard-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Weekly Sales Revenue (Net)</h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--color-surface)", 
                    borderColor: "var(--color-border)",
                    borderRadius: "6px",
                    fontSize: "0.75rem"
                  }} 
                />
                <Area type="monotone" name="Net Sales (৳)" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={1.5} fillOpacity={1} fill="url(#dashRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="content-grid">
        <Card className="dashboard-panel">
          <SectionHeader 
            eyebrow="Orders" 
            title="Recent Activity" 
            description="Latest orders pending fulfillment."
            className="panel-header"
          />
          <div className="activity-list">
            {stats.recentOrders?.map((order) => (
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
            {stats.recentProducts?.map((product) => (
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
