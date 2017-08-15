

/* timegrid.js */


Timegrid.listener=null;
Timegrid.eventGridClickListener=null;
Timegrid.eventGridInput=null;

Timegrid.create=function(node,eventSource,layoutName,layoutParams){
return new Timegrid._Impl(node,eventSource,layoutName,layoutParams);
};

Timegrid.resize=function(){
for(var i=0;i<window.timegrids.length;i++){
window.timegrids[i]._resize();
}
return false;
};

Timegrid.createFromDOM=function(elmt){
var config=Timegrid.getConfigFromDOM(elmt);
Timegrid.listener=window[config.listener];
Timegrid.eventGridClickListener=window[config.gridlistener];
Timegrid.eventGridInput=window[config.gridlistenerinput];

var layoutNames=config.views.split(",");
var getExtension=function(s){
return s.split('.').pop().toLowerCase();
};
if(config.eventsource){
var eventSource=eval(config.eventsource);
var tg=Timegrid.create(elmt,eventSource,layoutNames,config);
return tg;
}else if(config.src){
var eventSource=new Timegrid.DefaultEventSource();
var tg=Timegrid.create(elmt,eventSource,layoutNames,config);
switch(getExtension(config.src)){
case'xml':
tg.loadXML(config.src,function(xml,url){
eventSource.loadXML(xml,url);
});
break;
case'js':
tg.loadJSON(config.src,function(json,url){
eventSource.loadJSON(json,url);
});
break;
}
return tg;
}
};

Timegrid.getConfigFromDOM=function(elmt){
var config=$(elmt).attrs('tg');
config.scrollwidth=$.scrollWidth();
for(var k in config){
config[k.toLowerCase()]=config[k];
}
return config;
};

Timegrid.loadXML=function(url,f){
var fError=function(statusText,status,xmlhttp){

$.debugLog(Timegrid.l10n.xmlErrorMessage+" "+url+"\n"+statusText,true);
};
var fDone=function(xmlhttp){
var xml=xmlhttp.responseXML;
if(!xml.documentElement&&xmlhttp.responseStream){
xml.load(xmlhttp.responseStream);
}
f(xml,url);
};
$.getXmlHttp(url,fError,fDone);
};

Timegrid.loadJSON=function(url,f){
var fError=function(statusText,status,xmlhttp){

$.debugLog(Timegrid.l10n.jsonErrorMessage+" "+url+"\n"+statusText);
};
var fDone=function(xmlhttp){
f(eval('('+xmlhttp.responseText+')'),url);
};
$.getXmlHttp(url,fError,fDone);
};

Timegrid._Impl=function(node,eventSource,layoutNames,layoutParams){
var tg=this;
this._container=node;
this._eventSource=eventSource;
this._layoutNames=layoutNames;
this._layoutParams=layoutParams;

if(this._eventSource){
this._eventListener={
onAddMany:function(){tg._onAddMany();},
onClear:function(){tg._onClear();}
}
this._eventSource.addListener(this._eventListener);
}

this._construct();
};

Timegrid._Impl.prototype.loadXML=function(url,f){
var tg=this;

var fError=function(statusText,status,xmlhttp){

$.debugLog(Timegrid.l10n.xmlErrorMessage+" "+url+"\n"+statusText);
tg.hideLoadingMessage();
};
var fDone=function(xmlhttp){
try{
var xml=xmlhttp.responseXML;
if(!xml.documentElement&&xmlhttp.responseStream){
xml.load(xmlhttp.responseStream);
}
f(xml,url);
}finally{
tg.hideLoadingMessage();
}
};
this.showLoadingMessage();
window.setTimeout(function(){
$.getXmlHttp(url,fError,fDone);
},0);
};

Timegrid._Impl.prototype.loadJSON=function(url,f){
var tg=this;
var fError=function(statusText,status,xmlhttp){

$.debugLog(Timegrid.l10n.xmlErrorMessage+" "+url+"\n"+statusText);
tg.hideLoadingMessage();
};
var fDone=function(xmlhttp){
try{
f(eval('('+xmlhttp.responseText+')'),url);
}finally{
tg.hideLoadingMessage();
}
};
this.showLoadingMessage();
window.setTimeout(function(){$.getXmlHttp(url,fError,fDone);},0);
};

Timegrid._Impl.prototype._construct=function(){
this.rendering=true;
var self=this;
this._layouts=$.map(this._layoutNames,function(s){
return Timegrid.LayoutFactory.createLayout(s,self._eventSource,
self._layoutParams);
});

if(this._panel){
this._panel.setLayouts(this._layouts);
}else{
this._panel=new Timegrid.Controls.Panel(this._layouts);
}
var container=this._container;
var doc=container.ownerDocument;

while(container.firstChild){
container.removeChild(container.firstChild);
}
$(container).addClass('timegrid-default');

var message=$.createMessageBubble(doc,Timegrid.urlPrefix);
message.containerDiv.className="timegrid-message-container";
container.appendChild(message.containerDiv);

message.contentDiv.className="timegrid-message";
message.contentDiv.innerHTML="<img src='"+Timegrid.urlPrefix
+"images/progress-running.gif' /> "+Timegrid.l10n.loadingMessage;

this.showLoadingMessage=function(){$(message.containerDiv).show();};
this.hideLoadingMessage=function(){$(message.containerDiv).hide();};
this._panel.render(container);
this.rendering=false;
};

Timegrid._Impl.prototype._update=function(){
this._panel.renderChanged();
};

Timegrid._Impl.prototype._resize=function(){
var newHeight=$(this._container).height();
var newWidth=$(this._container).width();

if(!(newHeight==this._oldHeight&&newWidth==this._oldWidth)){
if(!this.rendering){this._construct();}
this._oldHeight=newHeight;
this._oldWidth=newWidth;
}
};

Timegrid._Impl.prototype._onAddMany=function(){
this._update();
};

Timegrid._Impl.prototype._onClear=function(){
this._update();
};



/* util.js */



Timegrid.abstract=function(name){
return function(){
throw"A "+name+" method has not been implemented!";
return;
};
};

Timegrid.Interval=function(ms){

var SECONDS_CF=1000;
var MINUTES_CF=60000;
var HOURS_CF=3600000;
var DAYS_CF=86400000;
var WEEKS_CF=604800000;
var FORTNIGHTS_CF=1209600000;
var MONTHS_CF=2592000000;
var QUARTERS_CF=7776000000;
var YEARS_CF=31557600000;
var DECADES_CF=315576000000;
var CENTURIES_CF=3155760000000;

this.milliseconds=Math.abs(ms);
this.seconds=Math.round(this.milliseconds/SECONDS_CF);
this.minutes=Math.round(this.milliseconds/MINUTES_CF);
this.hours=Math.round(this.milliseconds/HOURS_CF);
this.days=Math.floor(this.milliseconds/DAYS_CF);
this.weeks=Math.round(this.milliseconds/WEEKS_CF);
this.fortnights=Math.round(this.milliseconds/FORTNIGHTS_CF);
this.months=Math.round(this.milliseconds/MONTHS_CF);

this.quarters=Math.round(this.milliseconds/QUARTERS_CF);

this.years=Math.round(this.milliseconds/YEARS_CF);

this.decades=Math.round(this.milliseconds/DECADES_CF);

this.centuries=Math.round(this.milliseconds/CENTURIES_CF);


return this;
};

Timegrid.IntervaltoString=function(){
return this.milliseconds.toString();
};


/* listeners.js */

Timegrid.ListenerAware=function(){
this._listeners=[];
};

Timegrid.ListenerAware.prototype.addListener=function(listener){
this._listeners.push(listener);
};

Timegrid.ListenerAware.prototype.removeListener=function(listener){
for(var i=0;i<this._listeners.length;i++){
if(this._listeners[i]==listener){
this._listeners.splice(i,1);
break;
}
}
};

Timegrid.ListenerAware.prototype._fire=function(handlerName,args){
for(var i=0;i<this._listeners.length;i++){
var listener=this._listeners[i];
if(handlerName in listener){
try{
listener[handlerName].apply(listener,args);
}catch(e){
Timegrid.Debug.exception(e);
}
}
}
};

/* default.js */




Timegrid.DefaultEventSource=function(eventIndex){
Timegrid.DefaultEventSource.superclass.call(this);
this._events=(eventIndex instanceof Object)?eventIndex:new Timegrid.EventIndex();
};
$.inherit(Timegrid.DefaultEventSource,Timegrid.ListenerAware);

Timegrid.DefaultEventSource.prototype.loadXML=function(xml,url){
var base=this._getBaseURL(url);

var wikiURL=xml.documentElement.getAttribute("wiki-url");
var wikiSection=xml.documentElement.getAttribute("wiki-section");

var dateTimeFormat=xml.documentElement.getAttribute("date-time-format");
var parseDateTimeFunction=this._events.getUnit().getParser(dateTimeFormat);

var node=xml.documentElement.firstChild;
var added=false;
while(node!=null){
if(node.nodeType==1){
var description="";
if(node.firstChild!=null&&node.firstChild.nodeType==3){
description=node.firstChild.nodeValue;
}
var evt=new Timegrid.DefaultEventSource.Event(
parseDateTimeFunction(node.getAttribute("start")),
parseDateTimeFunction(node.getAttribute("end")),
parseDateTimeFunction(node.getAttribute("latestStart")),
parseDateTimeFunction(node.getAttribute("earliestEnd")),
node.getAttribute("isDuration")!="true",
node.getAttribute("title"),
description,
this._resolveRelativeURL(node.getAttribute("image"),base),
this._resolveRelativeURL(node.getAttribute("link"),base),
this._resolveRelativeURL(node.getAttribute("icon"),base),
node.getAttribute("color"),
node.getAttribute("textColor")
);
evt._node=node;
evt.getProperty=function(name){
return this._node.getAttribute(name);
};
evt.setWikiInfo(wikiURL,wikiSection);

this._events.add(evt);

added=true;
}
node=node.nextSibling;
}

if(added){
this._fire("onAddMany",[]);
}
};


Timegrid.DefaultEventSource.prototype.loadJSON=function(data,url){
var base=this._getBaseURL(url);
var added=false;
if(data&&data.events){
var wikiURL=("wikiURL"in data)?data.wikiURL:null;
var wikiSection=("wikiSection"in data)?data.wikiSection:null;

var dateTimeFormat=("dateTimeFormat"in data)?data.dateTimeFormat:null;
var parseDateTimeFunction=this._events.getUnit().getParser(dateTimeFormat);

for(var i=0;i<data.events.length;i++){
var event=data.events[i];
if(!(event.start||event.end||
event.latestStart||event.earliestEnd)){
continue;
}
var evt=new Timegrid.DefaultEventSource.Event(
parseDateTimeFunction(event.start),
parseDateTimeFunction(event.end),
parseDateTimeFunction(event.latestStart),
parseDateTimeFunction(event.earliestEnd),
event.isDuration||false,
event.title,
event.description,
this._resolveRelativeURL(event.image,base),
this._resolveRelativeURL(event.link,base),
this._resolveRelativeURL(event.icon,base),
event.color,
event.textColor
);
evt._obj=event;
evt.getProperty=function(name){
return this._obj[name];
};
evt.setWikiInfo(wikiURL,wikiSection);
this._events.add(evt);
added=true;
}
}
if(added){
this._fire("onAddMany",[]);
}
};


Timegrid.DefaultEventSource.prototype.loadSPARQL=function(xml,url){
var base=this._getBaseURL(url);

var dateTimeFormat='iso8601';
var parseDateTimeFunction=this._events.getUnit().getParser(dateTimeFormat);

if(xml==null){
return;
}


var node=xml.documentElement.firstChild;
while(node!=null&&(node.nodeType!=1||node.nodeName!='results')){
node=node.nextSibling;
}

var wikiURL=null;
var wikiSection=null;
if(node!=null){
wikiURL=node.getAttribute("wiki-url");
wikiSection=node.getAttribute("wiki-section");

node=node.firstChild;
}

var added=false;
while(node!=null){
if(node.nodeType==1){
var bindings={};
var binding=node.firstChild;
while(binding!=null){
if(binding.nodeType==1&&
binding.firstChild!=null&&
binding.firstChild.nodeType==1&&
binding.firstChild.firstChild!=null&&
binding.firstChild.firstChild.nodeType==3){
bindings[binding.getAttribute('name')]=binding.firstChild.firstChild.nodeValue;
}
binding=binding.nextSibling;
}

if(bindings["start"]==null&&bindings["date"]!=null){
bindings["start"]=bindings["date"];
}

var evt=new Timegrid.DefaultEventSource.Event(
parseDateTimeFunction(bindings["start"]),
parseDateTimeFunction(bindings["end"]),
parseDateTimeFunction(bindings["latestStart"]),
parseDateTimeFunction(bindings["earliestEnd"]),
bindings["isDuration"]!="true",
bindings["title"],
bindings["description"],
this._resolveRelativeURL(bindings["image"],base),
this._resolveRelativeURL(bindings["link"],base),
this._resolveRelativeURL(bindings["icon"],base),
bindings["color"],
bindings["textColor"]
);
evt._bindings=bindings;
evt.getProperty=function(name){
return this._bindings[name];
};
evt.setWikiInfo(wikiURL,wikiSection);

this._events.add(evt);
added=true;
}
node=node.nextSibling;
}

if(added){
this._fire("onAddMany",[]);
}
};

