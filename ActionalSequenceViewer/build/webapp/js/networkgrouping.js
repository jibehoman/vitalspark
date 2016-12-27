

















function NetworkGrouping_enableDisableGroupFields()
{
	var groupingScopeRadios = document.getElementsByName('groupingScope');
	var doNotGroup = false;
	for (var i=0; i<groupingScopeRadios.length; i++)
	{
		if (groupingScopeRadios[i].checked)
			doNotGroup = groupingScopeRadios[i].value == "NO_GROUPING";
	}
	setElemIdDisabled(doNotGroup, 'groupName');
	setElemIdDisabled(doNotGroup, 'minGroupSize');
}













var NetworkGrouping_LastServletCallData = new Object();

var NetworkGrouping_ServletCallDelay = 100;		
var NetworkGrouping_ServletCallSpeedLimit = 1000;	
var NetworkGrouping_ServletCallRegularInterval = 250;	





function NetworkGrouping_onLoad()
{
	
	var expression = document.getElementById('expression');
	var groupName = document.getElementById('groupName');
	var candidate = document.getElementById('candidate');
	var expressionTypeRadios = document.getElementsByName('expressionType');
	var groupingScopeRadios = document.getElementsByName('groupingScope');

	expression.onkeyup = NetworkGrouping_requestEvaluation;
	groupName.onkeyup = NetworkGrouping_requestEvaluation;
	candidate.onkeyup = NetworkGrouping_requestEvaluation;

	expression.onblur = NetworkGrouping_requestEvaluation;
	groupName.onblur = NetworkGrouping_requestEvaluation;
	candidate.onblur = NetworkGrouping_requestEvaluation;

	for (var i=0; i<expressionTypeRadios.length; i++)
		expressionTypeRadios[i].onclick = NetworkGrouping_requestEvaluation;

	for (var i1=0; i<groupingScopeRadios.length; i1++)
		groupingScopeRadios[i1].onclick = NetworkGrouping_enableDisableGroupFields;

	NetworkGrouping_enableDisableGroupFields();	
	NetworkGrouping_requestTimedEvaluation();	
}





function NetworkGrouping_requestTimedEvaluation()
{
	NetworkGrouping_makeServletCallIfPermitted('regular interval');
	setTimeout("NetworkGrouping_requestTimedEvaluation()", NetworkGrouping_ServletCallRegularInterval);
}








function NetworkGrouping_evaluateExpressionAccept(responseText, source, statusCode, statusText)
{
	if(statusCode != 200)
	{
		setInnerHtmlToElementWithId('statusMsgID',"An HTTP " + statusCode + " error occurred: " + decodeURIComponent(statusText));
		setInnerHtmlToElementWithId('regexMsgID','');
		setInnerHtmlToElementWithId('targetGroupMsgID','');
	}

	var expressionEvaluationObj = eval(responseText);
	setInnerHtmlToElementWithId('regexMsgID',expressionEvaluationObj.regexMsg);
	setInnerHtmlToElementWithId('targetGroupMsgID',expressionEvaluationObj.targetGroupMsg);

	if (expressionEvaluationObj.errorMsg != "")
	{
		setElemIdVisible(true, 'errorMsgField');
		setElemIdVisible(false, 'matchGroupFields');
		setInnerHtmlToElementWithId('errorMsgField',expressionEvaluationObj.errorMsg);
	}
	else
	{
		setElemIdVisible(false, 'errorMsgField');
		setElemIdVisible(true, 'matchGroupFields');
		setInnerHtmlToElementWithId('matchStatus',expressionEvaluationObj.matchStatus);
		setInnerHtmlToElementWithId('groupStatus',expressionEvaluationObj.groupStatus);
	}
}

function NetworkGrouping_evaluateExpressionAbort()
{
}




function NetworkGrouping_isServletCallPermitted(timeValue, expression, groupName, expressionType, candidate)
{
	if (typeof expression == "undefined" || typeof groupName == "undefined" || typeof candidate == "undefined" || typeof expressionType == "undefined")
	{
		return false;
	}

	if (NetworkGrouping_LastServletCallData["time"] == null)
	{
		return true;
	}
	else
	{
		var servletCalledRecently = timeValue - NetworkGrouping_LastServletCallData["time"] < NetworkGrouping_ServletCallSpeedLimit;
		var servletCallDataEqual = expression.value == NetworkGrouping_LastServletCallData["expression"] &&
				groupName.value == NetworkGrouping_LastServletCallData["groupname"] &&
				expressionType.value == NetworkGrouping_LastServletCallData["expressionType"] &&
				candidate.value == NetworkGrouping_LastServletCallData["candidate"];
		return !servletCallDataEqual && !servletCalledRecently;
	}
}








function NetworkGrouping_requestEvaluation()
{
	if (NetworkGrouping_LastServletCallData["timeoutid"])
	{
		clearTimeout(NetworkGrouping_LastServletCallData["timeoutid"]);
	}
	NetworkGrouping_LastServletCallData["timeoutid"] = setTimeout("NetworkGrouping_makeServletCallIfPermitted('event based')", NetworkGrouping_ServletCallDelay);
}






