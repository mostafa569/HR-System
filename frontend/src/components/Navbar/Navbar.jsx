import React from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  FormControl,
  Button,
  Container,
  Image,
} from "react-bootstrap";
import { FaSearch, FaSun, FaMoon } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function AppNavbar({ toggleSidebar, darkMode, toggleDarkMode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`shadow-sm ${darkMode ? "bg-dark" : "bg-light"}`}
    >
      <div className="container-fluid cont">
        <Navbar.Toggle aria-controls="sidebarMenu" onClick={toggleSidebar} />
        <Navbar.Brand>
        <div className={`${styles.brand} ${darkMode ? styles.dark : ""}`} style={{ marginLeft: '20px' }}>
   HR System
</div>

        </Navbar.Brand>
        <Nav className="ms-auto d-flex flex-row align-items-center">
          {/* <Form className="d-none d-md-flex input-group w-auto my-auto">
            <FormControl
              type="search"
              placeholder='Search (ctrl + "/" to focus)'
              className={`rounded ${darkMode ? 'bg-dark text-white' : ''}`}
              style={{ minWidth: '225px' }}
              autoComplete="off"
            />
            <Button variant={darkMode ? 'secondary' : 'primary'}>
              <FaSearch style={{ fontSize: '1.2rem' }} />
            </Button>
          </Form> */}
          {/* <Button
            variant={darkMode ? 'primary' : 'outline-primary'}
            className="mx-2"
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <FaSun style={{ fontSize: '1.2rem' }} /> : <FaMoon style={{ fontSize: '1.2rem' }} />}
          </Button>
          <NavDropdown
            title={
              <Image
                src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/img (31).webp"
                roundedCircle
                height="22"
                alt="Avatar"
              />
            }
            id="avatar-dropdown"
            align="end"
            className={darkMode ? 'text-white' : ''}
          >
            <NavDropdown.Item href="#">My profile</NavDropdown.Item>
            <NavDropdown.Item href="#">Settings</NavDropdown.Item>
            <NavDropdown.Item href="#">Logout</NavDropdown.Item>
          </NavDropdown> */}
         
        </Nav>
      </div>
    </Navbar>
  );
}
