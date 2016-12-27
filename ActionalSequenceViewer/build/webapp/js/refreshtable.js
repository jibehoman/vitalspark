
























var RefreshTable_interval_ms		= 15000;		
var RefreshTable_firstinterval_ms	= RefreshTable_interval_ms/3;	
var RefreshTable_url			= "";
var RefreshTable_extraParamsString	= "";
var RefreshTable_timeOutID		= null;			
var RefreshTable_debugLevel 		= 0;			
								
								
								

var RefreshTable_servletBaseURL;				
var RefreshTable_ParametersTable	= new Object();		
var RefreshTable_TableData		= new Object();		






























function RefreshTable_setTableInfo(tableName, tableID, tableModel, timestamp)
{
	RefreshTable_trace("RefreshTable_setTableInfo( " + tableName + ", " + tableID + ", " + timestamp + " )",1);
	var newTable = RefreshTable_getTable(tableID, true);
	newTable.tableName		= tableName;
	newTable.tableID		= tableID;
	newTable.tableModel		= tableModel;
	newTable.timestamp		= timestamp;
	newTable.extraParameters	= null;
	return newTable;
}








function RefreshTable_setExtraParams(tableID, paramString)
{
	if (paramString)
	{
		var tableObj = RefreshTable_getTable(tableID, true);
		tableObj.extraParameters = paramString;
	}
}







function RefreshTable_setTimeStamp(tableID, timestamp)
{
	RefreshTable_trace("RefreshTable_setTimeStamp( " + tableID + ", " + timestamp + " )",1);
	var tableObj = RefreshTable_getTable(tableID, true);
	tableObj.timestamp = timestamp;
}







function RefreshTable_setAutoRefreshEnabled(tableID, autoRefreshEnabled)
{

	var tableObj = RefreshTable_getTable(tableID, true);
	tableObj.autoRefreshEnabled = autoRefreshEnabled;
}








function RefreshTable_setBeforeTableUpdateFn(tableID, beforeTableUpdateFn)
{
	if (beforeTableUpdateFn)
	{
		var tableObj = RefreshTable_getTable(tableID, true);
		tableObj.beforeTableUpdateFn = beforeTableUpdateFn;
	}
}








function RefreshTable_setAfterTableUpdateFn(tableID, afterTableUpdateFn)
{
	if (afterTableUpdateFn)
	{
		var tableObj = RefreshTable_getTable(tableID, true);
		tableObj.afterTableUpdateFn = afterTableUpdateFn;
	}
}







function RefreshTable_setBeforeRowAddFn(tableID, beforeRowAddFn)
{

	if (beforeRowAddFn)
	{
		var tableObj = RefreshTable_getTable(tableID, true);
		tableObj.beforeRowAddFn = beforeRowAddFn;
	}
}







function RefreshTable_setAfterRowAddFn(tableID, afterRowAddFn)
{

	if (afterRowAddFn)
	{
		var tableObj = RefreshTable_getTable(tableID, true);
		tableObj.afterRowAddFn = afterRowAddFn;
	}
}







function RefreshTable_setBeforeRowUpdateFn(tableID, beforeRowUpdateFn)
{

	if (beforeRowUpdateFn)
	{
		var tableObj = RefreshTable_getTable(tableID, true);
		tableObj.beforeRowUpdateFn = beforeRowUpdateFn;
	}
}







function RefreshTable_setAfterRowUpdateFn(tableID, afterRowUpdateFn)
{

	if (afterRowUpdateFn)
	{
		var tableObj = RefreshTable_getTable(tableID, true);
		tableObj.afterRowUpdateFn = afterRowUpdateFn;
	}
}







function RefreshTable_setBeforeRowDeleteFn(tableID, beforeRowDeleteFn)
{

	if (beforeRowDeleteFn)
	{
		var tableObj = RefreshTable_getTable(tableID, true);
		tableObj.beforeRowDeleteFn = beforeRowDeleteFn;
	}
}







