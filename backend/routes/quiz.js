'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const Question = require('../models/question');
const QuizModule = require('../models/quizModule');
const Progress = require('../models/progress');
const router = express.Router();

const DATA_DIR = path.join(__dirname, '..', 'data');

function readQuestions(year) {
  const file = path.join(DATA_DIR, year === '3rd' ? 'third-year.json' : 'second-year.json');
  if (!fs.existsSync(file)) {
    return { success: false, error: 'Quiz data file not found for ' + year + '.' };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    const list = Array.isArray(parsed.questions) ? parsed.questions : [];
    return {
      success: true,
      year: parsed.year || year,
      subject: parsed.subject || (year === '3rd' ? 'Full Stack Web Development' : 'HTML Fundamentals'),
      questions: list
    };
  } catch (err) {
    return { success: false, error: 'Invalid quiz data for ' + year + ': ' + err.message };
  }
}

async function getQuestions(year, level, moduleKey) {
  const filter = { year: year, level: level };
  if (moduleKey) filter.moduleKey = moduleKey;
  const stored = await Question.find(filter).sort({ qid: 1 }).lean();
  if (stored.length) {
    return { success: true, year, subject: stored[0].subject, moduleKey: stored[0].moduleKey, questions: stored.map(function (q) {
      return Object.assign({}, q, { id: q.qid });
    }) };
  }
  const data = readQuestions(year);
  if (data.success) data.moduleKey = year + '-core';
  return data;
}

router.get('/quiz/modules', async function (req, res) {
  try {
    const year = req.query.year === '3rd' ? '3rd' : '2nd';
    const modules = await QuizModule.find({ year: year, active: true }).sort({ title: 1 }).select('moduleKey title subject year passingPercentage').lean();
    res.json({ success: true, modules: modules.length ? modules : [{ moduleKey: year + '-core', title: year === '2nd' ? 'HTML Fundamentals' : 'Full Stack Web Development', subject: year === '2nd' ? 'HTML Fundamentals' : 'Full Stack Web Development', year: year, passingPercentage: 30 }] });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to load quiz modules.' }); }
});

async function calcScoreForLevel(year, level, answers, moduleKey) {
  const data = await getQuestions(year, level, moduleKey);
  if (!data.success) {
    return { success: false, error: data.error };
  }

  const all = data.questions.filter(function (q) {
    return Number(q.level) === Number(level);
  });

  if (!Array.isArray(answers) || answers.length === 0) {
    return { success: false, error: 'No answers provided.' };
  }

  let score = 0;
  const questionResults = [];

  all.forEach(function (q, idx) {
    const answer = answers.find(function (entry) {
      return String(entry && entry.questionId) === String(q.id);
    });
    const selected = answer && Number.isInteger(answer.selectedOption) ? Number(answer.selectedOption) : null;
    const correct = Number(q.correct);
    const isCorrect = selected === correct;
    if (isCorrect) score += 1;
    questionResults.push({
      questionId: q.id,
      selectedOption: selected,
      correctOption: correct,
      isCorrect: isCorrect,
      question: q.question,
      difficulty: q.difficulty || 'easy',
      topic: q.topic || ''
    });
  });

  return {
    success: true,
    moduleKey: data.moduleKey || moduleKey || year + '-core',
    subject: data.subject,
    score,
    totalQuestions: all.length,
    percentage: all.length ? Math.round((score / all.length) * 100) : 0,
    questionResults: questionResults
  };
}

router.get('/quiz/questions', async function (req, res) {
  const year = req.query.year === '3rd' ? '3rd' : '2nd';
  const level = Number(req.query.level) === 2 ? 2 : 1;
  const moduleKey = req.query.moduleKey ? String(req.query.moduleKey).trim() : '';
  const data = await getQuestions(year, level, moduleKey);

  if (!data.success) {
    return res.status(500).json({ success: false, error: data.error });
  }

  const filtered = (data.questions || []).filter(function (q) {
    return Number(q.level) === level;
  });

  res.json({
    success: true,
    year: data.year,
    subject: data.subject,
    moduleKey: data.moduleKey || moduleKey || year + '-core',
    level: level,
    questions: filtered
  });
});

router.post('/quiz/submit', async function (req, res) {
  try {
    const body = req.body || {};
    const year = body.year === '3rd' ? '3rd' : '2nd';
    const level = Number(body.level) === 2 ? 2 : 1;
    const answers = Array.isArray(body.answers) ? body.answers : [];
    const moduleKey = body.moduleKey ? String(body.moduleKey).trim() : '';

    if (req.session && req.session.studentId && body.studentEmail && String(body.studentEmail).trim().toLowerCase() !== String(req.session.studentEmail || '').trim().toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Quiz email does not match the authenticated student.' });
    }

    if (!answers.length) {
      return res.status(400).json({ success: false, error: 'No answers submitted.' });
    }

    if (level === 2) {
      if (!req.session || !req.session.studentId) return res.status(401).json({ success: false, error: 'Log in as a student before unlocking Level 2.' });
      const progress = await Progress.findOne({ studentId: req.session.studentId, moduleKey: moduleKey || year + '-core' });
      if (!progress || !progress.passedLevels.includes(1)) return res.status(403).json({ success: false, error: 'Pass Level 1 before starting Level 2.' });
    }

    const result = await calcScoreForLevel(year, level, answers, moduleKey);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      year: year,
      level: level,
      moduleKey: result.moduleKey,
      subject: result.subject,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      questionResults: result.questionResults
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Quiz submission failed.' });
  }
});

module.exports = router;
