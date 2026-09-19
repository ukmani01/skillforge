'use strict';

const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    index: true
  },
  studentName: { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, lowercase: true, trim: true },
  body: { type: String, required: true, trim: true, maxlength: 2000 },
  isTrainer: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const postSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    index: true
  },
  studentName: { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, lowercase: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  body: { type: String, required: true, trim: true, maxlength: 5000 },
  type: { type: String, enum: ['question', 'announcement'], default: 'question' },
  isAnnouncement: { type: Boolean, default: false },
  role: { type: String, default: 'student' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
