import PhoneFrame from "./components/PhoneFrame";
import StatusBar from "./components/StatusBar";
import TabBar from "./components/TabBar";
import ChatPanel from "./components/ChatPanel";
import gummyBearDay from "./assets/shared/gummy-bear-day.svg";
import { GREETING, GREETING_SUBTEXT, SUGGESTIONS } from "./data/askBear";
import { weeklyMoodSummary, monthlyMoodBreakdown, topInfluenceTags, monthlyRecordRate } from "./lib/insights";

const INSIGHT_FNS = {
  week: weeklyMoodSummary,
  month: monthlyMoodBreakdown,
  tags: topInfluenceTags,
  rate: monthlyRecordRate,
};

export default function AskBearScreen() {
  return (
    <PhoneFrame>
      <div className="absolute top-0 left-0 w-full">
        <StatusBar />
      </div>

      <div className="absolute top-[59px] left-0 flex h-[695px] w-full flex-col gap-4 px-6 pb-2">
        <p className="text-center text-2xl leading-[1.5] font-semibold whitespace-nowrap" style={{ color: "var(--color-text-primary)" }}>
          問熊熊
        </p>

        <ChatPanel
          renderEmpty={(send) => (
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
                    onClick={() => send(s.label, INSIGHT_FNS[s.key]())}
                    className="cursor-pointer rounded-full border px-4 py-[10px] text-base leading-[1.5]"
                    style={{ background: "var(--color-bg-surface)", borderColor: "#D5CAC0", color: "var(--color-text-primary)" }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        />
      </div>

      <TabBar active="ask-bear" />
    </PhoneFrame>
  );
}
