

















/**
 *@lastrev fix39675 - Added support for Key Certificate renewal.
 */

Ext.namespace('com.actional.util');

if(Ext.isLinux && Ext.isGecko)
{
	
	
	
	
	
	
	
	Ext.useShims = true;
}





function trim(str)
{
	if (isEmptyString(str))
		return str;

	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

/**  check if empty string */
function isEmptyString(str)
{
    return (str === undefined || 0 === str.length);
}

/** @deprecated use Ext.Element.show or Ext.Element.hide */
function setElemIdVisible(isvisible, elemid)
{
	if(isvisible)
		showElem(elemid);
	else
		hideElem(elemid);
}

/** @deprecated use Ext.Element.show or Ext.Element.hide */
function setElemVisible(isvisible, elem)
{
	if(isvisible)
		elem.style.display = '';
	else
		elem.style.display = 'none';
}

/** @deprecated use Ext.Element.hide */
function hideElem(elemid)
{
	var elem = document.getElementById(elemid);

	if(!elem)
		return;

	elem.style.display = 'none';
}

/** @deprecated use Ext.Element.show */
function showElem(elemid)
{
	var elem = document.getElementById(elemid);

	if(!elem)
		return;

	elem.style.display = '';
}

/** @deprecated use Ext.Element.show */
function elemVisible(elemid)
{
	var elem = document.getElementById(elemid);

	if(!elem)
		return false;

	if(elem.style.display == 'none')
		return false;

	return true;
}

var sectionIdTodisabledElementsMap = {};







function setSectionVisible(sectionId,isVisible)
{
	if(typeof(sectionId) == 'string')
	{
		
		
		var sectionElem = document.getElementById(sectionId+'_sectionId');
		if(!sectionElem)
		{
			
			
			sectionElem = document.getElementById(sectionId);
		}
		if(sectionElem)
		{
			sectionElem.style.display = isVisible ? '' : 'none';
			var disabledChidren = sectionIdTodisabledElementsMap[sectionId];
			disabledChidren = disableDescendantFormElements(sectionElem,disabledChidren,!isVisible);
			sectionIdTodisabledElementsMap[sectionId] = disabledChidren;
		}
	}
}







function disableDescendantFormElements(elem, disabledChildrenArray, disabled)
{
	if(disabledChildrenArray && disabledChildrenArray.length != 0)
	{
		for(var i = 0; i < disabledChildrenArray.length; i++)
		{
			if(disabledChildrenArray[i])
			{
				disabledChildrenArray[i].disabled = disabled;
			}
			else
			{
				
				
				disabledChildrenArray.splice(i,1);
				i--;
			}
		}
		return disabledChildrenArray;
	}

	disabledChildrenArray = new Array();
	if(elem && elem.hasChildNodes() )
	{
		var childNodes = elem.childNodes;
		for(var j=0;j < childNodes.length;j++)
		{
			var child = childNodes[j];
			disabledChildrenArray = disabledChildrenArray.concat(disableDescendantFormElements(child, null, disabled));
			if(canBeDisabled(child) && child.disabled != disabled)
			{
				child.disabled = disabled;
				disabledChildrenArray[disabledChildrenArray.length] = child;
			}
		}
	}
	return disabledChildrenArray;
}



function canBeDisabled(elem)
{
	if(elem && elem.tagName)
	{
		var tagName = elem.tagName.toUpperCase();
		if(tagName == "INPUT" || tagName == "BUTTON"
	 		|| tagName == "TEXTAREA" || tagName == "OPTION"
	 		|| tagName == "OPTGROUP" || tagName == "SELECT")
		{
			return true;
		}
	}
	return false;
}

function setElemIdDisabled(disable, elemid)
{
	setElemDisabled(disable, elemid);
}

function setElemDisabled(disable, elem)
{
	var extElem = Ext.get(elem);
	if (!extElem)
		return;
	var domElem = extElem.dom;
	if (canBeDisabled(domElem))
		domElem.disabled = disable;
	if (isTextFieldElem(domElem) || domElem.tagName.toUpperCase() == "SELECT")
	{
		if (disable)
			extElem.addClass('disabledbackground');
		else
			extElem.removeClass('disabledbackground');
	}
	else if (isButton(domElem))
	{
		if (disable)
		{
			if (extElem.hasClass('button'))
				extElem.replaceClass('button', 'disabledbutton');
			else if (extElem.hasClass('wizardbutton'))
				extElem.replaceClass('wizardbutton', 'disabledwizardbutton');
		}
		else
		{
			if (extElem.hasClass('disabledbutton'))
				extElem.replaceClass('disabledbutton', 'button');
			else if (extElem.hasClass('disabledwizardbutton'))
				extElem.replaceClass('disabledwizardbutton', 'wizardbutton');
		}
	}
}

function setElemReadOnly(readonly, elem)
{
	var extElem = Ext.get(elem);
	if (typeof extElem == 'undefined')
		return;
	var domElem = extElem.dom;
	if (readonly)
		domElem.setAttribute('readOnly', 'true');
	else
		domElem.removeAttribute('readOnly');
	if (isTextFieldElem(domElem))
	{
		if (readonly)
			extElem.addClass('readonlybackground');
		else
			extElem.removeClass('readonlybackground');
	}
}

function isTextFieldElem(elem)
{
	if (elem.tagName.toUpperCase() == "TEXTAREA")
		return true;
	if (elem.tagName.toUpperCase() == "INPUT")
	{
		var type = elem.type ? elem.type.toUpperCase() : undefined;
		return (type == "TEXT" || type == "FILE" || type == "PASSWORD");
	}
	return false;
}

function isButton(elem)
{
	if (elem.tagName.toUpperCase() == "BUTTON")
		return true;
	if (elem.tagName.toUpperCase() == "INPUT" && elem.type && elem.type.toUpperCase() == "SUBMIT")
		return true;
	if (elem.tagName.toUpperCase() == "INPUT" && elem.type && elem.type.toUpperCase() == "BUTTON")
		return true;
	return false;
}


function getAncestor(elem,level)
{
	if (level==0)
		return elem;
	else
	{
		return getAncestor(elem.parentElement?elem.parentElement:elem.parentNode,level-1);
	}
}


function appendElemIdToBody(elemid)
{
	var elem = document.getElementById(elemid);
	var parentElem = elem.parentElement ? elem.parentElement : elem.parentNode;
	if (parentElem != document.body)
	{
		elem = parentElem.removeChild(elem);
		document.body.appendChild(elem);
	}
}

function nopx(txt)
{
   var pos = txt.indexOf('px');
   if(pos == -1)
	return Math.floor(txt);
   return Math.floor(txt.substring(0,pos));
}

function pix(val)
{
   return val + "px";
}

function px(val)
{
	return val + "px";
}

function flashcall(flashobjectid, cmd)
{
	var elem = document.getElementById(flashobjectid);

	if(!elem)
		return;

	if(typeof(elem.SetVariable) != 'undefined')
		elem.SetVariable("flashcall", cmd);
}

function computeScrollbarSize()
{
	var elem = document.getElementById('scrollbarmeasure');

	if(!elem)
	{
		elem = document.createElement('div');
		elem.id = 'scrollbarmeasure';
		elem.style.visibility = 'hidden';
		elem.style.height = '60px';
		elem.style.width = '60px';
		elem.style.position = 'absolute';
		elem.style.left = '-100px';
		elem.style.top = '-100px';
		elem.style.overflow = 'scroll';
		elem.style.border = 'none';

		document.body.appendChild(elem);
	}

	var width = elem.offsetWidth - elem.clientWidth;
	var height = elem.offsetHeight - elem.clientHeight;

	if(Utils_isIE)
	{
		
		
		width+=1;
		height+=1;
	}

	return {width:width, height:height};
}


var BufferedDoc =
{
	lines:[],

	write: function(str)
	{
		this.lines[this.lines.length] = str;
	},

	writeAll: function(doc)
	{
		for(var i=0; i<this.lines.length; i++)
		{
			doc.write(this.lines[i]);
		}

		lines = [];
	}
};








function isStylesheetLoaded(stylesheetUrl)
{
	if (document.styleSheets)
	{
		for (var i=0; i<document.styleSheets.length; i++)
		{
			if (stylesheetUrl == document.styleSheets.item(i).href || document.styleSheets.item(i).href.indexOf(stylesheetUrl)>-1)
				return true;
		}
	}
	return false;
}










function setEventHandler(obj, evname, fn)
{
	if (evname.substring(0,2) == "on")
		evname = evname.substring(2);

	if (obj.attachEvent) {
		obj.attachEvent("on" + evname, fn); 
	} else if (obj.addEventListener) {
		obj.addEventListener(evname, fn, true); 
	} else {
		obj["on" + evname] = fn;
	}
}



function getEvent(evt)
{
	if (typeof evt != "undefined")
		return evt;	
	else if (typeof window.event != "undefined")
		return window.event;	
	else
		return null;
}

/** @deprecated: use Ext.isIE instead */
var Utils_isIE = false;

/** @deprecated: use Ext.isGecko instead */
var Utils_isMozilla = false;

var ua=navigator.userAgent.toLowerCase();
if(ua.indexOf("opera")!=-1)
{}
else if(ua.indexOf("msie")!=-1&&document.all)
  Utils_isIE=true;
else if(ua.indexOf("safari")!=-1)
{}
else if(ua.indexOf("mozilla")!=-1)
  Utils_isMozilla=true;

function getRect(elem)
{
	var rect = new Object();

	

	rect.top = 0;
	rect.left = 0;

	var curelem = elem;
	do {
		rect.top += curelem.offsetTop;
		rect.left += curelem.offsetLeft;
	}
	while (curelem = curelem.offsetParent);

	rect.width = elem.offsetWidth;
	rect.height = elem.offsetHeight;

	return rect;
}



function getRelativeRect(elem, relelem)
{
	var rect = new Object();

	rect.top = 0;
	rect.left = 0;

	var curelem = elem;

	while (curelem && curelem != relelem)
	{
		rect.top += curelem.offsetTop;
		rect.left += curelem.offsetLeft;

		curelem = curelem.offsetParent;
	}

	rect.width = elem.offsetWidth;
	rect.height = elem.offsetHeight;

	return rect;
}

function Size()
{
	this.width=0;
	this.height=0;
}

function Size(i,n)
{
	this.width=i;
	this.height=n;
}

var measuringPageSizeElem;

function getWindowSize()
{
	if(!measuringPageSizeElem)
	{
		measuringPageSizeElem = document.createElement('DIV');
		measuringPageSizeElem.style.visibility = 'hidden';
		measuringPageSizeElem.style.position = 'absolute';
		measuringPageSizeElem.style.left = '0px';
		measuringPageSizeElem.style.top = '0px';
		measuringPageSizeElem.style.height = '100%';
		measuringPageSizeElem.style.width = '100%';
		measuringPageSizeElem.innerHTML = "t";
		document.body.appendChild(measuringPageSizeElem);
	}

	return new Size(measuringPageSizeElem.offsetWidth, measuringPageSizeElem.offsetHeight);
}

function getWindowHeight()
{
	var windowSize;

	if (window.innerHeight)
	{
		windowSize = window.innerHeight;
	}
	else if (document.body.clientHeight)
	{
		windowSize = document.body.clientHeight;
	}

	return windowSize;
}

function getElementSize(elem)
{
	return new Size(elem.offsetWidth, elem.offsetHeight);
}


function setCheck(elemid, checked)
{
	var elem = document.getElementById(elemid);
	if(!elem) return;

	elem.checked = checked;
}


function isChecked(elemid)
{
	var elem = document.getElementById(elemid);
	if(!elem) return false;
	return elem.checked;
}

/** @deprecated: use Ext.Element.update */
function setInnerHtmlToElement(elem, newHtml)
{
	if (elem)
		elem.innerHTML = newHtml;
}

/** @deprecated: use Ext.Element.update */
function setInnerHtmlToElementWithId(elemId, newHtml)
{
	var elem = document.getElementById(elemId);
	if (elem)
		elem.innerHTML = newHtml;
}







function trace(msg)
{
	if(!DebugTrace_initIfNeeded())
		return;

	var windowElem = document.getElementById('DebugTrace_tracewindow');
	var dataElem = document.getElementById('DebugTrace_tracedata');

	if(!windowElem || !dataElem)
		return;

	try
	{
		if(typeof(msg) == "object")
			msg = msg +" = " + Ext.encode(msg);
	}
	catch(e)
	{
		
	}

	if (DebugTrace_includeTime)
		msg = (new Date()).format('H:i:s.u') + ': ' + msg;

	if (DebugTrace_newestOnTop)
		dataElem.innerHTML = "<li>" + msg + "</li>\n" + dataElem.innerHTML;
	else
		dataElem.innerHTML += "<li>" + msg + "</li>\n";
	windowElem.style.display = '';
}

function cleartrace()
{
	var windowElem = document.getElementById('DebugTrace_tracewindow');
	var dataElem = document.getElementById('DebugTrace_tracedata');

	if(!windowElem || !dataElem)
		return;

	dataElem.innerHTML = "";
	windowElem.style.display = 'none';
}

function DebugTrace_initIfNeeded()
{
	if(!document.body)
	{
		
		return false;
	}

	if(!document.getElementById('DebugTrace_tracewindow'))
		DebugTrace_init();

	return true;
}

function DebugTrace_init()
{
	
	var traceCfg = null;
	if (typeof UserSettings_Read == 'function')
	{
		traceCfg = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'tracecfg');
		if (traceCfg)
			traceCfg = traceCfg.split('_');
	}

	var stylemarkup="<style type='text/css'> ul#DebugTrace_tracedata li { list-item-type:none;text-indent: -8px; margin-left:8px }</style>";

	if (typeof Ext == 'object' && window.location.search.indexOf('plaintrace=1') < 1)
	{
		var windowCmp = new Ext.Window(
		{
			id: 'DebugTrace_tracewindow',
			title: 'Debug Trace',
			layout : 'fit',
			width : 600,
			height : 500,
			autoScroll : true,
			bodyBorder : false,
			border: false,
			collapsible : true,
			animCollapse : false,
			constrainHeader : true,
			maximizable : true,
			shadow: false,
			minHeight : 40,
			minWidth : 60,
			bodyStyle: { 'background':'#FDFA10'},
			html: stylemarkup+'<ul style="font-family:Verdana;font-size:10px;" id=DebugTrace_tracedata></ul>',
			tbar:[{
				text:'Options',
				tooltip: 'Select option',
				tooltipType: 'title',
				menu: new Ext.menu.Menu(
					{
						editable : false,
						items: [{
								text: 'Show newest entries on top',
								checked: DebugTrace_newestOnTop,
								checkHandler: function(item, checked) {
									DebugTrace_newestOnTop = checked;
									trace('--------');
								}
							},
							{
								text: 'Include time',
								checked: DebugTrace_includeTime,
								checkHandler: function(item, checked){
									DebugTrace_includeTime = checked;
								}
							}],
						name : 'optionsCB',
						mode : 'local'
					})
			},
			' ',
			'-', 
			' ',
			{
				text:'Clear',
				handler:function(){
					var dataElem = document.getElementById('DebugTrace_tracedata');
					if(dataElem)
						dataElem.innerHTML = "";;}
			},
			' ',
			'-'] 
		});

		windowCmp.show();
	}
	else
	{
		var winElem = document.createElement('DIV');

		winElem.id = 'DebugTrace_tracewindow';
		winElem.style.display = 'none';
		winElem.style.border = '2px dotted #605F06';
		winElem.style.position = 'absolute';
		winElem.style.left = traceCfg ? traceCfg[0] : '30px';
		winElem.style.top = traceCfg ? traceCfg[1] : '30px';
		winElem.style.zIndex = '300';
		winElem.style.background = '#FDFA10';

		winElem.innerHTML =
			stylemarkup+'<table><tr><th style="background:black;padding:0 0 0 0;"><table cellspacing=0 cellpadding=0 width="100%"><tr>' +
			'<th id=DebugTrace_titlebar style="cursor:move;padding:0 0 0 0;color:yellow;text-align:left;font-family:Verdana;font-size:10px;font-weight:bold">Debug Trace</th>' +
			'<th style="color:yellow;padding:0 0 0 0;font-family:Verdana;font-size:10px;font-weight:bold"><a href="#" onclick="cleartrace();return false;" title="Clear trace" style="color:yellow;text-decoration:none">X</a></th>' +
			'</tr></table></th></tr>' +
			'<tr><td style="font-family:Verdana;font-size:10px;"><ul id=DebugTrace_tracedata></ul></td></tr></table>';

		document.body.appendChild(winElem);

		var elem = document.getElementById('DebugTrace_titlebar');
		if (typeof draglogic != 'undefined')
			draglogic.init(elem);
		elem.onDragStart  = DebugTrace_onDragStart;
		elem.onDragMove  = DebugTrace_onDragMove;
	}
}

