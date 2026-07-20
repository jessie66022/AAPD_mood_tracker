import { AnimatePresence } from "motion/react";
import { useRecordSheet } from "../context/SheetContext";
import RecordMoodSheet from "./RecordMoodSheet";

// Reads the app-level sheet state (provider lives above the router, in main.jsx — every
// screen wraps its own <PhoneFrame>, so the provider can't live inside PhoneFrame itself,
// otherwise a screen couldn't call useRecordSheet() to open it in the first place).
function RecordSheetMount() {
  const { isOpen, close } = useRecordSheet();
  return <AnimatePresence>{isOpen && <RecordMoodSheet onClose={close} />}</AnimatePresence>;
}

export default function PhoneFrame({ children }) {
  return (
    <div
      className="relative size-full max-w-[402px] overflow-clip rounded-[32px] shadow-2xl"
      style={{ background: "var(--color-bg-base)", aspectRatio: "402 / 874" }}
    >
      {children}
      <RecordSheetMount />
    </div>
  );
}
