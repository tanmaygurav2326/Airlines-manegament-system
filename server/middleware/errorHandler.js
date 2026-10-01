// ============================================
// GLOBAL ERROR HANDLER
// ============================================

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  // Default error response
  let statusCode = err.status || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'SERVER_ERROR';

  // Handle specific error types
  if (err.code === 'ORA-00001') {
    statusCode = 409;
    code = 'CONFLICT';
    message = 'Duplicate entry found';
  }

  if (err.code === 'ORA-01745') {
    statusCode = 400;
    code = 'INVALID_INPUT';
    message = 'Invalid SQL parameter';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid or expired token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Token has expired';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    error: code,
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
};

module.exports = errorHandler;