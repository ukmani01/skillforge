'use strict';

const express = require('express');
const router = express.Router();
const studentAuth = require('../middleware/studentAuth');
const ChatRequest = require('../models/chatRequest');
const ChatMessage = require('../models/chatMessage');
const Student = require('../models/student');
const mongoose = require('mongoose');
const requireAdmin = require('../middleware/requireAdmin');

function conversationKey(a, b) {
  return ['chat', [String(a), String(b)].sort().join(':' )].join(':');
}

router.get('/chat/people', studentAuth, async function (req, res) {
  try {
    const students = await Student.find({ _id: { $ne: req.student._id } })
      .select('_id name email year')
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, students: students });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch students.' });
  }
});

router.get('/chat/requests', studentAuth, async function (req, res) {
  try {
    const incoming = await ChatRequest.find({ receiverId: req.student._id }).sort({ createdAt: -1 }).lean();
    const outgoing = await ChatRequest.find({ senderId: req.student._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, incoming: incoming, outgoing: outgoing });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch chat requests.' });
  }
});

router.post('/chat/request', studentAuth, async function (req, res) {
  try {
    const body = req.body || {};
    const receiverId = body.receiverId ? String(body.receiverId) : '';
    const note = body.note ? String(body.note).trim().slice(0, 300) : '';

    if (!receiverId || receiverId === String(req.student._id)) {
      return res.status(400).json({ success: false, error: 'Select a different student.' });
    }

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ success: false, error: 'Invalid student id.' });
    }

    const receiver = await Student.findById(receiverId).lean();
    if (!receiver) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    const existing = await ChatRequest.findOne({
      $or: [
        { senderId: req.student._id, receiverId: receiverId },
        { senderId: receiverId, receiverId: req.student._id }
      ]
    }).lean();

    if (existing) {
      return res.status(409).json({ success: false, error: 'Chat request already exists.' });
    }

    const request = await ChatRequest.create({
      senderId: req.student._id,
      senderName: req.student.name,
      senderEmail: req.student.email,
      receiverId: receiver._id,
      receiverName: receiver.name,
      receiverEmail: receiver.email,
      note: note,
      status: 'pending'
    });

    res.status(201).json({ success: true, request: request });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create chat request.' });
  }
});

router.patch('/chat/request/:id', studentAuth, async function (req, res) {
  try {
    const body = req.body || {};
    const status = String(body.status || '').toLowerCase();
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status.' });
    }

    const request = await ChatRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Chat request not found.' });
    }

    if (String(request.receiverId) !== String(req.student._id)) {
      return res.status(403).json({ success: false, error: 'Not allowed to update this request.' });
    }

    request.status = status;
    await request.save();
    res.json({ success: true, request: request });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update chat request.' });
  }
});

router.get('/chat/messages/:studentId', studentAuth, async function (req, res) {
  try {
    const otherId = String(req.params.studentId);
    if (!otherId) {
      return res.status(400).json({ success: false, error: 'Student id required.' });
    }

    if (!mongoose.isValidObjectId(otherId) || otherId === String(req.student._id)) {
      return res.status(400).json({ success: false, error: 'Invalid conversation participant.' });
    }

    const accepted = await ChatRequest.exists({
      $or: [
        { senderId: req.student._id, receiverId: otherId },
        { senderId: otherId, receiverId: req.student._id }
      ],
      status: 'accepted'
    });
    if (!accepted) {
      return res.status(403).json({ success: false, error: 'Chat is available after the request is accepted.' });
    }

    const messages = await ChatMessage.find({
      conversationId: conversationKey(req.student._id, otherId)
    }).sort({ createdAt: 1 }).lean();

    res.json({ success: true, messages: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch messages.' });
  }
});

router.get('/chat/trainer/messages', studentAuth, async function (req, res) {
  try {
    const messages = await ChatMessage.find({ room: 'trainer:general' })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch trainer messages.' });
  }
});

router.get('/admin/chat/messages', requireAdmin, async function (req, res) {
  try {
    const messages = await ChatMessage.find({ room: 'trainer:general' })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch trainer messages.' });
  }
});

module.exports = router;
