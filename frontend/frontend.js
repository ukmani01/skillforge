// frontend/frontend.js
// Debug version — prints everything it does.
// Run: node frontend.js   (or: nodemon frontend.js)

'use strict';

const fs = require('fs');
const path = require('path');

const HERE = __dirname;

console.log('');
console.log('=================================================');
console.log(' SkillForge — Frontend generator (debug)');
console.log(' HERE =', HERE);
console.log(' CWD  =', process.cwd());
console.log(' Node =', process.version);
console.log('=================================================');
console.log('');

function write(rel, contents) {
  const full = path.join(HERE, rel);
  try {
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, contents, 'utf8');
    const size = fs.statSync(full).size;
    console.log('✅ WROTE ' + full + '  (' + size + ' bytes)');
  } catch (err) {
    console.error('❌ FAILED to write ' + full);
    console.error('   ' + err.message);
  }
}

// ---------- css/base.css ----------
write('css/base.css', `/* SkillForge base */
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
--primary:#2563eb;--primary-hover:#1d4ed8;--primary-light:#dbeafe;
--success:#22c55e;--success-bg:#f0fdf4;
--warning:#f59e0b;--warning-bg:#fffbeb;
--danger:#ef4444;--danger-bg:#fef2f2;
--surface:#fff;--surface-alt:#f1f5f9;
--border:#e2e8f0;--border-light:#f1f5f9;
--text-primary:#0f172a;--text-secondary:#334155;--text-muted:#64748b;
--radius-sm:8px;--radius:12px;--radius-lg:20px;--radius-full:9999px;
--shadow-sm:0 2px 8px rgba(0,0,0,.04);--shadow:0 6px 24px rgba(0,0,0,.06);
--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:20px;--space-6:24px;
--font:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
--font-mono:'SF Mono','Menlo','Consolas',monospace;
--transition:.25s cubic-bezier(.4,0,.2,1);
}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:var(--font);background:#f1f5f9;color:var(--text-primary);line-height:1.6;min-height:100vh;font-size:15px}
.hidden{display:none!important}
.text-center{text-align:center}
.text-muted{color:var(--text-muted)}
.text-sm{font-size:.85rem}
.text-xs{font-size:.72rem}
.container{max-width:900px;margin:0 auto;padding:0 var(--space-4);width:100%}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-5);box-shadow:var(--shadow-sm);margin-bottom:var(--space-4)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-2);padding:12px 24px;font-family:var(--font);font-size:.92rem;font-weight:600;border:none;border-radius:var(--radius-full);cursor:pointer;transition:all var(--transition);min-height:44px;text-decoration:none;white-space:nowrap}
.btn-primary{background:var(--primary);color:#fff}
.btn-primary:hover{background:var(--primary-hover)}
.btn-secondary{background:var(--surface-alt);color:var(--text-primary);border:1.5px solid var(--border)}
.btn-success{background:var(--success);color:#fff}
.btn-danger{background:var(--danger);color:#fff}
.btn-sm{padding:8px 16px;font-size:.8rem;min-height:36px}
.btn-block{width:100%}
.btn:disabled{opacity:.5;cursor:not-allowed}
.form-group{margin-bottom:var(--space-3)}
.form-group label{display:block;font-weight:600;font-size:.85rem;margin-bottom:4px;color:var(--text-secondary)}
.form-control{width:100%;padding:11px 14px;border-radius:var(--radius);border:1.5px solid var(--border);font-size:.92rem;font-family:var(--font);background:var(--surface);color:var(--text-primary);min-height:44px}
.form-control:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-light)}
.badge{display:inline-block;padding:2px 10px;border-radius:var(--radius-full);font-size:.7rem;font-weight:700;text-transform:uppercase}
.badge-primary{background:var(--primary-light);color:var(--primary)}
.badge-success{background:var(--success-bg);color:var(--success)}
.badge-warning{background:var(--warning-bg);color:var(--warning)}
.badge-danger{background:var(--danger-bg);color:var(--danger)}
.navbar{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:0 var(--space-4)}
.navbar-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:60px}
.navbar-brand{display:flex;align-items:center;gap:8px;font-weight:700;font-size:1.05rem;cursor:pointer}
.navbar-brand .logo-icon{width:32px;height:32px;background:var(--primary);color:#fff;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.8rem}
.navbar-actions{display:flex;align-items:center;gap:8px}
.alert{padding:12px 16px;border-radius:var(--radius);margin-bottom:var(--space-3);font-size:.85rem}
.alert-error{background:var(--danger-bg);color:var(--danger);border:1px solid #fca5a5}
.alert-success{background:var(--success-bg);color:var(--success);border:1px solid #86efac}
.alert-info{background:var(--primary-light);color:var(--primary);border:1px solid #93c5fd}
.spinner{display:inline-block;width:24px;height:24px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.progress-bar{width:100%;height:4px;background:var(--border);border-radius:var(--radius-full);overflow:hidden}
.progress-bar .fill{height:100%;background:var(--primary);transition:width .3s}
.quiz-option{display:flex;align-items:center;gap:var(--space-3);padding:12px 16px;border-radius:var(--radius);border:2px solid var(--border);background:var(--surface);cursor:pointer;transition:all var(--transition);width:100%;text-align:left;font-size:.9rem;font-family:var(--font);color:var(--text-primary);margin-bottom:8px;min-height:48px}
.quiz-option:hover:not(.disabled){border-color:var(--primary);background:var(--primary-light)}
.quiz-option.selected{border-color:var(--primary);background:var(--primary-light)}
.quiz-option .letter{font-weight:700;color:var(--text-muted);min-width:24px}
table{width:100%;border-collapse:collapse;font-size:.82rem}
table th{text-align:left;padding:10px 12px;font-weight:700;color:var(--text-muted);font-size:.7rem;text-transform:uppercase;border-bottom:1.5px solid var(--border);background:var(--surface-alt)}
table td{padding:10px 12px;border-bottom:1px solid var(--border-light)}
table tr:last-child td{border-bottom:none}
.table-wrap{overflow-x:auto;border-radius:var(--radius);border:1px solid var(--border);background:var(--surface)}
`);

