import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import styles from "./AddEditUser.module.css";
import { BsArrowLeftCircle, BsPersonPlus } from "react-icons/bs";

const AddUser = () => {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // مسح رسالة الخطأ عند بدء الكتابة
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { full_name, username, email, password, role } = formData;

    let newErrors = {};

    // Full name validation
    if (!full_name) {
      newErrors.full_name = "Full name is required";
    } else if (!/^[^0-9]+$/.test(full_name)) {
      newErrors.full_name = "Name cannot contain numbers";
    }

    // Username validation
    if (!username) {
      newErrors.username = "Username is required";
    } else if (!/^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/.test(username)) {
      newErrors.username =
        "Username must contain at least one letter and can include numbers";
    }

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!/^\w{6,}$/.test(password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Role validation
    if (!role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      // Check username uniqueness
      const usernameExists = await checkUsernameUnique(username);
      if (usernameExists) {
        setErrors((prev) => ({
          ...prev,
          username: "Username is already taken",
        }));
        return;
      }

      // Check email uniqueness
      const emailExists = await checkEmailUnique(email);
      if (emailExists) {
        setErrors((prev) => ({ ...prev, email: "Email is already taken" }));
        return;
      }

      await axios.post("http://localhost:8000/api/hrs", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("User added successfully!");
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
        setErrors({
          general: err.response?.data?.message || "Error adding user",
        });
      }
    }
  };

  return (
    // <div className='container-fluid'>

    <div className={styles.cardBox}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className="mb-2">Add New User</h2>
          <p className="mb-0">Create a new user account</p>
        </div>
        {/* <div className="d-flex justify-content-end mb-3"> */}
        <div className="d-flex justify-content-between align-items-center ">
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
          {/* </div> */}
        </div>
      </div>
      <div className={styles.content}>
        <Card
          className="shadow-sm "
          style={{ background: "transparent", border: "none" }}
        >
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formFullName">
                <Form.Label className={styles.customLabel}>
                  Full Name:
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  isInvalid={!!errors.full_name}
                  // required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.full_name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formUserName">
                <Form.Label className={styles.customLabel}>
                  Username:
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  isInvalid={!!errors.username}
                  // required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label className={styles.customLabel}>
                  Email address:
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  // required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label className={styles.customLabel}>
                  Password:
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  // required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formRole">
                <Form.Label className={styles.customLabel}>Role:</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  isInvalid={!!errors.role}
                >
                  <option value="">Select role</option>
                  <option value="hr">HR</option>
                  <option value="super admin">Super Admin</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.role}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button
                  variant="primary"
                  type="submit"
                  className={styles.addbutton}
                >
                  <i className="bi bi-person-plus me-2"></i> Add User
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
    // {/* </div> */}
  );
};

export default AddUser;
