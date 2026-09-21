'use strict';

const mongoose = require('mongoose');

const quizModuleSchema = new mongoose.Schema({
  moduleKey: { type: String, required: true, unique: true, index: true, trim: true },
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  year: { type: String, required: true, enum: ['2nd', '3rd'], index: true },
  passingPercentage: { type: Number, default: 30, min: 0, max: 100 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizModule', quizModuleSchema);