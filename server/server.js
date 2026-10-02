// ============================================
// EXPRESS SERVER - AIRLINE MANAGEMENT SYSTEM
// COMPLETE: PHASES 1-5 (ALL FEATURES)
// ============================================

const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { initializeDatabase } = require('./db');
const errorHandler = require('./middleware/errorHandler');

// Routes - ALL PHASES
const authRoutes = require('./routes/auth.routes');
const flightRoutes = require('./routes/flights.routes');
const airportRoutes = require('./routes/airports.routes');
const bookingRoutes = require('./routes/bookings.routes');
const paymentRoutes = require('./routes/payments.routes');
const passengerRoutes = require('./routes/passengers.routes');
const baggageRoutes = require('./routes/baggage.routes');
const crewRoutes = require('./routes/crew.routes');
const adminRoutes = require('./routes/admin.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const currencyRoutes = require('./routes/currency.routes');

const app = express();
const PORT = process.env.PORT || 5000;
const REACT_URL = process.env.REACT_APP_URL || 'http://localhost:3000';

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: REACT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// API ROUTES - COMPLETE
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/baggage', baggageRoutes);
app.use('/api/crews', crewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/currency', currencyRoutes);

// ============================================
// 404 - ROUTE NOT FOUND
// ============================================

app.use((req, res) => {
  console.warn(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: 'NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// ============================================
// GLOBAL ERROR HANDLER (Must be last)
// ============================================

app.use(errorHandler);

// ============================================
// DATABASE INITIALIZATION & SERVER START
// ============================================

const startServer = async () => {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     AIRLINE MANAGEMENT SYSTEM - BACKEND SERVER             ║');
    console.log('║              ALL PHASES COMPLETE (1-5)                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📦 Initializing Oracle 21c database connection pool...');
    await initializeDatabase();
    console.log('✓ Oracle database connected successfully\n');

    const server = app.listen(PORT, () => {
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║                   🚀 SERVER READY                          ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`📍 API Base:   http://localhost:${PORT}/api`);
      console.log(`📍 Health:     http://localhost:${PORT}/api/health`);
      console.log(`📍 Frontend:   ${REACT_URL}\n`);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('📚 AVAILABLE ENDPOINTS:\n');

      console.log('🔐 AUTHENTICATION (Public)');
      console.log('   POST   /api/auth/register              Register new user');
      console.log('   POST   /api/auth/login                 Login & get token');
      console.log('   GET    /api/auth/profile               Get profile (protected)\n');

      console.log('✈️  FLIGHTS (Public)');
      console.log('   GET    /api/flights                    List all flights');
      console.log('   GET    /api/flights/search             Search by route & date');
      console.log('   GET    /api/flights/:flightId          Get flight details');
      console.log('   GET    /api/flights/:flightId/seats    Get available seats\n');

      console.log('🏢 AIRPORTS (Public)');
      console.log('   GET    /api/airports                   List all airports');
      console.log('   GET    /api/airports/search            Search airports');
      console.log('   GET    /api/airports/:code             Get by IATA code\n');

      console.log('🎫 BOOKINGS (Protected)');
      console.log('   POST   /api/bookings                   Create booking');
      console.log('   GET    /api/bookings/:bookingId        Get booking details');
      console.log('   GET    /api/bookings/user/my-bookings  Get my bookings');
      console.log('   DELETE /api/bookings/:bookingId        Cancel booking\n');

      console.log('🎟️  TICKETS (Protected)');
      console.log('   POST   /api/bookings/tickets           Create ticket (select seat)');
      console.log('   GET    /api/bookings/tickets/:ticketId Get ticket details\n');

      console.log('💳 PAYMENTS');
      console.log('   POST   /api/payments/simulate          Process mock payment');
      console.log('   GET    /api/payments/:paymentId        Get payment details\n');

      console.log('👤 PASSENGERS (Protected)');
      console.log('   POST   /api/passengers                 Create passenger profile');
      console.log('   GET    /api/passengers/me              Get own profile');
      console.log('   PUT    /api/passengers/me              Update own profile');
      console.log('   GET    /api/passengers                 List all (admin only)');
      console.log('   GET    /api/passengers/:id             Get details (admin only)\n');

      console.log('🧳 BAGGAGE');
      console.log('   POST   /api/baggage                    Create baggage entry');
      console.log('   GET    /api/baggage/:baggageId         Get baggage details');
      console.log('   GET    /api/baggage/tracking/:trackNum Get by tracking (public)');
      console.log('   PATCH  /api/baggage/:id/status         Update status (staff/admin)');
      console.log('   GET    /api/flights/:id/baggage        Get flight baggage (staff/admin)\n');

      console.log('👥 CREW (Protected)');
      console.log('   POST   /api/crews/flights/:id          Assign crew (admin only)');
      console.log('   GET    /api/flights/:id/crew           Get flight crew (public)');
      console.log('   GET    /api/crews/user/:id/flights     Get crew member flights');
      console.log('   DELETE /api/crews/assignments/:id      Remove assignment (admin only)\n');

      console.log('📊 ADMIN ANALYTICS (Protected - Admin Only)');
      console.log('   GET    /api/admin/dashboard            Comprehensive stats');
      console.log('   GET    /api/admin/revenue              Revenue analytics');
      console.log('   GET    /api/admin/flights              Flight statistics');
      console.log('   GET    /api/admin/bookings             Booking statistics');
      console.log('   GET    /api/admin/users                User statistics\n');

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ All systems operational. Ready for requests!\n');
    });

    process.on('SIGTERM', () => {
      console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('\n❌ STARTUP ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
};

startServer();

module.exports = app;