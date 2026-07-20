import { useState } from "react";
import { AnimatePresence } from "motion/react";
import PhoneFrame from "./components/PhoneFrame";
import StatusBar from "./components/StatusBar";
import TabBar from "./components/TabBar";
import MoodBear from "./components/MoodBear";
import SegmentedControl from "./components/SegmentedControl";
import EntryActionSheet from "./components/EntryActionSheet";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import { useToast } from "./context/ToastContext";
import { useRecordSheet } from "./context/SheetContext";
import { MOODS } from "./data/moods";
import { CALENDAR_MONTH_LABEL, WEEKDAY_LABELS, CALENDAR_WEEKS, CALENDAR_DATES, TODAY_CELL } from "./data/calendar";
import { THIS_WEEK_DAYS, WEEK_RANGE_LABEL } from "./data/history";
import { getWeeklyReview } from "./lib/insights";
import addDashed from "./assets/review/add-dashed.svg";
import bearFuture from "./assets/review/bear-future.svg";
import chevronLeft from "./assets/review/chevron-left.svg";
import chevronRight from "./assets/shared/chevron.svg";
import moreIcon from "./assets/shared/more.svg";
import gummyBearDay from "./assets/shared/gummy-bear-day.svg";
import toastCheckIcon from "./assets/shared/toast-check.svg?raw";

const TABS = [
  { value: "month", label: "月" },
  { value: "week", label: "週" },
  { value: "day", label: "日" },
];

// Row 1 of the calendar grid is the current week (7/6–7/12), mapping column j → THIS_WEEK_DAYS[j].
// Only these cells carry day-level detail, so only they are tappable to open the 日 tab.
const CURRENT_WEEK_ROW = 1;

