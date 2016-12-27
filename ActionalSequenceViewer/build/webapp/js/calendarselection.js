














































var CalendarDialog_CurrentDate = null;		
						
var CalendarDialog_PollServerTimeInterval = 600000; 
var CalendarDialog_LastServerTimePoll = 0;
var CalendarDialog_timeoutId = 0;


















var CalendarDialog_Map = {
	retrieve: function(calendarID, createIfNeeded)
	{
		if (!CalendarDialog_Map.container)
			CalendarDialog_Map.container = new Object();

		var calendarEntry = CalendarDialog_Map.container[calendarID];

		if (calendarEntry)
				return calendarEntry;

		if (!createIfNeeded)
			return null;	

		calendarEntry = new Object();

		
		calendarEntry.calendarID = calendarID;
		calendarEntry.callbackFct = null;
		calendarEntry.calendarObj = null;

		
		CalendarDialog_Map.container[calendarID] = calendarEntry;
		return calendarEntry;
	},

	add: function(calendarEntry)
	{
		if (!CalendarDialog_Map.container)
			CalendarDialog_Map.container = new Object();
		CalendarDialog_Map.container[calendarEntry.id] = calendarEntry;
	},

	container : null
};














function CalendarDialog_setDate(calendarID, dateObj)
{
	var calendarEntry = CalendarDialog_Map.retrieve(calendarID);

	if (!calendarEntry )
		return;

	if (calendarEntry && calendarEntry.calendarObj)
	{
		calendarEntry.calendarObj.setDate(dateObj);
		calendarEntry.calendarObj.onSetTime();
	}
}







function CalendarDialog_getDate(calendarID)
{
	var calendarEntry = CalendarDialog_Map.retrieve(calendarID);
	if (calendarEntry && calendarEntry.calendarObj)
	{
		if (calendarEntry.calendarObj.customTimeElemID == null)
			return calendarEntry.calendarObj.date;
		else
			return TimeSelection_getDate(calendarID + "-container_time", calendarEntry.calendarObj.date);
	}
	return null;
}



function CalendarDialog_updateServerTime()
{
	var servletUrl = contextUrl('admin/servertime.jsrv');
	XMLHttp_GetAsyncRequest(servletUrl, CalendarDialog_updateServerTimeAccept, null, null, "", false);
}



function CalendarDialog_updateServerTimeAccept(responseText, source, statusCode, statusText)
{
	if (responseText)
	{
		var servertimeobj = eval(responseText);
		CalendarDialog_CurrentDate = DateUtil_serverTime2userTime(servertimeobj.time);
		CalendarDialog_LastServerTimePoll = (new Date()).getTime();
		CalendarDialog_refreshAllCalendars();
	}

	if (CalendarDialog_timeoutId)
		clearTimeout(CalendarDialog_timeoutId);

	
	CalendarDialog_timeoutId = setTimeout("CalendarDialog_updateServerTime()", CalendarDialog_PollServerTimeInterval);
}














function CalendarDialog_initCalendar(calendarID, containerID, initialDateObj, callbackFct, showTime)
{
	var elem = document.getElementById(containerID);
	if (elem)
	{
		var calendarEntry = CalendarDialog_Map.retrieve(calendarID, true);
		calendarEntry.calendarObj = Calendar.setup( { flat : containerID,
			id : calendarID,
			dateStatusFunc : CalendarDialog_disallowDate,
			flatCallback : CalendarDialog_dateChanged,
			weekNumbers : false,
			showsTime : false,
			date : initialDateObj,
			customTimeElemID: showTime ? containerID + "_time" : null,
			timeFormat : "12" } );
		calendarEntry.callbackFct = callbackFct;
	}

	
	CalendarDialog_timeoutId = setTimeout("CalendarDialog_updateServerTime()", CalendarDialog_PollServerTimeInterval);
}



function CalendarDialog_refreshCalendar(calendarID)
{
	var calendarEntry = CalendarDialog_Map.retrieve(calendarID, false);
	if (calendarEntry)
		calendarEntry.calendarObj.refresh();
}



