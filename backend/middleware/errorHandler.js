/**
 * Centralized Express Error Handler Middleware.
 * Catches unhandled route exceptions and formats structured JSON responses.
 */
module.exports = function errorHandler(err, req, res, next) {
  console.error(`[Express ErrorHandler] ${req.method} ${req.url}:`, err.message);

  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    path: req.url,
    timestamp: new Date().toISOString()
  });
};
