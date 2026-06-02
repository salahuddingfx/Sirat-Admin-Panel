import React from "react";
import "./OrderInvoice.css";

const COMPANY = {
  name: "SIRAT CLOTHING",
  address: "House 12, Road 5, Block C, Mirpur 1",
  city: "Dhaka 1216, Bangladesh",
  phone: "+880 1700-000000",
  email: "hello@siratclothing.com",
  website: "siratclothing.com",
};

export const OrderInvoice = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  const {
    orderId,
    user,
    guestInfo,
    items,
    shippingCharge,
    totalAmount,
    paymentMethod,
    paymentStatus,
    paymentDetails,
    createdAt,
  } = order;

  const customer = user || guestInfo;
  const date = new Date(createdAt).toLocaleDateString("en-BD", {
    year: "numeric", month: "long", day: "numeric",
  });

  const netSales = (items || []).reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = (items || []).reduce((s, i) => s + i.quantity, 0);
  const isPaid = paymentStatus === "approved";

  return (
    <div className="invoice-container" ref={ref}>
      {/* HEADER */}
      <div className="inv-header">
        <div className="inv-brand">
          <img src="/Sirat.png" alt="SIRAT logo" className="inv-logo-img" />
          <div>
            <h1 className="inv-logo">{COMPANY.name}</h1>
            <p className="inv-tagline">Premium Streetwear</p>
          </div>
        </div>
        <div className="inv-title-block">
          <h2 className="inv-title">INVOICE</h2>
          <p className="inv-meta">#{orderId}</p>
          <p className="inv-meta">Date: {date}</p>
        </div>
      </div>

      <div className="inv-divider" />

      {/* FROM / TO */}
      <div className="inv-parties">
        <div className="inv-from">
          <h3>From</h3>
          <p className="inv-party-name">{COMPANY.name}</p>
          <p>{COMPANY.address}</p>
          <p>{COMPANY.city}</p>
          <p>Phone: {COMPANY.phone}</p>
          <p>Email: {COMPANY.email}</p>
        </div>
        <div className="inv-to">
          <h3>To</h3>
          <p className="inv-party-name">{customer.name}</p>
          <p>{customer.email}</p>
          <p>{customer.phone}</p>
          <p>{customer.address}</p>
          <p>{customer.city}</p>
        </div>
      </div>

      {/* PAID STAMP */}
      {isPaid && (
        <div className="inv-paid-stamp">
          <span>PAID</span>
        </div>
      )}

      {/* PAYMENT INFO */}
      <div className="inv-payment-info">
        <span>Payment: <strong>{paymentMethod.toUpperCase()}</strong></span>
        <span>Status: <strong className={isPaid ? "text-success" : paymentStatus === "rejected" ? "text-error" : "text-warning"}>{paymentStatus?.toUpperCase()}</strong></span>
        {paymentDetails?.txId && <span>TxID: {paymentDetails.txId}</span>}
        {paymentDetails?.senderNumber && <span>Sender: {paymentDetails.senderNumber}</span>}
      </div>

      {/* ITEMS TABLE */}
      <table className="inv-table">
        <thead>
          <tr>
            <th className="inv-th--item">Item</th>
            <th>Variant</th>
            <th className="inv-th--qty">Qty</th>
            <th className="inv-th--price">Unit Price</th>
            <th className="inv-th--total">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="inv-td--item">
                <span className="inv-item-name">{item.product?.name || "Product"}</span>
                {item.product?.sku && <span className="inv-item-sku">SKU: {item.product.sku}</span>}
              </td>
              <td>{item.variant || "—"}</td>
              <td className="inv-td--qty">{item.quantity}</td>
              <td className="inv-td--price">৳{item.price}</td>
              <td className="inv-td--total">৳{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* SUMMARY */}
      <div className="inv-summary">
        <div className="inv-summary-inner">
          <div className="inv-sum-row">
            <span>Items ({itemCount})</span>
            <span>৳{netSales}</span>
          </div>
          <div className="inv-sum-row">
            <span>Shipping</span>
            <span>{shippingCharge > 0 ? `৳${shippingCharge}` : "FREE"}</span>
          </div>
          <div className="inv-sum-row inv-sum-total">
            <span>Total</span>
            <span>৳{totalAmount}</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="inv-footer">
        <div className="inv-footer-row">
          <span>{COMPANY.website}</span>
          <span>{COMPANY.email}</span>
          <span>{COMPANY.phone}</span>
        </div>
        <p className="inv-footer-thanks">Thank you for your business!</p>
        <p className="inv-footer-legal">This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  );
});
