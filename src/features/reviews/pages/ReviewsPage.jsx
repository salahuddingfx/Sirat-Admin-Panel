import { useState, useEffect } from "react";
import { Check, X, Trash2, Star } from "lucide-react";
import { fetchAllReviews, updateReviewApproval, deleteReview } from "../../../lib/api/queries";
import { Button, Card, SectionHeader } from "../../../components/ui";
import { triggerAdminConfirm } from "../../../components/ui/AdminConfirm";
import { triggerAdminToast } from "../../../components/ui/AdminToast";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async (signal) => {
    try {
      const res = await fetchAllReviews({ signal });
      if (res.success) setReviews(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error(err);
        triggerAdminToast("Failed to load reviews", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadReviews(controller.signal);
    return () => controller.abort();
  }, []);

  const handleToggleApproval = async (id, currentStatus) => {
    try {
      await updateReviewApproval(id, !currentStatus);
      setReviews(reviews.map((r) => r._id === id ? { ...r, isApproved: !currentStatus } : r));
      triggerAdminToast(currentStatus ? "Review rejected" : "Review approved", "success");
    } catch (err) {
      triggerAdminToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id) => {
    triggerAdminConfirm("Delete this review?", async () => {
      try {
        await deleteReview(id);
        setReviews(reviews.filter((r) => r._id !== id));
        triggerAdminToast("Review deleted", "success");
      } catch (err) {
        triggerAdminToast("Failed to delete review", "error");
      }
    });
  };

  return (
    <div className="admin-page">
      <SectionHeader
        title="Product Reviews"
        description="Moderate customer feedback and ratings."
      />

      <div className="grid-container" style={{ marginTop: "2rem" }}>
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {reviews.map((rev) => (
              <Card key={rev._id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                      <strong style={{ fontSize: "1.1rem" }}>{rev?.name}</strong>
                      <span className="muted" style={{ fontSize: "0.8rem" }}>{rev?.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'N/A'}</span>
                      <span className={`badge ${rev?.isApproved ? "badge-success" : "badge-outline"}`}>
                        {rev?.isApproved ? "Approved" : "Pending Approval"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--sirat-gold)", marginBottom: "0.75rem" }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < (rev?.rating || 0) ? "currentColor" : "none"} />
                      ))}
                      <span style={{ marginLeft: "0.5rem", color: "var(--sirat-muted)", fontSize: "0.875rem" }}>
                        for <strong>{rev?.product?.name || "Deleted Product"}</strong>
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.9375rem", lineHeight: "1.5", color: "var(--sirat-text-main)" }}>
                      "{rev?.comment}"
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", marginLeft: "2rem" }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleApproval(rev._id, rev.isApproved)}
                      style={{ color: rev.isApproved ? "var(--sirat-error)" : "var(--sirat-success)" }}
                    >
                      {rev.isApproved ? <X size={14} /> : <Check size={14} />}
                      {rev.isApproved ? "Reject" : "Approve"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(rev._id)} style={{ color: "var(--sirat-error)" }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
