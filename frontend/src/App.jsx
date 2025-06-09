import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout/Layout";
import Home from "./features/Home/Home";
import Login from "./features/auth/pages/Login";
// import AdminRedirect from "./features/admin/AdminRedirect.jsx";
import SuperAdminControl from "./features/admin/SuperAdminControl.jsx";
import HRControl from "./features/admin/HRControl.jsx";
import AddUser from './features/admin/AddUser.jsx'
import EditUser from "./features/admin/EditUser.jsx";
import HolidayList from "./features/Holidays/HolidayList.jsx";
import EmployerList from "./features/employers/pages/EmployerList";
import CreateEmployer from "./features/employers/pages/CreateEmployer";
import EditEmployer from "./features/employers/pages/EditEmployer";
import EmployerAdjustments from "./features/employers/pages/EmployerAdjustments";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="/holidays" element={<HolidayList />} />
          <Route path="/employers" element={<EmployerList />} />
          <Route path="/employers/create" element={<CreateEmployer />} />
          <Route path="/employers/:id/edit" element={<EditEmployer />} />
          <Route
            path="/employers/:id/adjustments"
            element={<EmployerAdjustments />}
          />
        <Route path="/super-admin-control" element={<SuperAdminControl />} />
        <Route path="/hr-control" element={<HRControl />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/edit-user/:id" element={<EditUser />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
        {/* <Route path="/admin" element={<AdminRedirect />} /> */}

      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;
