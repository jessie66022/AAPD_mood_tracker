import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls, useMotionValue, animate } from "motion/react";
import { useNavigate } from "react-router-dom";
import StatusBar from "./StatusBar";
import Button from "./Button";
import ChatPanel from "./ChatPanel";
import { useRecordSheet } from "../context/SheetContext";
import { SLIDER_MOODS, sliderMoodToCalendarCell } from "../data/moods";
import { moodOpening, chatScriptFor, composeChatSummary } from "../data/askBear";
import backArrow from "../assets/mood/back-arrow.svg";
import closeIcon from "../assets/mood/close.svg";
import glowSvg from "../assets/mood/glow.svg?raw";
import bearSvg from "../assets/mood/bear.svg?raw";

// Distance/velocity beyond which a downward drag commits to dismiss rather than springing back.
const DISMISS_OFFSET = 120;
const DISMISS_VELOCITY = 500;

function ProgressBar({ filledWidth }) {
  return (
    <div className="relative h-3 w-[270px] shrink-0">
      <div className="absolute inset-0 rounded-full" style={{ background: "var(--color-primary-muted)" }} />
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: filledWidth, background: "#60995C" }} />
    </div>
  );
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const WEEKDAY_HEADER = ["一", "二", "三", "四", "五", "六", "日"]; // calendar is Monday-first
const MONTH_NAMES = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const TODAY_ISO = "2026-07-04";

const pad = (n) => String(n).padStart(2, "0");

// Small inline chevron (matches the app's stroke-icon style).
function Chevron({ dir = "left", className, color = "var(--color-text-primary)" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d={dir === "left" ? "M15 18L9 12L15 6" : "M9 18L15 12L9 6"}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SHEET_VARIANTS = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { type: "spring", bounce: 0.16, duration: 0.5 } },
  exit: { y: "100%", transition: { type: "spring", bounce: 0, duration: 0.35 } },
};

