import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Dumbbell } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Ви увійшли в акаунт");
      nav("/", { replace: true });
    } catch (e) {
      const d = e.response?.data;
      const msg =
        d?.message ||
        (Array.isArray(d?.errors) && d.errors[0]?.msg) ||
        (!e.response &&
          "Немає зв’язку з сервером. Перевірте VITE_API_URL і що бекенд запущено.") ||
        "Не вдалося увійти";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-slate-900 dark:text-slate-100">
      <div className="card w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <Dumbbell className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">
          Вхід до GymTracker
        </h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Електронна пошта"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary w-full">Увійти</button>
        </form>
        <p className="mt-4 text-center text-sm">
          Немає акаунта?{" "}
          <Link
            to="/register"
            className="text-blue-600 dark:text-blue-500 font-medium"
          >
            Зареєструватися
          </Link>
        </p>
      </div>
    </div>
  );
}
