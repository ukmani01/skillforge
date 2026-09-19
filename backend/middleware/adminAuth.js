'use strict';

module.exports = function adminAuth(req, res, next) {
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ success: false, error: 'Admin only.' });
  }
  next();
};
