import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const HRDashboard = () => {
  const [users, setUsers] = useState([]);

  const token = localStorage.getItem('userToken');

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/hrs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">All HRs & Super Admins</h2>
      <table className="table table-bordered table-striped">
        <thead className="thead-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((hr, index) => (
            <tr key={hr.id}>
              <td>{index + 1}</td>
              <td>{hr.name}</td>
              <td>{hr.email}</td>
              <td>{hr.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HRDashboard;
