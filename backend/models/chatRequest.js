'use strict';

const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  senderName: { type: String, required: true, trim: true },
  senderEmail: { type: String, required: true, lowercase: true, trim: true },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  receiverName: { type: String, required: true, trim: true },
  receiverEmail: { type: String, required: true, lowercase: true, trim: true },
  note: { type: String, default: '', trim: true, maxlength: 300 },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

chatRequestSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ChatRequest', chatRequestSchema);
