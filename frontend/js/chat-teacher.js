// frontend/js/chat-teacher.js
// Teacher-side Socket.IO chat client.
// Backend Socket.IO is already running on the same HTTP server.
//
// Exposes: window.TeacherChat

(function () {
  'use strict';

  var socket = null;
  var listeners = [];

  function emit(event, data) {
    listeners.forEach(function (fn) {
      try { fn(event, data); } catch (e) { /* ignore */ }
    });
  }

  /**
   * Connect as a teacher.
   * @param {Object} opts - { name, room }
   * @returns {boolean} - true if connection initiated
   */
  function connect(opts) {
    if (typeof io === 'undefined') {
      emit('error', { message: 'socket.io client not loaded.' });
      return false;
    }

    if (socket && socket.connected) {
      return true;
    }

    var options = opts || {};
    var name = options.name || 'Teacher';
    var room = options.room || 'general';

    socket = io(window.location.origin, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', function () {
      emit('connected', { id: socket.id });
      socket.emit('join', room);
    });

    socket.on('disconnect', function (reason) {
      emit('disconnected', { reason: reason });
    });

    socket.on('presence:snapshot', function (state) {
      emit('presence', { online: true, trainerOnline: state.trainerOnline });
    });

    socket.on('presence:update', function (state) {
      emit('presence', state);
    });

    socket.on('connect_error', function (err) {
      emit('error', { message: err && err.message ? err.message : 'Connection error.' });
    });

    socket.on('chat:message', function (msg) {
      emit('message', msg);
    });

    return true;
  }

  /**
   * Send a chat message.
   * @param {string} text
   * @param {string} room
   */
  function send(text, room) {
    if (!socket || !socket.connected) {
      emit('error', { message: 'Not connected.' });
      return false;
    }
    var trimmed = String(text || '').trim();
    if (!trimmed) return false;
    socket.emit('chat:message', {
      text: trimmed.slice(0, 2000),
      room: room || 'general'
    });
    return true;
  }

  /**
   * Disconnect.
   */
  function disconnect() {
    if (socket) {
      try { socket.removeAllListeners(); socket.disconnect(); } catch (e) { /* ignore */ }
      socket = null;
    }
  }

  /**
   * Check connection status.
   */
  function isConnected() {
    return !!(socket && socket.connected);
  }

  /**
   * Subscribe to events.
   * Events: 'connected', 'disconnected', 'error', 'message'
   */
  function on(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  window.TeacherChat = {
    connect: connect,
    send: send,
    disconnect: disconnect,
    isConnected: isConnected,
    on: on
  };
})();