function RefreshTable_setAfterRowDeleteFn(tableID, afterRowDeleteFn)
{
	if (afterRowDeleteFn)
	{
		var tableObj = RefreshTable_getTable(tableID, true);
		tableObj.afterRowDeleteFn = afterRowDeleteFn;
	}
}

function RefreshTable_setLoadingIndicator(tableID, isVisible)
{
	setElemIdVisible(isVisible, tableID + '_loading');
}








function RefreshTable_sendtabledatarequest(refreshTableIDs, forceFullUpdate)
{
	if (RefreshTable_timeOutID)
	{
		clearTimeout(RefreshTable_timeOutID);
		RefreshTable_timeOutID = null;
	}
	var url = RefreshTable_buildServletUrl(refreshTableIDs, forceFullUpdate);
	RefreshTable_trace("RefreshTable_sendtabledatarequest() <A HREF=\"http://localhost:4040" + url + "\">(SERVLET URL)</a>", 1);

	for (var x in refreshTableIDs)
	{
		var tableID = refreshTableIDs[x];
		RefreshTable_setLoadingIndicator(tableID, true);
	}

	var result = XMLHttp_GetAsyncRequest(url, RefreshTable_sendtabledatarequest_accept, refreshTableIDs,
						  RefreshTable_sendtabledatarequest_abort, 'RefreshTable_sendtabledatarequest', true);

	
	
	
}





function RefreshTable_sendtabledatarequestForAllEnabledTables()
{
	RefreshTable_sendtabledatarequest(fetchRefreshEnabledTablesIds());
}


function RefreshTable_getTable(tableID, createIfNeeded)
{
	var tableObj = RefreshTable_TableData[tableID];

	if (tableObj)
		return tableObj;

	if (!createIfNeeded)
		return null;

	tableObj = new Object();

	
	tableObj.autoRefreshEnabled = true;

	
	RefreshTable_TableData[tableID] = tableObj;
	return tableObj;
}



function fetchRefreshEnabledTablesIds()
{
	var arrResponse = new Array();
	for (var tableID in RefreshTable_TableData)
	{
		var tableObj = RefreshTable_getTable(tableID);
		if (tableObj.autoRefreshEnabled)
			arrResponse = addToArray(arrResponse, tableID);
	}
	return arrResponse;
}




function RefreshTable_sendtabledatarequest_accept(responseXML, userData, status, statusText)
{
	RefreshTable_trace("RefreshTable_sendtabledatarequest_accept()",1);

	for (var x in userData)
	{
		var tableID = userData[x];
		RefreshTable_setLoadingIndicator(tableID, false);
	}

	if(status != 200)
	{
		var errormsg;
		var delay;

		if(Math.floor(status/100) == 5)
		{
			delay = RefreshTable_interval_ms;
			errormsg = "Server Error";
		}
		else
		{
			delay = 5000;
			errormsg = "Server Not Responding";
		}

		
		RefreshTable_trace("next keepalive in " + delay/1000 + " sec", 2);
		RefreshTable_timeOutID = setTimeout(RefreshTable_sendtabledatarequestForAllEnabledTables, delay);
		return;
	}
	RefreshTable_ProcessXMLData(responseXML, userData, status, statusText);
	
	RefreshTable_timeOutID = setTimeout(RefreshTable_sendtabledatarequestForAllEnabledTables, RefreshTable_interval_ms);
}

function RefreshTable_sendtabledatarequest_abort(userData)
{


	for (var x in userData)
	{
		var tableID = userData[x];
		RefreshTable_setLoadingIndicator(tableID, false);
	}
}







function RefreshTable_sendtabledatarequest_timeout()
{
	RefreshTable_trace("RefreshTable_sendtabledatarequest_timeout()",1);

	
	XMLHttp_AbortAllPendingRequests('RefreshTable_keepalive');



	
	RefreshTable_timeOutID = setTimeout(RefreshTable_sendtabledatarequestForAllEnabledTables, 100);
}

