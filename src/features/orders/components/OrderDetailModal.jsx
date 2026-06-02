import { useState } from "react";
import { X, Package, MapPin, CreditCard, User, Save, CheckCircle, XCircle } from "lucide-react";
import { Button, Badge } from "../../../components/ui";
import { CURRENCY_SYMBOL } from "../../../lib/constants";
import "./OrderDetailModal.css";

export function OrderDetailModal({ order, onClose, onSave, onPaymentStatusChange }) {
  const [guestInfo, setGuestInfo] = useState({ ...(order.guestInfo || {}) });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ guestInfo });
    setSaving(false);
  };

  const info = order.guestInfo || {};
  const user = order.user || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Order {order.orderId}</h2>
          <button onClick={onClose} style={{ padding: "0.35rem", borderRadius: "var(--radius-sm)", color: "var(--color-text-muted)", cursor: "pointer", border: "none", background: "none" }}>
            <X size={20} />
          </button>
        </div>

        <div className="order-detail-grid">
          {/* Customer Info */}
          <div className="order-detail-card">
            <h4><User size={16} /> Customer</h4>
            <div className="order-detail-fields">
              <label>Name</label>
              <input value={guestInfo.name || user.name || ""} onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })} className="input-field" />
              <label>Phone</label>
              <input value={guestInfo.phone || user.phone || ""} onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })} className="input-field" />
              <label>Email</label>
              <input value={guestInfo.email || user.email || ""} onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })} className="input-field" />
            </div>
          </div>

          {/* Shipping Info */}
          <div className="order-detail-card">
            <h4><MapPin size={16} /> Shipping</h4>
            <div className="order-detail-fields">
              <label>Address</label>
              <input value={guestInfo.address || ""} onChange={(e) => setGuestInfo({ ...guestInfo, address: e.target.value })} className="input-field" />
              <label>City</label>
              <input value={guestInfo.city || ""} onChange={(e) => setGuestInfo({ ...guestInfo, city: e.target.value })} className="input-field" />
              <label>Shipping Charge</label>
              <input value={order.shippingCharge || 0} disabled className="input-field" style={{ opacity: 0.6 }} />
            </div>
          </div>

          {/* Payment Info */}
          <div className="order-detail-card">
            <h4><CreditCard size={16} /> Payment</h4>
            <div className="order-detail-info">
              <div className="info-row"><span>Method</span><Badge variant="primary">{order.paymentMethod?.toUpperCase()}</Badge></div>
              <div className="info-row"><span>Status</span>
                {order.paymentStatus === "approved" ? <Badge variant="success">Paid</Badge>
                  : order.paymentStatus === "rejected" ? <Badge variant="error">Rejected</Badge>
                  : <Badge variant="warning">Pending</Badge>}
              </div>
              <div className="info-row"><span>Total</span><strong>{CURRENCY_SYMBOL}{order.totalAmount}</strong></div>
              {order.paymentDetails?.txId && <div className="info-row"><span>TxID</span><span style={{ fontSize: "0.8rem" }}>{order.paymentDetails.txId}</span></div>}
              {order.paymentDetails?.senderNumber && <div className="info-row"><span>Sender</span><span>{order.paymentDetails.senderNumber}</span></div>}
              {order.paymentMethod !== "cod" && onPaymentStatusChange && (
                <div className="info-row" style={{ marginTop: "0.75rem", gap: "0.5rem" }}>
                  <span>Action</span>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPaymentStatusChange(order._id, "approved")}
                      disabled={order.paymentStatus === "approved"}
                      title="Approve Payment"
                      style={{ color: "var(--color-success)", padding: "0.25rem 0.5rem" }}
                    >
                      <CheckCircle size={16} /> Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPaymentStatusChange(order._id, "rejected")}
                      disabled={order.paymentStatus === "rejected"}
                      title="Reject Payment"
                      style={{ color: "var(--color-error)", padding: "0.25rem 0.5rem" }}
                    >
                      <XCircle size={16} /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="order-detail-card order-detail-card--wide">
            <h4><Package size={16} /> Items ({order.items?.length || 0})</h4>
            <div className="order-items-list">
              {order.items?.map((item, i) => (
                <div key={i} className="order-item-row">
                  <img
                    src={item.product?.images?.[0] || "/placeholder.png"}
                    alt={item.product?.name || "Product"}
                    className="order-item-detail-thumb"
                  />
                  <div className="order-item-name">
                    <strong>{item.product?.name || "Product"}</strong>
                    {item.variant && <span className="order-item-variant">{item.variant}</span>}
                  </div>
                  <div className="order-item-qty">x{item.quantity}</div>
                  <div className="order-item-price">{CURRENCY_SYMBOL}{item.price}</div>
                </div>
              ))}
            </div>
            <div className="order-total-row">
              <span>Subtotal</span>
              <span>{CURRENCY_SYMBOL}{order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0}</span>
            </div>
            <div className="order-total-row">
              <span>Shipping</span>
              <span>{CURRENCY_SYMBOL}{order.shippingCharge || 0}</span>
            </div>
            <div className="order-total-row order-total-row--final">
              <span>Total</span>
              <span>{CURRENCY_SYMBOL}{order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="order-detail-actions">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