Timegrid.DefaultEventSource.prototype.add=function(evt){
this._events.add(evt);
this._fire("onAddOne",[evt]);
};

Timegrid.DefaultEventSource.prototype.addMany=function(events){
for(var i=0;i<events.length;i++){
this._events.add(events[i]);
}
this._fire("onAddMany",[]);
};

Timegrid.DefaultEventSource.prototype.clear=function(){
this._events.removeAll();
this._fire("onClear",[]);
};

Timegrid.DefaultEventSource.prototype.getEventIterator=function(startDate,endDate){
return this._events.getIterator(startDate,endDate);
};

Timegrid.DefaultEventSource.prototype.getAllEventIterator=function(){
return this._events.getAllIterator();
};

Timegrid.DefaultEventSource.prototype.getCount=function(){
return this._events.getCount();
};

Timegrid.DefaultEventSource.prototype.getEarliestDate=function(){
return this._events.getEarliestDate();
};

Timegrid.DefaultEventSource.prototype.getLatestDate=function(){
return this._events.getLatestDate();
};

Timegrid.DefaultEventSource.prototype._getBaseURL=function(url){
if(url.indexOf("://")<0){
var url2=this._getBaseURL(document.location.href);
if(url.substr(0,1)=="/"){
url=url2.substr(0,url2.indexOf("/",url2.indexOf("://")+3))+url;
}else{
url=url2+url;
}
}

var i=url.lastIndexOf("/");
if(i<0){
return"";
}else{
return url.substr(0,i+1);
}
};

Timegrid.DefaultEventSource.prototype._resolveRelativeURL=function(url,base){
if(url==null||url==""){
return url;
}else if(url.indexOf("://")>0){
return url;
}else if(url.substr(0,1)=="/"){
return base.substr(0,base.indexOf("/",base.indexOf("://")+3))+url;
}else{
return base+url;
}
};


Timegrid.DefaultEventSource.Event=function(
start,end,latestStart,earliestEnd,instant,
text,description,image,link,
icon,color,textColor){

this._id="e"+Math.floor(Math.random()*1000000);

this._instant=instant||(end==null);

this._start=start;
this._end=(end!=null)?end:start;

this._latestStart=(latestStart!=null)?latestStart:(instant?this._end:this._start);
this._earliestEnd=(earliestEnd!=null)?earliestEnd:(instant?this._start:this._end);

this._text=$('<div />').html(text).text();
this._description=$('<div />').html(text).text();
this._image=(image!=null&&image!="")?image:null;
this._link=(link!=null&&link!="")?link:null;

this._icon=(icon!=null&&icon!="")?icon:null;
this._color=(color!=null&&color!="")?color:null;
this._textColor=(textColor!=null&&textColor!="")?textColor:null;

this._wikiURL=null;
this._wikiSection=null;
};

Timegrid.DefaultEventSource.Event.prototype={
getID:function(){return this._id;},

isInstant:function(){return this._instant;},
isImprecise:function(){return this._start!=this._latestStart||this._end!=this._earliestEnd;},

getStart:function(){return this._start;},
getEnd:function(){return this._end;},
getLatestStart:function(){return this._latestStart;},
getEarliestEnd:function(){return this._earliestEnd;},

getText:function(){return this._text;},
getDescription:function(){return this._description;},
getImage:function(){return this._image;},
getLink:function(){return this._link;},

getIcon:function(){return this._icon;},
getColor:function(){return this._color;},
getTextColor:function(){return this._textColor;},

getInterval:function(){
return new Timegrid.Interval(this.getEnd()-
this.getStart());
},

getProperty:function(name){return null;},

getWikiURL:function(){return this._wikiURL;},
getWikiSection:function(){return this._wikiSection;},
setWikiInfo:function(wikiURL,wikiSection){
this._wikiURL=wikiURL;
this._wikiSection=wikiSection;
},

fillDescription:function(elmt){
elmt.innerHTML=this._description;
},
fillWikiInfo:function(elmt){
if(this._wikiURL!=null&&this._wikiSection!=null){
var wikiID=this.getProperty("wikiID");
if(wikiID==null||wikiID.length==0){
wikiID=this.getText();
}
wikiID=wikiID.replace(/\s/g,"_");

var url=this._wikiURL+this._wikiSection.replace(/\s/g,"_")+"/"+wikiID;
var a=document.createElement("a");
a.href=url;
a.target="new";
a.innerHTML="Discuss";

elmt.appendChild(document.createTextNode("["));
elmt.appendChild(a);
elmt.appendChild(document.createTextNode("]"));
}else{
elmt.style.display="none";
}
},
fillTime:function(elmt,labeller){
if(this._instant){
if(this.isImprecise()){
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
elmt.appendChild(elmt.ownerDocument.createElement("br"));
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._end)));
}else{
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
}
}else{
if(this.isImprecise()){
elmt.appendChild(elmt.ownerDocument.createTextNode(
labeller.labelPrecise(this._start)+" ~ "+labeller.labelPrecise(this._latestStart)));
elmt.appendChild(elmt.ownerDocument.createElement("br"));
elmt.appendChild(elmt.ownerDocument.createTextNode(
labeller.labelPrecise(this._earliestEnd)+" ~ "+labeller.labelPrecise(this._end)));
}else{
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
elmt.appendChild(elmt.ownerDocument.createElement("br"));
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._end)));
}
}
},
fillInfoBubble:function(elmt,theme,labeller){
var doc=elmt.ownerDocument;

var title=this.getText();
var link=this.getLink();
var image=this.getImage();

if(image!=null){
var img=doc.createElement("img");
img.src=image;

theme.event.bubble.imageStyler(img);
elmt.appendChild(img);
}

var divTitle=doc.createElement("div");
var textTitle=doc.createTextNode(title);
if(link!=null){
var a=doc.createElement("a");
a.href=link;
a.appendChild(textTitle);
divTitle.appendChild(a);
}else{
divTitle.appendChild(textTitle);
}
theme.event.bubble.titleStyler(divTitle);
elmt.appendChild(divTitle);

var divBody=doc.createElement("div");
this.fillDescription(divBody);
theme.event.bubble.bodyStyler(divBody);
elmt.appendChild(divBody);

var divTime=doc.createElement("div");
this.fillTime(divTime,labeller);
theme.event.bubble.timeStyler(divTime);
elmt.appendChild(divTime);

var divWiki=doc.createElement("div");
this.fillWikiInfo(divWiki);
theme.event.bubble.wikiStyler(divWiki);
elmt.appendChild(divWiki);
}
};


/* date.js */



Date.$VERSION=1.02;


Date.LZ=function(x){return(x<0||x>9?"":"0")+x};


Date.parseString=function(val,format){

if(typeof(format)=="undefined"||format==null||format==""){
var generalFormats=new Array('y-M-d','MMM d, y','MMM d,y','y-MMM-d','d-MMM-y','MMM d','MMM-d','d-MMM');
var monthFirst=new Array('M/d/y','M-d-y','M.d.y','M/d','M-d');
var dateFirst=new Array('d/M/y','d-M-y','d.M.y','d/M','d-M');
var checkList=new Array(generalFormats,Date.preferAmericanFormat?monthFirst:dateFirst,Date.preferAmericanFormat?dateFirst:monthFirst);
for(var i=0;i<checkList.length;i++){
var l=checkList[i];
for(var j=0;j<l.length;j++){
var d=Date.parseString(val,l[j]);
if(d!=null){
return d;
}
}
}
return null;
};

this.isInteger=function(val){
for(var i=0;i<val.length;i++){
if("1234567890".indexOf(val.charAt(i))==-1){
return false;
}
}
return true;
};
this.getInt=function(str,i,minlength,maxlength){
for(var x=maxlength;x>=minlength;x--){
var token=str.substring(i,i+x);
if(token.length<minlength){
return null;
}
if(this.isInteger(token)){
return token;
}
}
return null;
};
val=val+"";
format=format+"";
var i_val=0;
var i_format=0;
var c="";
var token="";
var token2="";
var x,y;
var year=new Date().getFullYear();
var month=1;
var date=1;
var hh=0;
var mm=0;
var ss=0;
var ampm="";
while(i_format<format.length){

c=format.charAt(i_format);
token="";
while((format.charAt(i_format)==c)&&(i_format<format.length)){
token+=format.charAt(i_format++);
}

if(token=="yyyy"||token=="yy"||token=="y"){
if(token=="yyyy"){
x=4;y=4;
}
if(token=="yy"){
x=2;y=2;
}
if(token=="y"){
x=2;y=4;
}
year=this.getInt(val,i_val,x,y);
if(year==null){
return null;
}
i_val+=year.length;
if(year.length==2){
if(year>70){
year=1900+(year-0);
}
else{
year=2000+(year-0);
}
}
}
else if(token=="MMM"||token=="NNN"){
month=0;
var names=(token=="MMM"?(Date.l10n.monthNames.concat(Date.l10n.monthAbbreviations)):Date.l10n.monthAbbreviations);
for(var i=0;i<names.length;i++){
var month_name=names[i];
if(val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()){
month=(i%12)+1;
i_val+=month_name.length;
break;
}
}
if((month<1)||(month>12)){
return null;
}
}
else if(token=="EE"||token=="E"){
var names=(token=="EE"?Date.l10n.dayNames:Date.l10n.dayAbbreviations);
for(var i=0;i<names.length;i++){
var day_name=names[i];
if(val.substring(i_val,i_val+day_name.length).toLowerCase()==day_name.toLowerCase()){
i_val+=day_name.length;
break;
}
}
}
else if(token=="MM"||token=="M"){
month=this.getInt(val,i_val,token.length,2);
if(month==null||(month<1)||(month>12)){
return null;
}
i_val+=month.length;
}
else if(token=="dd"||token=="d"){
date=this.getInt(val,i_val,token.length,2);
if(date==null||(date<1)||(date>31)){
return null;
}
i_val+=date.length;
}
else if(token=="hh"||token=="h"){
hh=this.getInt(val,i_val,token.length,2);
if(hh==null||(hh<1)||(hh>12)){
return null;
}
i_val+=hh.length;
}
else if(token=="HH"||token=="H"){
hh=this.getInt(val,i_val,token.length,2);
if(hh==null||(hh<0)||(hh>23)){
return null;
}
i_val+=hh.length;
}
else if(token=="KK"||token=="K"){
hh=this.getInt(val,i_val,token.length,2);
if(hh==null||(hh<0)||(hh>11)){
return null;
}
i_val+=hh.length;
hh++;
}
else if(token=="kk"||token=="k"){
hh=this.getInt(val,i_val,token.length,2);
if(hh==null||(hh<1)||(hh>24)){
return null;
}
i_val+=hh.length;
hh--;
}
else if(token=="mm"||token=="m"){
mm=this.getInt(val,i_val,token.length,2);
if(mm==null||(mm<0)||(mm>59)){
return null;
}
i_val+=mm.length;
}
else if(token=="ss"||token=="s"){
ss=this.getInt(val,i_val,token.length,2);
if(ss==null||(ss<0)||(ss>59)){
return null;
}
i_val+=ss.length;
}
else if(token=="A"){
if(val.substring(i_val,i_val+2).toLowerCase()=="am"){
ampm="AM";
}
else if(val.substring(i_val,i_val+2).toLowerCase()=="pm"){
ampm="PM";
}
else{
return null;
}
i_val+=2;
}
else{
if(val.substring(i_val,i_val+token.length)!=token){
return null;
}
else{
i_val+=token.length;
}
}
}

if(i_val!=val.length){
return null;
}

if(month==2){

if(((year%4==0)&&(year%100!=0))||(year%400==0)){
if(date>29){
return null;
}
}
else{
if(date>28){
return null;
}
}
}
if((month==4)||(month==6)||(month==9)||(month==11)){
if(date>30){
return null;
}
}

if(hh<12&&ampm=="PM"){
hh=hh-0+12;
}
else if(hh>11&&ampm=="AM"){
hh-=12;
}
return new Date(year,month-1,date,hh,mm,ss);
};

