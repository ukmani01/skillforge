#!/usr/bin/env node
// backend/createbackend.js
// CommonJS CLI generator for the complete SkillForge backend.
// Writes all backend files relative to this script's own directory.
// Run:  node backend/createbackend.js
// Status: REQUIRES MANUAL TEST — not verified by the author.

'use strict';

const fs = require('fs');
const path = require('path');

const HERE = __dirname; // .../backend

function write(rel, contents) {
  const full = path.join(HERE, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents, 'utf8');
  console.log('WROTE backend/' + rel);
}

console.log('');
console.log('=================================================');
console.log(' SkillForge — Backend generator');
console.log(' Target: ' + HERE);
console.log('=================================================');
console.log('');

// ============================================================
// package.json
// ============================================================
write('package.json', JSON.stringify({
  name: 'skillforge-backend',
  version: '1.0.0',
  description: 'SkillForge backend — Express + MongoDB + Socket.IO',
  main: 'index.js',
  scripts: {
    start: 'node index.js',
    dev: 'node --watch index.js'
  },
  keywords: ['education', 'assessment', 'quiz', 'socket.io'],
  license: 'MIT',
  dependencies: {
    express: '^4.18.2',
    mongoose: '^7.5.0',
    dotenv: '^16.3.1',
    cors: '^2.8.5',
    'express-session': '^1.17.3',
    bcryptjs: '^2.4.3',
    'socket.io': '^4.7.2'
  }
}, null, 2) + '\n');

// ============================================================
// .env.example
// ============================================================
write('.env.example', `MONGODB_URI=<your-mongodb-uri>
SESSION_SECRET=<your-session-secret>
ADMIN_EMAIL=<admin-email>
ADMIN_PASSWORD=<admin-password>
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=
`);

// ============================================================
// config/index.js
// ============================================================
write('config/index.js', `'use strict';

require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  sessionSecret: process.env.SESSION_SECRET || 'skillforge-secret-key',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  nodeEnv: process.env.NODE_ENV || 'development',
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
`);

// ============================================================
// db/connect.js
// ============================================================
write('db/connect.js', `'use strict';

const mongoose = require('mongoose');
const config = require('../config');

async function connect() {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { connect: connect, mongoose: mongoose };
`);

// ============================================================
// models/attempt.js
// ============================================================
write('models/attempt.js', `'use strict';

const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, trim: true, lowercase: true },
  year: { type: String, required: true, enum: ['2nd', '3rd'] },
  score: { type: Number, required: true, min: 0, max: 40 },
  totalQuestions: { type: Number, required: true, default: 40 },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  level: { type: String, required: true },
  correctAnswers: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  selectedAnswers: { type: [Number], required: true },
  questionResults: { type: [Object], required: true },
  easyScore: { type: Number, default: 0 },
  mediumScore: { type: Number, default: 0 },
  hardScore: { type: Number, default: 0 },
  interviewScore: { type: Number, default: 0 },
  suspiciousActivityCount: { type: Number, default: 0 },
  attemptNumber: { type: Number, default: 1 },
  timeTaken: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  currentLevel: { type: Number, default: 1 }
});

attemptSchema.index({ studentEmail: 1, year: 1, createdAt: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
`);

// ============================================================
// models/student.js
// ============================================================
write('models/student.js', `'use strict';

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    index: true
  },
  passwordHash: { type: String, required: true },
  year: { type: String, enum: ['2nd', '3rd', null], default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
`);

// ============================================================
// models/feedback.js
// ============================================================
write('models/feedback.js', `'use strict';

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  studentEmail: { type: String, required: true, lowercase: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
`);

// ============================================================
// models/post.js
// ============================================================
write('models/post.js', `'use strict';

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  studentName: { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, lowercase: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  body: { type: String, required: true, trim: true, maxlength: 5000 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
`);

// ============================================================
// models/question.js
// ============================================================
write('models/question.js', `'use strict';

// Reserved for future use — questions live in backend/data/*.json for now.

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  qid: { type: String, required: true, unique: true, index: true },
  year: { type: String, required: true, enum: ['2nd', '3rd'] },
  level: { type: Number, required: true, min: 1, max: 2 },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correct: { type: Number, required: true },
  topic: { type: String, default: '' },
  difficulty: { type: String, default: 'easy' },
  reference: { type: String, default: '' }
});

module.exports = mongoose.model('Question', questionSchema);
`);

