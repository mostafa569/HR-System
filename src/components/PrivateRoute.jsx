import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';

const PrivateRoute = () => {
  const token = localStorage.getItem('userToken');
  
  if (!token) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;