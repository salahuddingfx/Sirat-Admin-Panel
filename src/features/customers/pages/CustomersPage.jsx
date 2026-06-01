import { useState, useEffect } from "react";
import { User, Shield, Trash2, Mail, Phone } from "lucide-react";
import { fetchAllUsers, updateUserRole, adminDeleteUser } from "../../../lib/api/queries";
import { Button, Card, SectionHeader, Badge } from "../../../components/ui";
import { triggerAdminToast } from "../../../components/ui/AdminToast";

export default function CustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const res = await fetchAllUsers();
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    try {
      await updateUserRole(id, newRole);
      setUsers(users.map((u) => u._id === id ? { ...u, role: newRole } : u));
      triggerAdminToast("User role updated", "success");
    } catch (err) {
      triggerAdminToast("Failed to update role", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await adminDeleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
      triggerAdminToast("User deleted successfully", "success");
    } catch (err) {
      triggerAdminToast("Failed to delete user", "error");
    }
  };

  return (
    <div className="admin-page">
      <SectionHeader
        title="User Management"
        description="Manage your customer base and administrator roles."
      />

      <div className="grid-container" style={{ marginTop: "2rem" }}>
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <Card className="orders-card" style={{ padding: 0 }}>
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Contact Info</th>
                        <th>Joined</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u._id}>
                            <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <div style={{ width: "32px", height: "32px", background: "var(--sirat-bg-alt)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sirat-gold)" }}>
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <strong style={{ display: "block" }}>{u.name}</strong>
                                        <small className="muted">@{u.username || "no-username"}</small>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style={{ display: "grid", gap: "0.25rem" }}>
                                    <span style={{ fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}><Mail size={12} /> {u.email}</span>
                                    <span style={{ fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}><Phone size={12} /> {u.phone || "N/A"}</span>
                                </div>
                            </td>
                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Badge variant={u.role === 'admin' ? 'success' : 'primary'}>
                                    {u.role.toUpperCase()}
                                </Badge>
                            </td>
                            <td>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleRoleChange(u._id, u.role === 'admin' ? 'user' : 'admin')}
                                        title={u.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                                    >
                                        <Shield size={14} />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleDelete(u._id)} 
                                        style={{ color: "var(--sirat-error)" }}
                                        title="Delete User"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