var DebugTrace_dragx;
var DebugTrace_dragy;
var DebugTrace_newestOnTop = false;
var DebugTrace_includeTime = false;

function DebugTrace_onDragStart(ev)
{
	var elem = document.getElementById('DebugTrace_tracewindow');
	var rect = getRect(elem);

	DebugTrace_dragx = rect.left;
	DebugTrace_dragy = rect.top;
}

function DebugTrace_onDragMove(deltax, deltay, ev)
{
	var elem = document.getElementById('DebugTrace_tracewindow');

	elem.style.left = DebugTrace_dragx + deltax;
	elem.style.top = DebugTrace_dragy + deltay;
	if (typeof UserSettings_Write == 'function')
		UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, 'tracecfg', elem.style.left+'_'+elem.style.top);
}

function strToNumber(str)
{
	if(!str)
		return 0;

	var n = Number(str);

	if(isNaN(n))
		return 0;

	return n;
}








function DateUtil_serverTime2userTime(serverTime)
{
	var server_UTC_offset	= (new Date().getTimezoneOffset()/60)*(-1); 
	var local_UTC_offset	= (new Date().getTimezoneOffset()/60)*(-1);

	var userTime = serverTime + ( (server_UTC_offset - local_UTC_offset) * 3600000 );
	return userTime;
}


