'use strict';

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
