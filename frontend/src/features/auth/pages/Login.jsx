import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/authService";
import { toast } from "react-toastify";
import loginImage from "../../../assets/teamwork.png";
import logoimg from "../../../assets/hrlogo.png";
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is not valid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const res = await loginUser(formData);
        if (res.message === "Logged in successfully") {
          toast.success("Logged in successfully");
          localStorage.setItem("userToken", res.token);
          localStorage.setItem("userData", JSON.stringify(res.user));
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
        }
      } catch (err) {
        console.log("Login Error:", err);
        toast.error(err.response?.data?.message || "Login failed");
        setMessage(err.response?.data?.message || "Login failed");
        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <section className={styles.loginSection}>
      <div className={styles.sectionLayer}>
        <div className={styles.imageContainer}>
          <img src={loginImage} alt="Login Visual" />
        </div>
        <form onSubmit={handleSubmit} className="text-center">
          <img className={styles.hrlogo} src={logoimg} alt="" />
          <h1>Login Now</h1>

          <div className={styles.inputGroup}>
            <i className="fas fa-envelope"></i>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          {errors.email && (
            <div className="alert alert-danger">{errors.email}</div>
          )}

          <div className={styles.inputGroup}>
            <i className="fas fa-lock"></i>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          {errors.password && (
            <div className="alert alert-danger">{errors.password}</div>
          )}

          <button type="submit" disabled={isLoading}>
            Login{" "}
            {isLoading && (
              <span>
                <i className="fas fa-spin fa-spinner"></i>
              </span>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
