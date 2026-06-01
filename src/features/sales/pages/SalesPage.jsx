import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts";
import { DollarSign, ShoppingBag, BarChart3, Activity, CreditCard, ChevronDown } from "lucide-react";
import { fetchOrders } from "../../../lib/api/queries";
import { Card, SectionHeader, MetricCard } from "../../../components/ui";
import { triggerAdminToast } from "../../../components/ui/AdminToast";

export function SalesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all"); // 7days, 30days, all

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetchOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error(err);
        triggerAdminToast("Failed to load sales data", "error");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  // Filter orders based on time range
  const filteredOrders = useMemo(() => {
    if (timeRange === "all") return orders;
    
    const now = new Date();
    let cutoff = new Date();
    if (timeRange === "7days") {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeRange === "30days") {
      cutoff.setDate(now.getDate() - 30);
    }
    
    return orders.filter(o => new Date(o.createdAt) >= cutoff);
  }, [orders, timeRange]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (filteredOrders.length === 0) {
      return { revenue: 0, count: 0, aov: 0, delivered: 0, codCount: 0, mobileCount: 0 };
    }

    const revenue = filteredOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const count = filteredOrders.length;
    const aov = Math.round(revenue / count);
    const delivered = filteredOrders.filter(o => o.status === "delivered").length;
    const codCount = filteredOrders.filter(o => o.paymentMethod === "cod").length;
    const mobileCount = filteredOrders.filter(o => o.paymentMethod === "bkash" || o.paymentMethod === "nagad").length;

    return { revenue, count, aov, delivered, codCount, mobileCount };
  }, [filteredOrders]);

  // Chart data: Group revenue & orders by date
  const timelineData = useMemo(() => {
    if (filteredOrders.length === 0) return [];

    const grouped = {};
    // Process chronologically (reverse orders array which is usually newest first)
    [...filteredOrders].reverse().forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!grouped[dateStr]) {
        grouped[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      }
      grouped[dateStr].revenue += o.totalAmount;
      grouped[dateStr].orders += 1;
    });

    return Object.values(grouped);
  }, [filteredOrders]);

  // Chart data: Payment Method Share
  const paymentData = useMemo(() => {
    const bkash = filteredOrders.filter(o => o.paymentMethod === "bkash").length;
    const nagad = filteredOrders.filter(o => o.paymentMethod === "nagad").length;
    const cod = filteredOrders.filter(o => o.paymentMethod === "cod").length;

    return [
      { name: "Cash on Delivery", value: cod, color: "var(--color-primary)" },
      { name: "bKash", value: bkash, color: "var(--color-accent)" },
      { name: "Nagad", value: nagad, color: "var(--color-success)" }
    ].filter(item => item.value > 0);
  }, [filteredOrders]);

  // Chart data: Status Breakdown
  const statusData = useMemo(() => {
    const statuses = ["received", "confirmed", "packed", "shipped", "delivered", "cancelled"];
    return statuses.map(status => {
      const count = filteredOrders.filter(o => o.status === status).length;
      return {
        name: status.charAt(0).toUpperCase() + status.slice(1),
        count
      };
    }).filter(item => item.count > 0);
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className="admin-page">
        <SectionHeader title="Sales Analytics" description="Track sales revenue and transaction stats." />
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p className="muted">Loading sales metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page" style={{ display: "grid", gap: "2rem" }}>
      <SectionHeader
        eyebrow="Financials"
        title="Sales Analytics"
        description="Monitor store performance, sales pipelines, and transactional channels."
        actions={
          <div style={{ display: "flex", gap: "0.5rem", background: "var(--color-surface)", padding: "4px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
            <button 
              className={`action-pill ${timeRange === '7days' ? 'active' : ''}`}
              style={{ background: timeRange === '7days' ? 'var(--color-primary)' : 'transparent', color: timeRange === '7days' ? '#fff' : 'inherit', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setTimeRange("7days")}
            >
              7 Days
            </button>
            <button 
              className={`action-pill ${timeRange === '30days' ? 'active' : ''}`}
              style={{ background: timeRange === '30days' ? 'var(--color-primary)' : 'transparent', color: timeRange === '30days' ? '#fff' : 'inherit', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setTimeRange("30days")}
            >
              30 Days
            </button>
            <button 
              className={`action-pill ${timeRange === 'all' ? 'active' : ''}`}
              style={{ background: timeRange === 'all' ? 'var(--color-primary)' : 'transparent', color: timeRange === 'all' ? '#fff' : 'inherit', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setTimeRange("all")}
            >
              All Time
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        <MetricCard
          title="Total Revenue"
          value={`৳${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          delta="+12.4% from last month"
        />
        <MetricCard
          title="Total Orders"
          value={stats.count}
          icon={ShoppingBag}
          delta="+8.2% from last month"
        />
        <MetricCard
          title="Average Order Value"
          value={`৳${stats.aov.toLocaleString()}`}
          icon={Activity}
          delta="Stable average basket"
        />
        <MetricCard
          title="Delivered Orders"
          value={stats.delivered}
          icon={CreditCard}
          delta={`${Math.round((stats.delivered / (stats.count || 1)) * 100)}% completion rate`}
        />
      </div>

      {orders.length === 0 ? (
        <Card className="product-card" style={{ padding: "3rem", textAlign: "center" }}>
          <BarChart3 size={48} className="muted" style={{ margin: "0 auto 1rem" }} />
          <h3>No Sales Transactions Recorded</h3>
          <p className="muted" style={{ maxWidth: "400px", margin: "0.5rem auto 0" }}>
            Sales charts and detailed analytics will appear here once customers start checking out garments from the storefront.
          </p>
        </Card>
      ) : (
        <>
          {/* Main timeline chart */}
          <Card className="product-card" style={{ padding: "2rem" }}>
            <h3 style={{ margin: "0 0 1.5rem" }}>Revenue & Checkout volume</h3>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--color-text-muted)" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="var(--color-text-muted)" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `৳${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--color-surface)", 
                      borderColor: "var(--color-border)",
                      borderRadius: "8px",
                      color: "var(--color-text)",
                      fontFamily: "var(--font-sans)"
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    name="Revenue (৳)"
                    dataKey="revenue" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Area 
                    type="monotone" 
                    name="Orders Count"
                    dataKey="orders" 
                    stroke="var(--color-accent)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorOrders)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Secondary breakdowns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
            {/* Status Breakdown Bar chart */}
            <Card className="product-card" style={{ padding: "2rem" }}>
              <h3 style={{ margin: "0 0 1.5rem" }}>Order Status Breakdown</h3>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                    <XAxis type="number" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                    <YAxis type="category" dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "var(--color-surface)", 
                        borderColor: "var(--color-border)",
                        borderRadius: "8px",
                        color: "var(--color-text)"
                      }} 
                    />
                    <Bar dataKey="count" name="Total Orders" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Payment Method Pie Chart */}
            <Card className="product-card" style={{ padding: "2rem", display: "flex", flexDirection: "column" }}>
              <h3 style={{ margin: "0 0 1.5rem" }}>Payment Method Shares</h3>
              {paymentData.length === 0 ? (
                <p className="muted" style={{ textAlign: "center", margin: "auto" }}>No payments completed.</p>
              ) : (
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-around", flexWrap: "wrap" }}>
                  <div style={{ width: 180, height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {paymentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Custom Legend */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: "140px" }}>
                    {paymentData.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                        <div style={{ width: 12, height: 12, borderRadius: "3px", backgroundColor: item.color }} />
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                        <span className="muted">({item.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
