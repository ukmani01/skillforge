'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Student = require('../models/student');
const Attempt = require('../models/attempt');
const studentAuth = require('../middleware/studentAuth');

function validEmail(e) {
  return typeof e === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
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
    let student;
    try {
      student = await Student.create({
        name: name,
        email: email,
        passwordHash: passwordHash,
        year: (year === '2nd' || year === '3rd') ? year : null
      });
    } catch (createError) {
      if (createError && createError.code === 11000) {
        return res.status(409).json({ success: false, error: 'Email already registered.' });
      }
      throw createError;
    }

    req.session.regenerate(function (sessionError) {
      if (sessionError) {
        console.error('register session error:', sessionError.message);
        return res.status(500).json({ success: false, error: 'Account created, but login session could not be started.' });
      }
      req.session.studentId = String(student._id);
      req.session.studentEmail = student.email;
      req.session.studentName = student.name;
      req.session.save(function (saveError) {
        if (saveError) {
          console.error('register session save error:', saveError.message);
          return res.status(500).json({ success: false, error: 'Account created, but login session could not be saved.' });
        }
        res.status(201).json({
          success: true,
          student: { _id: student._id, name: student.name, email: student.email, year: student.year }
        });
      });
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

    req.session.regenerate(function (sessionError) {
      if (sessionError) {
        console.error('login session error:', sessionError.message);
        return res.status(500).json({ success: false, error: 'Login succeeded, but the session could not be started.' });
      }
      req.session.studentId = String(student._id);
      req.session.studentEmail = student.email;
      req.session.studentName = student.name;
      req.session.save(function (saveError) {
        if (saveError) {
          console.error('login session save error:', saveError.message);
          return res.status(500).json({ success: false, error: 'Login succeeded, but the session could not be saved.' });
        }
        res.json({
          success: true,
          student: { _id: student._id, name: student.name, email: student.email, year: student.year }
        });
      });
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
