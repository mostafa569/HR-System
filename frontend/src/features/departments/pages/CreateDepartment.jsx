import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    IoAddCircleOutline,
    IoCloseCircleOutline,
    IoSaveOutline,
    IoInformationCircleOutline,
    IoPricetagOutline,
    IoNewspaperOutline,
} from "react-icons/io5";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

import departmentService from '../services/departmentService';
import styles from "./CreateDepartment.module.css";

const CreateDepartment = () => {
    // Manages form data for new department creation
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = useCallback((e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
        if (errors[id]) {
            setErrors((prevErrors) => ({ ...prevErrors, [id]: undefined }));
        }
    }, [errors]);

    const validate = useCallback(() => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Department name is required";
        }
        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }
        return newErrors;
    }, [formData]);

    const handleSubmit = useCallback(
        // Handles form submission and API call
        async (e) => {
            e.preventDefault();
            const validationErrors = validate();
            setErrors(validationErrors);

            if (Object.keys(validationErrors).length === 0) {
                setIsLoading(true);
                try {
                    await departmentService.createDepartment(formData);
                    toast.success("Department created successfully", { theme: "light" });
                    navigate("/departments");
                } catch (error) {
                    console.error("Error creating department:", error);
                    toast.error(
                        error.response?.data?.message || "Failed to create department",
                        { theme: "light" }
                    );
                } finally {
                    setIsLoading(false);
                }
            }
        },
        [formData, navigate, validate]
    );

    const renderProgress = useCallback(() => {
        const fields = Object.values(formData);
        // Calculates form completion percentage
        const filledFields = fields.filter((value) => value.trim() !== "").length;
        const totalFields = fields.length;
        const progress = (filledFields / totalFields) * 100;
        return progress.toFixed(0);
    }, [formData]);

    return (
        <div className={styles["min-vh-100"]}>
            <div className={`${styles["card-modern"]} p-4`}>
                <div className={styles["header-gradient-container"]}>
                    <div className={styles["header-corner-blur"]}></div>
                    <div className={styles["header-content-wrapper"]}>
                        <div className={styles["icon-glow-wrapper"]}>
                            <IoAddCircleOutline className={styles["header-icon"]} />
                        </div>

                        <div>
                            <h2 className={styles["header-title"]}>Add New Department</h2>
                            <p className={styles["header-subtitle"]}>
                                <IoInformationCircleOutline className={styles["info-icon"]} />
                                Fill all required fields to add a new department
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/departments")}
                        className={`${styles["btn-pill-cancel"]} btn`}
                    >
                        <IoCloseCircleOutline className={styles["cancel-icon"]} />
                        <span>Cancel</span>
                    </button>
                </div>

                <div className={styles["progress-section"]}>
                    <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Form Completion</small>
                        <small className="fw-bold" style={{ color: "var(--color-accent-teal)" }}>
                            {renderProgress()}%
                        </small>
                    </div>
                    <div className={`${styles.progress} progress`}>
                        <div
                            className={`${styles["progress-bar-fancy"]} progress-bar`}
                            role="progressbar"
                            style={{
                                width: `${renderProgress()}%`,
                            }}
                            aria-valuenow={renderProgress()}
                            aria-valuemin="0"
                            aria-valuemax="100"
                        ></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className={styles["form-label-elegant"]}>
                            Department Name
                        </label>
                        <div className="input-group">
                            <span className={styles["input-group-icon"]}>
                                <IoPricetagOutline />
                            </span>
                            <input
                                type="text"
                                className={`${styles["form-control-styled"]} form-control ${
                                    errors.name ? "is-invalid" : ""
                                }`}
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Human Resources"
                            />
                            {errors.name && (
                                // Displays validation error messages
                                <div className={styles["invalid-feedback"]}>
                                    {errors.name}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="description" className={styles["form-label-elegant"]}>
                            Description
                        </label>
                        <div className="input-group">
                            <span className={styles["input-group-icon"]}>
                                <IoNewspaperOutline />
                            </span>
                            <textarea
                                className={`${styles["form-control-styled"]} form-control ${
                                    errors.description ? "is-invalid" : ""
                                }`}
                                id="description"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Brief description of the department"
                            ></textarea>
                            {errors.description && (
                                <div className={styles["invalid-feedback"]}>
                                    {errors.description}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <button
                            type="submit"
                            className={`${styles["btn-gradient-submit"]} btn`}
                            disabled={isLoading} // Disables button while saving
                        >
                            {isLoading ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    <span className="ms-2">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <IoSaveOutline className="me-2" />
                                    Save Department
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDepartment;