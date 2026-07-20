export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors"
      style={{ background: checked ? "var(--color-primary)" : "var(--color-primary-muted)" }}
    >
      <span
        className="absolute top-[2px] left-[2px] size-6 rounded-full bg-white transition-transform"
        style={{
          boxShadow: "0px 2px 4px rgba(0,0,0,0.08)",
          transform: checked ? "translateX(0px)" : "translateX(20px)",
        }}
      />
    </button>
  );
}
