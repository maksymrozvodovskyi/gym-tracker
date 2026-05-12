import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Dumbbell } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      toast.success("Акаунт створено");
      nav("/", { replace: true });
    } catch (e) {
      const d = e.response?.data;
      const msg =
        d?.message ||
        (Array.isArray(d?.errors) && d.errors[0]?.msg) ||
        (!e.response &&
          "Немає зв’язку з сервером. Перевірте VITE_API_URL і що бекенд запущено.") ||
        "Не вдалося зареєструватися";
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
          Створення акаунта
        </h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            placeholder="Повне ім’я"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            placeholder="Пароль (мінімум 6 символів)"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary w-full">Зареєструватися</button>
        </form>
        <p className="mt-4 text-center text-sm">
          Вже є акаунт?{" "}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-500 font-medium"
          >
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
