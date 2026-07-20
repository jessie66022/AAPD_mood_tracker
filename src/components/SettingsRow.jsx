import chevron from "../assets/shared/chevron.svg";

export default function SettingsRow({ label, description, onClick, right }) {
  const isNav = Boolean(onClick);
  const Tag = isNav ? "a" : "div";

  return (
    <Tag
      href={isNav ? "#" : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl p-3 ${isNav ? "cursor-pointer" : ""}`}
      style={{ background: "var(--color-bg-surface)", boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" }}
    >
      <div className="flex min-w-px flex-1 flex-col items-start gap-1 text-base leading-[1.5]">
        <p className="w-full" style={{ color: "var(--color-text-primary)" }}>
          {label}
        </p>
        {description && (
          <p className="w-full text-sm leading-[1.5]" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.77px" }}>
            {description}
          </p>
        )}
      </div>
      {right ?? (isNav && <img src={chevron} alt="" className="size-6 shrink-0" />)}
    </Tag>
  );
}
