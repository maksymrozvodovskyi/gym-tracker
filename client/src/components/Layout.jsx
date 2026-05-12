import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  Dumbbell,
  User,
  BarChart3,
  Calendar,
  BookOpen,
  Shield,
} from "lucide-react";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const loc = useLocation();

  const nav = [
    { to: "/", label: "Профіль", icon: User },
    { to: "/exercises", label: "Вправи", icon: BookOpen },
    { to: "/templates", label: "Шаблони", icon: Dumbbell },
    { to: "/sessions", label: "Сесії", icon: Calendar },
    { to: "/analytics", label: "Аналітика", icon: BarChart3 },
    ...(user?.role === "admin"
      ? [{ to: "/admin", label: "Адмін", icon: Shield }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:h-16 md:py-0">
          <div className="flex items-center justify-between gap-3 md:justify-start">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg outline-offset-2 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              aria-label="GymTracker — на головну"
            >
              <Dumbbell
                className="w-8 h-8 shrink-0 text-blue-600"
                aria-hidden
              />
              <span className="font-bold text-xl text-slate-900 dark:text-slate-50">
                GymTracker
              </span>
            </Link>
            <div className="flex items-center gap-2 md:hidden">
              <span className="text-sm text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="btn btn-secondary flex items-center gap-2 shrink-0"
              >
                <LogOut className="w-4 h-4" aria-hidden />
                Вийти
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-sm justify-center md:justify-start">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`nav-link flex items-center gap-2 ${loc.pathname === n.to ? "active" : ""}`}
              >
                <n.icon className="w-4 h-4 shrink-0" aria-hidden /> {n.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <span className="text-sm text-slate-700 dark:text-slate-200">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={logout}
              className="btn btn-secondary flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" aria-hidden /> Вийти
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 text-slate-900 dark:text-slate-100">
        {children}
      </main>
    </div>
  );
}
