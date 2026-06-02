import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Eye, ShoppingBag } from "lucide-react";
import { fetchOrders, updateOrderStatus } from "../../../lib/api/queries";
import { Button, Card, SectionHeader, Badge } from "../../../components/ui";
import { OrderInvoice } from "../components/OrderInvoice";
import { CURRENCY_SYMBOL, UI_STRINGS } from "../../../lib/constants";
import { triggerAdminToast } from "../../../components/ui/AdminToast";
import "./OrdersPage.css";

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const invoiceRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
  });

  const loadOrders = async (signal) => {
    try {
      const response = await fetchOrders({ signal });
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error("Failed to load orders:", err);
        triggerAdminToast("Failed to load orders", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadOrders(controller.signal);
    return () => controller.abort();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setIsProcessing(true);
      const response = await updateOrderStatus(id, newStatus);
      if (response.success) {
        loadOrders(); // Refresh list
        triggerAdminToast("Order status updated", "success");
      } else {
        triggerAdminToast(response.message || "Failed to update order status", "error");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      triggerAdminToast("An error occurred while updating status", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="orders-page">
      <SectionHeader
        eyebrow={UI_STRINGS.orders.eyebrow}
        title={UI_STRINGS.orders.title}
        description={UI_STRINGS.orders.description}
      />

      <Card className="orders-card">
        {orders?.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <ShoppingBag size={48} className="muted" style={{ margin: "0 auto 1rem" }} />
            <h3>{UI_STRINGS.orders.noItems}</h3>
            <p className="muted">{UI_STRINGS.orders.noItemsDesc}</p>
          </div>
        ) : (
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
              {orders?.map((order) => (
                <tr key={order._id}>
                  <td><strong>{order.orderId}</strong></td>
                  <td>
                    <div className="customer-cell">
                      <span>{order.user?.name || order.guestInfo?.name}</span>
                      <small>{order.user?.email || order.guestInfo?.email}</small>
                    </div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{CURRENCY_SYMBOL}{order.totalAmount}</td>

                  <td>
                    <Badge variant="primary">{order.paymentMethod.toUpperCase()}</Badge>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="status-select"
                      disabled={isProcessing}
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
        )}
      </Card>

      {/* Hidden Invoice Component for Printing */}
      <div style={{ display: "none" }}>
        <OrderInvoice ref={invoiceRef} order={selectedOrder} />
      </div>
    </div>
  );
}
