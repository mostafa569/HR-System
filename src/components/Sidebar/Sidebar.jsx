import React from 'react';
import styles from './Sidebar.module.css';
import { Nav, Collapse } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUserShield, FaUsers, FaBuilding, FaUserClock, FaCalendarCheck, FaMoneyCheckAlt, FaCog, FaSignOutAlt } from 'react-icons/fa';

export default function Sidebar({ sidebarOpen, darkMode }) {
  return (
    <div className="sidebar-wrapper">
      <Collapse in={sidebarOpen} dimension="width">
        <div className={`${styles.sidebar} collapse vh-100 position-fixed ${darkMode ? 'bg-dark' : 'bg-white'}`}>
          <Nav defaultActiveKey="/" className="flex-column mt-4">
            <NavLink to="/" className="nav-link" activeClassName="active">
              <FaHome className="me-3" style={{ fontSize: '1.5rem' }} /> Home
            </NavLink>
            <NavLink to="/admin" className="nav-link" activeClassName="active">
              <FaUserShield className="me-3" style={{ fontSize: '1.5rem' }} /> Admin
            </NavLink>
            <NavLink to="/employers" className="nav-link" activeClassName="active">
              <FaUsers className="me-3" style={{ fontSize: '1.5rem' }} /> Employees
            </NavLink>
            <NavLink to="/departments" className="nav-link" activeClassName="active">
              <FaBuilding className="me-3" style={{ fontSize: '1.5rem' }} /> Departments
            </NavLink>
            <NavLink to="/attendance" className="nav-link" activeClassName="active">
              <FaUserClock className="me-3" style={{ fontSize: '1.5rem' }} /> Attendance
            </NavLink>
            <NavLink to="/holidays" className="nav-link" activeClassName="active">
              <FaCalendarCheck className="me-3" style={{ fontSize: '1.5rem' }} /> Holidays
            </NavLink>
            <NavLink to="/summary-salary" className="nav-link" activeClassName="active">
              <FaMoneyCheckAlt className="me-3" style={{ fontSize: '1.5rem' }} /> Summary Salary
            </NavLink>
            <NavLink to="/adjustments" className="nav-link" activeClassName="active">
              <FaCog className="me-3" style={{ fontSize: '1.5rem' }} /> Adjustments
            </NavLink>
            <NavLink to="/login" className="nav-link" activeClassName="active">
              <FaSignOutAlt className="me-3" style={{ fontSize: '1.5rem' }} /> Login
            </NavLink>
          </Nav>
        </div>
      </Collapse>
    </div>
  );
}