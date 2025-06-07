import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  ListGroup,
  Badge,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import {
  FaUsersCog,
  FaUserCheck,
  FaCalendarAlt,
  FaSyncAlt,
  FaUserPlus,
  FaUserClock,
  FaBuilding,
} from "react-icons/fa";
import { format, parseISO } from "date-fns";
import "../../App.css";

export default function Home() {
  const { darkMode } = useOutletContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("userToken");

      if (!authToken) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/dashboard", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    const date = parseISO(dateString);
    return format(date, "MMM dd, yyyy");
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return "ممتاز";
    if (percentage >= 75) return "جيد";
    if (percentage >= 50) return "متوسط";
    return "ضعيف";
  };

  if (loading && !dashboardData) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner
          animation="border"
          variant={darkMode ? "light" : "dark"}
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="danger" className="mt-3">
          <Alert.Heading>خطأ في تحميل بيانات لوحة التحكم</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchDashboardData}>
            <FaSyncAlt className="me-2" />
            إعادة المحاولة
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`p-4 ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="dashboard-title m-0">لوحة تحكم الموارد البشرية</h1>
        <div className="d-flex align-items-center">
          {lastUpdated && (
            <small className="text-muted me-3">
              آخر تحديث: {format(lastUpdated, "hh:mm a")}
            </small>
          )}
          <Button
            variant={darkMode ? "outline-light" : "outline-secondary"}
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? "spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
            <Card.Body className="d-flex align-items-center">
              <div
                className={`icon-container ${
                  darkMode ? "bg-dark" : "bg-light"
                }`}
              >
                <FaUsersCog className="text-primary" size={24} />
              </div>
              <div className="ms-3">
                <Card.Title className="mb-1 text-muted">
                  إجمالي الموظفين
                </Card.Title>
                <Card.Text className="display-6 fw-bold mb-0">
                  {dashboardData?.stats?.total_employees || 0}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
            <Card.Body className="d-flex align-items-center">
              <div
                className={`icon-container ${
                  darkMode ? "bg-dark" : "bg-light"
                }`}
              >
                <FaBuilding className="text-info" size={24} />
              </div>
              <div className="ms-3">
                <Card.Title className="mb-1 text-muted">الأقسام</Card.Title>
                <Card.Text className="display-6 fw-bold mb-0">
                  {dashboardData?.stats?.total_departments || 0}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
            <Card.Body className="d-flex align-items-center">
              <div
                className={`icon-container ${
                  darkMode ? "bg-dark" : "bg-light"
                }`}
              >
                <FaUserCheck className="text-success" size={24} />
              </div>
              <div className="ms-3">
                <Card.Title className="mb-1 text-muted">
                  الحضور اليوم
                </Card.Title>
                <Card.Text className="display-6 fw-bold mb-0">
                  {dashboardData?.stats?.attendance_today || 0}%
                </Card.Text>
                <div className="d-flex align-items-center">
                  <Badge bg={darkMode ? "success" : "success"} className="me-2">
                    {getAttendanceStatus(
                      dashboardData?.stats?.attendance_today || 0
                    )}
                  </Badge>
                  <small>
                    {dashboardData?.stats?.present_today || 0}/
                    {dashboardData?.stats?.total_employees || 0}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
            <Card.Body className="d-flex align-items-center">
              <div
                className={`icon-container ${
                  darkMode ? "bg-dark" : "bg-light"
                }`}
              >
                <FaUserClock className="text-warning" size={24} />
              </div>
              <div className="ms-3">
                <Card.Title className="mb-1 text-muted">
                  متأخرون اليوم
                </Card.Title>
                <Card.Text className="display-6 fw-bold mb-0">
                  {dashboardData?.stats?.late_today || 0}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Employees and Upcoming Holidays */}
      <Row className="g-3">
        <Col md={6}>
          <Card className={darkMode ? "bg-dark" : ""}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">أحدث الموظفين</h5>
              <FaUserPlus className="text-primary" />
            </Card.Header>
            <ListGroup variant="flush">
              {dashboardData?.recent_employers?.map((employer) => (
                <ListGroup.Item
                  key={employer.id}
                  className={darkMode ? "bg-dark text-light" : ""}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{employer.name}</h6>
                      <small className="text-muted">
                        {employer.department} • {formatDate(employer.join_date)}
                      </small>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col md={6}>
          <Card className={darkMode ? "bg-dark" : ""}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">العطلات القادمة</h5>
              <FaCalendarAlt className="text-primary" />
            </Card.Header>
            <ListGroup variant="flush">
              {dashboardData?.upcoming_holidays?.map((holiday) => (
                <ListGroup.Item
                  key={holiday.id}
                  className={darkMode ? "bg-dark text-light" : ""}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{holiday.name}</h6>
                      <small className="text-muted">
                        {formatDate(holiday.date)} • {holiday.day}
                      </small>
                    </div>
                    <Badge bg="info">{holiday.type}</Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
