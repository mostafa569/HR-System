import React from "react";
import styles from "./ConfirmationModal.module.css";
import { FiAlertTriangle, FiX } from "react-icons/fi";

const ConfirmationModal = ({
  isOpen,
  onClose = () => {},
  onConfirm = () => {},
  onSecondaryAction = () => {},
  title,
  message,
  confirmText = "Confirm",
  secondaryText,
  cancelText = "Cancel",
  icon: Icon = FiAlertTriangle,
  iconColor = "text-yellow-500",
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>
          <FiX size={24} />
        </button>
        <div className={styles.iconWrapper}>
          <Icon size={32} className={`${styles.icon} ${iconColor}`} />
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonGroup}>
          <button
            onClick={onClose}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            {cancelText}
          </button>
          {secondaryText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className={`${styles.button} ${styles.secondaryConfirmButton}`}
            >
              {secondaryText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`${styles.button} ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