// ---------- css/portal.css ----------
write('css/portal.css', `/* Student Portal */
.portal-header{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.portal-header h2{font-size:1.2rem}
.portal-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;margin-bottom:16px;box-shadow:var(--shadow-sm)}
.portal-card h3{font-size:1rem;margin-bottom:12px}
.portal-actions{display:flex;gap:8px;flex-wrap:wrap}
.auth-tabs{display:flex;gap:8px;margin-bottom:16px}
.auth-tabs button{flex:1;padding:10px;border-radius:var(--radius-full);border:1.5px solid var(--border);background:transparent;font-family:var(--font);font-weight:600;cursor:pointer;color:var(--text-secondary);min-height:42px}
.auth-tabs button.active{background:var(--primary);color:#fff;border-color:var(--primary)}
.attempt-list{list-style:none;padding:0;margin:0}
.attempt-list li{padding:8px 0;border-bottom:1px solid var(--border-light);font-size:.85rem;display:flex;justify-content:space-between}
.attempt-list li:last-child{border-bottom:none}
.feedback-stars{display:flex;gap:6px;margin-bottom:10px}
.feedback-stars button{background:none;border:2px solid var(--border);width:44px;height:44px;border-radius:var(--radius);cursor:pointer;font-size:1.2rem}
.feedback-stars button.active{border-color:var(--warning);background:var(--warning-bg)}
.post-item{padding:12px;border:1px solid var(--border);border-radius:var(--radius);margin-bottom:8px;background:var(--surface)}
.post-item .post-meta{font-size:.72rem;color:var(--text-muted);margin-bottom:4px}
.post-item .post-title{font-weight:700;font-size:.9rem;margin-bottom:4px}
.post-item .post-body{font-size:.85rem;color:var(--text-secondary);white-space:pre-wrap}
.chat-box{height:240px;overflow-y:auto;background:var(--surface-alt);border-radius:var(--radius);padding:12px;margin-bottom:8px;font-size:.85rem}
.chat-msg{margin-bottom:8px}
.chat-msg .who{font-weight:700;font-size:.75rem;color:var(--primary)}
.chat-msg .text{display:block;color:var(--text-primary)}
.chat-input-row{display:flex;gap:8px}
.chat-input-row input{flex:1}
`);

// ---------- js/api.js ----------
write('js/api.js', `(function(){
'use strict';
var API_BASE_URL='';
async function apiFetch(path,options){
  options=options||{};
  options.credentials='include';
  options.headers=Object.assign({'Content-Type':'application/json'},options.headers||{});
  try{
    var res=await fetch(API_BASE_URL+path,options);
    var data=null;
    try{data=await res.json();}catch(e){data=null;}
    return {ok:res.ok,status:res.status,data:data};
  }catch(e){
    return {ok:false,status:0,data:null,error:e.message};
  }
}
window.SkillForgeAPI={
  baseUrl:API_BASE_URL,
  fetch:apiFetch,
  get:function(p){return apiFetch(p,{method:'GET'});},
  post:function(p,b){return apiFetch(p,{method:'POST',body:JSON.stringify(b||{})});},
  del:function(p){return apiFetch(p,{method:'DELETE'});}
};
console.log('API base:',API_BASE_URL);
})();
`);

// ---------- js/utils.js ----------
write('js/utils.js', `(function(){
'use strict';
window.SkillForgeUtils={
  escapeHtml:function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');},
  shuffle:function(arr){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;},
  getPerformanceLevel:function(p){if(p>=90)return{label:'EXCELLENT',badge:'badge-success'};if(p>=75)return{label:'STRONG',badge:'badge-primary'};if(p>=60)return{label:'DEVELOPING',badge:'badge-warning'};return{label:'NEEDS REVISION',badge:'badge-danger'};},
  show:function(id){var e=document.getElementById(id);if(e)e.classList.remove('hidden');},
  hide:function(id){var e=document.getElementById(id);if(e)e.classList.add('hidden');},
  hideAll:function(ids){ids.forEach(function(id){var e=document.getElementById(id);if(e)e.classList.add('hidden');});}
};
})();
`);

