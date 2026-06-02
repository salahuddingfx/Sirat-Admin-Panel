import { useState, useEffect } from "react";
import { AppShell } from "../components/layout/AppShell";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { AppRouter } from "./router";
import { navItems } from "../features/dashboard/data/mockData";
import { Button } from "../components/ui";
import { MessageSquare, User } from "lucide-react";
import { login } from "../lib/api/queries";
import AdminToast, { triggerAdminToast } from "../components/ui/AdminToast";
import AdminConfirm from "../components/ui/AdminConfirm";

export function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("sirat_admin_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = async (credentials) => {
    try {
      const response = await login(credentials);
      if (response.success && response.data.user.role === 'admin') {
        const { user, token } = response.data;
        setUser(user);
        localStorage.setItem("sirat_admin_user", JSON.stringify(user));
        localStorage.setItem("sirat_admin_token", token);
        triggerAdminToast("Login successful. Welcome back!", "success");
      } else {
        triggerAdminToast("Login failed or not an admin.", "error");
      }
    } catch (err) {
      console.error("Login error:", err);
      triggerAdminToast("Invalid credentials.", "error");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("sirat_admin_user");
    localStorage.removeItem("sirat_admin_token");
    triggerAdminToast("Logged out successfully.", "info");
  };

  if (!user) {
    return (
        <>
            <LoginPage onLogin={handleLogin} />
            <AdminToast />
        </>
    );
  }

  return (
    <>
        <AppShell
          brand="SIRAT"
          tagline="Admin Command Center"
          navItems={navItems}
          rightSlot={
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ 
                  fontSize: '0.8125rem', 
                  fontWeight: 600, 
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <MessageSquare size={14} /> Support online
                </span>

                <div className="header__user" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="header__avatar" title={user.name}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <User size={18} className="initials" />
                    )}
                  </div>
                  <div className="header__meta">
                    <div className="header__name" style={{ fontWeight: 700 }}>{user.name}</div>
                    <div className="header__role" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.role}</div>
                  </div>
                  <Button variant="outline" onClick={handleLogout} style={{ padding: "0.4rem 1rem", fontSize: "0.8125rem" }}>
                    Log Out
                  </Button>
                </div>
              </div>
            }
        >
          <AppRouter />
        </AppShell>
        <AdminToast />
        <AdminConfirm />
    </>
  );
}
