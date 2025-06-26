import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSalarySummary } from "../services/salaryService";
import { getEmployer } from "../services/employerService";
import {
  FaUserTie,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaClock,
  FaSignOutAlt,
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaFilter,
  FaPrint,
  FaFileCsv,
  FaFileExport,
  FaSearch,
} from "react-icons/fa";
import { FiDownload } from "react-icons/fi";

const round = (number) => Math.round(number * 100) / 100;

const SalarySummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employer, setEmployer] = useState(null);
  const [salarySummaries, setSalarySummaries] = useState([]);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  const printRef = useRef();

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
    const fetchData = async () => {
      try {
        if (!id) {
          throw new Error("Employee ID is required");
        }

        setLoading(true);
        setError(null);

        const response = await getSalarySummary(id);
        if (response.status === "success") {
          setEmployer(response.data.employer);
          const summaries = (response.data.summaries || []).map((summary) => {
            return {
              ...summary,
              final_salary: round(summary.final_salary || 0),
              total_deductions: round(summary.total_deductions || 0),
              absent_deduction: round(summary.absent_deduction || 0),
            };
          });
          setSalarySummaries(summaries);
        } else {
          throw new Error(response.message || "Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch data");
        toast.error(error.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, employer?.salary]);

  const filteredSummaries = (salarySummaries || []).filter((summary) => {
    const matchesMonth = !selectedMonth || summary.month === selectedMonth;
    const matchesYear =
      !selectedYear || summary.year === parseInt(selectedYear);
    const matchesSearch =
      !searchTerm ||
      summary.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.year.toString().includes(searchTerm);
    return matchesMonth && matchesYear && matchesSearch;
  });

  const totalPages = Math.ceil(filteredSummaries.length / itemsPerPage);
  const paginatedSummaries = filteredSummaries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
 
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrint = () => {
    const printContents =
      document.getElementById("printable-content").innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
      <div class="container py-1">
        <h2 class="text-center mb-4">Salary Summary Report</h2>
       
        ${printContents}
      </div>
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        "ID",
        "Employer ID",
        "Month",
        "Year",
        "Attendance Days",
        "Absent Days",
        "Additions Hours",
        "Deductions Hours",
        "Total Additions",
        "Deductions",
        "Absent Deduction",
        "Final Salary",
      ];

      const csvData = filteredSummaries.map((summary) => [
        summary.id,
        summary.employer_id,
        summary.month,
        summary.year,
        summary.attendance_days || 0,
        summary.absent_days || 0,
        summary.additions_hours || 0,
        summary.deductions_hours || 0,
        summary.total_additions || 0,
        summary.total_deductions || 0,
        summary.absent_deduction || 0,
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
        `salary_summary_${employer.full_name}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-grow text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading salary data...</p>
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
          <div className="flex-shrink-0 me-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-exclamation-triangle-fill"
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
        <button
          className="btn btn-outline-primary mt-3"
          onClick={() => window.location.reload()}
        >
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
                  <FaArrowLeft className="me-1" />
                  Back
                </button>
                <h5 className="mb-0 fw-semibold">Salary Summary</h5>
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
                  <FaPrint className="me-1" />
                  Print
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Employee Info Card */}
              <div className="row mb-4" id="printable-content">
                <div className="col-md-6 mb-3 mb-md-0">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                          <FaUserTie className="text-primary" size={20} />
                        </div>
                        <h6 className="mb-0 text-muted fw-semibold">
                          Employee Information
                        </h6>
                      </div>
                      <div className="mb-2">
                        <div className="d-flex justify-content-between py-2 border-bottom">
                          <span className="text-muted">Name:</span>
                          <span className="fw-semibold">
                            {employer?.full_name}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between py-2 border-bottom">
                          <span className="text-muted">ID:</span>
                          <span>{employer?.id}</span>
                        </div>
                        <div className="d-flex justify-content-between py-2 border-bottom">
                          <span className="text-muted">Department:</span>
                          <span className="fw-semibold">
                            {employer?.department_name || "-"}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between py-2">
                          <span className="text-muted">Base Salary:</span>
                          <span className="fw-semibold">
                            {employer?.salary?.toLocaleString() || "0"} EGP
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                          <FaMoneyBillWave className="text-success" size={20} />
                        </div>
                        <h6 className="mb-0 text-muted fw-semibold">
                          Salary Overview
                        </h6>
                      </div>
                      {paginatedSummaries.length > 0 ? (
                        <>
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted">Period:</span>
                              <span className="fw-semibold">
                                {paginatedSummaries[0]?.month}{" "}
                                {paginatedSummaries[0]?.year}
                              </span>
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="d-flex justify-content-between py-2 border-bottom">
                              <span className="text-muted">Base Salary:</span>
                              <span className="fw-semibold">
                                {employer?.salary?.toLocaleString() || "0"} EGP
                              </span>
                            </div>
                            <div className="d-flex justify-content-between py-2 border-bottom">
                              <span className="text-muted">
                                Total Additions:
                              </span>
                              <span className="text-success fw-semibold">
                                +
                                {paginatedSummaries[0]?.total_additions?.toLocaleString() ||
                                  "0"}{" "}
                                EGP
                              </span>
                            </div>
                            <div className="d-flex justify-content-between py-2 border-bottom">
                              <span className="text-muted">
                                 Deductions:
                              </span>
                              <span className="text-danger fw-semibold">
                                -
                                {paginatedSummaries[0]?.total_deductions?.toLocaleString() ||
                                  "0"}{" "}
                                EGP
                              </span>
                            </div>
                            <div className="d-flex justify-content-between py-2 border-bottom">
                              <span className="text-muted">Absent Days:</span>
                              <span className="text-danger">
                                {paginatedSummaries[0]?.absent_days || "0"} days
                              </span>
                            </div>
                            <div className="d-flex justify-content-between py-2 border-bottom">
                              <span className="text-muted">
                                Overtime Hours:
                              </span>
                              <span className="text-info">
                                {paginatedSummaries[0]?.additions_hours || "0"}{" "}
                                hours
                              </span>
                            </div>
                            <div className="d-flex justify-content-between py-2 border-bottom">
                              <span className="text-muted">
                                Deduction Hours:
                              </span>
                              <span className="text-danger">
                                {paginatedSummaries[0]?.deductions_hours || "0"}{" "}
                                hours
                              </span>
                            </div>
                            <div className="d-flex justify-content-between py-2">
                              <span className="text-muted">
                                Absent Deduction:
                              </span>
                              <span className="text-danger fw-semibold">
                                -
                                {paginatedSummaries[0]?.absent_deduction?.toLocaleString() ||
                                  "0"}{" "}
                                EGP
                              </span>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between mt-3 pt-2 border-top">
                            <span className="fw-bold">Final Salary:</span>
                            <span className="fw-bold text-primary fs-5">
                              {paginatedSummaries[0]?.final_salary?.toLocaleString() ||
                                "0"}{" "}
                              EGP
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4 text-muted">
                          No salary data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body py-3">
                      <div className="row g-3">
                        <div className="col-md-4">
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
                        <div className="col-md-4">
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
                        <div className="col-md-4">
                          <label className="form-label small text-muted">
                            Search
                          </label>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text bg-white">
                              <FaSearch className="text-muted" />
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
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
                          <th className="ps-4">Employee</th>
                          <th>Month</th>
                          <th>Year</th>
                          <th className="text-end">Base Salary</th>
                          <th className="text-center">Attendance</th>
                          <th className="text-center">Absent</th>
                          <th className="text-center">Overtime</th>
                          <th className="text-center">Deduction Hours</th>
                          <th className="text-end">Additions</th>
                          <th className="text-end">Absent Deduction</th>
                          <th className="text-end"> Deductions</th>
                          <th className="text-end pe-4">Final Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSummaries.length > 0 ? (
                          paginatedSummaries.map((summary) => (
                            <tr key={`${summary.year}-${summary.month}`}>
                              <td className="ps-4 fw-semibold">
                                {employer?.full_name}
                              </td>
                              <td>{summary.month}</td>
                              <td>{summary.year}</td>
                              <td className="text-end">
                                <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                  {employer?.salary?.toLocaleString() || 0} EGP
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
                              <td className="text-center">
                                <span className="badge bg-info bg-opacity-10 text-info">
                                  {summary.additions_hours || 0} hours
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-danger bg-opacity-10 text-danger">
                                  {summary.deductions_hours || 0} hours
                                </span>
                              </td>
                              <td className="text-end text-success fw-semibold">
                                +
                                {summary.total_additions?.toLocaleString() || 0}{" "}
                                EGP
                              </td>
                              <td className="text-end text-danger fw-semibold">
                                -
                                {summary.absent_deduction?.toLocaleString() ||
                                  0}{" "}
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
                                  {summary.final_salary?.toLocaleString() || 0}{" "}
                                  EGP
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="10"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted small">
                    Showing {paginatedSummaries.length} of{" "}
                    {filteredSummaries.length} records
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalarySummary;
