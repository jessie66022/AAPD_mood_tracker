// A pill-style segmented control (e.g. 月 / 週 / 日 on the Review screen). Reuses the app's
// pill language: a rounded-full track on the muted surface, the active segment filled with
// --color-primary + white text, inactive segments in muted text. CSS transition only — this
// isn't gesture-driven, so no motion spring is needed.
export default function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="flex w-full items-center gap-1 rounded-full p-1" style={{ background: "var(--color-primary-muted)" }}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className="flex-1 cursor-pointer rounded-full py-2 text-center text-sm leading-[1.5] font-semibold transition-colors duration-150"
            style={{
              background: isActive ? "var(--color-primary)" : "transparent",
              color: isActive ? "#fff" : "var(--color-text-secondary)",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
