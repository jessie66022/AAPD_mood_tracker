import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useRecordSheet } from "../context/SheetContext";
import { useToast } from "../context/ToastContext";
import Toast from "./Toast";
import homeIconSvg from "../assets/shared/home.svg?raw";
import askBearIconSvg from "../assets/shared/ask-bear.svg?raw";
import addIcon from "../assets/shared/add.svg";
import historyIconSvg from "../assets/shared/history.svg?raw";
import settingsIconSvg from "../assets/shared/settings.svg?raw";

// Height of the indicator zone below the pill nav (see the h-[34px] spacer further down) —
// the toast's resting position is measured up from the true bottom edge, past that spacer.
const INDICATOR_ZONE_HEIGHT = 34;
const TOAST_GAP = 16;

const TABS_LEFT = [
  { key: "home", label: "首頁", iconSvg: homeIconSvg, to: "/AAPD_mood_tracker" },
  { key: "ask-bear", label: "問熊熊", iconSvg: askBearIconSvg, to: "/AAPD_mood_tracker/ask-bear" },
];

const TABS_RIGHT = [
  { key: "history", label: "回顧", iconSvg: historyIconSvg, to: "/AAPD_mood_tracker/review" },
  { key: "settings", label: "設定", iconSvg: settingsIconSvg, to: "/AAPD_mood_tracker/settings" },
];

function TabItem({ label, iconSvg, to, active }) {
  const color = active ? "var(--color-primary)" : "var(--color-text-muted)";
  return (
    <Link to={to} viewTransition className="flex w-[68.6px] shrink-0 flex-col items-center justify-center gap-1">
      <div className="size-6" style={{ "--stroke-0": color }} dangerouslySetInnerHTML={{ __html: iconSvg }} />
      <p className="shrink-0 text-center text-xs leading-[1.5] whitespace-nowrap" style={{ color }}>
        {label}
      </p>
    </Link>
  );
}

export default function TabBar({ active }) {
  // Every tab switch fades in/out via the browser's View Transitions API — see index.css's
  // ::view-transition rules and TabItem's `viewTransition` prop on each Link.
  const { open } = useRecordSheet();
  const { toast } = useToast();
  const pillRef = useRef(null);
  const [pillHeight, setPillHeight] = useState(0);

  // Measured (not guessed) so the toast sits exactly 16px above the pill regardless of font
  // metrics — mirrors RecordMoodSheet's own use of offsetHeight before animating.
  useLayoutEffect(() => {
    setPillHeight(pillRef.current?.offsetHeight ?? 0);
  }, []);

  return (
    <>
      {/* Rendered as a sibling of the (overflow-clip'd) nav wrapper below so its slide-in
          isn't clipped by that wrapper's own intrinsic height. */}
      <AnimatePresence>
        {toast && (
          <div
            className="absolute left-1/2 flex w-[402px] -translate-x-1/2 justify-center px-2"
            style={{ bottom: pillHeight + INDICATOR_ZONE_HEIGHT + TOAST_GAP }}
          >
            <Toast message={toast.message} actionLabel={toast.actionLabel} onAction={toast.onAction} icon={toast.icon} />
          </div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-0 left-1/2 flex w-[402px] -translate-x-1/2 flex-col items-center overflow-clip px-2 pt-2">
        <div
          ref={pillRef}
          className="flex shrink-0 items-center justify-center gap-2 rounded-full px-2 py-4"
          style={{ background: "var(--color-bg-surface)", boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" }}
        >
          {TABS_LEFT.map(({ key, ...tab }) => (
            <TabItem key={key} {...tab} active={active === key} />
          ))}
          <button
            type="button"
            onClick={open}
            className="flex shrink-0 cursor-pointer items-center rounded-full p-[10px] transition-transform duration-100 ease-out active:scale-90"
            style={{ background: "var(--color-primary)" }}
            aria-label="新增紀錄"
          >
            <img src={addIcon} alt="" className="size-6" />
          </button>
          {TABS_RIGHT.map(({ key, ...tab }) => (
            <TabItem key={key} {...tab} active={active === key} />
          ))}
        </div>
        <div className="relative h-[34px] w-full">
          <div
            className="absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full"
            style={{ background: "var(--color-icon-primary)" }}
          />
        </div>
      </div>
    </>
  );
}
