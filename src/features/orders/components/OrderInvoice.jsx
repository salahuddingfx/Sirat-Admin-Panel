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
    createdAt
  } = order;

  const customer = user || guestInfo;
  const date = new Date(createdAt).toLocaleDateString();

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
