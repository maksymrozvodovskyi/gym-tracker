import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import { ScreenLoader } from "./components/PageLoader";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Exercises from "./pages/Exercises";
import Templates from "./pages/Templates";
import Sessions from "./pages/Sessions";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";

const Protected = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  if (loading) return <ScreenLoader />;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" />;
  return children;
};

function App() {
  const [darkScheme, setDarkScheme] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setDarkScheme(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: darkScheme
              ? {
                  background: "#1e293b",
                  color: "#f1f5f9",
                  border: "1px solid #475569",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.35)",
                }
              : {
                  background: "#ffffff",
                  color: "#0f172a",
                  border: "1px solid #e2e8f0",
                },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <Protected>
                <Layout>
                  <Profile />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/exercises"
            element={
              <Protected>
                <Layout>
                  <Exercises />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/templates"
            element={
              <Protected>
                <Layout>
                  <Templates />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/sessions"
            element={
              <Protected>
                <Layout>
                  <Sessions />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/analytics"
            element={
              <Protected>
                <Layout>
                  <Analytics />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected adminOnly>
                <Layout>
                  <Admin />
                </Layout>
              </Protected>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
