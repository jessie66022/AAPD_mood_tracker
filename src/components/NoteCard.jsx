import { Link } from "react-router-dom";
import gummyBearDay from "../assets/shared/gummy-bear-day.svg";
import chevron from "../assets/shared/chevron.svg";

export default function NoteCard() {
  return (
    <Link
      to="/ask-bear"
      viewTransition
      className="flex w-full cursor-pointer items-center gap-4 rounded-2xl p-4"
      style={{ background: "var(--color-bg-alt-base)" }}
    >
      <div className="relative size-12 shrink-0">
        <img src={gummyBearDay} alt="" className="absolute top-0 left-1/2 size-[45.176px] -translate-x-1/2" />
      </div>
      <div className="flex min-w-px flex-1 flex-col items-start justify-center gap-1 text-base leading-[1.5]">
        <p className="w-full" style={{ color: "var(--color-text-primary)" }}>
          和小熊聊聊吧
        </p>
        <p className="w-full" style={{ color: "var(--color-text-secondary)" }}>
          有自我照顧的日子裡，你常常感到非常愉快。
        </p>
      </div>
      <img src={chevron} alt="" className="size-6 shrink-0" />
    </Link>
  );
}
