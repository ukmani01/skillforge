'use strict';

const cors = require('cors');
const config = require('../config');

function buildCors() {
  if (!config.allowedOrigins || config.allowedOrigins.length === 0) {
    return cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type']
    });
  }

  return cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (config.allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  });
}

module.exports = buildCors;
