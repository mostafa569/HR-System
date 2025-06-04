import React, { useState } from 'react';
import styles from '../styles/Login.module.css';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { toast } from 'react-toastify';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
//   const [msgError, setMsgError] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is not valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!/^\w{6,}$/.test(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };


  const handleSubmit = async (e) => {
   

    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
     

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const res = await loginUser(formData);
         console.log('Login Response:', res);
         if (res.message === 'Logged in successfully') {
          toast.success('Logged in successfully');
          localStorage.setItem('userToken', res.token);
          navigate('/employers'); // Explicitly navigate to employers page
      
          console.log('Saved Token:', res.token);
            console.log('From Local Storage:', localStorage.getItem('userToken'));

          setTimeout(() => {
            navigate('/employer');
          }, 1000);
        }
      } catch (err) {
        console.log('Login Error:', err);
        toast.error(err.response?.data?.message || 'Login failed');
        setMessage(err.response?.data?.message || 'Login failed');
        setMessageType('error');

        // setMsgError(err.response?.data?.message || 'Login failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <section className={styles.loginSection}>
      <div className={styles.sectionLayer}>
        <div className="container">
          <h1>Login Now</h1>
          <form onSubmit={handleSubmit}>
            <div className="my-4 form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-control p-2"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <div className="alert alert-danger">{errors.email}</div>}
            </div>

            <div className="my-4 form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control p-2"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {errors.password && <div className="alert alert-danger">{errors.password}</div>}
            </div>

            <button type="submit"  disabled={isLoading}>
              Login {isLoading && <span><i className="fas fa-spin fa-spinner"></i></span>}
            </button>
                        {/* {message && (
                            <p className={`alert alert-${messageType === 'success' ? 'success' : 'danger'}  fade-in m-0`}>
                               {message}
                            </p>
                        )} */}

            {/* {msgError && <p className="alert alert-danger w-100 m-0">{msgError}</p>} */}
          </form>
        </div>
      </div>
    </section>
    // </section>
  );
};

export default Login;
