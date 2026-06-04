import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, ShoppingBag, CheckCircle, XCircle, Eye, Trash2, AlertTriangle } from "lucide-react";
import { fetchOrders, updateOrderStatus, updatePaymentStatus, updateOrderDetails, deleteOrder } from "../../../lib/api/queries";
import { Button, Card, SectionHeader, Badge } from "../../../components/ui";
import { OrderInvoice } from "../components/OrderInvoice";
import { OrderDetailModal } from "../components/OrderDetailModal";
import { CURRENCY_SYMBOL, UI_STRINGS } from "../../../lib/constants";
import { triggerAdminToast } from "../../../components/ui/AdminToast";
import "./OrdersPage.css";

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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
        loadOrders();
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

  const handlePaymentApprove = async (id) => {
    try {
      setIsProcessing(true);
      const res = await updatePaymentStatus(id, "approved");
      if (res.success) {
        loadOrders();
        triggerAdminToast("Payment approved", "success");
      }
    } catch (err) {
      triggerAdminToast("Failed to approve payment", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentReject = async (id) => {
    try {
      setIsProcessing(true);
      const res = await updatePaymentStatus(id, "rejected");
      if (res.success) {
        loadOrders();
        triggerAdminToast("Payment rejected", "success");
      }
    } catch (err) {
      triggerAdminToast("Failed to reject payment", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentStatusFromModal = async (id, status) => {
    try {
      const res = await updatePaymentStatus(id, status);
      if (res.success) {
        loadOrders();
        triggerAdminToast(`Payment ${status === "approved" ? "approved" : "rejected"}`, "success");
      }
    } catch (err) {
      triggerAdminToast("Failed to update payment status", "error");
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteConfirm) return;
    try {
      setIsProcessing(true);
      const res = await deleteOrder(deleteConfirm._id);
      if (res.success) {
        triggerAdminToast("Order deleted successfully", "success");
        setDeleteConfirm(null);
        loadOrders();
      }
    } catch (err) {
      triggerAdminToast(err.response?.data?.message || "Failed to delete order", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDetailSave = async (data) => {
    if (!detailOrder) return;
    try {
      const res = await updateOrderDetails(detailOrder._id, data);
      if (res.success) {
        triggerAdminToast("Order details updated", "success");
        setDetailOrder(null);
        loadOrders();
      }
    } catch (err) {
      triggerAdminToast(err.response?.data?.message || "Failed to update order", "error");
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
                <th>Items</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Pay Status</th>
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
                      <small>{order.user?.email || order.guestInfo?.email || order.guestInfo?.phone}</small>
                    </div>
                  </td>
                  <td>
                    <div className="order-items-preview">
                      {order.items?.slice(0, 3).map((item, i) => (
                        <img
                          key={i}
                          src={item.product?.images?.[0]?.url || item.product?.images?.[0] || "/placeholder.png"}
                          alt={item.product?.name || "Product"}
                          className="order-item-thumb"
                          title={item.product?.name || "Product"}
                        />
                      ))}
                      {order.items?.length > 3 && (
                        <span className="order-items-more">+{order.items.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{CURRENCY_SYMBOL}{order.totalAmount}</td>

                  <td>
                    <Badge variant="primary">{order.paymentMethod.toUpperCase()}</Badge>
                    {order.paymentDetails?.txId && (
                      <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                        Tx: {order.paymentDetails.txId}
                      </div>
                    )}
                  </td>
                  <td>
                    {order.paymentStatus === "approved" ? (
                      <Badge variant="success">Paid</Badge>
                    ) : order.paymentStatus === "rejected" ? (
                      <Badge variant="error">Rejected</Badge>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Badge variant="warning">Unpaid</Badge>
                        <Button variant="ghost" onClick={() => handlePaymentApprove(order._id)} title="Approve Payment" disabled={isProcessing} style={{ color: "var(--color-success)" }}>
                          <CheckCircle size={16} />
                        </Button>
                        <Button variant="ghost" onClick={() => handlePaymentReject(order._id)} title="Reject Payment" disabled={isProcessing} style={{ color: "var(--color-error)" }}>
                          <XCircle size={16} />
                        </Button>
                      </div>
                    )}
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
                      <option value="returned">Returned</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Button variant="ghost" onClick={() => setDetailOrder(order)} title="View Details">
                        <Eye size={16} />
                      </Button>
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
                      <Button variant="ghost" onClick={() => setDeleteConfirm(order)} title="Delete Order" style={{ color: "var(--color-error)" }}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div style={{ display: "none" }}>
        <OrderInvoice ref={invoiceRef} order={selectedOrder} />
      </div>

      {detailOrder && (
        <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} onSave={handleDetailSave} onPaymentStatusChange={handlePaymentStatusFromModal} />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <AlertTriangle size={40} style={{ color: "var(--color-error)", margin: "0 auto 1rem" }} />
            <h3 style={{ textAlign: "center", margin: "0 0 0.5rem" }}>Delete Order?</h3>
            <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              This will permanently delete <strong>{deleteConfirm.orderId}</strong> and restore stock for all items.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button onClick={handleDeleteOrder} disabled={isProcessing} style={{ background: "var(--color-error)", color: "white" }}>
                {isProcessing ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
