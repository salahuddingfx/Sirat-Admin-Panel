import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import "./Sidebar.css";

export function Sidebar({ brand, tagline, navItems }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <h1 className="brand-text">{brand}</h1>
        <p className="tagline-text">{tagline}</p>
      </div>
      
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => cn("nav-link", isActive && "active")}
          >
            {({ isActive }) => (
              <>
                {item.icon && <item.icon size={20} />}
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="nav-indicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar__footer">
        {/* Can add version info or user profile here */}
      </div>
    </aside>
  );
}
