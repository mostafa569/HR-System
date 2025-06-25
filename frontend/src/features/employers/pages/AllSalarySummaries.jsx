import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllSalarySummaries } from "../services/salaryService";
import {
  FiArrowLeft,
  FiSearch,
  FiPrinter,
  FiDownload,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { FaMoneyBillWave } from "react-icons/fa";

const round = (number, decimals = 2) => {
  return Number(Math.round(number + "e" + decimals) + "e-" + decimals);
};

const AllSalarySummaries = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("year");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [salarySummaries, setSalarySummaries] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

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

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Please login to view salary summaries");
      navigate("/login");
      return;
    }
  }, [navigate]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllSalarySummaries(
        currentPage,
        searchTerm,
        sortBy,
        sortDirection,
        selectedMonth,
        selectedYear,
        "", // department_id - assuming not used for now
        itemsPerPage
      );

      if (response.status === "success") {
        setSalarySummaries(response.data.summaries || []);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.last_page || 1);
        setCurrentPage(response.data.current_page || 1);
      } else {
        throw new Error(response.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching salary summaries:", error);
      setError(error.message || "Failed to fetch data");
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchTerm,
    sortBy,
    sortDirection,
    selectedMonth,
    selectedYear,
    itemsPerPage,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const formatNumber = (number) => {
    if (!number) return "0";
    const num = Number(number);
    if (Number.isInteger(num)) {
      return num.toString();
    }
    return round(num).toString();
  };

  const getMonthIndex = (monthName) => {
    const months = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };
    return months[monthName] || 0;
  };

  const getDaysInMonth = (year, monthName) => {
    const monthIndex = getMonthIndex(monthName);
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const calculateTotal = (items, field) => {
    const total = items.reduce(
      (sum, item) => sum + (Number(item[field]) || 0),
      0
    );
    return formatNumber(total);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary Summaries Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .summary { margin-bottom: 20px; }
            .summary p { margin: 5px 0; }
            @page { size: landscape; margin: 10mm; }
          </style>
        </head>
        <body>
          <h2 style="text-align: center;">Salary Summaries Report</h2>
          
          <div class="summary">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <p><strong>Total Records:</strong> ${totalItems}</p>
                <p><strong>Total Additions:</strong> ${formatNumber(
                  salarySummaries.reduce(
                    (sum, item) => sum + (Number(item.total_additions) || 0),
                    0
                  )
                )} EGP</p>
              </div>
              <div>
                <p><strong>Total Deductions:</strong> ${formatNumber(
                  salarySummaries.reduce(
                    (sum, item) => sum + (Number(item.total_deductions) || 0),
                    0
                  )
                )} EGP</p>
                <p><strong>Total Final Salary:</strong> ${formatNumber(
                  salarySummaries.reduce(
                    (sum, item) => sum + (Number(item.final_salary) || 0),
                    0
                  )
                )} EGP</p>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month</th>
                <th>Year</th>
                <th>Base Salary</th>
                <th>Attendance</th>
                <th>Absent</th>
                
                <th>Additions</th>
                <th> Deductions</th>
                <th>Final Salary</th>
              </tr>
            </thead>
            <tbody>
              ${salarySummaries
                .map(
                  (summary) => `
                <tr>
                  <td>${summary.employer.full_name}</td>
                  <td>${summary.month}</td>
                  <td>${summary.year}</td>
                  <td>${formatNumber(summary.employer.salary)} EGP</td>
                  <td>${summary.attendance_days || 0} days</td>
                  <td>${summary.absent_days || 0} days</td>
                  <td>-${formatNumber(summary.absent_deduction)} EGP</td>
                  <td>+${formatNumber(summary.total_additions)} EGP</td>
                  <td>-${formatNumber(summary.total_deductions)} EGP</td>
                  <td>${formatNumber(summary.final_salary)} EGP</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleExportCSV = () => {
    const headers = [
      "Employee Name",
      "Month",
      "Year",
      "Base Salary",
      "Attendance Days",
      "Absent Days",
      // "Absent Deduction",
      "Additional Hours",
      "Deduction Hours",
      "Total Additions",
      " Deductions",
      "Final Salary",
    ];

    const csvData = salarySummaries.map((summary) => [
      `"${summary.employer.full_name}"`,
      summary.month,
      summary.year,
      summary.employer.salary || 0,
      summary.attendance_days || 0,
      summary.absent_days || 0,
      summary.absent_deduction || 0,
      summary.additions_hours || 0,
      summary.deductions_hours || 0,
      summary.total_additions || 0,
      summary.total_deductions || 0,
      summary.final_salary || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `salary_summaries_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3">Loading salary data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div
          className="alert alert-danger d-flex align-items-center"
          role="alert"
        >
          <div className="flex-shrink-0 me-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
          </div>
          <div>
            <h5 className="alert-heading mb-1">Error loading data</h5>
            <p className="mb-0">{error}</p>
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary btn-sm me-3 d-flex align-items-center"
                  onClick={() => navigate(-1)}
                >
                  <FiArrowLeft className="me-1" />
                  Back
                </button>
                <h5 className="mb-0 fw-semibold">All Salary Summaries</h5>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                  onClick={handleExportCSV}
                  title="Export to CSV"
                >
                  <FiDownload className="me-1" />
                  Export
                </button>
                <button
                  className="btn btn-primary btn-sm d-flex align-items-center"
                  onClick={handlePrint}
                  title="Print Report"
                >
                  <FiPrinter className="me-1" />
                  Print
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Filters */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body py-3">
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="form-label small text-muted">
                            Month
                          </label>
                          <select
                            className="form-select form-select-sm"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                          >
                            <option value="">All Months</option>
                            {months.map((month) => (
                              <option key={month} value={month}>
                                {month}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small text-muted">
                            Year
                          </label>
                          <select
                            className="form-select form-select-sm"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                          >
                            <option value="">All Years</option>
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small text-muted">
                            Search
                          </label>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text bg-white">
                              <FiSearch className="text-muted" />
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search by name, month or year..."
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                              }}
                            />
                            {searchTerm && (
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                  setSearchTerm("");
                                  setCurrentPage(1);
                                }}
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body py-2">
                      <div className="d-flex flex-wrap justify-content-between">
                        <div className="d-flex align-items-center me-3 mb-2 mb-md-0">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-2">
                            <FaMoneyBillWave
                              className="text-primary"
                              size={18}
                            />
                          </div>
                          <div>
                            <small className="text-muted d-block">
                              Total Records
                            </small>
                            <span className="fw-semibold">{totalItems}</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center me-3 mb-2 mb-md-0">
                          <div className="bg-success bg-opacity-10 p-2 rounded me-2">
                            <FaMoneyBillWave
                              className="text-success"
                              size={18}
                            />
                          </div>
                          <div>
                            <small className="text-muted d-block">
                              Total Additions
                            </small>
                            <span className="fw-semibold">
                              {calculateTotal(
                                salarySummaries,
                                "total_additions"
                              )}{" "}
                              EGP
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center me-3 mb-2 mb-md-0">
                          <div className="bg-danger bg-opacity-10 p-2 rounded me-2">
                            <FaMoneyBillWave
                              className="text-danger"
                              size={18}
                            />
                          </div>
                          <div>
                            <small className="text-muted d-block">
                              Deductions
                            </small>
                            <span className="fw-semibold">
                              {calculateTotal(
                                salarySummaries,
                                "total_deductions"
                              )}{" "}
                              EGP
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-2">
                            <FaMoneyBillWave
                              className="text-primary"
                              size={18}
                            />
                          </div>
                          <div>
                            <small className="text-muted d-block">
                              Total Final Salary
                            </small>
                            <span className="fw-semibold">
                              {calculateTotal(salarySummaries, "final_salary")}{" "}
                              EGP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Summary Table */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th
                            className="ps-4 cursor-pointer"
                            onClick={() => handleSort("full_name")}
                          >
                            <div className="d-flex align-items-center">
                              Employee
                              {sortBy === "full_name" && (
                                <span className="ms-1">
                                  {sortDirection === "asc" ? (
                                    <FiChevronUp />
                                  ) : (
                                    <FiChevronDown />
                                  )}
                                </span>
                              )}
                            </div>
                          </th>
                          <th
                            className="cursor-pointer"
                            onClick={() => handleSort("month")}
                          >
                            <div className="d-flex align-items-center">
                              Month
                              {sortBy === "month" && (
                                <span className="ms-1">
                                  {sortDirection === "asc" ? (
                                    <FiChevronUp />
                                  ) : (
                                    <FiChevronDown />
                                  )}
                                </span>
                              )}
                            </div>
                          </th>
                          <th
                            className="cursor-pointer"
                            onClick={() => handleSort("year")}
                          >
                            <div className="d-flex align-items-center">
                              Year
                              {sortBy === "year" && (
                                <span className="ms-1">
                                  {sortDirection === "asc" ? (
                                    <FiChevronUp />
                                  ) : (
                                    <FiChevronDown />
                                  )}
                                </span>
                              )}
                            </div>
                          </th>
                          <th className="text-end">Base Salary</th>
                          <th className="text-center">Attendance</th>
                          <th className="text-center">Absent</th>
                          <th className="text-end">Additions</th>
                          <th className="text-end"> Deductions</th>
                          <th className="text-end pe-4">Final Salary</th>
                        </tr>
                      </thead>
                      <tbody id="printable-content">
                        {salarySummaries.length > 0 ? (
                          salarySummaries.map((summary) => (
                            <tr
                              key={`${summary.employer_id}-${summary.year}-${summary.month}`}
                            >
                              <td className="ps-4 fw-semibold">
                                {summary.employer.full_name}
                              </td>
                              <td>{summary.month}</td>
                              <td>{summary.year}</td>
                              <td className="text-end">
                                <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                  {summary.employer.salary?.toLocaleString() ||
                                    0}{" "}
                                  EGP
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-success bg-opacity-10 text-success">
                                  {summary.attendance_days || 0} days
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-danger bg-opacity-10 text-danger">
                                  {summary.absent_days || 0} days
                                </span>
                              </td>
                              <td className="text-end text-success fw-semibold">
                                +
                                {summary.total_additions?.toLocaleString() || 0}{" "}
                                EGP
                              </td>
                              <td className="text-end text-danger fw-semibold">
                                -
                                {summary.total_deductions?.toLocaleString() ||
                                  0}{" "}
                                EGP
                              </td>
                              <td className="text-end pe-4">
                                <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">
                                  {Number(
                                    summary.final_salary
                                  ).toLocaleString()}{" "}
                                  EGP
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="9"
                              className="text-center py-4 text-muted"
                            >
                              No salary records found matching your criteria
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Data Update Notice */}
              <div className="alert alert-info py-2 mb-3" role="alert">
                <small className="d-flex align-items-center">
                  <i className="bi bi-info-circle me-2"></i>
                  Note: The displayed data may not be up to date. You should
                  calculate each employer first
                </small>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted small">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                    {totalItems} records
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          &laquo;
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li
                          key={index + 1}
                          className={`page-item ${
                            currentPage === index + 1 ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                  <div className="d-flex align-items-center">
                    <label
                      htmlFor="itemsPerPage"
                      className="form-label me-2 mb-0 small"
                    >
                      Items
                    </label>
                    <select
                      id="itemsPerPage"
                      className="form-select form-select-sm"
                      style={{ width: "70px" }}
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllSalarySummaries;