function CalendarDialog_refreshAllCalendars()
{
	for (var calID in CalendarDialog_Map.container)
	{
		CalendarDialog_refreshCalendar(calID);
	}
}


function CalendarDialog_onPageLoad()
{
}

















function CalendarDialog_setFieldValueToDate(dateObj, elemID, dateTimeFormat)
{
	if (!dateTimeFormat)
		dateTimeFormat = 'yyyy-MM-dd';
	setValue(elemID, CalendarDialog_extractSelectionDateAndTime(dateObj, dateTimeFormat));
}










function CalendarDialog_setFieldValueToDateAndTime(dateObj, elemID, dateTimeFormat)
{
	if (!dateTimeFormat)
		dateTimeFormat = 'yyyy-MM-dd hh:mm';
	setValue(elemID, "" + CalendarDialog_extractSelectionDateAndTime(dateObj, dateTimeFormat));
}





















function CalendarDialog_extractSelectionDateAndTime(dateObj, datePattern)
{
	var year = dateObj.getFullYear();
	var month = 1 + dateObj.getMonth(); 
	var day = dateObj.getDate();	
	var hour = dateObj.getHours();	
	var mins = dateObj.getMinutes();
	var secs = dateObj.getSeconds();

	return CalendarDialog_formatDateAndTime(day, month, year, hour, mins, secs, datePattern);
}































function CalendarDialog_formatDateAndTime(day, month, year, hours, minutes, seconds, vFormat){

    var vDay		= CalendarDialog_addZero(day);
    var vMonth		= CalendarDialog_addZero(month);
    var vYearLong	= CalendarDialog_addZero(year);
    var vYearShort	= CalendarDialog_addZero(year.toString().substring(3,4));
    var vYear		= (vFormat.indexOf("yyyy")>-1?vYearLong:vYearShort);

    var vHours24	= CalendarDialog_addZero(hours);
    var vHours12	= CalendarDialog_addZero(hours%12);
    var vMinutes	= CalendarDialog_addZero(minutes);
    var vSeconds	= CalendarDialog_addZero(seconds);
    var vAmPm		= hours < 12 ? "AM" : "PM";

    var vDateString	= vFormat.replace(/dd/g, vDay).replace(/MM/g, vMonth).replace(/y{1,4}/g, vYear);
    vDateString		= vDateString.replace(/hh/g, vHours24).replace(/HH/g, vHours12).replace(/mm/g, vMinutes).replace(/ss/g, vSeconds).replace(/AM/g, vAmPm);

    return vDateString;
}

function CalendarDialog_setHighlighted(elem)
{
	elem.className = 'dddstyle-selected';
}

function CalendarDialog_setNormal(elem)
{
	elem.className = 'dddstyle-inside';
}

function CalendarDialog_addZero(vNumber)
{
    return ((vNumber < 10) ? "0" : "") + vNumber;
}




function CalendarDialog_dateChanged(calendar)
{
	
	
	

	if (calendar.dateClicked)
	{
		if (calendar.customTimeElemID != null)
			return;	 

		var calendarEntry = CalendarDialog_Map.retrieve(calendar.id);
		if (calendarEntry && calendarEntry.callbackFct && Function == calendarEntry.callbackFct.constructor)
		{
			calendarEntry.callbackFct.call(calendarEntry, calendar.date);
			DDD.hidePopup();
		}
	}
}






function setValue(fieldId, value)
{
	var elem = document.getElementById(fieldId);
	if (elem)
		elem.value = value;
}









function CalendarDialog_disallowDate(dateObj)
{
	var checkDate = new Date(dateObj);
	checkDate.setHours(0);
	checkDate.setMinutes(0);
	checkDate.setSeconds(0);
	
	if ( (CalendarDialog_CurrentDate) && (checkDate.getTime() > CalendarDialog_CurrentDate ) )
	{
		return true; 
	}
	return false; 
}
