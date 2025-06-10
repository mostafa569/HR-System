
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
    IoAddCircleOutline,
    IoBusinessOutline,
    IoWarningOutline,
    IoRefreshOutline,
    IoRocketOutline
} from 'react-icons/io5';

import departmentService from '.././services/departmentService';
import DepartmentRow from './DepartmentRow'; 
import styles from './DepartmentList.module.css';

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchDepartments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await departmentService.getAllDepartments();
            setDepartments(response.data);
            // toast.success('Departments loaded successfully!', { theme: "light" });
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError('Failed to load departments. Please try again.');
            toast.error('Error loading departments: ' + (err.response?.data?.message || err.message), { theme: "light" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const handleDelete = useCallback((id) => {
        confirmAlert({
            title: 'Confirm Deletion',
            message: 'Are you sure you want to delete this department? This action cannot be undone.',
            buttons: [
                {
                    label: 'Yes, Delete',
                    onClick: async () => {
                        try {
                            await departmentService.deleteDepartment(id);
                            toast.success('Department deleted successfully!', { theme: "light" });
                            setDepartments(prevDepartments => prevDepartments.filter((dept) => dept.id !== id));
                        } catch (err) {
                            console.error('Error deleting department:', err);
                            toast.error('Error deleting department: ' + (err.response?.data?.message || err.message), { theme: "light" });
                        }
                    },
                    className: styles["confirm-btn-delete"] 
                },
                {
                    label: 'No, Keep It',
                    onClick: () => { toast.info('Deletion cancelled.', { theme: "light" }); },
                    className: styles["confirm-btn-cancel"] 
                },
            ],
            overlayClassName: styles["confirm-overlay"] 
        });
    }, []);

    // --- Conditional Rendering for Loading, Error, No Data ---
    if (isLoading) {
        return (
            <div className={styles["page-container"]}>
                <div className={`${styles["status-card"]} ${styles["loading-card"]} ${styles["animated-card"]}`}>
                    <div className={`${styles.spinner} spinner-border`} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className={styles["status-text"]}>Loading departments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles["page-container"]}>
                <div className={`${styles["status-card"]} ${styles["error-card"]} ${styles["animated-card"]}`}>
                    <IoWarningOutline className={styles["status-icon"]} />
                    <p className={styles["status-text"]}>{error}</p>
                    <button
                        className={`${styles["btn-primary-outline"]}`}
                        onClick={fetchDepartments}
                        aria-label="Retry loading departments"
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
                            <IoBusinessOutline className={styles["header-icon"]} />
                        </div>
                        <h2 className={styles["header-title"]}>Department List</h2>
                    </div>
                    <button
                        className={`${styles["btn-primary-solid"]}`}
                        onClick={() => navigate('/departments/create')}
                        aria-label="Create new department"
                    >
                        <IoAddCircleOutline className="me-2" />
                        Create New Department
                    </button>
                </div>

                {departments.length === 0 ? (
                    <div className={`${styles["status-card"]} ${styles["no-data-card"]} ${styles["animated-fade-in"]}`}>
                        <IoRocketOutline className={styles["status-icon"]} />
                        <p className={styles["status-text"]}>No departments found. Let's create the first one!</p>
                        <button
                            className={`${styles["btn-primary-outline"]}`}
                            onClick={() => navigate('/departments/create')}
                            aria-label="Add the first department"
                        >
                            <IoAddCircleOutline className="me-2" />
                            Add First Department
                        </button>
                    </div>
                ) : (
                    <div className={styles["table-responsive-wrapper"]}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th className={styles["actions-column"]}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map((department) => (
                                    <DepartmentRow
                                        key={department.id}
                                        department={department}
                                        onEdit={() => navigate(`/departments/${department.id}/edit`)}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepartmentList;