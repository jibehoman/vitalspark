


















var WidgetState_debugLevel = 0;





var WidgetState_Map = {
	retrieve: function(widgetID)
	{
		WidgetState_trace("WidgetState_Map.retrieve( " + widgetID + ")", 1);
		if (!WidgetState_Map.container)
			WidgetState_Map.container = new Object();
		var widgetObj = WidgetState_Map.container[widgetID];

		if (widgetObj)
		{
			WidgetState_trace("found element with id=" + widgetID + ", type=" + widgetObj.getType(),1);
			return widgetObj;
		}
		return null;	
	},

	add: function(widgetObj)
	{
		if (!WidgetState_Map.container)
			WidgetState_Map.container = new Object();
		WidgetState_Map.container[widgetObj.getID()] = widgetObj;
	},

	container : null
};






function WidgetState(widgetID)
{
	if (!widgetID)
		return;

	WidgetState_trace("WidgetState( " + widgetID + " )",1);
	this.id = widgetID;
	this.getID = WidgetState_getID;
	this.getType = WidgetState_getType;
	WidgetState_Map.add(this);

	function WidgetState_getID()
	{
		return this.id;
	}

	function WidgetState_getType()
	{
		return this.type;
	}
}










WidgetState_Dialog.prototype = new WidgetState;
WidgetState_Dialog.prototype.constructor = WidgetState_Dialog;


function WidgetState_Dialog(widgetID, applyFn)
{
	if (!widgetID)
		return;

	WidgetState_trace("WidgetState_Dialog( " + widgetID + " )",1);
	WidgetState.call(this,widgetID);
	this.applyFn = applyFn;
	this.type = 'Dialog';

	
	this.getApplyFn = WidgetState_Dialog_getApplyFn;

	function WidgetState_Dialog_getApplyFn()
	{
		return this.applyFn;
	}
}


WidgetState_Dialog.prototype.getApplyFn = function() { return this.applyFn; };









WidgetState_PortalDisplayDialog.prototype = new WidgetState_Dialog;
WidgetState_PortalDisplayDialog.prototype.constructor = WidgetState_PortalDisplayDialog;


function WidgetState_PortalDisplayDialog(widgetID, arrSelectedElems, isZeroBasedGraph, isAutoRefresh)
{
	if (!widgetID)
		return;

	WidgetState_trace("WidgetState_PortalDisplayDialog()",1);
	WidgetState_Dialog.call(this,widgetID,PortalDisplayDialog_handleApply);
	this.arrSelectedElems = arrSelectedElems;
	this.isZeroBasedGraph = isZeroBasedGraph;
	this.isAutoRefresh = isAutoRefresh;
	this.displayBitMask = 0;
	this.type = 'PortalDisplayDialog';
}

function PortalDisplayDialog_computeBitMask(dialogObj)
{
	WidgetState_trace("PortalDisplayDialog[" + dialogObj.getID() + "].computeBitMask()", 1);
	var elems = document.getElementsByName(dialogObj.getID() + "_item");
	if (dialogObj.arrSelectedElems.length != elems.length)
		dialogObj.arrSelectedElems = new Array();
	for (var i=0; i<elems.length; i++)
	{
		var isSelected = elems.item(i).checked;
		dialogObj.arrSelectedElems[i] = isSelected;
		var displayBit = elems.item(i).value;
		if(isSelected)
			dialogObj.displayBitMask = dialogObj.displayBitMask | displayBit;
		else
			dialogObj.displayBitMask = dialogObj.displayBitMask & (~displayBit);
	}

	
	var isZeroBasedGraphElem = document.getElementById(dialogObj.getID() + '_startgraphatzero');
	if (isZeroBasedGraphElem)
		dialogObj.isZeroBasedGraph = isZeroBasedGraphElem.checked;
	var isAutorefreshElem = document.getElementById(dialogObj.getID() + '_autorefresh');
	if (isAutorefreshElem)
		dialogObj.isAutoRefresh = isAutorefreshElem.checked;
}








