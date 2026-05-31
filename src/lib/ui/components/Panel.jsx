export function Panel({ children, className = "", ...props }) {
  return (
    <div className={["sirat-panel", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}
