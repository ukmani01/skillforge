'use strict';

const session = require('express-session');
const config = require('../config');

const isProd = config.nodeEnv === 'production';
const hasOrigins = config.allowedOrigins && config.allowedOrigins.length > 0;

module.exports = session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd && hasOrigins ? true : false,
    sameSite: isProd && hasOrigins ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
});
