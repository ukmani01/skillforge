// frontend/js/quiz.js
// Quiz flow. Loads questions from /api/quiz/questions via QuestionLoader.
// Submits answers to /api/quiz/submit for server-side scoring,
// then saves the attempt via /api/attempts.

(function () {
  'use strict';

  var api = window.SkillForgeAPI;
  var utils = window.SkillForgeUtils;
  var loader = window.QuestionLoader;

  var state = {
    selectedYear: null,
    currentLevel: 1,
    level1Percentage: null,
    currentQuestions: [],
    currentIndex: 0,
    answers: [],
    studentName: '',
    studentEmail: '',
    quizStarted: false,
    quizSubmitted: false,
    loading: false,
    error: null
  };

  function el(id) {
    return document.getElementById(id);
  }

  function selectYear(year) {
    state.selectedYear = year;
    if (el('year2nd')) el('year2nd').classList.toggle('selected', year === '2nd');
    if (el('year3rd')) el('year3rd').classList.toggle('selected', year === '3rd');
    if (el('yearError')) el('yearError').style.display = 'none';
  }

  function startQuiz() {
    var nameEl = el('studentName');
    var emailEl = el('studentEmail');
    var name = nameEl ? nameEl.value.trim() : '';
    var email = emailEl ? emailEl.value.trim() : '';

    if (!name) { alert('Please enter your name.'); return; }
    if (!email || email.indexOf('@') < 0) { alert('Please enter a valid email.'); return; }
    if (!state.selectedYear) {
      if (el('yearError')) el('yearError').style.display = 'block';
      return;
    }

    state.studentName = name;
    state.studentEmail = email;
    state.quizStarted = true;
    state.quizSubmitted = false;
    state.currentLevel = 1;
    state.level1Percentage = null;
    state.currentIndex = 0;
    state.answers = [];
    state.error = null;

    loadLevelQuestions(state.selectedYear, 1);
  }

  async function loadLevelQuestions(year, level) {
    state.loading = true;
    state.error = null;
    state.currentLevel = level;

    if (el('qText')) el('qText').textContent = 'Loading questions...';
    if (el('qOptions')) el('qOptions').innerHTML = '';
    if (el('trackBadge')) {
      el('trackBadge').textContent = (year === '2nd' ? '2ND YEAR · HTML' : '3RD YEAR · Full Stack');
    }
    if (el('currentLevel')) el('currentLevel').textContent = level;

    utils.hideAll(['landing', 'quizResult', 'dashboard', 'dashboardLogin', 'studentPortal']);
    utils.show('quizActive');

    var result = await loader.load(year, level);

    if (!result.ok || result.questions.length === 0) {
      state.loading = false;
      state.error = result.error || 'Failed to load questions.';
      if (el('qText')) el('qText').textContent = 'Unable to load questions.';
      if (el('qOptions')) {
        el('qOptions').innerHTML =
          '<p class="text-muted text-sm" style="padding:12px;">' +
          utils.escapeHtml(state.error) +
          '</p>' +
          '<button type="button" class="btn btn-secondary btn-sm" onclick="window.__retryQuiz()">Retry</button>';
      }
      return;
    }

    state.currentLevel = level;
    state.currentQuestions = utils.shuffle(result.questions.slice());
    state.answers = new Array(state.currentQuestions.length).fill(null);
    state.currentIndex = 0;
    state.loading = false;

    if (el('totalQ')) el('totalQ').textContent = state.currentQuestions.length;
    renderQuestion();
  }

  function renderQuestion() {
    var qs = state.currentQuestions;
    var idx = state.currentIndex;
    if (!qs || qs.length === 0 || idx >= qs.length) return;
    var q = qs[idx];

    if (el('qNum')) el('qNum').textContent = idx + 1;
    if (el('totalQ')) el('totalQ').textContent = qs.length;

    var pct = Math.round(((idx + 1) / qs.length) * 100);
    if (el('qProgressFill')) el('qProgressFill').style.width = pct + '%';

    if (el('refContent')) el('refContent').innerHTML = q.reference || '';
    if (el('qText')) el('qText').textContent = q.question;

    var box = el('qOptions');
    if (!box) return;
    box.innerHTML = '';
    var letters = ['A', 'B', 'C', 'D'];
    (q.options || []).forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option' + (state.answers[idx] === i ? ' selected' : '');
      btn.innerHTML = '<span class="letter">' + letters[i] + '.</span> ' + utils.escapeHtml(opt);
      btn.addEventListener('click', function () { selectOption(i); });
      box.appendChild(btn);
    });

    if (el('prevBtn')) el('prevBtn').disabled = (idx === 0);
    if (el('submitBtn')) {
      el('submitBtn').textContent = (idx === qs.length - 1) ? '✅ Submit Level' : '✅ Submit';
      el('submitBtn').disabled = false;
    }
  }

  function selectOption(i) {
    if (state.quizSubmitted) return;
    state.answers[state.currentIndex] = i;
    renderQuestion();
    if (state.currentIndex < state.currentQuestions.length - 1) {
      setTimeout(function () {
        if (!state.quizSubmitted) {
          state.currentIndex++;
          renderQuestion();
        }
      }, 500);
    }
  }

  function nextQuestion() {
    if (state.quizSubmitted) return;
    if (state.currentIndex < state.currentQuestions.length - 1) {
      state.currentIndex++;
      renderQuestion();
    } else {
      submitQuiz();
    }
  }

  function prevQuestion() {
    if (state.quizSubmitted) return;
    if (state.currentIndex > 0) {
      state.currentIndex--;
      renderQuestion();
    }
  }

  async function submitQuiz() {
    if (state.quizSubmitted) return;

    var unanswered = state.answers.some(function (a) { return a === null; });
    if (unanswered && !confirm('You have unanswered questions. Submit anyway?')) return;

    var answers = state.currentQuestions.map(function (q, i) {
      return {
        questionId: q.id,
        selectedOption: state.answers[i]
      };
    });

    if (el('submitBtn')) {
      el('submitBtn').disabled = true;
      el('submitBtn').textContent = '⏳ Submitting...';
    }

    // 1. Server-side scoring
    var scoreRes = await api.post('/api/quiz/submit', {
      year: state.selectedYear,
      level: state.currentLevel,
      answers: answers
    });

    if (!scoreRes.ok || !scoreRes.data || !scoreRes.data.success) {
      alert('Failed to submit: ' + ((scoreRes.data && scoreRes.data.error) || 'network error'));
      if (el('submitBtn')) {
        el('submitBtn').disabled = false;
        el('submitBtn').textContent = '✅ Submit';
      }
      return;
    }

    var serverResult = scoreRes.data;
    if (state.currentLevel === 1) state.level1Percentage = serverResult.percentage;
    var perf = utils.getPerformanceLevel(serverResult.percentage);
    var subject = state.selectedYear === '2nd' ? 'HTML Fundamentals' : 'Full Stack Web Development';

    // 2. Save the attempt (existing backend endpoint)
    var attemptPayload = {
      studentName: state.studentName,
      studentEmail: state.studentEmail,
      year: state.selectedYear,
      subject: subject,
      score: serverResult.score,
      totalQuestions: serverResult.totalQuestions,
      percentage: serverResult.percentage,
      level: perf.label,
      correctAnswers: serverResult.score,
      wrongAnswers: serverResult.totalQuestions - serverResult.score,
      selectedAnswers: state.answers,
      questionResults: serverResult.questionResults,
      easyScore: 0,
      mediumScore: 0,
      hardScore: 0,
      interviewScore: 0,
      suspiciousActivityCount: 0,
      timeTaken: 0,
      createdAt: new Date().toISOString(),
      currentLevel: state.currentLevel
    };

    var saveRes = await api.post('/api/attempts', attemptPayload);
    var previousBest = (saveRes.ok && saveRes.data && saveRes.data.previousBest) || 0;

    state.quizSubmitted = true;
    showResult(attemptPayload, previousBest, serverResult);
  }

  function showResult(result, previousBest, serverResult) {
    utils.hideAll(['quizActive', 'landing', 'dashboard', 'dashboardLogin', 'studentPortal']);
    utils.show('quizResult');

    if (el('resultStudent')) el('resultStudent').textContent = result.studentName;
    if (el('resultSubject')) {
      el('resultSubject').textContent =
        (result.year === '2nd' ? '2nd Year' : '3rd Year') +
        ' · Level ' + result.currentLevel + ' · ' + result.subject;
    }
    if (el('resultScore')) el('resultScore').textContent = result.score + ' / ' + result.totalQuestions;
    if (el('resultPct')) el('resultPct').textContent = result.percentage + '%';
    if (el('resultCorrect')) el('resultCorrect').textContent = result.correctAnswers;
    if (el('resultWrong')) el('resultWrong').textContent = result.wrongAnswers;
    if (el('resultPrevBest')) el('resultPrevBest').textContent = previousBest ? previousBest + '%' : '—';

    var perf = utils.getPerformanceLevel(result.percentage);
    if (el('resultLevel')) el('resultLevel').textContent = perf.label;
    if (el('resultTitle')) {
      el('resultTitle').textContent = state.currentLevel === 1 ? 'Level 1 Complete' : 'Assessment Complete';
    }
    if (el('nextLevelBtn')) {
      el('nextLevelBtn').classList.toggle('hidden', state.currentLevel !== 1);
    }
    if (el('restartBtn')) {
      el('restartBtn').classList.toggle('hidden', state.currentLevel !== 2);
    }
  }

  function goToNextLevel() {
    if (!state.selectedYear || state.currentLevel !== 1) return;
    state.quizSubmitted = false;
    state.currentIndex = 0;
    state.answers = [];
    loadLevelQuestions(state.selectedYear, 2);
  }

  function restartQuiz() {
    if (!state.selectedYear) return;
    loader.clearCache();
    state.quizSubmitted = false;
    state.currentIndex = 0;
    state.answers = [];
    loadLevelQuestions(state.selectedYear, state.currentLevel);
  }

  function retry() {
    restartQuiz();
  }

  // Expose for inline onclick handlers
  window.selectYear = selectYear;
  window.startQuiz = startQuiz;
  window.nextQuestion = nextQuestion;
  window.prevQuestion = prevQuestion;
  window.submitQuiz = submitQuiz;
  window.goToNextLevel = goToNextLevel;
  window.restartQuiz = restartQuiz;
  window.__retryQuiz = retry;
})();