// ---------- js/auth.js ----------
write('js/auth.js', `(function(){
'use strict';
var api=window.SkillForgeAPI;
var studentAuth={
  currentStudent:null,
  isAuthenticated:false,
  init:async function(){
    try{
      var r=await api.get('/api/students/me');
      if(r.ok&&r.data&&r.data.success){this.currentStudent=r.data.student;this.isAuthenticated=true;}
      else{this.currentStudent=null;this.isAuthenticated=false;}
    }catch(e){this.currentStudent=null;this.isAuthenticated=false;}
    this.renderNavbarButton();
    return this.isAuthenticated;
  },
  login:async function(email,password){
    var r=await api.post('/api/students/login',{email:email,password:password});
    if(!r.ok||!r.data||!r.data.success)throw new Error((r.data&&r.data.error)||'Login failed');
    this.currentStudent=r.data.student;this.isAuthenticated=true;this.renderNavbarButton();return this.currentStudent;
  },
  register:async function(name,email,password,year){
    var r=await api.post('/api/students/register',{name:name,email:email,password:password,year:year});
    if(!r.ok||!r.data||!r.data.success)throw new Error((r.data&&r.data.error)||'Registration failed');
    this.currentStudent=r.data.student;this.isAuthenticated=true;this.renderNavbarButton();return this.currentStudent;
  },
  logout:async function(){
    try{await api.post('/api/students/logout',{});}catch(e){}
    this.currentStudent=null;this.isAuthenticated=false;this.renderNavbarButton();
  },
  renderNavbarButton:function(){
    var btn=document.getElementById('portalNavBtn');
    if(!btn)return;
    if(this.isAuthenticated&&this.currentStudent){btn.textContent='👤 '+(this.currentStudent.name||'Portal');}
    else{btn.textContent='👤 Login';}
  },
  prefillQuizForm:function(){
    if(!this.currentStudent)return;
    var n=document.getElementById('studentName');
    var e=document.getElementById('studentEmail');
    if(n&&!n.value)n.value=this.currentStudent.name||'';
    if(e&&!e.value)e.value=this.currentStudent.email||'';
  }
};
window.studentAuth=studentAuth;
})();
`);

