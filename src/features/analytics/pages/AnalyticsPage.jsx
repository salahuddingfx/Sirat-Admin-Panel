import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Eye,
  Activity,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  Search,
  RefreshCw,
  Wifi,
  ShoppingCart,
  Package,
  CreditCard,
  UserPlus,
  BarChart3,
  ChevronDown,
  X,
  Filter,
  ExternalLink,
  MousePointerClick,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  MetricCard,
  Card,
  SectionHeader,
  Badge,
  Button,
} from "../../../components/ui";
import {
  fetchAnalyticsOverview,
  fetchAnalyticsTimeline,
  fetchLiveVisitors,
  fetchAnalyticsVisitors,
  fetchAnalyticsEvents,
  fetchAnalyticsActions,
} from "../../../lib/api/queries";
import "./AnalyticsPage.css";

const PERIOD_OPTIONS = [
  { label: "Today", days: 1 },
  { label: "Last 7d", days: 7 },
  { label: "Last 30d", days: 30 },
  { label: "Last 90d", days: 90 },
];

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const formatNumber = (n) => {
  if (n === null || n === undefined) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
};

const formatDuration = (ms) => {
  if (!ms || ms < 1000) return "0s";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

const formatTimeAgo = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const EventIcon = ({ type }) => {
  const map = {
    pageview: <Eye size={14} />,
    product_view: <Package size={14} />,
    add_to_cart: <ShoppingCart size={14} />,
    remove_from_cart: <ShoppingCart size={14} />,
    checkout_start: <CreditCard size={14} />,
    purchase: <CreditCard size={14} />,
    search: <Search size={14} />,
    signup: <UserPlus size={14} />,
    login: <UserPlus size={14} />,
    logout: <UserPlus size={14} />,
    newsletter_subscribe: <MousePointerClick size={14} />,
    contact_submit: <MousePointerClick size={14} />,
    order_track: <Package size={14} />,
    category_view: <Filter size={14} />,
  };
  return map[type] || <Activity size={14} />;
};

const EventBadge = ({ type }) => {
  const categoryColors = {
    navigation: "info",
    engagement: "default",
    commerce: "success",
    auth: "warning",
    search: "info",
    form: "warning",
    error: "error",
  };
  return (
    <span className={`event-badge event-badge--${categoryColors[type] || "default"}`}>
      <EventIcon type={type} />
      <span>{type.replace(/_/g, " ")}</span>
    </span>
  );
};

const ChangeIndicator = ({ value }) => {
  if (value === 0 || value === undefined) return <span className="change-flat">—</span>;
  const isPositive = value > 0;
  return (
    <span className={`change-indicator ${isPositive ? "change-up" : "change-down"}`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(value)}%
    </span>
  );
};

export function AnalyticsPage() {
  const [periodDays, setPeriodDays] = useState(30);
  const [overview, setOverview] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [live, setLive] = useState([]);
  const [visitors, setVisitors] = useState({ items: [], total: 0 });
  const [events, setEvents] = useState({ items: [], total: 0 });
  const [actions, setActions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visitorFilter, setVisitorFilter] = useState({ country: "", device: "", search: "" });
  const [eventFilter, setEventFilter] = useState({ type: "", category: "" });
  const [activeTab, setActiveTab] = useState("overview");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [ov, tl, lv, vs, ev, ax] = await Promise.all([
        fetchAnalyticsOverview(periodDays),
        fetchAnalyticsTimeline(Math.min(periodDays, 30)),
        fetchLiveVisitors(50),
        fetchAnalyticsVisitors({ page: 1, limit: 50, ...visitorFilter }),
        fetchAnalyticsEvents({ page: 1, limit: 100, ...eventFilter }),
        fetchAnalyticsActions(periodDays),
      ]);
      if (ov.success) setOverview(ov.data);
      if (tl.success) setTimeline(tl.data);
      if (lv.success) setLive(lv.data);
      if (vs.success) setVisitors(vs.data);
      if (ev.success) setEvents(ev.data);
      if (ax.success) setActions(ax.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodDays, visitorFilter, eventFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => {
      fetchLiveVisitors(50)
        .then((r) => r.success && setLive(r.data))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const mergedTimeline = useMemo(() => {
    if (!timeline) return [];
    const map = new Map();
    timeline.visitorsByDay.forEach((d) => {
      map.set(d.date, { date: d.date, visitors: d.visitors, pageviews: d.pageviews, events: 0 });
    });
    timeline.eventsByDay.forEach((d) => {
      const existing = map.get(d.date) || { date: d.date, visitors: 0, pageviews: 0, events: 0 };
      existing.events = d.events;
      map.set(d.date, existing);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [timeline]);

  const deviceChartData = useMemo(() => {
    if (!overview?.deviceBreakdown) return [];
    return overview.deviceBreakdown.map((d) => ({
      name: d.type.charAt(0).toUpperCase() + d.type.slice(1),
      value: d.count,
    }));
  }, [overview]);

  const browserChartData = useMemo(() => {
    if (!overview?.topBrowsers) return [];
    return overview.topBrowsers;
  }, [overview]);

  if (loading && !overview) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">Loading analytics…</div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <SectionHeader
        title="Analytics"
        eyebrow="Visitor Insights"
        actions={
          <div className="analytics-toolbar">
            <div className="period-selector">
              {PERIOD_OPTIONS.map((p) => (
                <button
                  key={p.days}
                  className={`period-btn ${periodDays === p.days ? "active" : ""}`}
                  onClick={() => setPeriodDays(p.days)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => load(true)}
              disabled={refreshing}
              startIcon={<RefreshCw size={14} className={refreshing ? "spinning" : ""} />}
            >
              Refresh
            </Button>
          </div>
        }
      />

      <div className="analytics-tabs">
        {["overview", "live", "visitors", "events", "actions"].map((tab) => (
          <button
            key={tab}
            className={`analytics-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "live" && <Wifi size={14} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "live" && live.length > 0 && (
              <span className="tab-count tab-count--live">{live.length}</span>
            )}
            {tab === "events" && events.total > 0 && (
              <span className="tab-count">{events.total}</span>
            )}
            {tab === "visitors" && visitors.total > 0 && (
              <span className="tab-count">{visitors.total}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && overview && (
        <div className="analytics-tab-panel">
          <div className="metric-grid metric-grid--4">
            <MetricCard
              title="Total Visitors"
              value={formatNumber(overview.totals.visitors)}
              icon={Users}
              delta={<ChangeIndicator value={overview.periodChange.visitors} />}
              subtext={`${overview.periodStats.visitors} in last ${periodDays}d`}
            />
            <MetricCard
              title="Page Views"
              value={formatNumber(overview.totals.pageviews)}
              icon={Eye}
              delta={<ChangeIndicator value={overview.periodChange.pageviews} />}
              subtext={`${formatNumber(overview.periodStats.pageviews)} in last ${periodDays}d`}
            />
            <MetricCard
              title="Total Events"
              value={formatNumber(overview.totals.events)}
              icon={Activity}
              subtext={`${formatNumber(overview.periodStats.events)} in last ${periodDays}d`}
            />
            <MetricCard
              title="Countries"
              value={overview.totals.countries}
              icon={Globe}
              subtext={`${overview.totals.cities} unique cities`}
            />
          </div>

          <div className="metric-grid metric-grid--3 analytics-live-strip">
            <Card className="live-stat">
              <div className="live-stat__pulse" />
              <div className="live-stat__value">{overview.live.online}</div>
              <div className="live-stat__label">Online right now</div>
            </Card>
            <Card className="live-stat">
              <Clock size={20} className="muted" />
              <div className="live-stat__value">{overview.live.active}</div>
              <div className="live-stat__label">Active (last 30 min)</div>
            </Card>
            <Card className="live-stat">
              <BarChart3 size={20} className="muted" />
              <div className="live-stat__value">{formatNumber(overview.periodStats.uniqueSessions)}</div>
              <div className="live-stat__label">Unique sessions</div>
            </Card>
          </div>

          <Card className="analytics-card">
            <SectionHeader
              title="Traffic Timeline"
              eyebrow={`Last ${Math.min(periodDays, 30)} days`}
            />
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={mergedTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pageviewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="date"
                    stroke="var(--color-text-muted)"
                    fontSize={11}
                    tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 6,
                      fontSize: "0.75rem",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#f59e0b"
                    fill="url(#visitorsGradient)"
                    name="Visitors"
                  />
                  <Area
                    type="monotone"
                    dataKey="pageviews"
                    stroke="#3b82f6"
                    fill="url(#pageviewsGradient)"
                    name="Page Views"
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    stroke="#10b981"
                    fill="transparent"
                    name="Events"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="analytics-two-col">
            <Card className="analytics-card">
              <SectionHeader title="Top Countries" eyebrow="Geographic distribution" />
              {overview.topCountries.length === 0 ? (
                <div className="empty-state">No data yet</div>
              ) : (
                <div className="bar-list">
                  {overview.topCountries.map((c) => {
                    const max = overview.topCountries[0]?.count || 1;
                    return (
                      <div key={c.country} className="bar-row">
                        <div className="bar-row__label">
                          <MapPin size={12} className="muted" />
                          <span>{c.country || "Unknown"}</span>
                        </div>
                        <div className="bar-row__bar-wrap">
                          <div
                            className="bar-row__bar"
                            style={{ width: `${(c.count / max) * 100}%` }}
                          />
                        </div>
                        <div className="bar-row__count">{formatNumber(c.count)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="analytics-card">
              <SectionHeader title="Top Cities" eyebrow="Where visitors are" />
              {overview.topCities.length === 0 ? (
                <div className="empty-state">No data yet</div>
              ) : (
                <div className="bar-list">
                  {overview.topCities.map((c) => {
                    const max = overview.topCities[0]?.count || 1;
                    return (
                      <div key={`${c.country}-${c.city}`} className="bar-row">
                        <div className="bar-row__label">
                          <MapPin size={12} className="muted" />
                          <span>
                            {c.city || "Unknown"}
                            {c.country ? <span className="muted"> · {c.country}</span> : null}
                          </span>
                        </div>
                        <div className="bar-row__bar-wrap">
                          <div
                            className="bar-row__bar"
                            style={{ width: `${(c.count / max) * 100}%` }}
                          />
                        </div>
                        <div className="bar-row__count">{formatNumber(c.count)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="analytics-two-col">
            <Card className="analytics-card">
              <SectionHeader title="Devices" eyebrow="Visitor device split" />
              {deviceChartData.length === 0 ? (
                <div className="empty-state">No data yet</div>
              ) : (
                <div style={{ width: "100%", height: 240 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={deviceChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {deviceChartData.map((entry, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 6,
                          fontSize: "0.75rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card className="analytics-card">
              <SectionHeader title="Browsers" eyebrow="Top browser breakdown" />
              {browserChartData.length === 0 ? (
                <div className="empty-state">No data yet</div>
              ) : (
                <div style={{ width: "100%", height: 240 }}>
                  <ResponsiveContainer>
                    <BarChart data={browserChartData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis type="number" stroke="var(--color-text-muted)" fontSize={11} />
                      <YAxis dataKey="browser" type="category" stroke="var(--color-text-muted)" fontSize={11} width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 6,
                          fontSize: "0.75rem",
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <div className="analytics-two-col">
            <Card className="analytics-card">
              <SectionHeader title="Top Pages" eyebrow="Most visited" />
              {overview.topPages.length === 0 ? (
                <div className="empty-state">No data yet</div>
              ) : (
                <div className="bar-list">
                  {overview.topPages.map((p) => {
                    const max = overview.topPages[0]?.count || 1;
                    return (
                      <div key={p.path} className="bar-row">
                        <div className="bar-row__label" title={p.path}>
                          <span className="path-pill">{p.path}</span>
                        </div>
                        <div className="bar-row__bar-wrap">
                          <div
                            className="bar-row__bar"
                            style={{ width: `${(p.count / max) * 100}%` }}
                          />
                        </div>
                        <div className="bar-row__count">{formatNumber(p.count)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="analytics-card">
              <SectionHeader title="Top Referrers" eyebrow="Where traffic comes from" />
              {overview.topReferrers.length === 0 ? (
                <div className="empty-state">No data yet (direct visits only)</div>
              ) : (
                <div className="bar-list">
                  {overview.topReferrers.map((r) => {
                    const max = overview.topReferrers[0]?.count || 1;
                    return (
                      <div key={r.referrer} className="bar-row">
                        <div className="bar-row__label">
                          <ExternalLink size={12} className="muted" />
                          <span>{r.referrer}</span>
                        </div>
                        <div className="bar-row__bar-wrap">
                          <div
                            className="bar-row__bar"
                            style={{ width: `${(r.count / max) * 100}%` }}
                          />
                        </div>
                        <div className="bar-row__count">{formatNumber(r.count)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === "live" && (
        <div className="analytics-tab-panel">
          <Card className="analytics-card">
            <SectionHeader
              title="Live Visitors"
              eyebrow="Active in the last 5 minutes"
              actions={<Badge variant="success">{live.length} online</Badge>}
            />
            {live.length === 0 ? (
              <div className="empty-state">No active visitors right now</div>
            ) : (
              <div className="table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>Location</th>
                      <th>Device</th>
                      <th>Browser / OS</th>
                      <th>Activity</th>
                      <th>Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {live.map((v) => (
                      <tr key={v.sessionId}>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">
                              {v.isLoggedIn ? "Member" : "Guest"}
                            </span>
                            <span className="cell-secondary">{v.sessionId.slice(0, 16)}…</span>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">{v.city || "Unknown"}</span>
                            <span className="cell-secondary">{v.country || "Unknown"}</span>
                          </div>
                        </td>
                        <td>
                          <Badge variant={v.device === "mobile" ? "info" : "default"}>
                            {v.device === "mobile" ? <Smartphone size={11} /> : v.device === "tablet" ? <Tablet size={11} /> : <Monitor size={11} />}
                            <span style={{ marginLeft: 4 }}>{v.device}</span>
                          </Badge>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">{v.browser}</span>
                            <span className="cell-secondary">{v.os}</span>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">
                              {v.pagesViewed} pages · {v.eventsCount} events
                            </span>
                            {v.landingPage && (
                              <span className="cell-secondary path-pill path-pill--small">
                                {v.landingPage}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="cell-secondary">{formatTimeAgo(v.lastSeen)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "visitors" && (
        <div className="analytics-tab-panel">
          <Card className="analytics-card">
            <div className="analytics-filters">
              <div className="search-field">
                <Search size={14} className="search-icon muted" />
                <input
                  type="text"
                  placeholder="Search by city, IP, page…"
                  value={visitorFilter.search}
                  onChange={(e) => setVisitorFilter({ ...visitorFilter, search: e.target.value })}
                />
              </div>
              <select
                value={visitorFilter.device}
                onChange={(e) => setVisitorFilter({ ...visitorFilter, device: e.target.value })}
                className="select-input"
              >
                <option value="">All devices</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>
              <input
                type="text"
                placeholder="Country"
                value={visitorFilter.country}
                onChange={(e) => setVisitorFilter({ ...visitorFilter, country: e.target.value })}
                className="select-input"
              />
              <Button
                variant="ghost"
                onClick={() => setVisitorFilter({ country: "", device: "", search: "" })}
                startIcon={<X size={12} />}
              >
                Clear
              </Button>
              <span className="muted" style={{ marginLeft: "auto", fontSize: "0.75rem" }}>
                {visitors.total} total
              </span>
            </div>

            {visitors.items.length === 0 ? (
              <div className="empty-state">No visitors match the filters</div>
            ) : (
              <div className="table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Session</th>
                      <th>IP</th>
                      <th>Location</th>
                      <th>Device</th>
                      <th>Browser / OS</th>
                      <th>Landing</th>
                      <th>Activity</th>
                      <th>Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.items.map((v) => (
                      <tr key={v.sessionId}>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">
                              {v.isLoggedIn ? "Member" : "Guest"}
                            </span>
                            <span className="cell-secondary" title={v.sessionId}>
                              {v.sessionId.slice(0, 18)}…
                            </span>
                          </div>
                        </td>
                        <td>
                          <code className="ip-pill">{v.ip || "—"}</code>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">
                              {v.city || "Unknown"}
                            </span>
                            <span className="cell-secondary">
                              {v.country || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <Badge variant={v.device === "mobile" ? "info" : v.device === "tablet" ? "warning" : "default"}>
                            {v.device === "mobile" ? <Smartphone size={11} /> : v.device === "tablet" ? <Tablet size={11} /> : <Monitor size={11} />}
                            <span style={{ marginLeft: 4 }}>{v.device}</span>
                          </Badge>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">
                              {v.browser} {v.os}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="path-pill path-pill--small">
                            {v.landingPage || "/"}
                          </span>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">
                              {v.pagesViewed} pages
                            </span>
                            <span className="cell-secondary">
                              {v.eventsCount} events
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">
                              {formatTimeAgo(v.lastSeen)}
                            </span>
                            <span className="cell-secondary">
                              {formatTime(v.lastSeen)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "events" && (
        <div className="analytics-tab-panel">
          <Card className="analytics-card">
            <div className="analytics-filters">
              <select
                value={eventFilter.type}
                onChange={(e) => setEventFilter({ ...eventFilter, type: e.target.value })}
                className="select-input"
              >
                <option value="">All event types</option>
                <option value="pageview">Pageview</option>
                <option value="product_view">Product View</option>
                <option value="add_to_cart">Add to Cart</option>
                <option value="remove_from_cart">Remove from Cart</option>
                <option value="checkout_start">Checkout Start</option>
                <option value="purchase">Purchase</option>
                <option value="search">Search</option>
                <option value="signup">Signup</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="newsletter_subscribe">Newsletter</option>
                <option value="contact_submit">Contact</option>
                <option value="order_track">Order Track</option>
              </select>
              <select
                value={eventFilter.category}
                onChange={(e) => setEventFilter({ ...eventFilter, category: e.target.value })}
                className="select-input"
              >
                <option value="">All categories</option>
                <option value="navigation">Navigation</option>
                <option value="engagement">Engagement</option>
                <option value="commerce">Commerce</option>
                <option value="auth">Auth</option>
                <option value="search">Search</option>
                <option value="form">Form</option>
                <option value="error">Error</option>
              </select>
              <Button
                variant="ghost"
                onClick={() => setEventFilter({ type: "", category: "" })}
                startIcon={<X size={12} />}
              >
                Clear
              </Button>
              <span className="muted" style={{ marginLeft: "auto", fontSize: "0.75rem" }}>
                {events.total} total events
              </span>
            </div>

            {events.items.length === 0 ? (
              <div className="empty-state">No events recorded yet</div>
            ) : (
              <div className="table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Event</th>
                      <th>Label / Value</th>
                      <th>Path</th>
                      <th>Location</th>
                      <th>Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.items.map((e) => (
                      <tr key={e._id}>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">
                              {formatTimeAgo(e.timestamp)}
                            </span>
                            <span className="cell-secondary">
                              {formatTime(e.timestamp)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <EventBadge type={e.type} />
                        </td>
                        <td>
                          <div className="cell-stack">
                            {e.label && (
                              <span className="cell-primary">{e.label}</span>
                            )}
                            {typeof e.value === "number" && e.value > 0 && (
                              <span className="cell-secondary">
                                {e.currency || ""} {e.value.toLocaleString()}
                              </span>
                            )}
                            {e.metadata && Object.keys(e.metadata).length > 0 && (
                              <code className="meta-pill">
                                {Object.entries(e.metadata).slice(0, 2).map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`).join(" · ")}
                              </code>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="path-pill path-pill--small">
                            {e.path || "—"}
                          </span>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">{e.city || "—"}</span>
                            <span className="cell-secondary">{e.country || "—"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="cell-secondary">
                            {e.device} · {e.browser}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "actions" && actions && (
        <div className="analytics-tab-panel">
          <div className="metric-grid metric-grid--4">
            <MetricCard
              title="Purchases"
              value={actions.funnel.find((f) => f.step === "purchase")?.count || 0}
              icon={CreditCard}
            />
            <MetricCard
              title="Checkouts Started"
              value={actions.funnel.find((f) => f.step === "checkout_start")?.count || 0}
              icon={ShoppingCart}
            />
            <MetricCard
              title="Add to Cart"
              value={actions.funnel.find((f) => f.step === "add_to_cart")?.count || 0}
              icon={ShoppingCart}
            />
            <MetricCard
              title="Product Views"
              value={actions.funnel.find((f) => f.step === "product_view")?.count || 0}
              icon={Package}
            />
          </div>

          <div className="analytics-two-col">
            <Card className="analytics-card">
              <SectionHeader title="Events by Type" eyebrow="Most common actions" />
              {actions.byType.length === 0 ? (
                <div className="empty-state">No events recorded yet</div>
              ) : (
                <div className="bar-list">
                  {actions.byType.slice(0, 12).map((e) => {
                    const max = actions.byType[0]?.count || 1;
                    return (
                      <div key={e.type} className="bar-row">
                        <div className="bar-row__label">
                          <EventBadge type={e.type} />
                        </div>
                        <div className="bar-row__bar-wrap">
                          <div
                            className="bar-row__bar"
                            style={{ width: `${(e.count / max) * 100}%` }}
                          />
                        </div>
                        <div className="bar-row__count">{formatNumber(e.count)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="analytics-card">
              <SectionHeader title="Conversion Funnel" eyebrow="Last 30 days" />
              {actions.funnel.length === 0 ? (
                <div className="empty-state">No funnel data</div>
              ) : (
                <div className="funnel">
                  {actions.funnel.map((step, i) => {
                    const max = actions.funnel[actions.funnel.length - 1]?.count || 1;
                    const next = actions.funnel[i + 1];
                    const conv = next ? Math.round((next.count / Math.max(step.count, 1)) * 100) : 100;
                    return (
                      <div key={step.step} className="funnel-step">
                        <div className="funnel-step__head">
                          <span className="funnel-step__label">
                            <EventBadge type={step.step} />
                          </span>
                          <span className="funnel-step__count">{formatNumber(step.count)}</span>
                        </div>
                        <div className="funnel-step__bar-wrap">
                          <div
                            className="funnel-step__bar"
                            style={{ width: `${(step.count / max) * 100}%` }}
                          />
                        </div>
                        {i < actions.funnel.length - 1 && (
                          <div className="funnel-step__conv">
                            <ChevronDown size={12} />
                            {conv}% continue
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <Card className="analytics-card">
            <SectionHeader
              title="Recent Purchases"
              eyebrow="What visitors are buying"
            />
            {actions.recentPurchases.length === 0 ? (
              <div className="empty-state">No purchases yet</div>
            ) : (
              <div className="table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Order</th>
                      <th>Value</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.recentPurchases.map((p, i) => (
                      <tr key={i}>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">{formatTimeAgo(p.timestamp)}</span>
                            <span className="cell-secondary">{formatTime(p.timestamp)}</span>
                          </div>
                        </td>
                        <td>
                          <code className="ip-pill">{p.label || "—"}</code>
                        </td>
                        <td>
                          <span className="cell-primary">
                            {p.currency || ""} {p.value?.toLocaleString() || "0"}
                          </span>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span className="cell-primary">{p.city}</span>
                            <span className="cell-secondary">{p.country}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
