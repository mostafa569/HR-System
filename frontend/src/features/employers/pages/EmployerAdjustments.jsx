import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert,
  Modal,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaTimes,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClock,
  FaInfoCircle,
  FaUser,
} from "react-icons/fa";
import { getEmployers } from "../services/employerService";
import {
  getAdjustments,
  createAdjustment,
  updateAdjustment,
  deleteAdjustment,
} from "../services/adjustmentService";
import styles from "../style/EmployerAdjustments.module.css";

const EmployerAdjustments = () => {
  const [employerId, setEmployerId] = useState("");
  const [employers, setEmployers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    date: "",
    value: "",
    value_type: "money",
    kind: "addition",
    reason: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentAdjustmentId, setCurrentAdjustmentId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const response = await getEmployers();
        setEmployers(response.data);
      } catch (err) {
        console.error("Error fetching employers:", err);
        setError("Failed to load employers.");
      }
    };
    fetchEmployers();
  }, []);

  useEffect(() => {
    if (employerId) {
      fetchAdjustments(employerId);
    }
  }, [employerId]);

  const fetchAdjustments = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdjustments(id);
      setAdjustments(data);
    } catch (err) {
      console.error("Error fetching adjustments:", err);
      setError(err.response?.data?.message || "Failed to load adjustments.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // const parsedValue =
    //   form.value_type === "hours"
    //     ? parseInt(form.value)
    //     : parseFloat(form.value);
    const parsedValue = parseFloat(form.value);
   if (isNaN(parsedValue) || parsedValue <= 0) {
  setError("Value must be a positive number.");
  setLoading(false);
  return;
}

    if (form.reason && form.reason.length > 255) {
      setError("Reason cannot exceed 255 characters.");
      setLoading(false);
      return;
    }

    try {
      let payload = {
        ...form,
        employer_id: employerId,
        value: parsedValue,
        reason:
          form.reason !== undefined && form.reason !== null ? form.reason : "",
      };

      await createAdjustment(payload);
      await fetchAdjustments(employerId);
      setForm({
        date: "",
        value: "",
        value_type: "money",
        kind: "addition",
        reason: "",
      });
      setIsEditing(false);
      setCurrentAdjustmentId(null);
    } catch (err) {
      // Handle backend validation errors
      if (err.response && err.response.data && err.response.data.errors) {
        const errors = err.response.data.errors;
        if (errors.reason) {
          setError(
            "Reason is required. Please provide a reason for the adjustment."
          );
        } else {
          const messages = Object.values(errors).flat().join("\n");
          setError(messages);
        }
      } else if (
        err.response &&
        err.response.status === 500 &&
        err.response.data &&
        err.response.data.message &&
        err.response.data.message.toLowerCase().includes("reason")
      ) {
        setError(
          "Reason is required. Please provide a reason for the adjustment."
        );
      } else {
        setError(err.message || "Failed to create adjustment");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (adjustment) => {
    setIsEditing(true);
    setCurrentAdjustmentId(adjustment.id);
    setForm({
      date: adjustment.date.split("T")[0],
      value: Math.abs(adjustment.value),
      value_type: adjustment.value_type,
      kind: adjustment.kind,
      reason: adjustment.reason || "",
    });
    setShowEditModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setForm({
      date: "",
      value: "",
      value_type: "money",
      kind: "addition",
      reason: "",
    });
    setIsEditing(false);
    setCurrentAdjustmentId(null);
    setError(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // const parsedValue =
    //   form.value_type === "hours"
    //     ? parseInt(form.value)
    //     : parseFloat(form.value);
    const parsedValue = parseFloat(form.value);
   if (isNaN(parsedValue) || parsedValue <= 0) {
  setError("Value must be a positive number.");
  setLoading(false);
  return;
}

    if (form.reason && form.reason.length > 255) {
      setError("Reason cannot exceed 255 characters.");
      setLoading(false);
      return;
    }

    try {
      let payload = {
        ...form,
        employer_id: employerId,
        value: parsedValue,
        reason:
          form.reason !== undefined && form.reason !== null ? form.reason : "",
      };

      await updateAdjustment(currentAdjustmentId, payload);
      await fetchAdjustments(employerId);
      setShowEditModal(false);
      setForm({
        date: "",
        value: "",
        value_type: "money",
        kind: "addition",
        reason: "",
      });
      setIsEditing(false);
      setCurrentAdjustmentId(null);
    } catch (err) {
      // Handle backend validation errors
      if (err.response && err.response.data && err.response.data.errors) {
        const errors = err.response.data.errors;
        if (errors.reason) {
          setError(
            "Reason is required. Please provide a reason for the adjustment."
          );
        } else {
          const messages = Object.values(errors).flat().join("\n");
          setError(messages);
        }
      } else if (
        err.response &&
        err.response.status === 500 &&
        err.response.data &&
        err.response.data.message &&
        err.response.data.message.toLowerCase().includes("reason")
      ) {
        setError(
          "Reason is required. Please provide a reason for the adjustment."
        );
      } else {
        setError(err.message || "Failed to update adjustment");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this adjustment?")) {
      setLoading(true);
      setError(null);
      try {
        await deleteAdjustment(id);
        alert("Adjustment deleted successfully!");
        fetchAdjustments(employerId);
        setError(null);
      } catch (err) {
        console.error("Error deleting adjustment:", err);
        setError(err.response?.data?.message || "Failed to delete adjustment.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="container p-1">
        <Container fluid className={styles.container}>
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.pageTitle}>Employer Adjustments</h1>
              <p className={styles.pageDescription}>
                Manage salary adjustments and deductions for employees
              </p>
            </div>
            <div className={styles.headerPattern}></div>
          </div>

          <Row className={styles.contentRow}>
            <Col lg={4} className={styles.sidebar}>
              <Card className={styles.sidebarCard}>
                <Card.Body>
                  <div className={styles.employerSelectWrapper}>
                    <h5 className={styles.sidebarTitle}>
                      <FaUser className="me-2" /> Select Employee
                    </h5>
                    <Form.Group className={styles.formGroup}>
                      <div className={styles.selectWrapper}>
                        <Form.Select
                          id="employerSelect"
                          value={employerId}
                          onChange={(e) => setEmployerId(e.target.value)}
                          className={styles.select}
                        >
                          <option value="">-- Select an Employee --</option>
                          {employers.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.full_name}
                            </option>
                          ))}
                        </Form.Select>
                        <div className={styles.selectIcon}>
                          <FaUser />
                        </div>
                      </div>
                    </Form.Group>
                  </div>

                  {employerId && (
                    <div className={styles.employeeInfo}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Base Salary</span>
                        <span className={styles.infoValue}>
                          {employers.find(
                            (emp) => emp.id === parseInt(employerId)
                          )?.salary || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {employerId && (
                <Card className={styles.sidebarCard}>
                  <Card.Body>
                    <h5 className={styles.sidebarTitle}>
                      <FaPlus className="me-2" /> Add New Adjustment
                    </h5>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className={styles.formGroup}>
                        <Form.Label>
                          <FaCalendarAlt className="me-2" /> Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={form.date}
                          onChange={handleFormChange}
                          required
                          className={styles.input}
                        />
                      </Form.Group>

                      <Form.Group className={styles.formGroup}>
                        <Form.Label>
                          <FaMoneyBillWave className="me-2" /> Value Type
                        </Form.Label>
                        <Form.Select
                          name="value_type"
                          value={form.value_type}
                          onChange={handleFormChange}
                          required
                          className={styles.select}
                        >
                          <option value="money">Money</option>
                          <option value="hours">Hours</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className={styles.formGroup}>
                        <Form.Label>
                          <FaInfoCircle className="me-2" /> Kind
                        </Form.Label>
                        <Form.Select
                          name="kind"
                          value={form.kind}
                          onChange={handleFormChange}
                          required
                          className={styles.select}
                        >
                          <option value="addition">Addition</option>
                          <option value="deduction">Deduction</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className={styles.formGroup}>
                        <Form.Label>
                          <FaClock className="me-2" /> Value
                          {form.value_type === "hours"
                            ? " (hours)"
                            : " (money)"}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="value"
                          value={form.value}
                          onChange={handleFormChange}
                          min="0.1" // Changed from "1" to allow smaller values
                          step={form.value_type === "hours" ? "0.1" : "0.01"} // Changed from "1" to "0.1"
                          required
                          className={styles.input}
                        />
                      </Form.Group>

                      <Form.Group className={styles.formGroup}>
                        <Form.Label>Reason</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="reason"
                          required
                          value={form.reason}
                          onChange={handleFormChange}
                          rows={4}
                          className={styles.textarea}
                        />
                      </Form.Group>

                      <Button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                      >
                        <FaPlus className="me-2" /> Add Adjustment
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              )}
            </Col>

            <Col lg={8} className={styles.mainContent}>
              {employerId && (
                <>
                  <Card className={styles.tableCard}>
                    <Card.Body>
                      <h5 className={styles.cardTitle}>Adjustments History</h5>
                      {loading && (
                        <div className={styles.loadingSpinner}>Loading...</div>
                      )}
                      {error && (
                        <Alert variant="danger" className={styles.alert}>
                          {error}
                        </Alert>
                      )}
                      {adjustments.length === 0 && !loading && !error && (
                        <div className={styles.noData}>
                          No adjustments found for this employer.
                        </div>
                      )}
                      {adjustments.length > 0 && (
                        <div className={styles.tableContainer}>
                          <Table hover responsive className={styles.table}>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Kind</th>
                                <th>Value</th>
                                <th>Reason</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {adjustments.map((adjustment) => (
                                <tr
                                  key={adjustment.id}
                                  className={styles.tableRow}
                                >
                                  <td>
                                    {new Date(
                                      adjustment.date
                                    ).toLocaleDateString()}
                                  </td>
                                  <td>
                                    <span
                                      className={`${styles.badge} ${
                                        adjustment.kind === "addition"
                                          ? styles.badgeAddition
                                          : styles.badgeDeduction
                                      }`}
                                    >
                                      {adjustment.kind}
                                    </span>
                                  </td>
                                  <td>{adjustment.value_type}</td>
                                  <td>
                                    {adjustment.value_type === "hours"
                                      ? `${Math.abs(adjustment.value)} hours`
                                      : `${Math.abs(adjustment.value)}`}
                                  </td>
                                  <td>{adjustment.reason}</td>
                                  <td>
                                    <div className={styles.actionButtons}>
                                      <button
                                        className={`${styles.actionButton} ${styles.editButton}`}
                                        onClick={() => handleEdit(adjustment)}
                                      >
                                        <FaEdit />
                                      </button>
                                      <button
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                        onClick={() =>
                                          handleDelete(adjustment.id)
                                        }
                                      >
                                        <FaTrashAlt />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </>
              )}
            </Col>
          </Row>

          {/* Edit Modal */}
          <Modal
            show={showEditModal}
            onHide={handleCloseModal}
            centered
            className={styles.modal}
          >
            <Modal.Header className={styles.modalHeader}>
              <Modal.Title className={styles.modalTitle}>
                <FaEdit className="me-2" /> Edit Adjustment
              </Modal.Title>
              <Button
                variant="link"
                className={styles.closeButton}
                onClick={handleCloseModal}
              >
                <FaTimes />
              </Button>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
              <Form onSubmit={handleModalSubmit}>
                <Row className={styles.formGrid}>
                  <Col md={6}>
                    <Form.Group className={styles.formGroup}>
                      <Form.Label>
                        <FaCalendarAlt className="me-2" /> Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleFormChange}
                        required
                        className={styles.input}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className={styles.formGroup}>
                      <Form.Label>
                        <FaMoneyBillWave className="me-2" /> Value Type
                      </Form.Label>
                      <Form.Select
                        name="value_type"
                        value={form.value_type}
                        onChange={handleFormChange}
                        required
                        className={styles.select}
                      >
                        <option value="money">Money</option>
                        <option value="hours">Hours</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className={styles.formGroup}>
                      <Form.Label>
                        <FaInfoCircle className="me-2" /> Kind
                      </Form.Label>
                      <Form.Select
                        name="kind"
                        value={form.kind}
                        onChange={handleFormChange}
                        required
                        className={styles.select}
                      >
                        <option value="addition">Addition</option>
                        <option value="deduction">Deduction</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className={styles.formGroup}>
                      <Form.Label>
                        <FaClock className="me-2" /> Value (
                        {form.value_type === "hours" ? "hours" : ""})
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="value"
                        value={form.value}
                        onChange={handleFormChange}
                        min="1"
                        step={form.value_type === "hours" ? "1" : "0.01"}
                        required
                        className={styles.input}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className={styles.formGroup}>
                      <Form.Label>Reason</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="reason"
                        value={form.reason}
                        onChange={handleFormChange}
                        rows={4}
                        className={styles.textarea}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {error && (
                  <Alert variant="danger" className={styles.alert}>
                    {error}
                  </Alert>
                )}
                <div className={styles.modalFooter}>
                  <Button
                    variant="secondary"
                    onClick={handleCloseModal}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Adjustment"}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </Container>
      </div>
    </>
  );
};

export default EmployerAdjustments;
