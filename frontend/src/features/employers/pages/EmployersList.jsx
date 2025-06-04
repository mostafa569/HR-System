import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getEmployers,
  deleteEmployer,
  attendEmployer,
  leaveEmployer,
} from "../services/employerService";
import {
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiClock,
  FiLogOut,
} from "react-icons/fi";
import { HiOutlineAdjustments } from "react-icons/hi";
import {
  FaIdCard,
  FaUserTie,
  FaFilter,
  FaBuilding,
  FaPhone,
  FaMoneyBillWave,
} from "react-icons/fa";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const EmployerList = () => {
  const [employers, setEmployers] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployers();
  }, [currentPage, departmentFilter]);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const response = await getEmployers(currentPage, departmentFilter);
      setEmployers(response);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employers:", error);
      toast.error("Failed to fetch employers", { theme: "dark" });
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employer?")) {
      try {
        await deleteEmployer(id);
        toast.success("Employer deleted successfully", { theme: "dark" });
        fetchEmployers();
      } catch (error) {
        toast.error("Failed to delete employer", { theme: "dark" });
      }
    }
  };

  const handleAttend = async (id) => {
    try {
      await attendEmployer(id);
      toast.success("Attendance marked successfully", { theme: "dark" });
      fetchEmployers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark attendance",
        { theme: "dark" }
      );
    }
  };

  const handleLeave = async (id) => {
    try {
      await leaveEmployer(id);
      toast.success("Leave marked successfully", { theme: "dark" });
      fetchEmployers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark leave", {
        theme: "dark",
      });
    }
  };

  const uniqueDepartments = [
    ...new Set(
      employers.data.map((emp) => emp.department?.name).filter(Boolean)
    ),
  ];

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
          .card-animated {
            animation: fadeIn 0.6s ease-out;
            border-radius: 12px;
            background: rgba(245, 245, 220, 0.95);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
          }
          .employer-card {
            transition: all 0.3s ease;
            border: none;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }
          .employer-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          }
          .btn-add {
            background: linear-gradient(to right, #2a9d8f, #6c5ce7);
            border: none;
            color: #fff;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          .btn-add:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(42, 157, 143, 0.3);
          }
          .filter-select {
            border: 1px solid #e9c46a;
            background: rgba(255, 255, 255, 0.8);
            transition: all 0.3s ease;
          }
          .filter-select:focus {
            border-color: #6c5ce7;
            box-shadow: 0 0 8px rgba(108, 92, 231, 0.4);
          }
          .btn-action {
            transition: all 0.3s ease;
            border-radius: 8px;
            padding: 0.5rem;
          }
          .btn-action:hover {
            transform: scale(1.1);
          }
          .btn-edit {
            color: #2a9d8f;
          }
          .btn-delete {
            color: #e63946;
          }
          .pagination-btn {
            background: linear-gradient(to right, #2a9d8f, #6c5ce7);
            border: none;
            color: #fff;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          .pagination-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(42, 157, 143, 0.3);
          }
          .pagination-btn:disabled {
            background: #34495e;
            cursor: not-allowed;
          }
          .no-data-card {
            animation: fadeIn 0.7s ease-out;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.95);
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
        `}
      </style>

      <div className="container">
        <div className="card card-animated p-4">
          {/* Header */}
          <div className="header-container">
            <div className="d-flex align-items-center">
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
                <FaUserTie style={{ color: "#2a9d8f", fontSize: "1.75rem" }} />
              </div>
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#264653",
                    fontWeight: "600",
                    fontSize: "1.5rem",
                  }}
                >
                  Employees List
                </h2>
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    color: "#6c757d",
                    fontSize: "0.9rem",
                  }}
                >
                  Manage your team members and their information
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/employers/create")}
              className="btn btn-add"
            >
              <FiUserPlus className="me-2" />
              Add New Employee
            </button>
          </div>

          {/* Filter Bar */}
          <div className="card card-animated p-3 mb-4">
            <div className="d-flex align-items-center">
              <FaFilter className="me-2" style={{ color: "#2a9d8f" }} />
              <select
                className="form-select filter-select w-auto"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div
                className="spinner-border"
                style={{ width: "3rem", height: "3rem", color: "#2a9d8f" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : !employers?.data || employers.data.length === 0 ? (
            <div className="card no-data-card p-5 text-center">
              <FaUserTie
                className="mx-auto mb-3"
                style={{ fontSize: "3rem", color: "#2a9d8f" }}
              />
              <h3 className="text-lg font-medium text-gray-900">
                No employees found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Get started by adding a new employee.
              </p>
              <button
                onClick={() => navigate("/employers/create")}
                className="btn btn-add"
              >
                <FiUserPlus className="me-2" />
                Add Employee
              </button>
            </div>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {employers.data.map((employer) => (
                  <div key={employer.id} className="col">
                    <div className="employer-card p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-teal-100 d-flex align-items-center justify-center me-3">
                          <span className="text-teal-600 font-medium fs-4">
                            {employer.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-dark mb-0">
                            {employer.full_name}
                          </h5>
                          <p className="text-muted small mb-0">
                            ID: {employer.id}
                          </p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-muted small mb-1">
                          <FaIdCard
                            className="me-1"
                            style={{ color: "#2a9d8f" }}
                          />
                          National ID: {employer.national_id}
                        </p>
                        <p className="text-muted small mb-1">
                          <FaBuilding
                            className="me-1"
                            style={{ color: "#2a9d8f" }}
                          />
                          Department: {employer.department?.name || "N/A"}
                        </p>
                        <p className="text-muted small mb-1">
                          <FaPhone
                            className="me-1"
                            style={{ color: "#2a9d8f" }}
                          />
                          Phone: {employer.phone}
                        </p>
                        <p className="text-muted small mb-0">
                          <FaMoneyBillWave
                            className="me-1"
                            style={{ color: "#2a9d8f" }}
                          />
                          Salary: {employer.salary} EGP
                        </p>
                      </div>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <button
                          onClick={() => handleAttend(employer.id)}
                          className="btn btn-action btn-sm text-white px-3 py-1 rounded"
                          style={{ background: "#2a9d8f" }}
                          title="Mark attendance"
                        >
                          <FiClock className="me-1" />
                          Attend
                        </button>
                        <button
                          onClick={() => handleLeave(employer.id)}
                          className="btn btn-action btn-sm text-white px-3 py-1 rounded"
                          style={{ background: "#e9c46a" }}
                          title="Mark leave"
                        >
                          <FiLogOut className="me-1" />
                          Leave
                        </button>
                      </div>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/employers/${employer.id}/edit`)
                          }
                          className="btn btn-action btn-sm text-teal-600 p-2 rounded-circle"
                          style={{ background: "#e0f7fa" }}
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/employers/${employer.id}/adjustments`)
                          }
                          className="btn btn-action btn-sm text-indigo-600 p-2 rounded-circle"
                          style={{ background: "#ede7f6" }}
                          title="Adjustments"
                        >
                          <HiOutlineAdjustments />
                        </button>
                        <button
                          onClick={() => handleDelete(employer.id)}
                          className="btn btn-action btn-sm text-red-600 p-2 rounded-circle"
                          style={{ background: "#fce4ec" }}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-5">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!employers.prev_page_url}
                  className="btn pagination-btn px-4 py-2 rounded"
                >
                  <MdNavigateBefore className="me-1" />
                  Previous
                </button>
                <span className="text-dark">
                  Page {currentPage} of {employers.last_page || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!employers.next_page_url}
                  className="btn pagination-btn px-4 py-2 rounded"
                >
                  Next
                  <MdNavigateNext className="ml-1" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerList;
