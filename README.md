# HR Management System

A comprehensive HR Management System built with a modern technology stack, featuring a Laravel backend and a React frontend. This system provides a wide range of features to streamline HR processes, from employee management to payroll calculation.

## ✨ Features

- **Authentication:** Secure HR login and token-based authentication.
- **Dashboard:** An overview of key HR statistics, including employee count, attendance, and upcoming holidays.
- **HR Management:** CRUD operations for HR users (Super Admin and HR roles).
- **Department Management:** Create, read, update, and delete company departments.
- **Employee Management:** Full CRUD functionality for employee records.
- **Attendance Tracking:** Mark employee attendance (arrival and departure).
- **Holiday Management:** Manage and list company holidays.
- **Salary & Adjustments:** Calculate employee salaries, manage adjustments (bonuses/deductions), and view salary summaries.
- **AI Chatbot:** An integrated chatbot to assist with HR-related queries.

## 🛠️ Tech Stack

### Backend (Laravel)

- PHP 8.2+ / Laravel 12
- Laravel Sanctum for API authentication
- MySql for the database
- `smalot/pdfparser` for PDF processing (likely for the chatbot)

### Frontend (React)

- React 19
- Vite as a build tool
- React Router for navigation
- Axios for API communication
- Bootstrap & React-Bootstrap for UI components
- Recharts for data visualization
- `react-toastify` for notifications

## 📂 Project Structure

The project is a monorepo with two main directories:

- `backend/`: Contains the Laravel application that serves the API.
- `frontend/`: Contains the React single-page application that consumes the API.

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js & npm

### 1. Backend Setup

First, navigate to the backend directory and set it up.

```bash
# 1. Go to the backend directory
cd backend

# 2. Install PHP dependencies
composer install

# 3. Create the environment file by copying the example
cp .env.example .env


### 2. Frontend Setup

Next, set up the frontend in a separate terminal.

```bash
# 1. Go to the frontend directory
cd frontend

# 2. Install Node.js dependencies
npm install
```

### 3. Running the Application

You need to run both the backend and frontend servers simultaneously.

**To run the backend:**
From the `backend` directory, run the Laravel server. This will typically start the API on `http://127.0.0.1:8000`.

```bash
# From ./backend
php artisan serve
```

**To run the frontend:**
From the `frontend` directory, run the Vite development server. This will start the React application, usually on `http://localhost:5173`.

```bash
# From ./frontend
npm run dev
```

Now, you can open your browser and navigate to the frontend URL to use the application. The React app is configured to communicate with the backend API running on port 8000.