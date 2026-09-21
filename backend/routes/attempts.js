'use strict';

const express = require('express');
const router = express.Router();
const Attempt = require('../models/attempt');
const Progress = require('../models/progress');
const QuizModule = require('../models/quizModule');
const Student = require('../models/student');

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
    if (req.session && req.session.studentId && String(req.session.studentEmail).toLowerCase() !== email) {
      return res.status(403).json({ success: false, error: 'Attempt email does not match the authenticated student.' });
    }
    const prev = await Attempt.find({ studentEmail: email, year: data.year });
    const attemptNumber = prev.length + 1;

    const attempt = new Attempt({
      studentName: String(data.studentName).trim(),
      studentEmail: email,
      year: data.year,
      moduleKey: data.moduleKey || data.year + '-core',
      subject: data.subject || '',
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

    if (req.session && req.session.studentId && Number(data.currentLevel) === 1) {
      const moduleKey = data.moduleKey || data.year + '-core';
      const module = await QuizModule.findOne({ moduleKey }).lean();
      const passingPercentage = module ? module.passingPercentage : 30;
      if (Number(data.percentage) >= passingPercentage) {
        await Progress.findOneAndUpdate(
          { studentId: req.session.studentId, moduleKey: moduleKey },
          { $set: { studentEmail: email, currentLevel: 2, updatedAt: new Date() }, $addToSet: { passedLevels: 1 } },
          { upsert: true, new: true }
        );
      }
    }

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
