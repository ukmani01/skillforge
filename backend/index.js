'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const db = require('./db/connect');
const buildCors = require('./middleware/cors');
const sessionMiddleware = require('./middleware/session');
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('./middleware/rateLimit');
const attachSocket = require('./socket');

const app = express();

// ---- Middleware ----
app.use(buildCors());
app.use(express.json({ limit: '10mb' }));

// ---- Static ----
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const STATIC_DIR = fs.existsSync(FRONTEND_DIR) ? FRONTEND_DIR : PUBLIC_DIR;
console.log('Static dir:', STATIC_DIR);

app.use(express.static(STATIC_DIR));

// ---- Session ----
app.use(sessionMiddleware);

// ---- Rate limiting (auth endpoints only) ----
const loginLimiter = rateLimit({ windowMs: config.authRateWindowMs, max: config.loginRateMax });
const registerLimiter = rateLimit({ windowMs: config.authRateWindowMs, max: config.registerRateMax });

app.use('/api/admin/login', loginLimiter);
app.use('/api/students/login', loginLimiter);
app.use('/api/students/register', registerLimiter);

// ---- Routes ----
app.use('/api', require('./routes/health'));
app.use('/api', require('./routes/attempts'));
app.use('/api', require('./routes/leaderboard'));
app.use('/api', require('./routes/dashboard'));
app.use('/api', require('./routes/admin'));
app.use('/api', require('./routes/adminData'));
app.use('/api', require('./routes/students'));
app.use('/api', require('./routes/feedback'));
app.use('/api', require('./routes/posts'));
app.use('/api', require('./routes/chat'));
app.use('/api', require('./routes/quiz'));
app.use('/api', require('./routes/questionBank'));

// ---- API 404 ----
app.use('/api', function (req, res) {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// ---- SPA fallback ----
app.get('*', function (req, res) {
  res.sendFile('index.html', { root: STATIC_DIR }, function (err) {
    if (err) {
      console.error('index.html not found:', err.message);
      res.status(404).send('Not found');
    }
  });
});

// ---- Error handler ----
app.use(errorHandler);

// ---- Start ----
db.connect().then(function () {
  const server = http.createServer(app);
  attachSocket(server);

  server.listen(config.port, function () {
    console.log('SkillForge running on http://localhost:' + config.port);
    console.log('Admin email: ' + config.adminEmail);
  });

  process.on('SIGINT', async function () {
    console.log('Shutting down...');
    try { await db.mongoose.disconnect(); } catch (e) {}
    process.exit(0);
  });
});

process.on('unhandledRejection', function (err) {
  console.error('Unhandled rejection:', err);
});

process.on('uncaughtException', function (err) {
  console.error('Uncaught exception:', err);
  process.exit(1);
});