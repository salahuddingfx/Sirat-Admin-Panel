import { Menu } from "lucide-react";
import { cn } from "../../lib/utils";
import "./Header.css";

export function Header({ title, rightSlot, onMenuToggle }) {
  return (
    <header className="header">
      <div className="header__left">
        <button className="header__menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
        <div className="header__title">
          {title && <h2>{title}</h2>}
        </div>
      </div>
      <div className="header__actions">
        {rightSlot}
      </div>
    </header>
  );
}
