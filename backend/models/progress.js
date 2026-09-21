'use strict';

const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
  moduleKey: { type: String, required: true, index: true },
  passedLevels: { type: [Number], default: [] },
  currentLevel: { type: Number, default: 1 },
  updatedAt: { type: Date, default: Date.now }
});

progressSchema.index({ studentId: 1, moduleKey: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);