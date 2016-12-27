






















/**
 * This will be set to true if the AdminPage_init method has already been called.
 */
var AdminPage_initialized = false;

/**
 * This will be set to true if the AdminPage_registerEventRequestListener() has already been called.
 */
var AdminPage_registerEventRequestListener_registered = false;









var AdminPage_LastGatherTime = null;

var AdminPage_TimeUnitsToEndTimes = null;











function AdminPage_registerNewIntervalEvent(observerid, callbackfct)
{
	OpenAjax.hub.subscribe('com.actional.serverui.newGatherInterval', callbackfct, this, {source:'adminpage'});
}

function AdminPage_updateStatus(params)
{
	

	var hasAlarms = params.a?strToNumber(params.a>0):false;
	var hasWarnings = params.w?strToNumber(params.w>0):false;

	var hasAlerts = hasAlarms || hasWarnings;

	setElemIdVisible(!hasAlerts, 'status_alerts_none');
	setElemIdVisible(hasAlerts, 'status_alerts_some');

	setElemIdVisible(hasAlarms, 'status_alarms');
	setElemIdVisible(hasWarnings, 'status_warnings');

	var elem = document.getElementById('status_warnings');
	if(elem)
	{
		if(hasAlarms && hasWarnings)
			elem.style.marginLeft = '7px';
		else
			elem.style.marginLeft = '0px';
	}

	setInnerHtmlToElementWithId('status_alarms_count', params.a);
	setInnerHtmlToElementWithId('status_warnings_count', params.w);

	

	var hasStabilizersOn = params.stabon?strToNumber(params.stabon>0):false;
	var hasLockedStabilizers = params.stablock?strToNumber(params.stablock>0):false;

	var hasStabilizers = hasStabilizersOn || hasLockedStabilizers;

	setElemIdVisible(!hasStabilizers, 'status_stabilizers_none');
	setElemIdVisible(hasStabilizers, 'status_stabilizers_some');

	setElemIdVisible(hasStabilizersOn, 'status_stabilizers_on');
	setElemIdVisible(hasLockedStabilizers, 'status_stabilizers_locked');

	setInnerHtmlToElementWithId('status_stabilizers_on_count', params.stabon);
	setInnerHtmlToElementWithId('status_stabilizers_locked__count', params.stablock);

	

	var hasProvError = params.proverr?true:false;
	var hasProvOutOfDate = params.prov?true:false;

	var hasProv = hasProvError || hasProvOutOfDate;

	setElemIdVisible(!hasProv, 'status_provision_none');
	setElemIdVisible(hasProv, 'status_provision_some');

	setElemIdVisible(hasProvError, 'status_provision_error');
	setElemIdVisible(hasProvOutOfDate, 'status_provision_outdated');

	elem = document.getElementById('status_provision_outdated');
	if(elem)
	{
		if(hasProvError && hasProvOutOfDate)
			elem.style.marginLeft = '7px';
		else
			elem.style.marginLeft = '0px';
	}

	setInnerHtmlToElementWithId('status_provision_error_count', params.proverr);
	setInnerHtmlToElementWithId('status_provision_outdated_count', params.prov);

	
	var databaseUp = params.db?(params.db == "true"):true;
	setElemIdVisible(!databaseUp, 'databasedown');
}




/** <!-- ================================================================================================== -->
 * @lastrev fix36112 - add check for com.actional.DataStore.timeUnits along with com.actional.DataStore
 * <!-- ------------------------------------------------------------------------------------------------- --> */

function AdminPage_updateLastGatherTime(params)
{
	var lastint = strToNumber(params.lastint);

	if(lastint == 0)
		lastint = null;

	if(AdminPage_LastGatherTime != lastint)
	{
		AdminPage_LastGatherTime = lastint;

		AdminPage_TimeUnitsToEndTimes = {};

		if (com.actional.DataStore && com.actional.DataStore.timeUnits)
		{
			var timeUnitList = com.actional.DataStore.timeUnits.getTimeUnitList();

			for (var unitIndex in timeUnitList)
			{
				var unitId = timeUnitList[unitIndex].id;
				var tuEndTime = params[unitId];
				if (tuEndTime)
				{
					AdminPage_TimeUnitsToEndTimes[unitId] = strToNumber(tuEndTime);
				}
			}
		}

		AdminPage_sendNewGatherIntervalEvent();
	}
}


/** <!-- ================================================================================================== -->
 * @lastrev fix35527 - The map TimeUnitId coupled to TimeUnitEndTime is added to publish data
 * <!-- ------------------------------------------------------------------------------------------------- --> */
function AdminPage_sendNewGatherIntervalEvent()
{
	OpenAjax.hub.publish('com.actional.serverui.newGatherInterval',
	{
		lastinterval: AdminPage_LastGatherTime,
		timeUnitsToEndTimes: AdminPage_TimeUnitsToEndTimes,
		source: 'adminpage'
	});
}

function AdminPage_updateServerConnectionStatus(serverconnected, servervalid, errormsg)
{
	setElemIdVisible(servervalid && serverconnected, 'serverready');
	setElemIdVisible(servervalid && !serverconnected, 'serverdown');
	setElemIdVisible(!servervalid, 'serverbroken');
	setElemIdVisible(false, 'serveraccess');
}

function AdminPage_updateKeepAliveStatus(waitingforresponse)
{
	setElemIdVisible(false, 'serverdown');
	setElemIdVisible(!waitingforresponse, 'serverready');
	setElemIdVisible(false, 'serverbroken');
	setElemIdVisible(waitingforresponse, 'serveraccess');
}


/**
 * This method may be called multiple times when when the portlets are being rendered in the PCT dashboard. So this
 * method make sures that even if it is called multiple times the initialization happens only once.
 *
 * @lastrev fix36462 - Event if AdminPage_init() is called multiple times discard subsequent calls after the first call
 */
function AdminPage_init(isAdmin)
{

	if (AdminPage_initialized)
	{
		return;
	}

	PageState_registerInternalEvent('keepalive', 'adminpage', AdminPage_updateKeepAliveStatus);
	PageState_registerInternalEvent('serverconnection', 'adminpage_sc', AdminPage_updateServerConnectionStatus);
	PageState_registerServerEvent('lastint', 'adminpage_newint', AdminPage_updateLastGatherTime);
	if(isAdmin)
	{
		PageState_registerServerEvent('status', 'adminpage_status', AdminPage_updateStatus);
	}

	AdminPage_initialized = true;
}

/**
 * This method may be called multiple times when when the portlets are being rendered in the PCT dashboard. So
 * this method make sures that even if it is called multiple times the the registering is happened only once.
 *
 * @lastrev fix36462 - Event if AdminPage_registerEventRequestListener() is called multiple times discard subsequent
 * 			calls after the first call
 */
function AdminPage_registerEventRequestListener()
{
	if (AdminPage_registerEventRequestListener_registered)
	{
		return;
	}

	OpenAjax.hub.subscribe('com.actional.util.EventRequest', function(name, publisherData, subscriberData)
	{
		if(publisherData.events.indexOf('com.actional.serverui.newGatherInterval') >= 0)
		{
			if(AdminPage_LastGatherTime != null)  
				AdminPage_sendNewGatherIntervalEvent();
		}
	},
	{source:'adminpage'});

	AdminPage_registerEventRequestListener_registered = true;
}

/**
 * @lastrev fix36462 - The OpenAjax EvetRequest subscription mechanism has been extracted to
 * 			AdminPage_registerEventRequestListener method.
 */
Ext.onReady(function()
{
	AdminPage_registerEventRequestListener();
});