// ============================================================
// middleware/cors.js
// ============================================================
write('middleware/cors.js', `'use strict';

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
`);

// ============================================================
// middleware/session.js
// ============================================================
write('middleware/session.js', `'use strict';

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
`);

// ============================================================
// middleware/studentAuth.js
// ============================================================
write('middleware/studentAuth.js', `'use strict';

const Student = require('../models/student');

module.exports = async function studentAuth(req, res, next) {
  try {
    if (!req.session || !req.session.studentId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const student = await Student
      .findById(req.session.studentId)
      .select('-passwordHash');

    if (!student) {
      req.session.studentId = null;
      return res.status(401).json({ success: false, error: 'Student not found' });
    }

    req.student = student;
    next();
  } catch (err) {
    console.error('studentAuth error:', err.message);
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};
`);

// ============================================================
// middleware/adminAuth.js
// ============================================================
write('middleware/adminAuth.js', `'use strict';

module.exports = function adminAuth(req, res, next) {
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ success: false, error: 'Admin only.' });
  }
  next();
};
`);

// ============================================================
// middleware/errorHandler.js
// ============================================================
write('middleware/errorHandler.js', `'use strict';

module.exports = function errorHandler(err, req, res, next) {
  console.error('Route error:', err.message);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.publicMessage || 'Server error.'
  });
};
`);

// ============================================================
// utils/validate.js
// ============================================================
write('utils/validate.js', `'use strict';

function isNonEmptyString(v, max) {
  if (typeof v !== 'string') return false;
  const t = v.trim();
  if (t.length === 0) return false;
  if (max && t.length > max) return false;
  return true;
}

function isValidEmail(v) {
  if (typeof v !== 'string') return false;
  return /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(v.trim());
}

function isIntInRange(v, min, max) {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max;
}

module.exports = {
  isNonEmptyString: isNonEmptyString,
  isValidEmail: isValidEmail,
  isIntInRange: isIntInRange
};
`);

// ============================================================
// routes/health.js
// ============================================================
write('routes/health.js', `'use strict';

const express = require('express');
const router = express.Router();

router.get('/health', function (req, res) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
`);

