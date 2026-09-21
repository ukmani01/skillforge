// frontend/js/questionLoader.js
// Loads quiz questions from the backend API.
// Backend endpoint: GET /api/quiz/questions?year=2nd&level=1
// Falls back to empty set on error.
//
// Exposes: window.QuestionLoader

(function () {
  'use strict';

  var api = window.SkillForgeAPI;

  var cache = {};

  function cacheKey(year, level, moduleKey) {
    return String(year) + ':' + String(level) + ':' + String(moduleKey || '');
  }

  /**
   * Fetch questions for a given year and level.
   * @param {string} year - '2nd' | '3rd'
   * @param {number} level - 1 | 2
   * @returns {Promise<{ok:boolean, questions:Array, error?:string, subject?:string}>}
   */
  async function load(year, level, moduleKey) {
    var key = cacheKey(year, level, moduleKey);
    if (cache[key]) {
      return cache[key];
    }

    try {
      var url = '/api/quiz/questions?year=' +
        encodeURIComponent(year) +
        '&level=' +
        encodeURIComponent(level) +
        (moduleKey ? '&moduleKey=' + encodeURIComponent(moduleKey) : '');

      var r = await api.get(url);

      if (!r.ok || !r.data || !r.data.success) {
        return {
          ok: false,
          questions: [],
          error: (r.data && r.data.error) || 'Failed to load questions.'
        };
      }

      var result = {
        ok: true,
        questions: Array.isArray(r.data.questions) ? r.data.questions : [],
        subject: r.data.subject || '',
        year: r.data.year || year,
        level: r.data.level || level,
        moduleKey: r.data.moduleKey || year + '-core'
      };

      if (result.questions.length > 0) {
        cache[key] = result;
      }

      return result;
    } catch (err) {
      return {
        ok: false,
        questions: [],
        error: err && err.message ? err.message : 'Network error.'
      };
    }
  }

  /**
   * Clear the cache (used when retrying).
   */
  function clearCache() {
    cache = {};
  }

  window.QuestionLoader = {
    load: load,
    clearCache: clearCache
  };
})();