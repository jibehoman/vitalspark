

















Ext.ns('com.actional.serverui');

/**
 * @class A singleton providing access to IPC JavaScript functions.  The name of the available functions is self descriptive.
 */
com.actional.serverui.pctIpc = function()
{
	var TOKEN_NAME;
	var TOKEN_ACTIONAL_ID;

	var ddt = {};

	/** flag to know if we already subscribed to the openajax event request */
	var subscribeToEventRequest = true;

	/**
	 * This method reacts to the openjax event request & publishes the drill down tokens if it
	 * has the drilldown token event.
	 *
	 * @lastrev fix38558 - new method.
	 */
	function onOpenAjaxEventRequest(event, publisherData)
	{
		if (publisherData.events.indexOf('com.actional.serverui.drilldowntoken') > -1)
		{
			var portletId ;
			for (portletId in ddt)
			{
				var drillDownInfo = ddt[portletId];
				var param;

				if (drillDownInfo.type == TOKEN_ACTIONAL_ID)
				{
					param = "ddt.li";
				}
				else
				{
					param = "ddt.name";
				}

				
				OpenAjax.hub.publish('com.actional.serverui.drilldowntoken',
				{
					drillDownTokenParam: param,
					drillDownTokenValue: drillDownInfo.value,
					source: portletId
				}, "pctIpc");
			}
		}
	}

	/**
	 * @lastrev fix38558 - new method.
	 */
	function doSubscribeToOpenAjaxEventRequest()
	{
		if (subscribeToEventRequest)
		{
			OpenAjax.hub.subscribe('com.actional.util.EventRequest', onOpenAjaxEventRequest);
			subscribeToEventRequest = false;
		}
	}

	/**
	 * @lastrev fix38558 - subscribe to openajax event request.
	 */
	function initTokenNames ( name, actionalId )
	{
		TOKEN_ACTIONAL_ID = actionalId;
		TOKEN_NAME = name;

		
		
		doSubscribeToOpenAjaxEventRequest();
	}

	function publish (portletId, name, actionalId )
	{
		var tokens = [ TOKEN_NAME, TOKEN_ACTIONAL_ID ];
		var values = [];
		values[0] = name;
		values[1] = actionalId;
		PCT.eventmanager.publish ( portletId, tokens, values );
	}

	/**
	 * This method reacts to the ipc call whether it is a logicalId or just name.
	 *
	 * if we get both the tokens in a single call we only consider the logicalId
	 * and ignore the name.
	 *
	 * @lastrev fix37586 - use proper drilldown based on logicalId or name.
	 */
	function ipcCallback ( srcPortletId, eventType, tokens, values, destinationPortletId )
	{
		var actionalId = null;
		var actionalName = null;

		for (var i = 0; i < tokens.length; i++)
		{
			if (tokens[i] == TOKEN_ACTIONAL_ID)
			{
				actionalId = values[i];
			}
			else if (tokens[i] == TOKEN_NAME)
			{
				actionalName = values[i];
			}
		}

		if (actionalId)
		{
			
			drilldown(destinationPortletId, TOKEN_ACTIONAL_ID, actionalId);
		}
		else if (actionalName)
		{
			drilldown(destinationPortletId, TOKEN_NAME, actionalName);
		}
	}

	/**
	 * @lastrev fix37565 - subscribe the portlet in such a way that ipcCallback knows the portletId it is dealing with
	 */
	function subscribe (portletId)
	{
		PCT.eventmanager.registerPortlet ( portletId, this, ipcCallback );
	}

	/**
	 * store the map to portletId -> drillDownToken which is used while updating the content of portlet.
	 *
	 * @lastrev fix37599 - publish the drill down tokens to summary graph.
	 */
	function drilldown(portletId, tokenType, value)
	{
		ddt[portletId] = {type: tokenType, value: value};

		
		if (window['onNewGather' + portletId])
		{
			window['onNewGather' + portletId](true);
		}
		else
		{
			var param;
			if (tokenType == TOKEN_ACTIONAL_ID)
			{
				param = "ddt.li";
			}
			else
			{
				param = "ddt.name";
			}
			
			OpenAjax.hub.publish('com.actional.serverui.drilldowntoken',
			{
				drillDownTokenParam: param,
				drillDownTokenValue: value,
				source: portletId
			}, "pctIpc");
		}
	}

	/**
	 * return the drill down token based on the portletId
	 *
	 * @lastrev fix37586 - this will directly return the url param & value to add considering if it
	 * 			is a logicalId or just name.
	 */
	function getDrillDownTokenParam(portletId)
	{
		if (ddt[portletId])
		{
			var type = ddt[portletId].type;
			var value = ddt[portletId].value;

			if (type == TOKEN_ACTIONAL_ID)
			{
				return '&ddt.li=' + value;
			}
			else if (type == TOKEN_NAME)
			{
				return '&ddt.name=' + value;
			}
		}
		return '';
	}

	return  { publish: publish
		, subscribe: subscribe
		, initTokenNames: initTokenNames
		, getDrillDownTokenParam: getDrillDownTokenParam
	    	};
} ();
