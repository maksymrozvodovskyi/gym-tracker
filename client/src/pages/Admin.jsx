import { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

function roleUa(role) {
  if (role === "admin") return "Адміністратор";
  return "Користувач";
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalExercises: 0,
  });

  const load = async () => {
    const [u, s] = await Promise.all([
      api.get("/admin/users"),
      api.get("/admin/stats"),
    ]);
    setUsers(u.data);
    setStats(s.data);
  };

  useEffect(() => {
    load();
  }, []);

  const delUser = async (id) => {
    if (!confirm("Видалити цього користувача?")) return;
    await api.delete(`/admin/users/${id}`);
    load();
    toast.success("Користувача видалено");
  };

  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 max-w-2xl">
        Керування акаунтами та зведена статистика використання сервісу.
      </p>
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-50">
        Панель адміністратора
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-6 text-center">
          <div className="text-4xl font-bold">{stats.totalUsers}</div>
          <div className="text-sm mt-1">Користувачів</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-4xl font-bold">{stats.totalSessions}</div>
          <div className="text-sm mt-1">Сесій</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-4xl font-bold">{stats.totalExercises}</div>
          <div className="text-sm mt-1">Вправ у каталозі</div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b font-semibold text-slate-800">
          Усі користувачі
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Ім’я</th>
              <th>Пошта</th>
              <th>Роль</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200">
                    {roleUa(u.role)}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => delUser(u._id)}
                    className="text-red-500 text-sm"
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
