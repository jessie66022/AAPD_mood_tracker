export default function Button({ children, variant = "primary", className = "", ...props }) {
  // primary = filled purple CTA; secondary = outlined, for the lower-emphasis alternative action.
  const style =
    variant === "secondary"
      ? { background: "transparent", border: "1.5px solid var(--color-primary)", color: "var(--color-primary)" }
      : { background: "var(--color-primary)", color: "#fff" };
  return (
    <button
      type="button"
      className={`w-full rounded-full py-[14px] text-base leading-[1.5] font-semibold transition-transform duration-100 ease-out active:scale-90 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
