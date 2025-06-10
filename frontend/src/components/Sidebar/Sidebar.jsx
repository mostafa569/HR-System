import React, { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import { Nav } from "react-bootstrap";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import {
  FaHome,
  FaUserShield,
  FaUsers,
  FaBuilding,
  FaUserClock,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar({ sidebarOpen, darkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const shouldShowSidebar = isLargeScreen || sidebarOpen;

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const isActive = (path) => {
    if (path === "/employers") {
      return location.pathname === "/employers";
    }
    if (path === "/employers/salary-summaries") {
      return location.pathname === "/employers/salary-summaries";
    }
    return location.pathname === path;
  };

  return (
    <div className="sidebar-wrapper">
      <div
        className={`${styles.sidebar} ${shouldShowSidebar ? styles.show : ""}`}
      >
        <Nav defaultActiveKey="/" className="flex-column mt-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link ${styles.navLink} ${isActive ? styles.active : ""}`
            }
            end
          >
            <FaHome className="me-3" style={{ fontSize: "1.5rem" }} /> Home
          </NavLink>
          {/* <NavLink
            to="/admin"
            className={({ isActive }) =>
              `nav-link ${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FaUserShield className="me-3" style={{ fontSize: "1.5rem" }} />{" "}
            Admin
          </NavLink> */}
          <NavLink
            to={
              JSON.parse(localStorage.getItem("userData"))?.role ===
              "super admin"
                ? "/super-admin-control"
                : JSON.parse(localStorage.getItem("userData"))?.role === "hr"
                ? "/hr-control"
                : "/unauthorized"
            }
            className={({ isActive }) =>
              `nav-link ${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FaUserShield className="me-3" style={{ fontSize: "1.5rem" }} />{" "}
            Admin
          </NavLink>

          <NavLink
            to="/employers"
            className={({ isActive }) =>
              `nav-link ${styles.navLink} ${isActive ? styles.active : ""}`
            }
            end
          >
            <FaUsers className="me-3" style={{ fontSize: "1.5rem" }} />{" "}
            Employees
          </NavLink>
          <NavLink
            to="/departments"
            className={({ isActive }) =>
              `nav-link ${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FaBuilding className="me-3" style={{ fontSize: "1.5rem" }} />{" "}
            Departments
          </NavLink>
          <NavLink
            to="/attendance"
            className={({ isActive }) =>
              `nav-link ${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FaUserClock className="me-3" style={{ fontSize: "1.5rem" }} />{" "}
            Attendance
          </NavLink>
          <NavLink
            to="/holidays"
            className={({ isActive }) =>
              `nav-link ${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FaCalendarCheck className="me-3" style={{ fontSize: "1.5rem" }} />{" "}
            Holidays
          </NavLink>
          <NavLink
            to="/employers/salary-summaries"
            className={({ isActive }) =>
              `nav-link ${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FaMoneyCheckAlt className="me-3" style={{ fontSize: "1.5rem" }} />{" "}
            Summary Salary
          </NavLink>
          <NavLink
            to="/employers/adjustments"
            className={({ isActive }) =>
              `nav-link ${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FaCog className="me-3" style={{ fontSize: "1.5rem" }} />{" "}
            Adjustments
          </NavLink>
          <button
            onClick={handleLogout}
            className={`nav-link border-0 bg-transparent w-100 text-start ${styles.navLink}`}
          >
            <FaSignOutAlt className="me-3" style={{ fontSize: "1.5rem" }} />{" "}
            Logout
          </button>
        </Nav>
      </div>
    </div>
  );
}
