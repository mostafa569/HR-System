import React, { useState, useEffect } from "react";

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

    // Function to get day name from date
    const getDayFromDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return daysOfWeek[date.getDay()];
    };

    // Function to check if name is required based on type
    const isNameRequired = (type) => {
        return type === "official";
    };

    // Fetch holidays from Laravel API
    const fetchHolidays = async () => {
        try {
            const response = await fetch("/api/holidays", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAllHolidays(data);
        } catch (error) {
            console.error("Error fetching holidays:", error);
            setError("Failed to fetch holidays");
        }
    };

    // Initial fetch
    useEffect(() => {
        if (allHolidays.length === 0) {
            fetchHolidays();
        }
    }, []);

    // Update form when holiday prop changes
    useEffect(() => {
        if (holiday) {
            const updatedHoliday = { ...holiday };
            // Ensure day matches the date
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedForm = { ...form };

        if (name === "date") {
            // When date changes, automatically update the day and lock it
            const dayName = getDayFromDate(value);
            updatedForm = { ...updatedForm, date: value, day: dayName };
        } else if (name === "type") {
            // When type changes
            updatedForm = { ...updatedForm, type: value };

            // Handle name field based on type
            if (value === "weekly") {
                // If changing to weekly, name becomes optional
                updatedForm.name = ""; // Clear name for weekly holidays
            } else if (
                value === "official" &&
                (!form.name || !form.name.trim())
            ) {
                // If changing to official and name is empty, keep it empty but show validation
                updatedForm.name = "";
            }

            // Clear any existing error when type changes
            setError("");
        } else if (name === "name") {
            // For name field, trim the value and handle empty strings
            const trimmedValue = value.trim();
            updatedForm.name = value;

            // Clear error if we have a valid name for official holidays
            if (form.type === "official" && trimmedValue) {
                setError("");
            }
        } else {
            // For other fields, update normally
            updatedForm = { ...updatedForm, [name]: value };
        }

        setForm(updatedForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            // Validate required fields
            if (!form.date) {
                throw new Error("Date is required");
            }

            if (!form.type) {
                throw new Error("Type is required");
            }

            // Validate name for official holidays
            if (form.type === "official" && (!form.name || !form.name.trim())) {
                throw new Error(
                    "Holiday name is required for official holidays"
                );
            }

            // Ensure day is correct before submission
            const finalForm = {
                ...form,
                day: getDayFromDate(form.date),
            };

            // Prepare the holiday data
            const holidayData = {
                name:
                    form.type === "weekly" && (!form.name || !form.name.trim())
                        ? null
                        : form.name.trim(),
                date: finalForm.date,
                day: finalForm.day,
                type: finalForm.type,
            };

            let response;

            if (isCreateMode) {
                // Create new holiday
                response = await fetch("/api/holidays", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(holidayData),
                });
            } else {
                // Update existing holiday
                response = await fetch(`/api/holidays/${form.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(holidayData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        errorData.error ||
                        "Failed to save holiday"
                );
            }

            // Refresh the holidays list
            await fetchHolidays();
            if (onUpdated) onUpdated();
            handleClose();
        } catch (error) {
            console.error("Error saving holiday:", error);
            setError(error.message || "Failed to save holiday");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (holidayId) => {
        if (!confirm("Are you sure you want to delete this holiday?")) {
            return;
        }

        try {
            const response = await fetch(`/api/holidays/${holidayId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to delete holiday"
                );
            }

            // Refresh the holidays list
            await fetchHolidays();
            if (onUpdated) onUpdated();

            // If we're editing the deleted holiday, close the form
            if (form.id === holidayId) {
                handleClose();
            }
        } catch (error) {
            console.error("Error deleting holiday:", error);
            setError(error.message || "Failed to delete holiday");
        }
    };

    const handleEditHoliday = (holiday) => {
        const updatedHoliday = { ...holiday };
        // Ensure day matches the date when editing
        if (updatedHoliday.date) {
            updatedHoliday.day = getDayFromDate(updatedHoliday.date);
        }
        setForm(updatedHoliday);
        setIsCreateMode(false);
        setError("");
    };

    const handleClose = () => {
        setError("");
        if (onClose) onClose();
    };

    const handleResetSearch = () => {
        setSearchTerm("");
    };

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !isSubmitting) {
                handleClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isSubmitting]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            handleClose();
        }
    };

    const filteredHolidays = allHolidays.filter((holiday) =>
        (holiday.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if form is valid
    const isFormValid = () => {
        if (!form.date || !form.type) return false;
        if (form.type === "official" && (!form.name || !form.name.trim()))
            return false;
        return true;
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-container">
                <div
                    className={`modal-content ${
                        isCreateMode ? "create-mode" : "edit-mode"
                    }`}
                >
                    {/* Header */}
                    <div className="modal-header">
                        <div className="header-content">
                            <div className="header-icon">📅</div>
                            <div>
                                <h2 className="modal-title">
                                    {isCreateMode
                                        ? "Create Holiday"
                                        : "Edit Holiday"}
                                </h2>
                                <p className="modal-subtitle">
                                    {isCreateMode
                                        ? "Add a new holiday to the system"
                                        : "Manage holiday details and settings"}
                                </p>
                            </div>
                        </div>
                        <button
                            className="close-button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="modal-body">
                        {/* Left sidebar - Holiday list (only show in edit mode) */}
                        {!isCreateMode && (
                            <div className="sidebar">
                                <div className="sidebar-header">
                                    <h3>All Holidays</h3>
                                    <div className="search-container">
                                        <input
                                            type="text"
                                            className="search-input"
                                            placeholder="Search holidays..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                        {searchTerm && (
                                            <button
                                                className="search-clear"
                                                onClick={handleResetSearch}
                                                type="button"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="holiday-list">
                                    {filteredHolidays.map((holiday) => (
                                        <div
                                            key={holiday.id}
                                            className={`holiday-card ${
                                                form.id === holiday.id
                                                    ? "active"
                                                    : ""
                                            }`}
                                        >
                                            <div className="holiday-info">
                                                <h4>
                                                    {holiday.name ||
                                                        `${holiday.type} Holiday`}
                                                </h4>
                                                <div className="holiday-meta">
                                                    <span className="date">
                                                        {holiday.date}
                                                    </span>
                                                    <span className="day">
                                                        {getDayFromDate(
                                                            holiday.date
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`type-badge ${holiday.type}`}
                                                    >
                                                        {holiday.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="holiday-actions">
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={() =>
                                                        handleEditHoliday(
                                                            holiday
                                                        )
                                                    }
                                                    disabled={isSubmitting}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() =>
                                                        handleDelete(holiday.id)
                                                    }
                                                    disabled={isSubmitting}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Form section */}
                        <div className="form-section">
                            {error && (
                                <div className="error-alert" role="alert">
                                    <span className="error-icon">⚠️</span>
                                    {error}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="holiday-form"
                            >
                                <div className="form-group">
                                    <label className="form-label">
                                        Holiday Name{" "}
                                        {form.type === "official" && (
                                            <span className="required">*</span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className={`form-input ${
                                            form.type === "weekly"
                                                ? "optional-field"
                                                : ""
                                        } ${
                                            form.type === "official" &&
                                            (!form.name || !form.name.trim())
                                                ? "error-field"
                                                : ""
                                        }`}
                                        value={form.name || ""}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        placeholder={
                                            form.type === "official"
                                                ? "Enter holiday name (required)"
                                                : "Enter holiday name (optional for weekly holidays)"
                                        }
                                    />
                                    <div
                                        className={`field-help ${
                                            form.type === "official" &&
                                            (!form.name || !form.name.trim())
                                                ? "field-help-error"
                                                : ""
                                        }`}
                                    >
                                        <span className="help-icon">
                                            {form.type === "official"
                                                ? form.name && form.name.trim()
                                                    ? "✅"
                                                    : "⚠️"
                                                : "💡"}
                                        </span>
                                        <span className="help-text">
                                            {form.type === "official"
                                                ? form.name && form.name.trim()
                                                    ? "Valid holiday name provided"
                                                    : "Name is required for official holidays"
                                                : "Weekly holidays can be left unnamed"}
                                        </span>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">
                                            Date{" "}
                                            <span className="required">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            className="form-input"
                                            value={form.date}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Day
                                        </label>
                                        <div className="day-display">
                                            <input
                                                type="text"
                                                name="day"
                                                className="form-input day-locked"
                                                value={
                                                    form.day ||
                                                    (form.date
                                                        ? getDayFromDate(
                                                              form.date
                                                          )
                                                        : "Select date first")
                                                }
                                                disabled={true}
                                                readOnly
                                            />
                                            <div className="day-info">
                                                <span className="day-info-icon">
                                                    🔒
                                                </span>
                                                <span className="day-info-text">
                                                    Auto-determined by selected
                                                    date
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Type <span className="required">*</span>
                                    </label>
                                    <select
                                        name="type"
                                        className="form-select"
                                        value={form.type}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    >
                                        <option value="official">
                                            Official Holiday
                                        </option>
                                        <option value="weekly">
                                            Weekly Holiday
                                        </option>
                                    </select>
                                    <div className="field-help">
                                        <span className="help-icon">ℹ️</span>
                                        <span className="help-text">
                                            {form.type === "official"
                                                ? "Official holidays require a name"
                                                : "Weekly holidays can be unnamed"}
                                        </span>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            isSubmitting || !isFormValid()
                                        }
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner"></span>
                                                {isCreateMode
                                                    ? "Creating..."
                                                    : "Updating..."}
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
            </div>

            <style jsx>{`
                .modal-overlay {
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
                    padding: 20px;
                }

                .modal-container {
                    width: 100%;
                    max-width: 1200px;
                    max-height: 90vh;
                    display: flex;
                    justify-content: center;
                }

                .modal-content {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                    width: 100%;
                    max-height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .create-mode {
                    max-width: 600px;
                }

                .edit-mode {
                    max-width: 1100px;
                }

                .modal-header {
                    background: linear-gradient(
                        135deg,
                        #667eea 0%,
                        #764ba2 100%
                    );
                    color: white;
                    padding: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .header-icon {
                    font-size: 48px;
                    opacity: 0.9;
                }

                .modal-title {
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0;
                    margin-bottom: 5px;
                }

                .modal-subtitle {
                    font-size: 16px;
                    opacity: 0.9;
                    margin: 0;
                }

                .close-button {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    transition: all 0.2s ease;
                }

                .close-button:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: rotate(90deg);
                }

                .close-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .modal-body {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .sidebar {
                    width: 380px;
                    background: #f8f9fa;
                    border-right: 1px solid #e9ecef;
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-header {
                    padding: 25px;
                    border-bottom: 1px solid #e9ecef;
                }

                .sidebar-header h3 {
                    font-size: 20px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0 0 20px 0;
                }

                .search-container {
                    position: relative;
                }

                .search-input {
                    width: 100%;
                    padding: 12px 40px 12px 16px;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    background: white;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                }

                .search-clear {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #6c757d;
                    cursor: pointer;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }

                .search-clear:hover {
                    background: #f8f9fa;
                    color: #495057;
                }

                .holiday-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .holiday-card {
                    background: white;
                    border: 2px solid #e9ecef;
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 16px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .holiday-card:hover {
                    border-color: #3498db;
                    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.1);
                    transform: translateY(-2px);
                }

                .holiday-card.active {
                    border-color: #3498db;
                    background: #f8fdff;
                    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.15);
                }

                .holiday-info h4 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0 0 12px 0;
                }

                .holiday-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .holiday-meta span {
                    font-size: 12px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-weight: 500;
                }

                .date {
                    background: #e3f2fd;
                    color: #1976d2;
                }

                .day {
                    background: #f3e5f5;
                    color: #7b1fa2;
                }

                .type-badge.official {
                    background: #e8f5e8;
                    color: #2e7d32;
                }

                .type-badge.weekly {
                    background: #fff3e0;
                    color: #f57c00;
                }

                .holiday-actions {
                    display: flex;
                    gap: 8px;
                }

                .action-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .edit-btn {
                    background: #e3f2fd;
                    color: #1976d2;
                }

                .edit-btn:hover {
                    background: #1976d2;
                    color: white;
                }

                .delete-btn {
                    background: #ffebee;
                    color: #d32f2f;
                }

                .delete-btn:hover {
                    background: #d32f2f;
                    color: white;
                }

                .action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .form-section {
                    flex: 1;
                    padding: 30px;
                    overflow-y: auto;
                }

                .error-field {
                    border-color: #dc3545 !important;
                    background-color: #fff8f8;
                }

                .error-field:focus {
                    border-color: #dc3545 !important;
                    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
                }

                .field-help-error {
                    background: #fff8f8;
                    border-color: #dc3545;
                    color: #dc3545;
                }

                .holiday-form {
                    max-width: 500px;
                }

                .form-group {
                    margin-bottom: 25px;
                    transition: all 0.3s ease;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .form-label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 8px;
                    transition: all 0.3s ease;
                }

                .required {
                    color: #e74c3c;
                    font-weight: 700;
                    opacity: 1;
                    transition: opacity 0.3s ease;
                }

                .optional {
                    color: #7f8c8d;
                    font-weight: 400;
                    font-size: 12px;
                    font-style: italic;
                }

                .form-input {
                    width: 100%;
                    padding: 14px 16px;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    font-size: 15px;
                    transition: all 0.3s ease;
                    background: white;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                }

                .form-input:disabled {
                    background: #f8f9fa;
                    color: #6c757d;
                }

                .form-input.optional-field {
                    border-color: #e9ecef;
                    background-color: #f8f9fa;
                }

                .form-input.optional-field:focus {
                    border-color: #6c757d;
                    box-shadow: 0 0 0 3px rgba(108, 117, 125, 0.1);
                }

                .day-display {
                    position: relative;
                }

                .day-locked {
                    background: #f8f9fa !important;
                    color: #495057 !important;
                    border-color: #dee2e6 !important;
                    cursor: not-allowed;
                }

                .day-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 8px;
                    font-size: 12px;
                    color: #6c757d;
                }

                .day-info-icon {
                    font-size: 14px;
                }

                .day-info-text {
                    font-style: italic;
                }

                .field-help {
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #6c757d;
                    padding: 8px 12px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 1px solid #e9ecef;
                    transition: all 0.3s ease;
                }

                .help-icon {
                    font-size: 14px;
                    transition: all 0.3s ease;
                }

                .help-text {
                    flex: 1;
                    line-height: 1.4;
                    transition: all 0.3s ease;
                }

                .form-actions {
                    display: flex;
                    gap: 16px;
                    justify-content: flex-end;
                    margin-top: 35px;
                    padding-top: 25px;
                    border-top: 1px solid #e9ecef;
                }

                .btn {
                    padding: 14px 28px;
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-secondary {
                    background: #f8f9fa;
                    color: #6c757d;
                    border: 2px solid #e9ecef;
                }

                .btn-secondary:hover {
                    background: #e9ecef;
                    color: #495057;
                }

                .btn-primary {
                    background: linear-gradient(
                        135deg,
                        #3498db 0%,
                        #2980b9 100%
                    );
                    color: white;
                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .modal-overlay {
                        padding: 10px;
                    }

                    .modal-content {
                        border-radius: 16px;
                    }

                    .edit-mode .modal-body {
                        flex-direction: column;
                    }

                    .sidebar {
                        width: 100%;
                        max-height: 300px;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .modal-header {
                        padding: 20px;
                    }

                    .header-content {
                        gap: 15px;
                    }

                    .header-icon {
                        font-size: 36px;
                    }

                    .modal-title {
                        font-size: 24px;
                    }

                    .form-section {
                        padding: 20px;
                    }
                }

                .form-select {
                    width: 100%;
                    padding: 14px 16px;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    font-size: 15px;
                    transition: all 0.3s ease;
                    background: white;
                    cursor: pointer;
                    appearance: auto;
                    -webkit-appearance: menulist;
                    -moz-appearance: menulist;
                }

                .form-select:hover:not(:disabled) {
                    border-color: #cbd5e0;
                }

                .form-select:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                }

                .form-select:disabled {
                    background: #f8f9fa;
                    color: #6c757d;
                    cursor: not-allowed;
                }

                .form-select option {
                    padding: 8px;
                    font-size: 15px;
                }

                .type-transition {
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default HolidayEditForm;
