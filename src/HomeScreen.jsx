import { motion, useReducedMotion } from "motion/react";
import PhoneFrame from "./components/PhoneFrame";
import StatusBar from "./components/StatusBar";
import TabBar from "./components/TabBar";
import { useRecordSheet } from "./context/SheetContext";
import avatar from "./assets/shared/avatar.svg";
import moodRing from "./assets/home/mood-ring.svg";
import addPlusIcon from "./assets/shared/add-icon.svg";

export default function HomeScreen() {
  const { open } = useRecordSheet();
  const reduceMotion = useReducedMotion();
  return (
    <PhoneFrame>
      {/* Status Bar */}
      <div className="absolute top-0 left-0 w-full">
        <StatusBar />
      </div>

      {/* Main Container */}
      <div className="absolute top-[67px] left-6 flex h-[695px] w-[354px] flex-col items-center justify-start pb-6">
        {/* Greeting */}
        <div className="flex w-full items-start justify-between">
          <div className="flex flex-col items-start gap-2 leading-[1.5]">
            <div
              className="flex w-full items-center gap-1 text-sm whitespace-nowrap"
              style={{ color: "var(--color-text-secondary)", letterSpacing: "0.77px" }}
            >
              <p>7月31日</p>
              <p>•</p>
              <p>週五</p>
            </div>
            <p className="w-full text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
              嗨 Jessie
            </p>
          </div>
          <div className="size-10 shrink-0">
            <img src={avatar} alt="頭像" className="size-full" />
          </div>
        </div>

        {/* Mood Tracker */}
        <div className="flex flex-1 flex-col items-center justify-center gap-9">
          {/* Header rises 36px and fades in on mount (Figma 193:6390). */}
          <motion.div
            className="flex h-[34px] w-full flex-col items-center"
            initial={reduceMotion ? false : { y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              y: { duration: 0.975, ease: [0.9005, 0.00047, 0.58, 1] },
              opacity: { delay: 0.469, duration: 0.505, ease: [0.5, 0, 0.5, 1] },
            }}
          >
            <p className="text-2xl font-semibold whitespace-nowrap" style={{ color: "var(--color-text-primary)" }}>
              現在的你感覺如何？
            </p>
          </motion.div>
          <button
            type="button"
            onClick={open}
            className="relative grid size-[232px] cursor-pointer place-items-center transition-transform duration-100 ease-out active:scale-97"
            aria-label="記錄心情"
          >
            {/* Mood ring (Figma 193:6393): the conic-gradient donut image revealed through a
                round-capped arc mask that draws on from the top. See index.css for the motion. */}
            <svg viewBox="0 0 232 232" className="ring-breathe col-start-1 row-start-1 size-[232px]" aria-hidden="true">
              <defs>
                <mask id="mood-ring-reveal">
                  {/* White reveal arc: r/strokeWidth match the donut band (outer 116, inner 92.8);
                      rotate -90 so the sweep starts at 12 o'clock. */}
                  <circle
                    cx="116"
                    cy="116"
                    r="104.4"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="23.2"
                    strokeLinecap="round"
                    pathLength="360"
                    transform="rotate(-90 116 116)"
                    className="ring-reveal-arc"
                  />
                </mask>
              </defs>
              <g mask="url(#mood-ring-reveal)">
                <image href={moodRing} width="232" height="232" className="ring-flow" />
              </g>
            </svg>
            <div className="col-start-1 row-start-1 flex w-8 flex-col items-center gap-1">
              <img src={addPlusIcon} alt="" className="size-6" />
              <p className="w-full text-base leading-[1.5] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                記錄
              </p>
            </div>
          </button>
        </div>
      </div>

      <TabBar active="home" />
    </PhoneFrame>
  );
}
