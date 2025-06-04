import { useState } from 'react'

import './App.css'
import { Routes, Route } from 'react-router-dom';
import Login from './features/auth/pages/Login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
        <Route path="/login" element={<Login />} />


    </Routes>
    <ToastContainer />
    </>
  )
}

export default App;
