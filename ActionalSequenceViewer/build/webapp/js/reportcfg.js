






















var enumType = 'enum';
var stringType = 'string';
var timeRangeType = 'timeRange';



/**
 * This the string from com.actional.ui.logging.ReportCfg.FIELD_UPDATED_EVENT.
 * It is the open ajax event name which is fired when an field is updated.
 */
var FIELD_UPDATED_EVENT = 'com.actional.reporting.fieldChanged';

/**
 * This method publishes the given data to the event FIELD_UPDATED_EVENT;
 *
 * @lastrev fix36163 - new method.
 */
function publishReportCfgOnChangeData(data)
{
	OpenAjax.hub.publish(FIELD_UPDATED_EVENT, data);
}

/**
 * This method is called when publishing the 'onChange' event of a field which of type enum.
 * Enum type fields are drop down combos. So it collects selected text & publishes the following
 * information.
 *
 * {
 * 	fieldId 	- the passed argument; the id of the field firing the publish event.
 * 	selectedText	- the selected Text in the drop down combo.
 * 	fieldType	- the RowType used in java; here it is 'enum';
 * }
 *
 * @lastrev fix36163 - new method.
 */
function publishEnumTypeChanged(fieldId)
{
	var field = document.getElementById(fieldId);

	if (!field)
	{
		return;
	}

	var selectedValue = field.options[field.selectedIndex].text;

	var infoToPublish =
	{
		fieldId : fieldId,
		fieldType : enumType,
		value : selectedValue
	};

	publishReportCfgOnChangeData(infoToPublish);
}








/**
 * This method is a listener on the 'Message Field Value' field. It only reacts to the value changes
 * of the message field name. If a message field name is selected then this field is enabled. But none
 * of the message field is selected then this field is reseted and disabled along with the corresponding
 * operation's field ('Contains' .... drop down)
 *
 * @lastrev fix36163 - new method.
 */
function onMsgFieldNameChange(eventName, eventData)
{

	/** This is the value of com.actional.soapstation.monitoring.OpAuditRecordV8.MSG_FIELD_NAME */
	var msgFieldNameElemId = 'name';

	/** This is the value of com.actional.soapstation.monitoring.OpAuditRecordV8.MSG_FIELD_VALUE */
	var msgFieldValueElemId = 'value';

	if (eventName == FIELD_UPDATED_EVENT && eventData && eventData.fieldId == msgFieldNameElemId)
	{
		
		var msgFieldValueOpElemId = 'Op' + msgFieldValueElemId;

		if (eventData.value == '')
		{
			

			var valueElem = document.getElementById(msgFieldValueElemId);
			if (valueElem)
			{
				valueElem.value = '';
			}
			var valueOpElem = document.getElementById(msgFieldValueOpElemId);
			if (valueOpElem)
			{
				valueOpElem.selectedIndex = 0;
			}

			setElemIdDisabled(true, msgFieldValueElemId);
			setElemIdDisabled(true, msgFieldValueOpElemId);
		}
		else
		{
			setElemIdDisabled(false, msgFieldValueElemId);
			setElemIdDisabled(false, msgFieldValueOpElemId);
		}
	}
}

