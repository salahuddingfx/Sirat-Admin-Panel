import { cn } from "../../lib/utils";
import "./Input.css";

export function Input({ label, error, className, id, ...props }) {
  return (
    <div className={cn("input-group", className)}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input id={id} className={cn("input-field", error && "has-error")} {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
