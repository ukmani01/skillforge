'use strict';

const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const studentAuth = require('../middleware/studentAuth');
const requireAdmin = require('../middleware/requireAdmin');

function normalizePost(post) {
  if (!post) return post;
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const replies = Array.isArray(post.replies) ? post.replies : [];
  return {
    ...post,
    likeCount: likes.length,
    replyCount: replies.length,
    isAnnouncement: !!(post.isAnnouncement || post.type === 'announcement'),
    type: post.type || (post.isAnnouncement ? 'announcement' : 'question')
  };
}

router.post('/posts', studentAuth, async function (req, res) {
  try {
    const body = req.body || {};
    const title = (body.title ? String(body.title) : '').trim();
    const text = (body.body ? String(body.body) : '').trim();
    const type = (body.type ? String(body.type).toLowerCase() : 'question');

    if (type !== 'question' && type !== 'announcement') {
      return res.status(400).json({ success: false, error: 'Invalid post type.' });
    }

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
      body: text,
      type: type,
      isAnnouncement: type === 'announcement',
      role: 'student'
    });

    res.status(201).json({ success: true, post: normalizePost(post.toObject ? post.toObject() : post) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create post.' });
  }
});

router.post('/posts/announcement', requireAdmin, async function (req, res) {
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
      studentId: req.session && req.session.studentId ? req.session.studentId : null,
      studentName: 'Trainer',
      studentEmail: req.session && req.session.adminEmail ? req.session.adminEmail : 'admin@skillforge.local',
      title: title,
      body: text,
      type: 'announcement',
      isAnnouncement: true,
      role: 'trainer'
    });

    res.status(201).json({ success: true, post: normalizePost(post.toObject ? post.toObject() : post) });
  } catch (error) {
    console.error('POST /posts/announcement error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create announcement.' });
  }
});

router.get('/posts', async function (req, res) {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ success: true, posts: posts.map(normalizePost) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch posts.' });
  }
});

router.get('/announcements', async function (req, res) {
  try {
    const announcements = await Post
      .find({ $or: [{ isAnnouncement: true }, { type: 'announcement' }] })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, announcements: announcements.map(normalizePost) });
  } catch (error) {
    console.error('GET /announcements error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch announcements.' });
  }
});

router.patch('/posts/announcement/:id', requireAdmin, async function (req, res) {
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
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, $or: [{ isAnnouncement: true }, { type: 'announcement' }] },
      { $set: { title: title, body: text, type: 'announcement', isAnnouncement: true, role: 'trainer' } },
      { new: true, runValidators: true }
    ).lean();
    if (!post) return res.status(404).json({ success: false, error: 'Announcement not found.' });
    res.json({ success: true, post: normalizePost(post) });
  } catch (error) {
    console.error('PATCH /posts/announcement/:id error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update announcement.' });
  }
});

router.delete('/posts/announcement/:id', requireAdmin, async function (req, res) {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      $or: [{ isAnnouncement: true }, { type: 'announcement' }]
    });
    if (!post) return res.status(404).json({ success: false, error: 'Announcement not found.' });
    res.json({ success: true });
  } catch (error) {
    console.error('DELETE /posts/announcement/:id error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete announcement.' });
  }
});

router.get('/posts/mine', studentAuth, async function (req, res) {
  try {
    const posts = await Post
      .find({ studentId: req.student._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, posts: posts.map(normalizePost) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch your posts.' });
  }
});

router.post('/posts/:id/like', studentAuth, async function (req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });

    const studentId = String(req.student._id);
    const hasLiked = (post.likes || []).some(function (item) {
      return String(item) === studentId;
    });

    if (hasLiked) {
      post.likes = (post.likes || []).filter(function (item) {
        return String(item) !== studentId;
      });
    } else {
      post.likes = post.likes || [];
      post.likes.push(req.student._id);
    }

    await post.save();
    res.json({ success: true, post: normalizePost(post.toObject ? post.toObject() : post) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update like.' });
  }
});

router.post('/posts/:id/reply', studentAuth, async function (req, res) {
  try {
    const body = req.body || {};
    const text = (body.body ? String(body.body) : '').trim();

    if (!text || text.length > 2000) {
      return res.status(400).json({ success: false, error: 'Reply required (max 2000).' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });

    const reply = {
      studentId: req.student._id,
      studentName: req.student.name,
      studentEmail: req.student.email,
      body: text,
      isTrainer: false,
      createdAt: new Date()
    };

    post.replies = post.replies || [];
    post.replies.push(reply);
    await post.save();

    res.status(201).json({ success: true, reply: reply, post: normalizePost(post.toObject ? post.toObject() : post) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to reply.' });
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