function DateUtil_userTime2serverTime(userTime)
{
	var server_UTC_offset	= (new Date().getTimezoneOffset()/60)*(-1); 
	var local_UTC_offset	= (new Date().getTimezoneOffset()/60)*(-1);

	var serverTime = userTime - ( (server_UTC_offset - local_UTC_offset) * 3600000 );
	return serverTime;
}


function DateUtil_serverTime2userDate(serverTime, roundToMinute)
{
	var userTime = DateUtil_serverTime2userTime(serverTime);

	
	if (roundToMinute)
		userTime = (userTime + 30000) / 60000 * 60000;

	var userDate = new Date(userTime);
	return userDate;
}


function DateUtil_userDate2serverTime(userDate)
{
	if (!userDate)
		return;
	var userTime = userDate.getTime();
	var serverTime = DateUtil_userTime2serverTime(userTime);
	return serverTime;
}








var CookieAccess =
{
	getAll: function()
	{
		var values = new Object();
		if (document.cookie == "")
			return values;

		var cookies = document.cookie.split(";");
		for(var i=0;i<cookies.length;i++)
		{
                        var n;
                        var v;
			var e = cookies[i].indexOf('=');
			if (e>0)
			{
			    n=cookies[i].substring(0,e);
			    v=cookies[i].substring(e+1);
			}
			else
			{
			    n=cookies[i];
			    v="";
			}
			var pair = cookies[i].split("=");
			values[pair[0]] = unescape(pair[1]);
		}
		return values;
	},

	/**
	 * @lastrev fix35486 - check for duplicates
	 */
	get: function(name, default_)
	{
		if (document.cookie == "")
			return default_;

		var cookies = document.cookie.split("; ");
		name = escape(name);

		var toreturn = default_;
		var count = 0;
		for(var i = 0; i < cookies.length; i++)
		{
                        var n;
                        var v;
			var e = cookies[i].indexOf('=');
			if (e>0)
			{
			    n = cookies[i].substring(0,e);
			    v = cookies[i].substring(e+1);
			}
			else
			{
			    n = cookies[i];
			    v = "";
			}

			if (name == n)
			{
				if (count > 0)
				{
					CookieAccess.cleanCookie(name);
					return default_;
				}
				else
				{
					toreturn = unescape(v);
				}

				count ++;
			}
		}
		return toreturn;
	},

	/**
	 * @lastrev fix35486 - create sub-function
	 */
	set: function(name, value, options)
	{
		var assembledCookie = CookieAccess.assembleCookieStrings(name, value, options);
		var cookieString = assembledCookie.cookieString;
		document.cookie = cookieString;

		var escapedName = escape(name);
		var cookieExists = document.cookie.indexOf(escapedName+'=');

		if (cookieExists >= 1)
		{
			var duplicate = document.cookie.indexOf(escapedName+'=',  cookieExists + 1);

			if (duplicate > 0)
			{
				
				cleanCookie(escapedName);
				
				document.cookie = cookieString;
				cookieExists = document.cookie.indexOf(escapedName+'=');
			}
		}

		if (!document.cookie || cookieExists < 0)
		{
			
			
			
			
			document.cookie = assembledCookie.cookieStringWithoutPath;
		}
	},

	/**
	 * @lastrev fix35486 - new function
	 */
	getCurrentPath: function ()
	{
		var curpath = location.pathname;
		return curpath.substring(0, 1 + curpath.lastIndexOf('/'));
	},

	/**
	 * @lastrev fix35486 - new function, taken from old 'set'
	 */
	assembleCookieStrings: function (name, value, options)
	{
		var cookie_parts = new Array();

		if (value==null)
			value = "";
		var escapedName = escape(name);
		cookie_parts.push(escapedName + "=" + escape(value));

		var cookieStringWithoutPath = '';
		if (options)
		{
			var expires = options["expires"];
			if (expires != null)
			{
				if (typeof expires != "Date")
					expires = new Date(expires);
				cookie_parts.push("expires="+expires.toGMTString());
			}

			var domain = options["domain"];
			if (domain != null)
				cookie_parts.push("domain="+domain);

			if (options["secure"])
				cookie_parts.push("secure");

			cookieStringWithoutPath = cookie_parts.join("; ");
			var path = options["path"];
			if (path != null)
				cookie_parts.push("path="+path);
		}

		var cookieObj = {	'cookieString': cookie_parts.join("; "),
					'cookieStringWithoutPath': cookieStringWithoutPath
				};
		return cookieObj;
	},

	/**
	 * @lastrev fix35486 - new function to clear / expire cookie
	 */
	cleanCookie: function(name)
	{
		if (!document.cookie)
			return;

		var options = new Object();

		options["expires"] = new Date(1);

		var path = CookieAccess.getCurrentPath();

		
		
		while (path != null && path.length > 1)
		{
			options["path"] = path;
			document.cookie = CookieAccess.assembleCookieStrings(name, null, options).cookieString;

			
			var slashpos = path.lastIndexOf('/', path.length-2);

			if (slashpos == -1)
				break;

			path = path.substring(0, slashpos + 1);
		}

		
		options["path"] = "/";
		document.cookie = CookieAccess.assembleCookieStrings(name, null, options).cookieString;
	},

	remove: function(name, options)
	{
		if (options == null)
			options = new Object();

		options["expires"] = new Date(1);
		CookieAccess.set(name, null, options);
	}
};