// Calendar bottom sheet (Figma 204:4283). Pick a day, navigate months, confirm with the check
// (back cancels). Rendered inside the record sheet, so it overlays it at z-50.
function DatePickerSheet({ value, onConfirm, onClose }) {
  const init = new Date(`${value}T00:00:00`);
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth()); // 0–11
  const [selected, setSelected] = useState(value); // ISO of the pending day

  const isoFor = (day) => `${year}-${pad(month + 1)}-${pad(day)}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadBlanks = (new Date(year, month, 1).getDay() + 6) % 7; // Mon-first offset
  const cells = [...Array(leadBlanks).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const stepMonth = (delta) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  return (
    <>
      <motion.div
        className="absolute inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.4)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        variants={SHEET_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        className="absolute inset-x-0 bottom-0 z-50 flex flex-col gap-6 rounded-t-[32px] px-4 pt-6 pb-8"
        style={{ background: "var(--color-bg-surface)", boxShadow: "0px -2px 12px rgba(0,0,0,0.08)" }}
      >
        {/* Header: cancel (back), title, confirm (check) */}
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="取消"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[20px] border"
            style={{ borderColor: "#E5E7EB", background: "var(--color-bg-surface)", boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" }}
          >
            <Chevron dir="left" className="size-4" />
          </button>
          <p className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            選擇日期
          </p>
          <button
            type="button"
            onClick={() => onConfirm(selected)}
            aria-label="確認"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[20px] border"
            style={{ borderColor: "#E5E7EB", background: "var(--color-bg-surface)", boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" }}
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
              <path d="M3 8.5L6.5 12L13 5" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Month selector pill */}
        <div className="flex w-full justify-center">
          <div className="flex w-[260px] items-center justify-between rounded-full px-4 py-[10px]" style={{ background: "#F3F4F6" }}>
            <button type="button" onClick={() => stepMonth(-1)} aria-label="上個月" className="cursor-pointer">
              <Chevron dir="left" className="size-3" />
            </button>
            <p className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {MONTH_NAMES[month]} {year}
            </p>
            <button type="button" onClick={() => stepMonth(1)} aria-label="下個月" className="cursor-pointer">
              <Chevron dir="right" className="size-3" />
            </button>
          </div>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 px-2">
          {WEEKDAY_HEADER.map((w) => (
            <p key={w} className="text-center text-[13px] font-medium" style={{ color: "var(--color-text-secondary)" }}>
              {w}
            </p>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-2 px-2">
          {cells.map((day, i) =>
            day == null ? (
              <div key={i} className="size-11" />
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(isoFor(day))}
                className="mx-auto flex size-11 cursor-pointer items-center justify-center rounded-[22px] text-base"
                style={
                  selected === isoFor(day)
                    ? { background: "var(--color-primary)", color: "#fff" }
                    : { color: "var(--color-text-primary)" }
                }
              >
                {day}
              </button>
            )
          )}
        </div>
      </motion.div>
    </>
  );
}

// Tappable date chip: opens the calendar bottom sheet to change the record's date.
function DateChip() {
  const [date, setDate] = useState(TODAY_ISO);
  const [open, setOpen] = useState(false);
  const [y, m, d] = date.split("-").map(Number);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border px-4 py-4 whitespace-nowrap cursor-pointer"
        style={{ background: "var(--color-bg-surface)", borderColor: "#D5CAC0" }}
      >
        <span className="text-base font-semibold" style={{ color: "var(--color-primary)" }}>
          {date === TODAY_ISO ? "今天" : `週${WEEKDAYS[new Date(y, m - 1, d).getDay()]}`}
        </span>
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          •
        </span>
        <span className="text-base font-semibold" style={{ color: "var(--color-primary)" }}>
          {m}月{d}日
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <DatePickerSheet
            value={date}
            onConfirm={(iso) => {
              setDate(iso);
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function MoodStep({ value, setValue, onNext, onClose }) {
  const mood = SLIDER_MOODS[value];
  return (
    <>
      <div className="flex w-full items-center justify-center gap-[23px] px-6 py-4">
        <button type="button" onClick={onClose} aria-label="上一步" className="size-6 shrink-0 cursor-pointer">
          <img src={backArrow} alt="" className="size-full" />
        </button>
        <ProgressBar filledWidth="112px" />
        <button type="button" onClick={onClose} aria-label="關閉" className="size-6 shrink-0 cursor-pointer">
          <img src={closeIcon} alt="" className="size-full" />
        </button>
      </div>
      <div className="flex w-full flex-col items-center">
        <DateChip />
      </div>

      <div className="absolute top-[240.5px] left-6 flex w-[354px] flex-col items-center gap-12">
        <div className="relative flex w-full flex-col items-center gap-12">
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 size-[172px] -translate-x-1/2 -translate-y-1/2"
            style={{ "--fill-0": mood.fill }}
            dangerouslySetInnerHTML={{ __html: glowSvg }}
          />
          <div className="relative flex w-full flex-col items-center gap-2">
            <p className="w-[216px] text-center text-2xl leading-[1.5] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              現在的你感覺如何？
            </p>
            <p className="text-center text-sm leading-[1.5]" style={{ color: "var(--color-text-secondary)" }}>
              請調整下方滑桿設定心情感受
            </p>
          </div>
          <div
            className="relative h-[162px] w-[106px]"
            style={{ "--fill-0": mood.fill, "--stroke-0": mood.stroke }}
            dangerouslySetInnerHTML={{ __html: bearSvg }}
          />
          <motion.p
            key={mood.label}
            initial={{ scale: 0.8, y: 6, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.55, duration: 0.5 }}
            className="relative text-center text-xl leading-[1.5] font-semibold"
            style={{ color: mood.stroke }}
          >
            {mood.label}
          </motion.p>
        </div>

        <div className="flex w-full flex-col items-start gap-3">
          <input
            type="range"
            min={0}
            max={SLIDER_MOODS.length - 1}
            step={1}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label="情緒強度"
            className="h-12 w-full cursor-pointer appearance-none bg-transparent outline-none
              [&::-webkit-slider-runnable-track]:h-9 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(90deg,#BAAFD6_0%,#66CCED_17%,#92D0A8_33%,#C4A588_50%,#FACA78_67%,#F6B386_83%,#F3A9B7_100%)]
              [&::-moz-range-track]:h-9 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[linear-gradient(90deg,#BAAFD6_0%,#66CCED_17%,#92D0A8_33%,#C4A588_50%,#FACA78_67%,#F6B386_83%,#F3A9B7_100%)]
              [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:size-12 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_4px_10px_rgba(0,0,0,0.08)]
              [&::-moz-range-thumb]:size-12 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_4px_10px_rgba(0,0,0,0.08)]"
          />
          <div className="flex w-full items-center justify-between text-sm leading-[1.5] whitespace-nowrap" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.77px" }}>
            <p>{SLIDER_MOODS[0].label}</p>
            <p>{SLIDER_MOODS[SLIDER_MOODS.length - 1].label}</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-9 left-6 w-[354px]">
        <Button onClick={onNext}>和熊熊聊聊</Button>
      </div>
    </>
  );
}

// Chat step (replaces the old tags + done screens). Reached straight from the slider once a
// mood is picked — the bear opens with a line acknowledging that mood, then it's a free chat.
// Back returns to the slider; the X dismisses the sheet and lands on Home.
function ChatStep({ moodIndex, onBack, onClose, onEnd }) {
  const mood = SLIDER_MOODS[moodIndex];
  // Seed the conversation once so re-renders (e.g. typing) don't rebuild the opener.
  const [seed] = useState(() => [{ id: 1, role: "bot", text: moodOpening(moodIndex) }]);
  // The guided tree for this mood group — its root chips answer the opener's question.
  const [script] = useState(() => chatScriptFor(moodIndex));
  return (
    <>
      <div className="flex w-full shrink-0 items-center justify-between px-6 py-4">
        <button type="button" onClick={onBack} aria-label="上一步" className="size-6 shrink-0 cursor-pointer">
          <img src={backArrow} alt="" className="size-full" />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-[26px]"
            style={{ "--fill-0": mood.fill, "--stroke-0": mood.stroke }}
            dangerouslySetInnerHTML={{ __html: bearSvg }}
          />
          <p className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            和熊熊聊聊
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="關閉" className="size-6 shrink-0 cursor-pointer">
          <img src={closeIcon} alt="" className="size-full" />
        </button>
      </div>

      <div className="flex w-full min-h-0 flex-1 flex-col gap-4 px-6 pb-6">
        <ChatPanel seedMessages={seed} script={script} onEnd={onEnd} />
      </div>
    </>
  );
}

// Completion page (reuses the original success-screen visuals — ambient mood glow + the bear
// rising/fading in — with new copy). Reached after the chat's 收尾 chip, so it reads as the
// finish line for a full record: the mood, the chat recap (`summary`), and a done-checklist that
// ties the mood log and the chat together. 完成 (or X) returns Home.
function DoneStep({ moodIndex, summary, onDone }) {
  const mood = SLIDER_MOODS[moodIndex];
  return (
    <>
      {/* Ambient glow (Figma Ellipse 20/21): two large blurred, mood-tinted blobs drifting on a
          slow 5s boomerang loop. pointer-events-none so they never intercept taps. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-28 h-[600px] w-[340px] rounded-full blur-[76px]"
          style={{ background: mood.fill, opacity: 0.22 }}
          animate={{ x: [0, 90, 40], y: [0, -40, -80], rotate: [0, -30, -30] }}
          transition={{ duration: 5, times: [0, 0.65, 1], ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute top-[440px] left-20 h-[510px] w-[450px] rounded-full blur-[76px]"
          style={{ background: mood.fill, opacity: 0.14 }}
          animate={{ x: [0, -80, -20], y: [0, -20, -60], rotate: [0, -40, -40] }}
          transition={{ duration: 5, times: [0, 0.65, 1], ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      {/* Nav: X returns Home. No back — the chat has already wrapped up. */}
      <div className="relative z-10 flex w-full shrink-0 items-center justify-end px-6 py-4">
        <button type="button" onClick={onDone} aria-label="關閉" className="size-6 shrink-0 cursor-pointer">
          <img src={closeIcon} alt="" className="size-full" />
        </button>
      </div>

      <div className="scroll-hidden relative z-10 flex w-full min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-6">
        <p className="text-sm leading-[1.5]" style={{ color: "var(--color-text-primary)", letterSpacing: "0.77px" }}>
          7月4日 · 週六
        </p>
        <p className="text-2xl leading-[1.5] font-semibold" style={{ color: "var(--color-text-primary)" }}>
          今天的紀錄完成了
        </p>
        {/* Recorded mood bear rises + fades in once on entrance (Figma Vector 192:6275); the y curve
            overshoots slightly (control point >1) for a soft settle. */}
        <motion.div
          className="mt-1 h-[132px] w-[86px]"
          style={{ "--fill-0": mood.fill, "--stroke-0": mood.stroke }}
          initial={{ opacity: 0, y: 23 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            opacity: { duration: 0.5, ease: [0.5, 0, 0.5, 1] },
            y: { duration: 0.6, ease: [0.42, 0, 0.271, 1.353] },
          }}
          dangerouslySetInnerHTML={{ __html: bearSvg }}
        />
        <p className="text-xl leading-[1.5] font-semibold" style={{ color: mood.text }}>
          {mood.label}
        </p>

        {/* Chat recap — the day's 聊天總結. */}
        {summary && (
          <motion.div
            className="mt-1 flex w-full flex-col gap-1 rounded-2xl p-4"
            style={{ background: "var(--color-bg-surface)", boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          >
            <p className="text-sm leading-[1.5]" style={{ color: "var(--color-text-secondary)" }}>
              今天的總結
            </p>
            <p className="text-base leading-[1.6]" style={{ color: "var(--color-text-primary)" }}>
              {summary}
            </p>
          </motion.div>
        )}

        {/* Done-checklist — the "完整紀錄" feel: mood logged + talked it through. */}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {["已記錄心情", "和熊熊聊過"].map((label) => (
            <span
              key={label}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm leading-[1.5]"
              style={{ background: "var(--color-bg-alt-base)", color: "var(--color-text-primary)" }}
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
                <path d="M3 8.5L6.5 12L13 5" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full shrink-0 px-6 pt-3 pb-9">
        <Button onClick={onDone}>完成</Button>
      </div>
    </>
  );
}

// Slower, softer than Apple's base drawer/sheet spec (damping 0.8 / response 0.3) — sized up
// for a more deliberate, smooth full-screen presentation rather than a quick drawer peek.
const OPEN_TRANSITION = { type: "spring", bounce: 0.16, duration: 0.65 };
const CLOSE_TRANSITION = { type: "spring", bounce: 0, duration: 0.5 };

export default function RecordMoodSheet({ onClose }) {
  const navigate = useNavigate();
  const { setTodayMood, setTodaySummary } = useRecordSheet();
  const dragControls = useDragControls();
  const sheetRef = useRef(null);
  // drag and the open/close animations must drive the same motion value — mixing this with
  // the declarative `animate` prop causes drag and animate to fight over the transform.
  const y = useMotionValue(0);
  const [step, setStep] = useState("mood");
  // Index into SLIDER_MOODS (0–6). Defaults to the far-right 非常愉快, matching the prior slider.
  const [moodIndex, setMoodIndex] = useState(SLIDER_MOODS.length - 1);
  // The chat recap shown on the completion page (also persisted to context for the Review sheet).
  const [chatSummary, setChatSummary] = useState("");
  // `drag` must be OFF during any programmatic (non-gesture) animation of `y` — Framer Motion's
  // own drag-constraint enforcement otherwise keeps fighting an external animate() call every
  // frame, and the two cancel out into a frozen mid-point instead of reaching the target.
  const [isReady, setIsReady] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const height = sheetRef.current?.offsetHeight ?? 874;
    y.set(height);
    animate(y, 0, OPEN_TRANSITION).then(() => setIsReady(true));
  }, [y]);

  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    const height = sheetRef.current?.offsetHeight ?? 874;
    animate(y, height, CLOSE_TRANSITION).then(onClose);
  };

  // Close the sheet, then land on Home regardless of where the record flow was opened from
  // (Home ring or the tab-bar FAB on another screen). Used by the chat step's X.
  const dismissToHome = () => {
    if (isClosing) return;
    setIsClosing(true);
    const height = sheetRef.current?.offsetHeight ?? 874;
    animate(y, height, CLOSE_TRANSITION).then(() => {
      onClose();
      navigate("/AAPD_mood_tracker");
    });
  };

  // Slider → chat: persist the recorded mood so today's calendar bear fills in, then hand off
  // to the bear chat (the tags/done screens are gone — chat is the whole rest of the flow).
  const startChat = () => {
    setTodayMood(sliderMoodToCalendarCell(moodIndex));
    setStep("chat");
  };

  // Chat wrapped up (收尾): build the recap from what happened, show it on the completion page,
  // and stash it in context so today's Review day-summary sheet shows the same thing.
  const finishChat = (recap) => {
    const summary = composeChatSummary(moodIndex, recap);
    setChatSummary(summary);
    setTodaySummary(summary);
    setStep("done");
  };

  return (
    <>
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.4)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isClosing ? 0 : 1 }}
        transition={{ duration: isClosing ? CLOSE_TRANSITION.duration : OPEN_TRANSITION.duration }}
        onClick={requestClose}
      />
      <motion.div
        ref={sheetRef}
        className="absolute inset-0 flex flex-col overflow-hidden rounded-[32px]"
        style={{ background: "var(--color-bg-base)", y }}
        drag={isReady && !isClosing ? "y" : false}
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.15, bottom: 1 }}
        onDragEnd={(_, info) => {
          // Below the threshold: don't fight it with our own animate() — Framer Motion's own
          // constraint snap-back already returns it to y:0 since drag is still active here.
          if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
            requestClose();
          }
        }}
      >
        <div
          className="flex w-full shrink-0 touch-none justify-center pt-2 pb-1"
          onPointerDown={(e) => dragControls.start(e)}
          style={{ cursor: "grab" }}
        >
          <div className="h-1 w-9 rounded-full" style={{ background: "var(--color-primary-muted)" }} />
        </div>
        <StatusBar />

        {step === "mood" ? (
          <MoodStep value={moodIndex} setValue={setMoodIndex} onNext={startChat} onClose={requestClose} />
        ) : step === "chat" ? (
          <ChatStep
            moodIndex={moodIndex}
            onBack={() => setStep("mood")}
            onClose={dismissToHome}
            onEnd={finishChat}
          />
        ) : (
          <DoneStep moodIndex={moodIndex} summary={chatSummary} onDone={dismissToHome} />
        )}
      </motion.div>
    </>
  );
}
