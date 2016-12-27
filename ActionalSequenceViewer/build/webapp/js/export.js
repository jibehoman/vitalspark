
























var componentStates = new Array();


var pendingRequest = false;


var updateRequestNeeded = false;


var lastSentUpdate;

var ajaxModeListeners = new Array();

function registerAjaxModeListener(listener)
{
	if (listener.inAjaxMode && listener.outOfAjaxMode)
		ajaxModeListeners.push(listener);
}

function notifyInAjaxMode()
{
	for (var i =0; i < ajaxModeListeners.length; i++)
	{
		if (ajaxModeListeners[i].inAjaxMode)
			ajaxModeListeners[i].inAjaxMode();
	}
}

function notifyOutOfAjaxMode()
{
	for (var i =0; i < ajaxModeListeners.length; i++)
	{
		if (ajaxModeListeners[i].outOfAjaxMode)
			ajaxModeListeners[i].outOfAjaxMode();
	}
}

function initComponentState(component, state)
{
	componentStates[component] = state;
}

function enableDisableButtonById(buttonId, disable)
{
	var button = document.getElementById(buttonId);

	if (disable)
	{
		if (button.className.substring(0, 8) != 'disabled')
		{
			
			button.className = 'disabled' + button.className;
			button.disabled = true;
		}
	}
	else
	{
		if (button.className.substring(0, 8) == 'disabled')
		{
			
			button.className = button.className.substr(8);
			button.disabled = false;
		}
	}
}

function handleSelectAllClick(compId, tableName)
{
	if (!compId)
		return;

	componentStates[compId] = !componentStates[compId];

	showLoadingIndicator(compId);
	toggleSelectUnselectLink(compId);

	triggerUpdateRequest(tableName);
}



function triggerUpdateRequest(tableName)
{
	if (!pendingRequest)
	{
		var updateData = buildUpdateData(tableName);

		if (updateData != '' && updateData != lastSentUpdate)
		{
			
			notifyInAjaxMode();

			lastSentUpdate = updateData;
			pendingRequest = true;
			var tableData = {name: tableName};
			XMLHttp_GetAsyncRequest("../export/update.jsrv?sel_type=" + tableName + "&" + updateData,
							handleUpdateReply, tableData);
		}
		else
		{
			hideLoadingIndicators(tableName);
		}

		updateRequestNeeded = false;
	}
	else
	{
		updateRequestNeeded = true;
	}
}


function buildUpdateData(tableName)
{
	var updateData = '';
	for (var comp in componentStates)
	{
		if (updateData != '')
			updateData += '&';

		updateData += comp + '=' + (componentStates[comp] ? 'on' : 'off');
	}

	return updateData;
}


function handleUpdateReply(response, tableData, statusCode, statusText)
{
	
	if (statusCode == 200)
	{
		var selInfo;

		
		
		eval(response);

		for (var comp in selInfo)
		{
			var infoHolder = document.getElementById(comp + '_info');

			if (infoHolder && selInfo[comp])
			{
				infoHolder.innerHTML = selInfo[comp];
				hideSingleLoadingIndicator(comp);
			}
		}
	}

	pendingRequest = false;

	
	if (updateRequestNeeded)
		triggerUpdateRequest(tableData.name, tableData.id);
	else
	{
		
		notifyOutOfAjaxMode();

		hideLoadingIndicators(tableData.name);
	}
}


function showLoadingIndicator(compId)
{
	var selInfo = document.getElementById(compId + '_info');
	var loading = document.getElementById(compId + '_loading');

	if (!selInfo || !loading)
		return;

	selInfo.style.display = 'none';
	loading.style.display = '';
}


function hideLoadingIndicators(tableName)
{
	for (var comp in componentStates)
	{
		hideSingleLoadingIndicator(comp);
	}
}


function hideSingleLoadingIndicator(compId)
{
	var selInfo = document.getElementById(compId + '_info');
	var loading = document.getElementById(compId + '_loading');

	if (!selInfo || !loading)
		return;

	if(selInfo.style.display = 'none')
	{
		selInfo.style.display = '';
		loading.style.display = 'none';
	}
}

function toggleSelectUnselectLink(compId)
{
	var selLink = document.getElementById(compId + '_sel');
	var unselLink = document.getElementById(compId + '_unsel');

	if (!selLink || !unselLink)
		return;

	
	if(componentStates[compId])
	{
		selLink.style.display = 'none';
		unselLink.style.display = '';
	}
	else
	{
		selLink.style.display = '';
		unselLink.style.display = 'none';
	}
}

function showHideItemsList(imageEl, compId)
{
	var itemsSection = document.getElementById(compId + "_items");

	if (!itemsSection || !imageEl || !imageEl.src)
		return;

	
	if(imageEl.src.indexOf("plus.gif") >= 0)
	{
		itemsSection.style.display = '';
		imageEl.src = contextUrl("images/minus.gif");
	}
	else
	{
		itemsSection.style.display = 'none';
		imageEl.src = contextUrl("images/plus.gif");
	}
}
