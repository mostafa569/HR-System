import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, Row, Col, ListGroup, Badge } from "react-bootstrap";
import {
  FaUsersCog,
  FaUserCheck,
  FaTasks,
  FaCalendarAlt,
} from "react-icons/fa";
import "../../App.css";
import axios from "axios";

export default function Home() {
  const { darkMode } = useOutletContext();
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recent_employers: [],
    attendance_today: {},
    upcoming_holidays: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.get(
          "http://localhost:8000/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);
  
  return (
    <div className={`p-4 ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* Welcome Header */}
      <h1 className="mb-4 dashboard-title">HR Dashboard</h1>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="mb-3 card-employees modern-card">
            <Card.Body>
              <Card.Title className="card-title-modern">
                <FaUsersCog
                  className="me-2 icon-employees animate-icon"
                  style={{ fontSize: "1.8rem" }}
                />{" "}
                Total Employees
              </Card.Title>
              <Card.Text className="display-5 fw-bold">
                {dashboardData.stats.total_employees || 0}
              </Card.Text>
              <Card.Text>
                <Badge bg={darkMode ? "employees-dark" : "employees-light"}>
                  {dashboardData.stats.total_departments || 0} Departments
                </Badge>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3 card-attendance modern-card">
            <Card.Body>
              <Card.Title className="card-title-modern">
                <FaUserCheck
                  className="me-2 icon-attendance animate-icon"
                  style={{ fontSize: "1.8rem" }}
                />{" "}
                Attendance Today
              </Card.Title>
              <Card.Text className="display-5 fw-bold">
                {dashboardData.attendance_today?.percentage || 0}%
              </Card.Text>
              <Card.Text>
                <Badge bg={darkMode ? "attendance-dark" : "attendance-light"}>
                  {dashboardData.attendance_today?.present || 0} Present
                </Badge>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3 card-requests modern-card">
            <Card.Body>
              <Card.Title className="card-title-modern">
                <FaTasks
                  className="me-2 icon-requests animate-icon"
                  style={{ fontSize: "1.8rem" }}
                />{" "}
                Late Today
              </Card.Title>
              <Card.Text className="display-5 fw-bold">
                {dashboardData.attendance_today?.late || 0}
              </Card.Text>
              <Card.Text>
                <Badge bg={darkMode ? "requests-dark" : "requests-light"}>
                  {dashboardData.attendance_today?.absent || 0} Absent
                </Badge>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity and Upcoming Holidays */}
      <Row>
        <Col md={6}>
          <Card className="mb-3 card-activity modern-card">
            <Card.Body>
              <Card.Title className="card-title-modern">
                Recent Employees
              </Card.Title>
              <ListGroup variant="flush">
                {dashboardData.recent_employers?.map((employer) => (
                  <ListGroup.Item
                    key={employer.id}
                    className={
                      darkMode
                        ? "bg-dark text-white activity-item"
                        : "activity-item"
                    }
                  >
                    New employee <strong>{employer.name}</strong> added to{" "}
                    {employer.department} on{" "}
                    {new Date(employer.join_date).toLocaleDateString("en-GB")}.
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-3 card-holidays modern-card">
            <Card.Body>
              <Card.Title className="card-title-modern">
                <FaCalendarAlt
                  className="me-2 icon-holidays animate-icon"
                  style={{ fontSize: "1.8rem" }}
                />{" "}
                Upcoming Holidays
              </Card.Title>
              <ListGroup variant="flush">
                {dashboardData.upcoming_holidays?.map((holiday) => (
                  <ListGroup.Item
                    key={holiday.id}
                    className={
                      darkMode
                        ? "bg-dark text-white holiday-item"
                        : "holiday-item"
                    }
                  >
                    {holiday.type === "weekly"
                      ? "Weekly Holiday"
                      : holiday.name}
                    {"   - Official -  "}-{" "}
                    {new Date(holiday.date).toLocaleDateString("en-GB")}
                    {holiday.day && ` (${holiday.day})`}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
