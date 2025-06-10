import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getEmployer,
  updateEmployer,
  getDepartments,
} from "../services/employerService";
import {
  FaUser,
  FaVenusMars,
  FaGlobe,
  FaCalendarAlt,
  FaIdCard,
  FaHome,
  FaPhone,
  FaBuilding,
  FaFileSignature,
  FaMoneyBillWave,
  FaClock,
  FaTimes,
  FaSave,
  FaUserTie,
  FaInfoCircle,
  FaAddressCard,
  FaBusinessTime,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const EditEmployer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "",
    nationality: "",
    dob: "",
    national_id: "",
    address: "",
    phone: "",
    department_id: "",
    contract_date: "",
    salary: "",
    attendance_time: "",
    leave_time: "",
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employerResponse, departmentsResponse] = await Promise.all([
          getEmployer(id),
          getDepartments(),
        ]);

        if (!employerResponse) {
          throw new Error("Invalid employer data received");
        }

       

        const formatTimeForInput = (time) => {
          if (!time) return "";
          if (time.match(/^\d{2}:\d{2}$/)) {
            return time;
          }
          try {
            const [hours, minutes] = time.split(":");
            return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
          } catch (e) {
            return "";
          }
        };

        setFormData({
          full_name: employerResponse.full_name || "",
          gender: employerResponse.gender || "",
          nationality: employerResponse.nationality || "",
          dob: employerResponse.dob || "",
          national_id: employerResponse.national_id || "",
          address: employerResponse.address || "",
          phone: employerResponse.phone || "",
          department_id: employerResponse.department?.id?.toString() || "",
          contract_date: employerResponse.contract_date || "",
          salary: employerResponse.salary || "",
          attendance_time:
            formatTimeForInput(employerResponse.attendance_time) || "",
          leave_time: formatTimeForInput(employerResponse.leave_time) || "",
        });

        if (departmentsResponse) {
          // console.log("Setting departments:", departmentsResponse);
          setDepartments(Array.isArray(departmentsResponse.data) ? departmentsResponse.data : []);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load employer data");
        setLoading(false);
        navigate("/employers");
      }
    };

    if (id) {
      fetchData();
    } else {
      toast.error("Invalid employer ID");
      navigate("/employers");
    }
  }, [id, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = "Full name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.nationality)
      newErrors.nationality = "Nationality is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.national_id)
      newErrors.national_id = "National ID is required";
    else if (!/^(2|3)\d{13}$/.test(formData.national_id))
      newErrors.national_id = "Invalid National ID";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.department_id)
      newErrors.department_id = "Department is required";
    if (!formData.contract_date)
      newErrors.contract_date = "Contract date is required";
    if (!formData.salary) newErrors.salary = "Salary is required";
    if (!formData.attendance_time)
      newErrors.attendance_time = "Attendance time is required";
    if (!formData.leave_time) newErrors.leave_time = "Leave time is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
   

    
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

     
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const submitData = {
          ...formData,
          attendance_time: formData.attendance_time
            ? formData.attendance_time
            : null,
          leave_time: formData.leave_time ? formData.leave_time : null,
        };

        await updateEmployer(id, submitData);
        toast.success("Employer updated successfully");
        navigate("/employers");
      } catch (error) {
        console.error("Update error:", error);
        toast.error(
          error.response?.data?.message || "Failed to update employer"
        );
        setIsLoading(false);
      }
    } else {
      if (
        validationErrors.full_name ||
        validationErrors.gender ||
        validationErrors.nationality ||
        validationErrors.dob
      ) {
        setActiveTab("personal");
      } else if (
        validationErrors.national_id ||
        validationErrors.address ||
        validationErrors.phone
      ) {
        setActiveTab("identification");
      } else if (
        validationErrors.department_id ||
        validationErrors.contract_date ||
        validationErrors.salary
      ) {
        setActiveTab("employment");
      } else if (
        validationErrors.attendance_time ||
        validationErrors.leave_time
      ) {
        setActiveTab("schedule");
      }
    }
  };

  const renderProgress = () => {
    const fields = Object.values(formData);
    const filledFields = fields.filter((value) => value !== "").length;
    const totalFields = fields.length;
    const progress = (filledFields / totalFields) * 100;
    return progress.toFixed(0);
  };

  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex justify-content-center align-items-center"
        style={{ background: "linear-gradient(135deg, #2a9d8f, #e9c46a)" }}
      >
        <div
          className="spinner-border text-light"
          style={{ width: "3rem", height: "3rem" }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 py-5"
      style={{ background: "linear-gradient(135deg, #2a9d8f, #e9c46a)" }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes ripple {
            0% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(108, 92, 231, 0); }
            100% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .card-animated {
            animation: fadeIn 0.6s ease-out;
            border-radius: 12px;
            background: rgba(245, 245, 220, 0.95);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
          }
          .nav-link {
            background: rgba(255, 255, 255, 0.2);
            color: #264653 !important;
            font-weight: 500;
            transition: all 0.3s ease;
            border-radius: 8px 8px 0 0;
          }
          .nav-link.active {
            background: #6c5ce7 !important;
            color: #fff !important;
          }
          .nav-link:hover {
            background: rgba(108, 92, 231, 0.3);
            color: #fff !important;
          }
          .input-group-text {
            background: #2a9d8f !important;
            color: #fff !important;
            transition: all 0.3s ease;
          }
          .input-group-text:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(42, 157, 143, 0.3);
          }
          .form-control, .form-select {
            border: 1px solid #e9c46a;
            background: rgba(255, 255, 255, 0.8);
            transition: all 0.3s ease;
          }
          .form-control:focus, .form-select:focus {
            border-color: #6c5ce7;
            box-shadow: 0 0 8px rgba(108, 92, 231, 0.4);
          }
          .btn-ripple {
            background: linear-gradient(to right, #2a9d8f, #6c5ce7);
            border: none;
            color: #fff;
            font-weight: 600;
            position: relative;
            overflow: hidden;
          }
          .btn-ripple:hover {
            animation: ripple 1s infinite;
          }
          .btn-cancel {
            background: transparent;
            border: 2px solid #e63946;
            color: #e63946;
            font-weight: 600;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            padding: 0.375rem 0.75rem;
            width: auto;
            min-width: 90px;
            white-space: nowrap;
          }
          .btn-cancel:hover {
            background: #e63946;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(230, 57, 70, 0.3);
          }
          .btn-cancel:active {
            transform: translateY(0);
          }
          .btn-cancel .cancel-icon {
            transition: all 0.3s ease;
            margin-right: 0.25rem;
          }
          .btn-cancel:hover .cancel-icon {
            transform: rotate(90deg);
          }
          .progress-bar {
            background: linear-gradient(to right, #2a9d8f, #6c5ce7);
          }
          .tab-pane {
            animation: fadeIn 0.4s ease-out;
          }
          .section-icon {
            transition: transform 0.4s ease;
          }
          .section-icon:hover {
            transform: scale(1.2);
          }
          .invalid-feedback {
            color: #d63031;
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
          }
          .header-text {
            flex: 1;
          }
          .progress-container {
            margin-bottom: 25px;
          }
        `}
      </style>
      <div className="container">
        <div className="card card-animated p-4">
          {/* Header */}
          <div
            className="header-container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.25rem 1.5rem",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(42, 157, 143, 0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative elements */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "4px",
                height: "100%",
                background: "linear-gradient(to bottom, #2a9d8f, #e9c46a)",
              }}
            ></div>

            <div
              style={{
                position: "absolute",
                bottom: "-50px",
                right: "-50px",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "rgba(233, 196, 106, 0.1)",
                zIndex: 0,
              }}
            ></div>

            {/* Content */}
            <div className="d-flex align-items-center" style={{ zIndex: 1 }}>
              <div
                style={{
                  marginRight: "1.5rem",
                  padding: "0.75rem",
                  background: "rgba(42, 157, 143, 0.1)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaUserTie
                  style={{
                    color: "#2a9d8f",
                    fontSize: "1.75rem",
                  }}
                />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#264653",
                    fontWeight: "600",
                    fontSize: "1.5rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Edit Employee
                </h2>
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    color: "#6c757d",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <FaInfoCircle
                    style={{
                      marginRight: "0.5rem",
                      color: "#6c757d",
                      fontSize: "0.9rem",
                    }}
                  />
                  Update employee information
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/employers")}
              style={{
                background: "transparent",
                border: "2px solid #e63946",
                color: "#e63946",
                fontWeight: "600",
                padding: "0.375rem 0.75rem",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                transition: "all 0.3s ease",
                zIndex: 1,
                position: "relative",
                overflow: "hidden",
                minWidth: "auto",
                width: "fit-content",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e63946";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#e63946";
              }}
            >
              <FaTimes
                style={{
                  marginRight: "0.4rem",
                  transition: "transform 0.3s ease",
                  fontSize: "0.9rem",
                }}
              />
              <span style={{ fontSize: "0.9rem" }}>Cancel</span>
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "5px",
                  height: "5px",
                  background: "rgba(255, 255, 255, 0.5)",
                  opacity: 0,
                  borderRadius: "50%",
                  transform: "translate(-50%, -50%)",
                  transition: "all 0.6s ease",
                }}
              ></span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <div className="d-flex justify-content-between mb-2">
              <small className="text-muted">Form Completion</small>
              <small className="fw-bold" style={{ color: "#2a9d8f" }}>
                {renderProgress()}%
              </small>
            </div>
            <div
              className="progress"
              style={{ height: "10px", borderRadius: "5px" }}
            >
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${renderProgress()}%`,
                  transition: "width 0.6s ease",
                }}
                aria-valuenow={renderProgress()}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <ul
            className="nav nav-tabs mb-4"
            id="employerFormTabs"
            role="tablist"
          >
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeTab === "personal" ? "active" : ""
                }`}
                id="personal-tab"
                data-bs-toggle="tab"
                data-bs-target="#personal"
                type="button"
                role="tab"
                aria-controls="personal"
                aria-selected={activeTab === "personal"}
                onClick={() => setActiveTab("personal")}
              >
                <FaUser className="me-1" />
                Personal
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeTab === "identification" ? "active" : ""
                }`}
                id="identification-tab"
                data-bs-toggle="tab"
                data-bs-target="#identification"
                type="button"
                role="tab"
                aria-controls="identification"
                aria-selected={activeTab === "identification"}
                onClick={() => setActiveTab("identification")}
              >
                <FaAddressCard className="me-1" />
                Identification
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeTab === "employment" ? "active" : ""
                }`}
                id="employment-tab"
                data-bs-toggle="tab"
                data-bs-target="#employment"
                type="button"
                role="tab"
                aria-controls="employment"
                aria-selected={activeTab === "employment"}
                onClick={() => setActiveTab("employment")}
              >
                <FaBuilding className="me-1" />
                Employment
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeTab === "schedule" ? "active" : ""
                }`}
                id="schedule-tab"
                data-bs-toggle="tab"
                data-bs-target="#schedule"
                type="button"
                role="tab"
                aria-controls="schedule"
                aria-selected={activeTab === "schedule"}
                onClick={() => setActiveTab("schedule")}
              >
                <FaBusinessTime className="me-1" />
                Schedule
              </button>
            </li>
          </ul>

          {/* Tabs Content */}
          <div className="tab-content" id="employerFormTabsContent">
            {/* Personal Information Tab */}
            <div
              className={`tab-pane fade ${
                activeTab === "personal" ? "show active" : ""
              }`}
              id="personal"
              role="tabpanel"
              aria-labelledby="personal-tab"
            >
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="full_name"
                    className="form-label fw-bold text-dark"
                  >
                    Full Name
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaUser />
                    </span>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.full_name ? "is-invalid" : ""
                      }`}
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                    {errors.full_name && (
                      <div className="invalid-feedback">{errors.full_name}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="gender"
                      className="form-label fw-bold text-dark"
                    >
                      Gender
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaVenusMars />
                      </span>
                      <select
                        className={`form-select ${
                          errors.gender ? "is-invalid" : ""
                        }`}
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.gender && (
                        <div className="invalid-feedback">{errors.gender}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="nationality"
                      className="form-label fw-bold text-dark"
                    >
                      Nationality
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaGlobe />
                      </span>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.nationality ? "is-invalid" : ""
                        }`}
                        id="nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        placeholder="Nationality"
                      />
                      {errors.nationality && (
                        <div className="invalid-feedback">
                          {errors.nationality}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="dob" className="form-label fw-bold text-dark">
                    Date of Birth
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaCalendarAlt />
                    </span>
                    <input
                      type="date"
                      className={`form-control ${
                        errors.dob ? "is-invalid" : ""
                      }`}
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                    {errors.dob && (
                      <div className="invalid-feedback">{errors.dob}</div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Identification Tab */}
            <div
              className={`tab-pane fade ${
                activeTab === "identification" ? "show active" : ""
              }`}
              id="identification"
              role="tabpanel"
              aria-labelledby="identification-tab"
            >
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="national_id"
                    className="form-label fw-bold text-dark"
                  >
                    National ID
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaIdCard />
                    </span>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.national_id ? "is-invalid" : ""
                      }`}
                      id="national_id"
                      name="national_id"
                      value={formData.national_id}
                      onChange={handleChange}
                      placeholder="2 or 3 followed by 13 digits"
                    />
                    {errors.national_id && (
                      <div className="invalid-feedback">
                        {errors.national_id}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="address"
                    className="form-label fw-bold text-dark"
                  >
                    Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaHome />
                    </span>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.address ? "is-invalid" : ""
                      }`}
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Full address"
                    />
                    {errors.address && (
                      <div className="invalid-feedback">{errors.address}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="phone"
                    className="form-label fw-bold text-dark"
                  >
                    Phone
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaPhone />
                    </span>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.phone ? "is-invalid" : ""
                      }`}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Employment Details Tab */}
            <div
              className={`tab-pane fade ${
                activeTab === "employment" ? "show active" : ""
              }`}
              id="employment"
              role="tabpanel"
              aria-labelledby="employment-tab"
            >
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="department_id"
                    className="form-label fw-bold text-dark"
                  >
                    Department
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaBuilding />
                    </span>
                    <select
                      name="department_id"
                      className={`form-select ${
                        errors.department_id ? "is-invalid" : ""
                      }`}
                      id="department_id"
                      value={formData.department_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Department</option>
                      {departments &&
                        departments.map((dept) => (
                          <option key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </option>
                        ))}
                    </select>
                    {errors.department_id && (
                      <div className="invalid-feedback">
                        {errors.department_id}
                      </div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="contract_date"
                      className="form-label fw-bold text-dark"
                    >
                      Contract Date
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaFileSignature />
                      </span>
                      <input
                        type="date"
                        className={`form-control ${
                          errors.contract_date ? "is-invalid" : ""
                        }`}
                        id="contract_date"
                        name="contract_date"
                        value={formData.contract_date}
                        onChange={handleChange}
                      />
                      {errors.contract_date && (
                        <div className="invalid-feedback">
                          {errors.contract_date}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="salary"
                      className="form-label fw-bold text-dark"
                    >
                      Salary
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaMoneyBillWave />
                      </span>
                      <input
                        type="number"
                        className={`form-control ${
                          errors.salary ? "is-invalid" : ""
                        }`}
                        id="salary"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="Monthly salary"
                      />
                      {errors.salary && (
                        <div className="invalid-feedback">{errors.salary}</div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Work Schedule Tab */}
            <div
              className={`tab-pane fade ${
                activeTab === "schedule" ? "show active" : ""
              }`}
              id="schedule"
              role="tabpanel"
              aria-labelledby="schedule-tab"
            >
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="attendance_time"
                      className="form-label fw-bold text-dark"
                    >
                      Attendance Time
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaClock />
                      </span>
                      <input
                        type="time"
                        className={`form-control ${
                          errors.attendance_time ? "is-invalid" : ""
                        }`}
                        id="attendance_time"
                        name="attendance_time"
                        value={formData.attendance_time}
                        onChange={handleChange}
                      />
                      {errors.attendance_time && (
                        <div className="invalid-feedback">
                          {errors.attendance_time}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="leave_time"
                      className="form-label fw-bold text-dark"
                    >
                      Leave Time
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaClock />
                      </span>
                      <input
                        type="time"
                        className={`form-control ${
                          errors.leave_time ? "is-invalid" : ""
                        }`}
                        id="leave_time"
                        value={formData.leave_time}
                        onChange={handleChange}
                      />
                      {errors.leave_time && (
                        <div className="invalid-feedback">
                          {errors.leave_time}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-ripple w-100 d-flex justify-content-center align-items-center"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Update Employee
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployer;
