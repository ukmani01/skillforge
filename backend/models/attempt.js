'use strict';

const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, trim: true, lowercase: true },
  year: { type: String, required: true, enum: ['2nd', '3rd'] },
  score: { type: Number, required: true, min: 0, max: 40 },
  totalQuestions: { type: Number, required: true, default: 40 },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  level: { type: String, required: true },
  correctAnswers: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  selectedAnswers: { type: [Number], required: true },
  questionResults: { type: [Object], required: true },
  easyScore: { type: Number, default: 0 },
  mediumScore: { type: Number, default: 0 },
  hardScore: { type: Number, default: 0 },
  interviewScore: { type: Number, default: 0 },
  suspiciousActivityCount: { type: Number, default: 0 },
  attemptNumber: { type: Number, default: 1 },
  timeTaken: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  currentLevel: { type: Number, default: 1 }
});

attemptSchema.index({ studentEmail: 1, year: 1, createdAt: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
