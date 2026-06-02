import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import "./Sidebar.css";

export function Sidebar({ brand, tagline, navItems, isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <div className="sidebar__brand-row">
            <h1 className="brand-text">{brand}</h1>
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
              <X size={20} />
            </button>
          </div>
          <p className="tagline-text">{tagline}</p>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) => cn("nav-link", isActive && "active")}
              onClick={onClose}
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
      </aside>
    </>
  );
}