function RefreshTable_init()
{
	RefreshTable_trace("RefreshTable_init()",1);
	RefreshTable_addUrlParametersToMap();

	
	
	
	RefreshTable_timeOutID = setTimeout(RefreshTable_sendtabledatarequestForAllEnabledTables, RefreshTable_firstinterval_ms);
}





function RefreshTable_ProcessXMLData(xmlObj, userData, status, statusText)
{
	RefreshTable_trace("RefreshTable_ProcessXMLData()", 1);
	if (status != 200)
	{
		return;
	}

	if (xmlObj == null)
	{
		return;
	}
	var delelems = xmlObj.getElementsByTagName("delete");
	var updateelems = xmlObj.getElementsByTagName("update");
	var addelems = xmlObj.getElementsByTagName("add");
	RefreshTable_trace("total # of elements to be deleted/modified/added: " + delelems.length+"/"+updateelems.length+"/"+addelems.length, 3);

	var tableupdate_elems = xmlObj.getElementsByTagName("tableupdate");
	for (var x=0; x<tableupdate_elems.length; x++)
	{
		var tableupdate_elem = tableupdate_elems.item(x);
		var tableupdate_timestamp = tableupdate_elem.getAttribute("timestamp");
		var tableupdate_tablename = tableupdate_elem.getAttribute("tablename");
		var tableupdate_tableid = tableupdate_elem.getAttribute("tableid");
		RefreshTable_setTimeStamp(tableupdate_tableid, tableupdate_timestamp);
		var tableupdate_hasControls = tableupdate_elem.getAttribute("hascontrols");
		var tableupdate_tableelementid = tableupdate_tableid + "Table";
		var tableupdate_tableelem = document.getElementById(tableupdate_tableelementid);
		if (!tableupdate_tableelem) continue;
		var tableupdate_startIndex = parseInt(tableupdate_elem.getAttribute("startofdata"));
		if (!tableupdate_tableelem)
			continue;
		RefreshTable_trace("processing table " + tableupdate_tablename + " with id=" + tableupdate_tableid + " starting at " + tableupdate_startIndex, 3);

		var rowsDeleted = false;
		var rowsAdded = false;
		var rowsModified = false;
		var operations = tableupdate_elem.childNodes;

		if (!operations || operations.length==0)
			continue;

		var tableObj = RefreshTable_getTable(tableupdate_tableid);
		if (tableObj.beforeTableUpdateFn && Function == tableObj.beforeTableUpdateFn.constructor)
			tableObj.beforeTableUpdateFn.call(tableObj);

		
   		RefreshTable_extractControlElementStates(tableupdate_tablename, tableupdate_tableid);

		
		var arrNewRows = new Array();
		var arrUpdatedRows = new Array();
		var arrDeletedRows = new Array();

		
   		for (var i = operations.length-1; i >= 0; i--)
   		{
 			var operation = operations.item(i);
			if (!operation)
				continue;
   			if (operation.tagName == "delete")
   			{
   				var deleteRowId = operation.getAttribute("rowid");
				if (deleteRowId == '*')
				{
					RefreshTable_trace("deleting all rows", 2);
					var rows = tableupdate_tableelem.rows;
					for (var j=rows.length-1;j>=tableupdate_startIndex;j--)
						tableupdate_tableelem.deleteRow(j);
				}
				else
				{
					RefreshTable_trace("deleting " + deleteRowId, 2);
					var deleteLocationChanged = operation.getAttribute("locationChanged");
					if (deleteLocationChanged != "true")
					{
		   				arrDeletedRows = addToArray(arrDeletedRows, deleteRowId);
						tableObj = RefreshTable_getTable(tableupdate_tableid, true);
						if (tableObj.beforeRowDeleteFn && Function == tableObj.beforeRowDeleteFn.constructor)
   							tableObj.beforeRowDeleteFn.call(tableObj, [deleteRowId]);
   					}

					var row = document.getElementById(deleteRowId);
					var extraRowCount=0;

					
					while (row)
					{
						tableupdate_tableelem.deleteRow(row.rowIndex);
						rowsDeleted = true;
						extraRowCount++;
						row = document.getElementById(deleteRowId + "_" + extraRowCount);
					}
				}
   			}
  			else if (operation.tagName == "update")
   			{
   				var updateRowId = operation.getAttribute("rowid");
   				arrUpdatedRows = addToArray(arrUpdatedRows, updateRowId);
   				var startcol = parseInt(operation.getAttribute("startcol"));
   				if (!startcol)
   					startcol = 0;
				RefreshTable_trace("updating " + updateRowId + " starting at col " + startcol, 2);

				var updatedTrElems = operation.childNodes;
				tableObj = RefreshTable_getTable(tableupdate_tableid);
				if (tableObj.beforeRowUpdateFn && Function == tableObj.beforeRowUpdateFn.constructor)
					tableObj.beforeRowUpdateFn.call(tableObj,[updateRowId]);

				populateRowWithCells(updateRowId, updatedTrElems, tableupdate_tableelem, startcol);
				rowsModified = true;
	   		}
   			else if (operation.tagName == "add")
   			{
   				var addRowId = operation.getAttribute("rowid");
				var addLocationChanged = operation.getAttribute("locationChanged");
				if (addLocationChanged != "true")
				{
					arrNewRows = addToArray(arrNewRows, addRowId);
					tableObj = RefreshTable_getTable(tableupdate_tableid);
					if (tableObj.beforeRowAddFn && Function == tableObj.beforeRowAddFn.constructor)
   						tableObj.beforeRowAddFn.call(tableObj, [addRowId]);
				}
				var existingElem = document.getElementById(addRowId);
				if (existingElem)
				{
					RefreshTable_trace("ignoring <add> since row already exists", 3);
					continue;	
				}

				var newTrElems = operation.childNodes;
				var addtrElem;

				var insertAt = operation.getAttribute("insertat");
				RefreshTable_trace("adding new row " + addRowId + " and inserting at " + insertAt, 2);

				if (insertAt == parseInt(insertAt))
				{
					addtrElem = tableupdate_tableelem.insertRow(insertAt);
				}

				if(!insertAt)
				{
					var insertAfter = operation.getAttribute("insertafter");
					RefreshTable_trace("adding new row " + addRowId + " and inserting after " + insertAfter, 2);

					if (insertAfter && document.getElementById(insertAfter))
					{
						var elem = document.getElementById(insertAfter);
						
						while (elem.nextSibling != null && elem.nextSibling.id != null && elem.nextSibling.id.indexOf(insertAfter)>-1)
							elem = elem.nextSibling;
						addtrElem = tableupdate_tableelem.insertRow(elem.rowIndex+1);
					}
					else
					{
						addtrElem = tableupdate_tableelem.insertRow(tableupdate_startIndex);
					}
				}

				addtrElem.id = addRowId;
				addtrElem.className = "tableform1";
				populateRowWithCells(addRowId, newTrElems, tableupdate_tableelem, 0);
				rowsAdded = true;
				RefreshTable_trace("finished adding new row " + addRowId, 2);
	   		}
   		}

   		
   		
		for (var j = 0; j < operations.length; j++)
   		{
			var operation1 = operations.item(j);
			if (!operation1)
				continue;
			if (operation1.tagName == "runjavascript")
   			{
   				var fn_name = operation1.getAttribute("function");
   				RefreshTable_trace("executing JavaScript: " + fn_name, 2);
   				if (fn_name == "updateIDsForControls")
   				{
					updateIDsForControls(tableupdate_tableelem);
   				}
   				else if (fn_name == "updateAltColors")
   				{
					updateAltColors(tableupdate_tableelem, "tableform2", "tableform1", tableupdate_startIndex);
   				}
   				else if (fn_name == "updatePagingData")
   				{
   					updatePagingData(	tableupdate_tableid,
   								operation1.getAttribute("statustext"),
   								operation1.getAttribute("firstpage"),
   								operation1.getAttribute("prevpage"),
   								operation1.getAttribute("nextpage"),
   								operation1.getAttribute("lastpage"));
   				}
   			}
		}

		
		
		
		
		
		tableObj = RefreshTable_getTable(tableupdate_tableid);
		if (tableObj.afterRowAddFn && Function == tableObj.afterRowAddFn.constructor && arrNewRows.length>0)
			tableObj.afterRowAddFn.call(tableObj,arrNewRows);
		if (tableObj.afterRowUpdateFn && Function == tableObj.afterRowUpdateFn.constructor && arrUpdatedRows.length>0)
			tableObj.afterRowUpdateFn.call(tableObj,arrUpdatedRows);
   		if (tableObj.afterRowDeleteFn && Function == tableObj.afterRowDeleteFn.constructor && arrDeletedRows.length>0)
   			tableObj.afterRowDeleteFn.call(tableObj,arrDeletedRows);
   		RefreshTable_restoreControlElementStates(tableupdate_tablename, tableupdate_tableid);

		if (tableObj.afterTableUpdateFn && Function == tableObj.afterTableUpdateFn.constructor)
			tableObj.afterTableUpdateFn.call(tableObj);
	}
}









