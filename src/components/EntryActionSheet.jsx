import { motion } from "motion/react";
import pencilIcon from "../assets/review/pencil.svg";
import trashIcon from "../assets/review/trash.svg";

const variants = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { type: "spring", bounce: 0.16, duration: 0.55 } },
  exit: { y: "100%", transition: { type: "spring", bounce: 0, duration: 0.4 } },
};

function ActionRow({ icon, label, color, onClick, withDivider }) {
  return (
    <div className="flex w-full flex-col items-start">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left"
      >
        <img src={icon} alt="" className="size-[22px] shrink-0" />
        <p className="min-w-px flex-1 text-sm leading-[1.5]" style={{ color }}>
          {label}
        </p>
      </button>
      {withDivider && <div className="h-px w-full" style={{ background: "#E5E7EB", opacity: 0.8 }} />}
    </div>
  );
}

export default function EntryActionSheet({ onEdit, onDelete, onClose }) {
  return (
    <>
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.4)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="absolute bottom-0 left-0 flex w-full flex-col items-start rounded-t-[24px] pt-2 pb-10"
        style={{ background: "var(--color-bg-surface)" }}
      >
        <div className="flex h-6 w-full shrink-0 items-center justify-center">
          <div className="h-[5px] w-9 rounded-full" style={{ background: "#D1D5DB" }} />
        </div>
        <div className="flex w-full flex-col items-start pt-2">
          <ActionRow icon={pencilIcon} label="編輯" color="var(--color-text-primary)" onClick={onEdit} withDivider />
          <ActionRow icon={trashIcon} label="刪除" color="#EF4444" onClick={onDelete} />
        </div>
      </motion.div>
    </>
  );
}