// ============================================================
// routes/attempts.js
// ============================================================
write('routes/attempts.js', `'use strict';

const express = require('express');
const router = express.Router();
const Attempt = require('../models/attempt');

router.post('/attempts', async function (req, res) {
  try {
    const data = req.body || {};
    const required = ['studentName','studentEmail','year','score','totalQuestions','percentage','level','correctAnswers','wrongAnswers','selectedAnswers','questionResults'];
    for (let i = 0; i < required.length; i++) {
      const f = required[i];
      if (data[f] === undefined || data[f] === null) {
        return res.status(400).json({ success: false, error: 'Missing field: ' + f });
      }
    }
    if (data.year !== '2nd' && data.year !== '3rd') {
      return res.status(400).json({ success: false, error: 'Invalid year.' });
    }

    const email = String(data.studentEmail).trim().toLowerCase();
    const prev = await Attempt.find({ studentEmail: email, year: data.year });
    const attemptNumber = prev.length + 1;

    const attempt = new Attempt({
      studentName: String(data.studentName).trim(),
      studentEmail: email,
      year: data.year,
      score: data.score,
      totalQuestions: data.totalQuestions,
      percentage: data.percentage,
      level: data.level,
      correctAnswers: data.correctAnswers,
      wrongAnswers: data.wrongAnswers,
      selectedAnswers: data.selectedAnswers,
      questionResults: data.questionResults,
      easyScore: data.easyScore || 0,
      mediumScore: data.mediumScore || 0,
      hardScore: data.hardScore || 0,
      interviewScore: data.interviewScore || 0,
      suspiciousActivityCount: data.suspiciousActivityCount || 0,
      attemptNumber: attemptNumber,
      timeTaken: data.timeTaken || 0,
      createdAt: data.createdAt || new Date(),
      currentLevel: data.currentLevel || 1
    });

    await attempt.save();

    const prevBest = prev.length > 0
      ? Math.max.apply(null, prev.map(function (a) { return a.percentage; }))
      : 0;

    res.status(201).json({
      success: true,
      message: 'Attempt saved',
      attemptId: attempt._id,
      attemptNumber: attemptNumber,
      previousBest: prevBest,
      improvement: prevBest > 0 ? attempt.percentage - prevBest : null
    });
  } catch (error) {
    console.error('POST /attempts error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to save attempt.' });
  }
});

router.get('/attempts', async function (req, res) {
  try {
    const year = req.query.year;
    const email = req.query.email;
    const filter = {};
    if (year && year !== 'all') filter.year = year;
    if (email) filter.studentEmail = String(email).trim().toLowerCase();

    const attempts = await Attempt.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: attempts.length, attempts: attempts });
  } catch (error) {
    console.error('GET /attempts error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch attempts.' });
  }
});

router.get('/attempts/:id', async function (req, res) {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ success: false, error: 'Attempt not found.' });
    }
    res.json({ success: true, attempt: attempt });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch attempt.' });
  }
});

router.delete('/attempts/student/:email', async function (req, res) {
  try {
    const email = String(req.params.email).trim().toLowerCase();
    const result = await Attempt.deleteMany({ studentEmail: email });
    res.json({
      success: true,
      message: 'Deleted ' + result.deletedCount + ' attempts.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete attempts.' });
  }
});

router.delete('/attempts/:id', async function (req, res) {
  try {
    const attempt = await Attempt.findByIdAndDelete(req.params.id);
    if (!attempt) {
      return res.status(404).json({ success: false, error: 'Attempt not found.' });
    }
    res.json({ success: true, message: 'Attempt deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete attempt.' });
  }
});

module.exports = router;
`);

// ============================================================
// routes/leaderboard.js
// ============================================================
write('routes/leaderboard.js', `'use strict';

const express = require('express');
const router = express.Router();
const Attempt = require('../models/attempt');

router.get('/leaderboard', async function (req, res) {
  try {
    const year = req.query.year;
    const filter = {};
    if (year && year !== 'all') filter.year = year;

    const attempts = await Attempt.find(filter)
      .sort({ percentage: -1, score: -1, createdAt: 1 })
      .lean();

    const best = {};
    attempts.forEach(function (a) {
      const k = a.studentEmail;
      if (!best[k] || a.percentage > best[k].percentage) {
        best[k] = a;
      }
    });

    const leaderboard = Object.values(best)
      .sort(function (a, b) {
        return (b.percentage - a.percentage) || (b.score - a.score);
      })
      .map(function (a, i) {
        return {
          rank: i + 1,
          _id: a._id,
          studentName: a.studentName,
          studentEmail: a.studentEmail,
          year: a.year,
          score: a.score,
          totalQuestions: a.totalQuestions,
          percentage: a.percentage,
          level: a.level,
          attemptNumber: a.attemptNumber,
          createdAt: a.createdAt
        };
      });

    res.json({ success: true, leaderboard: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard.' });
  }
});

module.exports = router;
`);

