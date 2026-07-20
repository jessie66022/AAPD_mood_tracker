export default function Button({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`w-full rounded-full py-[14px] text-base leading-[1.5] font-semibold text-white transition-transform duration-100 ease-out active:scale-90 ${className}`}
      style={{ background: "var(--color-primary)" }}
      {...props}
    >
      {children}
    </button>
  );
}
