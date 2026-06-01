import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import { fetchAllCoupons, deleteCoupon, createCoupon, updateCoupon } from "../../../lib/api/queries";
import { Button, Input, Card, SectionHeader } from "../../../components/ui";
import { triggerAdminConfirm } from "../../../components/ui/AdminConfirm";
import { triggerAdminToast } from "../../../components/ui/AdminToast";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minPurchase: 0,
    expiryDate: "",
    isActive: true
  });



  useEffect(() => {
    const controller = new AbortController();
    const fetchC = async () => {
        try {
          const res = await fetchAllCoupons({ signal: controller.signal });
          if (res.success) setCoupons(res.data);
        } catch (err) {
          if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
            console.error(err);
            triggerAdminToast("Failed to load coupons", "error");
          }
        } finally {
          setLoading(false);
        }
    };
    fetchC();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (currentCoupon) {
        setFormData({
            code: currentCoupon.code || "",
            discountType: currentCoupon.discountType || "percentage",
            discountValue: currentCoupon.discountValue || 0,
            minPurchase: currentCoupon.minPurchase || 0,
            expiryDate: currentCoupon.expiryDate ? new Date(currentCoupon.expiryDate).toISOString().split('T')[0] : "",
            isActive: currentCoupon.isActive ?? true
        });
    } else {
        setFormData({
            code: "",
            discountType: "percentage",
            discountValue: 0,
            minPurchase: 0,
            expiryDate: "",
            isActive: true
        });
    }
  }, [currentCoupon, isModalOpen]);

  const handleDelete = async (id) => {
    triggerAdminConfirm("Delete this coupon?", async () => {
      try {
        setIsProcessing(true);
        await deleteCoupon(id);
        setCoupons(coupons.filter((c) => c._id !== id));
        triggerAdminToast("Coupon deleted", "success");
      } catch (err) {
        triggerAdminToast("Failed to delete coupon", "error");
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = { ...formData };
    data.discountValue = Number(data.discountValue);
    data.minPurchase = Number(data.minPurchase) || 0;
    
    if (isNaN(data.discountValue)) {
        triggerAdminToast("Invalid discount value", "error");
        return;
    }

    if (!data.expiryDate || data.expiryDate.trim() === "") {
        delete data.expiryDate;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (currentCoupon) {
        res = await updateCoupon(currentCoupon._id, data);
        if (res.success) triggerAdminToast("Coupon updated successfully", "success");
      } else {
        res = await createCoupon(data);
        if (res.success) triggerAdminToast("Coupon created successfully", "success");
      }
      
      if (res.success) {
          setIsModalOpen(false);
          // Refresh list manually to avoid state sync issues
          const fresh = await fetchAllCoupons();
          if (fresh.success) setCoupons(fresh.data);
      } else {
          triggerAdminToast(res.message || "Operation failed", "error");
      }
    } catch (err) {
      console.error("Coupon save error:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to save coupon";
      triggerAdminToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <SectionHeader
        title="Discount Coupons"
        description="Create and manage promotional discount codes."
        actions={
          <Button onClick={() => { setCurrentCoupon(null); setIsModalOpen(true); }}>
            <Plus size={18} /> Generate Coupon
          </Button>
        }
      />

      <div className="grid-container" style={{ marginTop: "2rem" }}>
        {loading ? (
          <p>Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p>No coupons found.</p>
        ) : (
          <div className="products-list">
            {coupons.map((coupon) => (
              <Card key={coupon._id} className="product-card">
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                  <div className="product-image-preview" style={{ width: "60px", height: "60px", background: "var(--sirat-bg-alt)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sirat-gold)" }}>
                    <Tag size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, fontSize: "1.25rem", color: "var(--sirat-gold-soft)" }}>{coupon.code}</h4>
                        <span className={`badge ${coupon.isActive ? "badge-success" : "badge-outline"}`}>
                            {coupon.isActive ? "Active" : "Disabled"}
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem", fontSize: "0.875rem" }}>
                        <span>Type: <strong>{coupon.discountType === "percentage" ? "Percentage (%)" : "Fixed Amount"}</strong></span>
                        <span>Value: <strong>{coupon.discountValue}{coupon.discountType === "percentage" ? "%" : " BDT"}</strong></span>
                        <span>Min. Purchase: <strong>{coupon.minPurchase} BDT</strong></span>
                    </div>
                    {coupon.expiryDate && (
                        <p className="muted" style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
                            Expires on: {new Date(coupon.expiryDate).toLocaleDateString()}
                        </p>
                    )}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                      <Button variant="outline" size="sm" onClick={() => { setCurrentCoupon(coupon); setIsModalOpen(true); }}>
                        <Edit2 size={14} /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(coupon._id)} style={{ color: "var(--sirat-error)" }} disabled={isProcessing}>
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{currentCoupon ? "Edit Coupon" : "Create New Coupon"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
              <Input 
                label="Coupon Code" 
                name="code" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="e.g. SIRAT20" 
                required 
              />
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                    <label style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.5rem", display: "block" }}>Discount Type</label>
                    <select 
                        name="discountType" 
                        value={formData.discountType} 
                        onChange={e => setFormData({...formData, discountType: e.target.value})}
                        className="sirat-input" 
                        style={{ width: "100%", padding: "0.625rem", borderRadius: "8px", border: "1px solid var(--sirat-border)", background: "var(--sirat-bg-alt)" }}
                    >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (BDT)</option>
                    </select>
                </div>
                <Input 
                    label="Discount Value" 
                    name="discountValue" 
                    type="number" 
                    step="0.01" 
                    value={formData.discountValue} 
                    onChange={e => setFormData({...formData, discountValue: e.target.value})}
                    required 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input 
                    label="Min. Purchase Amount" 
                    name="minPurchase" 
                    type="number" 
                    value={formData.minPurchase} 
                    onChange={e => setFormData({...formData, minPurchase: e.target.value})}
                />
                <Input 
                    label="Expiry Date" 
                    name="expiryDate" 
                    type="date" 
                    value={formData.expiryDate} 
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input 
                    type="checkbox" 
                    name="isActive" 
                    checked={formData.isActive} 
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                /> Active
              </label>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Coupon"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