if(typeof HTMLElement!="undefined" && Ext.isGecko)
{
	
	HTMLElement.prototype.__defineGetter__("innerText", function()
	{
		var tmp = this.innerHTML.replace(/<br>/gi,"\n");
		return tmp.replace(/<[^>]+>/g,"");
	});
}




function extractAllUrlParameters(ignoreElems, paramMap)
{
	var searchString = window.location.search.substring(1);
	var Parameters = new Object();
	var nameValuePairs = searchString.split('&');
	var currentNameValuePair;
	for (var i = 0; i < nameValuePairs.length; i++)
	{
	    currentNameValuePair = nameValuePairs[i].split('=');
	    if (currentNameValuePair[0] && (!ignoreElems ||  !(currentNameValuePair[0] in ignoreElems)))
	    {
		Parameters[currentNameValuePair[0]] = currentNameValuePair[1];
		if (paramMap)
			paramMap[currentNameValuePair[0]] = currentNameValuePair[1];
	    }
	}
	return Parameters;
}


function escapeHTML(val)
{
	return val.replace(/</g,"&lt;");
}


function getProtocol()
{
	if (document.URL.search(/^https:/) != -1)
		return "https";
	else
		return "http";
}



function getElementsByClass(targetClass, parentElem, tagName) {
	var matchingElements = new Array();
	parentElem = parentElem ? parentElem : document; 	
	tagName = tagName ? tagName : '*';			
	var candidateElements = parentElem.getElementsByTagName(tagName);
	var matchingElementLength = 0;
	for (var i=0; i<candidateElements.length; i++)
	{
		var candidateClass = candidateElements[i].className;
		if (	candidateClass == targetClass ||
			candidateClass.indexOf(targetClass+' ')>-1 ||
			candidateClass.lastIndexOf(' '+targetClass)==(candidateClass.length-targetClass.length-1)  )
		{
			matchingElements[matchingElementLength++] = candidateElements[i];
		}
	}
	return matchingElements;
}

