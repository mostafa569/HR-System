import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  message,
  Modal,
  Form,
  Row,
  Col,
  TimePicker,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { ClockCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import styles from "../styles/Attendance.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/Modal/ConfirmationModal";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    employee_name: "",
    department_id: undefined,
    date: "",
    start_date: "",
    end_date: "",
    sort_by: "date",
    sort_direction: "desc",
  });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [pendingEditValues, setPendingEditValues] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/departments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })
      .then((response) => {
        setDepartments(response.data.data);
        console.log("Departments fetched:", response.data.data);
      })
      .catch((error) => console.error("Error fetching departments:", error));

    axios
      .get("http://localhost:8000/api/employers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })
      .then((response) => setEmployers(response.data.data))
      .catch((error) => console.error("Error fetching employers:", error));
  }, []);

  const fetchAttendances = (page = 1, pageSize = 10) => {
    setLoading(true);
    const token = localStorage.getItem("userToken");
    if (!token) {
      message.error("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    const params = { page, per_page: pageSize, ...filters };
    Object.keys(params).forEach((key) =>
      params[key] === "" || params[key] === undefined ? delete params[key] : {}
    );
    console.log("Fetching with params:", params);

    axios
      .get("http://localhost:8000/api/attendances", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      })
      .then((response) => {
        setAttendances(response.data.data);
        setPagination({
          current: response.data.current_page,
          pageSize,
          total: response.data.total,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching attendances:", error);
        if (error.response && error.response.status === 401) {
          message.error("Unauthorized. Please log in again.");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAttendances(pagination.current, pagination.pageSize);
  }, [filters]);

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(newPagination);
    setFilters((prev) => ({
      ...prev,
      sort_by: sorter.field || "date",
      sort_direction: sorter.order === "ascend" ? "asc" : "desc",
    }));
    fetchAttendances(newPagination.current, newPagination.pageSize);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setFilters((prev) => ({
        ...prev,
        start_date: dates[0].format("YYYY-MM-DD"),
        end_date: dates[1].format("YYYY-MM-DD"),
        date: "",
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        start_date: "",
        end_date: "",
        date: "",
      }));
    }
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleAdd = (values) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      message.error("No token found. Please log in again.");
      return;
    }

    axios
      .post(
        "http://localhost:8000/api/attendances",
        {
          employer_id: values.employer_id,
          date: values.date.format("YYYY-MM-DD"),
          attendance_time: values.attendance_time.format("HH:mm"),
          leave_time: values.leave_time
            ? values.leave_time.format("HH:mm")
            : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        toast.success(response.data.message);
        setIsAddModalVisible(false);
        form.resetFields();
        fetchAttendances();
      })
      .catch((error) => {
        console.error("Error adding attendance:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toast.error(error.response.data.message);
        } else {
          toast.error("حدث خطأ غير متوقع");
        }
      });
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      employer_id: record.employer_id,
      date: moment(record.date),
      attendance_time: record.attendance_time
        ? moment(record.attendance_time, "HH:mm")
        : null,
      leave_time: record.leave_time ? moment(record.leave_time, "HH:mm") : null,
    });
  };

  const handleSaveEdit = () => {
    editForm.validateFields().then((values) => {
      setPendingEditValues(values);
      setIsConfirmModalVisible(true);
    });
  };

  const confirmEditSave = (applyAdjustment) => {
    if (!pendingEditValues) return;
    const values = pendingEditValues;
    const updatedRecord = {
      ...selectedRecord,
      ...values,
      attendance_time: values.attendance_time.format("HH:mm"),
      leave_time: values.leave_time ? values.leave_time.format("HH:mm") : null,
      apply_adjustment: applyAdjustment, // This is correctly passed
    };

    axios
      .put(
        `http://localhost:8000/api/attendances/${selectedRecord.id}`,
        updatedRecord,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      )
      .then(() => {
        toast.success("Attendance record updated");
        setIsEditModalVisible(false);
        setIsConfirmModalVisible(false);
        setPendingEditValues(null);
        fetchAttendances();
      })
      .catch((error) => {
        setIsConfirmModalVisible(false);
        setPendingEditValues(null);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Unexpected error occurred");
        }
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:8000/api/attendances/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })
      .then(() => {
        toast.success("Attendance record deleted");
        fetchAttendances();
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Unexpected error occurred");
        }
      });
  };

  const columns = [
    {
      title: "Employee Name",
      dataIndex: ["employer", "full_name"],
      sorter: true,
      key: "employer_id",
      width: 150,
    },
    {
      title: "Department",
      dataIndex: ["department", "name"],
      key: "department_id",
      width: 120,
    },
    {
      title: "Date",
      dataIndex: "date",
      sorter: true,
      key: "date",
      width: 120,
      render: (text) => moment(text).format("YYYY-MM-DD"),
    },
    {
      title: "Attendance Time",
      dataIndex: "attendance_time",
      sorter: true,
      key: "attendance_time",
      width: 120,
    },
    {
      title: "Leave Time",
      dataIndex: "leave_time",
      sorter: true,
      key: "leave_time",
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <div>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIconWrapper}>
            <ClockCircleOutlined className={styles.headerIcon} />
          </div>
          <div>
            <h1 className={styles.headerTitle}>Attendance Management</h1>
            <p className={styles.headerSubtitle}>
              <InfoCircleOutlined /> Manage employee attendance records and
              track working hours
            </p>
          </div>
        </div>
        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalVisible(true)}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(5px)",
          }}
        >
          Add Attendance
        </Button> */}
      </div>

      <div className={styles.filters}>
        <div>
          <Input
            placeholder="Search by employee name"
            style={{ width: 200, marginBottom: 10 }}
            onChange={(e) =>
              handleFilterChange("employee_name", e.target.value)
            }
          />
          <Select
            placeholder="Select department"
            style={{ width: 200, marginBottom: 10 }}
            onChange={(value) =>
              handleFilterChange("department_id", value || undefined)
            }
            allowClear
          >
            {departments.map((dept) => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>
          <DatePicker
            placeholder="Select date"
            style={{ width: 200, marginBottom: 10 }}
            onChange={(date) =>
              handleFilterChange("date", date ? date.format("YYYY-MM-DD") : "")
            }
          />
          <RangePicker
            style={{ width: 300, marginBottom: 10 }}
            onChange={handleDateRangeChange}
          />
        </div>
      </div>
      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={attendances}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          rowKey="id"
          bordered
          size="middle"
        />
      </div>
      <Modal
        title="Edit Attendance"
        visible={isEditModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
        }}
        width={500}
      >
        {selectedRecord && (
          <Form form={editForm} layout="vertical">
            <Form.Item
              name="employer_id"
              label="Employee"
              initialValue={selectedRecord.employer_id}
            >
              <Select disabled>
                {employers.map((emp) => (
                  <Option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="attendance_time"
              label={
                <span>
                  Attendance Time
                  <Tooltip title="Select attendance time">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </span>
              }
              initialValue={
                selectedRecord.attendance_time
                  ? moment(selectedRecord.attendance_time, "HH:mm")
                  : null
              }
              rules={[
                { required: true, message: "Please select attendance time" },
              ]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                minuteStep={5}
                use12Hours
                placeholder="Select time"
              />
            </Form.Item>
            <Form.Item
              name="leave_time"
              label={
                <span>
                  Leave Time
                  <Tooltip title="Must be after attendance time">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </span>
              }
              initialValue={
                selectedRecord.leave_time
                  ? moment(selectedRecord.leave_time, "HH:mm")
                  : null
              }
            >
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                minuteStep={5}
                use12Hours
                placeholder="Select time"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
      <Modal
        title="Add Attendance"
        visible={isAddModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="employer_id"
            label="Employee"
            rules={[{ required: true, message: "Please select an employee" }]}
          >
            <Select placeholder="Select an employee">
              {employers.map((emp) => (
                <Option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current > moment().endOf("day")
              }
            />
          </Form.Item>
          <Form.Item
            name="attendance_time"
            label={
              <span>
                Attendance Time
                <Tooltip title="Select attendance time">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
            rules={[
              { required: true, message: "Please select attendance time" },
            ]}
          >
            <TimePicker
              format="HH:mm"
              style={{ width: "100%" }}
              minuteStep={5}
              use12Hours
              placeholder="Select time"
            />
          </Form.Item>
          <Form.Item
            name="leave_time"
            label={
              <span>
                Leave Time
                <Tooltip title="Must be after attendance time">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
          >
            <TimePicker
              format="HH:mm"
              style={{ width: "100%" }}
              minuteStep={5}
              use12Hours
              placeholder="Select time"
            />
          </Form.Item>
        </Form>
      </Modal>
      <ToastContainer />
      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onConfirm}
        message={confirmMessage}
      />
      <ConfirmationModal
        isOpen={isConfirmModalVisible}
        title="Apply Adjustment?"
        message={
          <div>
            <p>
              Do you want to apply deduction/addition based on the new times?
            </p>
            <ul>
              <li>
                <b>Yes:</b> Adjustment will be added to the adjustments table.
              </li>
              <li>
                <b>No:</b> Only the times will be saved without any financial
                adjustment.
              </li>
            </ul>
          </div>
        }
        onConfirm={() => confirmEditSave(true)}
        confirmText="Save with Adjustment"
        onSecondaryAction={() => confirmEditSave(false)}
        secondaryText="Save without Adjustment"
        onClose={() => setIsConfirmModalVisible(false)}
      />
    </div>
  );
};

export default Attendance;
