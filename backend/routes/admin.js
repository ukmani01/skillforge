'use strict';

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