// ---------- js/portal.js ----------
write('js/portal.js', `(function(){
'use strict';
var api=window.SkillForgeAPI;
var utils=window.SkillForgeUtils;
var auth=window.studentAuth;
var authMode='login';
var feedbackRating=0;
var socket=null;
function el(id){return document.getElementById(id);}
function showOnlyPortal(){
  utils.hideAll(['landing','quizActive','quizResult','dashboardLogin','dashboard']);
  utils.show('studentPortal');
}
async function openPortal(){
  showOnlyPortal();
  if(!auth.isAuthenticated){renderAuthForm();return;}
  await renderPortal();
}
function renderAuthForm(){
  var c=el('studentAuthContainer');var p=el('studentPortalContent');
  if(!c||!p)return;
  c.classList.remove('hidden');p.classList.add('hidden');
  c.innerHTML='<div class="card">'
   +'<div class="auth-tabs"><button id="tabLogin" class="active" type="button">Login</button><button id="tabRegister" type="button">Register</button></div>'
   +'<div class="form-group" id="nameGroup" style="display:none;"><label for="authName">Full Name</label><input type="text" id="authName" class="form-control" /></div>'
   +'<div class="form-group" id="yearGroup" style="display:none;"><label for="authYear">Year</label><select id="authYear" class="form-control"><option value="">Select</option><option value="2nd">2nd</option><option value="3rd">3rd</option></select></div>'
   +'<div class="form-group"><label for="authEmail">Email</label><input type="email" id="authEmail" class="form-control" /></div>'
   +'<div class="form-group"><label for="authPassword">Password</label><input type="password" id="authPassword" class="form-control" /></div>'
   +'<div id="authError" class="alert alert-error hidden"></div>'
   +'<button id="authSubmitBtn" type="button" class="btn btn-primary btn-block">Login</button>'
   +'</div>';
  el('tabLogin').addEventListener('click',function(){authMode='login';el('tabLogin').classList.add('active');el('tabRegister').classList.remove('active');el('nameGroup').style.display='none';el('yearGroup').style.display='none';el('authSubmitBtn').textContent='Login';});
  el('tabRegister').addEventListener('click',function(){authMode='register';el('tabRegister').classList.add('active');el('tabLogin').classList.remove('active');el('nameGroup').style.display='block';el('yearGroup').style.display='block';el('authSubmitBtn').textContent='Create Account';});
  el('authSubmitBtn').addEventListener('click',handleAuth);
}
async function handleAuth(){
  var errEl=el('authError');errEl.classList.add('hidden');errEl.textContent='';
  var email=el('authEmail').value.trim();var password=el('authPassword').value;
  try{
    if(authMode==='login'){await auth.login(email,password);}
    else{var name=el('authName').value.trim();var year=el('authYear').value;await auth.register(name,email,password,year);}
    await renderPortal();
  }catch(e){errEl.textContent=e.message||'Failed';errEl.classList.remove('hidden');}
}
async function renderPortal(){
  var c=el('studentAuthContainer');var p=el('studentPortalContent');
  c.classList.add('hidden');p.classList.remove('hidden');
  var s=auth.currentStudent||{};var esc=utils.escapeHtml;
  p.innerHTML='<div class="portal-header"><div><h2>👋 Welcome, '+esc(s.name||'')+'</h2><p class="text-muted text-sm">'+esc(s.email||'')+'</p></div><button id="portalLogoutBtn" class="btn btn-danger btn-sm" type="button">Logout</button></div>'
   +'<div class="portal-card"><h3>📊 Quiz History</h3><div id="attemptListContainer"><p class="text-muted text-sm">Loading...</p></div></div>'
   +'<div class="portal-card"><h3>📝 Feedback</h3><div class="feedback-stars" id="feedbackStars"><button type="button" data-v="1">⭐</button><button type="button" data-v="2">⭐</button><button type="button" data-v="3">⭐</button><button type="button" data-v="4">⭐</button><button type="button" data-v="5">⭐</button></div><textarea id="feedbackComment" class="form-control" placeholder="Thoughts..." rows="3"></textarea><button id="feedbackSubmitBtn" class="btn btn-primary btn-sm" type="button" style="margin-top:8px;">Submit</button><div id="feedbackMsg" class="text-sm" style="margin-top:6px;"></div></div>'
   +'<div class="portal-card"><h3>💬 Posts</h3><input type="text" id="postTitle" class="form-control" placeholder="Title" /><textarea id="postBody" class="form-control" placeholder="Body..." rows="3" style="margin-top:8px;"></textarea><button id="postSubmitBtn" class="btn btn-primary btn-sm" type="button" style="margin-top:8px;">Post</button><div id="postMsg" class="text-sm" style="margin-top:6px;"></div><div id="postListContainer" style="margin-top:12px;"></div></div>'
   +'<div class="portal-card"><h3>🔌 Live Chat</h3><div class="chat-box" id="chatBox"></div><div class="chat-input-row"><input type="text" id="chatInput" class="form-control" placeholder="Message..." /><button id="chatSendBtn" class="btn btn-primary btn-sm" type="button">Send</button></div><div class="text-xs text-muted" style="margin-top:6px;">Status: <span id="chatStatus">disconnected</span></div></div>'
   +'<button id="portalStartQuizBtn" class="btn btn-success btn-block" type="button" style="margin-top:12px;">🚀 Take Quiz</button>';
  el('portalLogoutBtn').addEventListener('click',async function(){await auth.logout();if(typeof window.showLanding==='function')window.showLanding();else showOnlyPortal();});
  el('portalStartQuizBtn').addEventListener('click',function(){if(typeof window.showLanding==='function')window.showLanding();auth.prefillQuizForm();});
  setupStars();el('feedbackSubmitBtn').addEventListener('click',submitFeedback);el('postSubmitBtn').addEventListener('click',submitPost);el('chatSendBtn').addEventListener('click',sendChat);
  el('chatInput').addEventListener('keydown',function(e){if(e.key==='Enter')sendChat();});
  await loadAttempts();await loadPosts();connectChat();
}
function setupStars(){
  var stars=document.querySelectorAll('#feedbackStars button');feedbackRating=0;
  stars.forEach(function(b){b.addEventListener('click',function(){feedbackRating=Number(b.dataset.v);stars.forEach(function(x,i){if(i<feedbackRating)x.classList.add('active');else x.classList.remove('active');});});});
}
async function loadAttempts(){
  var box=el('attemptListContainer');var r=await api.get('/api/students/me/attempts');
  if(!r.ok||!r.data||!r.data.success){box.innerHTML='<p class="text-muted text-sm">Failed.</p>';return;}
  var attempts=r.data.attempts||[];
  if(attempts.length===0){box.innerHTML='<p class="text-muted text-sm">No attempts yet.</p>';return;}
  var html='<ul class="attempt-list">';
  attempts.slice(0,20).forEach(function(a){html+='<li><span>'+utils.escapeHtml(a.year||'')+' · L'+(a.currentLevel||1)+'</span><span><strong>'+(a.score||0)+'/'+(a.totalQuestions||20)+'</strong> ('+(a.percentage||0)+'%)</span></li>';});
  html+='</ul>';box.innerHTML=html;
}
async function submitFeedback(){
  var msg=el('feedbackMsg');
  if(!feedbackRating){msg.textContent='Please select a rating.';msg.style.color='var(--danger)';return;}
  var comment=el('feedbackComment').value.trim();
  var r=await api.post('/api/feedback',{rating:feedbackRating,comment:comment});
  if(!r.ok||!r.data||!r.data.success){msg.textContent='❌ '+((r.data&&r.data.error)||'Failed');msg.style.color='var(--danger)';return;}
  msg.textContent='✅ Thanks!';msg.style.color='var(--success)';el('feedbackComment').value='';
}
async function submitPost(){
  var msg=el('postMsg');var title=el('postTitle').value.trim();var body=el('postBody').value.trim();
  if(!title||!body){msg.textContent='Title and body required.';msg.style.color='var(--danger)';return;}
  var r=await api.post('/api/posts',{title:title,body:body});
  if(!r.ok||!r.data||!r.data.success){msg.textContent='❌ '+((r.data&&r.data.error)||'Failed');msg.style.color='var(--danger)';return;}
  msg.textContent='✅ Posted!';msg.style.color='var(--success)';el('postTitle').value='';el('postBody').value='';await loadPosts();
}
async function loadPosts(){
  var box=el('postListContainer');var r=await api.get('/api/posts');
  if(!r.ok||!r.data||!r.data.success){box.innerHTML='<p class="text-muted text-sm">Failed.</p>';return;}
  var posts=r.data.posts||[];
  if(posts.length===0){box.innerHTML='<p class="text-muted text-sm">No posts yet.</p>';return;}
  var html='';
  posts.slice(0,20).forEach(function(p){html+='<div class="post-item"><div class="post-meta">'+utils.escapeHtml(p.studentName||'')+' · '+(p.createdAt?new Date(p.createdAt).toLocaleString():'')+'</div><div class="post-title">'+utils.escapeHtml(p.title||'')+'</div><div class="post-body">'+utils.escapeHtml(p.body||'')+'</div></div>';});
  box.innerHTML=html;
}
function connectChat(){
  if(typeof io==='undefined'){el('chatStatus').textContent='socket.io not loaded';return;}
  if(socket)return;
  var s=auth.currentStudent||{};
  socket=io(window.location.origin,{auth:{role:'student',studentId:s._id,email:s.email,name:s.name},transports:['websocket','polling']});
  socket.on('connect',function(){el('chatStatus').textContent='connected';socket.emit('join','general');});
  socket.on('disconnect',function(){el('chatStatus').textContent='disconnected';});
  socket.on('chat:message',function(m){var box=el('chatBox');if(!box)return;var d=document.createElement('div');d.className='chat-msg';d.innerHTML='<span class="who">'+utils.escapeHtml(m.from||'Guest')+':</span> <span class="text">'+utils.escapeHtml(m.text||'')+'</span>';box.appendChild(d);box.scrollTop=box.scrollHeight;});
}
function sendChat(){
  var input=el('chatInput');var text=input.value.trim();if(!text||!socket)return;
  socket.emit('chat:message',{text:text,room:'general'});input.value='';
}
window.openStudentPortal=openPortal;
})();
`);

