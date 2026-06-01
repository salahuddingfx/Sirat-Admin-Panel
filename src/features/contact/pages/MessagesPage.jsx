import { useState, useEffect } from "react";
import { Mail, Check, Trash2, User } from "lucide-react";
import { fetchAllContacts, markContactAsRead, deleteContact } from "../../../lib/api/queries";
import { Button, Card, SectionHeader } from "../../../components/ui";
import { triggerAdminConfirm } from "../../../components/ui/AdminConfirm";
import { triggerAdminToast } from "../../../components/ui/AdminToast";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async (signal) => {
    try {
      const res = await fetchAllContacts({ signal });
      if (res.success) setMessages(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error(err);
        triggerAdminToast("Failed to load messages", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadMessages(controller.signal);
    return () => controller.abort();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markContactAsRead(id);
      setMessages(messages.map((m) => m._id === id ? { ...m, isRead: true } : m));
      triggerAdminToast("Marked as read", "success");
    } catch (err) {
      triggerAdminToast("Failed to mark as read", "error");
    }
  };

  const handleDelete = async (id) => {
    triggerAdminConfirm("Delete this message?", async () => {
      try {
        await deleteContact(id);
        setMessages(messages.filter((m) => m._id !== id));
        triggerAdminToast("Message deleted", "success");
      } catch (err) {
        triggerAdminToast("Failed to delete message", "error");
      }
    });
  };

  return (
    <div className="admin-page">
      <SectionHeader
        title="Customer Messages"
        description="Inquiries and support requests from the contact form."
      />

      <div className="grid-container" style={{ marginTop: "2rem" }}>
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {messages.map((msg) => (
              <Card key={msg._id} style={{ borderLeft: msg.isRead ? "1px solid var(--sirat-border)" : "4px solid var(--sirat-gold)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                      <strong style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <User size={16} className="muted" /> {msg.name}
                      </strong>
                      <span className="muted" style={{ fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Mail size={14} /> {msg.email}
                      </span>
                      <span className="muted" style={{ fontSize: "0.8rem" }}>{new Date(msg.createdAt).toLocaleString()}</span>
                      {!msg.isRead && <span className="badge badge-success">New</span>}
                    </div>
                    <p style={{ margin: "1rem 0 0", fontSize: "0.9375rem", lineHeight: "1.6", color: "var(--sirat-text-main)", whiteSpace: "pre-wrap" }}>
                      {msg.message}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", marginLeft: "2rem" }}>
                    {!msg.isRead && (
                      <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(msg._id)}>
                        <Check size={14} /> Mark Read
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDelete(msg._id)} style={{ color: "var(--sirat-error)" }}>
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
