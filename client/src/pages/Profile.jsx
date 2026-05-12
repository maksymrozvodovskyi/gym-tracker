import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    weight: user?.weight || "",
    height: user?.height || "",
    goals: user?.goals || "",
  });

  const save = async () => {
    try {
      const { data } = await api.put("/users/me", form);
      setUser(data);
      toast.success("Профіль оновлено");
    } catch {
      toast.error("Не вдалося зберегти зміни");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Особисті дані та цілі використовуються лише в межах вашого акаунта.
      </p>
      <div className="card p-8">
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-50">Мій профіль</h1>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">
              Ім’я
            </label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-300">
                Вага (кг)
              </label>
              <input
                type="number"
                className="input"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-300">
                Зріст (см)
              </label>
              <input
                type="number"
                className="input"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">
              Фітнес-цілі
            </label>
            <textarea
              className="input h-24"
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
            />
          </div>
          <button onClick={save} className="btn btn-primary">
            Зберегти зміни
          </button>
        </div>
      </div>
    </div>
  );
}
