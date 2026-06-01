import { useState, useEffect } from "react";
import { Mail, Check, Trash2, User } from "lucide-react";
import { fetchAllContacts, markContactAsRead, deleteContact } from "../../../lib/api/queries";
import { Button, Card, SectionHeader } from "../../../components/ui";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      const res = await fetchAllContacts();
      if (res.success) setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markContactAsRead(id);
      setMessages(messages.map((m) => m._id === id ? { ...m, isRead: true } : m));
    } catch (err) {
      alert("Failed to mark as read");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteContact(id);
      setMessages(messages.filter((m) => m._id !== id));
    } catch (err) {
      alert("Failed to delete message");
    }
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
