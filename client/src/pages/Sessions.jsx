import { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

function exIdStr(id) {
  if (!id) return "";
  return typeof id === "object" && id._id ? String(id._id) : String(id);
}

function findExercise(exercises, id) {
  const s = exIdStr(id);
  return exercises.find((e) => String(e._id) === s);
}

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [active, setActive] = useState(null);
  const [tplSelectKey, setTplSelectKey] = useState(0);

  const load = async () => {
    const [s, t, e] = await Promise.all([
      api.get("/sessions"),
      api.get("/templates"),
      api.get("/exercises"),
    ]);
    setSessions(s.data);
    setTemplates(t.data);
    setExercises(e.data);
  };

  useEffect(() => {
    load();
  }, []);

  const startFromTemplate = (tpl) => {
    if (!tpl) return;
    setActive({
      templateId: tpl._id,
      exercises: tpl.exercises.map((ex) => ({
        exerciseId: ex.exerciseId._id || ex.exerciseId,
        sets: Array(ex.sets || 3)
          .fill(0)
          .map(() => ({
            weight: ex.weight || 0,
            reps: ex.reps || 10,
          })),
      })),
    });
    setTplSelectKey((k) => k + 1);
    toast.success("Шаблон завантажено — внесіть фактичні ваги та повтори");
  };

  const startBlank = () => {
    if (!exercises.length) {
      toast.error("Немає вправ у каталозі — зайдіть на сторінку «Вправи» після запуску сервера");
      return;
    }
    setActive({
      exercises: [
        {
          exerciseId: exercises[0]._id,
          sets: [{ weight: 0, reps: 0 }],
        },
      ],
    });
    toast("Порожня сесія: додайте підходи та за потреби ще вправи нижче");
  };

  const addSet = (exIdx) => {
    const ne = [...active.exercises];
    ne[exIdx].sets.push({ weight: 0, reps: 0 });
    setActive({ ...active, exercises: ne });
  };

  const addExerciseToSession = (exId) => {
    if (!exId || !active) return;
    setActive({
      ...active,
      exercises: [
        ...active.exercises,
        { exerciseId: exId, sets: [{ weight: 0, reps: 0 }] },
      ],
    });
    toast.success("Вправу додано до поточної сесії");
  };

  const save = async () => {
    const duration = Math.floor(Math.random() * 60) + 30;
    await api.post("/sessions", { ...active, duration });
    setActive(null);
    load();
    toast.success("Сесію збережено");
  };

  return (
    <div>
      <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-3xl text-sm leading-relaxed">
        Тут ви фіксуєте підходи під час тренування: оберіть готовий шаблон
        (наприклад, схуднення чи маса), або почніть з нуля. Для кожної вправи
        вкажіть вагу в кілограмах і кількість повторів у кожному сеті.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 shrink-0">
          Тренувальні сесії
        </h1>
        <div className="flex flex-wrap gap-2 items-center">
          <button type="button" onClick={startBlank} className="btn btn-secondary">
            Почати з нуля
          </button>
          <select
            key={tplSelectKey}
            aria-label="Обрати шаблон тренування"
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              const tpl = templates.find((t) => String(t._id) === id);
              startFromTemplate(tpl);
            }}
            className="input w-auto min-w-[200px]"
          >
            <option value="">З шаблону…</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {active && (
        <div className="card p-6 mb-8 border-2 border-blue-200 dark:border-blue-900">
          <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-600">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Запис поточної сесії
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Нижче — кожна вправа з вашого плану. У рядку сету: спочатку вага
              (кг), потім повтори. Натисніть кнопку нижче, щоб додати ще один
              підхід для цієї вправи.
            </p>
          </div>

          {active.exercises.map((ex, i) => {
            const meta = findExercise(exercises, ex.exerciseId);
            return (
              <div
                key={`${exIdStr(ex.exerciseId)}-${i}`}
                className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-600 last:border-0 last:pb-0 last:mb-0"
              >
                <div className="flex flex-wrap items-baseline gap-2 mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {meta?.name || "Вправа"}
                  </h3>
                  {meta && (
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-600 bg-slate-100 dark:bg-slate-600 dark:text-slate-200 px-2 py-0.5 rounded">
                      {meta.muscleGroup} · {meta.equipment}
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-600">
                        <th className="py-2 pr-4 w-16">Сет</th>
                        <th className="py-2 pr-4">Вага (кг)</th>
                        <th className="py-2">Повтори</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((s, j) => (
                        <tr key={j} className="border-b border-slate-100 dark:border-slate-600">
                          <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-300">
                            {j + 1}
                          </td>
                          <td className="py-3 pr-4">
                            <label className="sr-only" htmlFor={`w-${i}-${j}`}>
                              Вага у кілограмах, сет {j + 1}
                            </label>
                            <input
                              id={`w-${i}-${j}`}
                              type="number"
                              inputMode="decimal"
                              className="input w-28 max-w-full"
                              value={s.weight}
                              onChange={(e) => {
                                const ne = [...active.exercises];
                                ne[i].sets[j].weight = +e.target.value;
                                setActive({ ...active, exercises: ne });
                              }}
                            />
                          </td>
                          <td className="py-3">
                            <label className="sr-only" htmlFor={`r-${i}-${j}`}>
                              Повтори, сет {j + 1}
                            </label>
                            <input
                              id={`r-${i}-${j}`}
                              type="number"
                              inputMode="numeric"
                              className="input w-28 max-w-full"
                              value={s.reps}
                              onChange={(e) => {
                                const ne = [...active.exercises];
                                ne[i].sets[j].reps = +e.target.value;
                                setActive({ ...active, exercises: ne });
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => addSet(i)}
                  className="mt-3 text-sm text-blue-600 dark:text-blue-500 font-semibold"
                >
                  + Додати сет для цієї вправи
                </button>
              </div>
            );
          })}

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="add-ex-session"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
              >
                Додати ще вправу до цієї сесії
              </label>
              <select
                id="add-ex-session"
                className="input max-w-md"
                defaultValue=""
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) addExerciseToSession(v);
                  e.target.value = "";
                }}
              >
                <option value="">Оберіть вправу з каталогу…</option>
                {exercises.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={save} className="btn btn-primary">
              Завершити й зберегти сесію
            </button>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="btn btn-secondary"
            >
              Скасувати запис
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-600 font-semibold text-slate-800 dark:text-slate-100">
          Історія сесій
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Тривалість</th>
              <th>Вправи</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s._id}>
                <td>{new Date(s.date).toLocaleDateString("uk-UA")}</td>
                <td>{s.duration} хв</td>
                <td>{s.exercises.length} вправ</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sessions.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Ще немає збережених сесій — почніть запис вище.
          </div>
        )}
      </div>
    </div>
  );
}
