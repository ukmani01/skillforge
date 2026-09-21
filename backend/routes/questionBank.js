'use strict';

const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const QuizModule = require('../models/quizModule');
const adminAuth = require('../middleware/adminAuth');

function cleanModule(body) {
  const source = body || {};
  const subject = String(source.subject || '').trim();
  const moduleKey = String(source.moduleKey || source.key || (source.year && subject ? source.year + '-' + subject : '')).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const title = String(source.title || source.moduleTitle || subject).trim();
  const year = String(source.year || '').trim();
  const questions = Array.isArray(source.questions) ? source.questions : [];
  if (!moduleKey || !title || !subject || !['2nd', '3rd'].includes(year)) throw new Error('moduleKey, title, subject, and year (2nd or 3rd) are required.');
  if (!questions.length) throw new Error('At least one question is required.');
  const normalized = questions.map(function (item, index) {
    const q = item || {};
    const options = Array.isArray(q.options) ? q.options.map(v => String(v).trim()) : [];
    const correct = Number(q.correct);
    const level = Number(q.level);
    if (!String(q.question || '').trim() || !options.length || ![1, 2].includes(level) || !Number.isInteger(correct) || correct < 0 || correct >= options.length) {
      throw new Error('Invalid question at index ' + index + '. Check question, options, level, and correct.');
    }
    return { qid: String(q.id || q.qid || (moduleKey + '-' + (index + 1))).trim(), moduleKey, moduleTitle: title, subject, year, level, question: String(q.question).trim(), options, correct, topic: String(q.topic || ''), difficulty: String(q.difficulty || 'easy'), reference: String(q.reference || '') };
  });
  return { module: { moduleKey, title, subject, year, passingPercentage: Number(source.passingPercentage) || 30, updatedAt: new Date() }, questions: normalized };
}

router.use('/admin/question-bank', adminAuth);

router.get('/admin/question-bank', async function (req, res) {
  try {
    const modules = await QuizModule.find().sort({ year: 1, title: 1 }).lean();
    const questions = await Question.find().sort({ moduleKey: 1, level: 1, qid: 1 }).lean();
    res.json({ success: true, modules, questions });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to load question bank.' }); }
});

router.post('/admin/question-bank/upload', async function (req, res) {
  try {
    const parsed = cleanModule(req.body);
    await QuizModule.findOneAndUpdate({ moduleKey: parsed.module.moduleKey }, parsed.module, { upsert: true, new: true, setDefaultsOnInsert: true });
    await Question.deleteMany({ moduleKey: parsed.module.moduleKey });
    await Question.insertMany(parsed.questions, { ordered: true });
    res.status(201).json({ success: true, message: 'Quiz module uploaded.', moduleKey: parsed.module.moduleKey, count: parsed.questions.length });
  } catch (error) { res.status(400).json({ success: false, error: error.message || 'Invalid quiz JSON.' }); }
});

router.post('/admin/question-bank/questions', async function (req, res) {
  try {
    const body = req.body || {};
    const moduleKey = String(body.moduleKey || '').trim();
    const module = await QuizModule.findOne({ moduleKey });
    if (!module) return res.status(404).json({ success: false, error: 'Create the module before adding questions.' });
    const options = Array.isArray(body.options) ? body.options.map(v => String(v).trim()) : [];
    const correct = Number(body.correct);
    const level = Number(body.level);
    if (!body.question || options.length < 2 || ![1, 2].includes(level) || !Number.isInteger(correct) || correct < 0 || correct >= options.length) throw new Error('Invalid question. Check question, options, level, and correct.');
    const question = await Question.create({ qid: String(body.qid || (moduleKey + '-' + Date.now())), moduleKey, moduleTitle: module.title, subject: module.subject, year: module.year, level, question: String(body.question).trim(), options, correct, topic: String(body.topic || ''), difficulty: String(body.difficulty || 'easy'), reference: String(body.reference || '') });
    res.status(201).json({ success: true, question });
  } catch (error) { res.status(400).json({ success: false, error: error.message || 'Invalid question.' }); }
});

router.patch('/admin/question-bank/questions/:id', async function (req, res) {
  try {
    const allowed = ['qid', 'question', 'options', 'correct', 'level', 'topic', 'difficulty', 'reference'];
    const update = {};
    allowed.forEach(function (key) { if (req.body[key] !== undefined) update[key] = req.body[key]; });
    if (update.options && (!Array.isArray(update.options) || !update.options.length)) throw new Error('Options must be a non-empty array.');
    if (update.correct !== undefined && (!Number.isInteger(Number(update.correct)) || Number(update.correct) < 0 || Number(update.correct) >= update.options.length)) throw new Error('Correct answer must point to an option.');
    const question = await Question.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ success: false, error: 'Question not found.' });
    res.json({ success: true, question });
  } catch (error) { res.status(400).json({ success: false, error: error.message || 'Question update failed.' }); }
});

router.delete('/admin/question-bank/questions/:id', async function (req, res) {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found.' });
    res.json({ success: true, message: 'Question deleted.' });
  } catch (error) { res.status(500).json({ success: false, error: 'Question deletion failed.' }); }
});

router.delete('/admin/question-bank/modules/:moduleKey', async function (req, res) {
  try {
    const moduleKey = String(req.params.moduleKey).trim();
    await Question.deleteMany({ moduleKey });
    const result = await QuizModule.findOneAndDelete({ moduleKey });
    if (!result) return res.status(404).json({ success: false, error: 'Module not found.' });
    res.json({ success: true, message: 'Module deleted.' });
  } catch (error) { res.status(500).json({ success: false, error: 'Module deletion failed.' }); }
});

module.exports = router;