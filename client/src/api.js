import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (!original) return Promise.reject(err);

    const path = original.url || "";
    const skipRefresh =
      path.includes("/auth/login") || path.includes("/auth/register");

    if (err.response?.status === 401 && !original._retry && !skipRefresh) {
      original._retry = true;
      const refresh = localStorage.getItem("refreshToken");
      if (refresh) {
        try {
          const { data } = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken: refresh,
          });
          localStorage.setItem("accessToken", data.access);
          if (data.refresh)
            localStorage.setItem("refreshToken", data.refresh);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          return Promise.reject(err);
        }
      }
    }
    return Promise.reject(err);
  },
);

export default api;
