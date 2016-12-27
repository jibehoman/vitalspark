



















var alert_table_minsize	= 100;
var network_browser_minsize;

var analyzer_splitter_startdragheight;
var analyzer_splitter_startdragtotalheight;

var displayed_alert_id;








function Mark_SelectedLine(alertkeyid)
{
	if (alertkeyid == displayed_alert_id)
		return;

	var selected_tr = document.getElementById(alertkeyid);
	if(selected_tr)
	{
		Ext.fly(selected_tr).addClass('tableform2_selected');

		header = selected_tr.cells[4].innerHTML;

		var panel = Ext.getCmp('network_main_pane');
		if (panel)
			panel.setTitle('Alert Flow Map - ' + header);
	}

	image = document.getElementById("displayed_" + alertkeyid);
	if(image)
		image.src = arrow_selected_image;

	if (displayed_alert_id && displayed_alert_id != 'EVENT')
	{
		old_marked = document.getElementById("displayed_" + displayed_alert_id);
		old_marked.src = pixel_image;

		old_selected_tr = document.getElementById(displayed_alert_id);
		if(old_selected_tr)
		{
			Ext.fly(old_selected_tr).removeClass('tableform2_selected');
		}
	}

	displayed_alert_id = alertkeyid;
}

function isNetworkBrowserPresent()
{
	var browser = document.getElementById('network_main_pane');
	if (!browser)
		return false;
	else
		return true;
}



var AlertFaultMap_AlertSelection =
{
	
	alertId: null,

	
	hasFaultMapHint: false
};



function AlertFaultMap_onPageLoad(alertkeyid)
{
	
	
	
	setTimeout(function() { AlertFaultMap_onPageLoad_delayed(alertkeyid); }, 500);
}


function AlertFaultMap_onPageLoad_delayed(alertkeyid)
{
	if(AlertFaulMap_trySelectingLastAlert()) 
	{
		
	}
	else if(alertkeyid)
	{
		
		AlertFaultMap_showFlowMap(alertkeyid);
	}
	else
	{
		
		AlertFaulMap_noSelection();
	}
}



function AlertFaulMap_noSelection()
{
	AlertFaultMap_generateDomainIdSelectionChangedEvent(null, false);
}



function AlertFaulMap_trySelectingLastAlert()
{
	
	var alertkeyid = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'alertid');

	if (!alertkeyid)
	{
		
		return false;
	}

	var alertdata = AlertFaultMap_alertdata[alertkeyid];

	if(!alertdata)
	{
		
		return false;
	}

	AlertFaultMap_showFlowMap(alertkeyid);

	return true;
}




function DisplayDialog_hasAggregation()
{
	return NetworkBrowser_tabShowing('overview') && AlertFaultMap_AlertSelection.hasFaultMapHint;
}


function AlertFaultMap_showFlowMap(alertkeyid)
{
	if (AlertFaultMap_AlertSelection.alertId == alertkeyid)
		return true;

	var alertdata = AlertFaultMap_alertdata[alertkeyid];

	if(!alertdata)
		return false; 

	var hasFaultMap = alertdata.hasmap;
	var alerttime = alertdata.alerttime;
	var alertstat = alertdata.alertstat;



	Mark_SelectedLine(alertkeyid);
	AlertFaultMap_UpdateLinks(alertkeyid);

	
	AlertFaultMap_AlertSelection.alertId = alertkeyid;
	AlertFaultMap_AlertSelection.hasFaultMapHint = hasFaultMap;

	AlertFaultMap_generateDomainIdSelectionChangedEvent(alertkeyid, hasFaultMap);
	AlertFaultMap_generateStatSelectionChangedEvent(alertstat);

	if (!hasFaultMap)
		AlertFaultMap_generateSiteSelectionChangedEvent();

	
	UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, 'alertid', alertkeyid);

	return true;
}

function AlertFaultMap_generateSiteSelectionChangedEvent()
{
	OpenAjax.hub.publish('com.actional.serverui.siteSelectionChanged',
	{
		source: 'alert-analyzer',
		type : 'nothing'
	});
}

