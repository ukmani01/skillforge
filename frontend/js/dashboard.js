(function(){
'use strict';
var api=window.SkillForgeAPI;var utils=window.SkillForgeUtils;
var state={allResults:[],yearFilter:'all',pollInterval:null,teacherChatReady:false};
function el(id){return document.getElementById(id);}
function showLogin(){utils.hideAll(['homeView','landing','quizActive','quizResult','dashboard','studentPortal']);utils.show('dashboardLogin');if(typeof window.scrollToView==='function')window.scrollToView('dashboardLogin');}
function showDashboard(){utils.hideAll(['homeView','landing','quizActive','quizResult','dashboardLogin','studentPortal']);utils.show('dashboard');if(typeof window.scrollToView==='function')window.scrollToView('dashboard');fetchData();refreshAdminPanels();loadTeacherMessages();setupTeacherChat();if(state.pollInterval)clearInterval(state.pollInterval);state.pollInterval=setInterval(fetchData,10000);}
function renderFeedbackPanel(feedback){var list=el('feedbackPanelList');if(!list)return;var items=feedback||[]; if(!items.length){list.innerHTML='<p class="text-muted text-sm">No student feedback yet.</p>';return;} list.innerHTML=items.slice(0,8).map(function(item){var rating='⭐'.repeat(Number(item.rating)||0); return '<div class="community-post-item"><div class="meta">'+utils.escapeHtml(item.studentEmail||'Unknown')+' · '+(item.createdAt?new Date(item.createdAt).toLocaleString():'')+'</div><div class="title">'+rating+'</div><div class="body">'+utils.escapeHtml(item.comment||'No comment provided.')+'</div></div>';}).join('');}
function renderPostsPanel(posts){var list=el('adminPostsList');if(!list)return;var items=posts||[]; if(!items.length){list.innerHTML='<p class="text-muted text-sm">No community posts yet.</p>';return;} list.innerHTML=items.slice(0,8).map(function(item){var label=item.type==='announcement'?'Announcement':'Question';var controls=item.type==='announcement'?'<div class="actions"><button type="button" data-edit-announcement="'+item._id+'">Edit</button><button type="button" data-delete-announcement="'+item._id+'">Delete</button></div>':''; return '<div class="community-post-item"><div class="meta">'+utils.escapeHtml(item.studentName||'')+' · '+label+' · '+(item.createdAt?new Date(item.createdAt).toLocaleString():'')+'</div><div class="title">'+utils.escapeHtml(item.title||'')+'</div><div class="body">'+utils.escapeHtml(item.body||'')+'</div>'+controls+'</div>';}).join('');list.querySelectorAll('[data-edit-announcement]').forEach(function(button){button.addEventListener('click',function(){editAnnouncement(button.dataset.editAnnouncement,items);});});list.querySelectorAll('[data-delete-announcement]').forEach(function(button){button.addEventListener('click',function(){deleteAnnouncement(button.dataset.deleteAnnouncement);});});}
async function refreshAdminPanels(){
  var results=await Promise.all([api.get('/api/admin/feedback'),api.get('/api/admin/posts')]);
  var feedback=results[0];
  var posts=results[1];
  if(feedback.ok&&feedback.data&&feedback.data.success){renderFeedbackPanel(feedback.data.feedback||[]);} else {renderFeedbackPanel([]);}
  if(posts.ok&&posts.data&&posts.data.success){renderPostsPanel(posts.data.posts||[]);} else {renderPostsPanel([]);}
}
function appendTeacherMessage(message){
  var box=el('teacherChatBox');if(!box)return;
  var item=document.createElement('div');item.className='chat-msg';item.innerHTML='<span class="who">'+utils.escapeHtml(message.from||'Student')+':</span> <span class="text">'+utils.escapeHtml(message.text||'')+'</span>';box.appendChild(item);box.scrollTop=box.scrollHeight;
}
async function loadTeacherMessages(){
  var box=el('teacherChatBox');if(!box)return;
  var r=await api.get('/api/admin/chat/messages');
  if(!r.ok||!r.data||!r.data.success){box.innerHTML='<p class="text-muted text-sm">Trainer chat history is unavailable.</p>';return;}
  var messages=r.data.messages||[];
  if(!messages.length){box.innerHTML='<p class="text-muted text-sm">No student messages yet.</p>';return;}
  box.innerHTML=messages.map(function(m){return '<div class="chat-msg"><span class="who">'+utils.escapeHtml(m.fromName||'Student')+':</span> <span class="text">'+utils.escapeHtml(m.message||'')+'</span></div>';}).join('');box.scrollTop=box.scrollHeight;
}
function setupTeacherChat(){
  if(state.teacherChatReady||!window.TeacherChat)return;
  state.teacherChatReady=true;
  window.TeacherChat.on(function(event,payload){
    if(event==='connected'){var status=el('teacherChatStatus');if(status)status.textContent='online';}
    if(event==='disconnected'||event==='error'){var offline=el('teacherChatStatus');if(offline)offline.textContent='offline';}
    if(event==='message'&&payload&&payload.room==='trainer:general'){appendTeacherMessage(payload);}
  });
  window.TeacherChat.connect({name:'Trainer',room:'general'});
}
function sendTeacherMessage(){
  var input=el('teacherChatInput');if(!input||!window.TeacherChat)return;
  var text=input.value.trim();if(!text)return;
  if(window.TeacherChat.send(text,'general'))input.value='';
}
async function login(){
  var email=el('loginEmail').value.trim();var password=el('loginPassword').value;
  el('loginError').classList.add('hidden');el('loginLoading').classList.remove('hidden');el('loginBtn').classList.add('hidden');
  var r=await api.post('/api/admin/login',{email:email,password:password});
  el('loginLoading').classList.add('hidden');el('loginBtn').classList.remove('hidden');
  if(!r.ok||!r.data||!r.data.success){el('loginError').textContent=(r.data&&r.data.error)||'Invalid credentials.';el('loginError').classList.remove('hidden');return;}
  showDashboard();
}
async function logout(){if(window.TeacherChat)window.TeacherChat.disconnect();state.teacherChatReady=false;try{await api.post('/api/admin/logout',{});}catch(e){}if(state.pollInterval){clearInterval(state.pollInterval);state.pollInterval=null;}if(typeof window.showLanding==='function')window.showLanding();else showLogin();}
async function fetchData(){var r=await api.get('/api/attempts');if(r.ok&&r.data&&r.data.success){state.allResults=r.data.attempts||[];render();}}
async function createAnnouncement(){
  var title=el('announcementTitle').value.trim();
  var body=el('announcementBody').value.trim();
  var msg=el('announcementMsg');
  if(!title||!body){msg.textContent='Title and message are required.';msg.className='text-danger text-sm';return;}
  var r=await api.post('/api/posts/announcement',{title:title,body:body});
  if(!r.ok||!r.data||!r.data.success){msg.textContent=(r.data&&r.data.error)||'Announcement failed.';msg.className='text-danger text-sm';return;}
  msg.textContent='✅ Announcement published.';msg.className='text-success text-sm';
  el('announcementTitle').value='';el('announcementBody').value='';
  refreshAdminPanels();
}
async function editAnnouncement(id,posts){
  var item=(posts||[]).find(function(post){return String(post._id)===String(id);});
  if(!item)return;
  var title=window.prompt('Announcement title',item.title||'');
  if(title===null)return;
  var body=window.prompt('Announcement message',item.body||'');
  if(body===null)return;
  var r=await api.patch('/api/posts/announcement/'+id,{title:title,body:body});
  if(!r.ok||!r.data||!r.data.success){window.alert((r.data&&r.data.error)||'Announcement update failed.');return;}
  refreshAdminPanels();
}
async function deleteAnnouncement(id){
  if(!window.confirm('Delete this announcement?'))return;
  var r=await api.del('/api/posts/announcement/'+id);
  if(!r.ok||!r.data||!r.data.success){window.alert((r.data&&r.data.error)||'Announcement delete failed.');return;}
  refreshAdminPanels();
}
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
var questionBank={modules:[],questions:[]};
async function loadQuestionBank(){
  var box=el('questionBankList');if(!box)return;
  var r=await api.get('/api/admin/question-bank');
  if(!r.ok||!r.data||!r.data.success){box.innerHTML='<p class="text-danger">'+utils.escapeHtml((r.data&&r.data.error)||'Question bank unavailable.')+'</p>';return;}
  questionBank=r.data;renderQuestionBank();
}
function questionMessage(text,good){var box=el('questionBankMessage');if(box){box.textContent=text;box.className='text-sm '+(good?'text-success':'text-danger');}}
async function uploadQuestionJson(){
  var input=el('questionJsonInput');if(!input)return;
  var parsed;
  try{parsed=JSON.parse(input.value);}catch(error){questionMessage('Invalid JSON: '+error.message,false);return;}
  if(!parsed||!Array.isArray(parsed.questions)){questionMessage('JSON must contain a questions array.',false);return;}
  var r=await api.post('/api/admin/question-bank/upload',parsed);
  if(!r.ok||!r.data||!r.data.success){questionMessage((r.data&&r.data.error)||'Upload failed.',false);return;}
  questionMessage('Uploaded '+r.data.count+' questions.',true);input.value='';loadQuestionBank();
}
async function addQuestion(){
  var options=(el('newQuestionOptions').value||'').split('|').map(function(v){return v.trim();}).filter(Boolean);
  var body={moduleKey:el('newQuestionModule').value.trim(),qid:el('newQuestionId').value.trim(),question:el('newQuestionText').value.trim(),options:options,correct:Number(el('newQuestionCorrect').value),level:Number(el('newQuestionLevel').value)};
  var r=await api.post('/api/admin/question-bank/questions',body);
  if(!r.ok||!r.data||!r.data.success){questionMessage((r.data&&r.data.error)||'Question creation failed.',false);return;}
  questionMessage('Question added.',true);loadQuestionBank();
}
function renderQuestionBank(){
  var box=el('questionBankList');if(!box)return;
  var html='';
  questionBank.modules.forEach(function(module){
    var items=questionBank.questions.filter(function(q){return q.moduleKey===module.moduleKey;});
    html+='<section class="card" style="margin-bottom:12px;"><div class="portal-header"><h3>'+utils.escapeHtml(module.title)+' <span class="text-muted text-sm">('+utils.escapeHtml(module.year)+')</span></h3><button class="btn btn-danger btn-sm" type="button" data-delete-module="'+utils.escapeHtml(module.moduleKey)+'">Delete module</button></div>';
    html+='<p class="text-muted text-sm">'+utils.escapeHtml(module.subject)+' · '+items.length+' questions</p><div class="question-bank-items">';
    items.forEach(function(q){html+='<article class="review-item" data-question="'+utils.escapeHtml(String(q._id))+'"><input class="form-control qb-text" value="'+utils.escapeHtml(q.question)+'"><input class="form-control qb-options" value="'+utils.escapeHtml(q.options.join(' | '))+'"><div class="portal-actions"><input class="form-control qb-correct" type="number" min="0" value="'+q.correct+'" style="max-width:100px"><select class="form-control qb-level" style="max-width:120px"><option value="1" '+(q.level===1?'selected':'')+'>Level 1</option><option value="2" '+(q.level===2?'selected':'')+'>Level 2</option></select><button class="btn btn-secondary btn-sm" type="button" data-save-question="'+utils.escapeHtml(String(q._id))+'">Save</button><button class="btn btn-danger btn-sm" type="button" data-delete-question="'+utils.escapeHtml(String(q._id))+'">Delete</button></div></article>';});
    html+='</div></section>';
  });
  box.innerHTML=html||'<p class="text-muted">No trainer modules uploaded yet.</p>';
  box.querySelectorAll('[data-save-question]').forEach(function(button){button.addEventListener('click',function(){var item=button.closest('[data-question]');updateQuestion(button.dataset.saveQuestion,item);});});
  box.querySelectorAll('[data-delete-question]').forEach(function(button){button.addEventListener('click',function(){deleteQuestion(button.dataset.deleteQuestion);});});
  box.querySelectorAll('[data-delete-module]').forEach(function(button){button.addEventListener('click',function(){deleteModule(button.dataset.deleteModule);});});
}
async function updateQuestion(id,item){
  var options=item.querySelector('.qb-options').value.split('|').map(function(v){return v.trim();}).filter(Boolean);
  var r=await api.patch('/api/admin/question-bank/questions/'+id,{question:item.querySelector('.qb-text').value.trim(),options:options,correct:Number(item.querySelector('.qb-correct').value),level:Number(item.querySelector('.qb-level').value)});
  if(!r.ok)questionMessage((r.data&&r.data.error)||'Question update failed.',false);else{questionMessage('Question updated.',true);loadQuestionBank();}
}
async function deleteQuestion(id){if(!window.confirm('Delete this question?'))return;var r=await api.del('/api/admin/question-bank/questions/'+id);if(!r.ok)questionMessage((r.data&&r.data.error)||'Question deletion failed.',false);else loadQuestionBank();}
async function deleteModule(key){if(!window.confirm('Delete this module and all its questions?'))return;var r=await api.del('/api/admin/question-bank/modules/'+encodeURIComponent(key));if(!r.ok)questionMessage((r.data&&r.data.error)||'Module deletion failed.',false);else loadQuestionBank();}
window.showDashboardLogin=showLogin;window.dashboardLogin=login;window.adminLogout=logout;window.setYearFilter=setYearFilter;window.fetchDashboardData=fetchData;window.renderDashboard=render;window.createAnnouncement=createAnnouncement;window.sendTeacherMessage=sendTeacherMessage;window.loadQuestionBank=loadQuestionBank;window.uploadQuestionJson=uploadQuestionJson;window.addQuestion=addQuestion;
})();
