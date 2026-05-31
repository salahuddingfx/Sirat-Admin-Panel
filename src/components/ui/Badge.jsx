import { cn } from "../../lib/utils";
import "./Badge.css";

export function Badge({ children, variant = "default", className }) {
  return (
    <span className={cn("badge", `badge--${variant}`, className)}>
      {children}
    </span>
  );
}
