'use strict';

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    index: true
  },
  passwordHash: { type: String, required: true },
  year: { type: String, enum: ['2nd', '3rd', null], default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
