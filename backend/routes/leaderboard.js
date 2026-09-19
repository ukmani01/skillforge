'use strict';

const express = require('express');
const router = express.Router();
const Attempt = require('../models/attempt');

router.get('/leaderboard', async function (req, res) {
  try {
    const year = req.query.year;
    const filter = {};

    if (year && year !== 'all') {
      if (year !== '2nd' && year !== '3rd') {
        return res.status(400).json({ success: false, error: 'Invalid year filter.' });
      }
      filter.year = year;
    }

    const attempts = await Attempt.find(filter)
      .sort({ percentage: -1, score: -1, createdAt: 1 })
      .lean();

    const bestByStudent = {};
    attempts.forEach(function (attempt) {
      const key = String(attempt.studentEmail || '').toLowerCase();
      if (!key) return;

      if (!bestByStudent[key]) {
        bestByStudent[key] = attempt;
        return;
      }

      const current = bestByStudent[key];
      const attemptPercentage = Number(attempt.percentage) || 0;
      const currentPercentage = Number(current.percentage) || 0;
      const attemptScore = Number(attempt.score) || 0;
      const currentScore = Number(current.score) || 0;

      if (
        attemptPercentage > currentPercentage ||
        (attemptPercentage === currentPercentage && attemptScore > currentScore)
      ) {
        bestByStudent[key] = attempt;
      }
    });

    const leaderboard = Object.values(bestByStudent)
      .sort(function (a, b) {
        return ((Number(b.percentage) || 0) - (Number(a.percentage) || 0)) ||
          ((Number(b.score) || 0) - (Number(a.score) || 0));
      })
      .map(function (attempt, index) {
        return {
          rank: index + 1,
          _id: attempt._id,
          studentName: attempt.studentName,
          studentEmail: attempt.studentEmail,
          year: attempt.year,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: attempt.percentage,
          level: attempt.level,
          attemptNumber: attempt.attemptNumber,
          createdAt: attempt.createdAt
        };
      });

    res.json({ success: true, leaderboard: leaderboard });
  } catch (error) {
    console.error('GET /leaderboard error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard.' });
  }
});

module.exports = router;
