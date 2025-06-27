import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HolidayEditForm = ({ holiday, onClose, onUpdated, holidays = [] }) => {
  const defaultHoliday = {
    id: null,
    name: "",
    date: "",
    day: "",
    type: "official",
  };

  const [form, setForm] = useState(holiday || defaultHoliday);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(!holiday);
  const [allHolidays, setAllHolidays] = useState(holidays);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const types = ["official", "weekly"];

  const getDayFromDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return daysOfWeek[date.getDay()];
  };

  const isNameRequired = (type) => {
    return type === "official";
  };

  const fetchHolidays = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch("http://127.0.0.1:8000/api/holidays", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch holidays");
      const data = await response.json();
      setAllHolidays(data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Failed to load holidays");
    }
  };

  useEffect(() => {
    if (allHolidays.length === 0) {
      fetchHolidays();
    }
  }, []);

  useEffect(() => {
    if (holiday) {
      const updatedHoliday = { ...holiday };
      if (updatedHoliday.date) {
        updatedHoliday.day = getDayFromDate(updatedHoliday.date);
      }
      setForm(updatedHoliday);
      setIsCreateMode(false);
    } else {
      setForm(defaultHoliday);
      setIsCreateMode(true);
    }
  }, [holiday]);

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar-wrapper");
    if (sidebar) {
      sidebar.style.display = "none";
    }

    return () => {
      if (sidebar) {
        sidebar.style.display = "block";
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form };

    if (name === "date") {
      const dayName = getDayFromDate(value);
      updatedForm = { ...updatedForm, date: value, day: dayName };
    } else if (name === "type") {
      updatedForm = { ...updatedForm, type: value };
      if (value === "weekly") {
        updatedForm.name = "";
      } else if (value === "official" && (!form.name || !form.name.trim())) {
        updatedForm.name = "";
      }
      setError("");
    } else if (name === "name") {
      updatedForm.name = value;
      if (form.type === "official" && value.trim()) {
        setError("");
      }
    } else {
      updatedForm = { ...updatedForm, [name]: value };
    }

    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const holidayData = { ...form };
    if (isCreateMode) {
      delete holidayData.id;
    }

    try {
      const token = localStorage.getItem("userToken");
      const url = isCreateMode
        ? "http://127.0.0.1:8000/api/holidays"
        : `http://127.0.0.1:8000/api/holidays/${form.id}`;

      const response = await fetch(url, {
        method: isCreateMode ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(holidayData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          toast.error(data.message || "A holiday already exists on this date");
        } else {
          throw new Error(data.message || "Failed to save holiday");
        }
        return;
      }

      toast.success(
        isCreateMode
          ? "Holiday created successfully"
          : "Holiday updated successfully"
      );
      onUpdated();
    } catch (error) {
      console.error("Error saving holiday:", error);
      toast.error(error.message || "Failed to save holiday");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (holidayId) => {
    if (!window.confirm("Are you sure you want to delete this holiday?"))
      return;

    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(
        `http://127.0.0.1:8000/api/holidays/${holidayId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete holiday");

      setSuccess("Holiday deleted successfully");
      fetchHolidays();
      if (form.id === holidayId) handleClose();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      setError("Failed to delete holiday");
    }
  };

  const handleEditHoliday = (holiday) => {
    const updatedHoliday = { ...holiday };
    if (updatedHoliday.date) {
      updatedHoliday.day = getDayFromDate(updatedHoliday.date);
    }
    setForm(updatedHoliday);
    setIsCreateMode(false);
    setError("");
  };

  const handleClose = () => {
    setError("");
    setSuccess(null);
    if (onClose) onClose();
  };

  const handleResetSearch = () => {
    setSearchTerm("");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) handleClose();
  };

  const filteredHolidays = allHolidays.filter((holiday) =>
    (holiday.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFormValid = () => {
    if (!form.date || !form.type) return false;
    if (form.type === "official" && (!form.name || !form.name.trim()))
      return false;
    return true;
  };

  return (
    <div className="holiday-edit-modal-overlay" onClick={handleBackdropClick}>
      <div className="holiday-edit-modal-container">
        <div className="holiday-edit-modal-content">
          {/* Header */}
          <div className="holiday-edit-modal-header">
            <div className="holiday-edit-header-content">
              <div className="holiday-edit-header-icon">📅</div>
              <div>
                <h2 className="holiday-edit-modal-title">
                  {isCreateMode ? "Create Holiday" : "Edit Holiday"}
                </h2>
                <p className="holiday-edit-modal-subtitle">
                  {isCreateMode
                    ? "Add a new holiday to the system"
                    : "Manage holiday details and settings"}
                </p>
              </div>
            </div>
            <button
              className="holiday-edit-close-button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          {/* Form section */}
          <div className="holiday-edit-form-section">
            {error && (
              <div className="holiday-edit-error-alert" role="alert">
                <span className="holiday-edit-error-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="holiday-edit-success-alert" role="alert">
                <span className="holiday-edit-success-icon">✅</span>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="holiday-edit-form">
              <div className="holiday-edit-form-group">
                <label className="holiday-edit-form-label">
                  Name <span className="holiday-edit-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={`holiday-edit-form-input ${
                    form.type === "official" &&
                    (!form.name || !form.name.trim())
                      ? "holiday-edit-error-field"
                      : ""
                  }`}
                  value={form.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder={
                    form.type === "official"
                      ? "Enter holiday name (required)"
                      : "Enter holiday name (optional for weekly holidays)"
                  }
                />
                <div
                  className={`holiday-edit-field-help ${
                    form.type === "official" &&
                    (!form.name || !form.name.trim())
                      ? "holiday-edit-field-help-error"
                      : ""
                  }`}
                >
                  <span className="holiday-edit-help-icon">
                    {form.type === "official"
                      ? form.name && form.name.trim()
                        ? "✅"
                        : "⚠️"
                      : "💡"}
                  </span>
                  <span className="holiday-edit-help-text">
                    {form.type === "official"
                      ? form.name && form.name.trim()
                        ? "Valid holiday name provided"
                        : "Name is required for official holidays"
                      : "Weekly holidays can be left unnamed"}
                  </span>
                </div>
              </div>

              <div className="holiday-edit-form-row">
                <div className="holiday-edit-form-group">
                  <label className="holiday-edit-form-label">
                    Date <span className="holiday-edit-required">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="holiday-edit-form-input"
                    value={form.date}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="holiday-edit-form-group">
                  <label className="holiday-edit-form-label">Day</label>
                  <div className="holiday-edit-day-display">
                    <input
                      type="text"
                      name="day"
                      className="holiday-edit-form-input holiday-edit-day-locked"
                      value={
                        form.day ||
                        (form.date
                          ? getDayFromDate(form.date)
                          : "Select date first")
                      }
                      disabled={true}
                      readOnly
                    />
                    <div className="holiday-edit-day-info">
                      <span className="holiday-edit-day-info-icon">🔒</span>
                      <span className="holiday-edit-day-info-text">
                        Auto-determined by selected date
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="holiday-edit-form-group">
                <label className="holiday-edit-form-label">
                  Type <span className="holiday-edit-required">*</span>
                </label>
                <select
                  name="type"
                  className="holiday-edit-form-select"
                  value={form.type}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="official">Official Holiday</option>
                  <option value="weekly">Weekly Holiday</option>
                </select>
                <div className="holiday-edit-field-help">
                  <span className="holiday-edit-help-icon">ℹ️</span>
                  <span className="holiday-edit-help-text">
                    {form.type === "official"
                      ? "Official holidays require a name"
                      : "Weekly holidays can be unnamed"}
                  </span>
                </div>
              </div>

              <div className="holiday-edit-form-actions">
                <button
                  type="button"
                  className="holiday-edit-btn holiday-edit-btn-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="holiday-edit-btn holiday-edit-btn-primary"
                  disabled={isSubmitting || !isFormValid()}
                >
                  {isSubmitting ? (
                    <>
                      <span className="holiday-edit-spinner"></span>
                      {isCreateMode ? "Creating..." : "Updating..."}
                    </>
                  ) : isCreateMode ? (
                    "Create Holiday"
                  ) : (
                    "Update Holiday"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .holiday-edit-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          overflow-y: auto;
        }

        .holiday-edit-modal-container {
          width: 100%;
          max-width: 600px;
          height: auto;
          max-height: 87vh;
          display: flex;
          justify-content: center;
          margin-top: 100px;
        }

        .holiday-edit-modal-content {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          width: 100%;
          height: auto;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .holiday-edit-modal-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 1rem 1rem 0 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .holiday-edit-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .holiday-edit-header-icon {
          font-size: 2rem;
          opacity: 0.9;
        }

        .holiday-edit-modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          margin-bottom: 0.5rem;
        }

        .holiday-edit-modal-subtitle {
          font-size: 0.9rem;
          opacity: 0.9;
          margin: 0;
        }

        .holiday-edit-close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .holiday-edit-close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .holiday-edit-form-section {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .holiday-edit-form {
          max-width: 100%;
          margin: 0 auto;
        }

        .holiday-edit-form-group {
          margin-bottom: 1.5rem;
        }

        .holiday-edit-form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .holiday-edit-form-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .holiday-edit-form-input,
        .holiday-edit-form-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          background: white;
        }

        .holiday-edit-form-input:focus,
        .holiday-edit-form-select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .holiday-edit-form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .holiday-edit-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .holiday-edit-btn-primary {
          background: #3498db;
          color: white;
        }

        .holiday-edit-btn-primary:hover {
          background: #2980b9;
        }

        .holiday-edit-btn-secondary {
          background: #e9ecef;
          color: #2c3e50;
        }

        .holiday-edit-btn-secondary:hover {
          background: #dee2e6;
        }

        .holiday-edit-error-alert,
        .holiday-edit-success-alert {
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .holiday-edit-error-alert {
          background: #fff5f5;
          color: #e53e3e;
          border: 1px solid #fed7d7;
        }

        .holiday-edit-success-alert {
          background: #f0fff4;
          color: #38a169;
          border: 1px solid #c6f6d5;
        }

        .holiday-edit-field-help {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #6c757d;
        }

        .holiday-edit-field-help-error {
          color: #e53e3e;
        }

        .holiday-edit-day-display {
          position: relative;
        }

        .holiday-edit-day-locked {
          background: #f8f9fa !important;
          color: #495057 !important;
          border-color: #dee2e6 !important;
          cursor: not-allowed;
        }

        .holiday-edit-day-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #6c757d;
        }

        .holiday-edit-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .holiday-edit-modal-overlay {
            padding: 0.5rem;
          }

          .holiday-edit-modal-header {
            padding: 1rem;
          }

          .holiday-edit-form-section {
            padding: 1rem;
          }

          .holiday-edit-form-row {
            grid-template-columns: 1fr;
          }

          .holiday-edit-form-actions {
            flex-direction: column;
          }

          .holiday-edit-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .holiday-edit-modal-header {
            padding: 0.75rem;
          }

          .holiday-edit-header-icon {
            font-size: 1.5rem;
          }

          .holiday-edit-modal-title {
            font-size: 1.25rem;
          }

          .holiday-edit-modal-subtitle {
            font-size: 0.8rem;
          }

          .holiday-edit-form-section {
            padding: 0.75rem;
          }

          .holiday-edit-form-group {
            margin-bottom: 1rem;
          }

          .holiday-edit-form-input,
          .holiday-edit-form-select {
            padding: 0.5rem 0.75rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HolidayEditForm;