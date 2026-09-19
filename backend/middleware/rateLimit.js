'use strict';

/**
 * Simple in-memory rate limiter.
 * Suitable for single-instance deployments (localhost + Render free tier).
 *
 * Usage:
 *   const rateLimit = require('./rateLimit');
 *   app.use('/api/admin/login', rateLimit({ windowMs: 60000, max: 5 }));
 */

const buckets = new Map();

// Cleanup old buckets periodically to avoid unbounded memory growth
setInterval(function () {
  const now = Date.now();
  for (const entry of buckets.entries()) {
    const key = entry[0];
    const bucket = entry[1];
    if (now - bucket.resetAt > 0) {
      buckets.delete(key);
    }
  }
}, 60 * 1000).unref();

function getClientKey(req) {
  // Prefer IP. Fall back to a constant if unavailable.
  const ip =
    (req.headers && req.headers['x-forwarded-for']) ||
    (req.connection && req.connection.remoteAddress) ||
    (req.socket && req.socket.remoteAddress) ||
    'unknown';
  // If X-Forwarded-For contains multiple, take the first
  return String(ip).split(',')[0].trim();
}

module.exports = function rateLimit(options) {
  const opts = options || {};
  const windowMs = Number(opts.windowMs) > 0 ? Number(opts.windowMs) : 60000;
  const max = Number(opts.max) > 0 ? Number(opts.max) : 10;
  const message =
    opts.message || 'Too many requests. Please try again later.';
  const statusCode = Number(opts.statusCode) || 429;

  return function rateLimitMiddleware(req, res, next) {
    const key = getClientKey(req);
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(statusCode).json({
        success: false,
        error: message
      });
    }

    next();
  };
};