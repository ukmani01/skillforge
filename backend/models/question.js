'use strict';

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  qid: { type: String, required: true, trim: true },
  moduleKey: { type: String, required: true, trim: true, index: true },
  moduleTitle: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  year: { type: String, required: true, enum: ['2nd', '3rd'] },
  level: { type: Number, required: true, min: 1, max: 2 },
  question: { type: String, required: true },
  options: { type: [String], required: true, validate: v => v.length >= 2 },
  correct: { type: Number, required: true, min: 0 },
  topic: { type: String, default: '' },
  difficulty: { type: String, default: 'easy' },
  reference: { type: String, default: '' }
});

questionSchema.index({ moduleKey: 1, qid: 1 }, { unique: true });

module.exports = mongoose.model('Question', questionSchema);