function NetworkGrouping_makeServletCallIfPermitted(source)
{
	var expression = document.getElementById('expression');
	var groupName = document.getElementById('groupName');
	var expressionType = NetworkGrouping_fetchSelectedExpressionTypeRadioElem();
	var candidate = document.getElementById('candidate');
	var currentTime = (new Date()).getTime();
	if (NetworkGrouping_isServletCallPermitted(currentTime, expression, groupName, expressionType, candidate))
		NetworkGrouping_makeServletCall(source);
}





function NetworkGrouping_fetchSelectedExpressionTypeRadioElem()
{
	var expressionTypeRadios = document.getElementsByName('expressionType');
	for (var i=0; i<expressionTypeRadios.length; i++)
	{
		if (expressionTypeRadios[i].checked)
			return expressionTypeRadios[i];
	}
}





function NetworkGrouping_makeServletCall(source)
{
	var expression = document.getElementById('expression');
	var groupName = document.getElementById('groupName');
	var candidate = document.getElementById('candidate');
	var currentTime = (new Date()).getTime();
	var expressionType = NetworkGrouping_fetchSelectedExpressionTypeRadioElem();

	var servletUrl = contextUrl('admin/expressioneval.jsrv?');
	servletUrl += "expression=" + encodeURIComponent(expression.value);
	servletUrl += "&expressionType=" + (expressionType.value);
	servletUrl += "&groupname=" + encodeURIComponent(groupName.value);
	servletUrl += "&candidate=" + encodeURIComponent(candidate.value);

	NetworkGrouping_LastServletCallData["time"] = currentTime;
	NetworkGrouping_LastServletCallData["expression"] = expression.value;
	NetworkGrouping_LastServletCallData["groupname"] = groupName.value;
	NetworkGrouping_LastServletCallData["candidate"] = candidate.value;
	NetworkGrouping_LastServletCallData["expressionType"] = expressionType.value;

	XMLHttp_GetAsyncRequest(servletUrl, NetworkGrouping_evaluateExpressionAccept, "", NetworkGrouping_evaluateExpressionAbort, 'ExpressionEval', false);
}





var NetworkGrouping_HintsMap = new Object();	
var hints_ids = new Array("simple_hints", "regex_hints", "target_group_hints");




function NetworkGrouping_closeOtherHints(hints_id)
{
	if (hints_id == "expression_testing")
		return;
	for (var i=0; i<hints_ids.length; i++)
		if (hints_id != hints_ids[i])
			NetworkGrouping_setHintsVisibility(hints_ids[i], false);
}

function NetworkGrouping_toggleHints(hints_id)
{
	var hintsShown = NetworkGrouping_HintsMap[hints_id] != null ? !NetworkGrouping_HintsMap[hints_id] : true;
	NetworkGrouping_HintsMap[hints_id] = hintsShown;
	NetworkGrouping_setHintsVisibility(hints_id, hintsShown);

}

function NetworkGrouping_expandAndGoToHints(hints_id)
{
	NetworkGrouping_setHintsVisibility(hints_id, true);
	NetworkGrouping_closeOtherHints(hints_id);
}

/**
 * @lastrev fix38017 - update the css class to update the image.
 */
function NetworkGrouping_setHintsVisibility(hints_id, isVisible)
{
	var imgElem = document.getElementById(hints_id + '_img');
	var rowElem = document.getElementById(hints_id);
	if (!imgElem || !rowElem)
		return;
	NetworkGrouping_HintsMap[hints_id] = isVisible;
	if (isVisible)
	{
		Ext.fly(imgElem).replaceClass("act-table-sorting-forward", "act-table-sorting-reverse");
		rowElem.style.display = "";
	}
	else
	{
		Ext.fly(imgElem).replaceClass("act-table-sorting-reverse", "act-table-sorting-forward");
		rowElem.style.display = "none";
	}
}





var CopyFrom_trace_debugLevel = 0;
var CopyFrom_Schemes = null;






var CopyFrom_ExampleScheme =
{
	name: 'Examples',
	rules: new Array(
		{
			scope:		'UNMANAGED_CONSUMER',
			description:	'Host name suffix',
			expression:	'[^.]+(\\..+)+',
			expressionType:	'regex',
			group:		'*$1',
			minGroupSize:	2

		},
		{
			scope:		'UNMANAGED_CONSUMER',
			description:	'Second-level domain name',
			expression:	'.+((\\..+){2})',
			expressionType:	'regex',
			group:		'*$1',
			minGroupSize:	2

		},
		{
			scope:		'UNMANAGED_CONSUMER',
			description:	'IP Subnet 255.255.255.*',
			expression:	'([0-9]+\\.[0-9]+\\.[0-9]+\\.)[0-9]+',
			expressionType:	'regex',
			group:		'$1*',
			minGroupSize:	2
		}
	)

};

