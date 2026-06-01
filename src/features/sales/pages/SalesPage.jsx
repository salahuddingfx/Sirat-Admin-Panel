import { useState, useEffect, useMemo, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { DollarSign, ShoppingBag, BarChart3, Activity, CreditCard, Download, Printer, Calendar, RefreshCw } from "lucide-react";
import { fetchOrders } from "../../../lib/api/queries";
import { Card, SectionHeader, MetricCard, Button } from "../../../components/ui";
import { triggerAdminToast } from "../../../components/ui/AdminToast";

export function SalesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all"); // 7days, 30days, all, custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const reportRef = useRef(null);

  const loadOrders = async () => {
    setLoading(true);
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
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders based on time range / dates
  const filteredOrders = useMemo(() => {
    if (timeRange === "custom") {
      if (!startDate && !endDate) return orders;
      return orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        
        let startMatch = true;
        let endMatch = true;
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          startMatch = orderDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          endMatch = orderDate <= end;
        }
        
        return startMatch && endMatch;
      });
    }

    if (timeRange === "all") return orders;

    const now = new Date();
    let cutoff = new Date();
    if (timeRange === "7days") {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeRange === "30days") {
      cutoff.setDate(now.getDate() - 30);
    }
    cutoff.setHours(0,0,0,0);

    return orders.filter(o => new Date(o.createdAt) >= cutoff);
  }, [orders, timeRange, startDate, endDate]);

  // Financial calculations
  const stats = useMemo(() => {
    if (filteredOrders.length === 0) {
      return { revenue: 0, cost: 0, profit: 0, shipping: 0, gross: 0, count: 0, aov: 0 };
    }

    let gross = 0; // total collected including shipping
    let shipping = 0; // total shipping charges
    let revenue = 0; // net sales (gross - shipping)
    let cost = 0; // product cost

    filteredOrders.forEach(o => {
      gross += o.totalAmount;
      shipping += (o.shippingCharge || 0);
      
      // Calculate revenue & cost at item level
      o.items?.forEach(item => {
        const itemPrice = item.price || 0;
        const itemQty = item.quantity || 0;
        revenue += itemPrice * itemQty;
        
        // Fallback cost to 50% of selling price if costPrice is not defined
        const itemCost = item.product?.costPrice ?? (itemPrice * 0.5);
        cost += itemCost * itemQty;
      });
    });

    const profit = revenue - cost;
    const count = filteredOrders.length;
    const aov = count > 0 ? Math.round(revenue / count) : 0;

    return { revenue, cost, profit, shipping, gross, count, aov };
  }, [filteredOrders]);

  // Chart data: Group revenue & orders by date
  const timelineData = useMemo(() => {
    if (filteredOrders.length === 0) return [];

    const grouped = {};
    [...filteredOrders].reverse().forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!grouped[dateStr]) {
        grouped[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      }
      
      // Accumulate product-only revenue (excluding shipping charge)
      o.items?.forEach(item => {
        grouped[dateStr].revenue += (item.price * item.quantity);
      });
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

  // Export to CSV/Excel Action
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      triggerAdminToast("No data to export", "warning");
      return;
    }

    // Define CSV Headers
    const headers = [
      "Order ID",
      "Customer Name",
      "Date",
      "Payment Method",
      "Items Count",
      "Courier Charge (৳)",
      "Product Sales (৳)",
      "Total Paid (৳)",
      "Fulfillment Status"
    ];

    // Map order rows
    const rows = filteredOrders.map(o => {
      const date = new Date(o.createdAt).toLocaleDateString();
      const customer = o.user?.name || o.guestInfo?.name || "Guest User";
      const payment = o.paymentMethod?.toUpperCase();
      const itemsCount = (o.items || []).reduce((sum, item) => sum + item.quantity, 0);
      const shipping = o.shippingCharge || 0;
      const netSales = o.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const total = o.totalAmount;
      const status = o.status?.toUpperCase();

      return [
        o.orderId,
        `"${customer.replace(/"/g, '""')}"`,
        date,
        payment,
        itemsCount,
        shipping,
        netSales,
        total,
        status
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sirat_Sales_Report_${timeRange}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAdminToast("Report exported successfully", "success");
  };

  // Print PDF Action
  const handlePrintPDF = () => {
    window.print();
  };

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
    <div className="admin-page sales-page-container" style={{ display: "grid", gap: "2rem" }}>
      {/* CSS Styles for Print Customization */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .sidebar, .header, .section-header__actions, .time-filter-controls, .print-hide, .action-circle-btn, button {
            display: none !important;
          }
          .app-main, .app-layout {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          .admin-page {
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }
          .product-card {
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            margin-bottom: 20px !important;
            break-inside: avoid;
            background: #fff !important;
          }
          .metrics-grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
          }
          .printable-records-table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 20px !important;
          }
          .printable-records-table th, .printable-records-table td {
            border: 1px solid #ddd !important;
            padding: 8px !important;
            text-align: left !important;
            font-size: 11px !important;
          }
          .printable-header {
            display: block !important;
            margin-bottom: 30px !important;
          }
        }
        .time-filter-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          background: var(--color-surface);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        .date-picker-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .date-input {
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          color: var(--color-text);
          font-family: var(--font-sans);
          font-size: 0.875rem;
        }
        .sales-table-wrapper {
          overflow-x: auto;
          margin-top: 1rem;
        }
        .sales-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .sales-table th {
          background: var(--color-surface-soft);
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--color-text);
          border-bottom: 2px solid var(--color-border);
        }
        .sales-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-muted);
        }
        .sales-table tr:hover td {
          color: var(--color-text);
          background: var(--color-surface-soft);
        }
      `}</style>

      {/* Print PDF Header (Only visible on Print PDF) */}
      <div className="printable-header" style={{ display: "none" }}>
        <h1 style={{ margin: "0 0 5px" }}>SIRAT CLOTHING</h1>
        <p style={{ margin: "0 0 15px", color: "#666" }}>Sales Analytics & Ledger Report ({timeRange === "custom" ? `${startDate} to ${endDate}` : timeRange.toUpperCase()})</p>
        <hr style={{ border: "0", borderTop: "2px solid #333" }} />
      </div>

      <SectionHeader
        eyebrow="Financial Ledger"
        title="Sales Analytics"
        description="Monitor store earnings, product production costs, courier charges, and net profits."
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button variant="outline" onClick={handleExportCSV} style={{ gap: "0.5rem" }} className="print-hide">
              <Download size={16} /> Export CSV
            </Button>
            <Button onClick={handlePrintPDF} style={{ gap: "0.5rem" }} className="print-hide">
              <Printer size={16} /> Print Report
            </Button>
          </div>
        }
      />

      {/* Date Filters Controls */}
      <div className="time-filter-controls">
        <div style={{ display: "flex", gap: "0.25rem", background: "var(--color-bg)", padding: "4px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
          {["7days", "30days", "all", "custom"].map((range) => (
            <button
              key={range}
              style={{
                background: timeRange === range ? "var(--color-primary)" : "transparent",
                color: timeRange === range ? "#fff" : "var(--color-text-muted)",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "0.8125rem",
                cursor: "pointer",
                fontWeight: 600,
                transition: "var(--transition-fast)"
              }}
              onClick={() => setTimeRange(range)}
            >
              {range === "7days" ? "7 Days" : range === "30days" ? "30 Days" : range === "all" ? "All Time" : "Custom Range"}
            </button>
          ))}
        </div>

        {timeRange === "custom" && (
          <div className="date-picker-group">
            <Calendar size={16} className="muted" />
            <input 
              type="date" 
              className="date-input" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
            />
            <span className="muted">to</span>
            <input 
              type="date" 
              className="date-input" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
            />
          </div>
        )}

        <button 
          onClick={loadOrders} 
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-primary)", fontSize: "0.8125rem", fontWeight: 600, marginLeft: "auto" }}
          className="print-hide"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        <MetricCard
          label="Net Sales Revenue"
          value={`৳${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          delta="Excludes delivery charges"
        />
        <MetricCard
          label="Estimated Cost"
          value={`৳${stats.cost.toLocaleString()}`}
          icon={ShoppingBag}
          delta="Product production expense"
        />
        <MetricCard
          label="Net Profit"
          value={`৳${stats.profit.toLocaleString()}`}
          icon={Activity}
          delta={`${stats.revenue > 0 ? Math.round((stats.profit / stats.revenue) * 100) : 0}% net profit margin`}
        />
        <MetricCard
          label="Courier Shipping Fees"
          value={`৳${stats.shipping.toLocaleString()}`}
          icon={CreditCard}
          delta="Courier payouts"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="product-card" style={{ padding: "3rem", textAlign: "center" }}>
          <BarChart3 size={48} className="muted" style={{ margin: "0 auto 1rem" }} />
          <h3>No records found for this period</h3>
          <p className="muted">Try adjusting your filters or date selectors.</p>
        </Card>
      ) : (
        <>
          {/* Timeline Chart */}
          <Card className="product-card" style={{ padding: "2rem" }}>
            <h3 style={{ margin: "0 0 1.5rem" }}>Timeline (Net Sales vs Orders Count)</h3>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--color-surface)", 
                      borderColor: "var(--color-border)",
                      borderRadius: "8px",
                      color: "var(--color-text)",
                      fontFamily: "var(--font-sans)"
                    }} 
                  />
                  <Area type="monotone" name="Net Product Sales (৳)" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" name="Orders Checked Out" dataKey="orders" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Breakdown grids */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }} className="print-hide">
            {/* Status Breakdown Bar chart */}
            <Card className="product-card" style={{ padding: "2rem" }}>
              <h3 style={{ margin: "0 0 1.5rem" }}>Order Status Breakdown</h3>
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                    <XAxis type="number" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                    <YAxis type="category" dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "8px" }} />
                    <Bar dataKey="count" name="Total Orders" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Payment Method Pie Chart */}
            <Card className="product-card" style={{ padding: "2rem" }}>
              <h3 style={{ margin: "0 0 1.5rem" }}>Payment Gateways Share</h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", height: 240 }}>
                <div style={{ width: 160, height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {paymentData.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "2px", backgroundColor: item.color }} />
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span className="muted">({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Ledger / Sales Record Table */}
          <Card className="product-card" style={{ padding: "2rem" }}>
            <h3 style={{ margin: "0 0 1rem" }}>Sales Ledger Records ({filteredOrders.length})</h3>
            <div className="sales-table-wrapper">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Gateway</th>
                    <th>Courier Fee</th>
                    <th>Net Sales</th>
                    <th>Total Paid</th>
                    <th>Fulfillment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => {
                    const customer = o.user?.name || o.guestInfo?.name || "Guest";
                    const netSales = o.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    return (
                      <tr key={o._id}>
                        <td style={{ fontWeight: 700 }}>{o.orderId}</td>
                        <td>{customer}</td>
                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td style={{ textTransform: "uppercase" }}>{o.paymentMethod}</td>
                        <td>৳{o.shippingCharge || 0}</td>
                        <td>৳{netSales}</td>
                        <td style={{ fontWeight: 700 }}>৳{o.totalAmount}</td>
                        <td>
                          <span className={`badge ${
                            o.status === "delivered" ? "badge-success" : 
                            o.status === "cancelled" ? "badge-outline" : "badge-warning"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Printable Native Table (Only rendered when printed) */}
            <table className="printable-records-table" style={{ display: "none" }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Gateway</th>
                  <th>Courier Fee</th>
                  <th>Net Product Sales</th>
                  <th>Total Paid</th>
                  <th>Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const customer = o.user?.name || o.guestInfo?.name || "Guest";
                  const netSales = o.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  return (
                    <tr key={o._id}>
                      <td>{o.orderId}</td>
                      <td>{customer}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>{o.paymentMethod?.toUpperCase()}</td>
                      <td>৳{o.shippingCharge || 0}</td>
                      <td>৳{netSales}</td>
                      <td>৳{o.totalAmount}</td>
                      <td>{o.status?.toUpperCase()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
