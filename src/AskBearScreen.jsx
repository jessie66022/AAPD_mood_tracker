import { useEffect, useRef, useState } from "react";
import PhoneFrame from "./components/PhoneFrame";
import StatusBar from "./components/StatusBar";
import TabBar from "./components/TabBar";
import gummyBearDay from "./assets/shared/gummy-bear-day.svg";
import { GREETING, GREETING_SUBTEXT, SUGGESTIONS } from "./data/askBear";
import { weeklyMoodSummary, monthlyMoodBreakdown, topInfluenceTags, monthlyRecordRate, answerFreeText } from "./lib/insights";

const INSIGHT_FNS = {
  week: weeklyMoodSummary,
  month: monthlyMoodBreakdown,
  tags: topInfluenceTags,
  rate: monthlyRecordRate,
};

function BotBubble({ text }) {
  return (
    <div className="flex items-end gap-2">
      <img src={gummyBearDay} alt="" className="size-8 shrink-0" />
      <div
        className="max-w-[260px] rounded-2xl p-3 text-base leading-[1.5]"
        style={{ background: "var(--color-bg-surface)", boxShadow: "0px 2px 4px rgba(0,0,0,0.08)", color: "var(--color-text-primary)" }}
      >
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[260px] rounded-2xl p-3 text-base leading-[1.5] text-white" style={{ background: "var(--color-primary)" }}>
        {text}
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AskBearScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const appendExchange = (userText, botText) => {
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "user", text: userText },
      { id: prev.length + 2, role: "bot", text: botText },
    ]);
  };

  const sendSuggestion = (key, label) => {
    appendExchange(label, INSIGHT_FNS[key]());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    appendExchange(text, answerFreeText(text));
    setInput("");
  };

  return (
    <PhoneFrame>
      <div className="absolute top-0 left-0 w-full">
        <StatusBar />
      </div>

      <div className="absolute top-[59px] left-0 flex h-[695px] w-full flex-col gap-4 px-6 pb-2">
        <p className="text-center text-2xl leading-[1.5] font-semibold whitespace-nowrap" style={{ color: "var(--color-text-primary)" }}>
          問熊熊
        </p>

        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <img src={gummyBearDay} alt="" className="size-16" />
            <div className="flex flex-col items-center gap-1">
              <p className="text-xl leading-[1.5] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {GREETING}
              </p>
              <p className="max-w-[280px] text-sm leading-[1.5]" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.77px" }}>
                {GREETING_SUBTEXT}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 px-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => sendSuggestion(s.key, s.label)}
                  className="cursor-pointer rounded-full border px-4 py-[10px] text-base leading-[1.5]"
                  style={{ background: "var(--color-bg-surface)", borderColor: "#D5CAC0", color: "var(--color-text-primary)" }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="scroll-hidden flex flex-1 flex-col gap-3 overflow-y-auto py-1">
            {messages.map((m) => (m.role === "bot" ? <BotBubble key={m.id} text={m.text} /> : <UserBubble key={m.id} text={m.text} />))}
            <div ref={bottomRef} />
          </div>
        )}

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
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full"
            style={{ background: "var(--color-primary)" }}
          >
            <SendIcon />
          </button>
        </form>
      </div>

      <TabBar active="ask-bear" />
    </PhoneFrame>
  );
}
