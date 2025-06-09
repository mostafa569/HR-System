import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import styles from './adminHr.module.css';

const HRControl = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('userToken');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/hrs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
      console.log(err);
    }
  };

  return (
     <div className={styles.content}>
    <div className="container mt-5">
    <Sidebar></Sidebar>
    <Navbar></Navbar>
      <h2 className="mb-4">All HRs & Super Admins</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
    </div> 
  );
};

export default HRControl;