function populateRowWithCells(rowID, rowData, tableObj, startIndex)
{
	RefreshTable_trace("populateRowWithCells( " + rowID + ", |" + rowData.length + "|, " + startIndex + " )",1);

	
	var rowIDGroup = getChildrenByIdPrefix(tableObj, "TR", rowID);
	for (var i=rowIDGroup.length-1;i>=0; i--)
	{
		var row = rowIDGroup[i];
		var currentId = null;
		if (row.getAttribute("id"))
			currentId = row.getAttribute("id");
		else if (row.attributes['id'] && row.attributes['id'].nodeValue)
			currentId = row.attributes['id'].nodeValue;
		if (!currentId || currentId != rowID)
			tableObj.deleteRow(row.rowIndex);
	}
	var index=0;
	while (index<rowData.length && rowData.item(index).nodeType != 1)
		index++;
	var firstRow = rowData.item(index);	
	var list = new Array();
	extractCDATA(firstRow, list);
	var update = (startIndex>0);
	var rowElem = document.getElementById(rowID);

	if (!rowElem)
		return;

	if ((rowElem.cells.length - startIndex) != list.length)
	{
		
		
		if (rowElem && rowElem.cells)
		{
			
			for (var j=rowElem.cells.length-1;j>=startIndex; j--)
				rowElem.deleteCell(j);
		}
		recreateCellsFromTemplate(rowElem, firstRow);
	}
	else
	{
		
		
		for (var k=0;k<list.length;k++)
		{
			rowElem.cells[k+startIndex].innerHTML = list[k];
		}
	}

	
	
	var rowCurPosition = rowElem.rowIndex;
	for (var m=1; m<rowData.length; m++)
	{
		var elem = rowData.item(m);
		if (elem.nodeType>1)
			continue;	
		var extraRowElemId = null;
		var extraRowElem = null;
		if (elem.getAttribute("id"))
			extraRowElemId = elem.getAttribute("id");
		else if (elem.attributes['id'] && elem.attributes['id'].nodeValue)
			extraRowElemId = elem.attributes['id'].nodeValue;
		if (extraRowElemId)
			extraRowElem = document.getElementById(extraRowElemId);
		if (!extraRowElem)
		{
			if (elem.attributes['id'])
				RefreshTable_trace("creating new TR element with id=" + elem.attributes['id'].nodeValue, 3);
			
			tableObj.insertRow(++rowCurPosition);
			extraRowElem = tableObj.rows[rowCurPosition];
		}
		else
		{
			
			RefreshTable_trace("updating existing element with id=" + extraRowElemId, 2);
		}
		
		for (var j=extraRowElem.cells.length-1;j>=0;j--)
			extraRowElem.deleteCell(j);

		recreateCellsFromTemplate(extraRowElem, elem);

		
		
		extraRowElem.className = rowElem.className.split('_')[0];
	}
}