function PortalDisplayDialog_handleApply(widgetID)
{
	WidgetState_trace("PortalDisplayDialog_handleApply( " + widgetID + " )", 1);

	
	var dialogObj = WidgetState_Map.retrieve(widgetID);
	PortalDisplayDialog_computeBitMask(dialogObj);

	
	var Parameters = extractAllUrlParameters({zerobased:true,autorefresh:true,addStatDisplay:true,statID:true,timeID:true,setcolumncount:true});

	
	var dialogObj1 = WidgetState_Map.retrieve(widgetID, false);
	var reloadURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
	reloadURL += "?zerobased=" + (dialogObj1.isZeroBasedGraph?"1":"0");
	reloadURL += "&autorefresh=" + (dialogObj1.isAutoRefresh?"1":"0");
	reloadURL += "&addStatDisplay=true&statID=" + dialogObj1.displayBitMask;

	
	for (var paramName in Parameters)
	{
		var paramValue = Parameters[paramName];
		reloadURL += "&" + paramName + "=" + paramValue;
	}

	
	window.location.replace(reloadURL);
}









function PortalDisplayDialog_init(widgetID, arrSelectedElems, isZeroBasedGraphElem, isAutorefreshElem)
{
	var dialogObj = new WidgetState_PortalDisplayDialog(widgetID, arrSelectedElems, isZeroBasedGraphElem, isAutorefreshElem);
}






WidgetState_SelectionDialog.prototype = new WidgetState;
WidgetState_SelectionDialog.prototype.constructor = WidgetState_SelectionDialog;


function WidgetState_SelectionDialog(widgetID, onSelectFn)
{
	if (!widgetID)
		return;

	WidgetState.call(this,widgetID);
	this.onSelectFn = onSelectFn;
	this.type = 'SelectionDialog';
}


WidgetState_SelectionDialog.prototype.getOnSelectFn = function() { return this.onSelectFn; };










function SelectionDialog_init(widgetID)
{
	var dialogObj = new WidgetState_SelectionDialog(widgetID);	
}






WidgetState_TimeUnitSelectionDialog.prototype = new WidgetState_SelectionDialog;
WidgetState_TimeUnitSelectionDialog.prototype.constructor = WidgetState_TimeUnitSelectionDialog;


function WidgetState_TimeUnitSelectionDialog(widgetID)
{
	if (!widgetID)
		return;

	WidgetState_SelectionDialog.call(this, widgetID,TimeUnitSelectionDialog_onSelect);
	this.type = 'TimeUnitSelectionDialog';
}









function TimeUnitSelectionDialog_onSelect(widgetID, selectedElem)
{
	WidgetState_trace("TimeUnitSelectionDialog_onSelect( " + widgetID + ", " + selectedElem.id + " )", 1);
	if (!selectedElem)
		return;
	var selectedTimeUnitIndex = selectedElem.getAttribute('index');
	var selectedTimeUnitLabel = selectedElem.getAttribute('val');
	if (!selectedTimeUnitIndex || !selectedTimeUnitLabel)
		return;

	
	var Parameters = extractAllUrlParameters({zerobased:true,autorefresh:true,addStatDisplay:true,statID:true,timeID:true,setcolumncount:true});

	
	var reloadURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
	reloadURL += "?timeID=MegaInterval." + selectedTimeUnitLabel.toUpperCase();

	
	for (var paramName in Parameters)
	{
		var paramValue = Parameters[paramName];
		reloadURL += "&" + paramName + "=" + paramValue;
	}

	
	window.location.replace(reloadURL);
}





WidgetState_MyViewSelectionDialog.prototype = new WidgetState_SelectionDialog;
WidgetState_MyViewSelectionDialog.prototype.constructor = WidgetState_MyViewSelectionDialog;


function WidgetState_MyViewSelectionDialog(widgetID, isAutoRefresh)
{
	if (!widgetID)
		return;

	WidgetState_SelectionDialog.call(this, widgetID, MyViewSelectionDialog_onSelect);
	this.type = 'MyViewSelectionDialog';
	this.isAutoRefresh = isAutoRefresh;
}