// ---------- js/quiz.js (uses window.SECOND_YEAR_LEVELS / THIRD_YEAR_LEVELS) ----------
write('js/quiz.js', `(function(){
'use strict';
var api=window.SkillForgeAPI;var utils=window.SkillForgeUtils;
var state={selectedYear:null,currentLevel:1,currentQuestions:[],currentIndex:0,answers:[],studentName:'',studentEmail:'',violationCount:0,quizStarted:false,quizSubmitted:false};
function el(id){return document.getElementById(id);}
function selectYear(y){state.selectedYear=y;el('year2nd').classList.toggle('selected',y==='2nd');el('year3rd').classList.toggle('selected',y==='3rd');el('yearError').style.display='none';}
function startQuiz(){
  var name=el('studentName').value.trim();var email=el('studentEmail').value.trim();
  if(!name){alert('Enter your name.');return;}
  if(!email||email.indexOf('@')<0){alert('Enter a valid email.');return;}
  if(!state.selectedYear){el('yearError').style.display='block';return;}
  state.studentName=name;state.studentEmail=email;state.quizStarted=true;state.quizSubmitted=false;state.currentLevel=1;state.currentIndex=0;state.answers=[];state.violationCount=0;
  loadLevelQuestions(state.selectedYear,1);
}
function getQuestionSet(year,level){
  if(year==='2nd'&&typeof window.SECOND_YEAR_LEVELS!=='undefined'){return level===1?window.SECOND_YEAR_LEVELS.level1:window.SECOND_YEAR_LEVELS.level2;}
  if(year==='3rd'&&typeof window.THIRD_YEAR_LEVELS!=='undefined'){return level===1?window.THIRD_YEAR_LEVELS.level1:window.THIRD_YEAR_LEVELS.level2;}
  return null;
}
function loadLevelQuestions(year,level){
  var raw=getQuestionSet(year,level);
  if(!raw||raw.length===0){alert('Question set not loaded. Ensure SECOND_YEAR_LEVELS / THIRD_YEAR_LEVELS arrays exist on the page.');if(typeof window.showLanding==='function')window.showLanding();return;}
  state.currentLevel=level;
  state.currentQuestions=utils.shuffle(raw.map(function(q){return Object.assign({},q);}));
  state.answers=new Array(state.currentQuestions.length).fill(null);state.currentIndex=0;
  el('trackBadge').textContent=(year==='2nd'?'2ND YEAR · HTML':'3RD YEAR · Full Stack');
  el('totalQ').textContent=state.currentQuestions.length;el('currentLevel').textContent=level;
  utils.hideAll(['landing','quizResult','dashboard','dashboardLogin','studentPortal']);utils.show('quizActive');
  renderQuestion();
}
function renderQuestion(){
  var qs=state.currentQuestions;var idx=state.currentIndex;
  if(!qs||qs.length===0||idx>=qs.length)return;var q=qs[idx];
  el('qNum').textContent=idx+1;el('totalQ').textContent=qs.length;
  var pct=Math.round(((idx+1)/qs.length)*100);el('qProgressFill').style.width=pct+'%';
  if(el('refContent'))el('refContent').innerHTML=q.reference||'';
  el('qText').textContent=q.question;
  var box=el('qOptions');box.innerHTML='';var letters=['A','B','C','D'];
  (q.options||[]).forEach(function(opt,i){var btn=document.createElement('button');btn.type='button';btn.className='quiz-option'+(state.answers[idx]===i?' selected':'');btn.innerHTML='<span class="letter">'+letters[i]+'.</span> '+utils.escapeHtml(opt);btn.addEventListener('click',function(){selectOption(i);});box.appendChild(btn);});
  el('prevBtn').disabled=(idx===0);
  el('submitBtn').textContent=(idx===qs.length-1)?'✅ Submit Level':'✅ Submit';
}
function selectOption(i){
  if(state.quizSubmitted)return;state.answers[state.currentIndex]=i;renderQuestion();
  if(state.currentIndex<state.currentQuestions.length-1){setTimeout(function(){if(!state.quizSubmitted){state.currentIndex++;renderQuestion();}},500);}
}
function nextQuestion(){if(state.quizSubmitted)return;if(state.currentIndex<state.currentQuestions.length-1){state.currentIndex++;renderQuestion();}else{submitQuiz();}}
function prevQuestion(){if(state.quizSubmitted)return;if(state.currentIndex>0){state.currentIndex--;renderQuestion();}}
async function submitQuiz(){
  if(state.quizSubmitted)return;
  var unanswered=state.answers.some(function(a){return a===null;});
  if(unanswered&&!confirm('Unanswered questions. Submit anyway?'))return;
  var qs=state.currentQuestions;var correct=0;var easyC=0,medC=0,hardC=0;var questionResults=[];
  qs.forEach(function(q,i){var sel=state.answers[i];var isCorrect=(sel!==null&&sel===q.correct);if(isCorrect)correct++;if(q.difficulty==='easy'||q.difficulty==='easy-medium'){if(isCorrect)easyC++;}else if(q.difficulty==='medium'){if(isCorrect)medC++;}else if(q.difficulty==='hard'){if(isCorrect)hardC++;}questionResults.push({questionId:q.id,selectedOption:sel,correctOption:q.correct,isCorrect:isCorrect,difficulty:q.difficulty,topic:q.topic});});
  var total=qs.length;var pct=Math.round((correct/total)*100);var perf=utils.getPerformanceLevel(pct);
  var subject=state.selectedYear==='2nd'?'HTML Fundamentals':'Full Stack Web Development';
  var payload={studentName:state.studentName,studentEmail:state.studentEmail,year:state.selectedYear,subject:subject,score:correct,totalQuestions:total,percentage:pct,level:perf.label,correctAnswers:correct,wrongAnswers:total-correct,selectedAnswers:state.answers,questionResults:questionResults,easyScore:easyC,mediumScore:medC,hardScore:hardC,interviewScore:hardC,suspiciousActivityCount:state.violationCount,timeTaken:0,createdAt:new Date().toISOString(),currentLevel:state.currentLevel};
  el('submitBtn').disabled=true;el('submitBtn').textContent='⏳ Submitting...';
  var res=await api.post('/api/attempts',payload);
  if(!res.ok||!res.data||!res.data.success){alert('Failed: '+((res.data&&res.data.error)||'network error'));el('submitBtn').disabled=false;el('submitBtn').textContent='✅ Submit';return;}
  state.quizSubmitted=true;showResult(payload,res.data.previousBest);
}
function showResult(result,previousBest){
  utils.hideAll(['quizActive','landing','dashboard','dashboardLogin','studentPortal']);utils.show('quizResult');
  el('resultStudent').textContent=result.studentName;
  el('resultSubject').textContent=(result.year==='2nd'?'2nd Year':'3rd Year')+' · Level '+result.currentLevel+' · '+result.subject;
  el('resultScore').textContent=result.score+' / '+result.totalQuestions;
  el('resultPct').textContent=result.percentage+'%';
  el('resultCorrect').textContent=result.correctAnswers;
  el('resultWrong').textContent=result.wrongAnswers;
  el('resultPrevBest').textContent=previousBest?previousBest+'%':'—';
  el('resultLevel').textContent=utils.getPerformanceLevel(result.percentage).label;
}
window.selectYear=selectYear;window.startQuiz=startQuiz;window.nextQuestion=nextQuestion;window.prevQuestion=prevQuestion;window.submitQuiz=submitQuiz;
})();
`);