const CARD = { background: "var(--color-bg-surface)", boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" };
const CARD_LG = { background: "var(--color-bg-surface)", boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" };

function NavButton({ icon, alt, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={alt}
      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity disabled:cursor-default disabled:opacity-40"
      style={{ background: "var(--color-primary-muted)" }}
    >
      <img src={icon} alt="" className="size-6" />
    </button>
  );
}

function TagChip({ label }) {
  return (
    <span
      className="flex items-center justify-center rounded-full border px-3 py-1 text-sm leading-[1.5] whitespace-nowrap"
      style={{ borderColor: "#D5CAC0", background: "var(--color-bg-surface)", color: "var(--color-text-primary)", letterSpacing: "0.77px" }}
    >
      {label}
    </span>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-2xl py-10" style={CARD}>
      <img src={gummyBearDay} alt="" className="size-16" />
      <div className="flex flex-col items-center gap-1">
        <p className="text-xl leading-[1.5] font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {title}
        </p>
        <p className="max-w-[280px] text-center text-sm leading-[1.5]" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.77px" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// One colored dot per weekday (Mon–Sun) — the week's emotional shape at a glance. A day with no
// mood (未記錄 or neutral 普通) shows the muted primary tone, matching the calendar's language.
function SpectrumStrip({ days }) {
  return (
    <div className="flex w-full items-start justify-between">
      {days.map((day) => (
        <div key={day.id} className="flex flex-col items-center gap-2">
          <div
            className="size-[26px] rounded-full"
            style={{ background: day.moodIndex == null ? "var(--color-primary-muted)" : MOODS[day.moodIndex].fill }}
          />
          <p className="text-xs leading-[1.5]" style={{ color: "var(--color-text-muted)" }}>
            {day.weekday}
          </p>
        </div>
      ))}
    </div>
  );
}

function CalendarCellVisual({ cell }) {
  if (cell === "empty") return <img src={addDashed} alt="" className="size-5" />;
  if (cell === "future") return <img src={bearFuture} alt="" className="size-8" />;
  if (cell === "muted") return <MoodBear moodIndex={null} variant="calendar" className="size-8" />;
  return <MoodBear moodIndex={cell} variant="calendar" className="size-8" />;
}

function CalendarCell({ cell, onSelect }) {
  if (cell === "hidden") return <div className="size-[34px] shrink-0" />;
  const isEmpty = cell === "empty";
  const shape = `flex size-[34px] shrink-0 items-center justify-center${isEmpty ? " rounded-[9px] border-[1.5px] border-dashed" : ""}`;
  const style = isEmpty ? { borderColor: "var(--color-primary-muted)" } : undefined;
  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} aria-label="查看這天" className={`${shape} cursor-pointer`} style={style}>
        <CalendarCellVisual cell={cell} />
      </button>
    );
  }
  return (
    <div className={shape} style={style}>
      <CalendarCellVisual cell={cell} />
    </div>
  );
}

function MonthTab({ onSelectDay }) {
  const { todayMood } = useRecordSheet();
  // Today's cell (7/19) shows the just-recorded mood if there is one, otherwise its static
  // "empty" add-prompt. `undefined` means no record yet this session.
  const resolveCell = (i, j, cell) =>
    i === TODAY_CELL.row && j === TODAY_CELL.col && todayMood !== undefined ? todayMood : cell;
  return (
    <div className="flex w-full flex-col gap-6 pb-[120px]">
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex w-full items-center justify-between">
          <NavButton icon={chevronLeft} alt="上個月" />
          <p className="text-center text-2xl leading-[1.5] font-semibold whitespace-nowrap" style={{ color: "var(--color-text-primary)" }}>
            {CALENDAR_MONTH_LABEL}
          </p>
          <NavButton icon={chevronRight} alt="下個月" />
        </div>
        <div className="flex w-full flex-col items-center gap-4 rounded-2xl p-4" style={CARD_LG}>
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center justify-between text-center text-xs leading-[1.5]" style={{ color: "var(--color-text-muted)" }}>
              {WEEKDAY_LABELS.map((label) => (
                <p key={label} className="w-[34px] shrink-0">
                  {label}
                </p>
              ))}
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-2">
              {CALENDAR_WEEKS.map((week, i) => (
                <div key={i} className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center justify-between">
                    {week.map((cell, j) => (
                      <CalendarCell
                        key={j}
                        cell={resolveCell(i, j, cell)}
                        onSelect={i === CURRENT_WEEK_ROW && cell !== "hidden" ? () => onSelectDay(j) : undefined}
                      />
                    ))}
                  </div>
                  <div className="flex w-full items-center justify-between text-center text-xs leading-[1.5]">
                    {CALENDAR_DATES[i].map(({ day, muted, hidden }, j) => (
                      <p
                        key={j}
                        className="w-[34px] shrink-0"
                        style={{ color: muted ? "var(--color-text-muted)" : "var(--color-text-primary)", opacity: hidden ? 0 : 1 }}
                      >
                        {day}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeekTab({ weekDays, onOpenActions }) {
  const review = getWeeklyReview(weekDays);
  const recordedDays = weekDays.filter((day) => day.recorded);

  return (
    <div className="flex w-full flex-col gap-6 pb-[120px]">
      <div className="flex h-9 w-full items-center justify-between">
        <NavButton icon={chevronLeft} alt="上一週" />
        <p className="text-center text-xl leading-[1.5] font-semibold whitespace-nowrap" style={{ color: "var(--color-text-primary)" }}>
          {WEEK_RANGE_LABEL}
        </p>
        <NavButton icon={chevronRight} alt="下一週" />
      </div>

      {review.count === 0 ? (
        <EmptyState title="這週還沒有紀錄" subtitle="點擊下方的「+」開始記錄這週的心情吧" />
      ) : (
        <>
          {/* Summary: spectrum strip + one-line bear takeaway */}
          <div className="flex w-full flex-col gap-4 rounded-2xl p-4" style={CARD_LG}>
            <div className="flex flex-col gap-1">
              <p className="text-xl leading-[1.5] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                這週{review.tone}
              </p>
              <p className="text-sm leading-[1.5]" style={{ color: "var(--color-text-secondary)" }}>
                記錄了 {review.count} 天
              </p>
            </div>
            <SpectrumStrip days={weekDays} />
            <div className="flex items-start gap-3 border-t pt-4" style={{ borderColor: "var(--color-primary-muted)" }}>
              <img src={gummyBearDay} alt="" className="size-9 shrink-0" />
              <p className="min-w-px flex-1 text-sm leading-[1.6]" style={{ color: "var(--color-text-primary)" }}>
                {review.narrative}
              </p>
            </div>
          </div>

          {/* This week's recorded entries (with delete / undo flow) */}
          <div className="flex w-full flex-col items-start gap-4">
            <p className="text-xl leading-[1.5] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              本週紀錄
            </p>
            <div className="flex w-full flex-col items-start gap-2">
              {recordedDays.map((day) => (
                <div key={day.id} className="flex w-full items-center justify-between gap-3 rounded-2xl p-4" style={CARD}>
                  <MoodBear moodIndex={day.moodIndex} variant="medium" className="size-12 shrink-0" />
                  <div className="flex min-w-px flex-1 flex-col items-start gap-3">
                    <p className="text-base leading-[1.5]" style={{ color: "var(--color-text-primary)" }}>
                      {day.date}・{day.moodText}
                    </p>
                    {day.tags.length > 0 && (
                      <div className="flex flex-wrap items-start gap-[3px]">
                        {day.tags.map((tag) => (
                          <TagChip key={tag} label={tag} />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="更多選項"
                    className="size-6 shrink-0 cursor-pointer"
                    onClick={() => onOpenActions(day)}
                  >
                    <img src={moreIcon} alt="" className="size-full" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DayDetailCard({ day }) {
  const moodColor = day.moodIndex != null ? MOODS[day.moodIndex].text : "var(--color-text-primary)";
  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl p-4" style={CARD_LG}>
      <div className="flex items-center gap-3">
        <MoodBear moodIndex={day.moodIndex} variant="medium" className="size-14 shrink-0" />
        <p className="text-2xl leading-[1.5] font-semibold" style={{ color: moodColor }}>
          {day.moodText}
        </p>
      </div>
      {day.tags.length > 0 && (
        <div className="flex flex-wrap items-start gap-2">
          {day.tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
      )}
      {day.note && (
        <div className="flex flex-col gap-1 border-t pt-4" style={{ borderColor: "var(--color-primary-muted)" }}>
          <p className="text-sm leading-[1.5]" style={{ color: "var(--color-text-secondary)" }}>
            這天的想法
          </p>
          <p className="text-base leading-[1.6]" style={{ color: "var(--color-text-primary)" }}>
            {day.note}
          </p>
        </div>
      )}
    </div>
  );
}

function DayTab({ weekDays, dayIndex, setDayIndex }) {
  const day = weekDays[dayIndex];
  const last = weekDays.length - 1;
  return (
    <div className="flex w-full flex-col gap-6 pb-[120px]">
      <div className="flex w-full items-center justify-between">
        <NavButton icon={chevronLeft} alt="前一天" onClick={() => setDayIndex((i) => Math.max(0, i - 1))} disabled={dayIndex === 0} />
        <p className="text-center text-2xl leading-[1.5] font-semibold whitespace-nowrap" style={{ color: "var(--color-text-primary)" }}>
          {day.date}
        </p>
        <NavButton icon={chevronRight} alt="後一天" onClick={() => setDayIndex((i) => Math.min(last, i + 1))} disabled={dayIndex === last} />
      </div>
      {day.recorded ? (
        <DayDetailCard day={day} />
      ) : (
        <EmptyState title="這天還沒有紀錄" subtitle="點擊下方的「+」記錄這天的心情吧" />
      )}
    </div>
  );
}

export default function ReviewScreen() {
  const [activeTab, setActiveTab] = useState("month");
  // Stateful copy of the week so the 週 tab's delete/undo can mark a day un-recorded and the
  // summary/strip/list all react. Deleting sets recorded:false (dot → muted, drops from list);
  // undo restores the original day object.
  const [weekDays, setWeekDays] = useState(THIS_WEEK_DAYS);
  const [dayIndex, setDayIndex] = useState(THIS_WEEK_DAYS.length - 1);
  // The day whose "..." action sheet is open, or whose delete is pending confirmation.
  const [activeEntry, setActiveEntry] = useState(null);
  const [confirmingEntry, setConfirmingEntry] = useState(null);
  const { show: showToast, hide: hideToast } = useToast();

  const openDay = (index) => {
    setDayIndex(index);
    setActiveTab("day");
  };

  const handleDeleteRequest = () => {
    setConfirmingEntry(activeEntry);
    setActiveEntry(null);
  };

  const handleDeleteConfirmed = () => {
    const deleted = confirmingEntry;
    setWeekDays((prev) =>
      prev.map((day) =>
        day.id === deleted.id ? { ...day, recorded: false, moodIndex: null, moodText: "", tags: [], note: "" } : day
      )
    );
    setConfirmingEntry(null);
    showToast({
      message: "心情已刪除",
      icon: toastCheckIcon,
      actionLabel: "復原",
      onAction: () => {
        hideToast();
        setWeekDays((prev) => prev.map((day) => (day.id === deleted.id ? deleted : day)));
      },
    });
  };

  return (
    <PhoneFrame>
      <div className="absolute top-0 left-0 w-full">
        <StatusBar />
      </div>

      <div className="scroll-hidden absolute top-[59px] right-0 bottom-0 left-0 flex flex-col items-center gap-6 overflow-y-auto px-6">
        <div className="flex w-full flex-col items-center gap-4">
          <p className="text-center text-2xl leading-[1.5] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            回顧
          </p>
          <SegmentedControl value={activeTab} onChange={setActiveTab} options={TABS} />
        </div>

        {activeTab === "month" && <MonthTab onSelectDay={openDay} />}
        {activeTab === "week" && <WeekTab weekDays={weekDays} onOpenActions={setActiveEntry} />}
        {activeTab === "day" && <DayTab weekDays={weekDays} dayIndex={dayIndex} setDayIndex={setDayIndex} />}
      </div>

      <TabBar active="history" />

      <AnimatePresence>
        {activeEntry && (
          <EntryActionSheet onEdit={() => setActiveEntry(null)} onDelete={handleDeleteRequest} onClose={() => setActiveEntry(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmingEntry && <DeleteConfirmDialog onConfirm={handleDeleteConfirmed} onCancel={() => setConfirmingEntry(null)} />}
      </AnimatePresence>
    </PhoneFrame>
  );
}