function recreateCellsFromTemplate(TRelem, TRdata)
{
	RefreshTable_trace("recreateCellsFromTemplate( " + TRelem + ", " + TRdata + " )",1);
	recreateAttributes(TRelem, TRdata);
	var cellCount=-1;
	for (var i=0;i<TRdata.childNodes.length;i++)
	{
		var child = TRdata.childNodes.item(i);
		if (!child.tagName || (child.tagName.toUpperCase() != "TH" && child.tagName.toUpperCase() != "TD"))
			continue;

		cellCount++;
		var cellElem = document.createElement(child.tagName);
		TRelem.appendChild(cellElem);
		recreateAttributes(cellElem,TRdata.childNodes.item(i));
		cellElem.innerHTML = extractSingleCDATA(TRdata.childNodes.item(i));
	}

}







function updateAltColors(tableelem, name_even, name_odd, startIndex)
{
	var current=0;
	var last_id = null;	
	for (var j=startIndex;j<tableelem.rows.length;j++)
	{
		var trelem = tableelem.rows[j];
		var id_att = trelem.id;

		if (id_att)
		{
			if (last_id==null || id_att.indexOf(last_id+"_") < 0) 
			{
				current++;
				last_id = id_att;
			}
			if (current%2==0)
				trelem.className = name_even;
			else
				trelem.className = name_odd;
		}
	}
}







