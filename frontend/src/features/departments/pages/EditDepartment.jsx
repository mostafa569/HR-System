import React, { useState, useEffect, useCallback } from "react";
import departmentService from "../services/departmentService";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  IoPencilOutline,
  IoSaveOutline,
  IoCloseCircleOutline,
  IoInformationCircleOutline,
  IoPricetagOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import styles from "./EditDepartment.module.css";

const EditDepartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState({
    name: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchDepartment = useCallback(async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const response = await departmentService.getDepartmentById(id);

      if (response && response.department) {
        const departmentData = response.department;
        setDepartment({
          name: departmentData.name || "",
        });
        // toast.success("Department data loaded successfully!", {
        //   position: "top-right",
        //   theme: "colored",
        // });
      } else {
        throw new Error("Invalid department data format");
      }
    } catch (err) {
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error(
        "Error loading department: " +
          (err.response?.data?.message || err.message),
        {
          position: "top-right",
          theme: "colored",
        }
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!department.name.trim()) {
      newErrors.name = "Department name is required";
    } else if (department.name.trim().length < 3) {
      newErrors.name = "Department name must be at least 3 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSaving(true);
      try {
        await departmentService.updateDepartment(id, department);
        // toast.success("Department updated successfully!", {
        //   position: "top-right",
        //   theme: "colored",
        // });
        navigate("/departments");
      } catch (err) {
        console.error("Error updating department:", err);
        toast.error(
          "Error updating department: " +
            (err.response?.data?.message || err.message),
          {
            position: "top-right",
            theme: "colored",
          }
        );
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <h3 className={styles.loadingText}>Loading Department Data...</h3>
          <p className={styles.loadingSubtext}>
            Please wait while we fetch the department details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.cardContainer}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerIconWrapper}>
              <IoPencilOutline className={styles.headerIcon} size={24} />
            </div>
            <div>
              <h1 className={styles.headerTitle}>Edit Department</h1>
              <p className={styles.headerSubtitle}>
                <IoInformationCircleOutline
                  className={styles.infoIcon}
                  size={18}
                />
                Update the department information below
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/departments")}
            className={styles.cancelButton}
            disabled={isSaving}
          >
            <IoCloseCircleOutline className={styles.cancelIcon} size={18} />
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>
              <IoPricetagOutline className={styles.labelIcon} size={18} />
              Department Name
              <span className={styles.requiredIndicator}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.formInput} ${
                errors.name ? styles.inputError : ""
              }`}
              id="name"
              name="name"
              value={department.name}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="e.g., Human Resources"
            />
            {errors.name && (
              <div className={styles.errorMessage}>{errors.name}</div>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate("/departments")}
              className={styles.secondaryButton}
              disabled={isSaving}
            >
              <IoCloseCircleOutline className={styles.buttonIcon} size={18} />
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span
                    className={styles.submitSpinner}
                    aria-hidden="true"
                  ></span>
                  Saving...
                </>
              ) : (
                <>
                  <IoSaveOutline className={styles.buttonIcon} size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartment;
