import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { FaUsersCog, FaUserCheck, FaTasks, FaCalendarAlt } from 'react-icons/fa';
import '../../App.css'; 

export default function Home() {
  const { darkMode } = useOutletContext();

  return (
    <div className={`p-4 ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Welcome Header */}
      <h1 className="mb-4 dashboard-title">HR Dashboard</h1>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="mb-3 card-employees modern-card">
            <Card.Body>
              <Card.Title className="card-title-modern">
                <FaUsersCog className="me-2 icon-employees animate-icon" style={{ fontSize: '1.8rem' }} /> Total Employees
              </Card.Title>
              <Card.Text className="display-5 fw-bold">150</Card.Text>
              <Card.Text>
                <Badge bg={darkMode ? 'employees-dark' : 'employees-light'}>+5 this month</Badge>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3 card-attendance modern-card">
            <Card.Body>
              <Card.Title className="card-title-modern">
                <FaUserCheck className="me-2 icon-attendance animate-icon" style={{ fontSize: '1.8rem' }} /> Attendance Today
              </Card.Title>
              <Card.Text className="display-5 fw-bold">92%</Card.Text>
              <Card.Text>
                <Badge bg={darkMode ? 'attendance-dark' : 'attendance-light'}>On Track</Badge>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3 card-requests modern-card">
            <Card.Body>
              <Card.Title className="card-title-modern">
                <FaTasks className="me-2 icon-requests animate-icon" style={{ fontSize: '1.8rem' }} /> Pending Requests
              </Card.Title>
              <Card.Text className="display-5 fw-bold">12</Card.Text>
              <Card.Text>
                <Badge bg={darkMode ? 'requests-dark' : 'requests-light'}>Action Required</Badge>
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
              <Card.Title className="card-title-modern">Recent Activity</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item className={darkMode ? 'bg-dark text-white activity-item' : 'activity-item'}>
                  New employee <strong>John Doe</strong> added to Sales on 06/02/2025.
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? 'bg-dark text-white activity-item' : 'activity-item'}>
                  Leave request approved for <strong>Jane Smith</strong> on 06/01/2025.
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? 'bg-dark text-white activity-item' : 'activity-item'}>
                  Department meeting scheduled for 06/10/2025.
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-3 card-holidays modern-card">
            <Card.Body>
              <Card.Title className="card-title-modern">
                <FaCalendarAlt className="me-2 icon-holidays animate-icon" style={{ fontSize: '1.8rem' }} /> Upcoming Holidays
              </Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item className={darkMode ? 'bg-dark text-white holiday-item' : 'holiday-item'}>
                  Independence Day - 07/04/2025
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? 'bg-dark text-white holiday-item' : 'holiday-item'}>
                  Company Retreat - 08/15/2025
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? 'bg-dark text-white holiday-item' : 'holiday-item'}>
                  Labor Day - 09/01/2025
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}