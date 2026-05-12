import { useEffect, useState, useCallback } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    muscleGroup: "",
    equipment: "",
  });
  const { user } = useAuth();

  const load = useCallback(async () => {
    const { data } = await api.get("/exercises", { params: { search } });
    setExercises(data);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    try {
      await api.post("/exercises", form);
      setForm({ name: "", muscleGroup: "", equipment: "" });
      load();
      toast.success("Вправу додано");
    } catch {
      toast.error("Не вдалося зберегти");
    }
  };

  const del = async (id) => {
    if (!confirm("Видалити цю вправу?")) return;
    await api.delete(`/exercises/${id}`);
    load();
  };

  return (
    <div id="katalog-vprav">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-50">
        Каталог вправ
      </h1>
      <input
        placeholder="Пошук за назвою…"
        className="input mb-6 max-w-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {user?.role === "admin" && (
        <div className="card p-6 md:p-8 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <input
            placeholder="Назва"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="М’язова група"
            className="input"
            value={form.muscleGroup}
            onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
          />
          <input
            placeholder="Обладнання"
            className="input"
            value={form.equipment}
            onChange={(e) => setForm({ ...form, equipment: e.target.value })}
          />
          <button onClick={create} className="btn btn-primary">
            Додати вправу
          </button>
        </div>
      )}
      <div className="card overflow-x-auto p-4 md:p-6">
        <table className="table">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Група м’язів</th>
              <th>Обладнання</th>
              {user?.role === "admin" && <th></th>}
            </tr>
          </thead>
          <tbody>
            {exercises.map((e) => (
              <tr key={e._id}>
                <td>{e.name}</td>
                <td>{e.muscleGroup}</td>
                <td>{e.equipment}</td>
                {user?.role === "admin" && (
                  <td>
                    <button onClick={() => del(e._id)} className="text-red-500">
                      Видалити
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {exercises.length === 0 && (
          <div className="p-8 text-center text-slate-500 max-w-md mx-auto">
            <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Каталог порожній
            </p>
            <p className="text-sm">
              Переконайтеся, що сервер запущено з підключеною MongoDB — тоді
              базові вправи створюються автоматично. Якщо ви адміністратор,
              можете додати вправи вручну у формі вище.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
