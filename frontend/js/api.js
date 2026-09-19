(function(){
'use strict';
var API_BASE_URL='';
var pendingGets={};
var REQUEST_TIMEOUT_MS=15000;

async function apiFetch(path,options){
  options=options||{};
  var method=String(options.method||'GET').toUpperCase();
  var requestKey=method+':'+path;
  if(method==='GET'&&pendingGets[requestKey])return pendingGets[requestKey];
  options.credentials='include';
  options.headers=Object.assign({'Content-Type':'application/json'},options.headers||{});

  var requestPromise=(async function(){
    var lastError=null;
    for (var i=0;i<1;i++){
      var base=API_BASE_URL;
      var controller=typeof AbortController!=='undefined'?new AbortController():null;
      var timer=controller?window.setTimeout(function(){controller.abort();},REQUEST_TIMEOUT_MS):null;
      var requestOptions=Object.assign({},options);
      if(controller)requestOptions.signal=controller.signal;
      try{
        var res=await fetch(base+path,requestOptions);
        var data=null;
        try{data=await res.json();}catch(e){data=null;}
        API_BASE_URL=base;
        window.SkillForgeAPI && (window.SkillForgeAPI.baseUrl=base);
        return {ok:res.ok,status:res.status,data:data};
      }catch(e){
        lastError=e;
      }finally{
        if(timer)window.clearTimeout(timer);
      }
    }

    return {ok:false,status:0,data:null,error:lastError&&lastError.name==='AbortError'?'Request timed out.':(lastError?lastError.message:'Request failed')};
  })();

  if(method==='GET'){
    pendingGets[requestKey]=requestPromise;
    requestPromise.then(function(){delete pendingGets[requestKey];},function(){delete pendingGets[requestKey];});
  }
  return requestPromise;
}

window.SkillForgeAPI={
  baseUrl:API_BASE_URL,
  fetch:apiFetch,
  get:function(p){return apiFetch(p,{method:'GET'});},
  post:function(p,b){return apiFetch(p,{method:'POST',body:JSON.stringify(b||{})});},
  patch:function(p,b){return apiFetch(p,{method:'PATCH',body:JSON.stringify(b||{})});},
  del:function(p){return apiFetch(p,{method:'DELETE'});}
};
console.log('API base:',API_BASE_URL);
})();
