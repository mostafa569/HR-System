import { useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import EmployerList from "./features/employers/pages/EmployerList";
import CreateEmployer from "./features/employers/pages/CreateEmployer";
import EditEmployer from "./features/employers/pages/EditEmployer";
import EmployerAdjustments from "./features/employers/pages/EmployerAdjustments";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/employers" element={<EmployerList />} />
        <Route path="/employers/create" element={<CreateEmployer />} />
        <Route path="/employers/:id/edit" element={<EditEmployer />} />
        <Route
          path="/employers/:id/adjustments"
          element={<EmployerAdjustments />}
        />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
