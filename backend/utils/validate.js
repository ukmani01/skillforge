'use strict';

function isNonEmptyString(v, max) {
  if (typeof v !== 'string') return false;
  const t = v.trim();
  if (t.length === 0) return false;
  if (max && t.length > max) return false;
  return true;
}

function isValidEmail(v) {
  if (typeof v !== 'string') return false;
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
}

function isIntInRange(v, min, max) {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max;
}

module.exports = {
  isNonEmptyString: isNonEmptyString,
  isValidEmail: isValidEmail,
  isIntInRange: isIntInRange
};
