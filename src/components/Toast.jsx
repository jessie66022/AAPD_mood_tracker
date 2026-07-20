import { motion } from "motion/react";

// Enters with a quick spring pop; leaves faster and without the bounce so it doesn't
// linger on the way out.
const variants = {
  initial: { y: "100%", opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.25, duration: 0.45 } },
  exit: { y: "100%", opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

export default function Toast({ message, actionLabel, onAction, icon }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex w-[354px] shrink-0 items-center gap-3 rounded-lg border-[0.5px] p-4"
      style={{
        background: "var(--color-success-surface)",
        borderColor: "var(--color-success-surface)",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.08)",
      }}
    >
      <div className="size-6 shrink-0" dangerouslySetInnerHTML={{ __html: icon }} />
      <p className="min-w-px flex-1 text-base leading-[1.5] font-semibold text-white">{message}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 cursor-pointer text-base leading-[1.5] font-semibold whitespace-nowrap text-white"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
