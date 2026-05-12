import { ClipLoader } from "react-spinners";

const ACCENT = "#3b82f6";

export function PageLoader({ message = "Завантаження…" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 py-20 text-slate-600 dark:text-slate-400">
      <ClipLoader color={ACCENT} size={44} speedMultiplier={0.85} aria-hidden />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function ScreenLoader({ message = "Завантаження…" }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-5 bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
      <ClipLoader color={ACCENT} size={48} speedMultiplier={0.85} aria-hidden />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function InlineSpinner({ size = 20 }) {
  return (
    <ClipLoader color={ACCENT} size={size} speedMultiplier={0.9} aria-hidden />
  );
}
