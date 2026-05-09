import { useEffect, useRef, useState, useCallback } from "react";
import "../styles/toast.css";

/**
 * Reusable toast.
 * Two ways to use:
 *
 * 1) Controlled component (caller manages `message`):
 *    const [msg, setMsg] = useState("");
 *    <Toast message={msg} onClose={() => setMsg("")} />
 *    setMsg("Hello");
 *
 * 2) Imperative hook:
 *    const { showToast, ToastNode } = useToast();
 *    showToast("Hello");
 *    return <>{...} {ToastNode}</>;
 */
export default function Toast({ message, onClose, duration = 2000 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;
  return (
    <div className="appToast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

export function useToast(defaultDuration = 2000) {
  const [message, setMessage] = useState("");
  const timerRef = useRef(null);

  const showToast = useCallback((msg, duration = defaultDuration) => {
    setMessage(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(""), duration);
  }, [defaultDuration]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const ToastNode = message ? (
    <div className="appToast" role="status" aria-live="polite">{message}</div>
  ) : null;

  return { showToast, ToastNode, message };
}
