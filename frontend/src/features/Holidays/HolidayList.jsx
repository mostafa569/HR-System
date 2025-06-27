import React, { useEffect, useState } from "react";
import HolidayEditForm from "./HolidayEditForm";

const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchMonth, setSearchMonth] = useState("");
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const months = [
    { value: "", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const API_URL = "http://127.0.0.1:8000/api";

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("userToken");

      const response = await fetch(`${API_URL}/holidays`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setError("Failed to fetch holidays. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this holiday?")) {
      return;
    }

    try {
      const token = localStorage.getItem("userToken");

      const response = await fetch(`${API_URL}/holidays/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 204 || response.status === 200) {
          await fetchHolidays();
          return;
        }

        let errorMessage = `Failed to delete holiday (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // No JSON response
        }
        throw new Error(errorMessage);
      }

      try {
        const result = await response.json();
        console.log("Delete successful:", result);
      } catch {
        // No response body
      }

      await fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      setError(error.message || "Failed to delete holiday");
      setTimeout(() => setError(""), 5000);
    }
  };

  const resetNameSearch = () => {
    setSearchName("");
  };

  const resetMonthSearch = () => {
    setSearchMonth("");
  };

  const filteredHolidays = holidays?.filter((h) => {
    if (!h) return false;
    if (!h.name && h.type !== "weekly") return false;

    const matchesName = searchName
      ? (h.name || "").toLowerCase().includes(searchName.toLowerCase())
      : true;
    const matchesMonth = searchMonth
      ? h.date?.startsWith(`2025-${searchMonth}`)
      : true;

    let matchesFilter = true;
    switch (activeFilter) {
      case "official":
        matchesFilter = h.type === "official";
        break;
      case "weekly":
        matchesFilter = h.type === "weekly";
        break;
      case "upcoming":
        matchesFilter = new Date(h.date) > new Date();
        break;
      case "all":
      default:
        matchesFilter = true;
        break;
    }

    return matchesName && matchesMonth && matchesFilter;
  }) || [];

  const handleFilterClick = (filterType) => {
    if (activeFilter === filterType) {
      setActiveFilter("all");
    } else {
      setActiveFilter(filterType);
    }
  };

  const totalHolidays = holidays?.length || 0;
  const officialHolidays =
    holidays?.filter((h) => h?.type === "official").length || 0;
  const weeklyHolidays =
    holidays?.filter((h) => h?.type === "weekly").length || 0;
  const upcomingHolidays =
    holidays?.filter((h) => h?.date && new Date(h.date) > new Date()).length ||
    0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleModalClose = () => {
    setEditingHoliday(null);
    setShowCreateModal(false);
  };

  const handleModalUpdated = async () => {
    await fetchHolidays();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="holiday-dashboard">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading holidays...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .holiday-dashboard {
          background-color: #f8f9fa;
          min-height: 100vh;
          padding: 2rem 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .holiday-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 15px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .holiday-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .error-alert {
          background: #ffebee;
          color: #d32f2f;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border: 1px solid #ffcdd2;
        }

        .error-icon {
          font-size: 1.25rem;
        }

        .holiday-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
          position: relative;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .stat-card.active {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
        }

        .stat-card.active .stat-number {
          color: white;
        }

        .stat-card.active .stat-label {
          color: rgba(255, 255, 255, 0.9);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #667eea;
          margin: 0;
          transition: color 0.3s ease;
        }

        .stat-label {
          color: #6c757d;
          font-size: 0.9rem;
          margin-top: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: color 0.3s ease;
        }

        .search-section {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }

        .search-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .search-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .search-input-container {
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 1rem 3rem 1rem 1.5rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #f8f9fa;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-input-container select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1.5rem center;
          background-size: 1rem;
        }

        .search-clear-btn {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: #667eea;
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.2rem;
        }

        .search-clear-btn:hover {
          background: #5a67d8;
          transform: translateY(-50%) scale(1.1);
        }

        .holidays-grid {
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .holidays-header {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .holidays-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .filter-indicator {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .add-holiday-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .add-holiday-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          color: white;
          transform: translateY(-2px);
        }

        .holiday-item {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #f1f3f4;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .holiday-item:hover {
          background: #f8f9fa;
        }

        .holiday-item:last-child {
          border-bottom: none;
        }

        .holiday-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .holiday-date-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          text-align: center;
          min-width: 80px;
          font-weight: 600;
        }

        .holiday-date-day {
          font-size: 1.5rem;
          line-height: 1;
        }

        .holiday-date-month {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .holiday-details {
          flex: 1;
        }

        .holiday-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .holiday-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
          color: #6c757d;
          font-size: 0.9rem;
          flex-wrap: wrap;
        }

        .holiday-type-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .holiday-type-official {
          background: #e3f2fd;
          color: #1976d2;
        }

        .holiday-type-weekly {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .holiday-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-edit {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .btn-edit:hover {
          background: #ffeaa7;
          transform: translateY(-2px);
        }

        .btn-delete {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .btn-delete:hover {
          background: #f5c6cb;
          transform: translateY(-2px);
        }

        .no-holidays {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }

        .no-holidays-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-holidays-text {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .no-holidays-subtext {
          color: #adb5bd;
        }

        @media (max-width: 768px) {
          .holiday-dashboard {
            padding: 1rem 0;
          }

          .container {
            padding: 0 0.75rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .holiday-header h1 {
            font-size: 2rem;
          }

          .search-row {
            grid-template-columns: 1fr;
          }

          .holiday-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .holiday-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            width: 100%;
          }

          .holiday-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .holidays-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="holiday-dashboard">
        <div className="container">
          {/* Header */}
          <div className="holiday-header">
            <div className="header-content">
              <h1>Holiday Manager</h1>
              <button
                className="add-holiday-btn"
                onClick={() => setShowCreateModal(true)}
              >
                <span>+</span>
                Add New Holiday
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Statistics Cards - Now Clickable */}
          <div className="holiday-stats">
            <div
              className={`stat-card ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => handleFilterClick("all")}
            >
              <div className="stat-number">{totalHolidays}</div>
              <div className="stat-label">Total Holidays</div>
            </div>
            <div
              className={`stat-card ${
                activeFilter === "official" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("official")}
            >
              <div className="stat-number">{officialHolidays}</div>
              <div className="stat-label">Official Holidays</div>
            </div>
            <div
              className={`stat-card ${
                activeFilter === "weekly" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("weekly")}
            >
              <div className="stat-number">{weeklyHolidays}</div>
              <div className="stat-label">Weekly Holidays</div>
            </div>
            <div
              className={`stat-card ${
                activeFilter === "upcoming" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("upcoming")}
            >
              <div className="stat-number">{upcomingHolidays}</div>
              <div className="stat-label">Upcoming</div>
            </div>
          </div>

          {/* Search Section */}
          <div className="search-section">
            <div className="search-title">🔍 Search & Filter Holidays</div>
            <div className="search-row">
              <div className="search-input-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by holiday name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                {searchName && (
                  <button
                    className="search-clear-btn"
                    onClick={resetNameSearch}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="search-input-container">
                <select
                  className="search-input"
                  value={searchMonth}
                  onChange={(e) => setSearchMonth(e.target.value)}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                {searchMonth && (
                  <button
                    className="search-clear-btn"
                    onClick={resetMonthSearch}
                    title="Clear month filter"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Holidays List */}
          <div className="holidays-grid">
            <div className="holidays-header">
              <h3 className="holidays-title">
                📅 Holidays ({filteredHolidays.length})
              </h3>
              {activeFilter !== "all" && (
                <div className="filter-indicator">
                  Filtered by: {activeFilter}
                </div>
              )}
            </div>

            {filteredHolidays.length > 0 ? (
              filteredHolidays.map((holiday) => {
                const date = new Date(holiday.date);
                const day = date.getDate();
                const month = date.toLocaleDateString("en-US", {
                  month: "short",
                });

                return (
                  <div key={holiday.id} className="holiday-item">
                    <div className="holiday-info">
                      <div className="holiday-date-badge">
                        <div className="holiday-date-day">{day}</div>
                        <div className="holiday-date-month">{month}</div>
                      </div>

                      <div className="holiday-details">
                        <h4 className="holiday-name">{holiday.name}</h4>
                        <div className="holiday-meta">
                          <span>📅 {formatDate(holiday.date)}</span>
                          <span>📆 {holiday.day}</span>
                          <span
                            className={`holiday-type-badge holiday-type-${holiday.type}`}
                          >
                            {holiday.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="holiday-actions">
                      <button
                        className="action-btn btn-edit"
                        onClick={() => setEditingHoliday(holiday)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="action-btn btn-delete"
                        onClick={() => handleDelete(holiday.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-holidays">
                <div className="no-holidays-icon">📅</div>
                <div className="no-holidays-text">No holidays found</div>
                <div className="no-holidays-subtext">
                  {holidays.length === 0
                    ? "Start by adding your first holiday!"
                    : activeFilter !== "all"
                    ? `No ${activeFilter} holidays match your criteria`
                    : "Try adjusting your search criteria"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingHoliday && (
        <HolidayEditForm
          holiday={editingHoliday}
          holidays={holidays}
          onClose={handleModalClose}
          onUpdated={handleModalUpdated}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <HolidayEditForm
          holiday={null}
          holidays={holidays}
          onClose={handleModalClose}
          onUpdated={handleModalUpdated}
        />
      )}
    </>
  );
};

export default HolidayList;