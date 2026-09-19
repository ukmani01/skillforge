'use strict';

const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const studentAuth = require('../middleware/studentAuth');

router.post('/posts', studentAuth, async function (req, res) {
  try {
    const body = req.body || {};
    const title = (body.title ? String(body.title) : '').trim();
    const text = (body.body ? String(body.body) : '').trim();

    if (!title || title.length > 200) {
      return res.status(400).json({ success: false, error: 'Title required (max 200).' });
    }
    if (!text || text.length > 5000) {
      return res.status(400).json({ success: false, error: 'Body required (max 5000).' });
    }

    const post = await Post.create({
      studentId: req.student._id,
      studentName: req.student.name,
      studentEmail: req.student.email,
      title: title,
      body: text
    });

    res.status(201).json({ success: true, post: post });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create post.' });
  }
});

router.get('/posts', async function (req, res) {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ success: true, posts: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch posts.' });
  }
});

router.get('/posts/mine', studentAuth, async function (req, res) {
  try {
    const posts = await Post
      .find({ studentId: req.student._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, posts: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch your posts.' });
  }
});

router.delete('/posts/:id', studentAuth, async function (req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });
    if (String(post.studentId) !== String(req.student._id)) {
      return res.status(403).json({ success: false, error: 'Not your post.' });
    }
    await post.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete post.' });
  }
});

module.exports = router;
