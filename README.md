# KosherStay - Hotel Booking Platform (PoC)

KosherStay is a premium hotel and vacation rental booking platform tailored for users who observe Jewish dietary and religious laws (Kashrut and Shabbat). 

This repository contains the Proof of Concept (PoC) featuring a Python/FastAPI backend and a React/Vite frontend.

---

## 🌟 Key Features

- **Super Admin Dashboard:** Manage property owners, customers, and oversee all platform properties.
- **Property Owner (Admin) Panel:** Register properties, manage kosher amenities, configure days plans, and accept/reject customer bookings.
- **Shabbat-Aware Calendar:** Built-in tools for property owners to automatically block Fridays and Saturdays for Shabbat.
- **Customer Portal:** Search properties by pincode, view images, and book stays.
- **Premium UI:** Custom-built, responsive user interface utilizing a rich navy, gold, and ivory color palette.

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, JWT Authentication.
- **Frontend:** React, Vite, React Router, Context API, Vanilla CSS (Custom Design System).

---

## 🚀 Getting Started (PoC Setup)

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **PostgreSQL**

### 1. Database Setup

1. Ensure PostgreSQL is installed and running on your machine.
2. Create a new database for the application (e.g., `kosherstay`).

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy psycopg2-binary passlib bcrypt python-jose python-multipart
   ```
4. Configure your environment variables. Ensure there is a `.env` file in the `backend` directory with your database credentials:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/kosherstay
   SECRET_KEY=your_super_secret_jwt_key
   ```
5. Start the backend development server:
   ```bash
   uvicorn main:app --reload
   ```
   *The API will run at `http://localhost:8000`. You can access the interactive Swagger API documentation at `http://localhost:8000/docs`.*

### 3. Frontend Setup

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔐 Authentication & Testing

For the PoC, the platform uses Role-Based Access Control (RBAC) with three distinct roles: `super_admin`, `hotel_admin` (Property Owner), and `customer`.

**To test the platform:**
1. Navigate to `http://localhost:8000/docs` (Swagger UI).
2. Use the `/auth/register` endpoint to create a `super_admin` account.
   - *Example payload:* `{"name": "Admin", "email": "admin@test.com", "password": "admin", "role": "super_admin"}`
3. Log into the frontend using the newly created credentials.
4. From the Super Admin dashboard, you can create new Property Owners or Customers.

> **Note on Passwords:** If you use simple passwords like `admin123` during the PoC, your browser's password manager (like Google Chrome) may show a "Data Breach" warning and block the form submission. If this happens, simply use a different password or dismiss the browser warning.

---

## 📁 Project Structure

```text
Kosher Demo/
├── backend/                  # FastAPI Application
│   ├── main.py               # Application entry point
│   ├── auth.py               # JWT and security logic
│   ├── database.py           # SQLAlchemy setup
│   ├── models.py             # Database schemas
│   ├── routers/              # API endpoints (auth, properties, bookings)
│   └── .env                  # Backend configuration
│
└── frontend/                 # React + Vite Application
    ├── src/
    │   ├── api/              # Axios API clients
    │   ├── components/       # Reusable UI components (Sidebars, etc.)
    │   ├── context/          # React Context (AuthContext)
    │   ├── pages/            # Page views (SuperAdmin, Admin, Customer)
    │   ├── App.jsx           # Routing configuration
    │   └── index.css         # Global design system and custom styling
    └── package.json          # Node dependencies
```
