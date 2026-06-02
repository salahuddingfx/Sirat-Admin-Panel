import React from "react";
import "./OrderInvoice.css";

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
    createdAt,
    paymentStatus
  } = order;

  const customer = user || guestInfo;
  const date = new Date(createdAt).toLocaleDateString();

  const totalCost = (items || []).reduce((sum, item) => {
    const baseCost = item.product?.costPrice ?? 0;
    const pkgCost = item.product?.packagingCost || 0;
    const mgmtCost = item.product?.managementCost || 0;
    const othCost = item.product?.otherCost || 0;
    return sum + (baseCost + pkgCost + mgmtCost + othCost) * (item.quantity || 0);
  }, 0);

  const netSales = (items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const profit = netSales - totalCost;

  return (
    <div className="invoice-container" ref={ref}>
      <div className="invoice-header">
        <div className="invoice-brand">
          <h1>SIRAT</h1>
          <p>Admin Command Center</p>
        </div>
        <div className="invoice-info">
          <h2>INVOICE</h2>
          <p>Order ID: {orderId}</p>
          <p>Date: {date}</p>
          <p>Payment: {paymentStatus?.toUpperCase()}</p>
        </div>
      </div>

      <div className="invoice-billing">
        <div className="billing-to">
          <h3>Bill To:</h3>
          <p><strong>{customer.name}</strong></p>
          <p>{customer.email}</p>
          <p>{customer.phone}</p>
          <p>{customer.address}</p>
          <p>{customer.city}</p>
        </div>
        <div className="payment-info">
          <h3>Payment Method:</h3>
          <p>{paymentMethod.toUpperCase()}</p>
          {order.paymentDetails?.txId && <p>TxID: {order.paymentDetails.txId}</p>}
          {order.paymentDetails?.senderNumber && <p>Sender: {order.paymentDetails.senderNumber}</p>}
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Variant</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.product.name}</td>
              <td>{item.variant}</td>
              <td>{item.quantity}</td>
              <td>৳{item.price}</td>
              <td>৳{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-summary">
        <div className="summary-row">
          <span>Shipping:</span>
          <span>৳{shippingCharge}</span>
        </div>
        <div className="summary-row">
          <span>Net Sales:</span>
          <span>৳{netSales}</span>
        </div>
        <div className="summary-row">
          <span>Total Cost:</span>
          <span>৳{totalCost}</span>
        </div>
        <div className="summary-row" style={{ color: profit >= 0 ? "var(--color-success)" : "var(--color-error)", fontWeight: 600 }}>
          <span>Profit:</span>
          <span>৳{profit}</span>
        </div>
        <div className="summary-row total">
          <span>Amount Paid:</span>
          <span>৳{totalAmount}</span>
        </div>
      </div>

      <div className="invoice-footer">
        <p>Thank you for shopping with SIRAT.</p>
        <p>This is a computer-generated invoice.</p>
      </div>
    </div>
  );
});
