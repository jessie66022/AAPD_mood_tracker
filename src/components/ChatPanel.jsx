import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import gummyBearDay from "../assets/shared/gummy-bear-day.svg";
import { answerFreeText } from "../lib/insights";
import { PRACTICES, PRACTICE_CHIP } from "../data/askBear";

// Each bubble fades + rises in as it arrives (對話框 fade in). Reduced-motion users get a plain,
// instant bubble.
function Bubble({ role, text, reduceMotion }) {
  const isBot = role === "bot";
  const inner = isBot ? (
    <div className="flex items-end gap-2">
      <img src={gummyBearDay} alt="" className="size-8 shrink-0" />
      <div
        className="max-w-[260px] rounded-2xl p-3 text-base leading-[1.5]"
        style={{ background: "var(--color-bg-surface)", boxShadow: "0px 2px 4px rgba(0,0,0,0.08)", color: "var(--color-text-primary)" }}
      >
        {text}
      </div>
    </div>
  ) : (
    <div className="flex justify-end">
      <div className="max-w-[260px] rounded-2xl p-3 text-base leading-[1.5] text-white" style={{ background: "var(--color-primary)" }}>
        {text}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.5, 0, 0.5, 1] }}
    >
      {inner}
    </motion.div>
  );
}

// "Bear is thinking" placeholder: fades in after the user speaks, then fades out as the reply
// lands (對話框 fade out). Three dots pulse on a staggered loop.
function TypingBubble({ reduceMotion }) {
  return (
    <motion.div
      className="flex items-end gap-2"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.5, 0, 0.5, 1] }}
    >
      <img src={gummyBearDay} alt="" className="size-8 shrink-0" />
      <div
        className="flex items-center gap-1 rounded-2xl px-4 py-4"
        style={{ background: "var(--color-bg-surface)", boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2 rounded-full"
            style={{ background: "var(--color-text-muted)" }}
            animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// How long the typing indicator lingers before the bear's reply lands.
const REPLY_DELAY = 650;
// After a closing (收尾) line, how long to let the user read it before returning Home.
const END_DELAY = 2000;

// The chat conversation: message list + composer, shared by the 問熊熊 tab (AskBearScreen) and
// the in-sheet chat that follows the mood slider (RecordMoodSheet). Replies are scripted — this
// is a prototype, not a live LLM.
//
// The bear answers one thing at a time: sending shows a brief typing indicator, then a single
// reply fades in — so its guiding questions arrive one per turn rather than all at once.
//
// - `seedMessages`: messages present on mount (e.g. the bear's mood-aware opener). When empty
//   and `renderEmpty` is provided, the empty state is shown instead of the (empty) list.
// - `renderEmpty(send)`: optional empty-state node; `send(userText, botText)` posts an exchange
//   (used by the tab's suggestion chips).
// - `script`: a guided tree ({ rootChips, nodes }) from CHAT_SCRIPTS. Chips walk the tree, launch
//   a practice, invite more talk, or end the chat. When present, the practice chip is appended to
//   every chip row so a小練習 is always reachable.
// - `onEnd`: called after a 收尾 (end) chip's closing line, to leave the chat (e.g. return Home).
// - `suggestions`: persistent quick-reply chips for the free-chat (問熊熊) mode — `{ key, label,
//   resolve }`, where `resolve()` returns the bear's answer. Unlike the guided `script` chips they
//   don't change, so the user always has jumping-off points to keep exploring their records. Shown
//   once the conversation has started (the empty state renders its own greeting + chips).
export default function ChatPanel({ seedMessages = [], renderEmpty, script = null, onEnd, suggestions = [] }) {
  const [messages, setMessages] = useState(seedMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  // Contextual chips currently offered under the bear's latest message (walks the `script` tree).
  const [chips, setChips] = useState(() => script?.rootChips ?? []);
  // While a guided practice is running, the user's answers advance it instead of hitting the
  // normal scripted replies. `null` = no exercise; otherwise { id, step } (step = answers given).
  const [exercise, setExercise] = useState(null);
  const [ending, setEnding] = useState(false);
  const reduceMotion = useReducedMotion();
  const bottomRef = useRef(null);
  const idRef = useRef(seedMessages.length);
  const timerRef = useRef(null);
  const endTimerRef = useRef(null);
  // What happened in this chat, gathered for the end-of-chat recap (see composeChatSummary):
  // the topics tapped through the tree, whether a practice ran, whether the user typed freely.
  const topicsRef = useRef([]);
  const practiceRef = useRef(false);
  const freeTextRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, pending]);

  // Clear pending timers if the panel unmounts mid-turn (e.g. sheet closed).
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(endTimerRef.current);
    };
  }, []);

  // Post the user's line immediately, then let the bear "think" (typing indicator) before its
  // single reply fades in. Guarded so a turn can't be started while one is already in flight.
  const push = (userText, botText) => {
    if (pending) return;
    setMessages((prev) => [...prev, { id: (idRef.current += 1), role: "user", text: userText }]);
    setPending(true);
    timerRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { id: (idRef.current += 1), role: "bot", text: botText }]);
      setPending(false);
    }, REPLY_DELAY);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending || ending) return;
    if (exercise) {
      // An answer to the current practice step: acknowledge + ask the next step, or close out.
      const p = PRACTICES[exercise.id];
      const nextStep = exercise.step + 1;
      const done = nextStep >= p.steps;
      setExercise(done ? null : { id: exercise.id, step: nextStep });
      // On finish, swap in the practice's own 收尾 chips (which answer the done question and let
      // the user leave) instead of falling back to the pre-practice tree chips.
      if (done && p.doneChips) setChips(p.doneChips);
      push(text, done ? p.done : p.prompts[exercise.step]);
    } else {
      freeTextRef.current = true;
      push(text, answerFreeText(text));
    }
    setInput("");
  };

  // A persistent 問熊熊 suggestion: post it like a user message, with its resolved insight answer.
  const handleSuggestion = (s) => {
    if (pending || ending) return;
    freeTextRef.current = true;
    push(s.label, s.resolve());
  };

  const handleChip = (chip) => {
    if (pending || ending) return;
    const userText = chip.userText ?? chip.label;
    if (chip.kind === "practice") {
      const p = PRACTICES[chip.practiceId];
      if (!p) return;
      practiceRef.current = true;
      setExercise({ id: p.id, step: 0 }); // chips stay put — they return after the practice
      push(userText, p.intro);
    } else if (chip.end) {
      setChips([]);
      setEnding(true);
      push(userText, chip.end);
      if (onEnd) {
        const recap = { topics: topicsRef.current, didPractice: practiceRef.current, freeTexted: freeTextRef.current };
        endTimerRef.current = setTimeout(() => onEnd(recap), REPLY_DELAY + END_DELAY);
      }
    } else if (chip.to) {
      const node = script?.nodes?.[chip.to];
      if (!node) return;
      topicsRef.current = [...topicsRef.current, userText]; // a content selection in the tree
      setChips(node.chips ?? []);
      push(userText, node.text);
    } else if (chip.reply) {
      // Invite to keep talking / 幫我打氣 — bear responds, contextual chips stay available.
      push(userText, chip.reply);
    } else {
      push(userText, answerFreeText(userText));
    }
  };

  // Append the universal practice chip unless this row already offers one — or the row is purely
  // closing (收尾) options, e.g. the just-finished practice's exit chips, where offering another
  // practice would only get in the way of leaving.
  const displayChips =
    script && chips.length > 0 && !chips.some((c) => c.kind === "practice") && !chips.every((c) => c.end)
      ? [...chips, PRACTICE_CHIP]
      : chips;
  const lastMessage = messages[messages.length - 1];
  // The chip row is shared: the guided `script` tree drives it in the mood chat, while `suggestions`
  // drive it (persistently) in the free-chat 問熊熊 mode once the conversation has started. Either
  // way it only shows when the bear has just spoken and nothing is mid-flight.
  const chipButtons = script
    ? displayChips.map((chip) => ({ key: chip.label, label: chip.label, onClick: () => handleChip(chip) }))
    : messages.length > 0
      ? suggestions.map((s) => ({ key: s.key, label: s.label, onClick: () => handleSuggestion(s) }))
      : [];
  const showChips = chipButtons.length > 0 && !exercise && !pending && !ending && lastMessage?.role === "bot";

  return (
    <>
      {messages.length === 0 && renderEmpty ? (
        renderEmpty(push)
      ) : (
        <div className="scroll-hidden flex flex-1 flex-col gap-3 overflow-y-auto py-1">
          {messages.map((m) => (
            <Bubble key={m.id} role={m.role} text={m.text} reduceMotion={reduceMotion} />
          ))}
          <AnimatePresence>{pending && <TypingBubble key="typing" reduceMotion={reduceMotion} />}</AnimatePresence>
          <div ref={bottomRef} />
        </div>
      )}

      {/* Contextual quick-reply chips (guided tree + universal practice). Fade with the
          conversation and tuck away while the bear is typing or a practice is in progress.
          The row scrolls horizontally so 4–5 chips stay on one line. */}
      <AnimatePresence>
        {showChips && (
          <motion.div
            key="chips"
            className="scroll-hidden flex w-full shrink-0 gap-2 overflow-x-auto pb-1"
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {chipButtons.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onClick}
                className="shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm leading-[1.5] whitespace-nowrap"
                style={{ background: "var(--color-bg-surface)", borderColor: "#D5CAC0", color: "var(--color-text-primary)" }}
              >
                {chip.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit}
        className="flex w-full shrink-0 items-center gap-2 rounded-full py-2 pr-2 pl-4"
        style={{ background: "var(--color-bg-surface)", boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="問問熊熊..."
          className="min-w-0 flex-1 bg-transparent text-base leading-[1.5] outline-none"
          style={{ color: "var(--color-text-primary)" }}
        />
        <button
          type="submit"
          aria-label="送出"
          disabled={pending || ending}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity disabled:cursor-default disabled:opacity-50"
          style={{ background: "var(--color-primary)" }}
        >
          <SendIcon />
        </button>
      </form>
    </>
  );
}
