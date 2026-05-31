import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Eye, ShoppingBag } from "lucide-react";
import { fetchOrders, updateOrderStatus } from "../../../lib/api/queries";
import { Button, Card, SectionHeader, Badge } from "../../../components/ui";
import { OrderInvoice } from "../components/OrderInvoice";
import "./OrdersPage.css";

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const invoiceRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
  });

  const loadOrders = async () => {
    try {
      const response = await fetchOrders();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await updateOrderStatus(id, newStatus);
      if (response.success) {
        loadOrders(); // Refresh list
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="orders-page">
      <SectionHeader
        eyebrow="Operations"
        title="Order Management"
        description="Fulfill orders, update shipping states, and generate invoices."
      />

      <Card className="orders-card">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td><strong>{order.orderId}</strong></td>
                <td>
                  <div className="customer-cell">
                    <span>{order.user?.name || order.guestInfo?.name}</span>
                    <small>{order.user?.email || order.guestInfo?.email}</small>
                  </div>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>৳{order.totalAmount}</td>
                <td>
                  <Badge variant="primary">{order.paymentMethod.toUpperCase()}</Badge>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="received">Received</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <div className="action-buttons">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedOrder(order);
                        setTimeout(handlePrint, 100);
                      }}
                      title="Print Invoice"
                    >
                      <Printer size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Hidden Invoice Component for Printing */}
      <div style={{ display: "none" }}>
        <OrderInvoice ref={invoiceRef} order={selectedOrder} />
      </div>
    </div>
  );
}