function disableAnchor(obj, disable)
{
	if(disable)
	{
		var href = obj.getAttribute("href");
		if(href && href != "" && href != null)
			obj.setAttribute('href_bak', href);
		obj.setAttribute('color_bak', obj.style.color);
		obj.removeAttribute('href');
		obj.style.color='darkgray';
		obj.style.textDecoration = 'none';
	}
	else
	{
		var href1 = obj.getAttribute("href");
		if(href1 == "" || href1 == null)
		{
			obj.setAttribute('href', obj.attributes['href_bak'].nodeValue);
			obj.style.color = 'blue';
			obj.style.textDecoration = 'underline';
		}
	}
}



function setElementOpacity(elem, value)
{
	if(value < 1)
	{
		elem.style.opacity = value;
		if(document.all)
			elem.style.filter = 'alpha(opacity=' + Math.floor(value*100) + ')';
	}
	else
	{
		elem.style.opacity = 1;
		if(document.all)
			elem.style.filter = '';
	}
}





function mousePos(e)
{
	var pos = {x:0, y:0};

	var ev = (!e)?window.event:e;

	if (ev.pageX || ev.pageY)
	{
		pos.x = ev.pageX;
		pos.y = ev.pageY;
	}
	else if (ev.clientX || ev.clientY)
	{
		pos.x = ev.clientX + document.body.scrollLeft;
		pos.y = ev.clientY + document.body.scrollTop;
	}

	return pos;
}

/**
* Checks if the specified CSS class exists on the element.
* @param {String} className The CSS class to check for
* @return true if the class exists, else false
* @deprecated: use Ext.Element.hasClass
*/
function hasClass(elem, className)
{
	return Ext.get(elem).hasClass(className);
}

/**
* Adds one or more CSS classes to the element. Duplicate classes are automatically filtered out.
* @param {String/Array} className The CSS class to add, or an array of classes
* @return the element
* @deprecated: use Ext.Element.addClass
*/
function addClass(elem, className)
{
	var el = Ext.get(elem);
	if(className instanceof Array)
	{
		for(var i = 0, len = className.length; i < len; i++)
		{
			el.addClass(className[i]);
		}
	}
	else
	{
		el.addClass(className);
	}

	return el.dom;
}

var regexCache = {};

/**
* Removes one or more CSS classes from the element.
* @param {String/Array} className The CSS class to remove, or an array of classes
* @return the element
* @depreacted: use Ext.Element.removeClass
*/
function removeClass(elem, className)
{
	if(!className || !elem.className)
	{
	    return elem;
	}

	if(className instanceof Array)
	{
	    for(var i = 0, len = className.length; i < len; i++)
	    {
		removeClass(elem, className[i]);
	    }
	}
	else
	{
	    if(hasClass(elem, className))
	    {
	        var regexp = regexCache[className];
	        if (!regexp)
	        {
	           regexp = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)', "g");
	           regexCache[className] = regexp;
	        }

		elem.className = trim(elem.className.replace(regexp, " "));
	    }
	}
	return elem;
}


