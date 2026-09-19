'use strict';

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
