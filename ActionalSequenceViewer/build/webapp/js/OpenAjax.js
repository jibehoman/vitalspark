

















if(!window["OpenAjax"]){
OpenAjax=new function(){
this.hub={};
var h=this.hub;
h.implementer="http://openajax.org";
h.implVersion="2.0";
h.specVersion="2.0";
h.implExtraData={};
var _1={};
h.libraries=_1;
var _2="org.openajax.hub.";
h.registerLibrary=function(_3,_4,_5,_6){
_1[_3]={prefix:_3,namespaceURI:_4,version:_5,extraData:_6};
this.publish(_2+"registerLibrary",_1[_3]);
};
h.unregisterLibrary=function(_7){
this.publish(_2+"unregisterLibrary",_1[_7]);
delete _1[_7];
};
};
OpenAjax.hub.Error={BadParameters:"OpenAjax.hub.Error.BadParameters",Disconnected:"OpenAjax.hub.Error.Disconnected",Duplicate:"OpenAjax.hub.Error.Duplicate",NoContainer:"OpenAjax.hub.Error.NoContainer",NoSubscription:"OpenAjax.hub.Error.NoSubscription",NotAllowed:"OpenAjax.hub.Error.NotAllowed",WrongProtocol:"OpenAjax.hub.Error.WrongProtocol"};
OpenAjax.hub.SecurityAlert={LoadTimeout:"OpenAjax.hub.SecurityAlert.LoadTimeout",FramePhish:"OpenAjax.hub.SecurityAlert.FramePhish",ForgedMsg:"OpenAjax.hub.SecurityAlert.ForgedMsg"};
OpenAjax.hub._debugger=function(){
};
OpenAjax.hub.ManagedHub=function(_8){
if(!_8||!_8.onPublish||!_8.onSubscribe){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._p=_8;
this._onUnsubscribe=_8.onUnsubscribe?_8.onUnsubscribe:null;
this._scope=_8.scope||window;
if(_8.log){
var _9=this;
this._log=function(_a){
try{
_8.log.call(_9._scope,"ManagedHub: "+_a);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
this._log=function(){
};
}
this._subscriptions={c:{},s:null};
this._containers={};
this._seq=0;
this._active=true;
this._isPublishing=false;
this._pubQ=[];
};
OpenAjax.hub.ManagedHub.prototype.subscribeForClient=function(_b,_c,_d){
this._assertConn();
if(this._invokeOnSubscribe(_c,_b)){
return this._subscribe(_c,this._sendToClient,this,{c:_b,sid:_d});
}
throw new Error(OpenAjax.hub.Error.NotAllowed);
};
OpenAjax.hub.ManagedHub.prototype.unsubscribeForClient=function(_e,_f){
this._unsubscribe(_f);
this._invokeOnUnsubscribe(_e,_f);
};
OpenAjax.hub.ManagedHub.prototype.publishForClient=function(_10,_11,_12){
this._assertConn();
this._publish(_11,_12,_10);
};
OpenAjax.hub.ManagedHub.prototype.disconnect=function(){
this._active=false;
for(var c in this._containers){
this.removeContainer(this._containers[c]);
}
};
OpenAjax.hub.ManagedHub.prototype.getContainer=function(_13){
var _14=this._containers[_13];
return _14?_14:null;
};
OpenAjax.hub.ManagedHub.prototype.listContainers=function(){
var res=[];
for(var c in this._containers){
res.push(this._containers[c]);
}
return res;
};
OpenAjax.hub.ManagedHub.prototype.addContainer=function(_15){
this._assertConn();
var _16=_15.getClientID();
if(this._containers[_16]){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
this._containers[_16]=_15;
};
OpenAjax.hub.ManagedHub.prototype.removeContainer=function(_17){
var _18=_17.getClientID();
if(!this._containers[_18]){
throw new Error(OpenAjax.hub.Error.NoContainer);
}
_17.remove();
delete this._containers[_18];
};
OpenAjax.hub.ManagedHub.prototype.subscribe=function(_19,_1a,_1b,_1c,_1d){
this._assertConn();
this._assertSubTopic(_19);
if(!_1a){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if(!this._invokeOnSubscribe(_19,null)){
this._invokeOnComplete(_1c,_1b,null,false,OpenAjax.hub.Error.NotAllowed);
return;
}
_1b=_1b||window;
var _1e=this;
function _1f(_20,_21,sd,_22){
if(_1e._invokeOnPublish(_20,_21,_22,null)){
try{
_1a.call(_1b,_20,_21,_1d);
}
catch(e){
OpenAjax.hub._debugger();
_1e._log("caught error from onData callback to Hub.subscribe(): "+e.message);
}
}
};
var _23=this._subscribe(_19,_1f,_1b,_1d);
this._invokeOnComplete(_1c,_1b,_23,true);
return _23;
};
OpenAjax.hub.ManagedHub.prototype.publish=function(_24,_25){
this._assertConn();
this._assertPubTopic(_24);
this._publish(_24,_25,null);
};
OpenAjax.hub.ManagedHub.prototype.unsubscribe=function(_26,_27,_28){
this._assertConn();
if(!_26){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._unsubscribe(_26);
this._invokeOnUnsubscribe(null,_26);
this._invokeOnComplete(_27,_28,_26,true);
};
OpenAjax.hub.ManagedHub.prototype.isConnected=function(){
return this._active;
};
OpenAjax.hub.ManagedHub.prototype.getScope=function(){
return this._scope;
};
OpenAjax.hub.ManagedHub.prototype.getSubscriberData=function(_29){
this._assertConn();
var _2a=_29.split(".");
var sid=_2a.pop();
var sub=this._getSubscriptionObject(this._subscriptions,_2a,0,sid);
if(sub){
return sub.data;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.ManagedHub.prototype.getSubscriberScope=function(_2b){
this._assertConn();
var _2c=_2b.split(".");
var sid=_2c.pop();
var sub=this._getSubscriptionObject(this._subscriptions,_2c,0,sid);
if(sub){
return sub.scope;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.ManagedHub.prototype.getParameters=function(){
return this._p;
};
OpenAjax.hub.ManagedHub.prototype._sendToClient=function(_2d,_2e,sd,_2f){
if(!this.isConnected()){
return;
}
if(this._invokeOnPublish(_2d,_2e,_2f,sd.c)){
sd.c.sendToClient(_2d,_2e,sd.sid);
}
};
OpenAjax.hub.ManagedHub.prototype._assertConn=function(){
if(!this.isConnected()){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
OpenAjax.hub.ManagedHub.prototype._assertPubTopic=function(_30){
if(!_30||_30===""||(_30.indexOf("*")!=-1)||(_30.indexOf("..")!=-1)||(_30.charAt(0)==".")||(_30.charAt(_30.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
OpenAjax.hub.ManagedHub.prototype._assertSubTopic=function(_31){
if(!_31){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _32=_31.split(".");
var len=_32.length;
for(var i=0;i<len;i++){
var p=_32[i];
if((p==="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
OpenAjax.hub.ManagedHub.prototype._invokeOnComplete=function(_33,_34,_35,_36,_37){
if(_33){
try{
_34=_34||window;
_33.call(_34,_35,_36,_37);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onComplete callback: "+e.message);
}
}
};
OpenAjax.hub.ManagedHub.prototype._invokeOnPublish=function(_38,_39,_3a,_3b){
try{
return this._p.onPublish.call(this._scope,_38,_39,_3a,_3b);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onPublish callback to constructor: "+e.message);
}
return false;
};
OpenAjax.hub.ManagedHub.prototype._invokeOnSubscribe=function(_3c,_3d){
try{
return this._p.onSubscribe.call(this._scope,_3c,_3d);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onSubscribe callback to constructor: "+e.message);
}
return false;
};
OpenAjax.hub.ManagedHub.prototype._invokeOnUnsubscribe=function(_3e,_3f){
if(this._onUnsubscribe){
var _40=_3f.slice(0,_3f.lastIndexOf("."));
try{
this._onUnsubscribe.call(this._scope,_40,_3e);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onUnsubscribe callback to constructor: "+e.message);
}
}
};
OpenAjax.hub.ManagedHub.prototype._subscribe=function(_41,_42,_43,_44){
var _45=_41+"."+this._seq;
var sub={scope:_43,cb:_42,data:_44,sid:this._seq++};
var _46=_41.split(".");
this._recursiveSubscribe(this._subscriptions,_46,0,sub);
return _45;
};
OpenAjax.hub.ManagedHub.prototype._recursiveSubscribe=function(_47,_48,_49,sub){
var _4a=_48[_49];
if(_49==_48.length){
sub.next=_47.s;
_47.s=sub;
}else{
if(typeof _47.c=="undefined"){
_47.c={};
}
if(typeof _47.c[_4a]=="undefined"){
_47.c[_4a]={c:{},s:null};
this._recursiveSubscribe(_47.c[_4a],_48,_49+1,sub);
}else{
this._recursiveSubscribe(_47.c[_4a],_48,_49+1,sub);
}
}
};
OpenAjax.hub.ManagedHub.prototype._publish=function(_4b,_4c,_4d){
if(this._isPublishing){
this._pubQ.push({t:_4b,d:_4c,p:_4d});
return;
}
this._safePublish(_4b,_4c,_4d);
while(this._pubQ.length>0){
var pub=this._pubQ.shift();
this._safePublish(pub.t,pub.d,pub.p);
}
};
OpenAjax.hub.ManagedHub.prototype._safePublish=function(_4e,_4f,_50){
this._isPublishing=true;
var _51=_4e.split(".");
this._recursivePublish(this._subscriptions,_51,0,_4e,_4f,_50);
this._isPublishing=false;
};
OpenAjax.hub.ManagedHub.prototype._recursivePublish=function(_52,_53,_54,_55,msg,_56){
if(typeof _52!="undefined"){
var _57;
if(_54==_53.length){
_57=_52;
}else{
this._recursivePublish(_52.c[_53[_54]],_53,_54+1,_55,msg,_56);
this._recursivePublish(_52.c["*"],_53,_54+1,_55,msg,_56);
_57=_52.c["**"];
}
if(typeof _57!="undefined"){
var sub=_57.s;
while(sub){
var sc=sub.scope;
var cb=sub.cb;
var d=sub.data;
var sid=sub.sid;
if(typeof cb=="string"){
cb=sc[cb];
}
cb.call(sc,_55,msg,d,_56);
sub=sub.next;
}
}
}
};
OpenAjax.hub.ManagedHub.prototype._unsubscribe=function(_58){
var _59=_58.split(".");
var sid=_59.pop();
if(!this._recursiveUnsubscribe(this._subscriptions,_59,0,sid)){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
};
OpenAjax.hub.ManagedHub.prototype._recursiveUnsubscribe=function(_5a,_5b,_5c,sid){
if(typeof _5a=="undefined"){
return false;
}
if(_5c<_5b.length){
var _5d=_5a.c[_5b[_5c]];
if(!_5d){
return false;
}
this._recursiveUnsubscribe(_5d,_5b,_5c+1,sid);
if(!_5d.s){
for(var x in _5d.c){
return true;
}
delete _5a.c[_5b[_5c]];
}
}else{
var sub=_5a.s;
var _5e=null;
var _5f=false;
while(sub){
if(sid==sub.sid){
_5f=true;
if(sub==_5a.s){
_5a.s=sub.next;
}else{
_5e.next=sub.next;
}
break;
}
_5e=sub;
sub=sub.next;
}
if(!_5f){
return false;
}
}
return true;
};
OpenAjax.hub.ManagedHub.prototype._getSubscriptionObject=function(_60,_61,_62,sid){
if(typeof _60!="undefined"){
if(_62<_61.length){
var _63=_60.c[_61[_62]];
return this._getSubscriptionObject(_63,_61,_62+1,sid);
}
var sub=_60.s;
while(sub){
if(sid==sub.sid){
return sub;
}
sub=sub.next;
}
}
return null;
};
OpenAjax.hub._hub=new OpenAjax.hub.ManagedHub({onSubscribe:function(_64,_65){
return true;
},onPublish:function(_66,_67,_68,_69){
return true;
}});
OpenAjax.hub.subscribe=function(_6a,_6b,_6c,_6d){
if(typeof _6b==="string"){
_6c=_6c||window;
_6b=_6c[_6b]||null;
}
return OpenAjax.hub._hub.subscribe(_6a,_6b,_6c,null,_6d);
};
OpenAjax.hub.unsubscribe=function(_6e){
return OpenAjax.hub._hub.unsubscribe(_6e);
};
OpenAjax.hub.publish=function(_6f,_70){
OpenAjax.hub._hub.publish(_6f,_70);
};
OpenAjax.hub.registerLibrary("OpenAjax","http://openajax.org/hub","2.0",{});
}
if(typeof OpenAjax==="undefined"){
window.OpenAjax={};
}
if(typeof OpenAjax.hub==="undefined"){
window.OpenAjax.hub={};
}
(function(){
OpenAjax.hub.IframeContainer=function(hub,_71,_72){
if(!hub||!_71||!_72||!_72.Container||!_72.Container.onSecurityAlert||!_72.IframeContainer||!_72.IframeContainer.parent||!_72.IframeContainer.uri||!_72.IframeContainer.tunnelURI){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _73=this;
var _74=_72.Container.scope||window;
var _75=false,_76=false,_77=false;
var _78={};
var _79;
var _7a;
var _7b;
var _7c,_7d;
var _7e=_72.IframeContainer.timeout||15000;
var _7f;
if(_72.Container.log){
var log=function(msg){
try{
_72.Container.log.call(_74,"IframeContainer::"+_71+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
log=function(){
};
}
this._init=function(){
hub.addContainer(this);
_7c=_cd();
_7b=_80(_71,this);
_7a=_ce(_72,_74,log,_7c.type==="FIM"?6:null);
_7c.addReceiver({receiver:this,receiverId:_7b,securityToken:_7a,uri:_72.IframeContainer.uri,tunnelURI:_72.IframeContainer.tunnelURI,log:log});
_81(_72.IframeContainer.parent,_7c.getURI(),_72.IframeContainer.iframeAttrs);
_7c.postAdd(_7b,_7d);
_82();
};
this.sendToClient=function(_83,_84,_85){
_86("pub",{t:_83,d:_84,s:_85});
};
this.remove=function(){
_87();
_7c.removeReceiver(_7b);
clearTimeout(_7f);
_7d.parentNode.removeChild(_7d);
_7d=null;
};
this.isConnected=function(){
return _75;
};
this.getClientID=function(){
return _71;
};
this.getPartnerOrigin=function(){
if(_75){
return _79;
}
return null;
};
this.getParameters=function(){
return _72;
};
this.getHub=function(){
return hub;
};
this.getIframe=function(){
return _7d;
};
this.transportReady=function(_88,_89,_8a){
if(!_89){
if(_8a.securityAlert){
_8b(_8a.securityAlert);
}
return;
}
_79=_8a.partnerOrigin;
};
this.receiveMsg=function(msg){
switch(msg.m){
case "pub":
hub.publishForClient(this,msg.p.t,msg.p.d);
break;
case "sub":
var _8c="";
try{
_78[msg.p.s]=hub.subscribeForClient(this,msg.p.t,msg.p.s);
}
catch(e){
_8c=e.message;
}
_86("sub_ack",{s:msg.p.s,e:_8c});
break;
case "uns":
var _8d=_78[msg.p.s];
hub.unsubscribeForClient(this,_8d);
delete _78[msg.p.s];
_86("uns_ack",{s:msg.p.s});
break;
case "con":
_76=true;
_8e();
break;
case "dis":
_82();
_87();
_86("dis_ack",null);
if(_72.Container.onDisconnect){
try{
_72.Container.onDisconnect.call(_74,this);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onDisconnect callback to constructor: "+e.message);
}
}
break;
}
};
this.securityAlert=function(_8f){
_8b(_8f);
};
function _81(_90,src,_91){
_7d=document.createElement("iframe");
if(_91){
for(var _92 in _91){
if(_92=="style"){
for(var _93 in _91.style){
_7d.style[_93]=_91.style[_93];
}
}else{
_7d[_92]=_91[_92];
}
}
}
_7d.style.visibility="hidden";
_7d.src="javascript:\"<html></html>\"";
_90.appendChild(_7d);
_7d.src=src;
};
function _86(_94,_95){
var _96={m:_94,i:_7b,r:"..",t:_7a,p:_95};
_7c.sendMsg(_7b,_96);
};
function _8e(){
if(!_77||!_76){
return;
}
_75=true;
clearTimeout(_7f);
_7d.style.visibility="visible";
_86("con_ack",null);
if(_72.Container.onConnect){
try{
_72.Container.onConnect.call(_74,_73);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onConnect callback to constructor: "+e.message);
}
}
};
function _87(){
if(_75){
_75=false;
_7d.style.visibility="hidden";
for(var s in _78){
hub.unsubscribeForClient(_73,_78[s]);
}
_78={};
}
};
function _80(id,_97){
if(!OpenAjax.hub.IframeContainer._containers){
OpenAjax.hub.IframeContainer._containers={};
}
do{
newID=((32767*Math.random())|0).toString(16)+"_"+id;
}while(OpenAjax.hub.IframeContainer._containers[newID]);
OpenAjax.hub.IframeContainer._containers[newID]=_97;
return newID;
};
this._tunnelLoaded=function(_98){
_98.onunload=function(){
if(_75){
setTimeout(function(){
_8b(OpenAjax.hub.SecurityAlert.FramePhish);
},1);
}
};
_77=true;
_8e();
};
function _8b(_99){
try{
_72.Container.onSecurityAlert.call(_74,_73,_99);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onSecurityAlert callback to constructor: "+e.message);
}
};
function _82(){
_7f=setTimeout(function(){
_8b(OpenAjax.hub.SecurityAlert.LoadTimeout);
_73.receiveMsg=function(){
};
},_7e);
};
this._init();
};
OpenAjax.hub.IframeHubClient=function(_9a){
if(!_9a||!_9a.HubClient||!_9a.HubClient.onSecurityAlert){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _9b=this;
var _9c=_9a.HubClient.scope||window;
var _9d=false;
var _9e=false;
var _9f={};
var _a0=0;
var _a1,_a2,_a3;
var _a4;
if(_9a.HubClient.log){
var log=function(msg){
try{
_9a.HubClient.log.call(_9c,"IframeHubClient::"+_a1+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
log=function(){
};
}
var _a5;
this._init=function(){
_a5=_cd();
_a3=_ce(_9a,_9c,log,_a5.type==="FIM"?6:null);
_a2=_a5.addReceiver({receiver:this,receiverId:"..",securityToken:_a3,log:log});
if(!_a2){
throw new Error(OpenAjax.hub.Error.WrongProtocol);
}
_a1=_a2.substr(_a2.indexOf("_")+1);
};
this.connect=function(_a6,_a7){
_a7=_a7||window;
if(_9e){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
if(_a6){
this._connectCallback={func:_a6,scope:_a7};
}
if(_9d){
_a8("con",null);
}else{
this._connectPending=true;
}
};
this.disconnect=function(_a9,_aa){
_aa=_aa||window;
if(!_9e){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
_9e=false;
if(_a9){
this._disconnectCallback={func:_a9,scope:_aa};
}
_a8("dis",null);
};
this.getPartnerOrigin=function(){
if(_9e){
return _a4;
}
return null;
};
this.getClientID=function(){
return _a1;
};
this.subscribe=function(_ab,_ac,_ad,_ae,_af){
_b0();
_b1(_ab);
if(!_ac){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
_ad=_ad||window;
var _b2=""+_a0++;
_9f[_b2]={cb:_ac,sc:_ad,d:_af,oc:_ae};
_a8("sub",{t:_ab,s:_b2});
return _b2;
};
this.publish=function(_b3,_b4){
_b0();
_b5(_b3);
_a8("pub",{t:_b3,d:_b4});
};
this.unsubscribe=function(_b6,_b7,_b8){
_b0();
if(!_b6){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if(!_9f[_b6]||_9f[_b6].uns){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
_b8=_b8||window;
_9f[_b6].uns={cb:_b7,sc:_b8};
_a8("uns",{s:_b6});
};
this.isConnected=function(){
return _9e;
};
this.getScope=function(){
return _9c;
};
this.getSubscriberData=function(_b9){
_b0();
if(_9f[_b9]){
return _9f[_b9].d;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
this.getSubscriberScope=function(_ba){
_b0();
if(_9f[_ba]){
return _9f[_ba].sc;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
this.getParameters=function(){
return _9a;
};
this.transportReady=function(_bb,_bc,_bd){
if(!_bc){
if(_bd.securityAlert){
_be(_bd.securityAlert);
}
return;
}
_a4=_bd.partnerOrigin;
_9d=true;
if(this._connectPending){
delete this._connectPending;
_a8("con",null);
}
};
this.receiveMsg=function(msg){
var _bf,_c0;
switch(msg.m){
case "pub":
_bf=msg.p.s;
if(_9f[_bf]&&!_9f[_bf].uns){
try{
_9f[_bf].cb.call(_9f[_bf].sc,msg.p.t,msg.p.d,_9f[_bf].d);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onData callback to subscribe(): "+e.message);
}
}
break;
case "sub_ack":
_bf=msg.p.s;
_c0=_9f[_bf].oc;
if(_c0){
try{
delete _9f[_bf].oc;
_c0.call(_9f[_bf].sc,_bf,msg.p.e==="",msg.p.e);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to subscribe(): "+e.message);
}
}
break;
case "uns_ack":
_bf=msg.p.s;
if(_9f[_bf]){
_c0=_9f[_bf].uns.cb;
if(_c0){
try{
_c0.call(_9f[_bf].uns.sc,_bf,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to unsubscribe(): "+e.message);
}
}
delete _9f[_bf];
}
break;
case "con_ack":
_9e=true;
if(this._connectCallback){
try{
this._connectCallback.func.call(this._connectCallback.scope,this,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to connect(): "+e.message);
}
delete this._connectCallback;
}
break;
case "dis_ack":
if(this._disconnectCallback){
try{
this._disconnectCallback.func.call(this._disconnectCallback.scope,this,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to disconnect(): "+e.message);
}
delete this._disconnectCallback;
}
break;
}
};
function _b0(){
if(!_9e){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
function _b1(_c1){
if(!_c1){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _c2=_c1.split(".");
var len=_c2.length;
for(var i=0;i<len;i++){
var p=_c2[i];
if((p==="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
function _b5(_c3){
if(!_c3||_c3===""||(_c3.indexOf("*")!=-1)||(_c3.indexOf("..")!=-1)||(_c3.charAt(0)==".")||(_c3.charAt(_c3.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
function _a8(_c4,_c5){
var _c6={m:_c4,i:_a2,t:_a3,p:_c5};
_a5.sendMsg("..",_c6);
};
function _be(_c7){
try{
_9a.HubClient.onSecurityAlert.call(_9c,_9b,_c7);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onSecurityAlert callback to constructor: "+e.message);
}
};
this._init();
};
OpenAjax.hub.IframeContainer._tunnelLoaded=function(){
var _c8=OpenAjax.hub.IframeContainer._getTransportLayer();
var id=_c8.tunnelLoaded();
window.parent.parent.OpenAjax.hub.IframeContainer._containers[id]._tunnelLoaded(window);
};
OpenAjax.hub.IframeContainer._queryURLParam=function(_c9){
var _ca=new RegExp("[\\?&]"+_c9+"=([^&#]*)").exec(window.location.search);
if(_ca){
return decodeURIComponent(_ca[1].replace(/\+/g,"%20"));
}
return null;
};
OpenAjax.hub.IframeContainer._createTunnelIframe=function(uri){
var _cb=document.createElement("iframe");
_cb.src=uri;
document.body.appendChild(_cb);
_cb.style.position="absolute";
_cb.style.left=_cb.style.top="-10px";
_cb.style.height=_cb.style.width="1px";
_cb.style.visibility="hidden";
return _cb;
};
var _cc;
function _cd(){
if(!_cc){
var t=window.postMessage?"PM":window.ActiveXObject?"NIX":"FIM";
_cc=new OpenAjax.hub.IframeContainer["_"+t]();
_cc.type=t;
}
return _cc;
};
OpenAjax.hub.IframeContainer._getTransportLayer=_cd;
function _ce(_cf,_d0,log,_d1){
if(!OpenAjax.hub.IframeContainer._prng){
var _d2=new Date().getTime()+Math.random()+document.cookie;
OpenAjax.hub.IframeContainer._prng=OpenAjax._smash.crypto.newPRNG(_d2);
}
var p=_cf.IframeContainer||_cf.IframeHubClient;
if(p&&p.seed){
try{
var _d3=p.seed.call(_d0);
OpenAjax.hub.IframeContainer._prng.addSeed(_d3);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from 'seed' callback: "+e.message);
}
}
var _d4=_d1||(p&&p.tokenLength)||6;
return OpenAjax.hub.IframeContainer._prng.nextRandomB64Str(_d4);
};
OpenAjax.hub.IframeContainer._PM=function(){
var _d5="openajax-2.0";
var _d6={};
var _d7,_d8;
var uri;
if(window.addEventListener){
window.addEventListener("message",_d9,false);
}else{
if(window.attachEvent){
window.attachEvent("onmessage",_d9);
}
}
this.addReceiver=function(_da){
var _db;
_d6[_da.receiverId]={r:_da.receiver};
if(_da.receiverId===".."){
var pv=OpenAjax.hub.IframeContainer._queryURLParam("oahpv");
if(!pv||pv!==_d5){
return null;
}
var _dc=OpenAjax.hub.IframeContainer._queryURLParam("oahu");
var _dd=OpenAjax.hub.IframeContainer._queryURLParam("oahi");
var _de=OpenAjax.hub.IframeContainer._queryURLParam("oaht");
if(!_dd||!_de||!_dc){
return null;
}
_d7=OpenAjax.hub.IframeContainer._queryURLParam("oahpm");
_df();
var _e0=/^([a-zA-Z]+:\/\/[^\/?#]+).*/.exec(_dc)[1];
_d6[".."].w=window.parent;
_d6[".."].o=_e0;
_d6[".."].m=_e1(_e0);
var _e2="oahi="+encodeURIComponent(_dd)+"&oaht="+_de;
var _e3=_dc.split("#");
_e3[0]=_e3[0]+((_e3[0].indexOf("?")!=-1)?"&":"?")+_e2;
_dc=_e3.length===1?_e3[0]:_e3[0]+"#"+_e3[1];
OpenAjax.hub.IframeContainer._createTunnelIframe(_dc);
_db={partnerOrigin:/^([a-zA-Z]+:\/\/[^:]+).*/.exec(_e0)[1],securityToken:_de};
setTimeout(function(){
_da.receiver.transportReady(_dd,true,_db);
},0);
return _dd;
}
if(typeof _d7==="undefined"){
_e9();
_df();
}
_e0=/^([a-zA-Z]+:\/\/[^\/?#]+).*/.exec(_da.uri)[1];
_d6[_da.receiverId].o=_e0;
_d6[_da.receiverId].m=_e1(_e0);
_db={partnerOrigin:/^([a-zA-Z]+:\/\/[^:]+).*/.exec(_e0)[1]};
setTimeout(function(){
_da.receiver.transportReady(_da.receiverId,true,_db);
},0);
_e2="oahpv="+encodeURIComponent(_d5)+"&oahi="+encodeURIComponent(_da.receiverId)+"&oaht="+_da.securityToken+"&oahu="+encodeURIComponent(_da.tunnelURI)+"&oahpm="+_d7;
_e3=_da.uri.split("#");
_e3[0]=_e3[0]+((_e3[0].indexOf("?")!=-1)?"&":"?")+_e2;
uri=_e3.length===1?_e3[0]:_e3[0]+"#"+_e3[1];
return null;
};
this.getURI=function(){
return uri;
};
this.postAdd=function(_e4,_e5){
_d6[_e4].w=_e5.contentWindow;
};
this.sendMsg=function(_e6,_e7){
if(_d6[_e6]){
_d8(_d6[_e6].w,JSON.stringify(_e7),_d6[_e6].o);
}
return true;
};
this.tunnelLoaded=function(){
return OpenAjax.hub.IframeContainer._queryURLParam("oahi");
};
this.removeReceiver=function(_e8){
delete _d6[_e8];
};
function _e9(){
_d7="";
var hit=false;
function _d9(_ea){
if(_ea.data=="postmessage.test"){
hit=true;
if(typeof _ea.origin==="undefined"){
_d7+="d";
}
}
};
if(window.addEventListener){
window.addEventListener("message",_d9,false);
}else{
if(window.attachEvent){
window.attachEvent("onmessage",_d9);
}
}
window.postMessage("postmessage.test","*");
if(hit){
_d7+="s";
}
if(window.removeEventListener){
window.removeEventListener("message",_d9,false);
}else{
window.detachEvent("onmessage",_d9);
}
};
function _df(){
if(_d7.indexOf("s")===-1){
_d8=function(win,msg,_eb){
win.postMessage(msg,_eb);
};
}else{
_d8=function(win,msg,_ec){
setTimeout(function(){
win.postMessage(msg,_ec);
},0);
};
}
};
function _e1(_ed){
if(_d7.indexOf("d")!==-1){
return (/^.+:\/\/([^:]+).*/.exec(_ed)[1]);
}
return _ed;
};
function _d9(_ee){
try{
var _ef=JSON.parse(_ee.data);
var id=_ef.r||_ef.i;
if(!_d6[id]){
return;
}
if(_d6[id].m!==(_ee.origin||_ee.domain)){
_d6[id].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
return;
}
_d6[id].r.receiveMsg(_ef);
}
catch(e){
return;
}
};
};
})();
OpenAjax.hub.IframeContainer._FIM=function(){
var _f0={},_f1={},_f2={};
var uri;
OpenAjax.hub.IframeContainer._FIM.instances=_f1;
this.addReceiver=function(_f3){
_f0[_f3.receiverId]={r:_f3.receiver};
_f2[_f3.receiverId]={initialized:false,queueOut:[],lib:null};
if(_f3.receiverId===".."){
return _f4.call(this,_f3);
}
return _f5.call(this,_f3);
};
this.getURI=function(){
return uri;
};
this.postAdd=function(_f6,_f7){
return true;
};
this.sendMsg=function(_f8,_f9){
var msg=new _fa.SECommMessage();
switch(_f9.m){
case "con":
msg.type=_fa.SECommMessage.CONNECT;
msg.payload=window.location.href.split("#")[0];
break;
case "con_ack":
msg.type=_fa.SECommMessage.CONNECT_ACK;
break;
case "dis":
msg.type=_fa.SECommMessage.DISCONNECT;
break;
case "dis_ack":
msg.type=_fa.SECommMessage.DISCONNECT_ACK;
break;
case "pub":
if(_f9.p.s){
msg.type=_fa.SECommMessage.DISTRIBUTE;
msg.additionalHeader={s:_f9.p.s};
}else{
msg.type=_fa.SECommMessage.PUBLISH;
msg.additionalHeader={};
}
msg.topic=_f9.p.t;
if(typeof _f9.p.d==="string"){
msg.additionalHeader.f="S";
msg.payload=_f9.p.d;
}else{
msg.additionalHeader.f="J";
msg.payload=JSON.stringify(_f9.p.d);
}
break;
case "sub":
msg.type=_fa.SECommMessage.SUBSCRIBE;
msg.topic=_f9.p.t;
msg.additionalHeader={subId:_f9.p.s};
break;
case "sub_ack":
msg.type=_fa.SECommMessage.SUBSCRIBE_ACK;
msg.additionalHeader={subId:_f9.p.s,isOk:(_f9.p.e===""),err:_f9.p.e};
break;
case "uns":
msg.type=_fa.SECommMessage.UNSUBSCRIBE;
msg.additionalHeader={subId:_f9.p.s};
break;
case "uns_ack":
msg.type=_fa.SECommMessage.UNSUBSCRIBE_ACK;
msg.additionalHeader={subId:_f9.p.s};
break;
}
var c=_f2[_f8];
if(c.initialized){
c.lib.send(msg.serialize());
}else{
c.queueOut.push(msg.serialize());
}
return true;
};
this.tunnelLoaded=function(){
new _fa.CommLib(false,window.parent.parent.OpenAjax.hub.IframeContainer._FIM.instances);
var _fb=window.location.href.split("#")[1];
return decodeURIComponent(_fb.substring(_fa._securityTokenOverhead+6).split(":")[0]);
};
this.removeReceiver=function(_fc){
delete _f0[_fc];
delete _f2[_fc];
delete _f1[_fc];
};
function _f5(_fd){
_f1[_fd.receiverId]=new _fe(_fd.receiverId,_fd.log);
_f0[_fd.receiverId].tok=_fd.securityToken;
_f0[_fd.receiverId].uri=_fd.uri;
uri=_fd.uri+"#"+_fa._protocolID+":100"+_fd.securityToken+_fd.securityToken+"000"+encodeURIComponent(_fd.receiverId)+":"+encodeURIComponent(_fd.tunnelURI);
return null;
};
function _f4(_ff){
var _100=window.location.href.split("#");
if(!_100[1]){
return null;
}
var _101=_100[1].split(":",2);
var _102=_101[0];
if(_102!==_fa._protocolID){
return null;
}
var _103=_100[0]+"#"+_100[1].substring(_102.length+1);
window.location.replace(_103);
var _104=decodeURIComponent(_101[1].substring(_fa._securityTokenOverhead+6));
_fa._clientSecurityToken=_ff.securityToken;
_f1[".."]=new _fe("..",_ff.log);
_f2[".."].lib=new _fa.CommLib(true,_f1);
return _104;
};
function _fe(_105,_106){
this.messageReceived=function(_107){
var _108={i:_105};
var msg=new _fa.SECommMessage();
msg.deserialize(_107);
switch(msg.type){
case _fa.SECommMessage.PUBLISH:
case _fa.SECommMessage.DISTRIBUTE:
_108.m="pub";
if(msg.additionalHeader){
_108.p={t:msg.topic,d:msg.payload};
if(msg.additionalHeader.f==="J"){
_108.p.d=JSON.parse(msg.payload);
}
if(msg.type===_fa.SECommMessage.DISTRIBUTE){
_108.p.s=msg.additionalHeader.s;
}
}
break;
case _fa.SECommMessage.SUBSCRIBE:
_108.m="sub";
if(msg.additionalHeader){
_108.p={t:msg.topic,s:msg.additionalHeader.subId};
}
break;
case _fa.SECommMessage.SUBSCRIBE_ACK:
_108.m="sub_ack";
if(msg.additionalHeader){
_108.p={s:msg.additionalHeader.subId,e:msg.additionalHeader.isOk?"":msg.additionalHeader.err};
}
break;
case _fa.SECommMessage.UNSUBSCRIBE:
_108.m="uns";
if(msg.additionalHeader){
_108.p={s:msg.additionalHeader.subId};
}
break;
case _fa.SECommMessage.UNSUBSCRIBE_ACK:
_108.m="uns_ack";
if(msg.additionalHeader){
_108.p={s:msg.additionalHeader.subId};
}
break;
case _fa.SECommMessage.CONNECT:
_108.m="con";
break;
case _fa.SECommMessage.CONNECT_ACK:
_108.m="con_ack";
break;
case _fa.SECommMessage.DISCONNECT:
_108.m="dis";
break;
case _fa.SECommMessage.DISCONNECT_ACK:
_108.m="dis_ack";
break;
}
_f0[_105].r.receiveMsg(_108);
};
this.initializationFinished=function(_109,_10a,_10b,_10c,_10d,_10e){
var c=_f2[_105];
var rec=_f0[_105];
var args={partnerOrigin:/^([a-zA-Z]+:\/\/[^\/?#:]+).*/.exec(_10a)[1]};
if(_105===".."){
args.debug=_10e;
}else{
if(_10b!==rec.tok||_10a!==rec.uri){
this.handleSecurityError(_fa.SecurityErrors.TOKEN_VERIFICATION_FAILED);
return false;
}
_106("Tunnel commLib initialization finished. Processing outgoing queue. Security token: "+_10b);
c.lib=_10d;
}
c.initialized=true;
while(c.queueOut.length>0){
c.lib.send(c.queueOut.shift());
}
rec.r.transportReady(_109,true,args);
return true;
};
this.handleSecurityError=function(_10f){
_f0[_105].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
};
this.log=function(msg){
_106(msg);
};
};
if(typeof OpenAjax._smash=="undefined"){
OpenAjax._smash={};
}
var _fa=OpenAjax._smash;
_fa._protocolID="openajax-2.0.1";
_fa._securityTokenLength=6;
_fa._securityTokenOverhead=null;
_fa._computeOtherTokenConstants=function(){
_fa._securityTokenOverhead=2*_fa._securityTokenLength;
};
_fa._computeOtherTokenConstants();
_fa.SecurityErrors={INVALID_TOKEN:0,TOKEN_VERIFICATION_FAILED:1,TUNNEL_UNLOAD:2,COMPONENT_LOAD:3};
_fa.SECommMessage=function(){
this.type=null;
this.topic=null;
this.additionalHeader=null;
this.payload=null;
var _110="y";
var _111="t";
var _112="h";
var _113="p";
this.serialize=function(){
var _114=_110+"="+this.type;
if(this.topic!=null){
var _115=encodeURIComponent(this.topic);
var _116="&"+_111+"="+_115;
_114+=_116;
}
if(this.additionalHeader!=null){
var _117=encodeURIComponent(JSON.stringify(this.additionalHeader));
var _118="&"+_112+"="+_117;
_114+=_118;
}
if(this.payload!=null){
var _119=encodeURIComponent(this.payload);
var _11a="&"+_113+"="+_119;
_114+=_11a;
}
return _114;
};
this.deserialize=function(_11b){
var _11c=_11b.split("&");
for(var i=0;i<_11c.length;i++){
var _11d=_11c[i].split("=");
switch(_11d[0]){
case _110:
this.type=_11d[1];
break;
case _111:
this.topic=decodeURIComponent(_11d[1]);
break;
case _112:
var _11e=decodeURIComponent(_11d[1]);
this.additionalHeader=JSON.parse(_11e);
break;
case _113:
this.payload=decodeURIComponent(_11d[1]);
break;
}
}
};
};
_fa.SECommMessage.CONNECT="con";
_fa.SECommMessage.CONNECT_ACK="cac";
_fa.SECommMessage.DISCONNECT="xcon";
_fa.SECommMessage.DISCONNECT_ACK="xac";
_fa.SECommMessage.PUBLISH="pub";
_fa.SECommMessage.DISTRIBUTE="dis";
_fa.SECommMessage.SUBSCRIBE="sub";
_fa.SECommMessage.UNSUBSCRIBE="uns";
_fa.SECommMessage.SUBSCRIBE_ACK="sac";
_fa.SECommMessage.UNSUBSCRIBE_ACK="uac";
_fa.SECommMessage.ERROR="err";
_fa.CommLib=function(_11f,_120){
var INIT="1";
var ACK="2";
var PART="3";
var END="4";
var that=this;
var _121=100;
var _122=4000;
var _123=6;
var ack=0;
var _124=null;
var _125=null;
var _126=null;
var _127=null;
var _128=null;
var _129=null;
var _12a=null;
var _12b=[];
var msn=0;
var _12c="";
var _12d=null;
var _12e=null;
var _12f=null;
var _130=null;
var _131=null;
var logQ=[];
var _132=false;
this.send=function(_133){
if(_129==null){
log("Trying to send without proper initialization. Message will be discarded. "+_133);
return;
}
log("Sending: "+_133);
var _134=_133;
var _135=_122-_123-_fa._securityTokenOverhead-_129.length;
var _136=_134;
while(_136.length>0){
var part=_136.substr(0,_135);
_136=_136.substr(_135);
if(_136==0){
_12b.push({type:END,payload:part});
}else{
_12b.push({type:PART,payload:part});
}
}
};
function _137(){
if(_138()){
if(_139()){
if(_13a()){
_13b();
}
}
}
if(_13c()){
_13d();
}
};
function _13c(){
if(_128.type==ACK){
return true;
}
if((_128.msn==_125.ackMsn)&&(_125.ack==1)){
return true;
}
log("Waiting for ACK : "+_128.msn);
return false;
};
function _13e(){
msn++;
if(msn==100){
msn=0;
}
if(msn<10){
return "0"+msn;
}
return ""+msn;
};
function _138(){
var _13f=window.location.href.split("#");
if(_13f.length==2){
var _140=_13f[1];
if(_140!=""&&_140!=_124){
_124=_140;
return true;
}
}
return false;
};
function _139(){
var type=_124.substr(0,1);
var msn=_124.substr(1,2);
var _141=3;
var _142=_124.substr(_141,_fa._securityTokenLength);
_141+=_fa._securityTokenLength;
var _143=_124.substr(_141,_fa._securityTokenLength);
_141+=_fa._securityTokenLength;
var ack=_124.substr(_141,1);
_141+=1;
var _144=_124.substr(_141,2);
_141+=2;
var _145=_124.substr(_141);
log("In : Type: "+type+" msn: "+msn+" tokenParent: "+_142+" tokenChild: "+_143+" ack: "+ack+" msn: "+_144+" payload: "+_145);
_125={type:type,msn:msn,tokenParent:_142,tokenChild:_143,ack:ack,ackMsn:_144,payload:_145};
return true;
};
function _13a(){
if(_125.type!=INIT&&(_125.tokenParent!=_12e||_125.tokenChild!=_12f)){
log("Security token error: Invalid security token received. The message will be discarded.");
_146(_fa.SecurityErrors.INVALID_TOKEN);
return false;
}
return true;
};
function _13b(){
ack=1;
if(_125.type!=INIT&&_11f&&_128.type==INIT&&_125.ack=="1"&&_128.msn==_125.ackMsn){
_131.initializationFinished(_130,_129,_12e,_12f,null,_132);
}
switch(_125.type){
case INIT:
_147();
break;
case ACK:
_148();
break;
case PART:
_149();
break;
case END:
_14a();
break;
}
_126=_125;
};
function _147(){
var _14b=_125.payload.split(":");
_130=decodeURIComponent(_14b[0]);
_129=decodeURIComponent(_14b[1]);
_12e=_125.tokenParent;
_12f=_125.tokenChild;
if(_11f){
_12f=_fa._clientSecurityToken;
var _14c="3827816c-f3b1-11db-8314-0800200c9a66";
var _14d=document.createElement("iframe");
var _14e=encodeURIComponent(window.location.href.split("#")[0]);
var _14f=encodeURIComponent(_130)+":"+_14e;
_14d.src=_129+"#100"+_12e+_12f+"100"+_14f;
_14d.name=_14c;
_14d.id=_14c;
document.body.appendChild(_14d);
_14d.style.position="absolute";
_14d.style.left=_14d.style.top="-10px";
_14d.style.height=_14d.style.width="1px";
_14d.style.visibility="hidden";
ack=0;
_12a=window.frames[_14c];
_128={type:INIT,msn:"00",tokenParent:_12e,tokenChild:_12f,ack:"0",ackMsn:"00",payload:_14f};
_131=_120[".."];
_132=_14b[2]&&_14b[2]==="debug";
}else{
_12a=window.parent;
_131=_120[_130];
var _150=_131.initializationFinished(_130,_129,_12e,_12f,that);
if(!_150){
ack=0;
}
_128={type:INIT,msn:"00",tokenParent:_12e,tokenChild:_12f,ack:"0",ackMsn:"00",payload:(encodeURIComponent(_130)+":"+encodeURIComponent(window.location.href.split("#")[0]))};
}
if(_12a==null){
log("Init failed.");
}
};
function _148(){
ack=0;
};
function _149(){
_12c+=_125.payload;
};
function _14a(){
_12c+=_125.payload;
log("Received: "+_12c);
_131.messageReceived(_12c);
_12c="";
};
function _13d(){
if(_12b.length==0&&ack==1){
_12b.push({type:ACK,payload:""});
}
if(_12b.length!=0){
_127=_12b.shift();
_127.tokenParent=_12e;
_127.tokenChild=_12f;
_127.msn=_13e();
_127.ack="1";
_127.ackMsn=_126.msn;
ack=0;
_151();
}
};
function _151(){
var url=_129+"#"+_127.type+_127.msn+_127.tokenParent+_127.tokenChild+_127.ack+_127.ackMsn+_127.payload;
_12a.location.replace(url);
_128=_127;
log("Out: Type: "+_127.type+" msn: "+_127.msn+" tokenParent: "+_127.tokenParent+" tokenChild: "+_127.tokenChild+" ack: "+_127.ack+" msn: "+_127.ackMsn+" payload: "+_127.payload);
};
function _146(_152){
clearInterval(_12d);
_131.handleSecurityError(_152);
};
function log(msg){
if(_131){
while(logQ.length>0){
_131.log(logQ.shift());
}
_131.log(msg);
}else{
logQ.push(msg);
}
};
_12d=setInterval(_137,_121);
};
};
OpenAjax.hub.IframeContainer._NIX=function(){
var _153="openajax-2.0.1";
var _154="GRPC____NIXVBS_wrapper";
var _155="GRPC____NIXVBS_get_wrapper";
var _156="GRPC____NIXVBS_handle_message";
var _157="GRPC____NIXVBS_create_channel";
var _158=10;
var _159=500;
var _15a={};
var _15b=0;
var uri;
if(typeof window[_155]!=="unknown"){
window[_156]=function(data){
window.setTimeout(function(){
_15c(JSON.parse(data));
},0);
};
window[_157]=function(name,_15d,_15e){
if(_15f(name)===_15e){
_15a[name].nix_channel=_15d;
_160(name,true,"nix");
}
};
var _161="Class "+_154+"\n "+"Private m_Intended\n"+"Private m_Auth\n"+"Public Sub SetIntendedName(name)\n "+"If isEmpty(m_Intended) Then\n"+"m_Intended = name\n"+"End If\n"+"End Sub\n"+"Public Sub SetAuth(auth)\n "+"If isEmpty(m_Auth) Then\n"+"m_Auth = auth\n"+"End If\n"+"End Sub\n"+"Public Sub SendMessage(data)\n "+_156+"(data)\n"+"End Sub\n"+"Public Function GetAuthToken()\n "+"GetAuthToken = m_Auth\n"+"End Function\n"+"Public Sub CreateChannel(channel, auth)\n "+"Call "+_157+"(m_Intended, channel, auth)\n"+"End Sub\n"+"End Class\n"+"Function "+_155+"(name, auth)\n"+"Dim wrap\n"+"Set wrap = New "+_154+"\n"+"wrap.SetIntendedName name\n"+"wrap.SetAuth auth\n"+"Set "+_155+" = wrap\n"+"End Function";
try{
window.execScript(_161,"vbscript");
}
catch(e){
throw new Error("Failed to create NIX VBScript object");
}
}
this.addReceiver=function(args){
_15a[args.receiverId]={r:args.receiver};
if(args.receiverId===".."){
return _162.call(this,args);
}
return _163.call(this,args);
};
this.getURI=function(){
return uri;
};
this.postAdd=function(_164,_165){
_15a[_164].frame=_165;
try{
var _166=window[_155](_164,_15a[_164].authToken);
_165.contentWindow.opener=_166;
}
catch(e){
return false;
}
return true;
};
this.sendMsg=function(_167,data){
if(_167===".."){
data.t=_15a[_167].authToken;
}
try{
if(_15a[_167]){
_15a[_167].nix_channel.SendMessage(JSON.stringify(data));
}
}
catch(e){
return false;
}
return true;
};
this.tunnelLoaded=function(){
var id=OpenAjax.hub.IframeContainer._queryURLParam("oahi");
var _168=OpenAjax.hub.IframeContainer._queryURLParam("oaht1");
var _169=OpenAjax.hub.IframeContainer._queryURLParam("oaht2");
var _16a=OpenAjax.hub.IframeContainer._queryURLParam("oahu");
window.parent.parent.OpenAjax.hub.IframeContainer._NIX._receiveTunnelMsg(id,_168,_169,_16a);
return id;
};
this.removeReceiver=function(_16b){
delete _15a[_16b];
if(_16b===".."){
if(_16c){
clearInterval(_16c);
_16c=null;
}
}
};
function _16d(){
var _16e=_15a[".."].nix_channel;
if(_16e){
return;
}
if(++_15b>_158){
_160("..",false,"nix");
return;
}
if(!_16e&&window.opener&&"GetAuthToken" in window.opener){
_16e=window.opener;
var _16f=_15f("..");
if(_16e.GetAuthToken()==_16f){
_16e.CreateChannel(window[_155]("..",_16f),_16f);
_15a[".."].nix_channel=_16e;
window.opener=null;
_160("..",true,"nix");
return;
}
}
window.setTimeout(function(){
_16d();
},_159);
};
function _15f(_170){
if(!_15a[_170].authToken&&_170===".."){
_15a[".."].authToken=OpenAjax.hub.IframeContainer._queryURLParam("oaht");
}
return _15a[_170].authToken;
};
function _160(_171,_172,_173,_174){
if(!_15a[_171]){
return;
}
var rec=_15a[_171];
var _175=_171===".."?OpenAjax.hub.IframeContainer._queryURLParam("oahi"):_171;
if(!_172){
var _176;
if(_174){
_176={securityAlert:_174};
}
rec.r.transportReady(_175,false,_176);
return;
}
rec["ready_"+_173]=true;
if(rec.ready_nix&&rec.ready_fim){
_176={partnerOrigin:_15a[_171].partnerOrigin};
rec.r.transportReady(_175,true,_176);
}
};
function _15c(data){
var id=data.r||data.i;
if(!_15a[id]){
return;
}
if(_15f(id)!==data.t){
_15a[id].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
return;
}
_15a[id].r.receiveMsg(data);
};
function _163(args){
_15a[args.receiverId].authToken=args.securityToken;
var _177="oahpv="+encodeURIComponent(_153)+"&oahi="+encodeURIComponent(args.receiverId)+"&oaht="+args.securityToken+"&oahu="+encodeURIComponent(args.tunnelURI);
var _178=args.uri.split("#");
_178[0]=_178[0]+((_178[0].indexOf("?")!=-1)?"&":"?")+_177;
uri=_178.length===1?_178[0]:_178[0]+"#"+_178[1];
return null;
};
function _162(args){
var pv=OpenAjax.hub.IframeContainer._queryURLParam("oahpv");
if(!pv||pv!==_153){
return null;
}
_16d();
var id=OpenAjax.hub.IframeContainer._queryURLParam("oahi");
var _179=_15f("..");
var _17a=args.securityToken;
var _17b=OpenAjax.hub.IframeContainer._queryURLParam("oahu");
if(!id||!_179||!_17b){
return null;
}
_15a[".."].childAuthToken=_17a;
_15a[".."].partnerOrigin=/^([a-zA-Z]+:\/\/[^\/?#:]+).*/.exec(_17b)[1];
var _17c="oahi="+encodeURIComponent(id)+"&oaht1="+_179+"&oaht2="+_17a+"&oahu="+encodeURIComponent(window.location.href);
var _17d=_17b.split("#");
_17d[0]=_17d[0]+((_17d[0].indexOf("?")!=-1)?"&":"?")+_17c;
var uri=_17d.length===1?_17d[0]:_17d[0]+"#"+_17d[1];
OpenAjax.hub.IframeContainer._createTunnelIframe(uri);
_16c=setInterval(_17e,100);
return id;
};
OpenAjax.hub.IframeContainer._NIX._receiveTunnelMsg=function(_17f,_180,_181,_182){
if(_15a[_17f].authToken!==_180){
_160(_17f,false,"fim","OpenAjax.hub.SecurityAlert.FramePhish");
return;
}
_15a[_17f].frame.src=_182+"#"+_181;
_15a[_17f].partnerOrigin=/^([a-zA-Z]+:\/\/[^\/?#:]+).*/.exec(_182)[1];
_160(_17f,true,"fim");
};
var _16c;
function _17e(){
var _183=window.location.href.split("#");
if(_183.length===2){
clearInterval(_16c);
_16c=null;
if(_183[1]===_15a[".."].childAuthToken){
_160("..",true,"fim");
return;
}
_160("..",false,"fim","OpenAjax.hub.SecurityAlert.FramePhish");
}
};
};
if(typeof OpenAjax._smash=="undefined"){
OpenAjax._smash={};
}
OpenAjax._smash.crypto={"strToWA":function(str,_184){
var bin=Array();
var mask=(1<<_184)-1;
for(var i=0;i<str.length*_184;i+=_184){
bin[i>>5]|=(str.charCodeAt(i/_184)&mask)<<(32-_184-i%32);
}
return bin;
},"hmac_sha1":function(_185,_186,_187){
var ipad=Array(16),opad=Array(16);
for(var i=0;i<16;i++){
ipad[i]=_185[i]^909522486;
opad[i]=_185[i]^1549556828;
}
var hash=this.sha1(ipad.concat(this.strToWA(_186,_187)),512+_186.length*_187);
return this.sha1(opad.concat(hash),512+160);
},"newPRNG":function(_188){
var that=this;
if((typeof _188!="string")||(_188.length<12)){
alert("WARNING: Seed length too short ...");
}
var _189=[43417,15926,18182,33130,9585,30800,49772,40144,47678,55453,4659,38181,65340,6787,54417,65301];
var _18a=[];
var _18b=0;
function _18c(_18d){
return that.hmac_sha1(_189,_18d,8);
};
function _18e(_18f){
var _190=_18c(_18f);
for(var i=0;i<5;i++){
_18a[i]^=_190[i];
}
};
_18e(_188);
return {"addSeed":function(seed){
_18e(seed);
},"nextRandomOctets":function(len){
var _191=[];
while(len>0){
_18b+=1;
var _192=that.hmac_sha1(_18a,(_18b).toString(16),8);
for(i=0;(i<20)&(len>0);i++,len--){
_191.push((_192[i>>2]>>(i%4))%256);
}
}
return _191;
},"nextRandomB64Str":function(len){
var _193="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var _194=this.nextRandomOctets(len);
var _195="";
for(var i=0;i<len;i++){
_195+=_193.charAt(_194[i]&63);
}
return _195;
}};
},"sha1":function(){
var _196=function(x,y){
var lsw=(x&65535)+(y&65535);
var msw=(x>>16)+(y>>16)+(lsw>>16);
return (msw<<16)|(lsw&65535);
};
var rol=function(num,cnt){
return (num<<cnt)|(num>>>(32-cnt));
};
function _197(t,b,c,d){
if(t<20){
return (b&c)|((~b)&d);
}
if(t<40){
return b^c^d;
}
if(t<60){
return (b&c)|(b&d)|(c&d);
}
return b^c^d;
};
function _198(t){
return (t<20)?1518500249:(t<40)?1859775393:(t<60)?-1894007588:-899497514;
};
return function(_199,_19a){
_199[_19a>>5]|=128<<(24-_19a%32);
_199[((_19a+64>>9)<<4)+15]=_19a;
var W=Array(80);
var H0=1732584193;
var H1=-271733879;
var H2=-1732584194;
var H3=271733878;
var H4=-1009589776;
for(var i=0;i<_199.length;i+=16){
var a=H0;
var b=H1;
var c=H2;
var d=H3;
var e=H4;
for(var j=0;j<80;j++){
W[j]=((j<16)?_199[i+j]:rol(W[j-3]^W[j-8]^W[j-14]^W[j-16],1));
var T=_196(_196(rol(a,5),_197(j,b,c,d)),_196(_196(e,W[j]),_198(j)));
e=d;
d=c;
c=rol(b,30);
b=a;
a=T;
}
H0=_196(a,H0);
H1=_196(b,H1);
H2=_196(c,H2);
H3=_196(d,H3);
H4=_196(e,H4);
}
return Array(H0,H1,H2,H3,H4);
};
}()};
if(!this.JSON){
JSON={};
}
(function(){
function f(n){
return n<10?"0"+n:n;
};
if(typeof Date.prototype.toJSON!=="function"){
Date.prototype.toJSON=function(key){
return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z";
};
String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){
return this.valueOf();
};
}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,_19b=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,_19c,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","\"":"\\\"","\\":"\\\\"},rep;
function _19d(_19e){
_19b.lastIndex=0;
return _19b.test(_19e)?"\""+_19e.replace(_19b,function(a){
var c=meta[a];
return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
})+"\"":"\""+_19e+"\"";
};
function str(key,_19f){
var i,k,v,_1a0,mind=gap,_1a1,_1a2=_19f[key];
if(_1a2&&typeof _1a2==="object"&&typeof _1a2.toJSON==="function"){
_1a2=_1a2.toJSON(key);
}
if(typeof rep==="function"){
_1a2=rep.call(_19f,key,_1a2);
}
switch(typeof _1a2){
case "string":
return _19d(_1a2);
case "number":
return isFinite(_1a2)?String(_1a2):"null";
case "boolean":
case "null":
return String(_1a2);
case "object":
if(!_1a2){
return "null";
}
gap+=_19c;
_1a1=[];
if(Object.prototype.toString.apply(_1a2)==="[object Array]"){
_1a0=_1a2.length;
for(i=0;i<_1a0;i+=1){
_1a1[i]=str(i,_1a2)||"null";
}
v=_1a1.length===0?"[]":gap?"[\n"+gap+_1a1.join(",\n"+gap)+"\n"+mind+"]":"["+_1a1.join(",")+"]";
gap=mind;
return v;
}
if(rep&&typeof rep==="object"){
_1a0=rep.length;
for(i=0;i<_1a0;i+=1){
k=rep[i];
if(typeof k==="string"){
v=str(k,_1a2);
if(v){
_1a1.push(_19d(k)+(gap?": ":":")+v);
}
}
}
}else{
for(k in _1a2){
if(Object.hasOwnProperty.call(_1a2,k)){
v=str(k,_1a2);
if(v){
_1a1.push(_19d(k)+(gap?": ":":")+v);
}
}
}
}
v=_1a1.length===0?"{}":gap?"{\n"+gap+_1a1.join(",\n"+gap)+"\n"+mind+"}":"{"+_1a1.join(",")+"}";
gap=mind;
return v;
}
};
if(typeof JSON.stringify!=="function"){
JSON.stringify=function(_1a3,_1a4,_1a5){
var i;
gap="";
_19c="";
if(typeof _1a5==="number"){
for(i=0;i<_1a5;i+=1){
_19c+=" ";
}
}else{
if(typeof _1a5==="string"){
_19c=_1a5;
}
}
rep=_1a4;
if(_1a4&&typeof _1a4!=="function"&&(typeof _1a4!=="object"||typeof _1a4.length!=="number")){
throw new Error("JSON.stringify");
}
return str("",{"":_1a3});
};
}
if(typeof JSON.parse!=="function"){
JSON.parse=function(text,_1a6){
var j;
function walk(_1a7,key){
var k,v,_1a8=_1a7[key];
if(_1a8&&typeof _1a8==="object"){
for(k in _1a8){
if(Object.hasOwnProperty.call(_1a8,k)){
v=walk(_1a8,k);
if(v!==undefined){
_1a8[k]=v;
}else{
delete _1a8[k];
}
}
}
}
return _1a6.call(_1a7,key,_1a8);
};
cx.lastIndex=0;
if(cx.test(text)){
text=text.replace(cx,function(a){
return "\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
});
}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){
j=eval("("+text+")");
return typeof _1a6==="function"?walk({"":j},""):j;
}
throw new SyntaxError("JSON.parse");
};
}
})();
OpenAjax.hub.InlineContainer=function(hub,_1a9,_1aa){
if(!hub||!_1a9||!_1aa||!_1aa.Container||!_1aa.Container.onSecurityAlert){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._params=_1aa;
this._hub=hub;
this._id=_1a9;
this._onSecurityAlert=_1aa.Container.onSecurityAlert;
this._onConnect=_1aa.Container.onConnect?_1aa.Container.onConnect:null;
this._onDisconnect=_1aa.Container.onDisconnect?_1aa.Container.onDisconnect:null;
this._scope=_1aa.Container.scope||window;
if(_1aa.Container.log){
var that=this;
this._log=function(msg){
try{
_1aa.Container.log.call(that._scope,"InlineContainer::"+_1a9+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
this._log=function(){
};
}
this._connected=false;
this._subs=[];
this._subIndex=0;
hub.addContainer(this);
};
OpenAjax.hub.InlineContainer.prototype.getHub=function(){
return this._hub;
};
OpenAjax.hub.InlineContainer.prototype.sendToClient=function(_1ab,data,_1ac){
if(this.isConnected()){
var sub=this._subs[_1ac];
try{
sub.cb.call(sub.sc,_1ab,data,sub.d);
}
catch(e){
OpenAjax.hub._debugger();
this._client._log("caught error from onData callback to HubClient.subscribe(): "+e.message);
}
}
};
OpenAjax.hub.InlineContainer.prototype.remove=function(){
if(this.isConnected()){
this._disconnect();
}
};
OpenAjax.hub.InlineContainer.prototype.isConnected=function(){
return this._connected;
};
OpenAjax.hub.InlineContainer.prototype.getClientID=function(){
return this._id;
};
OpenAjax.hub.InlineContainer.prototype.getPartnerOrigin=function(){
if(this._connected){
return window.location.protocol+"//"+window.location.hostname;
}
return null;
};
OpenAjax.hub.InlineContainer.prototype.getParameters=function(){
return this._params;
};
OpenAjax.hub.InlineContainer.prototype.connect=function(_1ad,_1ae,_1af){
if(this._connected){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
this._connected=true;
this._client=_1ad;
if(this._onConnect){
try{
this._onConnect.call(this._scope,this);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onConnect callback to constructor: "+e.message);
}
}
this._invokeOnComplete(_1ae,_1af,_1ad,true);
};
OpenAjax.hub.InlineContainer.prototype.disconnect=function(_1b0,_1b1,_1b2){
if(!this._connected){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
this._disconnect();
if(this._onDisconnect){
try{
this._onDisconnect.call(this._scope,this);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onDisconnect callback to constructor: "+e.message);
}
}
this._invokeOnComplete(_1b1,_1b2,_1b0,true);
};
OpenAjax.hub.InlineContainer.prototype.subscribe=function(_1b3,_1b4,_1b5,_1b6,_1b7){
this._assertConn();
this._assertSubTopic(_1b3);
if(!_1b4){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _1b8=""+this._subIndex++;
var _1b9=false;
var msg=null;
try{
var _1ba=this._hub.subscribeForClient(this,_1b3,_1b8);
_1b9=true;
}
catch(e){
_1b8=null;
msg=e.message;
}
_1b5=_1b5||window;
if(_1b9){
this._subs[_1b8]={h:_1ba,cb:_1b4,sc:_1b5,d:_1b7};
}
this._invokeOnComplete(_1b6,_1b5,_1b8,_1b9,msg);
return _1b8;
};
OpenAjax.hub.InlineContainer.prototype.publish=function(_1bb,data){
this._assertConn();
this._assertPubTopic(_1bb);
this._hub.publishForClient(this,_1bb,data);
};
OpenAjax.hub.InlineContainer.prototype.unsubscribe=function(_1bc,_1bd,_1be){
this._assertConn();
if(typeof _1bc==="undefined"||_1bc==null){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var sub=this._subs[_1bc];
if(!sub){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
this._hub.unsubscribeForClient(this,sub.h);
delete this._subs[_1bc];
this._invokeOnComplete(_1bd,_1be,_1bc,true);
};
OpenAjax.hub.InlineContainer.prototype.getSubscriberData=function(_1bf){
this._assertConn();
return this._getSubscription(_1bf).d;
};
OpenAjax.hub.InlineContainer.prototype.getSubscriberScope=function(_1c0){
this._assertConn();
return this._getSubscription(_1c0).sc;
};
OpenAjax.hub.InlineContainer.prototype._invokeOnComplete=function(func,_1c1,item,_1c2,_1c3){
if(func){
try{
_1c1=_1c1||window;
func.call(_1c1,item,_1c2,_1c3);
}
catch(e){
OpenAjax.hub._debugger();
this._client._log("caught error from onComplete callback: "+e.message);
}
}
};
OpenAjax.hub.InlineContainer.prototype._disconnect=function(){
for(var _1c4 in this._subs){
this._hub.unsubscribeForClient(this,this._subs[_1c4].h);
}
this._subs=[];
this._subIndex=0;
this._connected=false;
};
OpenAjax.hub.InlineContainer.prototype._assertConn=function(){
if(!this._connected){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
OpenAjax.hub.InlineContainer.prototype._assertPubTopic=function(_1c5){
if((_1c5==null)||(_1c5=="")||(_1c5.indexOf("*")!=-1)||(_1c5.indexOf("..")!=-1)||(_1c5.charAt(0)==".")||(_1c5.charAt(_1c5.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
OpenAjax.hub.InlineContainer.prototype._assertSubTopic=function(_1c6){
if(!_1c6){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var path=_1c6.split(".");
var len=path.length;
for(var i=0;i<len;i++){
var p=path[i];
if((p=="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
OpenAjax.hub.InlineContainer.prototype._getSubscription=function(_1c7){
var sub=this._subs[_1c7];
if(sub){
return sub;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.InlineHubClient=function(_1c8){
if(!_1c8||!_1c8.HubClient||!_1c8.HubClient.onSecurityAlert||!_1c8.InlineHubClient||!_1c8.InlineHubClient.container){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._params=_1c8;
this._onSecurityAlert=_1c8.HubClient.onSecurityAlert;
this._scope=_1c8.HubClient.scope||window;
this._container=_1c8.InlineHubClient.container;
if(_1c8.HubClient.log){
var that=this;
this._log=function(msg){
try{
_1c8.HubClient.log.call(that._scope,"InlineHubClient::"+that._container.getClientID()+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
this._log=function(){
};
}
};
OpenAjax.hub.InlineHubClient.prototype.connect=function(_1c9,_1ca){
this._container.connect(this,_1c9,_1ca);
};
OpenAjax.hub.InlineHubClient.prototype.disconnect=function(_1cb,_1cc){
this._container.disconnect(this,_1cb,_1cc);
};
OpenAjax.hub.InlineHubClient.prototype.getPartnerOrigin=function(){
return this._container.getPartnerOrigin();
};
OpenAjax.hub.InlineHubClient.prototype.getClientID=function(){
return this._container.getClientID();
};
OpenAjax.hub.InlineHubClient.prototype.subscribe=function(_1cd,_1ce,_1cf,_1d0,_1d1){
return this._container.subscribe(_1cd,_1ce,_1cf,_1d0,_1d1);
};
OpenAjax.hub.InlineHubClient.prototype.publish=function(_1d2,data){
this._container.publish(_1d2,data);
};
OpenAjax.hub.InlineHubClient.prototype.unsubscribe=function(_1d3,_1d4,_1d5){
this._container.unsubscribe(_1d3,_1d4,_1d5);
};
OpenAjax.hub.InlineHubClient.prototype.isConnected=function(){
return this._container.isConnected();
};
OpenAjax.hub.InlineHubClient.prototype.getScope=function(){
return this._scope;
};
OpenAjax.hub.InlineHubClient.prototype.getSubscriberData=function(_1d6){
return this._container.getSubscriberData(_1d6);
};
OpenAjax.hub.InlineHubClient.prototype.getSubscriberScope=function(_1d7){
return this._container.getSubscriberScope(_1d7);
};
OpenAjax.hub.InlineHubClient.prototype.getParameters=function(){
return this._params;
};

