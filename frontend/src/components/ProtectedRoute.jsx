import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!token) {
      toast.error("Please login to access this page");
    }
  }, [token]);

  if (!token) {
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
