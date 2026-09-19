'use strict';

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
