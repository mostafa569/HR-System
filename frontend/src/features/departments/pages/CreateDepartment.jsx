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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Department name must be at least 3 characters";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    
    return newErrors;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        await departmentService.createDepartment(formData);
        toast.success("Department created successfully!", { 
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        navigate("/departments");
      } catch (error) {
        console.error("Error creating department:", error);
        toast.error(
          error.response?.data?.message || "Failed to create department",
          { 
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          }
        );
      } finally {
        setIsLoading(false);
      }
    }
    setIsSubmitting(false);
  }, [formData, navigate, validate]);

  const renderProgress = useCallback(() => {
    const fields = Object.values(formData);
    const filledFields = fields.filter((value) => value.trim() !== "").length;
    const totalFields = fields.length;
    const progress = (filledFields / totalFields) * 100;
    return Math.min(100, Math.max(0, progress)); // Ensure between 0-100
  }, [formData]);

  const progressPercentage = renderProgress();

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.cardContainer} ${styles.animatedCard}`}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerIconWrapper}>
              <IoAddCircleOutline className={styles.headerIcon} size={24} />
            </div>
            <div>
              <h1 className={styles.headerTitle}>Create New Department</h1>
              <p className={styles.headerSubtitle}>
                <IoInformationCircleOutline className={styles.infoIcon} size={18} />
                Fill in all required fields to add a new department
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/departments")}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            <IoCloseCircleOutline className={styles.cancelIcon} size={18} />
            Cancel
          </button>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressInfo}>
            <span>Form Completion</span>
            <span className={styles.progressPercentage}>{progressPercentage}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
              aria-valuenow={progressPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>
              <IoPricetagOutline className={styles.labelIcon} size={16} />
              Department Name
              <span className={styles.requiredIndicator}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.formInput} ${errors.name ? styles.inputError : ""}`}
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Human Resources"
              disabled={isLoading}
            />
            {errors.name && (
              <div className={styles.errorMessage}>
                {errors.name}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.formLabel}>
              <IoNewspaperOutline className={styles.labelIcon} size={16} />
              Description
              <span className={styles.requiredIndicator}>*</span>
            </label>
            <textarea
              className={`${styles.formTextarea} ${errors.description ? styles.inputError : ""}`}
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the department's purpose and responsibilities..."
              disabled={isLoading}
            ></textarea>
            {errors.description && (
              <div className={styles.errorMessage}>
                {errors.description}
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || isSubmitting}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <IoSaveOutline className={styles.buttonIcon} size={18} />
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