// ============================================================
// routes/dashboard.js
// ============================================================
write('routes/dashboard.js', `'use strict';

const express = require('express');
const router = express.Router();
const Attempt = require('../models/attempt');

router.get('/dashboard/stats', async function (req, res) {
  try {
    const all = await Attempt.find({}).lean();

    const stats = {
      totalStudents: 0,
      totalAttempts: all.length,
      averageScore: 0,
      averagePercentage: 0,
      highestScore: 0,
      lowestScore: 40,
      yearStats: { '2nd': { count: 0, avgPercent: 0 }, '3rd': { count: 0, avgPercent: 0 } },
      levelDistribution: {},
      easyAccuracy: 0,
      mediumAccuracy: 0,
      hardAccuracy: 0,
      interviewAccuracy: 0
    };

    if (all.length === 0) return res.json({ success: true, stats: stats });

    stats.totalStudents = new Set(all.map(function (a) { return a.studentEmail; })).size;

    const scores = all.map(function (a) { return a.score; });
    const pcts = all.map(function (a) { return a.percentage; });
    stats.averageScore = Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length);
    stats.averagePercentage = Math.round(pcts.reduce(function (a, b) { return a + b; }, 0) / pcts.length);
    stats.highestScore = Math.max.apply(null, scores);
    stats.lowestScore = Math.min.apply(null, scores);

    all.forEach(function (a) {
      stats.yearStats[a.year].count++;
      stats.yearStats[a.year].avgPercent += a.percentage;
      stats.levelDistribution[a.level] = (stats.levelDistribution[a.level] || 0) + 1;
    });

    Object.keys(stats.yearStats).forEach(function (k) {
      if (stats.yearStats[k].count > 0) {
        stats.yearStats[k].avgPercent = Math.round(stats.yearStats[k].avgPercent / stats.yearStats[k].count);
      }
    });

    let eC = 0, mC = 0, hC = 0, iC = 0;
    all.forEach(function (a) {
      eC += a.easyScore || 0;
      mC += a.mediumScore || 0;
      hC += a.hardScore || 0;
      iC += a.interviewScore || 0;
    });
    const total = all.length * 10;
    stats.easyAccuracy = total ? Math.round(eC / total * 100) : 0;
    stats.mediumAccuracy = total ? Math.round(mC / total * 100) : 0;
    stats.hardAccuracy = total ? Math.round(hC / total * 100) : 0;
    stats.interviewAccuracy = total ? Math.round(iC / total * 100) : 0;

    res.json({ success: true, stats: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats.' });
  }
});

module.exports = router;
`);

// ============================================================
// routes/admin.js
// ============================================================
write('routes/admin.js', `'use strict';

const express = require('express');
const router = express.Router();
const config = require('../config');

router.post('/admin/login', function (req, res) {
  const body = req.body || {};
  const email = body.email;
  const password = body.password;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required.' });
  }

  if (email === config.adminEmail && password === config.adminPassword) {
    req.session.isAdmin = true;
    req.session.adminEmail = email;
    return res.json({ success: true, message: 'Login successful.', isAdmin: true });
  }

  return res.status(401).json({ success: false, error: 'Invalid email or password.' });
});

router.post('/admin/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) return res.status(500).json({ success: false, error: 'Logout failed.' });
    res.json({ success: true, message: 'Logged out.' });
  });
});

router.get('/admin/check', function (req, res) {
  res.json({ success: true, isAdmin: !!(req.session && req.session.isAdmin) });
});

module.exports = router;
`);

// ============================================================
// routes/students.js
// ============================================================
write('routes/students.js', `'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Student = require('../models/student');
const Attempt = require('../models/attempt');
const studentAuth = require('../middleware/studentAuth');

function validEmail(e) {
  return typeof e === 'string' && /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(e);
}

router.post('/students/register', async function (req, res) {
  try {
    const body = req.body || {};
    const name = (body.name ? String(body.name) : '').trim();
    const email = (body.email ? String(body.email) : '').trim().toLowerCase();
    const password = body.password ? String(body.password) : '';
    const year = body.year ? String(body.year) : null;

    if (!name || name.length < 2 || name.length > 120) {
      return res.status(400).json({ success: false, error: 'Name must be 2-120 characters.' });
    }
    if (!validEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
    }

    const existing = await Student.findOne({ email: email });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const student = await Student.create({
      name: name,
      email: email,
      passwordHash: passwordHash,
      year: (year === '2nd' || year === '3rd') ? year : null
    });

    req.session.studentId = String(student._id);
    req.session.studentEmail = student.email;
    req.session.studentName = student.name;

    res.status(201).json({
      success: true,
      student: { _id: student._id, name: student.name, email: student.email, year: student.year }
    });
  } catch (error) {
    console.error('register error:', error.message);
    res.status(500).json({ success: false, error: 'Registration failed.' });
  }
});

router.post('/students/login', async function (req, res) {
  try {
    const body = req.body || {};
    const email = (body.email ? String(body.email) : '').trim().toLowerCase();
    const password = body.password ? String(body.password) : '';

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required.' });
    }

    const student = await Student.findOne({ email: email });
    if (!student) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const ok = bcrypt.compareSync(password, student.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    req.session.studentId = String(student._id);
    req.session.studentEmail = student.email;
    req.session.studentName = student.name;

    res.json({
      success: true,
      student: { _id: student._id, name: student.name, email: student.email, year: student.year }
    });
  } catch (error) {
    console.error('login error:', error.message);
    res.status(500).json({ success: false, error: 'Login failed.' });
  }
});

router.post('/students/logout', function (req, res) {
  if (!req.session) return res.json({ success: true });
  req.session.studentId = null;
  req.session.studentEmail = null;
  req.session.studentName = null;
  res.json({ success: true });
});

router.get('/students/me', studentAuth, function (req, res) {
  res.json({
    success: true,
    student: {
      _id: req.student._id,
      name: req.student.name,
      email: req.student.email,
      year: req.student.year,
      createdAt: req.student.createdAt
    }
  });
});

router.get('/students/me/attempts', studentAuth, async function (req, res) {
  try {
    const attempts = await Attempt
      .find({ studentEmail: req.student.email })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, attempts: attempts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch attempts.' });
  }
});

module.exports = router;
`);