function CopyFrom_onLoad()
{
	var copyfrom_popup_elem = document.getElementById('copyfrom_popup');
	if (copyfrom_popup_elem)
		copyfrom_popup_elem.oninit = CopyFrom_makeServletCallIfNeeded();
}







function CopyFrom_makeServletCallIfNeeded()
{
	if (CopyFrom_Schemes != null)
		return;
	var servletUrl = contextUrl('admin/groupingrules.jsrv');
	XMLHttp_GetAsyncRequest(servletUrl, CopyFromAccept, "", CopyFromAbort, 'CopyFrom', true);
}









function CopyFromAccept(responseXML, userData, statusCode, statusText)
{
	if(statusCode != 200)
	{
	}
	CopyFrom_processXMLData(responseXML, userData, statusCode, statusText);
	CopyFrom_updateCopyFromList();
}

function CopyFromAbort()
{
}




function CopyFrom_processXMLData(xmlObj, userData, status, statusText)
{
	CopyFrom_trace("CopyFrom_processXMLData()", 1);
	if (status != 200)
	{
		return;
	}

	if (xmlObj == null)
	{
		return;
	}
	var scheme_elems = xmlObj.getElementsByTagName("scheme");
	CopyFrom_Schemes = new Array();
	CopyFrom_Schemes[0] = CopyFrom_ExampleScheme;	
	for (var x=0; x<scheme_elems.length; x++)
	{
		var scheme_elem = scheme_elems.item(x);
		if (scheme_elem.tagName.toLowerCase() != "scheme")
			continue;

		var scheme = new Object();
		CopyFrom_Schemes[CopyFrom_Schemes.length] = scheme;

		scheme.name = scheme_elem.getAttribute("name");
		var rule_elems = scheme_elem.childNodes;
		scheme.rules = new Array();
   		for (var i=0; i<rule_elems.length; i++)
   		{
 			var rule_elem = rule_elems.item(i);
			if (rule_elem.tagName.toLowerCase() != "rule")
				continue;

 			var rule = new Object();
 			scheme.rules[scheme.rules.length] = rule;

			rule.scope = rule_elem.getAttribute("scope");
 			rule.description = rule_elem.getAttribute("description");
 			rule.minGroupSize = rule_elem.getAttribute("minGroupSize");
 			rule.expression = rule_elem.getAttribute("expression");
 			rule.group = rule_elem.getAttribute("group");
 			rule.expressionType = rule_elem.getAttribute("expressionType");
 		}
 	}

}

function CopyFrom_updateCopyFromList()
{
	var copyfrom_select_elem = document.getElementById("copyfrom_select");
	if (typeof copyfrom_select == "undefined")
		return;

	for (var i=0; i<CopyFrom_Schemes.length; i++)
	{
		var currentScheme = CopyFrom_Schemes[i];
		var optgroup_elem = document.createElement('optgroup');
		optgroup_elem.label = currentScheme.name;
		copyfrom_select.appendChild(optgroup_elem);

		for (var j=0; j<currentScheme.rules.length; j++)
		{
			var currentRule = currentScheme.rules[j];
			var option_elem = document.createElement('option');

			option_elem.scope = currentRule.scope;
			option_elem.description = currentRule.description;
			option_elem.expression = currentRule.expression;
			option_elem.expressionType = currentRule.expressionType;
			option_elem.group = currentRule.group;
			option_elem.minGroupSize = currentRule.minGroupSize;

			if (currentRule.description != null && currentRule.description.length>0)
				option_elem.innerHTML = escapeHTML(currentRule.description);
			else
				option_elem.innerHTML = escapeHTML(currentRule.expression);
			optgroup_elem.appendChild(option_elem);
		}
	}
}



function CopyFrom_updateFormFields()
{
	var selectElem = document.getElementById("copyfrom_select");
	if (CopyFrom_Schemes == null || typeof selectElem == "undefined")
		return;
	var selectedOption = selectElem.options[selectElem.selectedIndex];

	var expression = document.getElementById('expression');
	var description = document.getElementById('description');
	var groupName = document.getElementById('groupName');
	var minGroupSize = document.getElementById('minGroupSize');

	expression.value = selectedOption.expression;
	groupName.value = selectedOption.group;
	description.value = selectedOption.description;

	var expressionRadio = document.getElementById("radio_" + selectedOption.expressionType);
	expressionRadio.checked = true;

	var scopeRadio = document.getElementById("radio_" + selectedOption.scope);
	scopeRadio.checked = true;
	NetworkGrouping_enableDisableGroupFields(); 

	for (var i=0; i<minGroupSize.options.length; i++)
	{
		if (minGroupSize.options[i].value == selectedOption.minGroupSize)
			minGroupSize.selectedIndex = i;
	}
}

function CopyFrom_trace(msg, level)
{
	if (!level || CopyFrom_trace_debugLevel<level)
		return;

	var outputStr = "";
	if (level==1)
		outputStr += "==> ";
	if (level==2)
		outputStr += "----- ";
	outputStr += msg;
	trace(outputStr);
}
