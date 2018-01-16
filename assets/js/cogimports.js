/*!* Pikaday
*
* Copyright © 2014 David Bushell | BSD & MIT license | https://github.com/dbushell/Pikaday*/(function(root,factory)
{'use strict';var moment;if(typeof exports==='object'){try{moment=require('moment');}catch(e){}
module.exports=factory(moment);}else if(typeof define==='function'&&define.amd){define(function(req)
{var id='moment';try{moment=req(id);}catch(e){}
return factory(moment);});}else{root.Pikaday=factory(root.moment);}}(this,function(moment)
{'use strict';var hasMoment=typeof moment==='function',hasEventListeners=!!window.addEventListener,document=window.document,sto=window.setTimeout,addEvent=function(el,e,callback,capture)
{if(hasEventListeners){el.addEventListener(e,callback,!!capture);}else{el.attachEvent('on'+e,callback);}},removeEvent=function(el,e,callback,capture)
{if(hasEventListeners){el.removeEventListener(e,callback,!!capture);}else{el.detachEvent('on'+e,callback);}},trim=function(str)
{return str.trim?str.trim():str.replace(/^\s+|\s+$/g,'');},hasClass=function(el,cn)
{return(' '+el.className+' ').indexOf(' '+cn+' ')!==-1;},addClass=function(el,cn)
{if(!hasClass(el,cn)){el.className=(el.className==='')?cn:el.className+' '+cn;}},removeClass=function(el,cn)
{el.className=trim((' '+el.className+' ').replace(' '+cn+' ',' '));},isArray=function(obj)
{return(/Array/).test(Object.prototype.toString.call(obj));},isDate=function(obj)
{return(/Date/).test(Object.prototype.toString.call(obj))&&!isNaN(obj.getTime());},isWeekend=function(date)
{var day=date.getDay();return day===0||day===6;},isLeapYear=function(year)
{return year%4===0&&year%100!==0||year%400===0;},getDaysInMonth=function(year,month)
{return[31,isLeapYear(year)?29:28,31,30,31,30,31,31,30,31,30,31][month];},setToStartOfDay=function(date)
{if(isDate(date))date.setHours(0,0,0,0);},compareDates=function(a,b)
{return a.getTime()===b.getTime();},extend=function(to,from,overwrite)
{var prop,hasProp;for(prop in from){hasProp=to[prop]!==undefined;if(hasProp&&typeof from[prop]==='object'&&from[prop]!==null&&from[prop].nodeName===undefined){if(isDate(from[prop])){if(overwrite){to[prop]=new Date(from[prop].getTime());}}
else if(isArray(from[prop])){if(overwrite){to[prop]=from[prop].slice(0);}}else{to[prop]=extend({},from[prop],overwrite);}}else if(overwrite||!hasProp){to[prop]=from[prop];}}
return to;},fireEvent=function(el,eventName,data)
{var ev;if(document.createEvent){ev=document.createEvent('HTMLEvents');ev.initEvent(eventName,true,false);ev=extend(ev,data);el.dispatchEvent(ev);}else if(document.createEventObject){ev=document.createEventObject();ev=extend(ev,data);el.fireEvent('on'+eventName,ev);}},adjustCalendar=function(calendar){if(calendar.month<0){calendar.year-=Math.ceil(Math.abs(calendar.month)/12);calendar.month+=12;}
if(calendar.month>11){calendar.year+=Math.floor(Math.abs(calendar.month)/12);calendar.month-=12;}
return calendar;},defaults={field:null,bound:undefined,position:'bottom left',reposition:true,format:'YYYY-MM-DD',toString:null,parse:null,defaultDate:null,setDefaultDate:false,firstDay:0,formatStrict:false,minDate:null,maxDate:null,yearRange:10,showWeekNumber:false,pickWholeWeek:false,minYear:0,maxYear:9999,minMonth:undefined,maxMonth:undefined,startRange:null,endRange:null,isRTL:false,yearSuffix:'',showMonthAfterYear:false,showDaysInNextAndPreviousMonths:false,numberOfMonths:1,mainCalendar:'left',container:undefined,blurFieldOnSelect:true,i18n:{previousMonth:'Previous Month',nextMonth:'Next Month',months:['January','February','March','April','May','June','July','August','September','October','November','December'],weekdays:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],weekdaysShort:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']},theme:null,events:[],onSelect:null,onOpen:null,onClose:null,onDraw:null},renderDayName=function(opts,day,abbr)
{day+=opts.firstDay;while(day>=7){day-=7;}
return abbr?opts.i18n.weekdaysShort[day]:opts.i18n.weekdays[day];},renderDay=function(opts)
{var arr=[];var ariaSelected='false';if(opts.isEmpty){if(opts.showDaysInNextAndPreviousMonths){arr.push('is-outside-current-month');}else{return '<td class="is-empty"></td>';}}
if(opts.isDisabled){arr.push('is-disabled');}
if(opts.isToday){arr.push('is-today');}
if(opts.isSelected){arr.push('is-selected');ariaSelected='true';}
if(opts.hasEvent){arr.push('has-event');}
if(opts.isInRange){arr.push('is-inrange');}
if(opts.isStartRange){arr.push('is-startrange');}
if(opts.isEndRange){arr.push('is-endrange');}
return '<td data-day="'+opts.day+'" class="'+arr.join(' ')+'" aria-selected="'+ariaSelected+'">'+
'<button class="pika-button pika-day" type="button" '+
'data-pika-year="'+opts.year+'" data-pika-month="'+opts.month+'" data-pika-day="'+opts.day+'">'+
opts.day+
'</button>'+
'</td>';},renderWeek=function(d,m,y){var onejan=new Date(y,0,1),weekNum=Math.ceil((((new Date(y,m,d)-onejan)/86400000)+onejan.getDay()+1)/7);return '<td class="pika-week">'+weekNum+'</td>';},renderRow=function(days,isRTL,pickWholeWeek,isRowSelected)
{return '<tr class="pika-row'+(pickWholeWeek?' pick-whole-week':'')+(isRowSelected?' is-selected':'')+'">'+(isRTL?days.reverse():days).join('')+'</tr>';},renderBody=function(rows)
{return '<tbody>'+rows.join('')+'</tbody>';},renderHead=function(opts)
{var i,arr=[];if(opts.showWeekNumber){arr.push('<th></th>');}
for(i=0;i<7;i++){arr.push('<th scope="col"><abbr title="'+renderDayName(opts,i)+'">'+renderDayName(opts,i,true)+'</abbr></th>');}
return '<thead><tr>'+(opts.isRTL?arr.reverse():arr).join('')+'</tr></thead>';},renderTitle=function(instance,c,year,month,refYear,randId)
{var i,j,arr,opts=instance._o,isMinYear=year===opts.minYear,isMaxYear=year===opts.maxYear,html='<div id="'+randId+'" class="pika-title" role="heading" aria-live="assertive">',monthHtml,yearHtml,prev=true,next=true;for(arr=[],i=0;i<12;i++){arr.push('<option value="'+(year===refYear?i-c:12+i-c)+'"'+
(i===month?' selected="selected"':'')+
((isMinYear&&i<opts.minMonth)||(isMaxYear&&i>opts.maxMonth)?'disabled="disabled"':'')+'>'+
opts.i18n.months[i]+'</option>');}
monthHtml='<div class="pika-label">'+opts.i18n.months[month]+'<select class="pika-select pika-select-month" tabindex="-1">'+arr.join('')+'</select></div>';if(isArray(opts.yearRange)){i=opts.yearRange[0];j=opts.yearRange[1]+1;}else{i=year-opts.yearRange;j=1+year+opts.yearRange;}
for(arr=[];i<j&&i<=opts.maxYear;i++){if(i>=opts.minYear){arr.push('<option value="'+i+'"'+(i===year?' selected="selected"':'')+'>'+(i)+'</option>');}}
yearHtml='<div class="pika-label">'+year+opts.yearSuffix+'<select class="pika-select pika-select-year" tabindex="-1">'+arr.join('')+'</select></div>';if(opts.showMonthAfterYear){html+=yearHtml+monthHtml;}else{html+=monthHtml+yearHtml;}
if(isMinYear&&(month===0||opts.minMonth>=month)){prev=false;}
if(isMaxYear&&(month===11||opts.maxMonth<=month)){next=false;}
if(c===0){html+='<button class="pika-prev'+(prev?'':' is-disabled')+'" type="button">'+opts.i18n.previousMonth+'</button>';}
if(c===(instance._o.numberOfMonths-1)){html+='<button class="pika-next'+(next?'':' is-disabled')+'" type="button">'+opts.i18n.nextMonth+'</button>';}
return html+='</div>';},renderTable=function(opts,data,randId)
{return '<table cellpadding="0" cellspacing="0" class="pika-table" role="grid" aria-labelledby="'+randId+'">'+renderHead(opts)+renderBody(data)+'</table>';},Pikaday=function(options)
{var self=this,opts=self.config(options);self._onMouseDown=function(e)
{if(!self._v){return;}
e=e||window.event;var target=e.target||e.srcElement;if(!target){return;}
if(!hasClass(target,'is-disabled')){if(hasClass(target,'pika-button')&&!hasClass(target,'is-empty')&&!hasClass(target.parentNode,'is-disabled')){self.setDate(new Date(target.getAttribute('data-pika-year'),target.getAttribute('data-pika-month'),target.getAttribute('data-pika-day')));if(opts.bound){sto(function(){self.hide();if(opts.blurFieldOnSelect&&opts.field){opts.field.blur();}},100);}}
else if(hasClass(target,'pika-prev')){self.prevMonth();}
else if(hasClass(target,'pika-next')){self.nextMonth();}}
if(!hasClass(target,'pika-select')){if(e.preventDefault){e.preventDefault();}else{e.returnValue=false;return false;}}else{self._c=true;}};self._onChange=function(e)
{e=e||window.event;var target=e.target||e.srcElement;if(!target){return;}
if(hasClass(target,'pika-select-month')){self.gotoMonth(target.value);}
else if(hasClass(target,'pika-select-year')){self.gotoYear(target.value);}};self._onKeyChange=function(e)
{e=e||window.event;if(self.isVisible()){switch(e.keyCode){case 13:case 27:if(opts.field){opts.field.blur();}
break;case 37:e.preventDefault();self.adjustDate('subtract',1);break;case 38:self.adjustDate('subtract',7);break;case 39:self.adjustDate('add',1);break;case 40:self.adjustDate('add',7);break;}}};self._onInputChange=function(e)
{var date;if(e.firedBy===self){return;}
if(opts.parse){date=opts.parse(opts.field.value,opts.format);}else if(hasMoment){date=moment(opts.field.value,opts.format,opts.formatStrict);date=(date&&date.isValid())?date.toDate():null;}
else{date=new Date(Date.parse(opts.field.value));}
if(isDate(date)){self.setDate(date);}
if(!self._v){self.show();}};self._onInputFocus=function()
{self.show();};self._onInputClick=function()
{self.show();};self._onInputBlur=function()
{var pEl=document.activeElement;do{if(hasClass(pEl,'pika-single')){return;}}
while((pEl=pEl.parentNode));if(!self._c){self._b=sto(function(){self.hide();},50);}
self._c=false;};self._onClick=function(e)
{e=e||window.event;var target=e.target||e.srcElement,pEl=target;if(!target){return;}
if(!hasEventListeners&&hasClass(target,'pika-select')){if(!target.onchange){target.setAttribute('onchange','return;');addEvent(target,'change',self._onChange);}}
do{if(hasClass(pEl,'pika-single')||pEl===opts.trigger){return;}}
while((pEl=pEl.parentNode));if(self._v&&target!==opts.trigger&&pEl!==opts.trigger){self.hide();}};self.el=document.createElement('div');self.el.className='pika-single'+(opts.isRTL?' is-rtl':'')+(opts.theme?' '+opts.theme:'');addEvent(self.el,'mousedown',self._onMouseDown,true);addEvent(self.el,'touchend',self._onMouseDown,true);addEvent(self.el,'change',self._onChange);addEvent(document,'keydown',self._onKeyChange);if(opts.field){if(opts.container){opts.container.appendChild(self.el);}else if(opts.bound){document.body.appendChild(self.el);}else{opts.field.parentNode.insertBefore(self.el,opts.field.nextSibling);}
addEvent(opts.field,'change',self._onInputChange);if(!opts.defaultDate){if(hasMoment&&opts.field.value){opts.defaultDate=moment(opts.field.value,opts.format).toDate();}else{opts.defaultDate=new Date(Date.parse(opts.field.value));}
opts.setDefaultDate=true;}}
var defDate=opts.defaultDate;if(isDate(defDate)){if(opts.setDefaultDate){self.setDate(defDate,true);}else{self.gotoDate(defDate);}}else{self.gotoDate(new Date());}
if(opts.bound){this.hide();self.el.className+=' is-bound';addEvent(opts.trigger,'click',self._onInputClick);addEvent(opts.trigger,'focus',self._onInputFocus);addEvent(opts.trigger,'blur',self._onInputBlur);}else{this.show();}};Pikaday.prototype={config:function(options)
{if(!this._o){this._o=extend({},defaults,true);}
var opts=extend(this._o,options,true);opts.isRTL=!!opts.isRTL;opts.field=(opts.field&&opts.field.nodeName)?opts.field:null;opts.theme=(typeof opts.theme)==='string'&&opts.theme?opts.theme:null;opts.bound=!!(opts.bound!==undefined?opts.field&&opts.bound:opts.field);opts.trigger=(opts.trigger&&opts.trigger.nodeName)?opts.trigger:opts.field;opts.disableWeekends=!!opts.disableWeekends;opts.disableDayFn=(typeof opts.disableDayFn)==='function'?opts.disableDayFn:null;var nom=parseInt(opts.numberOfMonths,10)||1;opts.numberOfMonths=nom>4?4:nom;if(!isDate(opts.minDate)){opts.minDate=false;}
if(!isDate(opts.maxDate)){opts.maxDate=false;}
if((opts.minDate&&opts.maxDate)&&opts.maxDate<opts.minDate){opts.maxDate=opts.minDate=false;}
if(opts.minDate){this.setMinDate(opts.minDate);}
if(opts.maxDate){this.setMaxDate(opts.maxDate);}
if(isArray(opts.yearRange)){var fallback=new Date().getFullYear()-10;opts.yearRange[0]=parseInt(opts.yearRange[0],10)||fallback;opts.yearRange[1]=parseInt(opts.yearRange[1],10)||fallback;}else{opts.yearRange=Math.abs(parseInt(opts.yearRange,10))||defaults.yearRange;if(opts.yearRange>100){opts.yearRange=100;}}
return opts;},toString:function(format)
{format=format||this._o.format;if(!isDate(this._d)){return '';}
if(this._o.toString){return this._o.toString(this._d,format);}
if(hasMoment){return moment(this._d).format(format);}
return this._d.toDateString();},getMoment:function()
{return hasMoment?moment(this._d):null;},setMoment:function(date,preventOnSelect)
{if(hasMoment&&moment.isMoment(date)){this.setDate(date.toDate(),preventOnSelect);}},getDate:function()
{return isDate(this._d)?new Date(this._d.getTime()):null;},setDate:function(date,preventOnSelect)
{if(!date){this._d=null;if(this._o.field){this._o.field.value='';fireEvent(this._o.field,'change',{firedBy:this});}
return this.draw();}
if(typeof date==='string'){date=new Date(Date.parse(date));}
if(!isDate(date)){return;}
var min=this._o.minDate,max=this._o.maxDate;if(isDate(min)&&date<min){date=min;}else if(isDate(max)&&date>max){date=max;}
this._d=new Date(date.getTime());setToStartOfDay(this._d);this.gotoDate(this._d);if(this._o.field){this._o.field.value=this.toString();fireEvent(this._o.field,'change',{firedBy:this});}
if(!preventOnSelect&&typeof this._o.onSelect==='function'){this._o.onSelect.call(this,this.getDate());}},gotoDate:function(date)
{var newCalendar=true;if(!isDate(date)){return;}
if(this.calendars){var firstVisibleDate=new Date(this.calendars[0].year,this.calendars[0].month,1),lastVisibleDate=new Date(this.calendars[this.calendars.length-1].year,this.calendars[this.calendars.length-1].month,1),visibleDate=date.getTime();lastVisibleDate.setMonth(lastVisibleDate.getMonth()+1);lastVisibleDate.setDate(lastVisibleDate.getDate()-1);newCalendar=(visibleDate<firstVisibleDate.getTime()||lastVisibleDate.getTime()<visibleDate);}
if(newCalendar){this.calendars=[{month:date.getMonth(),year:date.getFullYear()}];if(this._o.mainCalendar==='right'){this.calendars[0].month+=1-this._o.numberOfMonths;}}
this.adjustCalendars();},adjustDate:function(sign,days){var day=this.getDate()||new Date();var difference=parseInt(days)*24*60*60*1000;var newDay;if(sign==='add'){newDay=new Date(day.valueOf()+difference);}else if(sign==='subtract'){newDay=new Date(day.valueOf()-difference);}
this.setDate(newDay);},adjustCalendars:function(){this.calendars[0]=adjustCalendar(this.calendars[0]);for(var c=1;c<this._o.numberOfMonths;c++){this.calendars[c]=adjustCalendar({month:this.calendars[0].month+c,year:this.calendars[0].year});}
this.draw();},gotoToday:function()
{this.gotoDate(new Date());},gotoMonth:function(month)
{if(!isNaN(month)){this.calendars[0].month=parseInt(month,10);this.adjustCalendars();}},nextMonth:function()
{this.calendars[0].month++;this.adjustCalendars();},prevMonth:function()
{this.calendars[0].month--;this.adjustCalendars();},gotoYear:function(year)
{if(!isNaN(year)){this.calendars[0].year=parseInt(year,10);this.adjustCalendars();}},setMinDate:function(value)
{if(value instanceof Date){setToStartOfDay(value);this._o.minDate=value;this._o.minYear=value.getFullYear();this._o.minMonth=value.getMonth();}else{this._o.minDate=defaults.minDate;this._o.minYear=defaults.minYear;this._o.minMonth=defaults.minMonth;this._o.startRange=defaults.startRange;}
this.draw();},setMaxDate:function(value)
{if(value instanceof Date){setToStartOfDay(value);this._o.maxDate=value;this._o.maxYear=value.getFullYear();this._o.maxMonth=value.getMonth();}else{this._o.maxDate=defaults.maxDate;this._o.maxYear=defaults.maxYear;this._o.maxMonth=defaults.maxMonth;this._o.endRange=defaults.endRange;}
this.draw();},setStartRange:function(value)
{this._o.startRange=value;},setEndRange:function(value)
{this._o.endRange=value;},draw:function(force)
{if(!this._v&&!force){return;}
var opts=this._o,minYear=opts.minYear,maxYear=opts.maxYear,minMonth=opts.minMonth,maxMonth=opts.maxMonth,html='',randId;if(this._y<=minYear){this._y=minYear;if(!isNaN(minMonth)&&this._m<minMonth){this._m=minMonth;}}
if(this._y>=maxYear){this._y=maxYear;if(!isNaN(maxMonth)&&this._m>maxMonth){this._m=maxMonth;}}
randId='pika-title-'+Math.random().toString(36).replace(/[^a-z]+/g,'').substr(0,2);for(var c=0;c<opts.numberOfMonths;c++){html+='<div class="pika-lendar">'+renderTitle(this,c,this.calendars[c].year,this.calendars[c].month,this.calendars[0].year,randId)+this.render(this.calendars[c].year,this.calendars[c].month,randId)+'</div>';}
this.el.innerHTML=html;if(opts.bound){if(opts.field.type!=='hidden'){sto(function(){opts.trigger.focus();},1);}}
if(typeof this._o.onDraw==='function'){this._o.onDraw(this);}
if(opts.bound){opts.field.setAttribute('aria-label','Use the arrow keys to pick a date');}},adjustPosition:function()
{var field,pEl,width,height,viewportWidth,viewportHeight,scrollTop,left,top,clientRect;if(this._o.container)return;this.el.style.position='absolute';field=this._o.trigger;pEl=field;width=this.el.offsetWidth;height=this.el.offsetHeight;viewportWidth=window.innerWidth||document.documentElement.clientWidth;viewportHeight=window.innerHeight||document.documentElement.clientHeight;scrollTop=window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop;if(typeof field.getBoundingClientRect==='function'){clientRect=field.getBoundingClientRect();left=clientRect.left+window.pageXOffset;top=clientRect.bottom+window.pageYOffset;}else{left=pEl.offsetLeft;top=pEl.offsetTop+pEl.offsetHeight;while((pEl=pEl.offsetParent)){left+=pEl.offsetLeft;top+=pEl.offsetTop;}}
if((this._o.reposition&&left+width>viewportWidth)||(this._o.position.indexOf('right')>-1&&left-width+field.offsetWidth>0)){left=left-width+field.offsetWidth;}
if((this._o.reposition&&top+height>viewportHeight+scrollTop)||(this._o.position.indexOf('top')>-1&&top-height-field.offsetHeight>0)){top=top-height-field.offsetHeight;}
this.el.style.left=left+'px';this.el.style.top=top+'px';},render:function(year,month,randId)
{var opts=this._o,now=new Date(),days=getDaysInMonth(year,month),before=new Date(year,month,1).getDay(),data=[],row=[];setToStartOfDay(now);if(opts.firstDay>0){before-=opts.firstDay;if(before<0){before+=7;}}
var previousMonth=month===0?11:month-1,nextMonth=month===11?0:month+1,yearOfPreviousMonth=month===0?year-1:year,yearOfNextMonth=month===11?year+1:year,daysInPreviousMonth=getDaysInMonth(yearOfPreviousMonth,previousMonth);var cells=days+before,after=cells;while(after>7){after-=7;}
cells+=7-after;var isWeekSelected=false;for(var i=0,r=0;i<cells;i++)
{var day=new Date(year,month,1+(i-before)),isSelected=isDate(this._d)?compareDates(day,this._d):false,isToday=compareDates(day,now),hasEvent=opts.events.indexOf(day.toDateString())!==-1?true:false,isEmpty=i<before||i>=(days+before),dayNumber=1+(i-before),monthNumber=month,yearNumber=year,isStartRange=opts.startRange&&compareDates(opts.startRange,day),isEndRange=opts.endRange&&compareDates(opts.endRange,day),isInRange=opts.startRange&&opts.endRange&&opts.startRange<day&&day<opts.endRange,isDisabled=(opts.minDate&&day<opts.minDate)||(opts.maxDate&&day>opts.maxDate)||(opts.disableWeekends&&isWeekend(day))||(opts.disableDayFn&&opts.disableDayFn(day));if(isEmpty){if(i<before){dayNumber=daysInPreviousMonth+dayNumber;monthNumber=previousMonth;yearNumber=yearOfPreviousMonth;}else{dayNumber=dayNumber-days;monthNumber=nextMonth;yearNumber=yearOfNextMonth;}}
var dayConfig={day:dayNumber,month:monthNumber,year:yearNumber,hasEvent:hasEvent,isSelected:isSelected,isToday:isToday,isDisabled:isDisabled,isEmpty:isEmpty,isStartRange:isStartRange,isEndRange:isEndRange,isInRange:isInRange,showDaysInNextAndPreviousMonths:opts.showDaysInNextAndPreviousMonths};if(opts.pickWholeWeek&&isSelected){isWeekSelected=true;}
row.push(renderDay(dayConfig));if(++r===7){if(opts.showWeekNumber){row.unshift(renderWeek(i-before,month,year));}
data.push(renderRow(row,opts.isRTL,opts.pickWholeWeek,isWeekSelected));row=[];r=0;isWeekSelected=false;}}
return renderTable(opts,data,randId);},isVisible:function()
{return this._v;},show:function()
{if(!this.isVisible()){this._v=true;this.draw();removeClass(this.el,'is-hidden');if(this._o.bound){addEvent(document,'click',this._onClick);this.adjustPosition();}
if(typeof this._o.onOpen==='function'){this._o.onOpen.call(this);}}},hide:function()
{var v=this._v;if(v!==false){if(this._o.bound){removeEvent(document,'click',this._onClick);}
this.el.style.position='static';this.el.style.left='auto';this.el.style.top='auto';addClass(this.el,'is-hidden');this._v=false;if(v!==undefined&&typeof this._o.onClose==='function'){this._o.onClose.call(this);}}},destroy:function()
{this.hide();removeEvent(this.el,'mousedown',this._onMouseDown,true);removeEvent(this.el,'touchend',this._onMouseDown,true);removeEvent(this.el,'change',this._onChange);if(this._o.field){removeEvent(this._o.field,'change',this._onInputChange);if(this._o.bound){removeEvent(this._o.trigger,'click',this._onInputClick);removeEvent(this._o.trigger,'focus',this._onInputFocus);removeEvent(this._o.trigger,'blur',this._onInputBlur);}}
if(this.el.parentNode){this.el.parentNode.removeChild(this.el);}}};return Pikaday;}));var tns=(function(){if(!Object.keys){Object.keys=function(object){var keys=[];for(var name in object){if(Object.prototype.hasOwnProperty.call(object,name)){keys.push(name);}}
return keys;};}
(function(){"use strict";if(!("remove"in Element.prototype)){Element.prototype.remove=function(){if(this.parentNode){this.parentNode.removeChild(this);}};}})();function extend(){var obj,name,copy,target=arguments[0]||{},i=1,length=arguments.length;for(;i<length;i++){if((obj=arguments[i])!==null){for(name in obj){copy=obj[name];if(target===copy){continue;}else if(copy!==undefined){target[name]=copy;}}}}
return target;}
function checkStorageValue(value){return['true','false'].indexOf(value)>=0?JSON.parse(value):value;}
function setLocalStorage(key,value,access){if(access){localStorage.setItem(key,value);}
return value;}
function getSlideId(){var id=window.tnsId;window.tnsId=!id?1:id+1;return 'tns'+window.tnsId;}
function getBody(){var doc=document,body=doc.body;if(!body){body=doc.createElement('body');body.fake=true;}
return body;}
var docElement=document.documentElement;function setFakeBody(body){var docOverflow='';if(body.fake){docOverflow=docElement.style.overflow;body.style.background='';body.style.overflow=docElement.style.overflow='hidden';docElement.appendChild(body);}
return docOverflow;}
function resetFakeBody(body,docOverflow){if(body.fake){body.remove();docElement.style.overflow=docOverflow;docElement.offsetHeight;}}
function calc(){var doc=document,body=getBody(),docOverflow=setFakeBody(body),div=doc.createElement('div'),result=false;body.appendChild(div);try{var vals=['calc(10px)','-moz-calc(10px)','-webkit-calc(10px)'],val;for(var i=0;i<3;i++){val=vals[i];div.style.width=val;if(div.offsetWidth===10){result=val.replace('(10px)','');break;}}}catch(e){}
body.fake?resetFakeBody(body,docOverflow):div.remove();return result;}
function subpixelLayout(){var doc=document,body=getBody(),docOverflow=setFakeBody(body),parent=doc.createElement('div'),child1=doc.createElement('div'),child2,supported;parent.style.cssText='width: 10px';child1.style.cssText='float: left; width: 5.5px; height: 10px;';child2=child1.cloneNode(true);parent.appendChild(child1);parent.appendChild(child2);body.appendChild(parent);supported=child1.offsetTop!==child2.offsetTop;body.fake?resetFakeBody(body,docOverflow):parent.remove();return supported;}
function mediaquerySupport(){var doc=document,body=getBody(),docOverflow=setFakeBody(body),div=doc.createElement('div'),style=doc.createElement('style'),rule='@media all and (min-width:1px){.tns-mq-test{position:absolute}}',position;style.type='text/css';div.className='tns-mq-test';body.appendChild(style);body.appendChild(div);if(style.styleSheet){style.styleSheet.cssText=rule;}else{style.appendChild(doc.createTextNode(rule));}
position=window.getComputedStyle?window.getComputedStyle(div).position:div.currentStyle['position'];body.fake?resetFakeBody(body,docOverflow):div.remove();return position==="absolute";}
function createStyleSheet(media){var style=document.createElement("style");if(media){style.setAttribute("media",media);}
document.querySelector('head').appendChild(style);return style.sheet?style.sheet:style.styleSheet;}
function addCSSRule(sheet,selector,rules,index){'insertRule'in sheet?sheet.insertRule(selector+'{'+rules+'}',index):sheet.addRule(selector,rules,index);}
function getCssRulesLength(sheet){var rule=('insertRule'in sheet)?sheet.cssRules:sheet.rules;return rule.length;}
function toDegree(y,x){return Math.atan2(y,x)*(180/Math.PI);}
function getTouchDirection(angle,range){var direction=false,gap=Math.abs(90-Math.abs(angle));if(gap>=90-range){direction='horizontal';}else if(gap<=range){direction='vertical';}
return direction;}
function hasClass(el,str){return el.className.indexOf(str)>=0;}
function addClass(el,str){el.className+=' '+str;}
function removeClass(el,str){el.className=el.className.replace(str,'');}
function hasAttr(el,attr){return el.hasAttribute(attr);}
function getAttr(el,attr){return el.getAttribute(attr);}
function isNodeList(el){return typeof el.item!=="undefined";}
function setAttrs(els,attrs){els=(isNodeList(els)||els instanceof Array)?els:[els];if(Object.prototype.toString.call(attrs)!=='[object Object]'){return;}
for(var i=els.length;i--;){for(var key in attrs){els[i].setAttribute(key,attrs[key]);}}}
function removeAttrs(els,attrs){els=(isNodeList(els)||els instanceof Array)?els:[els];attrs=(attrs instanceof Array)?attrs:[attrs];var attrLength=attrs.length;for(var i=els.length;i--;){for(var j=attrLength;j--;){els[i].removeAttribute(attrs[j]);}}}
function hideElement(el){if(!hasAttr(el,'hidden')){setAttrs(el,{'hidden':''});}}
function showElement(el){if(hasAttr(el,'hidden')){removeAttrs(el,'hidden');}}
function imageLoaded(img){if(typeof img.complete==='boolean'){return img.complete;}else if(typeof img.naturalWidth==='number'){return img.naturalWidth!==0;}}
function whichProperty(props){var el=document.createElement('fakeelement'),len=props.length;for(var i=0;i<props.length;i++){var prop=props[i];if(el.style[prop]!==undefined){return prop;}}
return false;}
function getEndProperty(propIn,propOut){var endProp=false;if(/^Webkit/.test(propIn)){endProp='webkit'+propOut+'End';}else if(/^O/.test(propIn)){endProp='o'+propOut+'End';}else if(propIn){endProp=propOut.toLowerCase()+'end';}
return endProp;}
var supportsPassive=false;try{var opts=Object.defineProperty({},'passive',{get:function(){supportsPassive=true;}});window.addEventListener("test",null,opts);}catch(e){}
var passiveOption=supportsPassive?{passive:true}:false;function addEvents(el,obj){for(var prop in obj){var option=(prop==='touchstart'||prop==='touchmove')?passiveOption:false;el.addEventListener(prop,obj[prop],option);}}
function removeEvents(el,obj){for(var prop in obj){var option=['touchstart','touchmove'].indexOf(prop)>=0?passiveOption:false;el.removeEventListener(prop,obj[prop],option);}}
function Events(){return{topics:{},on:function(eventName,fn){this.topics[eventName]=this.topics[eventName]||[];this.topics[eventName].push(fn);},off:function(eventName,fn){if(this.topics[eventName]){for(var i=0;i<this.topics[eventName].length;i++){if(this.topics[eventName][i]===fn){this.topics[eventName].splice(i,1);break;}}}},emit:function(eventName,data){if(this.topics[eventName]){this.topics[eventName].forEach(function(fn){fn(data);});}}};}
function jsTransform(element,attr,prefix,postfix,to,duration,callback){var tick=Math.min(duration,10),unit=(to.indexOf('%')>=0)?'%':'px',to=to.replace(unit,''),from=Number(element.style[attr].replace(prefix,'').replace(postfix,'').replace(unit,'')),positionTick=(to-from)/duration*tick,running;setTimeout(moveElement,tick);function moveElement(){duration-=tick;from+=positionTick;element.style[attr]=prefix+from+unit+postfix;if(duration>0){setTimeout(moveElement,tick);}else{callback();}}}
var browserInfo=navigator.userAgent;var localStorageAccess=true;var tnsStorage=localStorage;try{if(!tnsStorage['tnsApp']){tnsStorage['tnsApp']=browserInfo;}else if(tnsStorage['tnsApp']!==browserInfo){tnsStorage['tnsApp']=browserInfo;['tC','tSP','tMQ','tTf','tTDu','tTDe','tADu','tADe','tTE','tAE'].forEach(function(item){tnsStorage.removeItem(item);})}}catch(e){localStorageAccess=false;}
var doc=document;var win=window;var KEYS={ENTER:13,SPACE:32,PAGEUP:33,PAGEDOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40};var CALC=checkStorageValue(tnsStorage['tC'])||setLocalStorage('tC',calc(),localStorageAccess);var SUBPIXEL=checkStorageValue(tnsStorage['tSP'])||setLocalStorage('tSP',subpixelLayout(),localStorageAccess);var CSSMQ=checkStorageValue(tnsStorage['tMQ'])||setLocalStorage('tMQ',mediaquerySupport(),localStorageAccess);var TRANSFORM=checkStorageValue(tnsStorage['tTf'])||setLocalStorage('tTf',whichProperty(['transform','WebkitTransform','MozTransform','msTransform','OTransform']),localStorageAccess);var TRANSITIONDURATION=checkStorageValue(tnsStorage['tTDu'])||setLocalStorage('tTDu',whichProperty(['transitionDuration','WebkitTransitionDuration','MozTransitionDuration','OTransitionDuration']),localStorageAccess);var TRANSITIONDELAY=checkStorageValue(tnsStorage['tTDe'])||setLocalStorage('tTDe',whichProperty(['transitionDelay','WebkitTransitionDelay','MozTransitionDelay','OTransitionDelay']),localStorageAccess);var ANIMATIONDURATION=checkStorageValue(tnsStorage['tADu'])||setLocalStorage('tADu',whichProperty(['animationDuration','WebkitAnimationDuration','MozAnimationDuration','OAnimationDuration']),localStorageAccess);var ANIMATIONDELAY=checkStorageValue(tnsStorage['tADe'])||setLocalStorage('tADe',whichProperty(['animationDelay','WebkitAnimationDelay','MozAnimationDelay','OAnimationDelay']),localStorageAccess);var TRANSITIONEND=checkStorageValue(tnsStorage['tTE'])||setLocalStorage('tTE',getEndProperty(TRANSITIONDURATION,'Transition'),localStorageAccess);var ANIMATIONEND=checkStorageValue(tnsStorage['tAE'])||setLocalStorage('tAE',getEndProperty(ANIMATIONDURATION,'Animation'),localStorageAccess);if(!CSSMQ){SUBPIXEL=false;}
var tns=function(options){options=extend({container:doc.querySelector('.slider'),mode:'carousel',axis:'horizontal',items:1,gutter:0,edgePadding:0,fixedWidth:false,slideBy:1,controls:true,controlsText:['prev','next'],controlsContainer:false,nav:true,navContainer:false,arrowKeys:false,speed:300,autoplay:false,autoplayTimeout:5000,autoplayDirection:'forward',autoplayText:['start','stop'],autoplayHoverPause:false,autoplayButton:false,autoplayButtonOutput:true,autoplayResetOnVisibility:true,loop:true,rewind:false,autoHeight:false,responsive:false,lazyload:false,touch:true,mouseDrag:false,nested:false,onInit:false},options||{});['container','controlsContainer','navContainer','autoplayButton'].forEach(function(item){if(typeof options[item]==='string'){options[item]=doc.querySelector(options[item]);}});if(!options.container||!options.container.nodeName||options.container.children.length<2){return;}
if(options.responsive){var resTem={},res=options.responsive;for(var key in res){var val=res[key];resTem[key]=typeof val==='number'?{items:val}:val;}
options.responsive=resTem;resTem=null;}
var carousel=options.mode==='carousel'?true:false;if(!carousel){options.axis='horizontal';options.rewind=false;options.loop=true;options.edgePadding=false;var animateIn='tns-fadeIn',animateOut='tns-fadeOut',animateDelay=false,animateNormal=options.animateNormal||'tns-normal';if(TRANSITIONEND&&ANIMATIONEND){animateIn=options.animateIn||animateIn;animateOut=options.animateOut||animateOut;animateDelay=options.animateDelay||animateDelay;}}
var horizontal=options.axis==='horizontal'?true:false,outerWrapper=doc.createElement('div'),innerWrapper=doc.createElement('div'),container=options.container,containerParent=container.parentNode,slideItems=container.children,slideCount=slideItems.length,vpOuter=containerParent.clientWidth,vpInner,responsive=options.responsive,responsiveItems=[],breakpoints=false,breakpointZone=0,breakpointZoneAdjust=0;if(responsive){breakpoints=Object.keys(responsive).map(function(x){return parseInt(x);}).sort(function(a,b){return a-b;});if(breakpoints.indexOf(0)<0){breakpointZoneAdjust=1;}
breakpoints.forEach(function(bp){responsiveItems=responsiveItems.concat(Object.keys(responsive[bp]));});var arr=[];responsiveItems.forEach(function(item){if(arr.indexOf(item)<0){arr.push(item);}});responsiveItems=arr;breakpointZone=getBreakpointZone();}
var items=getOption('items'),slideBy=getOption('slideBy')==='page'?items:getOption('slideBy'),nested=options.nested,gutter=getOption('gutter'),edgePadding=getOption('edgePadding'),fixedWidth=getOption('fixedWidth'),arrowKeys=getOption('arrowKeys'),speed=getOption('speed'),rewind=options.rewind,loop=rewind?false:options.loop,autoHeight=getOption('autoHeight'),sheet=createStyleSheet(),lazyload=options.lazyload,slideOffsetTops,slideItemsOut=[],cloneCount=loop?slideCount*2:checkOption('edgePadding')?1:0,slideCountNew=!carousel?slideCount+cloneCount:slideCount+cloneCount*2,hasRightDeadZone=fixedWidth&&!loop&&!edgePadding?true:false,checkIndexBeforeTransform=!carousel||!loop?true:false,transformAttr=horizontal?'left':'top',transformPrefix='',transformPostfix='',index=!carousel?0:cloneCount,indexCached=index,indexAdjust=!loop&&checkOption('edgePadding')?1:0,indexMin=indexAdjust,indexMax=slideCountNew-items-indexAdjust,resizeTimer,touchedOrDraged,running=false,onInit=options.onInit,events=new Events(),containerIdCached=container.id,classContainer=' tns-slider tns-'+options.mode,slideId=container.id||getSlideId(),disable=getOption('disable'),freeze=disable?true:slideCount<=items,importantStr=nested==='inner'?' !important':'',controlsEvents={'click':onControlsClick,'keydown':onControlsKeydown},navEvents={'click':onNavClick,'keydown':onNavKeydown},hoverEvents={'mouseover':mouseoverPause,'mouseout':mouseoutRestart},visibilityEvent={'visibilitychange':onVisibilityChange},docmentKeydownEvent={'keydown':onDocumentKeydown},touchEvents={'touchstart':onTouchOrMouseStart,'touchmove':onTouchOrMouseMove,'touchend':onTouchOrMouseEnd,'touchcancel':onTouchOrMouseEnd},dragEvents={'mousedown':onTouchOrMouseStart,'mousemove':onTouchOrMouseMove,'mouseup':onTouchOrMouseEnd,'mouseleave':onTouchOrMouseEnd},hasControls=checkOption('controls'),hasNav=checkOption('nav'),hasAutoplay=checkOption('autoplay'),hasTouch=checkOption('touch'),hasMouseDrag=checkOption('mouseDrag'),slideActiveClass='tns-slide-active';if(hasControls){var controls=getOption('controls'),controlsText=getOption('controlsText'),controlsContainer=options.controlsContainer,prevButton,nextButton,prevIsButton,nextIsButton;}
if(hasNav){var nav=getOption('nav'),navContainer=options.navContainer,navItems,visibleNavIndexes=[],visibleNavIndexesCached=visibleNavIndexes,navClicked=-1,navCurrentIndex=0,navCurrentIndexCached=0,navActiveClass='tns-nav-active';}
if(hasAutoplay){var autoplay=getOption('autoplay'),autoplayTimeout=getOption('autoplayTimeout'),autoplayDirection=options.autoplayDirection==='forward'?1:-1,autoplayText=getOption('autoplayText'),autoplayHoverPause=getOption('autoplayHoverPause'),autoplayTimer,autoplayButton=options.autoplayButton,animating=false,autoplayHoverStopped=false,autoplayHtmlStrings=['<span class=\'tns-visually-hidden\'>',' animation</span>'],autoplayResetOnVisibility=getOption('autoplayResetOnVisibility'),autoplayResetVisibilityState=false;}
if(hasTouch){var touch=getOption('touch'),startX=null,startY=null,translateInit,disX,disY;}
if(hasMouseDrag){var mouseDrag=getOption('mouseDrag'),isDragEvent=false;}
if(freeze){controls=nav=touch=mouseDrag=arrowKeys=autoplay=autoplayHoverPause=autoplayResetOnVisibility=false;}
if(TRANSFORM){transformAttr=TRANSFORM;transformPrefix='translate';transformPrefix+=horizontal?'X(':'Y(';transformPostfix=')';}
function checkOption(item){var result=options[item];if(!result&&breakpoints&&responsiveItems.indexOf(item)>=0){breakpoints.forEach(function(bp){if(responsive[bp][item]){result=true;}});}
return result;}
function getOption(item,view){view=view?view:vpOuter;var result;if(item==='items'&&getOption('fixedWidth')){result=Math.floor(view/(getOption('fixedWidth')+getOption('gutter')));}else if(item==='slideBy'&&!carousel){result='page';}else if(item==='edgePadding'&&!carousel){result=false;}else if(item==='autoHeight'&&(!carousel||nested==='outer')){result=true;}else{result=options[item];if(breakpoints&&responsiveItems.indexOf(item)>=0){for(var i=0,len=breakpoints.length;i<len;i++){var bp=breakpoints[i];if(view>=bp){if(item in responsive[bp]){result=responsive[bp][item];}}else{break;}}}}
if(item==='items'){result=Math.max(1,Math.min(slideCount,result));}
if(item==='slideBy'&&result==='page'){result=getOption('items');}
return result;}
function getSlideMarginLeft(i){var str=CALC?CALC+'('+i*100+'% / '+slideCountNew+')':i*100/slideCountNew+'%';return str;}
function getInnerWrapperStyles(edgePaddingTem,gutterTem,fixedWidthTem){var str='';if(edgePaddingTem){var gap=edgePaddingTem;if(gutterTem){gap+=gutterTem;}
if(fixedWidthTem){str='margin: 0px '+(vpOuter%(fixedWidthTem+gutterTem)+gutterTem)/2+'px';}else{str=horizontal?'margin: 0 '+edgePaddingTem+'px 0 '+gap+'px;':'padding: '+gap+'px 0 '+edgePaddingTem+'px 0;';}}else if(gutterTem&&!fixedWidthTem){var dir=horizontal?'right':'bottom';str='margin-'+dir+': -'+gutterTem+'px;';}
return str;}
function getContainerWidth(fixedWidthTem,gutterTem,itemsTem){itemsTem=Math.min(slideCount,itemsTem);var str;if(fixedWidthTem){str=(fixedWidthTem+gutterTem)*slideCountNew+'px';}else{str=CALC?CALC+'('+slideCountNew*100+'% / '+itemsTem+')':slideCountNew*100/itemsTem+'%';}
return str;}
function getSlideWidthStyle(fixedWidthTem,gutterTem,itemsTem){itemsTem=Math.min(slideCount,itemsTem);var str='';if(horizontal){str='width:';if(fixedWidthTem){str+=(fixedWidthTem+gutterTem)+'px';}else{var dividend=carousel?slideCountNew:Math.min(slideCount,itemsTem);str+=CALC?CALC+'(100% / '+dividend+')':100/dividend+'%';}
str+=importantStr+';';}
return str;}
function getSlideGutterStyle(gutterTem){var str='';if(gutterTem!==false){var prop=horizontal?'padding-':'margin-',dir=horizontal?'right':'bottom';str=prop+dir+': '+gutterTem+'px;';}
return str;}
(function sliderInit(){outerWrapper.appendChild(innerWrapper);containerParent.insertBefore(outerWrapper,container);innerWrapper.appendChild(container);vpInner=innerWrapper.clientWidth;var classOuter='tns-outer',classInner='tns-inner';if(carousel){if(horizontal){if(checkOption('edgePadding')||checkOption('gutter')&&!options.fixedWidth){classOuter+=' tns-ovh';}else{classInner+=' tns-ovh';}}else{classInner+=' tns-ovh';}}else if(checkOption('gutter')){classOuter+=' tns-ovh';}
outerWrapper.className=classOuter;innerWrapper.className=classInner;innerWrapper.id=slideId+'-iw';if(autoHeight){innerWrapper.className+=' tns-ah';innerWrapper.style[TRANSITIONDURATION]=speed/1000+'s';}
if(container.id===''){container.id=slideId;}
classContainer+=SUBPIXEL?' tns-subpixel':' tns-no-subpixel';classContainer+=CALC?' tns-calc':' tns-no-calc';if(carousel){classContainer+=' tns-'+options.axis;}
container.className+=classContainer;if(carousel&&TRANSITIONEND){var eve={};eve[TRANSITIONEND]=onTransitionEnd;addEvents(container,eve);}
classOuter=classInner=null;for(var x=0;x<slideCount;x++){var item=slideItems[x];if(!item.id){item.id=slideId+'-item'+x;}
addClass(item,'tns-item');if(!carousel&&animateNormal){addClass(item,animateNormal);}
setAttrs(item,{'aria-hidden':'true','tabindex':'-1'});}
if(loop||edgePadding){var fragmentBefore=doc.createDocumentFragment(),fragmentAfter=doc.createDocumentFragment();for(var j=cloneCount;j--;){var num=j%slideCount,cloneFirst=slideItems[num].cloneNode(true);removeAttrs(cloneFirst,'id');fragmentAfter.insertBefore(cloneFirst,fragmentAfter.firstChild);if(carousel){var cloneLast=slideItems[slideCount-1-num].cloneNode(true);removeAttrs(cloneLast,'id');fragmentBefore.appendChild(cloneLast);}}
container.insertBefore(fragmentBefore,container.firstChild);container.appendChild(fragmentAfter);slideItems=container.children;}
for(var i=index;i<index+items;i++){var item=slideItems[i];setAttrs(item,{'aria-hidden':'false'});removeAttrs(item,['tabindex']);addClass(item,slideActiveClass);if(!carousel){item.style.left=(i-index)*100/items+'%';addClass(item,animateIn);removeClass(item,animateNormal);}}
if(carousel&&horizontal){if(SUBPIXEL){var cssFontSize=win.getComputedStyle(slideItems[0]).fontSize;if(cssFontSize.indexOf('em')>0){cssFontSize=parseFloat(cssFontSize)*16+'px';}
addCSSRule(sheet,'#'+slideId,'font-size:0;',getCssRulesLength(sheet));addCSSRule(sheet,'#'+slideId+' > .tns-item','font-size:'+cssFontSize+';',getCssRulesLength(sheet));}else{[].forEach.call(slideItems,function(slide,i){slide.style.marginLeft=getSlideMarginLeft(i);});}}
if(CSSMQ){var str=getInnerWrapperStyles(options.edgePadding,options.gutter,options.fixedWidth);addCSSRule(sheet,'#'+slideId+'-iw',str,getCssRulesLength(sheet));if(carousel&&horizontal){str='width:'+getContainerWidth(options.fixedWidth,options.gutter,options.items);addCSSRule(sheet,'#'+slideId,str,getCssRulesLength(sheet));}
if(horizontal||options.gutter){str=getSlideWidthStyle(options.fixedWidth,options.gutter,options.items)+
getSlideGutterStyle(options.gutter);addCSSRule(sheet,'#'+slideId+' > .tns-item',str,getCssRulesLength(sheet));}}else{innerWrapper.style.cssText=getInnerWrapperStyles(edgePadding,gutter,fixedWidth);if(carousel&&horizontal){container.style.width=getContainerWidth(fixedWidth,gutter,items);}
if(horizontal||gutter){var str=getSlideWidthStyle(fixedWidth,gutter,items)+
getSlideGutterStyle(gutter);addCSSRule(sheet,'#'+slideId+' > .tns-item',str,getCssRulesLength(sheet));}}
if(!horizontal&&!disable){getSlideOffsetTops();updateContentWrapperHeight();}
if(responsive&&CSSMQ){breakpoints.forEach(function(bp){var opts=responsive[bp],str='',innerWrapperStr='',containerStr='',slideStr='',itemsBP=getOption('items',bp),fixedWidthBP=getOption('fixedWidth',bp),edgePaddingBP=getOption('edgePadding',bp),gutterBP=getOption('gutter',bp);if('edgePadding'in opts||'gutter'in opts){innerWrapperStr='#'+slideId+'-iw{'+getInnerWrapperStyles(edgePaddingBP,gutterBP,fixedWidthBP)+'}';}
if(carousel&&horizontal&&('fixedWidth'in opts||'gutter'in opts||'items'in opts)){containerStr='#'+slideId+'{'+'width:'+getContainerWidth(fixedWidthBP,gutterBP,itemsBP)+'}';}
if('fixedWidth'in opts||checkOption('fixedWidth')&&'gutter'in opts||!carousel&&'items'in opts){slideStr+=getSlideWidthStyle(fixedWidthBP,gutterBP,itemsBP);}
if('gutter'in opts){slideStr+=getSlideGutterStyle(gutterBP);}
if(slideStr.length>0){slideStr='#'+slideId+' > .tns-item{'+slideStr+'}';}
str=innerWrapperStr+containerStr+slideStr;if(str.length>0){sheet.insertRule('@media (min-width: '+bp/16+'em) {'+str+'}',sheet.cssRules.length);}});}
if(carousel&&!disable){doContainerTransform();}
if(navigator.msMaxTouchPoints){addClass(outerWrapper,'ms-touch');addEvents(outerWrapper,{'scroll':ie10Scroll});setSnapInterval();}
if(hasNav){var initIndex=!carousel?0:cloneCount;if(navContainer){setAttrs(navContainer,{'aria-label':'Carousel Pagination'});navItems=navContainer.children;[].forEach.call(navItems,function(item,index){setAttrs(item,{'data-nav':index,'tabindex':'-1','aria-selected':'false','aria-controls':slideItems[initIndex+index].id,});});}else{var navHtml='';for(var i=0;i<slideCount;i++){navHtml+='<button data-nav="'+i+'" tabindex="-1" aria-selected="false" aria-controls="'+slideItems[initIndex+i].id+'" hidden type="button"></button>';}
navHtml='<div class="tns-nav" aria-label="Carousel Pagination">'+navHtml+'</div>';outerWrapper.insertAdjacentHTML('afterbegin',navHtml);navContainer=outerWrapper.querySelector('.tns-nav');navItems=navContainer.children;updateNavVisibility();}
if(TRANSITIONDURATION){var prefix=TRANSITIONDURATION.substring(0,TRANSITIONDURATION.length-18).toLowerCase(),str='transition: all '+speed/1000+'s';if(prefix){str='-'+prefix+'-'+str;}
addCSSRule(sheet,'[aria-controls^='+slideId+'-item]',str,getCssRulesLength(sheet));}
setAttrs(navItems[0],{'tabindex':'0','aria-selected':'true'});addClass(navItems[0],navActiveClass);addEvents(navContainer,navEvents);if(!nav){hideElement(navContainer);}}
if(hasAutoplay){var txt=autoplay?'stop':'start';if(autoplayButton){setAttrs(autoplayButton,{'data-action':txt});}else if(options.autoplayButtonOutput){innerWrapper.insertAdjacentHTML('beforebegin','<button data-action="'+txt+'" type="button">'+autoplayHtmlStrings[0]+txt+autoplayHtmlStrings[1]+autoplayText[0]+'</button>');autoplayButton=outerWrapper.querySelector('[data-action]');}
if(autoplayButton){addEvents(autoplayButton,{'click':toggleAnimation});}
if(!autoplay){if(autoplayButton){hideElement(autoplayButton);}}else{startAction();if(autoplayHoverPause){addEvents(container,hoverEvents);}
if(autoplayResetOnVisibility){addEvents(container,visibilityEvent);}}}
if(hasControls){if(controlsContainer){prevButton=controlsContainer.children[0];nextButton=controlsContainer.children[1];setAttrs(controlsContainer,{'aria-label':'Carousel Navigation','tabindex':'0'});setAttrs(prevButton,{'data-controls':'prev'});setAttrs(nextButton,{'data-controls':'next'});setAttrs(controlsContainer.children,{'aria-controls':slideId,'tabindex':'-1',});}else{outerWrapper.insertAdjacentHTML('afterbegin','<div class="tns-controls" aria-label="Carousel Navigation" tabindex="0"><button data-controls="prev" tabindex="-1" aria-controls="'+slideId+'" type="button">'+controlsText[0]+'</button><button data-controls="next" tabindex="-1" aria-controls="'+slideId+'" type="button">'+controlsText[1]+'</button></div>');controlsContainer=outerWrapper.querySelector('.tns-controls');prevButton=controlsContainer.children[0];nextButton=controlsContainer.children[1];}
prevIsButton=isButton(prevButton);nextIsButton=isButton(nextButton);if(!loop){disEnableElement(prevIsButton,prevButton,true);}
addEvents(controlsContainer,controlsEvents);if(!controls){hideElement(controlsContainer);}}
if(touch){addEvents(container,touchEvents);}
if(mouseDrag){addEvents(container,dragEvents);}
if(arrowKeys){addEvents(doc,docmentKeydownEvent);}
if(nested==='inner'){events.on('outerResized',function(){resizeTasks();events.emit('innerLoaded',info());});}else{addEvents(win,{'resize':onResize});if(nested==='outer'){events.on('innerLoaded',runAutoHeight);}}
lazyLoad();runAutoHeight();checkFixedWidthSlideCount();if(typeof onInit==='function'){onInit(info());}
if(nested==='inner'){events.emit('innerLoaded',info());}
if(disable){disableSlider(true);}})();function onResize(e){e=e||win.event;clearTimeout(resizeTimer);resizeTimer=setTimeout(function(){if(vpOuter!==outerWrapper.clientWidth){resizeTasks();if(nested==='outer'){events.emit('outerResized',info(e));}}},100);}
function resizeTasks(){var breakpointZoneTem=breakpointZone,indexTem=index,itemsTem=items,freezeTem=freeze;vpOuter=outerWrapper.clientWidth;vpInner=innerWrapper.clientWidth;if(breakpoints){breakpointZone=getBreakpointZone();}
if(breakpointZoneTem!==breakpointZone||fixedWidth){var slideByTem=slideBy,arrowKeysTem=arrowKeys,autoHeightTem=autoHeight,fixedWidthTem=fixedWidth,edgePaddingTem=edgePadding,gutterTem=gutter,disableTem=disable;var opts=breakpointZone>0?responsive[breakpoints[breakpointZone-1]]:options;items=getOption('items');slideBy=getOption('slideBy');disable=getOption('disable');freeze=disable?true:slideCount<=items;if(items!==itemsTem){indexMax=slideCountNew-items-indexAdjust;checkIndex();}
if(disable!==disableTem){disableSlider(disable);}
if(freeze!==freezeTem&&freeze){index=!carousel?0:cloneCount;}
if(breakpointZoneTem!==breakpointZone){speed=opts.speed||getOption('speed');edgePadding=opts.edgePadding||getOption('edgePadding');gutter=opts.gutter||getOption('gutter');fixedWidth=opts.fixedWidth||getOption('fixedWidth');if(!disable&&fixedWidth!==fixedWidthTem){doContainerTransform();}
autoHeight=getOption('autoHeight');if(autoHeight!==autoHeightTem){if(!autoHeight){innerWrapper.style.height='';}}}
arrowKeys=freeze?false:opts.arrowKeys||getOption('arrowKeys');if(arrowKeys!==arrowKeysTem){arrowKeys?addEvents(doc,docmentKeydownEvent):removeEvents(doc,docmentKeydownEvent);}
if(hasControls){var controlsTem=controls,controlsTextTem=controlsText;controls=freeze?false:opts.controls||getOption('controls');controlsText=opts.controlsText||getOption('controlsText');if(controls!==controlsTem){controls?showElement(controlsContainer):hideElement(controlsContainer);}
if(controlsText!==controlsTextTem){prevButton.innerHTML=controlsText[0];nextButton.innerHTML=controlsText[1];}}
if(hasNav){var navTem=nav;nav=freeze?false:opts.nav||getOption('nav');if(nav!==navTem){if(nav){showElement(navContainer);updateNavVisibility();}else{hideElement(navContainer);}}}
if(hasTouch){var touchTem=touch;touch=freeze?false:opts.touch||getOption('touch');if(touch!==touchTem&&carousel){touch?addEvents(container,touchEvents):removeEvents(container,touchEvents);}}
if(hasMouseDrag){var mouseDragTem=mouseDrag;mouseDrag=freeze?false:opts.mouseDrag||getOption('mouseDrag');if(mouseDrag!==mouseDragTem&&carousel){mouseDrag?addEvents(container,dragEvents):removeEvents(container,dragEvents);}}
if(hasAutoplay){var autoplayTem=autoplay,autoplayHoverPauseTem=autoplayHoverPause,autoplayResetOnVisibilityTem=autoplayResetOnVisibility,autoplayTextTem=autoplayText;if(freeze){autoplay=autoplayHoverPause=autoplayResetOnVisibility=false;}else{autoplay=opts.autoplay||getOption('autoplay');if(autoplay){autoplayHoverPause=opts.autoplayHoverPause||getOption('autoplayHoverPause');autoplayResetOnVisibility=opts.autoplayResetOnVisibility||getOption('autoplayResetOnVisibility');}else{autoplayHoverPause=autoplayResetOnVisibility=false;}}
autoplayText=opts.autoplayText||getOption('autoplayText');autoplayTimeout=opts.autoplayTimeout||getOption('autoplayTimeout');if(autoplay!==autoplayTem){if(autoplay){if(autoplayButton){showElement(autoplayButton);}
if(!animating){startAction();}}else{if(autoplayButton){hideElement(autoplayButton);}
if(animating){stopAction();}}}
if(autoplayHoverPause!==autoplayHoverPauseTem){autoplayHoverPause?addEvents(container,hoverEvents):removeEvents(container,hoverEvents);}
if(autoplayResetOnVisibility!==autoplayResetOnVisibilityTem){autoplayResetOnVisibility?addEvents(doc,visibilityEvent):removeEvents(doc,visibilityEvent);}
if(autoplayButton&&autoplayText!==autoplayTextTem){var i=autoplay?1:0,html=autoplayButton.innerHTML,len=html.length-autoplayTextTem[i].length;if(html.substring(len)===autoplayTextTem[i]){autoplayButton.innerHTML=html.substring(0,len)+autoplayText[i];}}}
if(!CSSMQ){if(edgePadding!==edgePaddingTem||gutter!==gutterTem){innerWrapper.style.cssText=getInnerWrapperStyles(edgePadding,gutter,fixedWidth);}
if(carousel&&horizontal&&(fixedWidth!==fixedWidthTem||gutter!==gutterTem||items!==itemsTem)){container.style.width=getContainerWidth(fixedWidth,gutter,items);}
var str=getSlideWidthStyle(fixedWidth,gutter,items);if(gutter!==gutterTem){str+=getSlideGutterStyle(gutter);}
if(str.length>0){sheet.removeRule(getCssRulesLength(sheet)-1);addCSSRule(sheet,'#'+slideId+' > .tns-item',str,getCssRulesLength(sheet));}
if(!fixedWidth&&index===indexTem){doTransform(0);}}
if(index!==indexTem){events.emit('indexChanged',info());doTransform(0);indexCached=index;}
if(items!==itemsTem){lazyLoad();updateSlideStatus();updateControlsStatus();updateNavVisibility();updateNavStatus();if(navigator.msMaxTouchPoints){setSnapInterval();}}}
if(!horizontal&&!disable){getSlideOffsetTops();updateContentWrapperHeight();doContainerTransform();}
checkFixedWidthSlideCount();runAutoHeight();}
function getBreakpointZone(){breakpointZone=0;breakpoints.forEach(function(bp,i){if(vpOuter>=bp){breakpointZone=i+breakpointZoneAdjust;}});return breakpointZone;}
var checkIndex=(function(){if(loop){return function(){var leftEdge=indexMin,rightEdge=indexMax;if(carousel){leftEdge+=slideBy;rightEdge-=slideBy;}
var gt=gutter?gutter:0;if(fixedWidth&&vpOuter%(fixedWidth+gt)>gt){rightEdge-=1;}
if(index>rightEdge){while(index>=leftEdge+slideCount){index-=slideCount;}}else if(index<leftEdge){while(index<=rightEdge-slideCount){index+=slideCount;}}};}else{return function(){index=Math.max(indexMin,Math.min(indexMax,index));};}})();function checkFixedWidthSlideCount(){if(fixedWidth&&cloneCount){var str='tns-transparent';if(freeze){if(!hasClass(slideItems[0],str)){if(edgePadding){innerWrapper.style.margin='0';}
for(var i=cloneCount;i--;){addClass(slideItems[i],str);addClass(slideItems[slideCountNew-i-1],str);}}}else{if(edgePadding){if(vpOuter<=(fixedWidth+gutter)){if(innerWrapper.style.margin!=='0px'){innerWrapper.style.margin='0';}}else{innerWrapper.style.cssText=getInnerWrapperStyles(edgePadding,gutter,fixedWidth);}}
if(hasClass(slideItems[0],str)){for(var i=cloneCount;i--;){removeClass(slideItems[i],str);removeClass(slideItems[slideCountNew-i-1],str);}}}}}
function disableSlider(disable){var len=slideItems.length;if(disable){sheet.disabled=true;container.className=container.className.replace(classContainer.substring(1),'');container.style='';if(loop){for(var j=cloneCount;j--;){if(carousel){hideElement(slideItems[j]);}
hideElement(slideItems[len-j-1]);}}
if(!horizontal||!carousel){innerWrapper.style='';}
if(!carousel){for(var i=index;i<index+slideCount;i++){var item=slideItems[i];item.style='';removeClass(item,animateIn);removeClass(item,animateNormal);}}}else{sheet.disabled=false;container.className+=classContainer;if(!horizontal){getSlideOffsetTops();}
doContainerTransform();if(loop){for(var j=cloneCount;j--;){if(carousel){showElement(slideItems[j]);}
showElement(slideItems[len-j-1]);}}
if(!carousel){for(var i=index;i<index+slideCount;i++){var item=slideItems[i],classN=i<index+items?animateIn:animateNormal;item.style.left=(i-index)*100/items+'%';addClass(item,classN);}}}}
function mouseoverPause(){if(animating){stopAction();autoplayHoverStopped=true;}}
function mouseoutRestart(){if(!animating&&autoplayHoverStopped){startAction();autoplayHoverStopped=false;}}
function lazyLoad(){if(lazyload&&!disable){var i=index,len=index+items;if(edgePadding){i-=1;len+=1;}
for(;i<len;i++){[].forEach.call(slideItems[i].querySelectorAll('.tns-lazy-img'),function(img){var eve={};eve[TRANSITIONEND]=function(e){e.stopPropagation();};addEvents(img,eve);if(!hasClass(img,'loaded')){img.src=getAttr(img,'data-src');addClass(img,'loaded');}});}}}
function runAutoHeight(){if(autoHeight&&!disable){var images=[];for(var i=index;i<index+items;i++){[].forEach.call(slideItems[i].querySelectorAll('img'),function(img){images.push(img);});}
if(images.length===0){updateInnerWrapperHeight();}else{checkImagesLoaded(images);}}}
function checkImagesLoaded(images){images.forEach(function(img,index){if(imageLoaded(img)){images.splice(index,1);}});if(images.length===0){updateInnerWrapperHeight();}else{setTimeout(function(){checkImagesLoaded(images);},16);}}
function updateInnerWrapperHeight(){var heights=[],maxHeight;for(var i=index;i<index+items;i++){heights.push(slideItems[i].offsetHeight);}
maxHeight=Math.max.apply(null,heights);if(innerWrapper.style.height!==maxHeight){if(TRANSITIONDURATION){setDurations(speed);}
innerWrapper.style.height=maxHeight+'px';}}
function getSlideOffsetTops(){slideOffsetTops=[0];var topFirst=slideItems[0].getBoundingClientRect().top,attr;for(var i=1;i<slideCountNew;i++){attr=slideItems[i].getBoundingClientRect().top;slideOffsetTops.push(attr-topFirst);}}
function setSnapInterval(){outerWrapper.style.msScrollSnapPointsX='snapInterval(0%, '+(100/items)+'%)';}
function updateSlideStatus(){for(var i=slideCountNew;i--;){var item=slideItems[i];if(i>=index&&i<index+items){if(hasAttr(item,'tabindex')){setAttrs(item,{'aria-hidden':'false'});removeAttrs(item,['tabindex']);addClass(item,slideActiveClass);}}else{if(!hasAttr(item,'tabindex')){setAttrs(item,{'aria-hidden':'true','tabindex':'-1'});}
if(hasClass(item,slideActiveClass)){removeClass(item,slideActiveClass);}}}}
function updateNavStatus(){if(nav){navCurrentIndex=navClicked!==-1?navClicked:(index-indexAdjust)%slideCount;navClicked=-1;if(navCurrentIndex!==navCurrentIndexCached){var navPrev=navItems[navCurrentIndexCached],navCurrent=navItems[navCurrentIndex];setAttrs(navPrev,{'tabindex':'-1','aria-selected':'false'});setAttrs(navCurrent,{'tabindex':'0','aria-selected':'true'});removeClass(navPrev,navActiveClass);addClass(navCurrent,navActiveClass);}}}
function isButton(el){return el.nodeName.toLowerCase()==='button';}
function isAriaDisabled(el){return el.getAttribute('aria-disabled')==='true';}
function disEnableElement(isButton,el,val){if(isButton){el.disabled=val;}else{el.setAttribute('aria-disabled',val.toString());}}
function updateControlsStatus(){if(!controls||loop){return;}
var prevDisabled=(prevIsButton)?prevButton.disabled:isAriaDisabled(prevButton),nextDisabled=(nextIsButton)?nextButton.disabled:isAriaDisabled(nextButton),disablePrev=(index===indexMin)?true:false,disableNext=(!rewind&&index===indexMax)?true:false;if(disablePrev&&!prevDisabled){disEnableElement(prevIsButton,prevButton,true);}
if(!disablePrev&&prevDisabled){disEnableElement(prevIsButton,prevButton,false);}
if(disableNext&&!nextDisabled){disEnableElement(nextIsButton,nextButton,true);}
if(!disableNext&&nextDisabled){disEnableElement(nextIsButton,nextButton,false);}}
function setDurations(duration,target){duration=!duration?'':duration/1000+'s';target=target||container;target.style[TRANSITIONDURATION]=duration;if(!carousel){target.style[ANIMATIONDURATION]=duration;}
if(!horizontal){innerWrapper.style[TRANSITIONDURATION]=duration;}}
function getContainerTransformValue(){var val;if(horizontal){if(fixedWidth){val=-(fixedWidth+gutter)*index+'px';}else{var denominator=TRANSFORM?slideCountNew:items;val=-index*100/denominator+'%';}}else{val=-slideOffsetTops[index]+'px';}
return val;}
function doContainerTransform(val){if(!val){val=getContainerTransformValue();}
container.style[transformAttr]=transformPrefix+val+transformPostfix;}
function animateSlide(number,classOut,classIn,isOut){for(var i=number,l=number+items;i<l;i++){var item=slideItems[i];if(!isOut){item.style.left=(i-index)*100/items+'%';}
if(TRANSITIONDURATION){setDurations(speed,item);}
if(animateDelay&&TRANSITIONDELAY){item.style[TRANSITIONDELAY]=item.style[ANIMATIONDELAY]=animateDelay*(i-number)/1000+'s';}
removeClass(item,classOut);addClass(item,classIn);if(isOut){slideItemsOut.push(item);}}}
var transformCore=(function(){if(carousel){return function(duration,distance){if(!distance){distance=getContainerTransformValue();}
if(hasRightDeadZone&&index===indexMax){var containerRightEdge=TRANSFORM?-((slideCountNew-items)/slideCountNew)*100:-(slideCountNew/items-1)*100;distance=Math.max(parseFloat(distance),containerRightEdge)+'%';}
if(TRANSITIONDURATION||!duration){doContainerTransform(distance);if(speed===0){onTransitionEnd();}}else{jsTransform(container,transformAttr,transformPrefix,transformPostfix,distance,speed,onTransitionEnd);}
if(!horizontal){updateContentWrapperHeight();}};}else{return function(){slideItemsOut=[];var eve={};eve[TRANSITIONEND]=eve[ANIMATIONEND]=onTransitionEnd;removeEvents(slideItems[indexCached],eve);addEvents(slideItems[index],eve);animateSlide(indexCached,animateIn,animateOut,true);animateSlide(index,animateNormal,animateIn);if(!TRANSITIONEND||!ANIMATIONEND||speed===0){setTimeout(onTransitionEnd,0);}};}})();function doTransform(duration,distance){if(duration===undefined){duration=speed;}
if(TRANSITIONDURATION){setDurations(duration);}
transformCore(duration,distance);updateSlideStatus();if(nav&&visibleNavIndexes.indexOf(index%slideCount)<0){updateNavVisibility();}
updateNavStatus();updateControlsStatus();lazyLoad();}
function render(){if(checkIndexBeforeTransform){checkIndex();}
if(index!==indexCached){events.emit('indexChanged',info());events.emit('transitionStart',info());running=true;doTransform();}}
function strTrans(str){return str.toLowerCase().replace(/-/g,'');}
function onTransitionEnd(event){if(carousel||running){events.emit('transitionEnd',info(event));if(!carousel&&slideItemsOut.length>0){for(var i=0;i<items;i++){var item=slideItemsOut[i];item.style.left='';if(TRANSITIONDURATION){setDurations(0,item);}
if(animateDelay&&TRANSITIONDELAY){item.style[TRANSITIONDELAY]=item.style[ANIMATIONDELAY]='';}
removeClass(item,animateOut);addClass(item,animateNormal);}}
if(!event||!carousel&&event.target.parentNode===container||event.target===container&&strTrans(event.propertyName)===strTrans(transformAttr)){if(!checkIndexBeforeTransform){var indexTem=index;checkIndex();if(index!==indexTem){if(TRANSITIONDURATION){setDurations(0);}
doContainerTransform();events.emit('indexChanged',info());}}
runAutoHeight();if(nested==='inner'){events.emit('innerLoaded',info());}
running=false;navCurrentIndexCached=navCurrentIndex;indexCached=index;}}}
function goTo(targetIndex){if(freeze){return;}
if(targetIndex==='prev'){onControlsClick(null,-1);}else if(targetIndex==='next'){onControlsClick(null,1);}else if(!running){var absIndex=index%slideCount,indexGap=0;if(!loop&&checkOption('edgePadding')){absIndex--;}
if(absIndex<0){absIndex+=slideCount;}
if(targetIndex==='first'){indexGap=-absIndex;}else if(targetIndex==='last'){indexGap=slideCount-items-absIndex;}else{if(typeof targetIndex!=='number'){targetIndex=parseInt(targetIndex);}
if(!isNaN(targetIndex)){var absTargetIndex=targetIndex%slideCount;if(absTargetIndex<0){absTargetIndex+=slideCount;}
if(!loop&&edgePadding){absTargetIndex+=1;}
indexGap=absTargetIndex-absIndex;}}
index+=indexGap;if(index%slideCount!==indexCached%slideCount){render();}}}
function onControlsClick(e,dir){if(!running){var shouldRender;if(!dir){e=e||win.event;var target=e.target||e.srcElement;while(target!==controlsContainer&&[prevButton,nextButton].indexOf(target)<0){target=target.parentNode;}}
if(target&&target===prevButton||dir===-1){if(index>indexMin){index-=slideBy;shouldRender=true;}}else if(target&&target===nextButton||dir===1){if(rewind&&index===indexMax){goTo(0);}else if(index<indexMax){index+=slideBy;shouldRender=true;}}
if(shouldRender){render();}}}
function onNavClick(e){if(!running){e=e||win.event;var target=e.target||e.srcElement,navIndex;while(target!==navContainer&&!hasAttr(target,'data-nav')){target=target.parentNode;}
if(hasAttr(target,'data-nav')){navIndex=navClicked=[].indexOf.call(navItems,target);goTo(navIndex);}}}
function updateAutoplayButton(action,txt){setAttrs(autoplayButton,{'data-action':action});autoplayButton.innerHTML=autoplayHtmlStrings[0]+action+autoplayHtmlStrings[1]+txt;}
function startAction(){resetActionTimer();if(autoplayButton){updateAutoplayButton('stop',autoplayText[1]);}
animating=true;}
function stopAction(){pauseActionTimer();if(autoplayButton){updateAutoplayButton('start',autoplayText[0]);}
animating=false;}
function pauseActionTimer(){animating='paused';clearInterval(autoplayTimer);}
function resetActionTimer(){if(animating===true){return;}
clearInterval(autoplayTimer);autoplayTimer=setInterval(function(){onControlsClick(null,autoplayDirection);},autoplayTimeout);}
function toggleAnimation(){if(animating){stopAction();}else{startAction();}}
function onVisibilityChange(){if(autoplayResetVisibilityState!=doc.hidden&&animating!==false){doc.hidden?pauseActionTimer():resetActionTimer();}
autoplayResetVisibilityState=doc.hidden;}
function onDocumentKeydown(e){e=e||win.event;switch(e.keyCode){case KEYS.LEFT:onControlsClick(null,-1);break;case KEYS.RIGHT:onControlsClick(null,1);}}
function onControlsKeydown(e){e=e||win.event;var code=e.keyCode;switch(code){case KEYS.LEFT:case KEYS.UP:case KEYS.PAGEUP:if(!prevButton.disabled){onControlsClick(null,-1);}
break;case KEYS.RIGHT:case KEYS.DOWN:case KEYS.PAGEDOWN:if(!nextButton.disabled){onControlsClick(null,1);}
break;case KEYS.HOME:goTo(0);break;case KEYS.END:goTo(slideCount-1);break;}}
function setFocus(focus){focus.focus();}
function onNavKeydown(e){var curElement=doc.activeElement;if(!hasAttr(curElement,'data-nav')){return;}
e=e||win.event;var code=e.keyCode,navIndex=[].indexOf.call(navItems,curElement),len=visibleNavIndexes.length,current=visibleNavIndexes.indexOf(navIndex);if(options.navContainer){len=slideCount;current=navIndex;}
function getNavIndex(num){return options.navContainer?num:visibleNavIndexes[num];}
switch(code){case KEYS.LEFT:case KEYS.PAGEUP:if(current>0){setFocus(navItems[getNavIndex(current-1)]);}
break;case KEYS.UP:case KEYS.HOME:if(current>0){setFocus(navItems[getNavIndex(0)]);}
break;case KEYS.RIGHT:case KEYS.PAGEDOWN:if(current<len-1){setFocus(navItems[getNavIndex(current+1)]);}
break;case KEYS.DOWN:case KEYS.END:if(current<len-1){setFocus(navItems[getNavIndex(len-1)]);}
break;case KEYS.ENTER:case KEYS.SPACE:navClicked=navIndex;goTo(navIndex);break;}}
function ie10Scroll(){doTransform(0,container.scrollLeft());indexCached=index;}
function getTarget(e){return e.target||e.srcElement;}
function isTouchEvent(e){return e.type.indexOf('touch')>=0;}
function preventDefaultBehavior(e){if(e.preventDefault){e.preventDefault();}else{e.returnValue=false;}}
function onTouchOrMouseStart(e){e=e||win.event;var ev;if(isTouchEvent(e)){ev=e.changedTouches[0];events.emit('touchStart',info(e));}else{ev=e;preventDefaultBehavior(e);events.emit('dragStart',info(e));}
startX=parseInt(ev.clientX);startY=parseInt(ev.clientY);translateInit=parseFloat(container.style[transformAttr].replace(transformPrefix,'').replace(transformPostfix,''));}
function onTouchOrMouseMove(e){e=e||win.event;if(startX!==null){var ev;if(isTouchEvent(e)){ev=e.changedTouches[0];}else{ev=e;preventDefaultBehavior(e);}
disX=parseInt(ev.clientX)-startX;disY=parseInt(ev.clientY)-startY;if(getTouchDirection(toDegree(disY,disX),15)===options.axis&&disX){if(isTouchEvent(e)){events.emit('touchMove',info(e));}else{if(!isDragEvent){isDragEvent=true;}
events.emit('dragMove',info(e));}
if(!touchedOrDraged){touchedOrDraged=true;}
var x=translateInit;if(horizontal){if(fixedWidth){x+=disX;x+='px';}else{var percentageX=TRANSFORM?disX*items*100/(vpInner*slideCountNew):disX*100/vpInner;x+=percentageX;x+='%';}}else{x+=disY;x+='px';}
if(TRANSFORM){setDurations(0);}
container.style[transformAttr]=transformPrefix+x+transformPostfix;}}}
function onTouchOrMouseEnd(e){e=e||win.event;if(touchedOrDraged){touchedOrDraged=false;var ev;if(isTouchEvent(e)){ev=e.changedTouches[0];events.emit('touchEnd',info(e));}else{ev=e;events.emit('dragEnd',info(e));}
disX=parseInt(ev.clientX)-startX;disY=parseInt(ev.clientY)-startY;startX=startY=null;if(horizontal){var indexMoved=-disX*items/vpInner;indexMoved=disX>0?Math.floor(indexMoved):Math.ceil(indexMoved);index+=indexMoved;}else{var moved=-(translateInit+disY);if(moved<=0){index=indexMin;}else if(moved>=slideOffsetTops[slideOffsetTops.length-1]){index=indexMax;}else{var i=0;do{i++;index=disY<0?i+1:i;}while(i<slideCountNew&&moved>=slideOffsetTops[i+1]);}}
render();if(isDragEvent){isDragEvent=false;var target=getTarget(e);addEvents(target,{'click':function preventClick(e){preventDefaultBehavior(e);removeEvents(target,{'click':preventClick});}});}}}
function updateContentWrapperHeight(){innerWrapper.style.height=slideOffsetTops[index+items]-slideOffsetTops[index]+'px';}
function getVisibleNavIndex(){visibleNavIndexes=[];var temIndex=!loop&&edgePadding?(index-1):index;var absIndexMin=temIndex%slideCount%items;while(absIndexMin<slideCount){if(!loop&&absIndexMin+items>slideCount){absIndexMin=slideCount-items;}
visibleNavIndexes.push(absIndexMin);absIndexMin+=items;}
if(loop&&visibleNavIndexes.length*items<slideCount||!loop&&visibleNavIndexes[0]>0){visibleNavIndexes.unshift(0);}}
function updateNavVisibility(){if(!nav||options.navContainer){return;}
getVisibleNavIndex();if(visibleNavIndexes!==visibleNavIndexesCached){if(visibleNavIndexesCached.length>0){visibleNavIndexesCached.forEach(function(ind){hideElement(navItems[ind]);});}
if(visibleNavIndexes.length>0){visibleNavIndexes.forEach(function(ind){showElement(navItems[ind]);});}
visibleNavIndexesCached=visibleNavIndexes;}}
function info(e){return{container:container,slideItems:slideItems,navContainer:navContainer,navItems:navItems,controlsContainer:controlsContainer,prevButton:prevButton,nextButton:nextButton,items:items,slideBy:slideBy,cloneCount:cloneCount,slideCount:slideCount,slideCountNew:slideCountNew,index:index,indexCached:indexCached,navCurrentIndex:navCurrentIndex,navCurrentIndexCached:navCurrentIndexCached,visibleNavIndexes:visibleNavIndexes,visibleNavIndexesCached:visibleNavIndexesCached,event:e||{},};}
return{getInfo:info,events:events,goTo:goTo,destroy:function(){sheet.disabled=true;if(loop){for(var j=cloneCount;j--;){slideItems[0].remove();slideItems[slideItems.length-1].remove();}}
for(var i=slideCount;i--;){var slide=slideItems[i];if(slide.id.indexOf(slideId+'-item')>=0){slide.id='';}
slide.classList.remove('tns-item');}
removeAttrs(slideItems,['style','aria-hidden','tabindex']);slideItems=slideId=slideCount=slideCountNew=cloneCount=null;if(controls){removeEvents(controlsContainer,controlsEvents);if(options.controlsContainer){removeAttrs(controlsContainer,['aria-label','tabindex']);removeAttrs(controlsContainer.children,['aria-controls','aria-disabled','tabindex']);}
controlsContainer=prevButton=nextButton=null;}
if(nav){removeEvents(navContainer,navEvents);if(options.navContainer){removeAttrs(navContainer,['aria-label']);removeAttrs(navItems,['aria-selected','aria-controls','tabindex']);}
navContainer=navItems=null;}
if(autoplay){if(autoplayButton){removeEvents(autoplayButton,{'click':toggleAnimation});}
removeEvents(container,hoverEvents);removeEvents(container,visibilityEvent);if(options.autoplayButton){removeAttrs(autoplayButton,['data-action']);}}
container.id=containerIdCached||'';container.className=container.className.replace(classContainer,'');container.style='';if(carousel&&TRANSITIONEND){var eve={};eve[TRANSITIONEND]=onTransitionEnd;removeEvents(container,eve);}
removeEvents(container,touchEvents);removeEvents(container,dragEvents);containerParent.insertBefore(container,outerWrapper);outerWrapper.remove();outerWrapper=innerWrapper=container=null;removeEvents(doc,docmentKeydownEvent);removeEvents(win,{'resize':onResize});}};};return tns;})();(function(global,undefined){"use strict";var document=global.document,Alertify;Alertify=function(){var _alertify={},dialogs={},isopen=false,keys={ENTER:13,ESC:27,SPACE:32},queue=[],$,btnCancel,btnOK,btnReset,btnResetBack,btnFocus,elCallee,elCover,elDialog,elLog,form,input,getTransitionEvent;dialogs={buttons:{holder:"<nav class=\"alertify-buttons\">{{buttons}}</nav>",submit:"<button type=\"submit\" class=\"alertify-button alertify-button-ok\" id=\"alertify-ok\">{{ok}}</button>",ok:"<button class=\"alertify-button alertify-button-ok\" id=\"alertify-ok\">{{ok}}</button>",cancel:"<button class=\"alertify-button alertify-button-cancel\" id=\"alertify-cancel\">{{cancel}}</button>"},input:"<div class=\"alertify-text-wrapper\"><input type=\"text\" class=\"alertify-text\" id=\"alertify-text\"></div>",message:"<p class=\"alertify-message\">{{message}}</p>",log:"<article class=\"alertify-log{{class}}\">{{message}}</article>"};getTransitionEvent=function(){var t,type,supported=false,el=document.createElement("fakeelement"),transitions={"WebkitTransition":"webkitTransitionEnd","MozTransition":"transitionend","OTransition":"otransitionend","transition":"transitionend"};for(t in transitions){if(el.style[t]!==undefined){type=transitions[t];supported=true;break;}}
return{type:type,supported:supported};};$=function(id){return document.getElementById(id);};_alertify={labels:{ok:"OK",cancel:"Cancel"},delay:5000,buttonReverse:false,buttonFocus:"ok",transition:undefined,addListeners:function(fn){var hasOK=(typeof btnOK!=="undefined"),hasCancel=(typeof btnCancel!=="undefined"),hasInput=(typeof input!=="undefined"),val="",self=this,ok,cancel,common,key,reset;ok=function(event){if(typeof event.preventDefault!=="undefined")event.preventDefault();common(event);if(typeof input!=="undefined")val=input.value;if(typeof fn==="function"){if(typeof input!=="undefined"){fn(true,val);}
else fn(true);}
return false;};cancel=function(event){if(typeof event.preventDefault!=="undefined")event.preventDefault();common(event);if(typeof fn==="function")fn(false);return false;};common=function(event){self.hide();self.unbind(document.body,"keyup",key);self.unbind(btnReset,"focus",reset);if(hasOK)self.unbind(btnOK,"click",ok);if(hasCancel)self.unbind(btnCancel,"click",cancel);};key=function(event){var keyCode=event.keyCode;if((keyCode===keys.SPACE&&!hasInput)||(hasInput&&keyCode===keys.ENTER))ok(event);if(keyCode===keys.ESC&&hasCancel)cancel(event);};reset=function(event){if(hasInput)input.focus();else if(!hasCancel||self.buttonReverse)btnOK.focus();else btnCancel.focus();};this.bind(btnReset,"focus",reset);this.bind(btnResetBack,"focus",reset);if(hasOK)this.bind(btnOK,"click",ok);if(hasCancel)this.bind(btnCancel,"click",cancel);this.bind(document.body,"keyup",key);if(!this.transition.supported){this.setFocus();}},bind:function(el,event,fn){if(typeof el.addEventListener==="function"){el.addEventListener(event,fn,false);}else if(el.attachEvent){el.attachEvent("on"+event,fn);}},handleErrors:function(){if(typeof global.onerror!=="undefined"){var self=this;global.onerror=function(msg,url,line){self.error("["+msg+" on line "+line+" of "+url+"]",0);};return true;}else{return false;}},appendButtons:function(secondary,primary){return this.buttonReverse?primary+secondary:secondary+primary;},build:function(item){var html="",type=item.type,message=item.message,css=item.cssClass||"";html+="<div class=\"alertify-dialog\">";html+="<a id=\"alertify-resetFocusBack\" class=\"alertify-resetFocus\" href=\"#\">Reset Focus</a>";if(_alertify.buttonFocus==="none")html+="<a href=\"#\" id=\"alertify-noneFocus\" class=\"alertify-hidden\"></a>";if(type==="prompt")html+="<div id=\"alertify-form\">";html+="<article class=\"alertify-inner\">";html+=dialogs.message.replace("{{message}}",message);if(type==="prompt")html+=dialogs.input;html+=dialogs.buttons.holder;html+="</article>";if(type==="prompt")html+="</div>";html+="<a id=\"alertify-resetFocus\" class=\"alertify-resetFocus\" href=\"#\">Reset Focus</a>";html+="</div>";switch(type){case "confirm":html=html.replace("{{buttons}}",this.appendButtons(dialogs.buttons.cancel,dialogs.buttons.ok));html=html.replace("{{ok}}",this.labels.ok).replace("{{cancel}}",this.labels.cancel);break;case "prompt":html=html.replace("{{buttons}}",this.appendButtons(dialogs.buttons.cancel,dialogs.buttons.submit));html=html.replace("{{ok}}",this.labels.ok).replace("{{cancel}}",this.labels.cancel);break;case "alert":html=html.replace("{{buttons}}",dialogs.buttons.ok);html=html.replace("{{ok}}",this.labels.ok);break;default:break;}
elDialog.className="alertify alertify-"+type+" "+css;elCover.className="alertify-cover";return html;},close:function(elem,wait){var timer=(wait&&!isNaN(wait))?+wait:this.delay,self=this,hideElement,transitionDone;this.bind(elem,"click",function(){hideElement(elem);});transitionDone=function(event){event.stopPropagation();self.unbind(this,self.transition.type,transitionDone);elLog.removeChild(this);if(!elLog.hasChildNodes())elLog.className+=" alertify-logs-hidden";};hideElement=function(el){if(typeof el!=="undefined"&&el.parentNode===elLog){if(self.transition.supported){self.bind(el,self.transition.type,transitionDone);el.className+=" alertify-log-hide";}else{elLog.removeChild(el);if(!elLog.hasChildNodes())elLog.className+=" alertify-logs-hidden";}}};if(wait===0)return;setTimeout(function(){hideElement(elem);},timer);},dialog:function(message,type,fn,placeholder,cssClass){elCallee=document.activeElement;var check=function(){if((elLog&&elLog.scrollTop!==null)&&(elCover&&elCover.scrollTop!==null))return;else check();};if(typeof message!=="string")throw new Error("message must be a string");if(typeof type!=="string")throw new Error("type must be a string");if(typeof fn!=="undefined"&&typeof fn!=="function")throw new Error("fn must be a function");this.init();check();queue.push({type:type,message:message,callback:fn,placeholder:placeholder,cssClass:cssClass});if(!isopen)this.setup();return this;},extend:function(type){if(typeof type!=="string")throw new Error("extend method must have exactly one paramter");return function(message,wait){this.log(message,type,wait);return this;};},hide:function(){var transitionDone,self=this;queue.splice(0,1);if(queue.length>0)this.setup(true);else{isopen=false;transitionDone=function(event){event.stopPropagation();self.unbind(elDialog,self.transition.type,transitionDone);};if(this.transition.supported){this.bind(elDialog,this.transition.type,transitionDone);elDialog.className="alertify alertify-hide alertify-hidden";}else{elDialog.className="alertify alertify-hide alertify-hidden alertify-isHidden";}
elCover.className="alertify-cover alertify-cover-hidden";elCallee.focus();}},init:function(){document.createElement("nav");document.createElement("article");document.createElement("section");if($("alertify-cover")==null){elCover=document.createElement("div");elCover.setAttribute("id","alertify-cover");elCover.className="alertify-cover alertify-cover-hidden";document.body.appendChild(elCover);}
if($("alertify")==null){isopen=false;queue=[];elDialog=document.createElement("section");elDialog.setAttribute("id","alertify");elDialog.className="alertify alertify-hidden";document.body.appendChild(elDialog);}
if($("alertify-logs")==null){elLog=document.createElement("section");elLog.setAttribute("id","alertify-logs");elLog.className="alertify-logs alertify-logs-hidden";document.body.appendChild(elLog);}
document.body.setAttribute("tabindex","0");this.transition=getTransitionEvent();},log:function(message,type,wait){var check=function(){if(elLog&&elLog.scrollTop!==null)return;else check();};this.init();check();elLog.className="alertify-logs";this.notify(message,type,wait);return this;},notify:function(message,type,wait){var log=document.createElement("article");log.className="alertify-log"+((typeof type==="string"&&type!=="")?" alertify-log-"+type:"");log.innerHTML=message;elLog.appendChild(log);setTimeout(function(){log.className=log.className+" alertify-log-show";},50);this.close(log,wait);},set:function(args){var k;if(typeof args!=="object"&&args instanceof Array)throw new Error("args must be an object");for(k in args){if(args.hasOwnProperty(k)){this[k]=args[k];}}},setFocus:function(){if(input){input.focus();input.select();}
else btnFocus.focus();},setup:function(fromQueue){var item=queue[0],self=this,transitionDone;isopen=true;transitionDone=function(event){event.stopPropagation();self.setFocus();self.unbind(elDialog,self.transition.type,transitionDone);};if(this.transition.supported&&!fromQueue){this.bind(elDialog,this.transition.type,transitionDone);}
elDialog.innerHTML=this.build(item);btnReset=$("alertify-resetFocus");btnResetBack=$("alertify-resetFocusBack");btnOK=$("alertify-ok")||undefined;btnCancel=$("alertify-cancel")||undefined;btnFocus=(_alertify.buttonFocus==="cancel")?btnCancel:((_alertify.buttonFocus==="none")?$("alertify-noneFocus"):btnOK),input=$("alertify-text")||undefined;form=$("alertify-form")||undefined;if(typeof item.placeholder==="string"&&item.placeholder!=="")input.value=item.placeholder;if(fromQueue)this.setFocus();this.addListeners(item.callback);},unbind:function(el,event,fn){if(typeof el.removeEventListener==="function"){el.removeEventListener(event,fn,false);}else if(el.detachEvent){el.detachEvent("on"+event,fn);}}};return{alert:function(message,fn,cssClass){_alertify.dialog(message,"alert",fn,"",cssClass);return this;},confirm:function(message,fn,cssClass){_alertify.dialog(message,"confirm",fn,"",cssClass);return this;},extend:_alertify.extend,init:_alertify.init,log:function(message,type,wait){_alertify.log(message,type,wait);return this;},prompt:function(message,fn,placeholder,cssClass){_alertify.dialog(message,"prompt",fn,placeholder,cssClass);return this;},success:function(message,wait){_alertify.log(message,"success",wait);return this;},error:function(message,wait){_alertify.log(message,"error",wait);return this;},set:function(args){_alertify.set(args);},labels:_alertify.labels,debug:_alertify.handleErrors};};if(typeof define==="function"){define([],function(){return new Alertify();});}else if(typeof global.alertify==="undefined"){global.alertify=new Alertify();}}(this));