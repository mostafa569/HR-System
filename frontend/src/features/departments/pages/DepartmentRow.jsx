
import React from 'react';
import { IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import styles from './DepartmentRow.module.css';

const DepartmentRow = ({ department, onEdit, onDelete }) => {
    return (
        <tr className={styles["table-row-animated"]}>
            <td>{department.id}</td>
       
            <td className={styles["department-name-cell"]}>{department.name}</td>
            <td className={styles["table-actions"]}>
                <button
                    className={`${styles["btn-primary-outline"]} ${styles["btn-small"]} me-2`}
                    onClick={() => onEdit(department.id)}
                    aria-label={`Edit department ${department.name}`} 
                >
                    <IoPencilOutline className="me-1" /> Edit
                </button>
                <button
                    className={`${styles["btn-danger-outline"]} ${styles["btn-small"]}`}
                    onClick={() => onDelete(department.id)}
                    aria-label={`Delete department ${department.name}`} 
                >
                    <IoTrashOutline className="me-1" /> Delete
                </button>
            </td>
        </tr>
    );
};

export default DepartmentRow;