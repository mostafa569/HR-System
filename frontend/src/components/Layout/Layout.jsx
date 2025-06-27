import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import FloatingChatbot from "../FloatingChatbot/FloatingChatbot";
import { Outlet, useLocation } from "react-router-dom";
import "./Layout.module.css";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const toggleDarkMode = () => {
    setDarkMode((mode) => {
      const newMode = !mode;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  if (isLoginPage) {
    return (
      <main className={darkMode ? "dark-mode" : "light-mode"}>
        <Outlet context={{ darkMode }} />
      </main>
    );
  }

  return (
    <div className={`layout ${darkMode ? "dark-mode" : "light-mode"}`}>
      <Navbar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <Sidebar sidebarOpen={sidebarOpen} darkMode={darkMode} />
      <main
        className={`main ${sidebarOpen ? "" : "main-expanded"}`}
        style={{ marginTop: "58px" }}
      >
        <Outlet context={{ darkMode }} />
      </main>
      <FloatingChatbot />
    </div>
  );
}
