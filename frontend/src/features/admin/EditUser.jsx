import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Card } from 'react-bootstrap';
import { BsArrowLeftCircle } from 'react-icons/bs';
import styles from './AddEditUser.module.css';

const EditUser = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const token = localStorage.getItem('userToken');
  const currentUser = JSON.parse(localStorage.getItem('userData'));

  const [user, setUser] = useState({
    full_name: '',
    username:'',
    email: '',
    password:'',
    role: '',
  });
  const [originalUser, setOriginalUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/hrs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOriginalUser(res.data);
        setUser(res.data);
      } catch (err) {
        toast.error('Error fetching user.');
      }
    };

    fetchUser();
  }, [id]);

const checkUsernameUnique = async (username) => {
  try {
    const res = await axios.get('http://localhost:8000/api/hrs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const exists = res.data.some(user => user.username === username);
    return exists;
  } catch (err) {
    console.error('Error checking username:', err);
    return true;
  }
};

 const checkEmailUnique = async (email) => {
  try {
    const res = await axios.get('http://localhost:8000/api/hrs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const exists = res.data.some(user => user.email === email);
    return exists;
  } catch (err) {
    console.error('Error checking email:', err);
    return true;
  }
};



  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
     e.preventDefault();
    const usernameExists = await checkUsernameUnique(user.username);
    if (usernameExists && user.username !== originalUser.username) {
      toast.error('Username is already taken');
      return;
    }

    const emailExists = await checkEmailUnique(user.email);
    if (emailExists && user.email !== originalUser.email) {
      toast.error('Email is already taken');
      return;
    }

   
    try {
      await axios.put(
        `http://localhost:8000/api/hrs/${id}`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('User updated successfully!');
      navigate('/super-admin-control');
    } catch (err) {
      console.error(err);
      toast.error('Error updating user.');
    }
  };

  return (
    // <Container className="mt-5">
      <div className={styles.cardBox}>
                <div className={styles.cardHeader}>
                    <div>
                    <h2 className="mb-2">Edit A User</h2>
                    <p className="mb-0">Edit an exist account</p>
                    </div>
                    {/* <div className="d-flex justify-content-end mb-3"> */}
                    <div className="d-flex justify-content-between align-items-center ">
                            <div className="mb-3">
                    <Button
                      className={styles.backbutton}
                      variant="primary"
                      style={{ background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)', border: 'none' }}
                      onClick={() => navigate('/super-admin-control')}
                    >
                      <BsArrowLeftCircle className="me-1" /> Back
                    </Button>
                    </div>
                    {/* </div> */}
                  </div>
                </div>
      <div className={styles.content}>
      <Card className="shadow-sm " style={{ background: 'transparent', border: 'none' }}>
      <Card.Body>
      
      <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
          <Form.Label className={styles.customLabel}>Full Name:</Form.Label>
          <Form.Control
            type="text"
            name="full_name"
            value={user.full_name|| ''}
            onChange={handleChange}
            // required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className={styles.customLabel}>User Name:</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={user.username|| ''}
            onChange={handleChange}
            // required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className={styles.customLabel}>Email:</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={user.email ||''}
            onChange={handleChange}
            // required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className={styles.customLabel}>Password:</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={user.password||''}
            onChange={handleChange}
            // required
          />
        </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className={styles.customLabel}>Role:</Form.Label>
            <Form.Select name="role" value={user.role|| ''} onChange={handleChange} disabled={user.role === 'super admin'} >
              <option value="hr">HR</option>
              <option value="super admin">Super Admin</option>
            </Form.Select>
          </Form.Group>

        <Button className={styles.addbutton} variant="success" type="submit">
          Save Changes
        </Button>
      </Form>
      </Card.Body>
      </Card>
      </div>
      </div>
    // </Container>
  );
};

export default EditUser;
