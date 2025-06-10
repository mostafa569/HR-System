import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 , FiUserPlus} from "react-icons/fi";
import styles from "./adminHr.module.css";
const SuperAdminControl = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");
  const userData = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    if (userData) {
      setCurrentUserId(userData.id);
    }

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.id === currentUserId || user.role === "super admin") {
      toast.error("You are not allowed to delete this user");
      return;
    }
    setSelectedUser(user);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/hrs/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    } finally {
      setShowConfirm(false);
      setSelectedUser(null);
    }
  };

  const canEdit = (user) => {
    return user.id === currentUserId || user.role === "hr";
  };
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    // <div className="container mt-5">
    <div>
      <div className={styles.content}>
        <div className={styles.cardBox}>
          <div className={styles.cardHeader}>
            <h2 className="mb-4">All HRs & Super Admins</h2>
            <div className="mb-3">
              <Button
                className={styles.addButton}
                variant="primary"
                onClick={() => navigate("/add-user")}
              >
                <FiUserPlus className="me-2 mb-2" size={18} />
                Add Hr
              </Button>
            </div>
          </div>
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
          ) : users.length === 0 ? (
            <div
              className="text-center text-muted"
              style={{ padding: "50px 0" }}
            >
              <h4>No users found.</h4>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ width: "100px", textAlign: "center" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td style={{ textAlign: "center" }}>
                      <Button
                        onClick={() => navigate(`/edit-user/${user.id}`)}
                        disabled={!canEdit(user)}
                        title="Edit User"
                        className="action-btn bg-cyan-100 text-cyan-600 me-2 p-2 rounded-lg hover:bg-cyan-200 transition-colors"
                        style={{ minWidth: "36px", minHeight: "36px" }}
                      >
                        <FiEdit2 size={18} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(user)}
                        className="action-btn flex items-center justify-center p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          minWidth: "36px",
                          minHeight: "36px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          hover: "bg-red-600"
                        }}
                        disabled={user.role === "super admin"}
                        title="Delete User"
                        aria-label="Delete User"
                      >
                        <FiTrash2 size={18} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{selectedUser?.username}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SuperAdminControl;