function AlertFaultMap_generateStatSelectionChangedEvent(alertstat)
{
	OpenAjax.hub.publish('com.actional.serverui.statisticSelectionChanged',
	{
		source: 'alert-analyzer',
		statistic_id: alertstat,
		"parts":[
		{
			label: "IN",
			row_id: alertstat,
			selected: true
		},
		{
			label: "OUT",
			row_id: alertstat,
			selected: true
		}]
	});
}

function AlertFaultMap_generateDomainIdSelectionChangedEvent(alertkeyid, hasFaultMap)
{
	displayed_alert_id = alertkeyid;

	OpenAjax.hub.publish('com.actional.serverui.statDomainChanged',
	{
		source: 'alert-analyzer',
		statdomainid: alertkeyid,
		hasmap: hasFaultMap
	});
}

/**
 * @lastrev fix35896 - Unify and revmap Audit and Application log buttons
 */
function AlertFaultMap_UpdateLinks(alertkeyid)
{
	XMLHttp_GetAsyncRequest(contextUrl('portal/network_logs.jsrv?alertId=' + alertkeyid),
				AlertLinks_Callback, null, null, 'alertlogsbutton');
}

/**
 * @lastrev fix35896 - Unify and revmap Audit and Application log buttons
 */
function AlertLinks_Callback(responseText, userData, status, statusText)
{
	var linkdata;

	if(status == 200)
	{
		try
		{
			linkdata = eval(responseText);
		}
		catch(ex)
		{
			
		}
	}

	var cmp;

	cmp = Ext.getCmp('audit-logs-btn');
	if(!cmp)
		return;

	if(linkdata && linkdata.auditurl)
	{
		cmp.setHandler(function()
		{
			window.location.href = linkdata.auditurl;
		});
		cmp.enable();
	}
	else
	{
		cmp.disable();
	}

	cmp = Ext.getCmp('application-logs-btn');
	if(!cmp)
		return;

	if(linkdata && linkdata.applicationurl)
	{
		cmp.setHandler(function()
		{
			window.location.href = linkdata.applicationurl;
		});
		cmp.enable();
	}
	else
	{
		cmp.disable();
	}
}



function NetworkBrowser_buildFlashCommand(selectobj)
{
	var cmd = "setAlertAnalyzerSelectionFromJavascript('" + selectobj.type + "'";

	if(selectobj.type == 'nothing')
		cmd += ",null,null";
	else if(selectobj.type == 'node')
		cmd += ",'" + selectobj.siteId + "',null";
	else 
		cmd += ",'" + selectobj.siteId + "','" + selectobj.peerSiteId + "'";

	
	
	if(AlertFaultMap_AlertSelection.hasFaultMapHint && AlertFaultMap_AlertSelection.alertId)
		cmd += ",'" + AlertFaultMap_AlertSelection.alertId + "'";
	else
		cmd += ",'none'";

	cmd += ")";

	return cmd;
}



function NetworkBrowser_onOverviewAwakening()
{
}



function DisplayDialog_hasGrouping()
{
	return false;
}

function getExtraLayoutOptionsParam()
{
	return '&alertid=' + AlertFaultMap_AlertSelection.alertId;
}



function NetworkBrowser_onExplorerAwakening()
{
}

function processExportSequence(theForm)
{
	var cancelled;

	if ( !verifyAllSelectedForExportHaveMap(theForm) )
	{
		cancelled = true;
	}
	else
	{
		var name = prompt("Please enter a business process name","Process");
		if ( name != null && name != '' )
		{
			window.document.AlertAnalyzerTable.processname.value = name;
			cancelled = false;
		}
		else
			cancelled = true;

		
		
	
	
	
	
	
	
	
	
	
	
	
	}

	return cancelled;
}

function verifyAllSelectedForExportHaveMap(theForm)
{
	var allHaveMap = true;
	var array = theForm.AlertAnalyzerTable;
	for ( var i=0; i<array.length; i++ )
	{
		var element = array[i];
		if ( element.checked )
		{
			var alertKeyId = element.value;
			var alertData = AlertFaultMap_alertdata[alertKeyId];
			if ( alertData !== undefined && alertData != null )
			{
				if ( !alertData.hasmap )
				{
				  	allHaveMap = false;
					break;
				}
			}
		}
	}

	if ( !allHaveMap )
		Ext.Msg.alert('Error', 'At least one of the selected items does not have a flow map. Please, only select items that have a flow map.');

	return allHaveMap;
}