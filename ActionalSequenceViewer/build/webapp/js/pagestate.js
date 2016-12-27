


































/**
 * This variable tracks if the PageState_init() has already been called. If it is called it will be changed to true.
 */
var PageState_initialized = false;

var PageState_pageid = new Date().getTime().toString(36);
var PageState_keepalive_interval_ms = 15000;
var PageState_keepalive_enabled = false;

var PageState_internalEvents = [];
var PageState_serverEvents = [];
var PageState_keepAliveServletBaseURL;	

function PageState_registerInternalEvent(eventid, observerid, callbackfct)
{
	return Observer_registerObserver(PageState_internalEvents, eventid, observerid, callbackfct);
}

function PageState_registerServerEvent(eventid, observerid, callbackfct)
{
	return Observer_registerObserver(PageState_serverEvents, eventid, observerid, callbackfct);
}

function PageState_keepaliveaccept(responseXML, userData, status, statusText)
{
	Observer_fireEvent(PageState_internalEvents, 'keepalive', this, [false]);

	if(status != 200)
	{
		var errormsg;
		var delay;

		if(Math.floor(status/100) == 5)
		{
			delay = PageState_keepalive_interval_ms;
			errormsg = "Server Error";
			Observer_fireEvent(PageState_internalEvents, 'serverconnection', this, [true, false, errormsg]);
		}
		else
		{
			delay = 5000;
			Observer_fireEvent(PageState_internalEvents, 'serverconnection', this, [false, true, errormsg]);
			errormsg = "Server Not Responding";
		}

		

		setTimeout(PageState_sendkeepalive, delay);
		return;
	}

	Observer_fireEvent(PageState_internalEvents, 'serverconnection', this, [true, true, 'Server Connected']);

	PageState_fireEvents(responseXML);

	

	setTimeout(PageState_sendkeepalive, PageState_keepalive_interval_ms);
}

function PageState_fireEvents(responseXML)
{
	var eventNodes = responseXML.getElementsByTagName("event");

	if(!eventNodes)
		return;

	for(var i=0; i<eventNodes.length; i++)
	{
		var attributes = eventNodes[i].attributes;

		if(!attributes)
			continue;

		var paramobj = {};



		for(var j=0; j<attributes.length; j++)
		{
			var attribute = attributes[j];

			paramobj[attribute.name] = attribute.value;


		}

		if(!paramobj.id)
			continue;

		Observer_fireEvent(PageState_serverEvents, paramobj.id, this, [paramobj]);
	}
}

function PageState_keepaliveabort()
{

	Observer_fireEvent(PageState_internalEvents, 'keepalive', this, [false]);
}

function PageState_sendkeepalive()
{
	if (!PageState_keepalive_enabled)
		return;

	var url = PageState_buildUrl();

	Observer_fireEvent(PageState_internalEvents, 'keepalive', this, [true]);

	var result = XMLHttp_GetAsyncRequest(url, PageState_keepaliveaccept, null,
						  PageState_keepaliveabort, 'pagestate_keepalive', true);

	
	
	
}


function PageState_buildUrl()
{
	var url = PageState_keepAliveServletBaseURL;
	url += '?pgid=' + PageState_pageid;

	for(var i=0; i < PageState_serverEvents.length; i++)
		url += '&evid=' + PageState_serverEvents[i].observer_listid;

	return contextUrl(url);
}








function PageState_sendkeepalive_timeout()
{
	
	XMLHttp_AbortAllPendingRequests('pagestate_keepalive');

	Observer_fireEvent(PageState_internalEvents, 'serverconnection', this, [false, true, 'Server Not Responding']);

	
	setTimeout(PageState_sendkeepalive, 100);
}

/**
 * Even if this method is called multiple times it will initialized only once.
 *
 * @lastrev fix36462 - update so that the initialize logic is only called once.
 */
function PageState_init()
{
	if (PageState_initialized)
	{
		return;
	}
	if (typeof PageState_serverid != "undefined")
		PageState_initializeServerId();
	
	setTimeout(PageState_sendkeepalive, 1);

	PageState_initialized = true;
}

function PageState_initializeServerId()
{
	if (PageState_pageid.indexOf('_')<0)
		PageState_pageid = PageState_serverid + "_" + PageState_pageid;
}
