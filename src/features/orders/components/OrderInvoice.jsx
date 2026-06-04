import React from "react";
import "./OrderInvoice.css";

const COMPANY = {
  name: "SIRAT CLOTHING",
  brand: "SIRAT",
  tagline: "Premium Streetwear",
  address: "House 12, Road 5, Block C, Mirpur 1",
  city: "Dhaka 1216, Bangladesh",
  phone: "+880 1700-000000",
  email: "hello@siratclothing.com",
  website: "siratclothing.com",
  websiteUrl: "https://sirat.salahuddin.codes",
};

export const SIZES = [
  { key: "a4",       label: 'A4 (8.27" × 11.69")',  hint: "Letterhead · email PDF" },
  { key: "3in",      label: '3" Thermal',           hint: "Standard receipt printer" },
  { key: "2_75in",   label: '2.75" Thermal',        hint: "Common receipt printer" },
  { key: "2in",      label: '2" Thermal',           hint: "Narrow receipt printer" },
  { key: "1_5in",    label: '1.5" Thermal',         hint: "Extra-narrow receipt" },
];

export const OrderInvoice = React.forwardRef(({ order, size = "a4" }, ref) => {
  if (!order) return null;

  const {
    orderId, user, guestInfo, items = [],
    shippingCharge = 0, totalAmount = 0,
    paymentMethod, paymentStatus, paymentDetails, createdAt,
  } = order;

  const customer = user || guestInfo || {};
  const date = new Date(createdAt).toLocaleDateString("en-GB", {
    year: "numeric", month: "short", day: "2-digit",
  });
  const netSales = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);
  const itemCount = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const isPaid = paymentStatus === "approved";
  const isThermal = size !== "a4";
  const sizeClass = `invoice-container invoice-container--${size}`;

  return (
    <div className={sizeClass} ref={ref}>
      {/* Outer table — thead/tfoot repeat on every printed page automatically. */}
      <table className="inv-outer">
        <thead>
          <tr>
            <td className="inv-td-head">
              {/* HEADER — repeats on every printed page */}
              <div className="inv-header">
                <div className="inv-header__goldbar" />
                <div className="inv-header__row">
                  <div className="inv-brand">
                    <img src="/Sirat.png" alt="SIRAT" className="inv-logo-img" />
                    <div className="inv-brand__text">
                      <h1 className="inv-logo">{COMPANY.brand}</h1>
                      <p className="inv-tagline">{COMPANY.tagline}</p>
                    </div>
                  </div>
                  <div className="inv-title-block">
                    <h2 className="inv-title">INVOICE</h2>
                    <p className="inv-meta">#{orderId}</p>
                    <p className="inv-meta">Date: {date}</p>
                  </div>
                </div>
                <div className="inv-divider" />
              </div>
            </td>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="inv-td-body">
              {/* BODY — main content that flows and paginates */}
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
                  <h3>Bill To</h3>
                  <p className="inv-party-name">{customer.name || "Customer"}</p>
                  {customer.email && <p>{customer.email}</p>}
                  {customer.phone && <p>{customer.phone}</p>}
                  {customer.address && <p>{customer.address}</p>}
                  {customer.city && <p>{customer.city}</p>}
                </div>
              </div>

              {isPaid && (
                <div className="inv-paid-stamp">
                  <span>PAID</span>
                </div>
              )}

              <div className="inv-payment-info">
                <span>Payment: <strong>{(paymentMethod || "cod").toUpperCase()}</strong></span>
                <span>Status:{" "}
                  <strong className={
                    isPaid ? "text-success"
                      : paymentStatus === "rejected" ? "text-error"
                      : "text-warning"
                  }>
                    {(paymentStatus || "pending").toUpperCase()}
                  </strong>
                </span>
                {paymentDetails?.txId && <span>TxID: {paymentDetails.txId}</span>}
                {paymentDetails?.senderNumber && <span>Sender: {paymentDetails.senderNumber}</span>}
              </div>

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
                      <td className="inv-td--total">৳{(item.price || 0) * (item.quantity || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td className="inv-td-foot">
              {/* FOOTER — repeats on every printed page */}
              <div className="inv-footer">
                <div className="inv-divider" />
                {isThermal ? (
                  <>
                    <div className="inv-footer-thanks">Thank you!</div>
                    <div className="inv-footer-row">
                      <span>{COMPANY.website}</span>
                      <span>{COMPANY.phone}</span>
                    </div>
                    <p className="inv-footer-legal">Computer-generated invoice • No signature required</p>
                  </>
                ) : (
                  <>
                    <p className="inv-footer-thanks">Thank you for your business!</p>
                    <div className="inv-footer-row">
                      <span>{COMPANY.website}</span>
                      <span>{COMPANY.email}</span>
                      <span>{COMPANY.phone}</span>
                    </div>
                    <p className="inv-footer-legal">This is a computer-generated invoice and does not require a signature.</p>
                  </>
                )}
                <div className="inv-footer__goldbar" />
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
});
