'use strict';

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
