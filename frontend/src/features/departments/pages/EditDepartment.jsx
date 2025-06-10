import React, { useState, useEffect, useCallback } from 'react';
import departmentService from '../services/departmentService';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    IoPencilOutline,
    IoSaveOutline,
    IoCloseCircleOutline,
    IoInformationCircleOutline,
    IoPricetagOutline,
    IoRefreshOutline
} from 'react-icons/io5';
import styles from './EditDepartment.module.css';

const EditDepartment = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [departmentName, setDepartmentName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchDepartment = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await departmentService.getDepartmentById(id);

            setDepartmentName(data.name); 
            toast.success("Department data loaded successfully!", { theme: "light" });
        } catch (err) {
            console.error('Error fetching department:', err);
            setError('Failed to load department data. Please check your network or try again.');
            toast.error('Error loading department data: ' + (err.response?.data?.message || err.message), { theme: "light" });
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDepartment();
    }, [fetchDepartment]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

      
        if (!departmentName.trim()) {
            setError('Department name cannot be empty.');
            toast.error("Department name cannot be empty.", { theme: "light" });
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
           
            await departmentService.updateDepartment(id, { name: departmentName }); // الـ Backend يتوقع 'name' للتحديثات
            toast.success('Department updated successfully!', { theme: "light" });
            navigate('/departments');
        } catch (err) {
            console.error('Error updating department:', err);
            setError('Failed to update department. Please try again.');
            toast.error('Error updating department: ' + (err.response?.data?.message || err.message), { theme: "light" });
        } finally {
            setIsSaving(false);
        }
    }, [id, departmentName, navigate]);

    if (isLoading) {
        return (
            <div className={styles["page-container"]}>
                <div className={`${styles["status-card"]} ${styles["loading-card"]} ${styles["animated-card"]}`}>
                    <div className={`${styles.spinner} spinner-border`} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className={styles["status-text"]}>Loading department data...</p>
                </div>
            </div>
        );
    }

    if (error && !isLoading) {
        return (
            <div className={styles["page-container"]}>
                <div className={`${styles["status-card"]} ${styles["error-card"]} ${styles["animated-card"]}`}>
                    <IoInformationCircleOutline className={styles["status-icon"]} />
                    <p className={styles["status-text"]}>{error}</p>
                    <button
                        className={`${styles["btn-secondary-outline"]}`}
                        onClick={fetchDepartment}
                        aria-label="Retry loading department data"
                    >
                        <IoRefreshOutline className="me-2" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles["page-container"]}>
            <div className={`${styles["card-container"]} ${styles["animated-card"]}`}>
                <div className={styles["card-header"]}>
                    <div className={styles["header-content"]}>
                        <div className={styles["header-icon-wrapper"]}>
                            <IoPencilOutline className={styles["header-icon"]} />
                        </div>
                        <div>
                            <h2 className={styles["header-title"]}>Edit Department</h2>
                            <p className={styles["header-subtitle"]}>
                                <IoInformationCircleOutline className={styles["info-icon"]} />
                                Modify department details below.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/departments")}
                        className={`${styles["btn-secondary-outline"]}`}
                    >
                        <IoCloseCircleOutline className="me-2" />
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles["form-section"]}>
                    <div className="mb-4">
                        <label htmlFor="departmentName" className={styles["form-label"]}>
                            Department Name
                        </label>
                        <div className={styles["input-group-styled"]}>
                            <span className={styles["input-group-icon"]}>
                                <IoPricetagOutline />
                            </span>
                            <input
                                type="text"
                                className={`${styles["form-control-styled"]} ${error ? styles["is-invalid"] : ""
                                    }`}
                                id="departmentName"
                                value={departmentName}
                                onChange={(e) => setDepartmentName(e.target.value)}
                                disabled={isSaving}
                                placeholder="e.g., Sales & Marketing"
                            />
                        </div>
                        {error && <div className={styles["invalid-feedback"]}>{error}</div>}
                    </div>

                    <div className="d-flex justify-content-end">
                        <button
                            type="submit"
                            className={`${styles["btn-primary-solid"]}`}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <IoSaveOutline className="me-2" />
                                    Update Department
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