function updateIDsForControls(tableelem)
{
	var tableid = tableelem.id;
	var current=-1;
	for (var j=0;j<tableelem.rows.length;j++)
	{
		var trelem = tableelem.rows[j];
		if (trelem.className && trelem.id && trelem.name==trelem.id+"_grp")
		{
			current++;
			var ctrl_elem = RefreshTable_GetControlElement(trelem);
			if ((typeof ctrl_elem != 'undefined') && (ctrl_elem != null))
			{
				if (ctrl_elem.id != tableid + current)
					ctrl_elem.id = tableid + current;
			}
		}
	}
}

function updatePagingData(tableID, statustext, firstpage, prevpage, nextpage, lastpage)
{





}




function RefreshTable_GetControlElement(elem)
{
	if ((typeof elem == 'undefined') || (elem == null))
		return null;
	var td_elem = elem.firstChild;
	while ((td_elem != null) && (td_elem.tagName != 'TD'))
		td_elem = td_elem.nextSibling;
	if ((typeof td_elem == 'undefined') || (td_elem == null))
		return null;
	var control_elem = td_elem.firstChild;
	while ((control_elem != null) && (control_elem.tagName != 'INPUT'))
		control_elem = control_elem.nextSibling;
	if ((typeof control_elem == 'undefined') || (control_elem == null))
		return null;
	return control_elem;
}


























function RefreshTable_buildServletUrl(filterRowsArr, forceFullUpdate)
{
	var url = RefreshTable_servletBaseURL + "?pgid=";
	url += PageState_pageid;
	url += RefreshTable_fetchUrlParamsString();
	var activeFilterArray = RefreshTable_TableData;
	if (filterRowsArr)
		activeFilterArray = filterRowsArr;

	for (var x in activeFilterArray)
	{
		var tableID = activeFilterArray[x];
		var tableObj = RefreshTable_getTable(tableID);

		if (tableObj)
		{
			var currTableModel = tableObj.tableModel;
			var currTableExtraParams = tableObj.extraParameters;
			url += "&" + tableID + "tablemodel=" + currTableModel;

			if (true == tableObj.pagingEnabled)
				url += "&" + tableID + "paging=true";
			if (!forceFullUpdate)
			{
				var currTimeStamp = tableObj.timestamp;
				url += "&" + tableID + "timestamp=" + currTimeStamp;
			}

			if (currTableExtraParams)
				url += "&" + currTableExtraParams;
		}
	}
	return contextUrl(url);
}

