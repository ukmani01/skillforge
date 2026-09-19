'use strict';

const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  fromId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    index: true
  },
  toId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    index: true
  },
  fromName: { type: String, trim: true, default: '' },
  toName: { type: String, trim: true, default: '' },
  senderRole: { type: String, enum: ['student', 'teacher'], required: true },
  recipientRole: { type: String, enum: ['student', 'teacher'], required: true },
  room: { type: String, trim: true, default: '' },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
