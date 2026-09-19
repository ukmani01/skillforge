'use strict';

const ChatRequest = require('../models/chatRequest');
const ChatMessage = require('../models/chatMessage');
const sessionMiddleware = require('../middleware/session');

const TRAINER_ROOM = 'trainer:general';
const online = { student: new Map(), teacher: new Map() };

function conversationKey(a, b) {
  const ids = [String(a), String(b)].sort();
  return 'chat:' + ids[0] + ':' + ids[1];
}

function sessionResponse() {
  return {
    headers: {},
    setHeader: function (name, value) { this.headers[name] = value; },
    getHeader: function (name) { return this.headers[name]; },
    removeHeader: function (name) { delete this.headers[name]; }
  };
}

function changePresence(role, id, amount) {
  const key = String(id || role);
  const current = (online[role].get(key) || 0) + amount;
  if (current <= 0) {
    online[role].delete(key);
    return true;
  }
  online[role].set(key, current);
  return amount > 0 ? current === 1 : current === 0;
}

module.exports = function attachSocket(httpServer) {
  let ServerClass;
  try {
    const socketio = require('socket.io');
    ServerClass = socketio.Server || socketio;
  } catch (e) {
    console.warn('socket.io not installed — skipping Socket.IO.');
    return null;
  }

  const io = new ServerClass(httpServer, {
    cors: { origin: true, credentials: true, methods: ['GET', 'POST'] }
  });

  io.use(function (socket, next) {
    const request = socket.request;
    sessionMiddleware(request, sessionResponse(), function (error) {
      if (error) return next(error);
      const session = request.session || {};
      if (session.isAdmin) {
        socket.data.role = 'teacher';
        socket.data.userId = String(session.adminEmail || 'teacher');
        socket.data.name = 'Trainer';
      } else if (session.studentId) {
        socket.data.role = 'student';
        socket.data.userId = String(session.studentId);
        socket.data.name = session.studentName || 'Student';
      } else {
        return next(new Error('Authentication required.'));
      }
      next();
    });
  });

  io.on('connection', function (socket) {
    const role = socket.data.role;
    const userId = socket.data.userId;
    const becameOnline = changePresence(role, userId, 1);
    socket.join(TRAINER_ROOM);
    socket.emit('presence:snapshot', { trainerOnline: online.teacher.size > 0, role: role });
    if (becameOnline) io.emit('presence:update', { role: role, userId: userId, online: true });

    socket.on('join', function (room) {
      if (role === 'teacher' && String(room || '') === 'general') socket.join(TRAINER_ROOM);
    });

    socket.on('join:chat', async function (otherUserId) {
      if (role !== 'student' || !otherUserId || String(otherUserId) === userId) return;
      const accepted = await ChatRequest.exists({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ],
        status: 'accepted'
      });
      if (accepted) socket.join(conversationKey(userId, otherUserId));
    });

    socket.on('chat:message', async function (payload) {
      const p = payload || {};
      const text = p.text ? String(p.text).trim().slice(0, 2000) : '';
      if (!text) return socket.emit('chat:error', { message: 'Message cannot be empty.' });

      try {
        if (role === 'teacher' || !p.toId || String(p.toId) === 'general') {
          const message = await ChatMessage.create({
            conversationId: TRAINER_ROOM,
            fromName: socket.data.name,
            message: text,
            senderRole: role,
            recipientRole: role === 'teacher' ? 'student' : 'teacher',
            room: TRAINER_ROOM,
            createdAt: new Date()
          });
          io.to(TRAINER_ROOM).emit('chat:message', {
            _id: message._id,
            from: socket.data.name,
            fromId: role === 'student' ? userId : null,
            toId: null,
            senderRole: role,
            text: message.message,
            room: TRAINER_ROOM,
            at: message.createdAt
          });
          return;
        }

        const toId = String(p.toId);
        const request = await ChatRequest.findOne({
          $or: [
            { senderId: userId, receiverId: toId },
            { senderId: toId, receiverId: userId }
          ],
          status: 'accepted'
        });
        if (!request) return socket.emit('chat:error', { message: 'Chat request is not accepted yet.' });

        const room = conversationKey(userId, toId);
        socket.join(room);
        const message = await ChatMessage.create({
          conversationId: room,
          fromId: userId,
          toId: toId,
          fromName: socket.data.name,
          message: text,
          senderRole: 'student',
          recipientRole: 'student',
          room: room,
          createdAt: new Date()
        });
        io.to(room).emit('chat:message', {
          _id: message._id,
          from: socket.data.name,
          fromId: userId,
          toId: toId,
          senderRole: 'student',
          text: message.message,
          room: room,
          at: message.createdAt
        });
      } catch (error) {
        console.error('socket chat error:', error.message);
        socket.emit('chat:error', { message: 'Message could not be sent.' });
      }
    });

    socket.on('disconnect', function (reason) {
      const becameOffline = changePresence(role, userId, -1);
      if (becameOffline) io.emit('presence:update', { role: role, userId: userId, online: false });
      console.log('socket disconnected:', socket.id, reason);
    });
  });

  return io;
};