function MyViewSelectionDialog_onSelect(widgetID, selectedElem)
{
	WidgetState_trace("MyViewSelectionDialog_onSelect()",1);
	if (!selectedElem)
		return;
	var reloadURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
	var autoRefreshParam = selectedElem.getAttribute('autorefresh');
	var indexParam = selectedElem.getAttribute('index');
	if (!autoRefreshParam && !indexParam)
		return;

	
	var Parameters = extractAllUrlParameters({zerobased:true,autorefresh:true,addStatDisplay:true,statID:true,timeID:true,setcolumncount:true});

	
	if (autoRefreshParam && autoRefreshParam.length>0)
		reloadURL += "?autorefresh=" + (autoRefreshParam=="true"?"0":"1");
	else
		reloadURL += "?setcolumncount=" + (2+parseInt(indexParam));

	
	for (var paramName in Parameters)
	{
		var paramValue = Parameters[paramName];
		reloadURL += "&" + paramName + "=" + paramValue;
	}

	
	window.location.replace(reloadURL);
}











function Highlight_AllSelectedRows(table_name, useSameHighlightClass, isSelectedFn)
{
	var ctrl_items = document.getElementsByName(table_name);
	var something_checked = false;
	for(i = 0; i < ctrl_items.length; i++)
	{
		var ctrl_item = ctrl_items.item(i);
		if (!ctrl_item || ctrl_item.tagName.toUpperCase() != 'INPUT')
			continue;

		if (ctrl_item.type != 'checkbox' && ctrl_item.type != 'radio')
			continue;

		var tr_elem = getAncestor(ctrl_item, 2);
		var elemClass = tr_elem.className;
		if (!elemClass)
			continue;
		if(ctrl_item.checked)
		{
			if (useSameHighlightClass)
				elemClass = 'tableform1_selected';
			else
			{
				
				if (!endsWith(elemClass, '_selected'))
				{
					elemClass += '_selected';
				}
			}
			something_checked = true;
		}
		else
		{
			if (useSameHighlightClass)
				elemClass = 'tableform1';
			else
			{
				elemClass = removeSuffix(elemClass, '_selected');
			}
		}
		tr_elem.className = elemClass;
	}
	return something_checked;
}






function Highlight_SelectedRowCB(rowid, enableHighlight)
{
	var elem = document.getElementById(rowid);
	if(elem)
	{
		var elemClass = elem.className;
		if (!elemClass)
			return;
		if (enableHighlight)
		{
			
			if (!endsWith(elemClass, '_selected'))
			{
				elemClass += '_selected';
			}
		}
		else
		{
			
			if (endsWith(elemClass,'_selected'))
			{
				elemClass = removeSuffix(elemClass, '_selected');
			}
		}
		elem.className = elemClass;
	}
}





function Highlight_SelectedRowRadio(radiogroup)
{
	var radio_items = document.getElementsByName(radiogroup);
	for(i = 0; i < radio_items.length; i++)
	{
		var radio_item = radio_items.item(i);
		if (!radio_item || radio_item.tagName.toUpperCase() != 'INPUT')
			continue;
		var tr_elem = getAncestor(radio_item, 2);
		if (!tr_elem.className)
			continue;
		var elemClassBase = removeSuffix(tr_elem.className, '_selected');

		if(radio_item.checked)
		{
			tr_elem.className = elemClassBase + '_selected';
		}
		else
		{
			tr_elem.className = elemClassBase;
		}
	}
}








function SelectionDialog_setHighlighted(elem)
{
	elem.className = 'dddstyle-selected';
}




function SelectionDialog_setNormal(elem)
{
	elem.className = 'dddstyle-inside';
}




function WidgetState_trace(msg, level)
{
	if (!level || WidgetState_debugLevel<level)
		return;

	var outputStr = "";
	if (level==1)
		outputStr += "==> ";
	if (level==2)
		outputStr += "----- ";
	outputStr += msg;
	trace(outputStr);
}





function endsWith(string, suffix)
{
	var startPos = string.length - suffix.length;
	if (startPos < 0)
	{
		return false;
	}
	return (string.lastIndexOf(suffix, startPos) == startPos);
}





function removeSuffix(string, suffix)
{
	if (endsWith(string, suffix))
	{
		return string.substr(0, string.length - suffix.length);
	}
	else
	{
		return string;
	}
}
