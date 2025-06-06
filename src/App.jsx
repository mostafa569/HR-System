import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "./App.css";
import Layout from './components/Layout/Layout';
import Home from './features/Home/Home';
import Login from "./features/auth/pages/Login";
import HolidayList from "./features/Holidays/HolidayList.jsx";
import EmployerList from "./features/employers/pages/EmployerList";
import CreateEmployer from "./features/employers/pages/CreateEmployer";
import EditEmployer from "./features/employers/pages/EditEmployer";
import EmployerAdjustments from "./features/employers/pages/EmployerAdjustments";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  

  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
            <Route path="/holidays" element={<HolidayList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/employers" element={<EmployerList />} />
            <Route path="/employers/create" element={<CreateEmployer />} />
            <Route path="/employers/:id/edit" element={<EditEmployer />} />
            <Route
              path="/employers/:id/adjustments"
              element={<EmployerAdjustments />}
            />
          </Route>
      </Routes>
      <ToastContainer />
      
      </BrowserRouter>
    
  );
}

export default App;
