import { useState, useEffect } from "react";
import { Zap, Save, Play, Pause } from "lucide-react";
import { fetchFlashSale, upsertFlashSale, toggleFlashSale, fetchProducts } from "../../../lib/api/queries";
import { Button, Card, SectionHeader, Input } from "../../../components/ui";
import { triggerAdminToast } from "../../../components/ui/AdminToast";
import "./FlashSalePage.css";

export default function FlashSalePage() {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    title: "Flash Sale",
    discountPercent: 0,
    countdownSeconds: 86400,
    startDate: "",
    endDate: "",
    products: [],
  });

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const [saleRes, prodRes] = await Promise.all([
          fetchFlashSale(),
          fetchProducts({ signal: ctrl.signal }),
        ]);
        if (saleRes.success && saleRes.data) {
          setSale(saleRes.data);
          setForm({
            title: saleRes.data.title || "Flash Sale",
            discountPercent: saleRes.data.discountPercent || 0,
            countdownSeconds: saleRes.data.countdownSeconds ?? 86400,
            startDate: saleRes.data.startDate
              ? new Date(saleRes.data.startDate).toISOString().slice(0, 16)
              : "",
            endDate: saleRes.data.endDate
              ? new Date(saleRes.data.endDate).toISOString().slice(0, 16)
              : "",
            products: saleRes.data.products?.map((p) => (typeof p === "string" ? p : p._id)) || [],
          });
        }
        if (prodRes.success) setProducts(prodRes.data);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error(err);
          triggerAdminToast("Failed to load flash sale data", "error");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const handleToggle = async () => {
    try {
      const res = await toggleFlashSale();
      if (res.success) {
        setSale(res.data);
        triggerAdminToast(res.data.isActive ? "Flash Sale Activated" : "Flash Sale Deactivated", "success");
      }
    } catch (err) {
      triggerAdminToast("Failed to toggle flash sale", "error");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        discountPercent: Number(form.discountPercent),
        countdownSeconds: Number(form.countdownSeconds),
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        products: form.products,
      };
      if (!sale) payload.isActive = false;
      const res = await upsertFlashSale(payload);
      if (res.success) {
        setSale(res.data);
        triggerAdminToast("Flash Sale saved successfully", "success");
      }
    } catch (err) {
      triggerAdminToast(err.response?.data?.message || "Failed to save flash sale", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleProduct = (id) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.includes(id)
        ? prev.products.filter((p) => p !== id)
        : [...prev.products, id],
    }));
  };

  if (loading) return <div className="admin-page"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <SectionHeader
        title="Flash Sale Manager"
        description="Configure and manage the flash sale section shown on the homepage."
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: sale?.isActive ? "var(--color-success)" : "var(--color-text-muted)" }}>
            {sale?.isActive ? "Active" : "Inactive"}
          </span>
          <Button
            variant={sale?.isActive ? "outline" : "primary"}
            onClick={handleToggle}
            disabled={!sale}
          >
            {sale?.isActive ? <><Pause size={16} /> Deactivate</> : <><Play size={16} /> Activate</>}
          </Button>
        </div>
      </SectionHeader>

      <div className="flash-sale-grid">
        <Card className="flash-sale-card">
          <h3 className="flash-sale-card-title"><Zap size={18} /> Sale Settings</h3>
          <form onSubmit={handleSave} style={{ display: "grid", gap: "1rem", marginTop: "1.25rem" }}>
            <Input
              label="Sale Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              label="Discount Percentage (%)"
              type="number"
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
              min="0"
              max="100"
              required
            />
            <Input
              label="Countdown (seconds)"
              type="number"
              value={form.countdownSeconds}
              onChange={(e) => setForm({ ...form, countdownSeconds: e.target.value })}
              min="0"
              required
            />
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="input-field"
              />
            </div>
            <Button type="submit" disabled={saving}>
              <Save size={16} /> {saving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Card>

        <Card className="flash-sale-card">
          <h3 className="flash-sale-card-title"><Zap size={18} /> Select Products</h3>
          <p className="flash-sale-hint">Choose which products appear in the flash sale section.</p>
          <div className="products-select-list">
            {products.length === 0 && <p className="muted">No products available.</p>}
            {products.map((p) => (
              <label key={p._id} className={`product-select-item ${form.products.includes(p._id) ? "selected" : ""}`}>
                <input
                  type="checkbox"
                  checked={form.products.includes(p._id)}
                  onChange={() => toggleProduct(p._id)}
                />
                <div className="product-select-thumb">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} /> : <Zap size={14} />}
                </div>
                <div className="product-select-info">
                  <strong>{p.name}</strong>
                  <small>৳{p.price} {p.oldPrice && p.oldPrice > p.price ? `(was ৳${p.oldPrice})` : ""}</small>
                </div>
              </label>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
