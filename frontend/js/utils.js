(function(){
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
