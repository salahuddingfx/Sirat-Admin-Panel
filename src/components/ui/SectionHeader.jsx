import { cn } from "../../lib/utils";
import "./SectionHeader.css";

export function SectionHeader({ eyebrow, title, description, children, className }) {
  return (
    <div className={cn("section-header", className)}>
      <div className="section-header__content">
        {eyebrow && <span className="section-header__eyebrow">{eyebrow}</span>}
        <h2 className="section-header__title">{title}</h2>
        {description && <p className="section-header__description">{description}</p>}
      </div>
      {children && <div className="section-header__actions">{children}</div>}
    </div>
  );
}