(function(){

function add(name,method){
if(!Date.prototype[name]){
Date.prototype[name]=method;
}
};

add('getFullYear',function(){
var yy=this.getYear();
return(yy<1900?yy+1900:yy);
});


add('isValid',function(val,format){
return(Date.parseString(val,format)!=null);
});


add('isBefore',function(date2){
if(date2==null){
return false;
}
return(this.getTime()<date2.getTime());
});


add('isAfter',function(date2){
if(date2==null){
return false;
}
return(this.getTime()>date2.getTime());
});


add('isBetween',function(date1,date2){
return this.isAfter(date1)&&this.isBefore(date2);
});


add('equals',function(date2){
if(date2==null){
return false;
}
return(this.getTime()==date2.getTime());
});


add('equalsIgnoreTime',function(date2){
if(date2==null){
return false;
}
var d1=new Date(this.getTime()).clearTime();
var d2=new Date(date2.getTime()).clearTime();
return(d1.getTime()==d2.getTime());
});


add('format',function(format){
format=format+"";
var result="";
var i_format=0;
var c="";
var token="";
var y=this.getYear()+"";
var M=this.getMonth()+1;
var d=this.getDate();
var E=this.getDay();
var H=this.getHours();
var m=this.getMinutes();
var s=this.getSeconds();
var w=this.getWeekOfYear();
var yyyy,yy,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;

var value=new Object();
if(y.length<4){
y=""+(+y+1900);
}
value["y"]=""+y;
value["yyyy"]=y;
value["yy"]=y.substring(2,4);
value["M"]=M;
value["MM"]=Date.LZ(M);
value["MMM"]=Date.l10n.monthNames[M-1];
value["NNN"]=Date.l10n.monthAbbreviations[M-1];
value["d"]=d;
value["dd"]=Date.LZ(d);
value["E"]=Date.l10n.dayAbbreviations[E];
value["EE"]=Date.l10n.dayNames[E];
value["e"]=value["E"].substr(0,1);
value["H"]=H;
value["HH"]=Date.LZ(H);
if(H==0){
value["h"]=12;
}
else if(H>12){
value["h"]=H-12;
}
else{
value["h"]=H;
}
value["hh"]=Date.LZ(value["h"]);
value["K"]=value["h"]-1;
value["k"]=value["H"]+1;
value["KK"]=Date.LZ(value["K"]);
value["kk"]=Date.LZ(value["k"]);
if(H>11){
value["A"]="PM";
value["a"]="pm";
}
else{
value["A"]="AM";
value["a"]="am";
}
value["m"]=m;
value["mm"]=Date.LZ(m);
value["s"]=s;
value["ss"]=Date.LZ(s);
value["w"]=w;
while(i_format<format.length){
c=format.charAt(i_format);
token="";
while((format.charAt(i_format)==c)&&(i_format<format.length)){
token+=format.charAt(i_format++);
}
if(typeof(value[token])!="undefined"){
result=result+value[token];
}
else{
result=result+token;
}
}
return result;
});


add('getDayName',function(){
return Date.l10n.dayNames[this.getDay()];
});


add('getDayAbbreviation',function(){
return Date.l10n.dayAbbreviations[this.getDay()];
});


add('getMonthName',function(){
return Date.l10n.monthNames[this.getMonth()];
});


add('getMonthAbbreviation',function(){
return Date.l10n.monthAbbreviations[this.getMonth()];
});


add("getWeekOfYear",function(){
dowOffset=Date.l10n.firstDayOfWeek;
var newYear=new Date(this.getFullYear(),0,1);
var day=newYear.getDay()-dowOffset;
day=(day>=0?day:day+7);
var daynum=Math.floor((this.getTime()-newYear.getTime()-
(this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000)+1;
var weeknum;

if(day<4){
weeknum=Math.floor((daynum+day-1)/7)+1;
if(weeknum>52){
nYear=new Date(this.getFullYear()+1,0,1);
nday=nYear.getDay()-dowOffset;
nday=nday>=0?nday:nday+7;

weeknum=nday<4?1:53;
}
}else{
weeknum=Math.floor((daynum+day-1)/7);
}
return weeknum;
});


add('toTimezone',function(timezoneOffset){
var minutesToMs=60000;var hoursToMs=60*minutesToMs;
var utcMs=this.getTime()+(this.getTimezoneOffset()*minutesToMs);
var offsetMs=hoursToMs*timezoneOffset;
return new Date(utcMs+offsetMs);
});


add('clearTime',function(){
this.setHours(0);
this.setMinutes(0);
this.setSeconds(0);
this.setMilliseconds(0);
return this;
});


add('clone',function(date){
if(date&&date instanceof Date){
date.setTime(this.getTime());
return date;
}else{
return new Date(this);
}
});


add('setDay',function(n){
var day=this.getDay();
if(day==n){return this;}
if(n==7){this.add('d',7);return this.setDay(0);}
if(day<n){this.add('d',1);return this.setDay(n);}
if(day>n){this.add('d',-1);return this.setDay(n);}
});


add('add',function(interval,number){
if(typeof(interval)=="undefined"||interval==null||typeof(number)=="undefined"||number==null){
return this;
}
number=+number;
if(interval=='y'){
this.setFullYear(this.getFullYear()+number);
}
else if(interval=='M'){
this.setMonth(this.getMonth()+number);
}
else if(interval=='d'){
this.setDate(this.getDate()+number);
}
else if(interval=='w'){
var step=(number>0)?1:-1;
while(number!=0){
this.add('d',step);
while(this.getDay()==0||this.getDay()==6){
this.add('d',step);
}
number-=step;
}
}
else if(interval=='h'){
this.setHours(this.getHours()+number);
}
else if(interval=='m'){
this.setMinutes(this.getMinutes()+number);
}
else if(interval=='s'){
this.setSeconds(this.getSeconds()+number);
}
return this;
});

})();


/* debug.js */



Timegrid.Debug=new Object();

Timegrid.Debug.log=function(msg){
};

Timegrid.Debug.exception=function(e){
e=$.getIsIE()?e.message:e;
$.debugException(e,"Caught exception");

};



/* dstructs.js */



DStructs={};

DStructs.Array=function(){

var x=[],a=arguments;
for(var i=0;i<a.length;i++){
if(a[i]instanceof Array){

}else{
x.push(a[i]);
}
}
for(var i in this){x[i]=this[i];}
return x;
};
DStructs.Array.prototype=new Array();


DStructs.Array.prototype.slice=function(start,end){
if(start<0){start=this.length+start;}
if(end==null){end=this.length;}
else if(end<0){end=this.length+end;}
var a=new DStructs.Array();
for(var i=start;i<end;i++){a.push(this[i]);}
return a;
};
DStructs.Array.prototype.concat=function(){
var arrays=arguments;
var result=this.clone();
for(var i=0;i<arrays.length;i++){
if(arrays[i]instanceof Array){
result.addAll(arrays[i]);
}
}
return result;
};
DStructs.Array.prototype.addAll=function(a){
for(var i=0;i<a.length;i++){
this.push(a[i]);
}
return this;
};
DStructs.Array.prototype.map_i=function(f){
var self=this;
return this.each(function(e,i){self[i]=f(e,i);});
};
DStructs.Array.prototype.map=function(f){
var clone=new DStructs.Array();
this.each(function(e,i){clone.push(f(e,i));});
return clone;
};
DStructs.Array.prototype.filter=function(f){
var clone=new DStructs.Array();
this.each(function(e,i){if(f(e,i)){clone.push(e);}});
return clone;
};
DStructs.Array.prototype.filter_i=function(f){

};
DStructs.Array.prototype.each=function(f){
for(var i=0;i<this.length;i++){
f(this[i],i);
}
return this;
};
DStructs.Array.prototype.reduce=function(init,f){
for(var i=0,len=this.length,result=init;i<len;i++){
result=f.call(this,result,this[i]);
}
return result;
};
DStructs.Array.prototype.zip=function(){

};
DStructs.Array.prototype.indexOf=function(obj){
var indices=this.indicesOf(obj);
if(!indices.empty()){return indices[0];}
return-1;
};
DStructs.Array.prototype.indicesOf=function(obj){
var indices=new DStructs.Array();
this.each(function(e,i){if(obj==e){indices.push(i);}});
return indices;
};
DStructs.Array.prototype.remove=function(obj){
var removed=0;
while(this.contains(obj)){
}
return removed;
};
DStructs.Array.prototype.contains=function(obj){
return this.indexOf(obj)>=0;
};
DStructs.Array.prototype.uniq_i=function(){
var hash=new DStructs.Hash();
var indices=new DStructs.Array();
var self=this;
this.each(function(e,i){
if(hash.contains(e)){
indices.push(i);
}else{
hash.put(e,i);
}
});
return this;
};
DStructs.Array.prototype.uniq=function(){
var hash=new DStructs.Hash();
this.each(function(e){hash.put(e,e);});
return hash.values();
};
DStructs.Array.prototype.empty=function(){
return this.length==0;
};
DStructs.Array.prototype.clear=function(){
this.length=0;
};
DStructs.Array.prototype.clone=function(){
var clone=new DStructs.Array();
this.each(function(e){clone.push(e);});
return clone;
};
DStructs.Array.prototype.iterator=function(){
return new DStructs.Iterator(this);
};

DStructs.Iterator=function(items){
var index=0;
this.hasNext=function(){
return index<items.length;
};
this.next=function(){
index++;
return items[index-1];
};
};


DStructs.Hash=function(){
var dataStore={};
var count;

this.put=function(key,value){
var success=!(key in dataStore);
dataStore[key]=value;
if(success){count++;}
return success;
};

this.contains=function(key){
return key in dataStore;
};

this.size=function(){
return count;
};

this.each=function(f){
for(var key in dataStore){
f(dataStore[key],key);
}
return this;
};

this.values=function(){
var values=new DStructs.Array();
this.each(function(v,k){values.push(v);});
return values;
};

this.keys=function(){
var keys=new DStructs.Array();
this.each(function(v,k){keys.push(k);});
return keys;
};

};


/* excanvas.pack.js */

if(!window.CanvasRenderingContext2D){(function(){var I=Math,i=I.round,L=I.sin,M=I.cos,m=10,A=m/2,Q={init:function(a){var b=a||document;if(/MSIE/.test(navigator.userAgent)&&!window.opera){var c=this;b.attachEvent("onreadystatechange",function(){c.r(b)})}},r:function(a){if(a.readyState=="complete"){if(!a.namespaces["s"]){a.namespaces.add("g_vml_","urn:schemas-microsoft-com:vml")}var b=a.createStyleSheet();b.cssText="canvas{display:inline-block;overflow:hidden;text-align:left;width:300px;height:150px}g_vml_\\:*{behavior:url(#default#VML)}";
var c=a.getElementsByTagName("canvas");for(var d=0;d<c.length;d++){if(!c[d].getContext){this.initElement(c[d])}}}},q:function(a){var b=a.outerHTML,c=a.ownerDocument.createElement(b);if(b.slice(-2)!="/>"){var d="/"+a.tagName,e;while((e=a.nextSibling)&&e.tagName!=d){e.removeNode()}if(e){e.removeNode()}}a.parentNode.replaceChild(c,a);return c},initElement:function(a){a=this.q(a);a.getContext=function(){if(this.l){return this.l}return this.l=new K(this)};a.attachEvent("onpropertychange",V);a.attachEvent("onresize",
W);var b=a.attributes;if(b.width&&b.width.specified){a.style.width=b.width.nodeValue+"px"}else{a.width=a.clientWidth}if(b.height&&b.height.specified){a.style.height=b.height.nodeValue+"px"}else{a.height=a.clientHeight}return a}};function V(a){var b=a.srcElement;switch(a.propertyName){case"width":b.style.width=b.attributes.width.nodeValue+"px";b.getContext().clearRect();break;case"height":b.style.height=b.attributes.height.nodeValue+"px";b.getContext().clearRect();break}}function W(a){var b=a.srcElement;
if(b.firstChild){b.firstChild.style.width=b.clientWidth+"px";b.firstChild.style.height=b.clientHeight+"px"}}Q.init();var R=[];for(var E=0;E<16;E++){for(var F=0;F<16;F++){R[E*16+F]=E.toString(16)+F.toString(16)}}function J(){return[[1,0,0],[0,1,0],[0,0,1]]}function G(a,b){var c=J();for(var d=0;d<3;d++){for(var e=0;e<3;e++){var g=0;for(var h=0;h<3;h++){g+=a[d][h]*b[h][e]}c[d][e]=g}}return c}function N(a,b){b.fillStyle=a.fillStyle;b.lineCap=a.lineCap;b.lineJoin=a.lineJoin;b.lineWidth=a.lineWidth;b.miterLimit=
a.miterLimit;b.shadowBlur=a.shadowBlur;b.shadowColor=a.shadowColor;b.shadowOffsetX=a.shadowOffsetX;b.shadowOffsetY=a.shadowOffsetY;b.strokeStyle=a.strokeStyle;b.d=a.d;b.e=a.e}function O(a){var b,c=1;a=String(a);if(a.substring(0,3)=="rgb"){var d=a.indexOf("(",3),e=a.indexOf(")",d+1),g=a.substring(d+1,e).split(",");b="#";for(var h=0;h<3;h++){b+=R[Number(g[h])]}if(g.length==4&&a.substr(3,1)=="a"){c=g[3]}}else{b=a}return[b,c]}function S(a){switch(a){case"butt":return"flat";case"round":return"round";
case"square":default:return"square"}}function K(a){this.a=J();this.m=[];this.k=[];this.c=[];this.strokeStyle="#000";this.fillStyle="#000";this.lineWidth=1;this.lineJoin="miter";this.lineCap="butt";this.miterLimit=m*1;this.globalAlpha=1;this.canvas=a;var b=a.ownerDocument.createElement("div");b.style.width=a.clientWidth+"px";b.style.height=a.clientHeight+"px";b.style.overflow="hidden";b.style.position="absolute";a.appendChild(b);this.j=b;this.d=1;this.e=1}var j=K.prototype;j.clearRect=function(){this.j.innerHTML=
"";this.c=[]};j.beginPath=function(){this.c=[]};j.moveTo=function(a,b){this.c.push({type:"moveTo",x:a,y:b});this.f=a;this.g=b};j.lineTo=function(a,b){this.c.push({type:"lineTo",x:a,y:b});this.f=a;this.g=b};j.bezierCurveTo=function(a,b,c,d,e,g){this.c.push({type:"bezierCurveTo",cp1x:a,cp1y:b,cp2x:c,cp2y:d,x:e,y:g});this.f=e;this.g=g};j.quadraticCurveTo=function(a,b,c,d){var e=this.f+0.6666666666666666*(a-this.f),g=this.g+0.6666666666666666*(b-this.g),h=e+(c-this.f)/3,l=g+(d-this.g)/3;this.bezierCurveTo(e,
g,h,l,c,d)};j.arc=function(a,b,c,d,e,g){c*=m;var h=g?"at":"wa",l=a+M(d)*c-A,n=b+L(d)*c-A,o=a+M(e)*c-A,f=b+L(e)*c-A;if(l==o&&!g){l+=0.125}this.c.push({type:h,x:a,y:b,radius:c,xStart:l,yStart:n,xEnd:o,yEnd:f})};j.rect=function(a,b,c,d){this.moveTo(a,b);this.lineTo(a+c,b);this.lineTo(a+c,b+d);this.lineTo(a,b+d);this.closePath()};j.strokeRect=function(a,b,c,d){this.beginPath();this.moveTo(a,b);this.lineTo(a+c,b);this.lineTo(a+c,b+d);this.lineTo(a,b+d);this.closePath();this.stroke()};j.fillRect=function(a,
b,c,d){this.beginPath();this.moveTo(a,b);this.lineTo(a+c,b);this.lineTo(a+c,b+d);this.lineTo(a,b+d);this.closePath();this.fill()};j.createLinearGradient=function(a,b,c,d){var e=new H("gradient");return e};j.createRadialGradient=function(a,b,c,d,e,g){var h=new H("gradientradial");h.n=c;h.o=g;h.i.x=a;h.i.y=b;return h};j.drawImage=function(a,b){var c,d,e,g,h,l,n,o,f=a.runtimeStyle.width,k=a.runtimeStyle.height;a.runtimeStyle.width="auto";a.runtimeStyle.height="auto";var q=a.width,r=a.height;a.runtimeStyle.width=
f;a.runtimeStyle.height=k;if(arguments.length==3){c=arguments[1];d=arguments[2];h=(l=0);n=(e=q);o=(g=r)}else if(arguments.length==5){c=arguments[1];d=arguments[2];e=arguments[3];g=arguments[4];h=(l=0);n=q;o=r}else if(arguments.length==9){h=arguments[1];l=arguments[2];n=arguments[3];o=arguments[4];c=arguments[5];d=arguments[6];e=arguments[7];g=arguments[8]}else{throw"Invalid number of arguments";}var s=this.b(c,d),t=[],v=10,w=10;t.push(" <g_vml_:group",' coordsize="',m*v,",",m*w,'"',' coordorigin="0,0"',
' style="width:',v,";height:",w,";position:absolute;");if(this.a[0][0]!=1||this.a[0][1]){var x=[];x.push("M11='",this.a[0][0],"',","M12='",this.a[1][0],"',","M21='",this.a[0][1],"',","M22='",this.a[1][1],"',","Dx='",i(s.x/m),"',","Dy='",i(s.y/m),"'");var p=s,y=this.b(c+e,d),z=this.b(c,d+g),B=this.b(c+e,d+g);p.x=Math.max(p.x,y.x,z.x,B.x);p.y=Math.max(p.y,y.y,z.y,B.y);t.push("padding:0 ",i(p.x/m),"px ",i(p.y/m),"px 0;filter:progid:DXImageTransform.Microsoft.Matrix(",x.join(""),", sizingmethod='clip');")}else{t.push("top:",
i(s.y/m),"px;left:",i(s.x/m),"px;")}t.push(' ">','<g_vml_:image src="',a.src,'"',' style="width:',m*e,";"," height:",m*g,';"',' cropleft="',h/q,'"',' croptop="',l/r,'"',' cropright="',(q-h-n)/q,'"',' cropbottom="',(r-l-o)/r,'"'," />","</g_vml_:group>");this.j.insertAdjacentHTML("BeforeEnd",t.join(""))};j.stroke=function(a){var b=[],c=O(a?this.fillStyle:this.strokeStyle),d=c[0],e=c[1]*this.globalAlpha,g=10,h=10;b.push("<g_vml_:shape",' fillcolor="',d,'"',' filled="',Boolean(a),'"',' style="position:absolute;width:',
g,";height:",h,';"',' coordorigin="0 0" coordsize="',m*g," ",m*h,'"',' stroked="',!a,'"',' strokeweight="',this.lineWidth,'"',' strokecolor="',d,'"',' path="');var l={x:null,y:null},n={x:null,y:null};for(var o=0;o<this.c.length;o++){var f=this.c[o];if(f.type=="moveTo"){b.push(" m ");var k=this.b(f.x,f.y);b.push(i(k.x),",",i(k.y))}else if(f.type=="lineTo"){b.push(" l ");var k=this.b(f.x,f.y);b.push(i(k.x),",",i(k.y))}else if(f.type=="close"){b.push(" x ")}else if(f.type=="bezierCurveTo"){b.push(" c ");
var k=this.b(f.x,f.y),q=this.b(f.cp1x,f.cp1y),r=this.b(f.cp2x,f.cp2y);b.push(i(q.x),",",i(q.y),",",i(r.x),",",i(r.y),",",i(k.x),",",i(k.y))}else if(f.type=="at"||f.type=="wa"){b.push(" ",f.type," ");var k=this.b(f.x,f.y),s=this.b(f.xStart,f.yStart),t=this.b(f.xEnd,f.yEnd);b.push(i(k.x-this.d*f.radius),",",i(k.y-this.e*f.radius)," ",i(k.x+this.d*f.radius),",",i(k.y+this.e*f.radius)," ",i(s.x),",",i(s.y)," ",i(t.x),",",i(t.y))}if(k){if(l.x==null||k.x<l.x){l.x=k.x}if(n.x==null||k.x>n.x){n.x=k.x}if(l.y==
null||k.y<l.y){l.y=k.y}if(n.y==null||k.y>n.y){n.y=k.y}}}b.push(' ">');if(typeof this.fillStyle=="object"){var v={x:"50%",y:"50%"},w=n.x-l.x,x=n.y-l.y,p=w>x?w:x;v.x=i(this.fillStyle.i.x/w*100+50)+"%";v.y=i(this.fillStyle.i.y/x*100+50)+"%";var y=[];if(this.fillStyle.p=="gradientradial"){var z=this.fillStyle.n/p*100,B=this.fillStyle.o/p*100-z}else{var z=0,B=100}var C={offset:null,color:null},D={offset:null,color:null};this.fillStyle.h.sort(function(T,U){return T.offset-U.offset});for(var o=0;o<this.fillStyle.h.length;o++){var u=
this.fillStyle.h[o];y.push(u.offset*B+z,"% ",u.color,",");if(u.offset>C.offset||C.offset==null){C.offset=u.offset;C.color=u.color}if(u.offset<D.offset||D.offset==null){D.offset=u.offset;D.color=u.color}}y.pop();b.push("<g_vml_:fill",' color="',D.color,'"',' color2="',C.color,'"',' type="',this.fillStyle.p,'"',' focusposition="',v.x,", ",v.y,'"',' colors="',y.join(""),'"',' opacity="',e,'" />')}else if(a){b.push('<g_vml_:fill color="',d,'" opacity="',e,'" />')}else{b.push("<g_vml_:stroke",' opacity="',
e,'"',' joinstyle="',this.lineJoin,'"',' miterlimit="',this.miterLimit,'"',' endcap="',S(this.lineCap),'"',' weight="',this.lineWidth,'px"',' color="',d,'" />')}b.push("</g_vml_:shape>");this.j.insertAdjacentHTML("beforeEnd",b.join(""));this.c=[]};j.fill=function(){this.stroke(true)};j.closePath=function(){this.c.push({type:"close"})};j.b=function(a,b){return{x:m*(a*this.a[0][0]+b*this.a[1][0]+this.a[2][0])-A,y:m*(a*this.a[0][1]+b*this.a[1][1]+this.a[2][1])-A}};j.save=function(){var a={};N(this,a);
this.k.push(a);this.m.push(this.a);this.a=G(J(),this.a)};j.restore=function(){N(this.k.pop(),this);this.a=this.m.pop()};j.translate=function(a,b){var c=[[1,0,0],[0,1,0],[a,b,1]];this.a=G(c,this.a)};j.rotate=function(a){var b=M(a),c=L(a),d=[[b,c,0],[-c,b,0],[0,0,1]];this.a=G(d,this.a)};j.scale=function(a,b){this.d*=a;this.e*=b;var c=[[a,0,0],[0,b,0],[0,0,1]];this.a=G(c,this.a)};j.clip=function(){};j.arcTo=function(){};j.createPattern=function(){return new P};function H(a){this.p=a;this.n=0;this.o=
0;this.h=[];this.i={x:0,y:0}}H.prototype.addColorStop=function(a,b){b=O(b);this.h.push({offset:1-a,color:b})};function P(){}G_vmlCanvasManager=Q;CanvasRenderingContext2D=K;CanvasGradient=H;CanvasPattern=P})()};


/* jquery.corner.js */




(function($){

var _corner=function(options){


var testcanvas=document.createElement("canvas");
if(typeof G_vmlCanvasManager=='undefined'&&$.browser.msie){
return this.each(function(){});
}


var asNum=function(a,b){return a-b;};
var getMin=function(a){
var b=a.concat();
return b.sort(asNum)[0];
};


var getCSSint=function(el,prop){
return parseInt($.css(el.jquery?el[0]:el,prop))||0;
};


var drawRoundCornerCanvasShape=function(canvas,radius,r_type,bg_color,border_width,border_color){


var reg=/^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
var bits=reg.exec(bg_color);
if(bits){
channels=new Array(parseInt(bits[1]),parseInt(bits[2]),parseInt(bits[3]));
bg_color='rgb('+channels[0]+', '+channels[1]+', '+channels[2]+')';
}

var border_width=parseInt(border_width);

var ctx=canvas.getContext('2d');

if(radius==1){
ctx.fillStyle=bg_color;
ctx.fillRect(0,0,1,1);
return;
}

if(r_type=='tl'){
var steps=new Array(0,0,radius,0,radius,0,0,radius,0,0);
}else if(r_type=='tr'){
var steps=new Array(radius,0,radius,radius,radius,0,0,0,0,0);
}else if(r_type=='bl'){
var steps=new Array(0,radius,radius,radius,0,radius,0,0,0,radius);
}else if(r_type=='br'){
var steps=new Array(radius,radius,radius,0,radius,0,0,radius,radius,radius);
}

ctx.fillStyle=bg_color;
ctx.beginPath();
ctx.moveTo(steps[0],steps[1]);
ctx.lineTo(steps[2],steps[3]);
if(r_type=='br')ctx.bezierCurveTo(steps[4],steps[5],radius,radius,steps[6],steps[7]);
else ctx.bezierCurveTo(steps[4],steps[5],0,0,steps[6],steps[7]);
ctx.lineTo(steps[8],steps[9]);
ctx.fill();


if(border_width>0&&border_width<radius){


var offset=border_width/2;

if(r_type=='tl'){
var steps=new Array(radius-offset,offset,radius-offset,offset,offset,radius-offset);
var curve_to=new Array(0,0);
}else if(r_type=='tr'){
var steps=new Array(radius-offset,radius-offset,radius-offset,offset,offset,offset);
var curve_to=new Array(0,0);
}else if(r_type=='bl'){
var steps=new Array(radius-offset,radius-offset,offset,radius-offset,offset,offset,offset,radius-offset);
var curve_to=new Array(0,0);
}else if(r_type=='br'){
var steps=new Array(radius-offset,offset,radius-offset,offset,offset,radius-offset,radius-offset,radius-offset);
var curve_to=new Array(radius,radius);
}

ctx.strokeStyle=border_color;
ctx.lineWidth=border_width;
ctx.beginPath();

ctx.moveTo(steps[0],steps[1]);

ctx.bezierCurveTo(steps[2],steps[3],curve_to[0],curve_to[1],steps[4],steps[5]);
ctx.stroke();

}
};

var creatCanvas=function(p,radius){
var elm=document.createElement('canvas');
elm.setAttribute("height",radius);
elm.setAttribute("width",radius);
elm.style.display="block";
elm.style.position="absolute";
elm.className="cornercanvas";
elm=p.appendChild(elm);

if(!elm.getContext&&typeof G_vmlCanvasManager!='undefined'){
var elm=G_vmlCanvasManager.initElement(elm);
}
return elm;
};


var o=(options||"").toLowerCase();
var radius=parseInt((o.match(/(\d+)px/)||[])[1])||null;
var bg_color=((o.match(/(#[0-9a-f]+)/)||[])[1]);
if(radius==null){radius="auto";}

var edges={T:0,B:1};
var opts={
tl:/top|tl/.test(o),
tr:/top|tr/.test(o),
bl:/bottom|bl/.test(o),
br:/bottom|br/.test(o)
};
if(!opts.tl&&!opts.tr&&!opts.bl&&!opts.br){
opts={tl:1,tr:1,bl:1,br:1};
}

return this.each(function(){

var elm=$(this);


if($.browser.msie){this.style.zoom=1;}


var widthheight_smallest=getMin(new Array(getCSSint(this,'height'),getCSSint(this,'width')));
if(radius=="auto"){
radius=widthheight_smallest/4;
if(radius>10){radius=10;}
}


if(widthheight_smallest<radius){
radius=(widthheight_smallest/2);
}


elm.children("canvas.cornercanvas").remove();


if(elm.css('position')=='static'){
elm.css('position','relative');

}else if(elm.css('position')=='fixed'&&$.browser.msie&&!(document.compatMode=='CSS1Compat'&&typeof document.body.style.maxHeight!="undefined")){
elm.css('position','absolute');
}
elm.css('overflow','visible');


var border_t=getCSSint(this,'borderTopWidth');
var border_r=getCSSint(this,'borderRightWidth');
var border_b=getCSSint(this,'borderBottomWidth');
var border_l=getCSSint(this,'borderLeftWidth');


var bordersWidth=new Array();
if(opts.tl||opts.tr){bordersWidth.push(border_t);}
if(opts.br||opts.tr){bordersWidth.push(border_r);}
if(opts.br||opts.bl){bordersWidth.push(border_b);}
if(opts.bl||opts.tl){bordersWidth.push(border_l);}

borderswidth_smallest=getMin(bordersWidth);


var p_top=0-border_t;
var p_right=0-border_r;
var p_bottom=0-border_b;
var p_left=0-border_l;

if(opts.tl){var tl=$(creatCanvas(this,radius)).css({left:p_left,top:p_top}).get(0);}
if(opts.tr){var tr=$(creatCanvas(this,radius)).css({right:p_right,top:p_top}).get(0);}
if(opts.bl){var bl=$(creatCanvas(this,radius)).css({left:p_left,bottom:p_bottom}).get(0);}
if(opts.br){var br=$(creatCanvas(this,radius)).css({right:p_right,bottom:p_bottom}).get(0);}



if(bg_color==undefined){

var current_p=elm.parent();
var bg=current_p.css('background-color');
while((bg=="transparent"||bg=="rgba(0, 0, 0, 0)")&&current_p.get(0).tagName.toLowerCase()!="html"){
bg=current_p.css('background-color');
current_p=current_p.parent();
}
}else{
bg=bg_color;
}

if(bg=="transparent"||bg=="rgba(0, 0, 0, 0)"){bg="#ffffff";}

if(opts.tl){drawRoundCornerCanvasShape(tl,radius,'tl',bg,borderswidth_smallest,elm.css('borderTopColor'));}
if(opts.tr){drawRoundCornerCanvasShape(tr,radius,'tr',bg,borderswidth_smallest,elm.css('borderTopColor'));}
if(opts.bl){drawRoundCornerCanvasShape(bl,radius,'bl',bg,borderswidth_smallest,elm.css('borderBottomColor'));}
if(opts.br){drawRoundCornerCanvasShape(br,radius,'br',bg,borderswidth_smallest,elm.css('borderBottomColor'));}

elm.addClass('roundCornersParent');

});
};

if($.browser.msie&&typeof G_vmlCanvasManager=='undefined'){

var corner_buffer=new Array();
var corner_buffer_args=new Array();

$.fn.corner=function(options){
corner_buffer[corner_buffer.length]=this;
corner_buffer_args[corner_buffer_args.length]=options;
return this.each(function(){});
};


document.execCommand("BackgroundImageCache",false,true);
var elm=$("script[@src*=jquery.corner.]");
if(elm.length==1){
var jc_src=elm.attr('src');
var pathArray=jc_src.split('/');
pathArray.pop();
var base=pathArray.join('/')||'.';
var excanvasjs=base+'/excanvas.pack.js';
$.getScript(excanvasjs,function(){
execbuffer();
});
}

var execbuffer=function(){

$.fn.corner=_corner;

for(var i=0;i<corner_buffer.length;i++){
corner_buffer[i].corner(corner_buffer_args[i]);
}
corner_buffer=null;
corner_buffer_args=null;
}

}else{
$.fn.corner=_corner;
}

})(jQuery);


/* jquery.prettybox.js */

(function($){
var createCanvas=function(){
var canvas=document.createElement("canvas");
if("G_vmlCanvasManager"in window){
document.body.appendChild(canvas);
canvas=G_vmlCanvasManager.initElement(canvas);
}
return canvas;
};
var DropShadow=function(backgroundColor,cornerRadius,shadowRadius,shadowOffset,shadowAlpha){
this.backgroundColor=backgroundColor;
this.cornerRadius=cornerRadius;
this.shadowRadius=Math.max(cornerRadius,shadowRadius);
this.shadowOffset=shadowOffset;
this.shadowAlpha=shadowAlpha;

this.elmt=createCanvas();
this.elmt.style.position="absolute";
};

DropShadow.prototype={
draw:function(){
var darkColor="rgba(128,128,128,"+this.shadowAlpha+")";
var lightColor="rgba(128,128,128,0)";

var cornerRadius=this.cornerRadius;
var shadowRadius=this.shadowRadius;
var radiusDiff=shadowRadius-cornerRadius;
var innerWidth=this.width-2*cornerRadius;
var innerHeight=this.height-2*cornerRadius;

var ctx=this.elmt.getContext("2d");
ctx.translate(this.shadowRadius,this.shadowRadius);
ctx.globalCompositeOperation="copy";


ctx.fillStyle=darkColor;
ctx.fillRect(-cornerRadius,-cornerRadius,this.width,this.height);


if(true){

ctx.fillStyle=this._createRadialGradient(ctx,0,0,cornerRadius,shadowRadius,darkColor,lightColor);
ctx.fillRect(-shadowRadius,-shadowRadius,shadowRadius,shadowRadius);


ctx.fillStyle=this._createRadialGradient(ctx,innerWidth,0,cornerRadius,shadowRadius,darkColor,lightColor);
ctx.fillRect(innerWidth,-shadowRadius,shadowRadius,shadowRadius);


ctx.fillStyle=this._createRadialGradient(ctx,innerWidth,innerHeight,cornerRadius,shadowRadius,darkColor,lightColor);
ctx.fillRect(innerWidth,innerHeight,shadowRadius,shadowRadius);


ctx.fillStyle=this._createRadialGradient(ctx,0,innerHeight,cornerRadius,shadowRadius,darkColor,lightColor);
ctx.fillRect(-shadowRadius,innerHeight,shadowRadius,shadowRadius);
}


if(true){

ctx.fillStyle=this._createLinearGradient(ctx,0,-cornerRadius,0,-shadowRadius,darkColor,lightColor);
ctx.fillRect(0,-shadowRadius,innerWidth,radiusDiff);


ctx.fillStyle=this._createLinearGradient(ctx,innerWidth+cornerRadius,0,innerWidth+shadowRadius,0,darkColor,lightColor);
ctx.fillRect(innerWidth+cornerRadius,0,radiusDiff,innerHeight);


ctx.fillStyle=this._createLinearGradient(ctx,0,innerHeight+cornerRadius,0,innerHeight+shadowRadius,darkColor,lightColor);
ctx.fillRect(0,innerHeight+cornerRadius,innerWidth,radiusDiff);


ctx.fillStyle=this._createLinearGradient(ctx,-radiusDiff,0,-shadowRadius,0,darkColor,lightColor);
ctx.fillRect(-shadowRadius,0,radiusDiff,innerHeight);
}


if(true){
ctx.translate(-this.shadowOffset,-this.shadowOffset);

var curvy=0.5;

ctx.moveTo(-cornerRadius,0);
ctx.bezierCurveTo(
-cornerRadius,-cornerRadius*(1-curvy),
-cornerRadius*(1-curvy),-cornerRadius,
0,-cornerRadius);

ctx.lineTo(innerWidth,-cornerRadius);
ctx.bezierCurveTo(
innerWidth+cornerRadius*(1-curvy),-cornerRadius,
innerWidth+cornerRadius,-cornerRadius*(1-curvy),
innerWidth+cornerRadius,0);

ctx.lineTo(innerWidth+cornerRadius,innerHeight);
ctx.bezierCurveTo(
innerWidth+cornerRadius,innerHeight+cornerRadius*(1-curvy),
innerWidth+cornerRadius*(1-curvy),innerHeight+cornerRadius,
innerWidth,innerHeight+cornerRadius);

ctx.lineTo(0,innerHeight+cornerRadius);
ctx.bezierCurveTo(
-cornerRadius*(1-curvy),innerHeight+cornerRadius,
-cornerRadius,innerHeight+cornerRadius*(1-curvy),
-cornerRadius,innerHeight);

ctx.closePath();

ctx.fillStyle=this.backgroundColor;
ctx.fill();
}
},
move:function(left,top,width,height){
this.left=left;
this.top=top;
this.width=width;
this.height=height;

var radiusDiff=this.shadowRadius-this.cornerRadius;
var elmt=this.elmt;
elmt.style.top=(this.top-radiusDiff+this.shadowOffset)+"px";
elmt.style.left=(this.left-radiusDiff+this.shadowOffset)+"px";
elmt.style.width=(this.width+2*radiusDiff)+"px";
elmt.style.height=(this.height+2*radiusDiff)+"px";
elmt.width=this.width+2*radiusDiff;
elmt.height=this.height+2*radiusDiff;

this.draw();
},
_createRadialGradient:function(ctx,x,y,r1,r2,darkColor,lightColor){
var g=ctx.createRadialGradient(x,y,r1,x,y,r2);
g.addColorStop(0,darkColor);
g.addColorStop(1,lightColor);
return g;
},
_createLinearGradient:function(ctx,x1,y1,x2,y2,darkColor,lightColor){
var g=ctx.createLinearGradient(x1,y1,x2,y2);
g.addColorStop(0,darkColor);
g.addColorStop(1,lightColor);
return g;
}
};

$.fn.extend({
prettybox:function(cornerRadius,shadowRadius,shadowOffset,shadowAlpha){
this.each(function(){
var elem=$(this);
var bgColor=elem.css('background-color');
var positions=elem.position();
var pbox=new DropShadow(bgColor,cornerRadius,shadowRadius,
shadowOffset,shadowAlpha);
elem.parent().append(pbox.elmt);
pbox.move(positions.left,positions.top,
elem.outerWidth(),elem.outerHeight());
elem.css('background','transparent');
elem.css('border','0px');
});
return this;
}
});

})(jQuery);


/* controls.js */



Timegrid.Controls={};


Timegrid.Controls.Panel=function(layouts,params){
this._layouts=layouts;
this._titles=$.map(this._layouts,function(l){return l.title;});
this._tabSet=new Timegrid.Controls.TabSet(this._titles,this._layouts);
};

Timegrid.Controls.Panel.prototype.setLayouts=function(layouts){
this._layouts=layouts;
this._titles=$.map(this._layouts,function(l){return l.title;});
this._tabSet.setLayouts(this._titles,this._layouts);
};

Timegrid.Controls.Panel.prototype.render=function(container){
this._tabSet.render(container);
this._tabSet.switchTo(this._tabSet.current||this._titles[0]);
};

Timegrid.Controls.Panel.prototype.renderChanged=function(){
this._tabSet.renderChanged();
this._tabSet.switchTo(this._tabSet.current||this._titles[0]);
};


Timegrid.Controls.TabSet=function(titles,layouts){
this.setLayouts(titles,layouts);
this.current="";
};

Timegrid.Controls.TabSet.prototype.setLayouts=function(titles,layouts){
this._tabs={};
this._renderedLayouts={};
this._iterators={};
this._layoutMap={};
for(var i=0;i<titles.length;i++){
this._layoutMap[titles[i]]=layouts[i];
}
};

Timegrid.Controls.TabSet.prototype.render=function(container){
this._container=container;
var self=this;
var tabDiv=$('<div></div>').addClass('timegrid-tabs');
$(container).prepend(tabDiv);
var makeCallback=function(title){
return function(){self.switchTo(title);};
};
for(var lTitle in this._layoutMap){
$newLink=$("<a />",{
href:undefined,
text:lTitle
});

$tab=$('<div></div>',{height:this._layoutMap[lTitle].tabHeight+"px"})
.addClass("timegrid-tab")
.addClass('timegrid-rounded')
.append($newLink);

$tab.click(makeCallback(lTitle));

tabDiv.prepend($tab);
this._tabs[lTitle]=$tab;
}
if(!$.browser.msie){$('.timegrid-tab').corner("30px top");}
};

Timegrid.Controls.TabSet.prototype.renderChanged=function(){
var layout=this._layoutMap[this.current];
layout.renderChanged();
};

Timegrid.Controls.TabSet.prototype.switchTo=function(title){
if(this.current&&this._renderedLayouts[this.current]){
this._renderedLayouts[this.current].hide();
this._tabs[this.current].removeClass('timegrid-tab-active');
}
if(this._renderedLayouts[title]){
this._renderedLayouts[title].show();
}else if(this._layoutMap[title]){
this._renderedLayouts[title]=$(this._layoutMap[title].render(this._container)).show();
}
if(this._iDiv){$(this._iDiv).empty();}
if(this._layoutMap[title].iterable){
if(!this._iterators[title]){
this._iterators[title]=new Timegrid.Controls.Iterator(this._layoutMap[title]);
this._iDiv=$(this._iterators[title].render(this._container));
}else{
this._iDiv=$(this._iterators[title].render());
}
}
this.current=title;
this._tabs[this.current].addClass('timegrid-tab-active');
};


Timegrid.Controls.Iterator=function(layout){
this._layout=layout;
};

Timegrid.Controls.Iterator.prototype.render=function(container){
if(container){
this._container=container;
this._div=$('<div></div>').addClass('timegrid-iterator');
$(this._container).prepend(this._div);
}else{
this._div.empty();
}
var self=this;
var makePrevCallback=function(layout){
return function(){
layout.goPrevious();
self.render();
};
};
var makeNextCallback=function(layout){
return function(){
layout.goNext();
self.render();
};
};
$imageURL=Timegrid.urlPrefix+"images/go-previous.png";
$prevLink=$('<a></a>',{href:undefined})
.addClass('timegrid-iterator-prev')
.append($('<img />',{alt:"Previous",src:$imageURL}));
$imageURL=Timegrid.urlPrefix+"images/go-next.png";
$nextLink=$('<a></a>',{href:undefined})
.addClass('timegrid-iterator-next')
.append($('<img />',{alt:"Next",src:$imageURL}));
$nextLink.click(makeNextCallback(this._layout));
this._div.append($prevLink);
this._div.append($nextLink);
this._div.append($('<span></span>',{text:this._layout.getCurrent()}));
return this._div;
};


/* grid.js */



Timegrid.Grid=function(objs,xSize,ySize,xMapper,yMapper){
Timegrid.Grid.superclass.call(this);

this.grid=new Array(xSize);
for(i=0;i<xSize;i++){
this.grid[i]=new Array(ySize);
for(j=0;j<ySize;j++){
this.grid[i][j]=[];
}
}
this.xMapper=xMapper;
this.yMapper=yMapper;
this.size=0;

this.addAll(objs);
};
$.inherit(Timegrid.Grid,Timegrid.ListenerAware);

Timegrid.Grid.prototype.add=function(obj){
var x=this.xMapper(obj);
var y=this.yMapper(obj);
this.get(x,y).push(obj);
this.size++;
};

Timegrid.Grid.prototype.addAll=function(objs){
for(i in objs){this.add(objs[i]);}
};

Timegrid.Grid.prototype.remove=function(obj){
var x=this.xMapper(obj);
var y=this.yMapper(obj);
var objs=this.get(x,y);
for(i=0;i<objs.length;i++){
if(obj==objs[i]){
objs.splice(i,1);
this.size--;
return true;
}
}
return false;
};

Timegrid.Grid.prototype.get=function(x,y){
return this.grid[x][y];
};

Timegrid.Grid.prototype.getSize=function(){
return this.size;
};


/* labellers.js */



Timegrid.GregorianDateLabeller=function(locale,timeZone){
this._locale=locale;
this._timeZone=timeZone;
};

Timegrid.GregorianDateLabeller.monthNames=[];
Timegrid.GregorianDateLabeller.dayNames=[];
Timegrid.GregorianDateLabeller.labelIntervalFunctions=[];

Timegrid.GregorianDateLabeller.getMonthName=function(month,locale){
return Timegrid.GregorianDateLabeller.monthNames[locale][month];
};

Timegrid.GregorianDateLabeller.prototype.labelInterval=function(date,intervalUnit){
var f=Timegrid.GregorianDateLabeller.labelIntervalFunctions[this._locale];
if(f==null){
f=Timegrid.GregorianDateLabeller.prototype.defaultLabelInterval;
}
return f.call(this,date,intervalUnit);
};

Timegrid.GregorianDateLabeller.prototype.labelPrecise=function(date){
return SimileAjax.DateTime.removeTimeZoneOffset(
date,
this._timeZone
).toUTCString();
};

Timegrid.GregorianDateLabeller.prototype.defaultLabelInterval=function(date,intervalUnit){
var text;
var emphasized=false;

date=SimileAjax.DateTime.removeTimeZoneOffset(date,this._timeZone);

switch(intervalUnit){
case SimileAjax.DateTime.MILLISECOND:
text=date.getUTCMilliseconds();
break;
case SimileAjax.DateTime.SECOND:
text=date.getUTCSeconds();
break;
case SimileAjax.DateTime.MINUTE:
var m=date.getUTCMinutes();
if(m==0){
text=date.getUTCHours()+":00";
emphasized=true;
}else{
text=m;
}
break;
case SimileAjax.DateTime.HOUR:
text=date.getUTCHours()+"hr";
break;
case SimileAjax.DateTime.DAY:
text=Timegrid.GregorianDateLabeller.getMonthName(date.getUTCMonth(),this._locale)+" "+date.getUTCDate();
break;
case SimileAjax.DateTime.WEEK:
text=Timegrid.GregorianDateLabeller.getMonthName(date.getUTCMonth(),this._locale)+" "+date.getUTCDate();
break;
case SimileAjax.DateTime.MONTH:
var m=date.getUTCMonth();
if(m!=0){
text=Timegrid.GregorianDateLabeller.getMonthName(m,this._locale);
break;
}
case SimileAjax.DateTime.YEAR:
case SimileAjax.DateTime.DECADE:
case SimileAjax.DateTime.CENTURY:
case SimileAjax.DateTime.MILLENNIUM:
var y=date.getUTCFullYear();
if(y>0){
text=date.getUTCFullYear();
}else{
text=(1-y)+"BC";
}
emphasized=
(intervalUnit==SimileAjax.DateTime.MONTH)||
(intervalUnit==SimileAjax.DateTime.DECADE&&y%100==0)||
(intervalUnit==SimileAjax.DateTime.CENTURY&&y%1000==0);
break;
default:
text=date.toUTCString();
}
return{text:text,emphasized:emphasized};
}



/* layout.js */




Timegrid.LayoutFactory=function(){};

Timegrid.LayoutFactory._constructors={};


Timegrid.LayoutFactory.registerLayout=function(name,constructor){
$.inherit(constructor,Timegrid.Layout);
Timegrid.LayoutFactory._constructors[name]=constructor;
};


Timegrid.LayoutFactory.createLayout=function(name,eventSource,params){
var constructor=Timegrid.LayoutFactory._constructors[name];
if(typeof constructor=='function'){
layout=new constructor(eventSource,$.deepClone(params));
return layout;
}else{
throw"No such layout!";
};
return;
};


Timegrid.Layout=function(eventSource,params){
var self=this;

this.params=params;

this.xSize=0;

this.ySize=0;

this.timezoneMapper=function(date){
if(typeof self.timezoneoffset!="undefined"){
return date.toTimezone(self.timezoneoffset);
}
return date;
};

this.xMapper=function(obj){return self.timezoneMapper(obj.time);};

this.yMapper=function(obj){return self.timezoneMapper(obj.time);};

this.xLabelHeight=24;

this.yLabelWidth=48;

this.tabHeight=18;
};


Timegrid.Layout.prototype.configure=function(params){
for(var attr in params){
this[attr]=params[attr.toLowerCase()];
}
};


Timegrid.Layout.prototype.computeCellSizes=function(){

this.xCell=this.params.xCell||this.params.xcell||
(this.gridwidth-1)/this.xSize;
this.yCell=this.params.yCell||this.params.ycell||
(this.gridheight-1)/this.ySize;
if(this.params.yCell||this.params.ycell){
this.gridheight=this.yCell*this.ySize;
}
if(this.params.xCell||this.params.xcell){
this.gridwidth=this.xCell*this.xSize;
}
};


Timegrid.Layout.prototype.render=function(container){
if(this.mini){
this.scrollwidth=0;
this.tabHeight=0;
this.xLabelHeight=24;
this.yLabelWidth=24;
}
if(!(this.params.height&&this.params.gridheight)){
this.scrollwidth=0;
}
if(container){
this._container=container;
this._viewDiv=$("<div media='print'></div>").addClass('timegrid-view print')
.css('top',this.tabHeight+"px");
$(this._container).append(this._viewDiv);
}else{
this._viewDiv.empty();
}
var gridDiv=$('<div></div>').addClass('timegrid-grid');
var gridWindowDiv=$('<div></div>').addClass('timegrid-grid-window');
if(!this.scrollwidth){gridWindowDiv.css('overflow','visible');}

if(!this.params.height){
this.height=this._container.style.height?
$(this._container).height():3+this.scrollwidth+this.tabHeight
+this.xLabelHeight+
(this.gridheight||500);
}
$(this._container).height(this.height+"px");
if(!this.params.width){
this.width=this.params.gridwidth||$(this._container).width();
}else{
$(this._container).width(this.width+"px");
}
$(this._container).css('position','relative');
this._viewDiv.height(this.height-this.tabHeight+"px");

gridWindowDiv.css("top",this.xLabelHeight).css("left",this.yLabelWidth)
.css("right","0px").css("bottom","0px");
this._viewDiv.append(gridWindowDiv.append(gridDiv));

var windowHeight=this._viewDiv.height()-gridWindowDiv.position().top-2;
var windowWidth=this._viewDiv.width()-gridWindowDiv.position().left-2;
gridWindowDiv.height(windowHeight).width(windowWidth);

this.gridwidth=this.gridwidth||gridWindowDiv.width()-this.scrollwidth;
this.gridheight=this.gridheight||gridWindowDiv.height()-this.scrollwidth;
gridDiv.height(this.gridheight+"px").width(this.gridwidth+"px");
this.computeCellSizes();
this._gridDiv=gridDiv;
gridDiv.append(this.renderEvents(document));
gridDiv.append(this.renderGridlines(document));
var xLabels=this.renderXLabels();
var yLabels=this.renderYLabels();
var syncHorizontalScroll=function(a,b){
$(a).scroll(function(){b.scrollLeft=a.scrollLeft;});
$(b).scroll(function(){a.scrollLeft=b.scrollLeft;});
};
var syncVerticalScroll=function(a,b){
$(a).scroll(function(){b.scrollTop=a.scrollTop;});
$(b).scroll(function(){a.scrollTop=b.scrollTop;});
};
syncVerticalScroll(yLabels,gridWindowDiv.get(0));
syncHorizontalScroll(xLabels,gridWindowDiv.get(0));
this._viewDiv.append(xLabels).append(yLabels);

if(!this.mini){
if($.browser.msie){
$('.timegrid-view:visible .timegrid-rounded-shadow',
this._container).prettybox(4,0,0,1);
}else{
$('.timegrid-view:visible .timegrid-rounded-shadow',
this._container).prettybox(4,7,1,0.7);
}
}

return this._viewDiv.get(0);
};

Timegrid.Layout.prototype.renderChanged=function(){
this.initializeGrid();
this._gridDiv.empty();
this._gridDiv.append(this.renderEvents(document));
this._gridDiv.append(this.renderGridlines(document));
this.renderXLabels();
this.renderYLabels();
if(!this.mini){
if($.browser.msie){
$('.timegrid-view:visible .timegrid-rounded-shadow',
this._container).prettybox(4,0,0,1);
}else{
$('.timegrid-view:visible .timegrid-rounded-shadow',
this._container).prettybox(4,7,1,0.7);
}
}
};


Timegrid.Layout.prototype.renderEvents=Timegrid.abstract("renderEvents");


Timegrid.Layout.prototype.renderGridlines=function(){
var numToDay={
0:"S",
1:"M",
2:"T",
3:"W",
4:"R",
5:"F",
6:"S"
};

var numToHour={
0:"8",
1:"9",
2:"10",
3:"11",
4:"12",
5:"13",
6:"14",
7:"15",
8:"16",
9:"17",
10:"18",
11:"19",
12:"20",
13:"21"
};

var gridlineContainer=$("<table></table>",{class:'timegrid-gridlines'});

for(var y=0;y<=this.ySize-1;y++){
var hlineDiv=$('<tr></tr>',{class:'timegrid-hline',
height:this.yCell+"px"});
gridlineContainer.append(hlineDiv);

for(var x=0;x<this.xSize;x++){
var vlineDiv=$('<th></th>',{classid:numToDay[x]+numToHour[y],
class:'timegrid-vline',
width:this.xCell+"px"});
hlineDiv.append(vlineDiv);
}
}
return gridlineContainer;
};


Timegrid.Layout.prototype.renderXLabels=function(){
this._xLabelContainer=this._xLabelContainer||
document.createElement("div");
var xLabelContainer=this._xLabelContainer;
xLabelContainer.innerHTML="";
xLabelContainer.className='timegrid-xlabels-window';
xLabelContainer.style.height=this.xLabelHeight+"px";
xLabelContainer.style.width=this.width-this.yLabelWidth-
this.scrollwidth-2+"px";
xLabelContainer.style.left=this.yLabelWidth-1+"px";

var xLabelsDiv=document.createElement("div");
xLabelsDiv.className='timegrid-xlabels';
xLabelsDiv.style.height=this.xLabelHeight+"px"
xLabelsDiv.style.width=this.gridwidth+"px";
xLabelsDiv.style.top="0px";
xLabelContainer.appendChild(xLabelsDiv);

var labels=this.getXLabels();
for(var i=0;i<labels.length;i++){
var label=document.createElement("div");
label.className='timegrid-label';
label.innerHTML=labels[i];
label.style.width=this.xCell+'px';
label.style.left=(i*this.xCell)+'px';
xLabelsDiv.appendChild(label);
}
return xLabelContainer;
};


Timegrid.Layout.prototype.renderYLabels=function(){
this._yLabelContainer=this._yLabelContainer||
document.createElement("div");
var yLabelContainer=this._yLabelContainer;
yLabelContainer.innerHTML="";
yLabelContainer.className='timegrid-ylabels-window';
yLabelContainer.style.width=this.yLabelWidth+"px";
yLabelContainer.style.height=this.height-this.xLabelHeight-
this.scrollwidth-this.tabHeight-2+"px";
yLabelContainer.style.top=this.xLabelHeight-1+"px";

var yLabelsDiv=document.createElement("div");
yLabelsDiv.className='timegrid-ylabels';
yLabelsDiv.style.height=this.gridheight+"px";
yLabelsDiv.style.width=this.yLabelWidth+"px";
yLabelsDiv.style.left="0px";
yLabelContainer.appendChild(yLabelsDiv);

var labels=this.getYLabels();
var labelDivs=[];
for(var i=0;i<labels.length;i++){
var label=document.createElement('div');
label.className='timegrid-label';
label.innerHTML=labels[i];
label.style.height=this.yCell+'px';
label.style.top=i*this.yCell+'px';

yLabelsDiv.appendChild(label);
}

return yLabelContainer;
};


Timegrid.Layout.prototype.getXLabels=Timegrid.abstract("getXLabels");


Timegrid.Layout.prototype.getYLabels=Timegrid.abstract("getYLabels");


/* themes.js */




Timegrid.ClassicTheme=new Object();

Timegrid.ClassicTheme.implementations=[];

Timegrid.ClassicTheme.create=function(locale){
if(locale==null){
locale=Timegrid.Platform.getDefaultLocale();
}

var f=Timegrid.ClassicTheme.implementations[locale];
if(f==null){
f=Timegrid.ClassicTheme._Impl;
}
return new f();
};

Timegrid.ClassicTheme._Impl=function(){
this.firstDayOfWeek=0;

this.ether={
backgroundColors:[
"#EEE",
"#DDD",
"#CCC",
"#AAA"
],
highlightColor:"white",
highlightOpacity:50,
interval:{
line:{
show:true,
color:"#aaa",
opacity:25
},
weekend:{
color:"#FFFFE0",
opacity:30
},
marker:{
hAlign:"Bottom",
hBottomStyler:function(elmt){
elmt.className="timeline-ether-marker-bottom";
},
hBottomEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-bottom-emphasized";
},
hTopStyler:function(elmt){
elmt.className="timeline-ether-marker-top";
},
hTopEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-top-emphasized";
},

vAlign:"Right",
vRightStyler:function(elmt){
elmt.className="timeline-ether-marker-right";
},
vRightEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-right-emphasized";
},
vLeftStyler:function(elmt){
elmt.className="timeline-ether-marker-left";
},
vLeftEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-left-emphasized";
}
}
}
};

this.event={
track:{
offset:0.5,
height:1.5,
gap:0.5
},
instant:{
icon:Timegrid.urlPrefix+"images/dull-blue-circle.png",
lineColor:"#58A0DC",
impreciseColor:"#58A0DC",
impreciseOpacity:20,
showLineForNoText:true
},
duration:{
color:"#58A0DC",
opacity:100,
impreciseColor:"#58A0DC",
impreciseOpacity:20
},
label:{
insideColor:"white",
outsideColor:"black",
width:200
},
highlightColors:[
"#FFFF00",
"#FFC000",
"#FF0000",
"#0000FF"
],
bubble:{
width:250,
height:125,
titleStyler:function(elmt){
elmt.className="timeline-event-bubble-title";
},
bodyStyler:function(elmt){
elmt.className="timeline-event-bubble-body";
},
imageStyler:function(elmt){
elmt.className="timeline-event-bubble-image";
},
wikiStyler:function(elmt){
elmt.className="timeline-event-bubble-wiki";
},
timeStyler:function(elmt){
elmt.className="timeline-event-bubble-time";
}
}
};
};

/* monthly.js */



Timegrid.MonthLayout=function(eventSource,params){
params.n=1;
params.title=params.title||Timegrid.MonthLayout.l10n.makeTitle();
Timegrid.MonthLayout.superclass.call(this,eventSource,params);
};
Timegrid.LayoutFactory.registerLayout("month",Timegrid.MonthLayout);
$.inherit(Timegrid.MonthLayout,Timegrid.NMonthLayout);



/* nday.js */




Timegrid.NDayLayout=function(eventSource,params){
Timegrid.NDayLayout.superclass.call(this,eventSource,params);
var self=this;


this.xSize=7;
this.ySize=24;
this.iterable=true;


this.n=3;

this.xMapper=function(obj){
var time=self.timezoneMapper(obj.time);
var start=self.timezoneMapper(self.startTime);
var ivl=Timegrid.Interval(time-start);
return ivl.days;
};
this.yMapper=function(obj){
var time=self.timezoneMapper(obj.time);
return(time.getHours()+time.getMinutes()/60.0)-self.dayStart;
};

this.configure(params);

this.title=params.title||Timegrid.NDayLayout.l10n.makeTitle(this.n);
this.xSize=this.n;
this.dayEnd=this.dayend||24;
this.dayStart=this.daystart||0;
this.ySize=this.dayEnd-this.dayStart;
this.computeCellSizes();

this.eventSource=eventSource;
this.initializeGrid(eventSource);
};
Timegrid.LayoutFactory.registerLayout("n-day",Timegrid.NDayLayout);

Timegrid.NDayLayout.prototype.initializeGrid=function(){
this.startTime=this.computeStartTime();
this.startTime.setHours(0);
this.endTime=this.computeEndTime(this.startTime);

this.updateGrid();
};

Timegrid.NDayLayout.prototype.updateGrid=function(){
var now=new Date();
if(now.isBetween(this.startTime,this.endTime)){this.now=now;}

this.endpoints=[];
if(this.startTime){
var iterator=this.eventSource.getEventIterator(this.startTime,
this.endTime);
while(iterator.hasNext()){
var ends=Timegrid.NDayLayout.getEndpoints(iterator.next());
this.endpoints.push(ends[0]);
this.endpoints.push(ends[1]);
}
}
this.endpoints.sort(function(a,b){
var diff=a.time-b.time;
if(!diff){
return a.type=="start"?1:-1;
}else{
return diff;
}
});
};

Timegrid.NDayLayout.prototype.renderEvents=function(doc){
var eventContainer=doc.createElement("div");
$(eventContainer).addClass("timegrid-events");
var currentEvents={};
var currentCount=0;
for(var i=0;i<this.endpoints.length;i++){
var endpoint=this.endpoints[i];
var x=this.xMapper(endpoint);
var y=this.yMapper(endpoint);
if(endpoint.type=="start"){

var eventDiv=this.renderEvent(endpoint.event,x,y);
eventContainer.appendChild(eventDiv);

currentEvents[endpoint.event.getID()]=eventDiv;
currentCount++;

var hIndex=0;
for(var id in currentEvents){
var eDiv=currentEvents[id];
var newWidth=this.xCell/currentCount;
var newLeft=this.xCell*x+newWidth*hIndex;
$(eDiv).css("width",newWidth+"px");
$(eDiv).css("left",newLeft+"px");
hIndex++;
}
}else if(endpoint.type=="end"){

delete currentEvents[endpoint.event.getID()];
currentCount--;
}
}
return eventContainer;
};

Timegrid.NDayLayout.prototype.renderEvent=function(evt,x,y){
var ediv=document.createElement('div');
var tediv=document.createElement('div');
if(!this.mini){tediv.innerHTML=evt.getText();}
ediv.appendChild(tediv);
var length=(evt.getEnd()-evt.getStart())/(1000*60*60.0);
var className="timegrid-event";
if(!this.mini){
className+=' timegrid-rounded-shadow';
}
ediv.className=className;
ediv.style.height=this.yCell*length+"px";
ediv.style.top=this.yCell*y+"px";
ediv.style.left=this.xCell*x+'px';
ediv.title=evt.getText();
if(evt.getColor()){ediv.style.backgroundColor=evt.getColor();}
if(evt.getTextColor()){ediv.style.color=evt.getTextColor();}

if(Timegrid.eventGridClickListener&&Timegrid.eventGridInput){
var inp=Timegrid.eventGridInput(evt.getText());
ediv.onclick=function(){Timegrid.eventGridClickListener(inp);};
}
return ediv;
};

Timegrid.NDayLayout.prototype.renderNow=function(){

if(!this.now){return;}

var nowX=this.xMapper({time:this.now});
var nowY=Math.floor(this.yMapper({time:this.now}));

var rectDiv=$('<div></div>').addClass('timegrid-week-highlights');
var yRect=$('<div></div>').height(this.yCell+"px")
.width(this.xCell*this.xSize+"px")
.css('top',nowY*this.yCell+"px")
.addClass('timegrid-week-highlight');
var xRect=$('<div></div>').height(this.yCell*this.ySize+"px")
.width(this.xCell+"px")
.css('left',nowX*this.xCell+"px")
.addClass('timegrid-week-highlight');
rectDiv.append(xRect).append(yRect);
return rectDiv.get(0);
};

Timegrid.NDayLayout.prototype.getXLabels=function(){
var date=new Date(this.startTime);
var labels=[];
var format=this.mini?Timegrid.NDayLayout.l10n.mini.xLabelFormat:
Timegrid.NDayLayout.l10n.xLabelFormat;
while(date<this.endTime){
labels.push(date.format(format));
date.setHours(24);
}
return labels;
};

Timegrid.NDayLayout.prototype.getYLabels=function(){
var date=(new Date()).clearTime();
var labels=[];
var format=this.mini?Timegrid.NDayLayout.l10n.mini.yLabelFormat:
Timegrid.NDayLayout.l10n.yLabelFormat;
for(var i=+this.dayStart;i<+this.dayEnd;i++){
date.setHours(i);
labels.push(date.format(format));
}
return labels;
};

Timegrid.NDayLayout.prototype.goPrevious=function(){
this.endTime=this.startTime;
this.startTime=this.computeStartTime(this.endTime);
this.updateGrid();
this.render();
};

Timegrid.NDayLayout.prototype.goNext=function(){
this.startTime=this.endTime;
this.endTime=this.computeEndTime(this.startTime);
this.updateGrid();
this.render();
};

Timegrid.NDayLayout.prototype.getCurrent=function(){
this.endTime.add('s',-1);
var result=Timegrid.NDayLayout.l10n.makeRange(this.startTime,
this.endTime);
this.endTime.add('s',1);
return result;
};

Timegrid.NDayLayout.prototype.computeStartTime=function(date){
if(date){
var startTime=new Date(date);
startTime.add('d',0-this.n);
startTime.setHours(0);
return startTime;
}else{
var startTime=new Date(this.eventSource.getEarliestDate())||
new Date();
startTime.clearTime();
return startTime;
}
};

Timegrid.NDayLayout.prototype.computeEndTime=function(date){
if(date){
var endTime=new Date(date);
endTime.add('d',this.n);
endTime.setHours(0);
return endTime;
}
return false;
};

Timegrid.NDayLayout.getEndpoints=function(evt){
return[{type:"start",
time:evt.getStart(),
event:evt},
{type:"end",
time:evt.getEnd(),
event:evt}];
};



/* nmonth.js */



Timegrid.NMonthLayout=function(eventSource,params){
Timegrid.NMonthLayout.superclass.call(this,eventSource,params);
var self=this;

this.xSize=7;
this.ySize=0;
this.n=3;
this.iterable=true;

this.configure(params);

this.title=this.title||Timegrid.NMonthLayout.l10n.makeTitle(this.n);


this.eventSource=eventSource;


this.xMapper=function(obj){
return self.timezoneMapper(obj.time).getDay();
};
this.yMapper=function(obj){
var time=self.timezoneMapper(obj.time);
var start=self.timezoneMapper(self.startTime);

return Math.floor((time-start)/(1000*60*60*24*7.0));
};

this.initializeGrid();
};
Timegrid.LayoutFactory.registerLayout("n-month",Timegrid.NMonthLayout);

Timegrid.NMonthLayout.prototype.initializeGrid=function(){
this.startTime=this.eventSource.getEarliestDate()||new Date();
this.dataStartTime=new Date(this.eventSource.getEarliestDate())||
new Date();
this.updateGrid();
};
Timegrid.NMonthLayout.prototype.updateGrid=function(){
this.computeDimensions();
var now=new Date();
if(now.isBetween(this.startTime,this.endTime)){this.now=now;}
this.eventGrid=new Timegrid.Grid([],this.xSize,this.ySize,
this.xMapper,this.yMapper);
if(this.startTime){
var iterator=this.eventSource.getEventIterator(this.startTime,
this.endTime);
while(iterator.hasNext()){
var endpoints=Timegrid.NMonthLayout.getEndpoints(iterator.next());
this.eventGrid.addAll(endpoints);
}
}
};

Timegrid.NMonthLayout.prototype.computeDimensions=function(){
this.startTime=this.computeStartTime(this.startTime);



this.computeYSize(this.startTime);
this.computeLabels(this.startTime);

this.endTime=this.computeEndTime(this.startTime);


this.computeCellSizes();
};

Timegrid.NMonthLayout.prototype.renderEvents=function(doc){
var eventContainer=doc.createElement("div");
var labelContainer=doc.createElement("div");
var colorContainer=doc.createElement("div");
$(eventContainer).addClass("timegrid-events");
$(labelContainer).addClass("timegrid-month-labels");
$(colorContainer).addClass("timegrid-month-colors");
var i=0;
var dates=this.cellLabels;
for(y=0;y<this.ySize;y++){
for(x=0;x<this.xSize;x++){
var endpoints=this.eventGrid.get(x,y);
var events=$.map(endpoints,function(e){
return e.type=="start"?e.event:null;
});
var n=dates[i];
var m=this.months[i];
eventContainer.appendChild(this.renderEventList(events,x,y,
n,m));
colorContainer.appendChild(this.renderCellColor(x,y,m));
i++;
}
}
$(labelContainer).append($(this.renderMonthLabels()));
return $([eventContainer,labelContainer,colorContainer]);
};

Timegrid.NMonthLayout.prototype.renderEventList=function(evts,x,y,n,m){
var jediv=$("<div></div>").addClass("timegrid-month-cell");
var eList=$("<ul></ul>").addClass("timegrid-event-list");
for(var i=0;i<evts.length;i++){
eList.append('<li>'+evts[i].getText()+'</li>');
}
jediv.append(eList);
jediv.append('<span class="timegrid-month-date-label">'+n+'</span>');
jediv.css("height",this.yCell).css("width",this.xCell+"px");
jediv.css("top",this.yCell*y);
jediv.css("left",this.xCell*x+'px');
return jediv.get()[0];
};

Timegrid.NMonthLayout.prototype.renderCellColor=function(x,y,m){
var jcdiv=$("<div></div>").addClass("timegrid-month-cell");
jcdiv.addClass("timegrid-month-cell-"+(m%2?"odd":"even"));
jcdiv.css("height",this.yCell).css("width",this.xCell+"px");
jcdiv.css("top",this.yCell*y);
jcdiv.css("left",this.xCell*x+"px");

if(this.now){
var nowX=this.xMapper({time:this.now});
var nowY=this.yMapper({time:this.now});
if(x==nowX&&y==nowY){
jcdiv.addClass("timegrid-month-cell-now");
}
}

return jcdiv.get()[0];

};

Timegrid.NMonthLayout.prototype.renderMonthLabels=function(){
var self=this;
return $.map(this.monthStarts,function(monthStart){
var monthString=monthStart.date.getMonthName();
var mDiv=$('<div><span>'+monthString+'</span></div>');
mDiv.addClass('timegrid-month-label');
mDiv.css('top',self.yCell*monthStart.i+"px");
var height=monthStart.height*self.yCell;
mDiv.height(height+"px");
mDiv.children().css('line-height',height+"px");
return mDiv.get(0);
});
};

Timegrid.NMonthLayout.prototype.highlightNow=function(){
var now=new Date();
var x=this.xMapper({time:now});
var y=this.yMapper({time:now});
};

Timegrid.NMonthLayout.prototype.getXLabels=function(){
return Date.l10n.dayNames;
};

Timegrid.NMonthLayout.prototype.getYLabels=function(){
return this.yLabels;
};

Timegrid.NMonthLayout.prototype.goPrevious=function(){
this.dataStartTime.add('M',0-this.n);
this.startTime=new Date(this.dataStartTime);
this.updateGrid();
this.render();
};

Timegrid.NMonthLayout.prototype.goNext=function(){
this.dataStartTime.add('M',this.n);
this.startTime=new Date(this.dataStartTime);
this.updateGrid();
this.render();
};

Timegrid.NMonthLayout.prototype.getCurrent=function(){
var start=this.monthStarts[0].date;
var end=this.monthStarts[this.monthStarts.length-1].date;
if(this.n>1){
return Timegrid.NMonthLayout.l10n.makeRange(start,end);
}else{
return Timegrid.NMonthLayout.l10n.makeRange(start);
}
};

Timegrid.NMonthLayout.prototype.computeStartTime=function(date){
if(date){
var startTime=new Date(date);
startTime.setDate(1);
startTime.setHours(0);

while(this.xMapper({time:startTime})>0){
startTime.setHours(-24);
}
return startTime;
}
};

Timegrid.NMonthLayout.prototype.computeEndTime=function(date){
if(date){
var endTime=new Date(date);
endTime.add('d',this.ySize*7);
return endTime;
}
return false;
};

Timegrid.NMonthLayout.prototype.computeYSize=function(date){
var gridStart={time:new Date(date)};
var month=this.dataStartTime.getMonth();
this.ySize=0;
this.monthStarts=[{i:this.ySize,date:new Date(this.dataStartTime)}];
while(this.xMapper(gridStart)>0&&this.yMapper(gridStart)>=0){
gridStart.time.setHours(-24);
}
gridStart.time.add('d',7);
for(;this.monthStarts.length<=this.n;gridStart.time.add('d',7)){
if(gridStart.time.getMonth()!=month){
month=gridStart.time.getMonth();
var year=gridStart.time.getFullYear();
this.monthStarts.push({i:this.ySize,date:new Date(gridStart.time)});
var old=this.monthStarts[this.monthStarts.length-2];
old.height=this.ySize-old.i+1;
}
this.ySize++;
}
this.monthStarts.pop();
};

Timegrid.NMonthLayout.prototype.computeLabels=function(date){
var gridStart={time:new Date(date)};
this.cellLabels=[];
this.months=[];
this.yLabels=[];


while(this.xMapper(gridStart)<this.xSize&&
this.yMapper(gridStart)<this.ySize){
var d=gridStart.time;
this.cellLabels.push(d.getDate());
this.months.push(d.getMonth());
if(d.getDay()==0){
this.yLabels.push(d.format(Timegrid.NMonthLayout.l10n.yLabelFormat));
}
d.setHours(24);
}
};

Timegrid.NMonthLayout.getEndpoints=function(evt){
return[{type:"start",
time:evt.getStart(),
event:evt},
{type:"end",
time:evt.getEnd(),
event:evt}];
};



/* property.js */




Timegrid.PropertyLayout=function(eventSource,params){
Timegrid.PropertyLayout.superclass.call(this,eventSource,params);
var self=this;

this.xSize=0;
this.ySize=0;
this.iterable=false;
this.title=Timegrid.PropertyLayout.l10n.makeTitle();
this.property="title";

this.xMapper=function(obj){
return self.values.indexOf(obj.event.getProperty(self.property));
};
this.yMapper=function(obj){
var time=self.timezoneMapper(obj.time);
return(time.getHours()+time.getMinutes()/60.0)-self.dayStart;
};

this.configure(params);

this.dayEnd=this.dayend||24;
this.dayStart=this.daystart||0;
this.ySize=this.dayEnd-this.dayStart;

this.eventSource=eventSource;
this.initializeGrid();
};
Timegrid.LayoutFactory.registerLayout("property",Timegrid.PropertyLayout);

Timegrid.PropertyLayout.prototype.initializeGrid=function(){
this.startTime=new Date(this.eventSource.getEarliestDate())||new Date();
this.endTime=new Date(this.eventSource.getLatestDate())||new Date();
this.values=new DStructs.Array();
this.updateGrid();
};

Timegrid.PropertyLayout.prototype.updateGrid=function(){
this.computeDimensions();
this.eventGrid=new Timegrid.Grid([],this.xSize,this.ySize,
this.xMapper,this.yMapper);
if(this.startTime){
var iterator=this.eventSource.getEventIterator(this.startTime,
this.endTime);
while(iterator.hasNext()){
var eps=Timegrid.PropertyLayout.getEndpoints(iterator.next());
this.eventGrid.addAll(eps);
}
}
};

Timegrid.PropertyLayout.prototype.computeDimensions=function(){
var iterator=this.eventSource.getEventIterator(this.startTime,
this.endTime);
this.values.clear();
while(iterator.hasNext()){
this.values.push(iterator.next().getProperty(this.property));
}
this.values=this.values.uniq();
this.xSize=this.values.length;
};

Timegrid.PropertyLayout.prototype.renderEvents=function(doc){
var eventContainer=doc.createElement("div");
$(eventContainer).addClass("timegrid-events");
var currentEvents={};
var currentCount=0;
for(x=0;x<this.xSize;x++){
for(y=0;y<this.ySize;y++){
var endpoints=this.eventGrid.get(x,y).sort(function(a,b){
return a.time-b.time;
});
for(var i=0;i<endpoints.length;i++){
var endpoint=endpoints[i];
if(endpoint.type=="start"){

var eventDiv=this.renderEvent(endpoint.event,x,y);
eventContainer.appendChild(eventDiv);

currentEvents[endpoint.event.getID()]=eventDiv;
currentCount++;

var hIndex=0;
for(id in currentEvents){
var eDiv=currentEvents[id];
var newWidth=this.xCell/currentCount;
$(eDiv).css("width",newWidth+"px");
$(eDiv).css("left",this.xCell*x+newWidth*hIndex+"px");
hIndex++;
}
}else if(endpoint.type=="end"){

delete currentEvents[endpoint.event.getID()];
currentCount--;
}
}
}
}
return eventContainer;
};

Timegrid.PropertyLayout.prototype.renderEvent=function(evt,x,y){
var jediv=this.mini?$("<div><div></div></div>"):
$("<div><div>"+evt.getText()+"</div></div>");
var length=(evt.getEnd()-evt.getStart())/(1000*60*60.0);
jediv.addClass("timegrid-event");
if(!this.mini){
jediv.addClass('timegrid-rounded-shadow');
}
jediv.css("height",this.yCell*length);
jediv.css("top",this.yCell*y);
jediv.css("left",this.xCell*x+'px');
if(evt.getColor()){jediv.css('background-color',evt.getColor());}
if(evt.getTextColor()){jediv.css('color',evt.getTextColor());}
return jediv.get()[0];
};

Timegrid.PropertyLayout.prototype.getXLabels=function(){
return this.values;
};

Timegrid.PropertyLayout.prototype.getYLabels=function(){
var date=(new Date()).clearTime();
var labels=[];
for(var i=+this.dayStart;i<+this.dayEnd;i++){
date.setHours(i);
labels.push(date.format(Timegrid.PropertyLayout.l10n.yLabelFormat));
}
return labels;
};

Timegrid.PropertyLayout.getEndpoints=function(evt){
return[{type:"start",
time:evt.getStart(),
event:evt},
{type:"end",
time:evt.getEnd(),
event:evt}];
};


/* weekly.js */




Timegrid.WeekLayout=function(eventSource,params){
params.n=7;
params.title=params.title||Timegrid.WeekLayout.l10n.makeTitle();
Timegrid.WeekLayout.superclass.call(this,eventSource,params);
};
Timegrid.LayoutFactory.registerLayout("week",Timegrid.WeekLayout);
$.inherit(Timegrid.WeekLayout,Timegrid.NDayLayout);

Timegrid.WeekLayout.prototype.computeStartTime=function(date){
if(date){


var startTime=new Date(date);
startTime.add('d',0-this.n);
return startTime;
}else{
var startTime=new Date(this.eventSource.getEarliestDate())||
new Date();
var newStartTime=new Date(startTime);
newStartTime.clearTime().setDay(Date.l10n.firstDayOfWeek);
return newStartTime>startTime?this.computeStartTime(newStartTime):
newStartTime;
}
};



/* recurring.js */




Timegrid.RecurringEventSource=function(){
Timegrid.RecurringEventSource.superclass.call(this);


var eventPrototypes=new DStructs.Array();




this.setEventPrototypes=function(a){
eventPrototypes.clear();
this.addAllEventPrototypes(a);
};


this.addEventPrototype=function(eventPrototype){
eventPrototypes.push(eventPrototype);
this._fire("onAddMany",[]);
};


this.addAllEventPrototypes=function(a){
eventPrototypes.addAll(a);
this._fire("onAddMany",[]);
};


this.removeEventPrototype=function(eventPrototype){
return eventPrototypes.remove(eventPrototype);
};


this.clearEventPrototypes=function(){
eventPrototypes.clear();
this._fire("onClear",[]);
};


this.generateEvents=function(startDate,endDate){
var result=new DStructs.Array();
eventPrototypes.each(function(ep){
result.addAll(ep.generateEvents(startDate,endDate));
});
return result;
};
};
$.inherit(Timegrid.RecurringEventSource,Timegrid.ListenerAware);

Timegrid.RecurringEventSource.prototype.loadXML=function(xml,url){

};
Timegrid.RecurringEventSource.prototype.loadJSON=function(data,url){

};
Timegrid.RecurringEventSource.prototype.getEventIterator=function(startDate,endDate){
return this.generateEvents(startDate,endDate).iterator();
};
Timegrid.RecurringEventSource.prototype.getEarliestDate=function(){
return(new Date()).clearTime().setDay(0);
};
Timegrid.RecurringEventSource.prototype.getLatestDate=function(){
return(new Date()).clearTime().setDay(7);
};

Timegrid.RecurringEventSource.EventPrototype=function(dayArray,start,end,
text,description,image,link,icon,color,textColor){
var id="e"+Math.floor(Math.random()*1000000);
var days=new DStructs.Array();days.addAll(dayArray);

this.getDays=function(){return days;};
this.getStart=function(){return start;};
this.getEnd=function(){return end;};

this.getID=function(){return id;}
this.getText=function(){
return $('<div />').html(text).text();
};
this.getDescription=function(){
return $('<div />').html(text).text();
};
this.getImage=function(){
return(image!=null&&image!="")?image:null;
};
this.getLink=function(){
return(link!=null&&link!="")?link:null;
};
this.getIcon=function(){
return(icon!=null&&icon!="")?icon:null;
};
this.getColor=function(){
return(color!=null&&color!="")?color:null;
};
this.getTextColor=function(){
return(textColor!=null&&textColor!="")?textColor:null;
}
this.generateFrom=function(date){
if(!this.getDays().contains(date.getDay())){return false;}
var startTime=new Date(this.getStart());
var endTime=new Date(this.getEnd());
startTime.setDate(date.getDate());
startTime.setMonth(date.getMonth());
startTime.setFullYear(date.getFullYear());
endTime.setDate(date.getDate());
endTime.setMonth(date.getMonth());
endTime.setFullYear(date.getFullYear());
return new Timegrid.DefaultEventSource.Event(startTime,endTime,null,
null,false,text,description,image,link,icon,color,
textColor);
};
};

Timegrid.RecurringEventSource.EventPrototype.prototype={
generateEvents:function(start,end){
var events=new DStructs.Array();
for(var date=new Date(start);date<end;date.add('d',1)){
var event=this.generateFrom(date);
if(event){events.push(event);}
}
return events;
}
};
