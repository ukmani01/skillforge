'use strict';

module.exports = function errorHandler(err, req, res, next) {
  console.error('Route error:', err.message);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.publicMessage || 'Server error.'
  });
};
