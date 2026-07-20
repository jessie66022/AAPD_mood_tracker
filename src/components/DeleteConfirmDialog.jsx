import { motion } from "motion/react";
import bearSvg from "../assets/shared/bear-note-recolor.svg?raw";

// Smooth pop on both ends: a subtle scale + fade with no spring overshoot, so it settles
// cleanly rather than bouncing. Entrance uses a gentle decelerating easeOut; exit mirrors it
// with a soft easeInOut and matched scale delta so dismissing feels just as smooth (not
// clipped short).
const variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
};

export default function DeleteConfirmDialog({ onConfirm, onCancel }) {
  return (
    <>
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.4)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
      />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex w-[354px] flex-col items-start gap-6 rounded-2xl p-6"
          style={{ background: "var(--color-bg-surface)", boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" }}
        >
          <div className="size-12 shrink-0" style={{ "--fill-0": "#D4CAC5", "--stroke-0": "var(--color-primary)" }} dangerouslySetInnerHTML={{ __html: bearSvg }} />
          <p className="w-full text-xl leading-[1.5] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            確定要刪除這篇心情嗎？
          </p>
          <p className="w-full text-base leading-[1.5]" style={{ color: "var(--color-text-primary)", opacity: 0.8 }}>
            你的心情對熊熊很重要，紀錄刪除後將無法恢復。確定要刪除嗎？
          </p>
          <div className="flex w-full items-start gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className="h-12 flex-1 cursor-pointer rounded-full border text-base leading-[1.5] font-semibold"
              style={{ background: "var(--color-bg-surface)", borderColor: "#D5CAC0", color: "var(--color-primary)" }}
            >
              刪除
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="h-12 flex-1 cursor-pointer rounded-full text-base leading-[1.5] font-semibold text-white"
              style={{ background: "var(--color-primary)" }}
            >
              取消
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
