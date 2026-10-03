import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import FlightResults from './pages/booking/FlightResults';
import SeatSelection from './pages/booking/SeatSelection';
import BaggageTracker from './pages/info/BaggageTracker';
import ManageBooking from './pages/booking/ManageBooking';
import Feedback from './pages/info/Feedback';
import Help from './pages/info/Help';
import Privacy from './pages/info/Privacy';
import Terms from './pages/info/Terms';
import BaggageRules from './pages/info/BaggageRules';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Protected Passenger Pages
import Checkout from './pages/booking/Checkout';
import BookingConfirmation from './pages/booking/BookingConfirmation';
import MyBookings from './pages/booking/MyBookings';
import Profile from './pages/Profile';

// Admin / Staff Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFlights from './pages/admin/AdminFlights';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#172B4D] font-sans selection:bg-[#0052CC] selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/flights" element={<FlightResults />} />
                <Route path="/booking/seats" element={<SeatSelection />} />
                <Route path="/baggage" element={<BaggageTracker />} />
                <Route path="/manage-booking" element={<ManageBooking />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/help" element={<Help />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/baggage-rules" element={<BaggageRules />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Passenger Routes */}
                <Route
                  path="/booking/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking/confirmation/:bookingId"
                  element={
                    <ProtectedRoute>
                      <BookingConfirmation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Staff / Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/flights"
                  element={
                    <ProtectedRoute requiredRole="Staff">
                      <AdminFlights />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