function getViewportHeight()
{
	if (window.innerHeight != undefined) return window.innerHeight;
	if (document.compatMode == 'CSS1Compat') return document.documentElement.clientHeight;
	if (document.body) return document.body.clientHeight;

	return undefined;
}

function getViewportWidth()
{
	if (window.innerWidth != undefined) return window.innerWidth;
	if (document.compatMode == 'CSS1Compat') return document.documentElement.clientWidth;
	if (document.body) return document.body.clientWidth;
}

function getScrollTop()
{
	if (self.pageYOffset) 
	{
		return self.pageYOffset;
	}
	else if (document.documentElement && document.documentElement.scrollTop)
	{
		
		return document.documentElement.scrollTop;
	}
	else if (document.body) 
	{
		return document.body.scrollTop;
	}
}

function getScrollLeft()
{
	if (self.pageXOffset) 
	{
		return self.pageXOffset;
	}
	else if (document.documentElement && document.documentElement.scrollLeft)
	{
		
		return document.documentElement.scrollLeft;
	}
	else if (document.body) 
	{
		return document.body.scrollLeft;
	}
}








function joinStringsUsingComma(tokens)
{
	var expr = '';

	for (var i = 0; i < tokens.length; i++)
	{
		if (i > 0)
			expr += ',';

		if (tokens[i] == null)
			expr += '\\x';
		else if (tokens[i].length == 0)
			expr += '\\ ';
		else
			expr += tokens[i].replace(/\\/g, '\\\\').replace(/,/g,'\\,');
	}
	return expr;
}

/**
* Utility function to get the Hour and Mins of a date in the AM/PM format
* @lastrev fix34887 - new function.
*/
function getMeridiemHrMins(aDate)
{
	if(aDate)
	{
		var hours = aDate.getHours();
		var mins = aDate.getMinutes();
		var pm = hours>11;
		if (mins < 10)
		{
			mins = '0' + mins;
		}
		hours = hours%12;
		if (hours == 0)
		{
			hours = "12";
		}

		return hours+':'+mins + ' ' + (pm ? "PM" : "AM");
	}
	return "";
}

/**
*
* @lastrev fix35647 - making sure that com.actional.* utility namespaces are created
*/
(function(){
	Ext.namespace('com.actional.BaseUtil');
	Ext.apply(com.actional.BaseUtil,
	{
		trace : trace,
		cleartrace : cleartrace,

		extractAllUrlParameters : extractAllUrlParameters,
		escapeHTML : escapeHTML,
		getProtocol : getProtocol,
		getElementsByClass : getElementsByClass,
		disableAnchor : disableAnchor,
		setElementOpacity : setElementOpacity,
		mousePos : mousePos
	});

	Ext.namespace('com.actional.StringUtils');
	Ext.apply(com.actional.StringUtils,
	{
		joinStringsUsingComma : joinStringsUsingComma,
		trim : trim,
		strToNumber : strToNumber
	});

	Ext.namespace('com.actional.DomUtils');
	Ext.apply(com.actional.DomUtils,
	{
		canBeDisabled : canBeDisabled,
		setElemIdDisabled : setElemIdDisabled,
		setElemDisabled : setElemDisabled,
		setElemReadOnly : setElemReadOnly,
		isTextFieldElem : isTextFieldElem,
		isButton : isButton,
		getAncestor : getAncestor,
		appendElemIdToBody : appendElemIdToBody
	});

	Ext.namespace('com.actional.UiUtils');
	Ext.apply(com.actional.UiUtils,
	{
		setSectionVisible : setSectionVisible,
		disableDescendantFormElements : disableDescendantFormElements,

		nopx : nopx,
		pix : pix,
		px : px,
		flashcall : flashcall,
		computeScrollbarSize : computeScrollbarSize,

		isStylesheetLoaded : isStylesheetLoaded,

		getRect : getRect,
		getRelativeRect : getRelativeRect,
		size : Size,
		getWindowSize : getWindowSize,
		getWindowHeight : getWindowHeight,
		getElementSize : getElementSize,
		setCheck : setCheck,
		isChecked : isChecked,
		getViewportHeight : getViewportHeight,
		getViewportWidth : getViewportWidth,
		getScrollTop : getScrollTop,
		getScrollLeft : getScrollLeft
	});

	Ext.namespace('com.actional.CookieUtil');
	Ext.apply(com.actional.CookieUtil,
	{
		getAll : CookieAccess.getAll,
		get : CookieAccess.get,
		set : CookieAccess.set,
		remove : CookieAccess.remove
	});
})();

/**
 * @class com.actional.EventDataOwner
 *
 * This is the generic logic for a standalone EventDataOwner. An EventDataOwner
 * is the "guardian" of event-related data and will "generate or repeat" events
 * when receiving 'com.actional.util.EventRequest' events.
 *
 * It supports dealing with a list of events.
 *
 * It can be subclassed to enable special processing. (merging data from various events, etc.)
 *
 * It might also deal with saving the data and restoring it when the page loads.
 *
 * This is the core functionality to remove "central processing". Components
 * do not all appear on the screen at once. They come and go. Since the interface
 * is "event-based" (openajax), this creates a bit of a problem:  Events are only sent
 * when the data is modified. This is a "push" model. For components that appear
 * later, it missed all "previous" events and do not have the required information.
 * Trying to get the information would typically mean to go "around"
 * openajax events and "pulling" the data by calling a javascript method. That
 * creates a dependency that we are trying to avoid. The solution is to "request"
 * events that contains data that are required by the component when it first
 * wakes up. Then someone on the bus would respond by simply "repeating" the
 * event. The component would then receive that event to "initialize" itself. One
 * idea is to re-use the same code that would normally process the event without
 * the "notion" of "first initialization". In other words, a "single" code base
 * is required to process a certain "input".
 *
 * @lastrev fix38531 - add transientFields
 */
