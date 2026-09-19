(function(){
'use strict';
var api=window.SkillForgeAPI;
var utils=window.SkillForgeUtils;
function loadAnnouncements(){
  var box=document.getElementById('homeAnnouncements');
  if(!box)return;
  api.get('/api/announcements').then(function(result){
    if(!result.ok||!result.data||!result.data.success){
      box.innerHTML='<p class="text-muted text-center">Announcements are unavailable right now.</p>';
      return;
    }
    var items=result.data.announcements||[];
    if(!items.length){
      box.innerHTML='<p class="text-muted text-center">No announcements yet. Check back for trainer updates.</p>';
      return;
    }
    box.innerHTML=items.slice(0,6).map(function(item){
      return '<article class="announcement-card"><div class="announcement-card__meta"><span class="announcement-badge">Trainer update</span><time datetime="'+utils.escapeHtml(item.createdAt||'')+'">'+(item.createdAt?new Date(item.createdAt).toLocaleDateString():'')+'</time></div><h3>'+utils.escapeHtml(item.title||'Announcement')+'</h3><p>'+utils.escapeHtml(item.body||'')+'</p></article>';
    }).join('');
  });
}
window.loadHomeAnnouncements=loadAnnouncements;
document.addEventListener('DOMContentLoaded',loadAnnouncements);
})();