// ---------- js/dashboard.js ----------
write('js/dashboard.js', `(function(){
'use strict';
var api=window.SkillForgeAPI;var utils=window.SkillForgeUtils;
var state={allResults:[],yearFilter:'all',pollInterval:null};
function el(id){return document.getElementById(id);}
function showLogin(){utils.hideAll(['landing','quizActive','quizResult','dashboard','studentPortal']);utils.show('dashboardLogin');}
function showDashboard(){utils.hideAll(['landing','quizActive','quizResult','dashboardLogin','studentPortal']);utils.show('dashboard');fetchData();if(state.pollInterval)clearInterval(state.pollInterval);state.pollInterval=setInterval(fetchData,10000);}
async function login(){
  var email=el('loginEmail').value.trim();var password=el('loginPassword').value;
  el('loginError').classList.add('hidden');el('loginLoading').classList.remove('hidden');el('loginBtn').classList.add('hidden');
  var r=await api.post('/api/admin/login',{email:email,password:password});
  el('loginLoading').classList.add('hidden');el('loginBtn').classList.remove('hidden');
  if(!r.ok||!r.data||!r.data.success){el('loginError').textContent=(r.data&&r.data.error)||'Invalid credentials.';el('loginError').classList.remove('hidden');return;}
  showDashboard();
}
async function logout(){try{await api.post('/api/admin/logout',{});}catch(e){}if(state.pollInterval){clearInterval(state.pollInterval);state.pollInterval=null;}if(typeof window.showLanding==='function')window.showLanding();else showLogin();}
async function fetchData(){var r=await api.get('/api/attempts');if(r.ok&&r.data&&r.data.success){state.allResults=r.data.attempts||[];render();}}
function render(){
  var results=state.allResults;
  if(!results||results.length===0){el('leaderboardBody').innerHTML='<tr><td colspan="6" class="text-muted text-center">No results yet.</td></tr>';return;}
  var filtered=results;
  if(state.yearFilter!=='all')filtered=filtered.filter(function(r){return r.year===state.yearFilter;});
  var search=(el('dashSearch').value||'').trim().toLowerCase();
  if(search)filtered=filtered.filter(function(r){return (r.studentName||'').toLowerCase().indexOf(search)>=0||(r.studentEmail||'').toLowerCase().indexOf(search)>=0;});
  var best={};filtered.forEach(function(r){var k=r.studentEmail;if(!best[k]||r.percentage>best[k].percentage)best[k]=r;});
  var sorted=Object.values(best).sort(function(a,b){return (b.percentage-a.percentage)||(b.score-a.score);});
  var scores=sorted.map(function(r){return r.score||0;});
  var avg=scores.length?Math.round(scores.reduce(function(a,b){return a+b;},0)/scores.length*100/40):0;
  var highest=scores.length?Math.max.apply(null,scores):0;var lowest=scores.length?Math.min.apply(null,scores):0;
  el('statTotal').textContent=results.length;el('statAvg').textContent=avg+'%';el('statHighest').textContent=highest+'/40';el('statLowest').textContent=lowest+'/40';
  var rows='';sorted.forEach(function(r,i){var perf=utils.getPerformanceLevel(r.percentage||0);rows+='<tr><td>'+(i+1)+'</td><td><strong>'+utils.escapeHtml(r.studentName||'')+'</strong></td><td>'+utils.escapeHtml(r.year||'')+'</td><td>'+(r.score||0)+'/'+(r.totalQuestions||40)+'</td><td>'+(r.percentage||0)+'%</td><td><span class="badge '+perf.badge+'">'+perf.label+'</span></td></tr>';});
  el('leaderboardBody').innerHTML=rows;
}
function setYearFilter(y){state.yearFilter=y;document.querySelectorAll('.filter-btn[data-year]').forEach(function(b){b.classList.toggle('active',b.dataset.year===y);});render();}
window.showDashboardLogin=showLogin;window.dashboardLogin=login;window.adminLogout=logout;window.setYearFilter=setYearFilter;window.fetchDashboardData=fetchData;window.renderDashboard=render;
})();
`);