com.actional.EventDataOwner = function()
{
	this.events = {};
	this.source = 'owner';
	this.itsTransientFields = undefined;
};

com.actional.EventDataOwner.prototype =
{
	/** call this after adding events. This will subscribe to the EventRequest
	 *
	 * @param {string} source (Optional)
	 */
	finalSetup: function(source, transientFields)
	{
		this.itsTransientFields = transientFields;

		if(typeof source != 'string')
			throw 'EventDataOwner.finalSetup() source: '+source+' is not a string';

		if(source)
			this.source = source;

		var eventList = [];
		for(var eventid in this.events)
			eventList[eventList.length] = eventid;

		OpenAjax.hub.subscribe('com.actional.util.EventRequest', this.eventRequest, this,
			{'source':this.source, 'events':eventList});
	},

	events: undefined,
	source: undefined,

	/**
	 *
	 * @param {string} eventid - the openajax event name
	 * @param {object} initialData   (optional) default to no data.
	 * 	While data is null/undefined, this
	 * 	object won't respond to the corresponding EventRequests.
	 * @param {function} handler  (optional) function handler when receiving the eventRequest
	 * @param {object} scope (optional) defaults to "this"
	 */
	addEvent: function(eventid, initialData, handler, scope)
	{
		if(typeof eventid != 'string')
			throw 'EventDataOwner.addEvent() source: '+eventid+' is not a string';

		if(!handler)
			handler = this.defaultHandler;

		if(!scope)
			scope = this;

		var event = { 'eventid': eventid, data:initialData, 'handler':handler, 'scope':scope };

		this.events[eventid] = event;

		this.subscribeEvent(eventid);
	},

	/**
	 * subscribe to the event to support "mirroring" the last data sent
	 * @param {} eventid
	 */
	subscribeEvent: function(eventid)
	{
		OpenAjax.hub.subscribe(eventid, this.onEvent, this, {'source':this.source});
	},

	onEvent: function(name, publisherdata, subscriberdata)
	{
		
		this.updateData(name, publisherdata);
	},

	updateData: function(eventid, publisherdata)
	{
		var event = this.events[eventid];

		if(!event)
			throw "Event " + eventid + " not previously registered in EventDataOwner '" + this.source + "'";

		if(this.itsTransientFields)
		{
			
			publisherdata = Ext.applyIf({}, publisherdata);

			for(var i = 0; i < this.itsTransientFields.length; i++)
			{
				delete publisherdata[this.itsTransientFields[i]];
			}
		}

		event.data = publisherdata;
	},

	sendAllEvents: function()
	{
		for(var eventid in this.events)
			this.sendEvent(eventid);
	},

	sendEvent: function(eventid)
	{
		var event = this.events[eventid];
		if (event.data)
			event.handler.call(event.scope, eventid, event.data);
	},

	eventRequest: function(name, publisherdata, subscriberdata)
	{
		var eventList = publisherdata.events;

		for(var i=0; i<eventList.length; i++)
		{
			var eventid = eventList[i];
			var event = this.events[eventid];

			if(!event)
				continue;

			this.sendEvent(eventid);
		}
	},

	defaultHandler: function(eventid, data)
	{
		
		data.source = this.source;

		OpenAjax.hub.publish(eventid, data);
	}
};

var traceOpenAjax_publishFunction;
var traceOpenAjax_subscribeFunction;
var traceOpenAjax_unsubscribeFunction;