// ============================================================
// routes/feedback.js
// ============================================================
write('routes/feedback.js', `'use strict';

const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');
const studentAuth = require('../middleware/studentAuth');

router.post('/feedback', studentAuth, async function (req, res) {
  try {
    const body = req.body || {};
    const rating = Number(body.rating);
    const comment = body.comment ? String(body.comment).trim().slice(0, 1000) : '';

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be 1-5.' });
    }

    const fb = await Feedback.create({
      studentId: req.student._id,
      studentEmail: req.student.email,
      rating: rating,
      comment: comment
    });

    res.status(201).json({ success: true, feedback: fb });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit feedback.' });
  }
});

router.get('/feedback/mine', studentAuth, async function (req, res) {
  try {
    const items = await Feedback
      .find({ studentId: req.student._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, feedback: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch feedback.' });
  }
});

module.exports = router;
`);

// ============================================================
// routes/posts.js
// ============================================================
write('routes/posts.js', `'use strict';

const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const studentAuth = require('../middleware/studentAuth');

router.post('/posts', studentAuth, async function (req, res) {
  try {
    const body = req.body || {};
    const title = (body.title ? String(body.title) : '').trim();
    const text = (body.body ? String(body.body) : '').trim();

    if (!title || title.length > 200) {
      return res.status(400).json({ success: false, error: 'Title required (max 200).' });
    }
    if (!text || text.length > 5000) {
      return res.status(400).json({ success: false, error: 'Body required (max 5000).' });
    }

    const post = await Post.create({
      studentId: req.student._id,
      studentName: req.student.name,
      studentEmail: req.student.email,
      title: title,
      body: text
    });

    res.status(201).json({ success: true, post: post });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create post.' });
  }
});

router.get('/posts', async function (req, res) {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ success: true, posts: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch posts.' });
  }
});

router.get('/posts/mine', studentAuth, async function (req, res) {
  try {
    const posts = await Post
      .find({ studentId: req.student._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, posts: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch your posts.' });
  }
});

router.delete('/posts/:id', studentAuth, async function (req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });
    if (String(post.studentId) !== String(req.student._id)) {
      return res.status(403).json({ success: false, error: 'Not your post.' });
    }
    await post.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete post.' });
  }
});

module.exports = router;
`);

// ============================================================
// routes/quiz.js
// ============================================================
write('routes/quiz.js', `'use strict';

const express = require('express');
const router = express.Router();

// Placeholder — the JSON quiz migration is a future stage.
// Return 501 so the frontend can detect "not implemented yet".

router.get('/quiz/questions', function (req, res) {
  res.status(501).json({ success: false, error: 'Quiz JSON API not implemented yet.' });
});

router.post('/quiz/submit', function (req, res) {
  res.status(501).json({ success: false, error: 'Quiz JSON submit not implemented yet.' });
});

module.exports = router;
`);

