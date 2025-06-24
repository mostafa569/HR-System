import React, { useState, useEffect } from "react";
import "./HolidayEditForm.css"; 


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
            const response = await fetch("http://localhost:8000/api/holidays", {
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
                response = await fetch("http://localhost:8000/api/holidays", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(holidayData),
                });
            } else {
                // Update existing holiday
                response = await fetch(`http://localhost:8000/api/holidays/${form.id}`, {
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
            const response = await fetch(`http://localhost:8000/api/holidays/${holidayId}`, {
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
        </div>
    );
};

export default HolidayEditForm;