function traceOpenAjaxEvents(nameFilter, showfulllines)
{
	if(traceOpenAjax_publishFunction)
		return;

	traceOpenAjax_publishFunction = OpenAjax.hub.publish;

	OpenAjax.hub.publish = function(name, publisherData)
	{
		var source = "n/a";
		if(publisherData && publisherData.source)
			source = publisherData.source;

		var lastdot = name.lastIndexOf('.');

		var displayname = name;

		if(lastdot > 0)
		{
			displayname = '<span style="cursor:default;font-weight:bold;color:blue;cursor:default" title="'+name+'">' + name.substr(lastdot+1) + '</span>';
		}

		var datastr = Ext.encode(publisherData);

		var displayeddata='';

		if(!showfulllines && datastr.length > 80)
		{
			var title = datastr.replace(/"/g,"'").replace(/>/g,'&gt;');
			displayeddata = datastr.substr(0,80) + '<span style="color:white;background-color:blue;" title="'+title+'">...</span>';
		}
		else
		{
			displayeddata = datastr;
		}

		if ( !nameFilter || (name.indexOf(nameFilter) > -1) )
			trace('OAEvent[<i>' + source + '</i>] ' + displayname + ' data:' + displayeddata);

		return traceOpenAjax_publishFunction.apply(OpenAjax.hub, arguments);
	};

	traceOpenAjax_subscribeFunction = OpenAjax.hub.subscribe;

	OpenAjax.hub.subscribe = function(name, callback, scope, subscriberData)
	{
		var source = 'n/a';

		if(subscriberData)
		{
			if(subscriberData.source)
				source = subscriberData.source;
			else if(subscriberData.objectId)
				source = subscriberData.objectId;
		}

		if ( !nameFilter || (name.indexOf(nameFilter) > -1) )
			trace('OASubscribe[<i>' + source + '</i>] ' + name + ' data:' + Ext.encode(subscriberData));

		return traceOpenAjax_subscribeFunction.apply(OpenAjax.hub, arguments);
	};

	traceOpenAjax_unsubscribeFunction = OpenAjax.hub.unsubscribe;

	OpenAjax.hub.unsubscribe = function(subscription)
	{
		trace('OAUnsubscribe[] data:' + Ext.encode(subscription));

		return traceOpenAjax_unsubscribeFunction.apply(OpenAjax.hub, arguments);
	};
}

function untraceOpenAjaxEvents()
{
	if(!traceOpenAjax_publishFunction)
		return;

	OpenAjax.hub.publish = traceOpenAjax_publishFunction;
	traceOpenAjax_publishFunction = undefined;

	OpenAjax.hub.subscribe = traceOpenAjax_subscribeFunction;
	traceOpenAjax_subscribeFunction = undefined;

	OpenAjax.hub.unsubscribe = traceOpenAjax_unsubscribeFunction;
	traceOpenAjax_unsubscribeFunction = undefined;
}

if(window.location.search && window.location.search.indexOf('traceopenajax') >= 0)
{
	var urlParams = extractAllUrlParameters();
	if(urlParams['traceopenajax']
		|| ( urlParams['traceopenajaxfull'] && urlParams['traceopenajaxfull'] != '0' )
		|| ( urlParams['traceopenajaxfilter'] && urlParams['traceopenajaxfilter'] != '0' ))
	{
		traceOpenAjaxEvents(urlParams['traceopenajaxfilter'], !!urlParams['traceopenajaxfull']);
	}
}


/**
    Clears the selected applications/service groups and Enables only required buttons.
    @lastrev fix39494 - new function
*/
function clearSelection(tableFormName, tableId)
{
	var cbList = document.getElementsByName(tableFormName);

	if (isChecked(tableId))
		setCheck(tableId, false);

	for (var i = 0; i < cbList.length; i++)
	{
		cb = cbList.item(i);
		if (cb != null && cb.checked)
			cb.checked = false;
	}
}

/**
    Confirmation dialogue box for application and service groups deletion in AI
    @lastrev fix39494 - new function
*/
function deleteConfirm( component, thisform, tableFormName, tableId, itsAction, itsRequiresSelection)
{
	Ext.MessageBox.show({
		title : 'Confirm Deletion',
		msg : 'Do you really want to delete the selected '+ component + '?',
		cls: 'act-confirm-msgbox',  
		buttons:{yes: "Delete", no:"Cancel"},
		icon: Ext.MessageBox.WARNING,
		fn: function(btn)
		{
			if (btn == 'yes')
			{
				if (isValidSelection(thisform, tableFormName, itsRequiresSelection))
				{
					thisform.action = itsAction + "?task" + tableFormName + "=Delete&Deleteverify=" + itsRequiresSelection;
					thisform.submit();
				}
			}
			else
			{
				clearSelection( tableFormName, tableId);
				eval("EnableRequiredSelectionButton"+ tableId +"()");
			}
		}
	});
}

/**
    Checks for valid selection of items for confirm deletion.
    @lastrev fix39494 - new function
*/
function isValidSelection(thisform, tableFormName, itsRequiresSelection)
{
	var validSelection = false;

	if (itsRequiresSelection)
	{
		for (i = 0; i < thisform.length; i++)
		{
			element = thisform.elements[i];
			if (element.name == tableFormName && element.checked)
			{
				validSelection = true;
				break;
			}
		}
	}
	return validSelection;
}

/**
    Checks for table multiple items selection.
    @lastrev fix39675 - new function
*/
function isMultipleSelection(thisform, tableFormName, tableId, itsRequiresSelection)
{
	var multiSelection = false;
	var count = 0;

	var rows = document.getElementById(tableId).childNodes.length; 

	if (itsRequiresSelection)
	{
		for (i = 0; i < thisform.length; i++)
		{
			element = thisform.elements[i];

			if (element.name == tableFormName + "selectallbox" && element.checked && rows > 2)
			{
				multiSelection = true;
				break;
			}
			if (element.name == tableFormName && element.checked)
			{
				if (count >= 1)
				{
					multiSelection = true;
					break;
				}
				count++;
			}
		}
	}
	return multiSelection;
}

/**
    Form submission for Certificate renew.
    @lastrev fix39675 - new function
*/
function selectAndSubmit(thisForm, tableFormName, tableId, itsAction, itsRequiresSelection)
{
	var objKeyId;
	if (isMultipleSelection(thisForm, tableFormName, tableId, itsRequiresSelection))
	{
		Ext.MessageBox.show({
			title : 'Renewal Selection Error',
			msg : 'You cannot renew multiple certificates at once. Please revise your selection.',
			cls: 'act-confirm-msgbox',  
			buttons:{yes: "OK"},
			icon: Ext.MessageBox.INFO,
			fn: function(btn)
			{
				clearSelection(tableFormName, tableId);
				disableButton("Renew", tableFormName);
				disableButton("Delete", tableFormName);
			}
		});
	} else
	{
		if (itsRequiresSelection)
		{
			for (i = 0; i < thisForm.length; i++)
			{
				element = thisForm.elements[i];

				if (element.name == tableFormName && element.checked)
				{
					objKeyId = element.defaultValue;
				}
			}
		}
		thisForm.action = itsAction + "?keyID=" + objKeyId;
		thisForm.submit();
	}
}

/**
    Diable the passed in button.
    @lastrev fix39675 - new function
*/
function disableButton(buttonName,tableFormName)
{
	document.getElementById(tableFormName + buttonName).className = 'disabledbutton';
}

/**
    Generic Edit Confirmation Dialog Box in AI
    @lastrev fix39668 - new function
*/
function getEditConfirmation( thisform, itsMessage, itsTitle, itsTrueAction, itsFalseAction)
{
	Ext.MessageBox.show({
		title : itsTitle,
		msg : itsMessage,
		cls: 'act-confirm-msgbox',  
		buttons:{yes: "Yes", no:"No"},
		icon: Ext.MessageBox.WARNING,
		fn: function(btn)
		{
			if (btn == 'yes')
			{
				if (itsTrueAction != null)
				{
					thisform.action = itsTrueAction;
					thisform.submit();
				}
			}
			else if (itsFalseAction != null)
			{
                                thisform.action = itsFalseAction;
                                thisform.submit();
                        }
		}
	});
}































