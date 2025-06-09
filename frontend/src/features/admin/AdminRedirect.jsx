// // src/pages/AdminRedirect.jsx
// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const AdminRedirect = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const userData = JSON.parse(localStorage.getItem('userData'));
//     if (!userData) {
//       navigate('/login');
//     } else if (userData.role === 'super admin') {
//       navigate('/super-admin-control');
//     } else if (userData.role === 'hr') {
//       navigate('/hr-control');
//     } else {
//       navigate('/unauthorized'); 
//     }
//   }, [navigate]);

//   return null;
// };

// export default AdminRedirect;
