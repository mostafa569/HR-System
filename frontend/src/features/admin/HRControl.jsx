import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./adminHr.module.css";

const HRControl = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const token = localStorage.getItem("userToken");


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/hrs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
      console.log(err);
    }
    finally {
      setLoading(false);
    }
  };
    const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className={styles.content}>
      <Sidebar />
      <Navbar />
      <div className={`container mt-5 ${styles.cardBox}`}>
        <div className={styles.cardHeader}>
          <h2>All HRs & Super Admins</h2>
        </div>
        <div className="p-4">
           <div className="d-flex justify-content-evenly mb-3">
            <input
              type="text"
              className="form-control me-3"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: "300px" }}
            />

            <div className="d-flex align-items-center">
              <i className="bi bi-funnel me-2"></i>
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ maxWidth: "200px" }}
              >
                <option value="All">All Roles</option>
                <option value="hr">HR</option>
                <option value="super admin">Super Admin</option>
              </select>
            </div>
          </div>
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "300px" }}
            >
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div
              className="text-center text-muted"
              style={{ padding: "50px 0" }}
            >
              <h4>No users found.</h4>
            </div>
          ) : (
            <Table hover responsive className="table-hover-effect">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRControl;
