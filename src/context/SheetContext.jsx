import { createContext, useContext, useState } from "react";

const SheetContext = createContext(null);

export function SheetProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  // Today's recorded mood, shared app-wide so completing a record in the sheet fills today's
  // (7/19) calendar bear. `undefined` = not recorded yet; a MOODS index (0–5) or `null` (普通)
  // once recorded. See sliderMoodToCalendarCell in data/moods.
  const [todayMood, setTodayMood] = useState(undefined);
  // A one-line summary of today's 和熊熊聊聊 conversation, produced when the chat wraps up. Shown
  // on the completion page and in the Review calendar's day-summary sheet for today (7/19).
  // `undefined` until a chat is finished this session.
  const [todaySummary, setTodaySummary] = useState(undefined);
  return (
    <SheetContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        todayMood,
        setTodayMood,
        todaySummary,
        setTodaySummary,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
}

export function useRecordSheet() {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("useRecordSheet must be used within a SheetProvider");
  return ctx;
}
