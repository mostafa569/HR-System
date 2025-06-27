import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container } from "react-bootstrap";
import { toast } from "react-toastify";
import { Card } from "react-bootstrap";
import { BsArrowLeftCircle } from "react-icons/bs";
import styles from "./AddEditUser.module.css";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");
  const currentUser = JSON.parse(localStorage.getItem("userData"));

  const [user, setUser] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    role: "",
  });
  const [originalUser, setOriginalUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [superAdminsCount, setSuperAdminsCount] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/hrs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOriginalUser(res.data);
        setUser(res.data);
        const countRes = await axios.get("http://localhost:8000/api/hrs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const superAdmins = countRes.data.filter((u) => u.role === "super admin");
      setSuperAdminsCount(superAdmins.length);
      } catch (err) {
        setErrors({ general: "Error fetching user data" });
      }
    };

    fetchUser();
  }, [id]);

  const checkUsernameUnique = async (username) => {
    try {
      const res = await axios.get("http://localhost:8000/api/hrs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const exists = res.data.some((user) => user.username === username);
      return exists;
    } catch (err) {
      console.error("Error checking username:", err);
      return true;
    }
  };

  const checkEmailUnique = async (email) => {
    try {
      const res = await axios.get("http://localhost:8000/api/hrs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const exists = res.data.some((user) => user.email === email);
      return exists;
    } catch (err) {
      console.error("Error checking email:", err);
      return true;
    }
  };

  const validateForm = () => {
    let newErrors = {};

    // Full name validation
    if (!user.full_name) {
      newErrors.full_name = "Full name is required";
    } else if (!/^[^0-9]+$/.test(user.full_name)) {
      newErrors.full_name = "Name cannot contain numbers";
    }

    // Username validation
    if (!user.username) {
      newErrors.username = "Username is required";
    } else if (!/^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/.test(user.username)) {
      newErrors.username =
        "Username must contain at least one letter and can include numbers";
    }

    // Email validation
    if (!user.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation (only if changed)
    if (user.password && !/^\w{6,}$/.test(user.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Role validation
    if (!user.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Check username uniqueness
      const usernameExists = await checkUsernameUnique(user.username);
      if (usernameExists && user.username !== originalUser.username) {
        setErrors((prev) => ({
          ...prev,
          username: "Username is already taken",
        }));
        return;
      }

      // Check email uniqueness
      const emailExists = await checkEmailUnique(user.email);
      if (emailExists && user.email !== originalUser.email) {
        setErrors((prev) => ({ ...prev, email: "Email is already taken" }));
        return;
      }

      await axios.put(`http://localhost:8000/api/hrs/${id}`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("User updated successfully!");
      if (id == currentUser.id && user.role === "hr") {
      localStorage.clear();
      navigate("/login");
      return;
    }
      navigate("/super-admin-control");
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};
      if (Object.keys(serverErrors).length > 0) {
        const transformedErrors = {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          const errorMessage = Array.isArray(messages) ? messages[0] : messages;
          const formField =
            field === "hr_users.username"
              ? "username"
              : field === "hr_users.email"
              ? "email"
              : field;
          transformedErrors[formField] = errorMessage;
        });
        setErrors(transformedErrors);
      } else {
        // setErrors({
        //   general: err.response?.data?.message || "Error updating user",
        // });
        setErrors({
          general: err.response?.data?.error || err.response?.data?.message || "Error updating user",
        });

      }
    }
  };

  return (
    <div className={styles.cardBox}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className="mb-2">Edit A User</h2>
          <p className="mb-0">Edit an existing account</p>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div className="mb-3">
            <Button
              className={styles.backbutton}
              variant="primary"
              style={{
                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                border: "none",
              }}
              onClick={() => navigate("/super-admin-control")}
            >
              <BsArrowLeftCircle className="me-1" /> Back
            </Button>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <Card
          className="shadow-sm"
          style={{ background: "transparent", border: "none" }}
        >
          <Card.Body>
            {errors.general && (
              <div className="alert alert-danger mb-3" role="alert">
                {errors.general}
              </div>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className={styles.customLabel}>
                  Full Name:
                </Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={user.full_name || ""}
                  onChange={handleChange}
                  isInvalid={!!errors.full_name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.full_name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className={styles.customLabel}>
                  Username:
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={user.username || ""}
                  onChange={handleChange}
                  isInvalid={!!errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className={styles.customLabel}>Email:</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={user.email || ""}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className={styles.customLabel}>
                  Password:
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={user.password || ""}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  placeholder="Leave blank to keep current password"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className={styles.customLabel}>Role:</Form.Label>
                <Form.Select
                  name="role"
                  value={user.role || ""}
                  onChange={handleChange}
                  // disabled={user.role === "super admin"}

                  // disabled={
                  //   user.role === "super admin" &&
                  //   superAdminsCount === 1 &&
                  //   user.id === currentUser.id
                  // }
                  isInvalid={!!errors.role}
                >
                  <option value="hr">HR</option>
                  <option value="super admin">Super Admin</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.role}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                className={styles.addbutton}
                variant="success"
                type="submit"
              >
                Save Changes
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default EditUser;
