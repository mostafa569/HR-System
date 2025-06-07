import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getEmployers,
  deleteEmployer,
  attendEmployer,
  leaveEmployer,
  getDepartments
} from "../services/employerService";
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
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

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
  const navigate = useNavigate();

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
        setAllDepartments(response);
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Failed to fetch departments", { theme: "colored" });
      }
    };
    fetchAllDepartments();
  }, []);

  const debouncedFetchEmployers = useCallback(
    debounce(async (page, dept, query, sort, direction) => {
      try {
        setLoading(true);
        const response = await getEmployers(page, dept, query, sort, direction);
        
        if (response && response.data && Array.isArray(response.data)) {
          const transformedResponse = {
            data: response.data,
            total: response.total || 0,
            current_page: response.current_page || 1,
            last_page: response.last_page || 1,
          };
          setEmployers(transformedResponse);
          setTotalPages(transformedResponse.last_page);
        } else {
          console.error("Invalid response format:", response);
          toast.error("Invalid response from server", { theme: "colored" });
        }
      } catch (error) {
        console.error("Error fetching employers:", error);
        toast.error("Failed to fetch employers", { theme: "colored" });
      } finally {
        setLoading(false);
      }
    }, 500),
    []
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
    debouncedFetchEmployers,
    sortField,
    sortDirection,
  ]);

  useEffect(() => {
    debouncedFetchEmployers(
      currentPage,
      departmentFilter,
      searchQuery,
      sortField,
      sortDirection
    );
  }, [currentPage, sortField, sortDirection, debouncedFetchEmployers]);

  const handleSearchChange = (e) => {
    const value = e.target.value.trim();
    setSearchQuery(value);
  };

  const handleDepartmentFilterChange = (e) => {
    const value = e.target.value;
    setDepartmentFilter(value);
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

  const handleAttend = async (id) => {
    try {
      await attendEmployer(id);
      toast.success("Attendance marked successfully", { theme: "colored" });
      debouncedFetchEmployers(
        currentPage,
        departmentFilter,
        searchQuery,
        sortField,
        sortDirection
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark attendance",
        { theme: "colored" }
      );
    }
  };

  const handleLeave = async (id) => {
    try {
      await leaveEmployer(id);
      toast.success("Leave marked successfully", { theme: "colored" });
      debouncedFetchEmployers(
        currentPage,
        departmentFilter,
        searchQuery,
        sortField,
        sortDirection
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark leave", {
        theme: "colored",
      });
    }
  };

  const handleSort = (field) => {
    const newDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    setCurrentPage(1);
  };

  const getEmptyStateMessage = () => {
    if (searchQuery && departmentFilter) {
      return "No employees found matching your search criteria and department filter.";
    } else if (searchQuery) {
      return "No employees found matching your search criteria.";
    } else if (departmentFilter) {
      return `No employees found in the ${departmentFilter} department.`;
    }
    return "There are currently no employees in the system.";
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .card-main {
            animation: fadeIn 0.5s ease-out;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: none;
            overflow: hidden;
            background: white;
          }

          .header-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem 2rem;
            position: relative;
            overflow: hidden;
          }

          .header-card::before {
            content: "";
            position: absolute;
            top: -50%;
            right: -30%;
            width: 120%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%);
            animation: float 15s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-20px, -10px) rotate(5deg); }
          }

          .header-content {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
          }

          .header-left {
            display: flex;
            align-items: center;
            flex: 1;
            justify-content: flex-start;
            max-width: 50%;
          }

          .header-right {
            display: flex;
            align-items: center;
            flex: 1;
            justify-content: flex-end;
            max-width: 50%;
          }

          .header-icon {
            background: rgba(255,255,255,0.2);
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            margin-left: 0;
            backdrop-filter: blur(10px);
          }

          .header-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
            text-shadow: 0 1px 3px rgba(255, 255, 255, 0.2);
            text-align: left;
          }

          .header-subtitle {
            font-size: 0.9rem;
            opacity: 0.9;
            line-height: 1.4;
            margin: 0;
            text-align: left;
          }

          .btn-primary-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            padding: 0.6rem 1.2rem;
            font-size: 0.9rem;
            font-weight: 600;
            border-radius: 10px;
            color: white;
            white-space: nowrap;
            width: 100%;
            max-width: 200px;
          }

          .btn-primary-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
            color: white;
          }

          .search-input {
            border-radius: 10px;
            height: 48px;
            border: 2px solid #e5e7eb;
            padding: 0.75rem 1rem;
            transition: all 0.3s ease;
            font-size: 0.95rem;
            background: white;
          }

          .search-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            outline: none;
            transform: translateY(-1px);
          }

          .search-prepend {
            background-color: #f8fafc;
            border-radius: 10px 0 0 10px;
            height: 48px;
            display: flex;
            align-items: center;
            padding: 0 1rem;
            border: 2px solid #e5e7eb;
            border-right: none;
            transition: all 0.3s ease;
          }

          .search-input:focus + .search-prepend,
          .input-group:focus-within .search-prepend {
            border-color: #667eea;
            background-color: #f0f4ff;
          }

          .filter-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
            border: 1px solid #f1f5f9;
          }

          .table-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
            border: 1px solid #f1f5f9;
          }

          .table-header {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e2e8f0;
          }

          .table-row {
            transition: all 0.2s ease;
            border-bottom: 1px solid #f1f5f9;
          }

          .table-row:hover {
            background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%) !important;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
          }

          .sortable-header {
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
            padding: 1rem !important;
          }

          .sortable-header:hover {
            color: #667eea;
            background: rgba(102, 126, 234, 0.05);
          }

          .sort-icon {
            margin-left: 8px;
            transition: all 0.3s ease;
            font-size: 1rem;
            color: #94a3b8;
          }

          .sort-icon.active {
            color: #667eea;
            transform: scale(1.1);
          }

          .sort-icon.desc {
            transform: rotate(180deg) scale(1.1);
          }

          .avatar {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: white;
            margin-right: 15px;
            font-size: 1.1rem;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          }

          .action-btn {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            transition: all 0.3s ease;
            margin: 0 3px;
            border: none;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .action-btn:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          }

          .action-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
          }

          .action-btn:hover::before {
            left: 100%;
          }

          /* Enhanced Pagination Styles */
          .pagination-container {
            background: white;
            border-radius: 12px;
            padding: 1.5rem 2rem;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
            border: 1px solid #f1f5f9;
            margin-top: 1.5rem;
          }

          .pagination-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .pagination-info {
            color: #64748b;
            font-size: 0.95rem;
            font-weight: 500;
          }

          .pagination-controls {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .pagination-btn {
            border-radius: 10px;
            padding: 0.75rem 1.25rem;
            font-weight: 600;
            transition: all 0.3s ease;
            border: 2px solid #e2e8f0;
            background: white;
            color: #64748b;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .pagination-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: #667eea;
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }

          .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: #f8fafc;
            color: #cbd5e1;
          }

          .page-number {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            border: 2px solid #e2e8f0;
            background: white;
            color: #64748b;
            font-weight: 600;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 0 2px;
          }

          .page-number:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: #667eea;
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          }

          .page-number.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: #667eea;
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }

          .page-ellipsis {
            padding: 0 0.5rem;
            color: #94a3b8;
            font-weight: 600;
          }

          .empty-state {
            padding: 4rem 2rem;
            text-align: center;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
            border: 1px solid #f1f5f9;
          }

          .empty-icon {
            font-size: 4rem;
            color: #cbd5e1;
            margin-bottom: 2rem;
          }

          .table-icon {
            color: #667eea;
            font-size: 1.2rem;
            margin-right: 0.75rem;
          }

          .bg-indigo-100 {
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%) !important;
          }

          .text-indigo-600 {
            color: #4f46e5 !important;
          }

          .bg-amber-100 {
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%) !important;
          }

          .text-amber-600 {
            color: #d97706 !important;
          }

          .bg-cyan-100 {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
          }

          .text-cyan-600 {
            color: white !important;
          }

          .bg-gray-100 {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%) !important;
          }

          .text-gray-600 {
            color: #4b5563 !important;
          }

          .bg-red-100 {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
          }

          .text-red-600 {
            color: #dc2626 !important;
          }

          @media (max-width: 768px) {
            .header-content {
              flex-direction: column;
              gap: 1rem;
              text-align: center;
            }
            
            .header-left {
              flex-direction: column;
              text-align: center;
            }
            
            .header-icon {
              margin-right: 0;
              margin-bottom: 0.5rem;
            }
            
            .filter-card {
              padding: 1.5rem;
            }
            
            .pagination-wrapper {
              flex-direction: column;
              text-align: center;
            }
            
            .pagination-controls {
              flex-wrap: wrap;
              justify-content: center;
            }
            
            .action-btn {
              width: 36px;
              height: 36px;
              font-size: 1rem;
            }
          }

          @media (max-width: 576px) {
            .page-number {
              width: 36px;
              height: 36px;
              font-size: 0.8rem;
            }
            
            .pagination-btn {
              padding: 0.6rem 1rem;
              font-size: 0.85rem;
            }
          }

          .btn-outline-secondary {
            border-color: #e2e8f0;
            color: #64748b;
            transition: all 0.3s ease;
            height: 48px;
            width: 48px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
          }

          .btn-outline-secondary:hover {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-color: #cbd5e1;
            color: #475569;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .btn-outline-secondary:active {
            transform: translateY(0);
          }
        `}
      </style>

      <div className="container px-3">
        <div className="card-main">
          <div className="header-card">
            <div className="header-content">
              <div className="header-left">
                <div className="header-icon">
                  <FaUserTie size={24} />
                </div>
                <div>
                  <h1 className="header-title">Employee Management</h1>
                  <p className="header-subtitle">
                    Manage your team members efficiently with our intuitive system
                  </p>
                </div>
              </div>
              <div className="header-right">
                <button
                  onClick={() => navigate("/employers/create")}
                  className="btn btn-primary-gradient d-flex align-items-center justify-content-center"
                >
                  <FiUserPlus className="me-2" size={18} />
                  Add Employee
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="filter-card">
              <div className="row g-4 align-items-center">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text search-prepend">
                      <FiSearch className="text-gray-500" size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control search-input"
                      placeholder="Search by name, national ID, or phone..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex gap-2">
                    <div className="input-group flex-grow-1">
                      <span className="input-group-text search-prepend">
                        <FaFilter className="text-gray-500" size={16} />
                      </span>
                      <select
                        className="form-select search-input"
                        value={departmentFilter}
                        onChange={handleDepartmentFilterChange}
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
                        className="btn btn-outline-secondary d-flex align-items-center"
                        title="Reset all filters"
                      >
                        <FiRefreshCw size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : !employers?.data || employers.data.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaUserTie />
                </div>
                <h4 className="mb-3 text-gray-800">No Employees Found</h4>
                <p className="text-gray-600 mb-4">{getEmptyStateMessage()}</p>
                <button
                  style={{ width: "500px" }}
                  onClick={() => navigate("/employers/create")}
                  className="btn btn-primary-gradient"
                >
                  <FiUserPlus className="me-2" size={20} />
                  Add
                </button>
              </div>
            ) : (
              <>
                <div className="table-responsive table-card">
                  <table className="table table-hover mb-0">
                    <thead className="table-header">
                      <tr>
                        <th
                          className="sortable-header"
                          onClick={() => handleSort("full_name")}
                        >
                          <div className="d-flex align-items-center">
                            Employee
                            <FaSort
                              className={`sort-icon ${
                                sortField === "full_name" ? "active" : ""
                              } ${
                                sortField === "full_name" &&
                                sortDirection === "desc"
                                  ? "desc"
                                  : ""
                              }`}
                            />
                          </div>
                        </th>
                        <th
                          className="sortable-header"
                          onClick={() => handleSort("national_id")}
                        >
                          <div className="d-flex align-items-center">
                            National ID
                            <FaSort
                              className={`sort-icon ${
                                sortField === "national_id" ? "active" : ""
                              } ${
                                sortField === "national_id" &&
                                sortDirection === "desc"
                                  ? "desc"
                                  : ""
                              }`}
                            />
                          </div>
                        </th>
                        <th
                          className="sortable-header"
                          onClick={() => handleSort("department")}
                        >
                          <div className="d-flex align-items-center">
                            Department
                            <FaSort
                              className={`sort-icon ${
                                sortField === "department" ? "active" : ""
                              } ${
                                sortField === "department" &&
                                sortDirection === "desc"
                                  ? "desc"
                                  : ""
                              }`}
                            />
                          </div>
                        </th>
                        <th
                          className="sortable-header"
                          onClick={() => handleSort("phone")}
                        >
                          <div className="d-flex align-items-center">
                            Phone
                            <FaSort
                              className={`sort-icon ${
                                sortField === "phone" ? "active" : ""
                              } ${
                                sortField === "phone" &&
                                sortDirection === "desc"
                                  ? "desc"
                                  : ""
                              }`}
                            />
                          </div>
                        </th>
                        <th
                          className="sortable-header"
                          onClick={() => handleSort("salary")}
                        >
                          <div className="d-flex align-items-center">
                            Salary
                            <FaSort
                              className={`sort-icon ${
                                sortField === "salary" ? "active" : ""
                              } ${
                                sortField === "salary" &&
                                sortDirection === "desc"
                                  ? "desc"
                                  : ""
                              }`}
                            />
                          </div>
                        </th>
                        <th className="">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employers.data.map((employer) => (
                        <tr key={employer.id} className="table-row">
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar">
                                {employer.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-bold text-gray-800">
                                  {employer.full_name}
                                </div>
                                <small className="text-gray-500">
                                  ID: {employer.id}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaIdCard className="me-2 table-icon" />
                              <span className="fw-medium">
                                {employer.national_id || "-"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaBuilding className="me-2 table-icon" />
                              <span className="fw-medium">
                                {employer.department?.name || "-"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaPhone className="me-2 table-icon" />
                              <span className="fw-medium">
                                {employer.phone}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaMoneyBillWave className="me-2 table-icon" />
                              <span className="fw-bold">
                                {employer.salary.toLocaleString()} EGP
                              </span>
                            </div>
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-1">
                              <button
                                onClick={() => handleAttend(employer.id)}
                                className="action-btn bg-indigo-100 text-indigo-600"
                                title="Mark attendance"
                              >
                                <FiClock size={18} />
                              </button>
                              <button
                                onClick={() => handleLeave(employer.id)}
                                className="action-btn bg-amber-100 text-amber-600"
                                title="Mark leave"
                              >
                                <FiLogOut size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/employers/${employer.id}/edit`)
                                }
                                className="action-btn bg-cyan-100 text-cyan-600"
                                title="Edit"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/employers/${employer.id}/adjustments`
                                  )
                                }
                                className="action-btn bg-gray-100 text-gray-600"
                                title="Adjustments"
                              >
                                <HiOutlineAdjustments size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(employer.id)}
                                className="action-btn bg-red-100 text-red-600"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
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
                      >
                        <FiChevronLeft size={18} />
                        Previous
                      </button>

                      <div className="d-flex align-items-center">
                        {totalPages > 1 && (
                          <>
                            {currentPage > 3 && (
                              <>
                                <div
                                  className="page-number"
                                  onClick={() => goToPage(1)}
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
                                >
                                  {totalPages}
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                        className="pagination-btn"
                      >
                        Next
                        <FiChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerList;