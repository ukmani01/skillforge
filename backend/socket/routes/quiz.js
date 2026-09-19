'use strict';

const express = require('express');
const router = express.Router();

// Placeholder — the JSON quiz migration is a future stage.
// Return 501 so the frontend can detect "not implemented yet".

router.get('/quiz/questions', function (req, res) {
  res.status(501).json({ success: false, error: 'Quiz JSON API not implemented yet.' });
});

router.post('/quiz/submit', function (req, res) {
  res.status(501).json({ success: false, error: 'Quiz JSON submit not implemented yet.' });
});

module.exports = router;
