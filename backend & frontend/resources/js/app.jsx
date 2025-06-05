import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import HolidayList from './components/HolidayList';

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <HolidayList />
  </React.StrictMode>
);
