'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
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

function calcScoreForLevel(year, level, answers) {
  const data = readQuestions(year);
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
    score,
    totalQuestions: all.length,
    percentage: all.length ? Math.round((score / all.length) * 100) : 0,
    questionResults: questionResults
  };
}

router.get('/quiz/questions', function (req, res) {
  const year = req.query.year === '3rd' ? '3rd' : '2nd';
  const level = Number(req.query.level) === 2 ? 2 : 1;
  const data = readQuestions(year);

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
    level: level,
    questions: filtered
  });
});

router.post('/quiz/submit', function (req, res) {
  try {
    const body = req.body || {};
    const year = body.year === '3rd' ? '3rd' : '2nd';
    const level = Number(body.level) === 2 ? 2 : 1;
    const answers = Array.isArray(body.answers) ? body.answers : [];

    if (!answers.length) {
      return res.status(400).json({ success: false, error: 'No answers submitted.' });
    }

    const result = calcScoreForLevel(year, level, answers);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      year: year,
      level: level,
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
