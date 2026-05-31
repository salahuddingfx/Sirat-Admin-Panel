export function Button({ children, className = "", variant = "primary", ...props }) {
  return (
    <button className={["sirat-button", `sirat-button--${variant}`, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </button>
  );
}
