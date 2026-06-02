import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import "./AppShell.css";

export function AppShell({ brand, tagline, navItems, rightSlot, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        brand={brand}
        tagline={tagline}
        navItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-main">
        <Header
          rightSlot={rightSlot}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
