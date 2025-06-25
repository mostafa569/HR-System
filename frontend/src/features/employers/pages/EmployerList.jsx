import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getEmployers,
  deleteEmployer,
  attendEmployer,
  leaveEmployer,
  getDepartments,
} from "../services/employerService";
import { calculateSalarySummary } from "../services/salaryService";
import {
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiClock,
  FiLogOut,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";
import { HiOutlineAdjustments } from "react-icons/hi";
import {
  FaUserTie,
  FaFilter,
  FaBuilding,
  FaPhone,
  FaMoneyBillWave,
  FaSort,
  FaIdCard,
} from "react-icons/fa";
import ConfirmationModal from "../../../components/Modal/ConfirmationModal";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const EmployerList = () => {
  const [employers, setEmployers] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [allDepartments, setAllDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("full_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [totalPages, setTotalPages] = useState(1);
  const [timezone, setTimezone] = useState("Africa/Cairo");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onSecondaryAction: () => {},
    confirmText: "Confirm",
    secondaryText: null,
  });
  const navigate = useNavigate();

  const getMonthName = (monthNumber) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1] || "";
  };

  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  useEffect(() => {
    const fetchAllDepartments = async () => {
      try {
        const response = await getDepartments();
        setAllDepartments(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Failed to fetch departments", { theme: "colored" });
        setAllDepartments([]);
      }
    };
    fetchAllDepartments();
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const debouncedFetchEmployers = useCallback(
    debounce(async (page, dept, query, sort, direction) => {
      try {
        setLoading(true);
        const response = await getEmployers(page, dept, query, sort, direction);
        if (response?.data && Array.isArray(response.data)) {
          setEmployers({
            data: response.data,
            total: response.total || 0,
            current_page: response.current_page || 1,
            last_page: response.last_page || 1,
          });
          setTotalPages(response.last_page || 1);
        } else {
          toast.error("Invalid response from server", { theme: "colored" });
        }
      } catch (error) {
        console.error("Error fetching employers:", error);
        if (error.response?.status === 401) {
          toast.error("Please login to continue", { theme: "colored" });
          navigate("/login");
        } else {
          toast.error(error.message || "Failed to fetch employers", {
            theme: "colored",
          });
        }
      } finally {
        setLoading(false);
      }
    }, 500),
    [navigate]
  );

  useEffect(() => {
    setCurrentPage(1);
    debouncedFetchEmployers(
      1,
      departmentFilter,
      searchQuery,
      sortField,
      sortDirection
    );
  }, [
    searchQuery,
    departmentFilter,
    sortField,
    sortDirection,
    debouncedFetchEmployers,
  ]);

  useEffect(() => {
    debouncedFetchEmployers(
      currentPage,
      departmentFilter,
      searchQuery,
      sortField,
      sortDirection
    );
  }, [currentPage, debouncedFetchEmployers]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value.trim());
  const handleDepartmentFilterChange = (e) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employer?")) {
      try {
        await deleteEmployer(id);
        toast.success("Employer deleted successfully", { theme: "colored" });
        debouncedFetchEmployers(
          currentPage,
          departmentFilter,
          searchQuery,
          sortField,
          sortDirection
        );
      } catch (error) {
        toast.error("Failed to delete employer", { theme: "colored" });
      }
    }
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAttend = async (employerId, applyAdjustment) => {
    closeModal();
    try {
      const response = await attendEmployer(
        employerId,
        applyAdjustment,
        timezone
      );

      if (response.data?.adjustment) {
        const adj = response.data.adjustment;
        toast.success(
          <div>
            <p>Attendance recorded successfully</p>
            <p className="text-sm mt-1">
              {adj.kind === "addition" ? "+" : "-"} {adj.value} {adj.value_type}{" "}
              ({adj.reason})
            </p>
          </div>,
          { autoClose: 5000 }
        );
      } else {
        toast.success(response.message || "Attendance marked successfully");
      }

      debouncedFetchEmployers(
        currentPage,
        departmentFilter,
        searchQuery,
        sortField,
        sortDirection
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to mark attendance";

      if (error.response?.data?.details) {
        toast.error(
          <div>
            <p>{errorMessage}</p>
            <p className="text-sm mt-1">{error.response.data.details}</p>
          </div>,
          { autoClose: 7000 }
        );
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleAttendClick = (id) => {
    const employer = employers.data.find((e) => e.id === id);
    const scheduledTime = new Date();
    const [hours, minutes] = employer.attendance_time.split(":");
    scheduledTime.setHours(hours, minutes, 0, 0);

    const status = currentTime < scheduledTime ? "early" : "late";

    setModalState({
      isOpen: true,
      title: `Mark Attendance (${status === "early" ? "Early" : "Late"})`,
      message: (
        <div>
          <p>Scheduled time: {employer.attendance_time}</p>
          <p>
            Current time:{" "}
            {currentTime.toLocaleTimeString("en-US", { timeZone: timezone })}
          </p>
          <p className="mt-2">
            {status === "early"
              ? "This will be recorded as overtime."
              : "This may result in a deduction."}
          </p>
          <ul className="list-disc pl-4 mt-2 text-sm">
            <li>
              <strong>With Adjustment:</strong> System will automatically
              calculate the difference
            </li>
            <li>
              <strong>Without Adjustment:</strong> Record the time without any
              changes
            </li>
          </ul>
        </div>
      ),
      onConfirm: () => handleConfirmAttend(id, true),
      confirmText: "Save with Adjustment",
      onSecondaryAction: () => handleConfirmAttend(id, false),
      secondaryText: "Save without Adjustment",
      onClose: closeModal,
    });
  };

  const handleConfirmLeave = async (employerId, applyAdjustment) => {
    if (!employerId) return;

    closeModal();
    try {
      const response = await leaveEmployer(employerId, applyAdjustment);
      toast.success(response.message || "Leave marked successfully");
      debouncedFetchEmployers(
        currentPage,
        departmentFilter,
        searchQuery,
        sortField,
        sortDirection
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark leave");
    }
  };

  const handleLeaveClick = (id) => {
    const employer = employers.data.find((e) => e.id === id);
    const scheduledLeaveTime = new Date();
    const leaveTimeStr = employer.leave_time || "17:00";
    const [leaveHours, leaveMinutes] = leaveTimeStr.split(":");
    scheduledLeaveTime.setHours(leaveHours, leaveMinutes, 0, 0);

    const status = currentTime < scheduledLeaveTime ? "early" : "late";

    setModalState({
      isOpen: true,
      title: `Mark Leave (${status === "early" ? "Early" : "Late"})`,
      message: (
        <div>
          <p>
            Scheduled leave time:{" "}
            {new Date(
              currentTime.setHours(leaveHours, leaveMinutes, 0, 0)
            ).toLocaleTimeString("en-US", { timeZone: timezone, hour12: true })}
          </p>
          <p>
            Current time:{" "}
            {new Date().toLocaleTimeString("en-US", {
              timeZone: timezone,
              hour12: true,
            })}
          </p>
          <p className="mt-2">
            {status === "early"
              ? "This will be recorded as early leave (may result in deduction)."
              : "This will be recorded as late leave (may result in addition or nothing depending on the policy)."}
          </p>
          <ul className="list-disc pl-4 mt-2 text-sm">
            <li>
              <strong>With Adjustment:</strong> The system will automatically
              calculate the difference
            </li>
            <li>
              <strong>Without Adjustment:</strong> Record the time as is without
              any changes
            </li>
          </ul>
        </div>
      ),
      onConfirm: () => handleConfirmLeave(id, true),
      confirmText: "Save with Adjustment",
      onSecondaryAction: () => handleConfirmLeave(id, false),
      secondaryText: "Save without Adjustment",
      onClose: closeModal,
    });
  };

  const handleSort = (field) => {
    setSortField(field);
    setSortDirection(
      sortField === field && sortDirection === "asc" ? "desc" : "asc"
    );
    setCurrentPage(1);
  };

  const getEmptyStateMessage = () => {
    if (searchQuery && departmentFilter)
      return "No employees found matching your search and department.";
    if (searchQuery) return "No employees found matching your search.";
    if (departmentFilter)
      return `No employees in the ${departmentFilter} department.`;
    return "No employees in the system.";
  };

  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPage = (page) =>
    page >= 1 && page <= totalPages && setCurrentPage(page);

  const getPageNumbers = () => {
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);
    if (end - start + 1 < showPages) start = Math.max(1, end - showPages + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("");
    setSortField("full_name");
    setSortDirection("asc");
    setCurrentPage(1);
  };

  return (
    <div className="min-vh-100 py-4 bg-gray-50">
      <style>
        {`
          :root {
            --primary: #667eea;
            --primary-dark: #764ba2;
            --secondary: #64748b;
            --border: #e2e8f0;
            --bg-light: #f8fafc;
            --shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
            --shadow-md: 0 4px 20px rgba(0,0,0,0.08);
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .card-main {
            animation: fadeIn 0.5s ease-out;
            border-radius: 12px;
            box-shadow: var(--shadow-md);
            background: white;
            margin: 0 1rem;
          }

          .header-card {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
          }

          .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
            justify-content: space-between;
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 1;
            min-width: 200px;
          }

          .header-right {
            flex: 1;
            display: flex;
            justify-content: flex-end;
          }

          .header-icon {
            background: rgba(255,255,255,0.2);
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .header-title {
            font-size: clamp(1.5rem, 4vw, 1.75rem);
            font-weight: 700;
            margin: 0;
          }

          .header-subtitle {
            font-size: clamp(0.85rem, 2vw, 0.95rem);
            opacity: 0.9;
            margin: 0;
          }

          .btn-primary-gradient {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            border: none;
            padding: 0.75rem 1.5rem;
            font-size: 0.95rem;
            font-weight: 600;
            border-radius: 8px;
            color: white;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .btn-primary-gradient:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-sm);
            background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
          }

          .search-input {
            border-radius: 8px;
            border: 1px solid var(--border);
            padding: 0.75rem;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            background: white;
          }

          .search-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            outline: none;
          }

          .search-prepend {
            background: var(--bg-light);
            border: 1px solid var(--border);
            border-right: none;
            border-radius: 8px 0 0 8px;
            padding: 0 0.75rem;
            display: flex;
            align-items: center;
          }

          .filter-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            box-shadow: var(--shadow-sm);
          }

          .table-card {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
          }

          .table-header {
            background: var(--bg-light);
            color: var(--secondary);
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .table-row {
            transition: all 0.2s ease;
            border-bottom: 1px solid var(--border);
          }

          .table-row:hover {
            background: rgba(102, 126, 234, 0.05);
            transform: translateY(-1px);
          }

          .sortable-header {
            cursor: pointer;
            transition: color 0.2s ease;
            padding: 1rem;
          }

          .sortable-header:hover {
            color: var(--primary);
          }

          .sort-icon {
            margin-left: 0.5rem;
            color: var(--secondary);
            transition: all 0.3s ease;
          }

          .sort-icon.active {
            color: var(--primary);
          }

          .sort-icon.desc {
            transform: rotate(180deg);
          }

          .avatar {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 1rem;
            flex-shrink: 0;
          }

          .action-btn {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            transition: all 0.3s ease;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-light);
          }

          .action-btn:hover {
            transform: scale(1.05);
            box-shadow: var(--shadow-sm);
          }

          .pagination-container {
            background: white;
            border-radius: 12px;
            padding: 1rem;
            margin-top: 1.5rem;
            box-shadow: var(--shadow-sm);
          }

          .pagination-wrapper {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
            justify-content: space-between;
          }

          .pagination-info {
            color: var(--secondary);
            font-size: 0.9rem;
          }

          .pagination-controls {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .pagination-btn {
            border-radius: 8px;
            padding: 0.5rem 1rem;
            font-weight: 600;
            border: 1px solid var(--border);
            background: white;
            color: var(--secondary);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .pagination-btn:hover:not(:disabled) {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
          }

          .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .page-number {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            border: 1px solid var(--border);
            background: white;
            color: var(--secondary);
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .page-number:hover {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
          }

          .page-number.active {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
          }

          .empty-state {
            padding: 3rem;
            text-align: center;
            background: white;
            border-radius: 12px;
            box-shadow: var(--shadow-sm);
          }

          .empty-icon {
            font-size: 3rem;
            color: var(--border);
            margin-bottom: 1rem;
          }

          .table-icon {
            color: var(--primary);
            font-size: 1rem;
            margin-right: 0.5rem;
          }

          .bg-indigo-100 { background: #e0e7ff; }
          .text-indigo-600 { color: #4f46e5; }
          .bg-amber-100 { background: #fef3c7; }
          .text-amber-600 { color: #d97706; }
          .bg-cyan-100 { background: #cffafe; }
          .text-cyan-600 { color: #0891b2; }
          .bg-gray-100 { background: #f3f4f6; }
          .text-gray-600 { color: #4b5563; }
          .bg-red-100 { background: #fee2e2; }
          .text-red-600 { color: #dc2626; }
          .bg-green-100 { background: #d1fae5; }
          .text-green-600 { color: #059669; }

          .btn-outline-secondary {
            border: 1px solid var(--border);
            color: var(--secondary);
            transition: all 0.3s ease;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-outline-secondary:hover {
            background: var(--bg-light);
            border-color: var(--primary);
            color: var(--primary);
          }

          /* Responsive styles */
          @media (max-width: 768px) {
            .header-content {
              flex-direction: column;
              text-align: center;
            }

            .header-left, .header-right {
              flex: 1;
              justify-content: center;
              min-width: 0;
            }

            .filter-card {
              padding: 1rem;
            }

            .table-responsive {
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
            }

            table {
              width: 100%;
            }

            tr {
              display: flex;
              flex-direction: column;
              margin-bottom: 1rem;
              border: 1px solid var(--border);
              border-radius: 8px;
              box-shadow: var(--shadow-sm);
            }

            td {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.75rem;
              border-bottom: 1px solid var(--border);
            }

            td:before {
              content: attr(data-label);
              font-weight: 600;
              font-size: 0.8rem;
              color: var(--secondary);
              flex: 1;
            }

            td:last-child {
              border-bottom: none;
            }

            .action-buttons {
              justify-content: center;
              gap: 0.5rem;
            }
          }

          @media (max-width: 576px) {
            .header-title { font-size: 1.25rem; }
            .header-subtitle { font-size: 0.8rem; }
            .btn-primary-gradient { padding: 0.6rem 1rem; font-size: 0.9rem; }
            .search-input { font-size: 0.9rem; }
            .pagination-btn { padding: 0.5rem 0.75rem; font-size: 0.8rem; }
            .page-number { width: 32px; height: 32px; font-size: 0.8rem; }
          }
        `}
      </style>

      <div className="container px-3">
        <div className="card-main">
          <div className="header-card">
            <div className="header-content">
              <div className="header-left">
                <div className="header-icon">
                  <FaUserTie size={20} />
                </div>
                <div>
                  <h1 className="header-title">Employee Management</h1>
                  <p className="header-subtitle">
                    Efficiently manage your team with our intuitive system
                  </p>
                </div>
              </div>
              <div className="header-right">
                <button
                  onClick={() => navigate("/employers/create")}
                  className="btn btn-primary-gradient"
                >
                  <FiUserPlus size={16} />
                  Add Employee
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 p-md-4">
            <div className="filter-card">
              <div className="row g-3">
                <div className="col-12 col-md-7">
                  <div className="input-group">
                    <span className="input-group-text search-prepend">
                      <FiSearch size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control search-input"
                      placeholder="Search by name, ID, or phone..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      aria-label="Search employees"
                    />
                  </div>
                </div>
                <div className="col-12 col-md-5">
                  <div className="d-flex gap-2">
                    <div className="input-group flex-grow-1">
                      <span className="input-group-text search-prepend">
                        <FaFilter size={14} />
                      </span>
                      <select
                        className="form-select search-input"
                        value={departmentFilter}
                        onChange={handleDepartmentFilterChange}
                        aria-label="Filter by department"
                      >
                        <option value="">All Departments</option>
                        {allDepartments.map((dept) => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(searchQuery ||
                      departmentFilter ||
                      sortField !== "full_name" ||
                      sortDirection !== "asc") && (
                      <button
                        onClick={handleResetFilters}
                        className="btn btn-outline-secondary"
                        title="Reset filters"
                        aria-label="Reset filters"
                      >
                        <FiRefreshCw size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : !employers?.data?.length ? (
              <div className="empty-state">
                <FaUserTie className="empty-icon" />
                <h4 className="mb-2 text-gray-800">No Employees Found</h4>
                <p className="text-gray-600 mb-3">{getEmptyStateMessage()}</p>
                <button
                  onClick={() => navigate("/employers/create")}
                  className="btn btn-primary-gradient"
                >
                  <FiUserPlus size={16} />
                  Add New Employee
                </button>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-header">
                      <tr>
                        {[
                          "Employee",
                          "National ID",
                          "Department",
                          "Phone",
                          "Salary",
                        ].map((label, index) => (
                          <th
                            key={label}
                            className="sortable-header"
                            onClick={() =>
                              handleSort(
                                [
                                  "full_name",
                                  "national_id",
                                  "department",
                                  "phone",
                                  "salary",
                                ][index]
                              )
                            }
                            scope="col"
                          >
                            <div className="d-flex align-items-center">
                              {label}
                              <FaSort
                                className={`sort-icon ${
                                  sortField ===
                                  [
                                    "full_name",
                                    "national_id",
                                    "department",
                                    "phone",
                                    "salary",
                                  ][index]
                                    ? "active"
                                    : ""
                                } ${
                                  sortField ===
                                    [
                                      "full_name",
                                      "national_id",
                                      "department",
                                      "phone",
                                      "salary",
                                    ][index] && sortDirection === "desc"
                                    ? "desc"
                                    : ""
                                }`}
                              />
                            </div>
                          </th>
                        ))}
                        <th scope="col">Salary Summary</th>
                        <th scope="col" style={{ textAlign: "center" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employers.data.map((employer) => (
                        <tr key={employer.id} className="table-row">
                          <td data-label="Employee">
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar d-none d-md-flex">
                                {employer.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-bold">
                                  {employer.full_name}
                                </div>
                                <small className="text-gray-500 d-block d-md-none">
                                  ID: {employer.id}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td data-label="National ID">
                            <div className="d-flex align-items-center gap-2">
                              <FaIdCard className="table-icon d-none d-md-block" />
                              <span>{employer.national_id || "-"}</span>
                            </div>
                          </td>
                          <td data-label="Department">
                            <div className="d-flex align-items-center gap-2">
                              <FaBuilding className="table-icon d-none d-md-block" />
                              <span>{employer.department?.name || "-"}</span>
                            </div>
                          </td>
                          <td data-label="Phone">
                            <div className="d-flex align-items-center gap-2">
                              <FaPhone className="table-icon d-none d-md-block" />
                              <span>{employer.phone || "-"}</span>
                            </div>
                          </td>
                          <td data-label="Salary">
                            <div className="d-flex align-items-center gap-2">
                              <FaMoneyBillWave className="table-icon d-none d-md-block" />
                              <span className="fw-bold">
                                {employer.salary?.toLocaleString() || "0"} EGP
                              </span>
                            </div>
                          </td>
                          <td data-label="Salary Summary">
                            <button
                              onClick={async () => {
                                const token = localStorage.getItem("userToken");
                                if (!token) {
                                  toast.error(
                                    "Please login to view salary summary"
                                  );
                                  navigate("/login");
                                  return;
                                }
                                try {
                                  setLoading(true);
                                  const response = await calculateSalarySummary(
                                    employer.id
                                  );
                                  const monthName = getMonthName(
                                    new Date().getMonth() + 1
                                  );
                                  toast.success(
                                    `Salary summary calculated for ${monthName}`
                                  );
                                  navigate(
                                    `/employers/${employer.id}/salary-summary`,
                                    {
                                      state: { summaryData: response.data },
                                    }
                                  );
                                } catch (error) {
                                  toast.error(
                                    error.response?.data?.message ||
                                      "Failed to calculate salary summary"
                                  );
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="action-btn bg-green-100 text-green-600"
                              title="View Salary Summary"
                              disabled={loading}
                              aria-label={`View salary summary for ${employer.full_name}`}
                            >
                              <FaMoneyBillWave size={16} />
                            </button>
                          </td>
                          <td data-label="Actions">
                            <div className="d-flex gap-1 action-buttons">
                              {[
                                {
                                  action: handleAttendClick,
                                  icon: FiClock,
                                  color: "bg-indigo-100 text-indigo-600",
                                  title: "Mark attendance",
                                },
                                {
                                  action: handleLeaveClick,
                                  icon: FiLogOut,
                                  color: "bg-amber-100 text-amber-600",
                                  title: "Mark leave",
                                },
                                {
                                  action: () =>
                                    navigate(`/employers/${employer.id}/edit`),
                                  icon: FiEdit2,
                                  color: "bg-cyan-100 text-cyan-600",
                                  title: "Edit",
                                },
                                {
                                  action: () =>
                                    navigate(
                                      `/employers/${employer.id}/adjustments`
                                    ),
                                  icon: HiOutlineAdjustments,
                                  color: "bg-gray-100 text-gray-600",
                                  title: "Adjustments",
                                },
                                {
                                  action: handleDelete,
                                  icon: FiTrash2,
                                  color: "bg-red-100 text-red-600",
                                  title: "Delete",
                                },
                              ].map(
                                (
                                  { action, icon: Icon, color, title },
                                  index
                                ) => (
                                  <button
                                    key={index}
                                    onClick={() => action(employer.id)}
                                    className={`action-btn ${color}`}
                                    title={title}
                                    aria-label={`${title} for ${employer.full_name}`}
                                  >
                                    <Icon size={16} />
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination-container">
                  <div className="pagination-wrapper">
                    <div className="pagination-info">
                      Showing {(currentPage - 1) * 10 + 1} to{" "}
                      {Math.min(currentPage * 10, employers.total)} of{" "}
                      {employers.total} employees
                    </div>
                    <div className="pagination-controls">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                        aria-label="Previous page"
                      >
                        <FiChevronLeft size={16} />
                        Previous
                      </button>
                      {totalPages > 1 && (
                        <>
                          {currentPage > 3 && (
                            <>
                              <div
                                className="page-number"
                                onClick={() => goToPage(1)}
                                aria-label="Page 1"
                              >
                                1
                              </div>
                              {currentPage > 4 && (
                                <span className="page-ellipsis">...</span>
                              )}
                            </>
                          )}
                          {getPageNumbers().map((page) => (
                            <div
                              key={page}
                              className={`page-number ${
                                currentPage === page ? "active" : ""
                              }`}
                              onClick={() => goToPage(page)}
                              aria-label={`Page ${page}`}
                              aria-current={
                                currentPage === page ? "page" : undefined
                              }
                            >
                              {page}
                            </div>
                          ))}
                          {currentPage < totalPages - 2 && (
                            <>
                              {currentPage < totalPages - 3 && (
                                <span className="page-ellipsis">...</span>
                              )}
                              <div
                                className="page-number"
                                onClick={() => goToPage(totalPages)}
                                aria-label={`Page ${totalPages}`}
                              >
                                {totalPages}
                              </div>
                            </>
                          )}
                        </>
                      )}
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                        className="pagination-btn"
                        aria-label="Next page"
                      >
                        Next
                        <FiChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onSecondaryAction={modalState.onSecondaryAction}
        confirmText={modalState.confirmText}
        secondaryText={modalState.secondaryText}
        onClose={closeModal}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EmployerList;
