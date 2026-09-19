'use strict';

const express = require('express');
const router = express.Router();

const requireAdmin = require('../middleware/requireAdmin');
const Student = require('../models/student');
const Attempt = require('../models/attempt');
const Feedback = require('../models/feedback');
const Post = require('../models/post');

/**
 * GET /api/admin/students
 * List all students (admin only).
 * Excludes passwordHash.
 */
router.get('/admin/students', requireAdmin, async function (req, res) {
  try {
    const students = await Student
      .find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: students.length, students: students });
  } catch (error) {
    console.error('GET /admin/students error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch students.' });
  }
});

/**
 * GET /api/admin/students/:id
 * Get a single student by MongoDB _id (admin only).
 */
router.get('/admin/students/:id', requireAdmin, async function (req, res) {
  try {
    const student = await Student
      .findById(req.params.id)
      .select('-passwordHash')
      .lean();
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }
    res.json({ success: true, student: student });
  } catch (error) {
    console.error('GET /admin/students/:id error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch student.' });
  }
});

/**
 * GET /api/admin/attempts
 * List all attempts (admin only). Supports optional ?year= and ?email= filters.
 */
router.get('/admin/attempts', requireAdmin, async function (req, res) {
  try {
    const year = req.query.year;
    const email = req.query.email;
    const filter = {};
    if (year && year !== 'all') filter.year = year;
    if (email) filter.studentEmail = String(email).trim().toLowerCase();

    const attempts = await Attempt
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: attempts.length, attempts: attempts });
  } catch (error) {
    console.error('GET /admin/attempts error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch attempts.' });
  }
});

/**
 * GET /api/admin/feedback
 * List all feedback (admin only).
 */
router.get('/admin/feedback', requireAdmin, async function (req, res) {
  try {
    const feedback = await Feedback
      .find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: feedback.length, feedback: feedback });
  } catch (error) {
    console.error('GET /admin/feedback error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch feedback.' });
  }
});

/**
 * GET /api/admin/posts
 * List all posts (admin only).
 */
router.get('/admin/posts', requireAdmin, async function (req, res) {
  try {
    const posts = await Post
      .find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: posts.length, posts: posts });
  } catch (error) {
    console.error('GET /admin/posts error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch posts.' });
  }
});

/**
 * DELETE /api/admin/posts/:id
 * Admin can delete any post.
 */
router.delete('/admin/posts/:id', requireAdmin, async function (req, res) {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }
    res.json({ success: true, message: 'Post deleted.' });
  } catch (error) {
    console.error('DELETE /admin/posts/:id error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete post.' });
  }
});

module.exports = router;