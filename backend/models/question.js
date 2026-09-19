'use strict';

// Reserved for future use — questions live in backend/data/*.json for now.

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  qid: { type: String, required: true, unique: true, index: true },
  year: { type: String, required: true, enum: ['2nd', '3rd'] },
  level: { type: Number, required: true, min: 1, max: 2 },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correct: { type: Number, required: true },
  topic: { type: String, default: '' },
  difficulty: { type: String, default: 'easy' },
  reference: { type: String, default: '' }
});

module.exports = mongoose.model('Question', questionSchema);
