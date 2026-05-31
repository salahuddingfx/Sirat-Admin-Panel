import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import "./AppShell.css";

export function AppShell({ brand, tagline, navItems, rightSlot, children }) {
  return (
    <div className="app-layout">
      <Sidebar brand={brand} tagline={tagline} navItems={navItems} />
      <div className="app-main">
        <Header rightSlot={rightSlot} />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
