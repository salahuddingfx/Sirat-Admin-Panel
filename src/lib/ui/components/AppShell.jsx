import { NavLink } from "react-router-dom";
import { Menu } from "lucide-react";

export function AppShell({ brand, navItems, tagline, rightSlot, children }) {
  return (
    <div className="sirat-shell">
      <aside className="sirat-shell__rail">
        <div>
          <p className="sirat-brand">{brand}</p>
          <p className="sirat-tagline">{tagline}</p>
        </div>
        <button className="sirat-shell__menu" type="button" aria-label="Open navigation">
          <Menu size={18} />
        </button>
      </aside>
      <div className="sirat-shell__body">
        <header className="sirat-shell__header">
          <div className="sirat-shell__header-brand">
            <p className="sirat-brand">{brand}</p>
            <p className="sirat-tagline">{tagline}</p>
          </div>
          <nav className="sirat-shell__nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => ["sirat-shell__nav-link", isActive ? "active" : ""].filter(Boolean).join(" ")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="sirat-shell__header-slot">{rightSlot}</div>
        </header>
        <main className="sirat-shell__content">{children}</main>
      </div>
    </div>
  );
}
