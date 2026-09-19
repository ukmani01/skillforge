(function(){
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