// ---------- index.html ----------
write('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>SkillForge — Learn. Practice. Assess.</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/css/base.css" />
<link rel="stylesheet" href="/css/portal.css" />
</head>
<body>
<header class="navbar">
  <div class="navbar-inner">
    <div class="navbar-brand" onclick="showLanding()"><span class="logo-icon">SF</span><span>SkillForge</span></div>
    <div class="navbar-actions">
      <button id="portalNavBtn" class="btn btn-secondary btn-sm" type="button" onclick="openStudentPortal()">👤 Login</button>
      <button class="btn btn-secondary btn-sm" type="button" onclick="showDashboardLogin()">📊</button>
    </div>
  </div>
</header>
<main>
<section id="landing" class="card container" style="margin-top:24px;">
  <h2 style="margin-bottom:8px;">Welcome to SkillForge</h2>
  <p class="text-muted text-sm" style="margin-bottom:16px;">Learn, practice and assess your full stack skills.</p>
  <div class="form-group"><label for="studentName">Full Name</label><input type="text" id="studentName" class="form-control" /></div>
  <div class="form-group"><label for="studentEmail">Email</label><input type="email" id="studentEmail" class="form-control" /></div>
  <h4 style="margin:12px 0 8px;">Select Your Year</h4>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    <div id="year2nd" class="card" style="cursor:pointer;margin:0;" onclick="selectYear('2nd')"><strong>🎓 2nd Year</strong><div class="text-muted text-sm">HTML Fundamentals</div></div>
    <div id="year3rd" class="card" style="cursor:pointer;margin:0;" onclick="selectYear('3rd')"><strong>🚀 3rd Year</strong><div class="text-muted text-sm">Full Stack</div></div>
  </div>
  <div id="yearError" class="text-sm" style="color:var(--danger);margin-top:8px;display:none;">Please select your year.</div>
  <button class="btn btn-primary btn-block" type="button" onclick="startQuiz()" style="margin-top:16px;">🚀 Start Quiz</button>
</section>

<section id="quizActive" class="card container hidden" style="margin-top:24px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <span id="trackBadge" class="badge badge-primary">—</span>
    <span class="text-sm text-muted">Level <span id="currentLevel">1</span> · Q <span id="qNum">1</span>/<span id="totalQ">20</span></span>
  </div>
  <div class="progress-bar" style="margin-bottom:16px;"><div class="fill" id="qProgressFill" style="width:0%;"></div></div>
  <div id="refContent" class="text-sm text-muted" style="margin-bottom:12px;"></div>
  <h3 id="qText" style="margin-bottom:16px;font-size:1rem;">Loading...</h3>
  <div id="qOptions"></div>
  <div style="display:flex;gap:8px;justify-content:space-between;margin-top:16px;">
    <button class="btn btn-secondary btn-sm" id="prevBtn" type="button" onclick="prevQuestion()">← Previous</button>
    <button class="btn btn-success btn-sm" id="submitBtn" type="button" onclick="submitQuiz()">Submit Level</button>
    <button class="btn btn-primary btn-sm" id="nextBtn" type="button" onclick="nextQuestion()">Next →</button>
  </div>
</section>

<section id="quizResult" class="card container hidden" style="margin-top:24px;text-align:center;">
  <h2 id="resultTitle">Level Complete</h2>
  <p class="text-muted text-sm" id="resultStudent">—</p>
  <p class="text-sm text-muted" id="resultSubject">—</p>
  <div style="display:flex;justify-content:center;gap:24px;margin:16px 0;flex-wrap:wrap;">
    <div><div style="font-size:1.8rem;font-weight:700;" id="resultScore">0/0</div><div class="text-xs text-muted">Score</div></div>
    <div><div style="font-size:1.8rem;font-weight:700;" id="resultPct">0%</div><div class="text-xs text-muted">%</div></div>
    <div><div style="font-size:1rem;font-weight:700;" id="resultLevel">—</div><div class="text-xs text-muted">Level</div></div>
  </div>
  <div class="text-sm">✅ <strong id="resultCorrect">0</strong> · ❌ <strong id="resultWrong">0</strong> · 📊 Best <strong id="resultPrevBest">—</strong></div>
  <button class="btn btn-secondary" type="button" onclick="showLanding()" style="margin-top:16px;">← Home</button>
</section>

<section id="dashboardLogin" class="card container hidden" style="margin-top:24px;max-width:400px;">
  <h2 style="margin-bottom:12px;">🔐 Trainer Login</h2>
  <div class="form-group"><label for="loginEmail">Email</label><input type="email" id="loginEmail" class="form-control" /></div>
  <div class="form-group"><label for="loginPassword">Password</label><input type="password" id="loginPassword" class="form-control" /></div>
  <div id="loginError" class="alert alert-error hidden"></div>
  <button class="btn btn-primary btn-block" id="loginBtn" type="button" onclick="dashboardLogin()">Login</button>
  <div id="loginLoading" class="text-center hidden" style="margin-top:12px;"><span class="spinner"></span></div>
</section>

<section id="dashboard" class="container hidden" style="margin-top:24px;">
  <div class="portal-header"><h1 style="font-size:1.4rem;">📊 Dashboard</h1><button class="btn btn-danger btn-sm" type="button" onclick="adminLogout()">Logout</button></div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">
    <div class="card" style="text-align:center;margin:0;"><div style="font-size:1.3rem;font-weight:700;" id="statTotal">0</div><div class="text-xs text-muted">Students</div></div>
    <div class="card" style="text-align:center;margin:0;"><div style="font-size:1.3rem;font-weight:700;" id="statAvg">0%</div><div class="text-xs text-muted">Avg</div></div>
    <div class="card" style="text-align:center;margin:0;"><div style="font-size:1.3rem;font-weight:700;" id="statHighest">0/40</div><div class="text-xs text-muted">Highest</div></div>
    <div class="card" style="text-align:center;margin:0;"><div style="font-size:1.3rem;font-weight:700;" id="statLowest">0/40</div><div class="text-xs text-muted">Lowest</div></div>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
    <button class="btn btn-secondary btn-sm filter-btn active" data-year="all" type="button" onclick="setYearFilter('all')">All</button>
    <button class="btn btn-secondary btn-sm filter-btn" data-year="2nd" type="button" onclick="setYearFilter('2nd')">2nd</button>
    <button class="btn btn-secondary btn-sm filter-btn" data-year="3rd" type="button" onclick="setYearFilter('3rd')">3rd</button>
    <input type="text" id="dashSearch" class="form-control" placeholder="Search..." style="flex:1;min-width:140px;" oninput="renderDashboard()" />
  </div>
  <div class="table-wrap"><table><thead><tr><th>#</th><th>Student</th><th>Year</th><th>Score</th><th>%</th><th>Level</th></tr></thead><tbody id="leaderboardBody"><tr><td colspan="6" class="text-center text-muted">No results yet.</td></tr></tbody></table></div>
</section>

<section id="studentPortal" class="container hidden" style="margin-top:24px;">
  <div id="studentAuthContainer"></div>
  <div id="studentPortalContent" class="hidden"></div>
</section>
</main>

<script src="/socket.io/socket.io.js"></script>
<script src="/js/api.js"></script>
<script src="/js/utils.js"></script>
<script src="/js/auth.js"></script>
<script src="/js/quiz.js"></script>
<script src="/js/dashboard.js"></script>
<script src="/js/portal.js"></script>
<script>
window.showLanding=function(){
  ['quizActive','quizResult','dashboard','dashboardLogin','studentPortal'].forEach(function(id){
    var e=document.getElementById(id);if(e)e.classList.add('hidden');
  });
  var l=document.getElementById('landing');if(l)l.classList.remove('hidden');
};
document.addEventListener('DOMContentLoaded',function(){
  if(window.studentAuth)window.studentAuth.init();
});
</script>
</body>
</html>
`);

console.log('');
console.log('=================================================');
console.log(' DONE.');
console.log(' Check these locations:');
console.log('   ' + path.join(HERE, 'index.html'));
console.log('   ' + path.join(HERE, 'css', 'base.css'));
console.log('   ' + path.join(HERE, 'css', 'portal.css'));
console.log('   ' + path.join(HERE, 'js', 'api.js'));
console.log('   ' + path.join(HERE, 'js', 'utils.js'));
console.log('   ' + path.join(HERE, 'js', 'auth.js'));
console.log('   ' + path.join(HERE, 'js', 'quiz.js'));
console.log('   ' + path.join(HERE, 'js', 'dashboard.js'));
console.log('   ' + path.join(HERE, 'js', 'portal.js'));
console.log('=================================================');
console.log('');