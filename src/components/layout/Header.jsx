import { cn } from "../../lib/utils";
import "./Header.css";

export function Header({ title, rightSlot }) {
  return (
    <header className="header">
      <div className="header__title">
        {title && <h2>{title}</h2>}
      </div>
      <div className="header__actions">
        {rightSlot}
      </div>
    </header>
  );
}
