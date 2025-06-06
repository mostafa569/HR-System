import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleSidebar = () => setSidebarOpen(open => !open);
  const toggleDarkMode = () => {
    setDarkMode(mode => {
      const newMode = !mode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main style={{ marginTop: '58px' }} className={darkMode ? 'dark-mode' : 'light-mode'}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-auto p-0">
              <Sidebar sidebarOpen={sidebarOpen} darkMode={darkMode} />
            </div>
            <div className="col">
              <Outlet context={{ darkMode }} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}