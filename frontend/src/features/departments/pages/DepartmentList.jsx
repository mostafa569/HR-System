import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  IoAddCircleOutline,
  IoBusinessOutline,
  IoWarningOutline,
  IoRefreshOutline,
  IoRocketOutline,
  IoSearchOutline,
} from "react-icons/io5";

import departmentService from ".././services/departmentService";
import DepartmentRow from "./DepartmentRow";
import styles from "./DepartmentList.module.css";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await departmentService.getAllDepartments();
      setDepartments(response.data);
      setFilteredDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to load departments. Please try again.");
      toast.error(
        "Error loading departments: " +
          (err.response?.data?.message || err.message),
        { theme: "colored" }
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    const filtered = departments.filter((dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDepartments(filtered);
  }, [searchTerm, departments]);

  const handleDelete = useCallback((id) => {
    confirmAlert({
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this department? This action cannot be undone.",
      buttons: [
        {
          label: "Yes, Delete",
          onClick: async () => {
            try {
              await departmentService.deleteDepartment(id);
              toast.success("Department deleted successfully!", {
                theme: "colored",
              });
              setDepartments((prevDepartments) =>
                prevDepartments.filter((dept) => dept.id !== id)
              );
            } catch (err) {
              console.error("Error deleting department:", err);
              toast.error(
                "Error deleting department: " +
                  (err.response?.data?.message || err.message),
                { theme: "colored" }
              );
            }
          },
          className: styles["confirm-btn-delete"],
        },
        {
          label: "No, Keep It",
          onClick: () => {
            toast.info("Deletion cancelled.", { theme: "colored" });
          },
          className: styles["confirm-btn-cancel"],
        },
      ],
      overlayClassName: styles["confirm-overlay"],
      closeOnEscape: true,
      closeOnClickOutside: true,
    });
  }, []);

  if (isLoading) {
    return (
      <div className={styles["page-container"]}>
        <div className={styles["skeleton-loader"]}>
          <div className={styles["skeleton-header"]}></div>
          <div className={styles["skeleton-search"]}></div>
          <div className={styles["skeleton-row"]}></div>
          <div className={styles["skeleton-row"]}></div>
          <div className={styles["skeleton-row"]}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["page-container"]}>
        <div
          className={`${styles["status-card"]} ${styles["error-card"]} ${styles["animated-card"]}`}
        >
          <IoWarningOutline className={styles["status-icon"]} size={48} />
          <h3 className={styles["status-title"]}>Oops! Something went wrong</h3>
          <p className={styles["status-text"]}>{error}</p>
          <button
            className={`${styles["btn-primary-solid"]} ${styles["retry-btn"]}`}
            onClick={fetchDepartments}
            aria-label="Retry loading departments"
          >
            <IoRefreshOutline className="me-2" size={18} />
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
              <IoBusinessOutline className={styles["header-icon"]} size={28} />
            </div>
            <div>
              <h2 className={styles["header-title"]}>Department Management</h2>
              <p className={styles["header-subtitle"]}>
                View and manage all departments in your organization
              </p>
            </div>
          </div>
          <button
            className={`${styles["btn-primary-solid"]} ${styles["create-btn"]}`}
            onClick={() => navigate("/departments/create")}
            aria-label="Create new department"
          >
            <IoAddCircleOutline className="me-2" size={18} />
            New Department
          </button>
        </div>

        <div className={styles["search-container"]}>
          <div className={styles["search-input-wrapper"]}>
            <IoSearchOutline className={styles["search-icon"]} size={20} />
            <input
              type="text"
              placeholder="Search departments..."
              className={styles["search-input"]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className={styles["clear-search"]}
                onClick={() => setSearchTerm("")}
              >
                &times;
              </button>
            )}
          </div>
          <div className={styles["results-count"]}>
            {filteredDepartments.length} {filteredDepartments.length === 1 ? "department" : "departments"} found
          </div>
        </div>

        {filteredDepartments.length === 0 ? (
          <div
            className={`${styles["status-card"]} ${styles["no-data-card"]} ${styles["animated-fade-in"]}`}
          >
            <IoRocketOutline className={styles["status-icon"]} size={48} />
            <h3 className={styles["status-title"]}>No Departments Found</h3>
            <p className={styles["status-text"]}>
              {searchTerm
                ? "No departments match your search criteria."
                : "It looks like you haven't created any departments yet."}
            </p>
            <button
              className={`${styles["btn-primary-solid"]}`}
              onClick={() => navigate("/departments/create")}
              aria-label="Add the first department"
            >
              <IoAddCircleOutline className="me-2" size={18} />
              Create First Department
            </button>
          </div>
        ) : (
          <div className={styles["table-responsive-wrapper"]}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles["id-column"]}>ID</th>
                  <th className={styles["name-column"]}>Department Name</th>
                  <th className={styles["actions-column"]} style={{textAlign:"center"}} >Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((department) => (
                  <DepartmentRow
                    key={department.id}
                    department={department}
                    onEdit={() =>
                      navigate(`/departments/${department.id}/edit`)
                    }
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