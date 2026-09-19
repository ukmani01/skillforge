'use strict';

require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  sessionSecret: process.env.SESSION_SECRET || 'skillforge-secret-key',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  nodeEnv: process.env.NODE_ENV || 'development',
  authRateWindowMs: Number(process.env.AUTH_RATE_WINDOW_MS) || 60000,
  loginRateMax: Number(process.env.LOGIN_RATE_MAX) || 10,
  registerRateMax: Number(process.env.REGISTER_RATE_MAX) || 5,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(function (s) { return s.trim(); })
    .filter(Boolean)
};

if (!config.mongoUri) {
  console.error('MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

if (!config.adminEmail || !config.adminPassword) {
  console.warn('Admin credentials not fully set in .env');
}

module.exports = config;