// ============================================================
// data/second-year.json
// ============================================================
write('data/second-year.json', JSON.stringify({
  version: '1.0',
  year: '2nd',
  subject: 'HTML Fundamentals',
  note: 'Placeholder — the full 40 questions from the frontend should be migrated here in a future stage.',
  questions: []
}, null, 2) + '\n');

// ============================================================
// data/third-year.json
// ============================================================
write('data/third-year.json', JSON.stringify({
  version: '1.0',
  year: '3rd',
  subject: 'Full Stack Web Development',
  note: 'Placeholder — the full 40 questions from the frontend should be migrated here in a future stage.',
  questions: []
}, null, 2) + '\n');

// ============================================================
// socket/index.js
// ============================================================
write('socket/index.js', `'use strict';

// Socket.IO — isolated module. Attaches to the HTTP server.
// If socket.io is not installed, this quietly returns null.

module.exports = function attachSocket(httpServer) {
  let Server;
  try {
    Server = require('socket.io');
  } catch (e) {
    console.warn('socket.io not installed — skipping Socket.IO.');
    return null;
  }

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.use(function (socket, next) {
    const hs = socket.handshake.auth || {};
    socket.data.role = hs.role === 'teacher' ? 'teacher' : 'student';
    socket.data.studentId = hs.studentId || null;
    socket.data.email = hs.email || null;
    socket.data.name = hs.name || 'Guest';
    next();
  });

  io.on('connection', function (socket) {
    console.log('socket connected:', socket.id, socket.data.role);

    socket.on('join', function (room) {
      const safeRoom = String(room || 'general').slice(0, 100);
      socket.join(safeRoom);
    });

    socket.on('chat:message', function (payload) {
      const p = payload || {};
      const text = p.text ? String(p.text).slice(0, 2000) : '';
      const room = p.room ? String(p.room).slice(0, 100) : 'general';
      if (!text) return;
      io.to(room).emit('chat:message', {
        from: socket.data.name,
        role: socket.data.role,
        text: text,
        room: room,
        at: new Date().toISOString()
      });
    });

    socket.on('disconnect', function (reason) {
      console.log('socket disconnected:', socket.id, reason);
    });
  });

  return io;
};
`);

// ============================================================
// index.js
// ============================================================
write('index.js', `'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const db = require('./db/connect');
const buildCors = require('./middleware/cors');
const sessionMiddleware = require('./middleware/session');
const errorHandler = require('./middleware/errorHandler');
const attachSocket = require('./socket');

const app = express();

// ---- Middleware ----
app.use(buildCors());
app.use(express.json({ limit: '10mb' }));

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const STATIC_DIR = fs.existsSync(FRONTEND_DIR) ? FRONTEND_DIR : PUBLIC_DIR;
console.log('Static dir:', STATIC_DIR);

app.use(express.static(STATIC_DIR));
app.use(sessionMiddleware);

// ---- Routes ----
app.use('/api', require('./routes/health'));
app.use('/api', require('./routes/attempts'));
app.use('/api', require('./routes/leaderboard'));
app.use('/api', require('./routes/dashboard'));
app.use('/api', require('./routes/admin'));
app.use('/api', require('./routes/students'));
app.use('/api', require('./routes/feedback'));
app.use('/api', require('./routes/posts'));
app.use('/api', require('./routes/quiz'));

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

app.use(errorHandler);

// ---- Start ----
db.connect().then(function () {
  const server = http.createServer(app);
  attachSocket(server);

  server.listen(config.port, function () {
    console.log('SkillForge running on port ' + config.port);
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
`);

console.log('');
console.log('=================================================');
console.log(' Backend generator complete.');
console.log(' Files written to: ' + HERE);
console.log('=================================================');
console.log('');
console.log('Next steps (REQUIRES MANUAL TEST):');
console.log('  cd backend');
console.log('  npm install');
console.log('  copy .env.example .env   (then fill in values)');
console.log('  npm start');
console.log('');
console.log('If the server starts and you can hit:');
console.log('  /api/health');
console.log('then continue with the frontend generator.');
console.log('');