function RefreshTable_fetchUrlParamsString()
{
	if (!RefreshTable_ParametersTable || getSize(RefreshTable_ParametersTable)==0)
		return "";
	var urlString = "";
	for (var paramName in RefreshTable_ParametersTable)
	{
		if (!paramName)
			continue;
		urlString += "&";
		var paramValue = RefreshTable_ParametersTable[paramName];
		urlString += paramName + "=" + paramValue;
	}
	return urlString;
}

function RefreshTable_addUrlParametersToMap()
{
	
	var searchString = window.location.search.substring(1);
	var nameValuePairs = searchString.split('&');
	RefreshTable_ParametersTable = new Object();
	for (var i=0; i<nameValuePairs.length; i++)
	{
	    var currentNameValuePair = nameValuePairs[i].split('=');
	    RefreshTable_ParametersTable[currentNameValuePair[0]] = currentNameValuePair[1];
	}
}








function RefreshTable_appendParameterString(paramString)
{
	if (RefreshTable_url == null)
		RefreshTable_url = "";
	if (RefreshTable_url.indexOf(paramString) > -1)
		return;
	if (RefreshTable_url == "")
		RefreshTable_url += "?";
	else
		RefreshTable_url += "&";
	RefreshTable_url += paramString;
}











function getChildrenByAttribute(parentObj, tag, attName, attValue)
{

	var data = document.getElementsByTagName(tag);
	var rows = new Array();

	for (var i=0; i<data.length; i++)
	{
		if (getParentNode(data[i]) != parentObj)
			continue;
		if (data[i].getAttribute(attName) == attValue)
			rows.push(data[i]);
	}
	return rows;
}







function getChildrenByIdPrefix(parentObj, tag, idPrefix)
{
	RefreshTable_trace("getChildrenByIdPrefix( " + parentObj.tagName + ", " + tag + ", " + idPrefix + " )",1);
	var data = document.getElementsByTagName(tag);
	var rows = new Array();

	for (var i=0; i<data.length; i++)
	{
		if (getParentNode(data[i]) != parentObj)
		{
			continue;
		}
		if (data[i].id && data[i].id.indexOf(idPrefix + '_CHILD_') == 0)
		{
			rows.push(data[i]);
		}
	}
	return rows;
}





function recreateAttributes(obj, tpl)
{
	for (var i = 0; i < tpl.attributes.length; i++)
	{
		var attName = tpl.attributes[i].nodeName.toLowerCase();
		var attValue = tpl.attributes[i].nodeValue;


		if (attName == "colspan")
			obj.colSpan = attValue;		
		else if (attName == "class")
			obj.className = attValue;	
		else
			obj.setAttribute(attName, attValue, 0);
	}
}

function getParentNode(elem)
{

	if (typeof elem == 'undefined')
		return null;
	if (elem.tagName == "TR")
	{
		if (typeof elem.parentElement != 'undefined')
			return elem.parentElement.parentElement;	
		else
			return elem.parentNode.parentNode;		
	}

	if (typeof elem.parentElement != 'undefined')
		return elem.parentElement;	
	else
		return elem.parentNode;		
}





function extractCDATA(elem, list)
{

	if (!elem)
	{
		return;
	}
	
	if (elem.nodeType==4)
	{
		list[list.length++] = elem.nodeValue;
	}
	
	else if (elem.nodeType==1)
	{
		var elemChildren = elem.childNodes;
		if (elemChildren)
		{
			for (var i=0; i<elemChildren.length; i++)
			{
				extractCDATA(elemChildren.item(i), list);
			}
		}
	}
}

function extractSingleCDATA(elem)
{


	if (elem.nodeType==4)
		return elem.nodeValue;
	else if (elem.nodeType==1)
	{
		var elemChildren = elem.childNodes;
		if (!elemChildren)
			return "";
		else
		{
			for (var i=0; i<elemChildren.length; i++)
			{
				var childnv = extractSingleCDATA(elemChildren.item(i));
				if (childnv && childnv.length>0)
					return childnv;
			}
		}
	}
	return "";
}










