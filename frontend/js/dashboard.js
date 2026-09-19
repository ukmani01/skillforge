(function(){
'use strict';
var api=window.SkillForgeAPI;var utils=window.SkillForgeUtils;
var state={allResults:[],yearFilter:'all',pollInterval:null,teacherChatReady:false};
function el(id){return document.getElementById(id);}
function showLogin(){utils.hideAll(['landing','quizActive','quizResult','dashboard','studentPortal']);utils.show('dashboardLogin');}
function showDashboard(){utils.hideAll(['landing','quizActive','quizResult','dashboardLogin','studentPortal']);utils.show('dashboard');fetchData();refreshAdminPanels();loadTeacherMessages();setupTeacherChat();if(state.pollInterval)clearInterval(state.pollInterval);state.pollInterval=setInterval(fetchData,10000);}
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
window.showDashboardLogin=showLogin;window.dashboardLogin=login;window.adminLogout=logout;window.setYearFilter=setYearFilter;window.fetchDashboardData=fetchData;window.renderDashboard=render;window.createAnnouncement=createAnnouncement;window.sendTeacherMessage=sendTeacherMessage;
})();
