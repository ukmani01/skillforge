(function(){
'use strict';
var api=window.SkillForgeAPI;
var utils=window.SkillForgeUtils;
function animateStat(node,target,suffix){
  if(!node||node.dataset.animated==='true')return;
  node.dataset.animated='true';
  var start=0;var duration=900;var started=performance.now();
  function tick(now){
    var progress=Math.min((now-started)/duration,1);
    var eased=1-Math.pow(1-progress,3);
    node.textContent=Math.round(target*eased)+(suffix||'');
    if(progress<1)window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
}
function setupHeroStats(){
  var stats=document.querySelectorAll('.hero-stat .value[data-stat-value]:not(#heroTotalStudents):not(#heroAvgScore)');
  if(!stats.length)return;
  var run=function(){stats.forEach(function(node){var value=Number(node.dataset.statValue)||0;var suffix=node.id==='heroAvgScore'?'%':'';animateStat(node,value,suffix);});};
  if(!('IntersectionObserver' in window)){run();return;}
  var observer=new IntersectionObserver(function(entries){if(entries.some(function(entry){return entry.isIntersecting;})){run();observer.disconnect();}},{threshold:.35});
  var section=document.querySelector('.hero-stats');if(section)observer.observe(section);
}
function setupHeroStory(){
  var stories=document.querySelectorAll('.hero-story');var dots=document.querySelectorAll('.hero-story__dots i');
  if(stories.length<2)return;
  var current=0;
  var rotate=function(){current=(current+1)%stories.length;stories.forEach(function(story,index){story.classList.toggle('is-active',index===current);});dots.forEach(function(dot,index){dot.classList.toggle('is-active',index===current);});};
  window.setInterval(function(){if(!document.hidden)rotate();},4600);
}
window.animateHeroStat=animateStat;
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
document.addEventListener('DOMContentLoaded',function(){loadAnnouncements();setupHeroStats();setupHeroStory();});
})();