function arrayContains(arrayObj, elem)
{
	if ((!arrayObj) || (!elem))
		return false;
	for (var i=0;i<arrayObj.length;i++)
		if (arrayObj[i] == elem)
			return true;
	return false;
}






function removeFromArray(arrayObj, elem)
{
	if ((!arrayObj) || (!elem))
		return arrayObj;
	for (var i=0;i<arrayObj.length;i++)
	{
		if (arrayObj[i] == elem)
			arrayObj[i] = null;
	}
	return arrayObj;
}






function addToArray(arrayObj, elem)
{
	if (arrayContains(arrayObj, elem))
		return arrayObj;
	if (!arrayObj)
		arrayObj = new Array(1);
	if (!elem)
		return arrayObj;
	for (var i=0;i<arrayObj.length;i++)
	{
		if (!arrayObj[i])
		{
			arrayObj[i] = elem;
			return arrayObj;
		}
	}
	arrayObj[arrayObj.length] = elem;
	return arrayObj;
}

function getSize(arrayObj)
{
	var count=0;
	for (var elem in arrayObj)
	{
		count++;
	}
	return count;
}

function RefreshTable_trace(msg, level)
{
	if (!level || RefreshTable_debugLevel<level)
		return;

	var outputStr = "";
	if (level==1)
		outputStr += "==> ";
	if (level==2)
		outputStr += "----- ";
	outputStr += msg;
	trace(outputStr);
}








function RefreshTable_highlightRows(arrayObj)
{
	for (x in arrayObj)
	{
		var rowID = arrayObj[x];

		
		








	}
}







function RefreshTable_extractControlElementStates(tableName, tableID)
{
	RefreshTable_trace("RefreshTable_extractControlElementStates( " + tableName +", " + tableID+" )",1);
	var tableObj = RefreshTable_getTable(tableID, true);
	tableObj.tableCtrlElemStates = new Object();
	var cb = document.getElementById(tableID);
	if (cb)
		tableObj.tableCtrlElemStates[tableID] = cb.checked;
	var cbList = document.getElementsByName(tableName);
	for(var i = 0; i < cbList.length; i++)
	{
		cb = cbList.item(i);
		if(cb.id.indexOf(tableID) == 0)
			tableObj.tableCtrlElemStates[cb.value] = cb.checked;
	}
}








function RefreshTable_restoreControlElementStates(tableName, tableID)
{
	RefreshTable_trace("RefreshTable_restoreControlElementStates( " + tableName + ", " + tableID + " ), 1");

	var tableObj = RefreshTable_getTable(tableID, true);
	if (!tableObj || !tableObj.tableCtrlElemStates)
		return;

	var cb = null;
	var allFound = true;
	
	var cbList = document.getElementsByName(tableName);
	for(var i = 0; i < cbList.length; i++)
	{
		cb = cbList.item(i);
		if (cb.id.indexOf(tableID) != 0)
			continue;
		if (tableObj.tableCtrlElemStates[cb.value] != null)
		{
			cb.checked = tableObj.tableCtrlElemStates[cb.value];
		}
		else
		{
			allFound = false;
		}
	}

	
	cb = document.getElementById(tableID);
	if (allFound)
	{
		if (cb && tableObj.tableCtrlElemStates[tableID] != null)
			cb.checked = tableObj.tableCtrlElemStates[tableID];
	}
	else
	{
		if (cb)
			cb.checked = false;
	}

	if (tableObj.usesFullRowHighlighting && typeof Highlight_AllSelectedRows == 'function')
		Highlight_AllSelectedRows(tableName,false);

	
	var buttonUpdater = 'EnableRequiredSelectionButton' + tableID;
	var buttonUpdaterFn = window[buttonUpdater];
	if (buttonUpdaterFn && Function == buttonUpdaterFn.constructor)
		buttonUpdaterFn.call();
}
