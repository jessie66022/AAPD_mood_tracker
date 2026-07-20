import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

const TOAST_DURATION = 3000;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const show = useCallback(
    (next) => {
      clearTimeout(timerRef.current);
      setToast(next);
      timerRef.current = setTimeout(hide, TOAST_DURATION);
    },
    [hide],
  );

  return <ToastContext.Provider value={{ toast, show, hide }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
