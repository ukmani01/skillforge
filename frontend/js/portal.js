(function(){
'use strict';
var api=window.SkillForgeAPI;
var utils=window.SkillForgeUtils;
var auth=window.studentAuth;
var authMode='login';
var feedbackRating=0;
var socket=null;
var activeChatPeer=null;
var authSubmitting=false;
var onlineStudentIds={};
var activeChatType='trainer';
var mobileChatScreen='main';
function el(id){return document.getElementById(id);}
function showMobileChatScreen(screen){
  mobileChatScreen=screen;
  var hub=el('mobileChatHub');var workspace=el('chatWorkspace');
  if(hub)hub.classList.toggle('is-open',screen==='hub');
  if(workspace){workspace.classList.toggle('mobile-chat-visible',screen==='list'||screen==='conversation');workspace.classList.toggle('mobile-chat-category-students',screen==='list'&&activeChatType==='student');workspace.classList.toggle('mobile-chat-open',screen==='conversation');}
  document.body.classList.toggle('mobile-chat-active',screen!=='main');
}
function openMobileChatHub(){showMobileChatScreen('hub');}
function openMobileChatCategory(type){
  if(type==='groups')return;
  if(type==='trainer'){openTrainerChat();showMobileChatScreen('conversation');return;}
  activeChatType='student';setChatView('student',null);showMobileChatScreen('list');
}
function closeMobileChatHub(){showMobileChatScreen('main');}
function setChatView(type, peerId){
  activeChatType=type;
  var workspace=el('chatWorkspace');
  if(workspace)workspace.classList.toggle('is-student-chat',type==='student');
  document.querySelectorAll('[data-chat-view]').forEach(function(button){button.classList.toggle('is-active',button.dataset.chatView===type);});
  var trainerView=el('chatTrainerView');var studentView=el('chatStudentView');
  if(trainerView)trainerView.classList.toggle('hidden',type!=='trainer');
  if(studentView)studentView.classList.toggle('hidden',type!=='student');
  var title=el('chatHeaderTitle');var subtitle=el('chatHeaderSubtitle');
  var avatar=el('chatMainAvatar');var badge=el('chatTypeBadge');
  if(type==='student'){
    var option=el('dmStudentSelect')&&el('dmStudentSelect').selectedOptions[0];
    if(title)title.textContent=option&&option.value?option.textContent:'Student connection';
    if(subtitle)subtitle.textContent='Student connection';
    if(avatar){avatar.textContent=option&&option.value?(option.textContent||'S').slice(0,1).toUpperCase():'S';avatar.className='chat-main__avatar chat-main__avatar--student';}
    if(badge){badge.textContent='Student connection';badge.className='chat-main__type-badge chat-main__type-badge--student';}
  }else{
    if(title)title.textContent='Trainer';
    if(subtitle)subtitle.textContent='Mentor conversation';
    if(avatar){avatar.textContent='T';avatar.className='chat-main__avatar chat-main__avatar--trainer';}
    if(badge){badge.textContent='Trainer';badge.className='chat-main__type-badge chat-main__type-badge--trainer';}
  }
  if(window.innerWidth<=760&&workspace)workspace.classList.toggle('mobile-chat-open',type==='student'&&!!peerId);
}
function openTrainerChat(){setChatView('trainer');}
function openStudentChat(peerId){
  var select=el('dmStudentSelect');
  if(select&&peerId)select.value=String(peerId);
  activeChatPeer=peerId||activeChatPeer;
  if(activeChatPeer&&socket)socket.emit('join:chat',activeChatPeer);
  setChatView('student',activeChatPeer);
  loadDirectMessages();
}
function closeMobileChat(){var workspace=el('chatWorkspace');if(workspace)workspace.classList.remove('mobile-chat-open');if(activeChatType==='student'){showMobileChatScreen('list');}else{showMobileChatScreen('hub');}}
function toggleChatTheme(){document.documentElement.classList.toggle('chat-dark');localStorage.setItem('skillforge-chat-theme',document.documentElement.classList.contains('chat-dark')?'dark':'light');}
function initChatTheme(){if(localStorage.getItem('skillforge-chat-theme')==='dark')document.documentElement.classList.add('chat-dark');}
function showOnlyPortal(){
  utils.hideAll(['homeView','landing','quizActive','quizResult','dashboardLogin','dashboard']);
  utils.show('studentPortal');
  if(typeof window.scrollToView==='function')window.scrollToView('studentPortal');
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
  if(authSubmitting)return;
  authSubmitting=true;
  var submitButton=el('authSubmitBtn');
  if(submitButton){submitButton.disabled=true;submitButton.textContent='Please wait...';}
  var errEl=el('authError');errEl.classList.add('hidden');errEl.textContent='';
  var email=el('authEmail').value.trim();var password=el('authPassword').value;
  try{
    if(authMode==='login'){await auth.login(email,password);}
    else{var name=el('authName').value.trim();var year=el('authYear').value;await auth.register(name,email,password,year);}
    await renderPortal();
  }catch(e){errEl.textContent=e.message||'Unable to complete authentication.';errEl.classList.remove('hidden');
  }finally{
    authSubmitting=false;
    if(submitButton){submitButton.disabled=false;submitButton.textContent=authMode==='login'?'Login':'Create Account';}
  }
}
async function renderPortal(){
  var c=el('studentAuthContainer');var p=el('studentPortalContent');
  c.classList.add('hidden');p.classList.remove('hidden');
  var s=auth.currentStudent||{};var esc=utils.escapeHtml;
  p.innerHTML='<div class="portal-header"><div><h2>👋 Welcome, '+esc(s.name||'')+'</h2><p class="text-muted text-sm">'+esc(s.email||'')+'</p></div><button id="portalLogoutBtn" class="btn btn-danger btn-sm" type="button">Logout</button></div>'
   +'<div class="portal-card"><h3>📊 Quiz History</h3><div id="attemptListContainer"><p class="text-muted text-sm">Loading...</p></div></div>'
   +'<div class="portal-card"><h3>📝 Feedback</h3><div class="feedback-stars" id="feedbackStars"><button type="button" data-v="1">⭐</button><button type="button" data-v="2">⭐</button><button type="button" data-v="3">⭐</button><button type="button" data-v="4">⭐</button><button type="button" data-v="5">⭐</button></div><textarea id="feedbackComment" class="form-control" placeholder="Thoughts..." rows="3"></textarea><button id="feedbackSubmitBtn" class="btn btn-primary btn-sm" type="button" style="margin-top:8px;">Submit</button><div id="feedbackMsg" class="text-sm" style="margin-top:6px;"></div></div>'
  +'<div class="portal-card"><h3>💬 Community</h3><input type="text" id="postTitle" class="form-control" placeholder="Title" /><textarea id="postBody" class="form-control" placeholder="Share a question or tip..." rows="3" style="margin-top:8px;"></textarea><button id="postSubmitBtn" class="btn btn-primary btn-sm" type="button" style="margin-top:8px;">Post</button><div id="postMsg" class="text-sm" style="margin-top:6px;"></div><div id="postListContainer" style="margin-top:12px;"></div></div>'
  +'<button id="chatFab" class="chat-fab" type="button" aria-label="Open messages">💬<span>Chat</span></button><div id="mobileChatHub" class="mobile-chat-hub" aria-hidden="true"><div class="mobile-chat-hub__header"><button id="mobileChatHubBack" type="button" aria-label="Close messages">←</button><div><strong>Messages</strong><small>Choose a conversation</small></div><button id="mobileChatThemeToggle" type="button" aria-label="Toggle dark mode">☾</button></div><div class="mobile-chat-hub__search"><span>⌕</span><input id="mobileChatSearch" type="search" placeholder="Search conversations" aria-label="Search conversations" /></div><div class="mobile-chat-hub__categories"><button type="button" data-mobile-category="trainer" class="mobile-chat-category mobile-chat-category--trainer"><span> T </span><b>Trainer</b><small>Mentor conversations</small><i>›</i></button><button type="button" data-mobile-category="groups" class="mobile-chat-category mobile-chat-category--group"><span> G </span><b>Groups</b><small>No group conversations</small><i>›</i></button><button type="button" data-mobile-category="students" class="mobile-chat-category mobile-chat-category--student"><span> S </span><b>Connected students</b><small>Accepted connections</small><i>›</i></button></div></div>'
  +'<div class="portal-card chat-workspace" id="chatWorkspace"><aside class="chat-sidebar"><div class="chat-sidebar__heading"><button id="mobileChatListBack" class="mobile-chat-list-back" type="button" aria-label="Back to message categories">←</button><div><span class="eyebrow">Messages</span><h3>Conversations</h3></div><span class="chat-sidebar__status"><i></i> Live</span></div><input id="chatSearch" class="form-control chat-search" type="search" placeholder="Search conversations" aria-label="Search conversations" /><div class="chat-sidebar__section"><span class="chat-sidebar__label">Channels</span><button class="chat-conversation chat-conversation--trainer is-active" data-chat-view="trainer" data-search-name="trainer" type="button"><span class="chat-conversation__icon">T</span><span><strong>Trainer</strong><small>Mentor conversation</small></span><b>›</b></button><button class="chat-conversation chat-conversation--group" type="button" disabled><span class="chat-conversation__icon">G</span><span><strong>Groups</strong><small>No group conversations</small></span></button></div><div class="chat-sidebar__section chat-sidebar__section--students"><span class="chat-sidebar__label">Connected students</span><div id="connectedStudentList" class="connected-student-list"></div><div id="studentDirectoryList"></div><div id="chatRequestList"></div></div><button id="chatThemeToggle" class="chat-theme-toggle" type="button">☾ <span>Dark mode</span></button></aside><section class="chat-main"><header class="chat-main__header"><button id="chatBackBtn" class="chat-main__back" type="button" aria-label="Back to conversations">←</button><span class="chat-main__avatar chat-main__avatar--trainer" id="chatMainAvatar">T</span><div><h3 id="chatHeaderTitle">Trainer</h3><p id="chatHeaderSubtitle">Mentor conversation</p></div><span class="chat-main__type-badge chat-main__type-badge--trainer" id="chatTypeBadge">Trainer</span><span class="chat-main__connection" id="chatStatus"><i></i> offline</span></header><div id="chatTrainerView" class="chat-view chat-view--trainer"><div class="chat-box" id="chatBox"></div><div class="chat-input-row"><input id="chatInput" class="form-control" placeholder="Message your trainer..." /><button id="chatSendBtn" class="btn btn-primary btn-sm" type="button">Send</button></div></div><div id="chatStudentView" class="chat-view chat-view--student hidden"><select id="dmStudentSelect" class="form-control chat-peer-select" aria-label="Selected student"><option value="">Select a connected student</option></select><div class="chat-box dm-chat-box" id="dmChatBox"></div><div class="chat-input-row"><input type="text" id="dmChatInput" class="form-control" placeholder="Write a message..." /><button id="dmChatSendBtn" class="btn btn-primary btn-sm" type="button">Send</button></div></div></section></div>'
   +'<button id="portalStartQuizBtn" class="btn btn-success btn-block" type="button" style="margin-top:12px;">🚀 Take Quiz</button>';
  el('portalLogoutBtn').addEventListener('click',async function(){disconnectChat();await auth.logout();if(typeof window.showLanding==='function')window.showLanding();else showOnlyPortal();});
  el('chatBackBtn').addEventListener('click',closeMobileChat);
  initChatTheme();
  el('chatThemeToggle').addEventListener('click',toggleChatTheme);
  el('chatFab').addEventListener('click',openMobileChatHub);
  el('mobileChatHubBack').addEventListener('click',closeMobileChatHub);
  el('mobileChatListBack').addEventListener('click',openMobileChatHub);
  el('mobileChatThemeToggle').addEventListener('click',toggleChatTheme);
  document.querySelectorAll('[data-mobile-category]').forEach(function(button){button.addEventListener('click',function(){openMobileChatCategory(button.dataset.mobileCategory);});});
  el('mobileChatSearch').addEventListener('input',function(){el('chatSearch').value=this.value;el('chatSearch').dispatchEvent(new Event('input'));});
  document.querySelectorAll('[data-chat-view]').forEach(function(button){button.addEventListener('click',function(){if(button.dataset.chatView==='trainer')openTrainerChat();});});
  el('portalStartQuizBtn').addEventListener('click',function(){if(typeof window.showLanding==='function')window.showLanding();auth.prefillQuizForm();});
  setupStars();el('feedbackSubmitBtn').addEventListener('click',submitFeedback);el('postSubmitBtn').addEventListener('click',submitPost);el('chatSendBtn').addEventListener('click',sendChat);
  el('chatInput').addEventListener('keydown',function(e){if(e.key==='Enter')sendChat();});
  el('dmChatSendBtn').addEventListener('click',sendDirectMessage);
  el('dmChatInput').addEventListener('keydown',function(e){if(e.key==='Enter')sendDirectMessage();});
  el('dmStudentSelect').addEventListener('change',function(){openStudentChat(this.value||null);});
  el('chatSearch').addEventListener('input',function(){var query=this.value.trim().toLowerCase();document.querySelectorAll('.chat-conversation[data-search-name]').forEach(function(item){item.classList.toggle('hidden',query&&item.dataset.searchName.indexOf(query)<0);});});
  setChatView('trainer');
  await loadAttempts();await loadPosts();await loadChatDirectory();await loadTrainerMessages();connectChat();
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
  posts.slice(0,20).forEach(function(p){
    var liked = Array.isArray(p.likes) && p.likes.some(function(item){return String(item)===String((auth.currentStudent&&auth.currentStudent._id) || '');});
    var replyCount = Number(p.replyCount || (Array.isArray(p.replies) ? p.replies.length : 0));
    var replyMarkup = '';
    if (Array.isArray(p.replies) && p.replies.length) {
      replyMarkup = '<div style="margin-top:10px;">'+p.replies.slice(0,3).map(function(reply){return '<div class="community-post-item" style="margin-bottom:6px;padding:10px 12px;"><div class="meta">'+utils.escapeHtml(reply.studentName||'')+' · '+(reply.createdAt?new Date(reply.createdAt).toLocaleString():'')+'</div><div class="body">'+utils.escapeHtml(reply.body||'')+'</div></div>';}).join('')+'</div>';
    }
    html+='<div class="community-post-item"><div class="meta">'+utils.escapeHtml(p.studentName||'')+' · '+(p.type==='announcement'?'Announcement':'Question')+' · '+(p.createdAt?new Date(p.createdAt).toLocaleString():'')+'</div><div class="title">'+utils.escapeHtml(p.title||'')+'</div><div class="body">'+utils.escapeHtml(p.body||'')+'</div><div class="actions"><button type="button" data-like-post="'+(p._id||'')+'">'+(liked?'Unlike ':'Like ')+'('+((p.likeCount||0)+(liked?0:0))+')</button><button type="button" data-reply-toggle="'+(p._id||'')+'">Reply ('+replyCount+')</button></div><div class="mini-form" style="display:none;" data-reply-box="'+(p._id||'')+'"><input type="text" class="form-control" data-reply-input="'+(p._id||'')+'" placeholder="Write a reply..." /><button type="button" class="btn btn-primary btn-sm" data-send-reply="'+(p._id||'')+'">Send</button></div>'+replyMarkup+'</div>';
  });
  box.innerHTML=html;
  box.querySelectorAll('[data-like-post]').forEach(function(btn){btn.addEventListener('click',function(){toggleLike(btn.dataset.likePost);});});
  box.querySelectorAll('[data-reply-toggle]').forEach(function(btn){btn.addEventListener('click',function(){var boxEl=box.querySelector('[data-reply-box="'+btn.dataset.replyToggle+'"]'); if(boxEl) boxEl.style.display = boxEl.style.display === 'none' ? 'flex' : 'none';});});
  box.querySelectorAll('[data-send-reply]').forEach(function(btn){btn.addEventListener('click',function(){var input=box.querySelector('[data-reply-input="'+btn.dataset.sendReply+'"]'); if(input){submitReply(btn.dataset.sendReply,input.value);}});});
}
async function toggleLike(postId){
  if(!postId)return;
  var r=await api.post('/api/posts/'+postId+'/like',{});
  if(!r.ok||!r.data||!r.data.success){return;}
  await loadPosts();
}
async function submitReply(postId,text){
  if(!postId||!text||!text.trim())return;
  var r=await api.post('/api/posts/'+postId+'/reply',{body:text.trim()});
  if(!r.ok||!r.data||!r.data.success){return;}
  await loadPosts();
}
async function loadChatDirectory(){
  var studentBox=el('studentDirectoryList');var reqBox=el('chatRequestList');var connectedBox=el('connectedStudentList');
  if(!studentBox||!reqBox)return;
  var [peopleRes,requestRes]=await Promise.all([api.get('/api/chat/people'),api.get('/api/chat/requests')]);
  var students=[];var requests={incoming:[],outgoing:[]};
  if(peopleRes.ok&&peopleRes.data&&peopleRes.data.success)students=peopleRes.data.students||[];
  if(requestRes.ok&&requestRes.data&&requestRes.data.success){requests=requestRes.data;}
  var currentId=String((auth.currentStudent&&auth.currentStudent._id)||'');
  var requestMap={};
  (requests.incoming||[]).concat(requests.outgoing||[]).forEach(function(item){
    var peerId=String(item.senderId===currentId?item.receiverId:item.senderId);
    requestMap[peerId]=item;
  });

  studentBox.innerHTML=students.filter(function(student){return String(student._id)!==currentId;}).map(function(student){
    var req = requestMap[String(student._id)];
    var label='Request chat';
    var action='request';
    if(req){
      if(req.status==='accepted'){label='Open chat';action='open';}
      else if(req.status==='pending'){label='Pending';action='pending';}
      else if(req.status==='declined'){label='Ask again';action='request';}
    }
    return '<div class="chat-request-item"><div class="meta">'+utils.escapeHtml(student.name||'')+' · '+utils.escapeHtml(student.year||'')+'</div><div class="actions"><button type="button" data-chat-person="'+student._id+'" data-chat-action="'+action+'">'+label+'</button></div></div>';
  }).join('') || '<p class="text-muted text-sm">No other students available.</p>';

  reqBox.innerHTML=(requests.incoming||[]).concat(requests.outgoing||[]).slice(0,8).map(function(item){
    var peerName=item.senderId===currentId?item.receiverName:item.senderName;
    var isIncoming=item.receiverId===currentId;
    var status=item.status||'pending';
    var actions='';
    if(isIncoming && status==='pending'){
      actions='<button type="button" data-request-action="accept" data-request-id="'+item._id+'">Accept</button><button type="button" data-request-action="decline" data-request-id="'+item._id+'">Decline</button>';
    }
    return '<div class="chat-request-item"><div class="meta">'+utils.escapeHtml(peerName||'')+' · '+(isIncoming?'Incoming':'Outgoing')+'</div><div class="actions"><span class="status-pill '+status+'">'+status+'</span>'+actions+'</div></div>';
  }).join('') || '<p class="text-muted text-sm">No chat requests yet.</p>';

  var select=el('dmStudentSelect');
  if(!select)return;
  var acceptedPeers = [];
  (requests.incoming||[]).concat(requests.outgoing||[]).forEach(function(item){if((item.status||'pending')==='accepted'){acceptedPeers.push(String(item.senderId===currentId?item.receiverId:item.senderId));}});
  select.innerHTML='<option value="">Select a student</option>' + students.filter(function(student){return acceptedPeers.indexOf(String(student._id))>=0;}).map(function(student){return '<option value="'+student._id+'">'+utils.escapeHtml(student.name||'')+'</option>';}).join('');
  if(connectedBox){
    connectedBox.innerHTML=students.filter(function(student){return acceptedPeers.indexOf(String(student._id))>=0;}).map(function(student){var online=!!onlineStudentIds[String(student._id)];var name=student.name||'Student';var active=String(activeChatPeer)===String(student._id)?' is-active':'';return '<button type="button" class="connected-student chat-conversation chat-conversation--student'+active+'" data-connected-student="'+student._id+'" data-chat-view="student" data-search-name="'+utils.escapeHtml(name.toLowerCase())+'"><span class="avatar">'+utils.escapeHtml(name.slice(0,1).toUpperCase())+'</span><span class="connected-student__copy"><strong>'+utils.escapeHtml(name)+'</strong><small>Student connection · '+ (online?'Online':'Offline') +'</small></span><span class="online-dot'+(online?' online-dot--active':'')+'" aria-label="'+(online?'Online':'Offline')+'"></span><span class="connected-student__action">Open</span></button>';}).join('')||'<p class="empty-state">Accept a request to start a student conversation.</p>';
    connectedBox.querySelectorAll('[data-connected-student]').forEach(function(button){button.addEventListener('click',function(){openStudentChat(button.dataset.connectedStudent);});});
  }
  if(activeChatPeer){
    select.value=String(activeChatPeer);
  }
  if(select.value){activeChatPeer=select.value;if(socket)socket.emit('join:chat',activeChatPeer);loadDirectMessages();}

  studentBox.querySelectorAll('[data-chat-person]').forEach(function(btn){
    btn.addEventListener('click',async function(){
      var personId=btn.dataset.chatPerson;var action=btn.dataset.chatAction;
      if(action==='pending'){return;}
      if(action==='open'){openStudentChat(personId); return;}
      var r=await api.post('/api/chat/request',{receiverId:personId,note:'Hi! Can we chat?'});
      if(r.ok&&r.data&&r.data.success){await loadChatDirectory();}
    });
  });
  reqBox.querySelectorAll('[data-request-action]').forEach(function(btn){
    btn.addEventListener('click',async function(){
      var id=btn.dataset.requestId;
      var status=btn.dataset.requestAction==='accept'?'accepted':'declined';
      var r=await api.patch('/api/chat/request/'+id,{status:status});
      if(r.ok&&r.data&&r.data.success){await loadChatDirectory();}
      else if(r.status===401){window.alert('Please sign in again to manage chat requests.');}
      else if(r.status===403){window.alert('Only the recipient can manage this request.');}
      else if(r.status===400){window.alert((r.data&&r.data.error)||'This request is no longer available.');}
    });
  });
}
async function loadDirectMessages(){
  var box=el('dmChatBox');var select=el('dmStudentSelect');
  if(!box||!select||!select.value){box.innerHTML='<p class="text-muted text-sm">Select a student to open a conversation.</p>';return;}
  var r=await api.get('/api/chat/messages/'+select.value);
  if(!r.ok||!r.data||!r.data.success){box.innerHTML='<p class="text-muted text-sm">Unable to load messages.</p>';return;}
  var messages=r.data.messages||[];
  if(!messages.length){box.innerHTML='<p class="text-muted text-sm">No messages yet.</p>';return;}
  box.innerHTML=messages.map(function(m){
    var isMine = String(m.fromId) === String((auth.currentStudent&&auth.currentStudent._id) || '');
    return '<div class="chat-msg '+(isMine?'is-mine':'is-other')+'"><span class="who">'+utils.escapeHtml(isMine?'You':(m.fromName||'Student'))+'</span><span class="text">'+utils.escapeHtml(m.message||'')+'</span>'+(m.createdAt?'<time>'+utils.escapeHtml(new Date(m.createdAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}))+'</time>':'')+'</div>';
  }).join('');
  box.scrollTop=box.scrollHeight;
}
async function loadTrainerMessages(){
  var box=el('chatBox');
  if(!box)return;
  var r=await api.get('/api/chat/trainer/messages');
  if(!r.ok||!r.data||!r.data.success){box.innerHTML='<p class="text-muted text-sm">Trainer chat is unavailable right now.</p>';return;}
  var messages=r.data.messages||[];
  if(!messages.length){box.innerHTML='<p class="text-muted text-sm">No trainer messages yet.</p>';return;}
  box.innerHTML=messages.map(function(m){var isMine=String(m.fromId)===String((auth.currentStudent&&auth.currentStudent._id)||'');return '<div class="chat-msg '+(isMine?'is-mine':'is-other')+'"><span class="who">'+utils.escapeHtml(isMine?'You':(m.fromName||'Trainer'))+'</span><span class="text">'+utils.escapeHtml(m.message||'')+'</span>'+(m.createdAt?'<time>'+utils.escapeHtml(new Date(m.createdAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}))+'</time>':'')+'</div>';}).join('');
  box.scrollTop=box.scrollHeight;
}
async function sendDirectMessage(){
  var input=el('dmChatInput');var select=el('dmStudentSelect');
  if(!input||!select||!select.value){return;}
  var text=input.value.trim();
  if(!text||!socket||!socket.connected){return;}
  socket.emit('chat:message',{toId:select.value,text:text});
  input.value='';
  setTimeout(function(){loadDirectMessages();},200);
}
function connectChat(){
  if(typeof io==='undefined'){el('chatStatus').textContent='socket.io not loaded';return;}
  if(socket)return;
  var s=auth.currentStudent||{};
  socket=io(window.location.origin,{withCredentials:true,transports:['websocket','polling']});
  socket.on('connect',function(){el('chatStatus').textContent='connected';socket.emit('join','general');});
  socket.on('disconnect',function(){el('chatStatus').textContent='disconnected';});
  socket.on('presence:snapshot',function(state){var status=el('trainerPresence');if(status)status.textContent=state.trainerOnline?'online':'offline';});
  socket.on('presence:update',function(state){if(state.role==='teacher'){var status=el('trainerPresence');if(status)status.textContent=state.online?'online':'offline';}else if(state.role==='student'){onlineStudentIds[String(state.userId)]=!!state.online;loadChatDirectory();}});
  socket.on('chat:message',function(m){
    if(m.room==='trainer:general'){var box=el('chatBox');if(box){var isMine=String(m.fromId)===String((auth.currentStudent&&auth.currentStudent._id)||'');var d=document.createElement('div');d.className='chat-msg '+(isMine?'is-mine':'is-other');d.innerHTML='<span class="who">'+utils.escapeHtml(isMine?'You':(m.from||'Trainer'))+'</span><span class="text">'+utils.escapeHtml(m.text||'')+'</span>';box.appendChild(d);box.scrollTop=box.scrollHeight;}}
    if(activeChatPeer && (String(m.fromId)===String(activeChatPeer) || String(m.toId)===String(activeChatPeer))){loadDirectMessages();}
  });
  socket.on('chat:error',function(m){var msg = m && m.message ? m.message : 'Chat failed'; if(el('dmChatInput')){el('dmChatInput').setAttribute('placeholder', msg);}}
  );
}
function disconnectChat(){
  if(!socket)return;
  socket.removeAllListeners();
  socket.disconnect();
  socket=null;
}
function sendChat(){
  var input=el('chatInput');var text=input.value.trim();if(!text||!socket)return;
  socket.emit('chat:message',{text:text,toId:activeChatPeer||'general'});input.value='';
}
window.openStudentPortal=openPortal;
})();
