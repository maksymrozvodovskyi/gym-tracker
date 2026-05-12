import { useEffect, useState, useMemo } from "react";
import api from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, subMonths } from "date-fns";
import { uk } from "date-fns/locale";

function sessionVolume(s) {
  return s.exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets.reduce((ss, st) => ss + (st.weight || 0) * (st.reps || 0), 0),
    0,
  );
}

export default function Analytics() {
  const [volume, setVolume] = useState(0);
  const [records, setRecords] = useState([]);
  const [sessions, setSessions] = useState([]);

  const load = async () => {
    const start = format(subMonths(new Date(), 3), "yyyy-MM-dd");
    const end = format(new Date(), "yyyy-MM-dd");
    const [v, r, h] = await Promise.all([
      api.get("/analytics/volume", { params: { start, end } }),
      api.get("/analytics/records"),
      api.get("/analytics/history", { params: { start, end } }),
    ]);
    setVolume(v.data.totalVolume);
    setRecords(r.data);
    setSessions(Array.isArray(h.data) ? h.data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const history = useMemo(() => {
    const byDay = new Map();
    for (const s of sessions) {
      const d = new Date(s.date);
      if (Number.isNaN(d.getTime())) continue;
      const key = format(d, "yyyy-MM-dd");
      const vol = sessionVolume(s);
      byDay.set(key, (byDay.get(key) || 0) + vol);
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([iso, vol]) => ({
        sortKey: iso,
        date: format(new Date(iso + "T12:00:00"), "d MMM", { locale: uk }),
        volume: vol,
      }));
  }, [sessions]);

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
        Аналітика
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl mb-2 leading-relaxed">
        Огляд обсягу тренувань за останні три місяці, кількість особистих
        рекордів і динаміка навантаження по сесіях.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="card p-6 md:p-8">
          <div className="text-sm text-slate-500 dark:text-slate-50">
            Загальний обсяг за 3 місяці
          </div>
          <div className="text-4xl font-bold mt-2 text-slate-900 dark:text-slate-50">{volume} кг</div>
        </div>
        <div className="card p-6 md:p-8">
          <div className="text-sm text-slate-500 dark:text-slate-50">Особисті рекорди</div>
          <div className="text-4xl font-bold mt-2 text-slate-900 dark:text-slate-50">{records.length}</div>
        </div>
        <div className="card p-6 md:p-8">
          <div className="text-sm text-slate-500 dark:text-slate-50">Сесій за період</div>
          <div className="text-4xl font-bold mt-2 text-slate-900 dark:text-slate-50">{sessions.length}</div>
        </div>
      </div>

      <div className="card p-6 md:p-8 min-w-0">
        <h2 className="font-semibold mb-6 text-slate-900 dark:text-slate-50 text-lg">
          Динаміка обсягу (кг×повтори)
        </h2>
        {history.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Немає даних для графіка — збережіть хоча б одну сесію з вагами та
            повторами за обраний період.
          </p>
        ) : (
          <div className="h-80 w-full min-w-0 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={history}
                margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#cbd5e1"
                  className="dark:stroke-slate-600"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#475569" }}
                  className="dark:[&>text]:fill-slate-300"
                  stroke="#94a3b8"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#475569" }}
                  className="dark:[&>text]:fill-slate-300"
                  stroke="#94a3b8"
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    color: "#f8fafc",
                  }}
                  formatter={(value) => [`${value} кг×повт.`, "Обсяг"]}
                  labelFormatter={(label) => `Дата: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#60a5fa" }}
                  activeDot={{ r: 6 }}
                  name="Обсяг"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card p-6 md:p-8">
        <h2 className="font-semibold mb-6 text-slate-900 dark:text-slate-50 text-lg">
          Особисті рекорди
        </h2>
        {records.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map((r) => (
              <div
                key={r._id}
                className="border border-slate-200 dark:border-slate-600 rounded-lg p-5"
              >
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  {r.exerciseId?.name}
                </div>
                <div className="text-2xl mt-1 text-slate-900 dark:text-slate-50">
                  {r.weight} кг × {r.reps} повт.
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {format(new Date(r.date), "d MMMM yyyy", { locale: uk })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed">
            Поки немає рекордів — зберігайте сесії з вагами, система оновить ПР
            автоматично.
          </div>
        )}
      </div>
    </div>
  );
}
