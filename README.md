# Enum Airways — Airline Management System

Welcome to the **Enum Airways** project! This is an India-first airline management and flight reservation application designed for seamless domestic and international flight booking, seat selection, booking management, and baggage tracking.

---

## 1. Project Overview

Enum Airways provides a complete web interface for passengers, airline staff, and administrative users:
- **Passengers** can search flights across major Indian airports (Mumbai BOM, Delhi DEL, Bengaluru BLR, Chennai MAA, Kolkata CCU, Hyderabad HYD, Pune PNQ, Ahmedabad AMD), select seats, complete bookings, manage their tickets, and track baggage status.
- **Staff and Admins** can manage flight schedules, crew assignments, baggage statuses, and view analytics.

---

## 2. Technology Stack

- **Frontend (Client)**: React.js (v19), React Router (v7), Tailwind CSS
- **Backend (Server)**: Node.js, Express.js REST API
- **Database**: Oracle 21c Database (`oracledb` node driver)
- **Authentication**: JSON Web Tokens (JWT), `bcryptjs` password hashing

---

## 3. Data Flow Architecture

The application follows a standard full-stack architecture:

```
React Frontend (Client)
        ↓ HTTP / JSON requests
Express.js REST API (Server)
        ↓ oracledb driver
Oracle 21c Database
```

1. The **React Frontend** communicates with the Express backend using `axios` over HTTP.
2. The **Express Backend** receives requests, authenticates JWT tokens via middleware, and executes business logic in controllers and services.
3. The **Server Services** query the **Oracle Database** using the native `oracledb` pool driver.
4. JSON responses are sent back to the React UI.

---

## 4. Folder Structure

```
Airline-management/
│
├── client/                     # React Frontend Application
│   ├── public/                 # Static HTML entry point and icons (favicon, manifest)
│   ├── src/
│   │   ├── assets/             # Shared static images (logo)
│   │   ├── components/
│   │   │   ├── layout/         # Top-level layout wrappers (Navbar, Footer, ProtectedRoute)
│   │   │   ├── ui/             # Reusable UI components (DatePicker, PassengerSelector, LoadingSpinner, StatusBadge)
│   │   │   └── flights/        # Flight-specific UI cards (FlightCard)
│   │   ├── context/            # React Context providers (AuthContext, CurrencyContext)
│   │   ├── pages/              # Page view components
│   │   │   ├── auth/           # Login and Register screens
│   │   │   ├── booking/        # Search results, seat selection, checkout, confirmation, my bookings
│   │   │   ├── admin/          # Admin dashboard and flight management
│   │   │   ├── info/           # Help, Feedback, Baggage Tracker, Privacy, Terms, Baggage Rules
│   │   │   ├── Home.js         # Landing page & search widget
│   │   │   └── Profile.js      # User profile page
│   │   ├── services/           # Axios API configuration (`api.js`)
│   │   ├── App.js              # Main React App router component
│   │   ├── index.js            # React application mount point
│   │   └── index.css           # Global CSS and Tailwind setup
│   ├── .env.example            # Client environment variable template
│   └── package.json            # Client dependencies and scripts
│
├── server/                     # Express.js REST API Server
│   ├── controllers/            # Request handlers (processes inputs, returns HTTP responses)
│   ├── middleware/             # Express middlewares (JWT auth, role authorization, global error handler)
│   ├── routes/                 # Express endpoint route declarations
│   ├── services/               # Core business logic and database queries
│   ├── utils/                  # Helper functions, constants, and response formatters
│   ├── db.js                   # Oracle database pool connection helper
│   ├── server.js               # Express server entry point
│   ├── .env.example            # Server environment variable template
│   └── package.json            # Server dependencies and scripts
│
├── database/                   # Database Schemas & Initial Data
│   └── schema.sql              # Oracle DB table creation and seed data SQL script
│
├── .gitignore                  # Git ignore rules for node_modules, build, and .env files
└── README.md                   # Project documentation
```

---

## 5. Environment Variables Setup

Environment variables keep sensitive database credentials and secrets secure outside of version control.

### Server Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env` and update values if needed:
```env
NODE_ENV=development
PORT=5000

# Oracle Database Connection
DB_USER=system
DB_PASSWORD=your_oracle_password
DB_CONNECT_STRING=localhost:1521/XEPDB1

# JWT Authentication Secret
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=5h

# URLs
REACT_APP_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000/api
```

### Client Configuration (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 6. How to Run the Application

### Step 1: Initialize Database (Oracle 21c)
1. Make sure Oracle Database 21c XE is running locally.
2. Execute `database/schema.sql` in your Oracle SQL tool (e.g. SQL*Plus, SQL Developer, or VS Code Oracle Extension).

### Step 2: Start the Backend Server
```bash
cd server
npm install
npm start
```
The backend server will start at `http://localhost:5000`.

### Step 3: Start the Frontend Application
In a new terminal window:
```bash
cd client
npm install
npm start
```
The React app will open automatically at `http://localhost:3000`.

---

## 7. Build for Production

To create an optimized production build of the React frontend:
```bash
cd client
npm run build
```
The static build output will be generated in `client/build/`.
