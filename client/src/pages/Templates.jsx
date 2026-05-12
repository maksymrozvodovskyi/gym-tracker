import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";
import { PageLoader, InlineSpinner } from "../components/PageLoader";

const PRESET_INFO = [
  {
    title: "Схуднення · кардіо та легка сила",
    body: "Кардіо, планка, віджимання та випади — більше повторень, легші ваги, акцент на витривалість.",
  },
  {
    title: "Набір маси · база",
    body: "Присідання, жим, тяга, підтягування — менше повторів, більші робочі ваги (підлаштуйте під себе).",
  },
  {
    title: "Загальна форма · тонус",
    body: "Змішаний обсяг для підтримки форми без жорсткого спеціалізованого циклу.",
  },
];

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState({ name: "", exercises: [] });
  const [bootLoading, setBootLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const addedListRef = useRef(null);

  const load = async () => {
    try {
      const [t, e] = await Promise.all([
        api.get("/templates"),
        api.get("/exercises"),
      ]);
      setTemplates(t.data);
      setExercises(e.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const bootstrap = async () => {
    setBootLoading(true);
    try {
      const res = await api.post("/templates/bootstrap");
      setTemplates(Array.isArray(res.data) ? res.data : []);
      toast.success(
        res.status === 201
          ? "Базові шаблони додано до вашого акаунту"
          : "У вас вже є шаблони — оновлено список",
      );
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Не вдалося додати базові шаблони",
      );
    } finally {
      setBootLoading(false);
    }
  };

  const addExercise = (exId) => {
    setForm((f) => ({
      ...f,
      exercises: [
        ...f.exercises,
        { exerciseId: exId, sets: 3, reps: 10, weight: 0 },
      ],
    }));
    toast.success("Вправу додано до шаблону");
    requestAnimationFrame(() => {
      addedListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  const save = async () => {
    await api.post("/templates", form);
    setForm({ name: "", exercises: [] });
    load();
    toast.success("Шаблон збережено");
  };

  const del = async (id) => {
    await api.delete(`/templates/${id}`);
    load();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-10">
      <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm leading-relaxed mb-2">
        Шаблон — це збережений план: набір вправ із цільовою кількістю сетів і
        повторів. Потім ви зможете стартувати сесію з шаблону на сторінці
        «Сесії».
      </p>

      {templates.length === 0 && exercises.length > 0 && (
        <div className="card p-8 mb-10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-blue-200 dark:border-slate-600">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-3">
            Швидкий старт
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Додайте три готові плани: схуднення, набір маси та загальна форма.
            Ви зможете їх редагувати або видаляти пізніше.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {PRESET_INFO.map((p) => (
              <div
                key={p.title}
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-900/80 p-4 text-left"
              >
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {p.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-snug">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={bootLoading}
            onClick={bootstrap}
            className="btn btn-primary inline-flex items-center justify-center gap-2"
          >
            {bootLoading ? <InlineSpinner size={20} /> : null}
            {bootLoading ? "Завантаження…" : "Додати базові шаблони"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 lg:items-start">
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-50">
            Створити власний шаблон
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mb-6 leading-relaxed">
            Назва, потім натисніть вправу в списку нижче (або перейдіть до
            повного каталогу). Далі налаштуйте сети, повтори та вагу.
          </p>
          <input
            placeholder="Назва шаблону"
            className="input mb-6"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Додати вправу з каталогу
            </span>
            <Link
              to="/exercises#katalog-vprav"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
            >
              Відкрити каталог вправ →
            </Link>
          </div>

          <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 space-y-1 mb-6 shadow-sm exercise-list-scroll">
            {exercises.length === 0 ? (
              <p className="text-sm text-slate-500 p-3">
                Каталог порожній — спочатку додайте вправи на сторінці «Вправи».
              </p>
            ) : (
              exercises.map((ex) => (
                <button
                  key={ex._id}
                  type="button"
                  onClick={() => addExercise(ex._id)}
                  className="w-full text-left rounded-lg px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer"
                >
                  {ex.name}
                  <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                    {ex.muscleGroup} · {ex.equipment}
                  </span>
                </button>
              ))
            )}
          </div>

          <div ref={addedListRef} className="space-y-4 mb-8">
            {form.exercises.map((ex, i) => (
              <div
                key={`${ex.exerciseId}-${i}`}
                className="flex flex-wrap gap-3 items-center text-sm py-3 border-b border-slate-100 last:border-0"
              >
                <div className="flex-1 min-w-[140px] font-medium text-slate-800 dark:text-slate-100">
                  {exercises.find((e) => String(e._id) === String(ex.exerciseId))
                    ?.name}
                </div>
                <label className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">Сети</span>
                  <input
                    type="number"
                    className="w-16 input"
                    value={ex.sets}
                    onChange={(e) => {
                      const ne = [...form.exercises];
                      ne[i].sets = +e.target.value;
                      setForm({ ...form, exercises: ne });
                    }}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">Повт.</span>
                  <input
                    type="number"
                    className="w-16 input"
                    value={ex.reps}
                    onChange={(e) => {
                      const ne = [...form.exercises];
                      ne[i].reps = +e.target.value;
                      setForm({ ...form, exercises: ne });
                    }}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">кг</span>
                  <input
                    type="number"
                    className="w-20 input"
                    value={ex.weight}
                    onChange={(e) => {
                      const ne = [...form.exercises];
                      ne[i].weight = +e.target.value;
                      setForm({ ...form, exercises: ne });
                    }}
                  />
                </label>
              </div>
            ))}
          </div>

          <button
            onClick={save}
            className="btn btn-primary w-full"
            disabled={!form.name}
          >
            Зберегти шаблон
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Мої шаблони
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
            Обраний шаблон можна запустити на сторінці «Сесії».
          </p>
          {templates.length === 0 && (
            <div className="card p-8 text-center text-slate-500 dark:text-slate-300">
              {exercises.length === 0
                ? "Спочатку мають з’явитися вправи в каталозі."
                : "Поки немає шаблонів — скористайтеся «Швидким стартом» або створіть власний."}
            </div>
          )}
          <div className="space-y-4">
            {templates.map((t) => (
              <div
                key={t._id}
                className="card p-5 md:p-6 flex justify-between items-center gap-4"
              >
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t.exercises.length}{" "}
                    {t.exercises.length === 1 ? "вправа" : "вправ"}
                  </div>
                </div>
                <button
                  onClick={() => del(t._id)}
                  className="btn btn-danger shrink-0"
                >
                  Видалити
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
