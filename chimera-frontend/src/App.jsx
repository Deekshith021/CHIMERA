import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Project";
import AppLayout from "./layouts/AppLayout";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [activeProject, setActiveProject] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // login | register

  function logout() {
    localStorage.removeItem("token");
    setActiveProject(null);
    setLoggedIn(false);
    setAuthMode("login");
  }

  // 🔐 AUTH FLOW
  if (!loggedIn) {
    return authMode === "login" ? (
      <Login
        onLogin={() => setLoggedIn(true)}
        goToRegister={() => setAuthMode("register")}
      />
    ) : (
      <Register
        goToLogin={() => setAuthMode("login")}
      />
    );
  }

  // 🚀 APP FLOW
  return (
    <AppLayout onLogout={logout}>
      {activeProject ? (
        <Project
          projectId={activeProject}
          goBack={() => setActiveProject(null)}
        />
      ) : (
        <Dashboard openProject={setActiveProject} />
      )}
    </AppLayout>
  );
}
