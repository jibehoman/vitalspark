






















var HistoryDialog_StatisticsPaused;






/*
 * this is called from the NetworkBrowser to notify this component that
 * the dataset time range might have changed.
 *
 * This method will update all buttons that needs to be updated in the
 * history dialog area to accommodate for the new change.
 *
 * timeRangeObj:
 * {
 * 	type:		'none' for no data or 'range'
 * 	startTime:	start time (UNIX)
 * 	endTime:	end time (UNIX)
 * }
 *
 * @lastrev fix34887 - retained enough logic to update Global Calendar icon and HistoryDialog_StatisticsPaused flag
 */
function HistoryDialog_updateDisplayedTimeRange(timeRangeObj)
{
	if(NetworkBrowser_UserTimeSelection.type == 'mostrecent')
	{
		HistoryDialog_StatisticsPaused = false;
	}
	else
	{
		HistoryDialog_StatisticsPaused = true;
	}

	if(HistoryDialog_StatisticsPaused)
		HistoryDialog_setButtonTitle( true, "Resume Stats Display");
	else
		HistoryDialog_setButtonTitle( false, "Pause Stats Display");

	
}

function HistoryDialog_setButtonTitle(paused, titleString)
{
	var elem;
	if (paused)
	{
		elem = document.getElementById('PlayPauseImageForButton');
		if (elem)
			elem.src = contextUrl('images/net_menu_time_past.gif');

		elem = document.getElementById('GlobalCalendarImageForButton');
		if (elem)
			elem.src = contextUrl('images/net_menu_time_past.gif');

		elem = document.getElementById('GlobalPlayPauseImageForPopup');
		if (elem)
			elem.src = contextUrl('images/net_menu_time_cur_large.gif');

		elem = document.getElementById('PlayPauseImageForPopup');
		if (elem)
			elem.src = contextUrl('images/net_menu_time_cur_large.gif');

		elem = document.getElementById('PlayPauseLabelForPopup');
		if (elem)
			elem.innerHTML = titleString;
	}
	else
	{
		elem = document.getElementById('PlayPauseImageForButton');
		if (elem)
			elem.src = contextUrl('images/net_menu_time_cur.gif');

		elem = document.getElementById('GlobalCalendarImageForButton');
		if (elem)
			elem.src = contextUrl('images/net_menu_time_cur.gif');

		elem = document.getElementById('GlobalPlayPauseImageForPopup');
		if (elem)
			elem.src = contextUrl('images/net_menu_time_past_large.gif');

		elem = document.getElementById('PlayPauseImageForPopup');
		if (elem)
			elem.src = contextUrl('images/net_menu_time_past_large.gif');

		elem = document.getElementById('PlayPauseLabelForPopup');
		if (elem)
			elem.innerHTML = titleString;
	}
}

function HistoryDialog_handleApply(dateObj)
{
	if (typeof NetworkBrowser_userTimeSelectionChanged != "undefined")
	{
		
		if (GlobalCalendar_isGlobalCalendarShowing())
			NetworkBrowser_userTimeSelectionChanged("historydlg", "globalinterval", DateUtil_userDate2serverTime( dateObj ));
		else if (GlobalCalendar_isNetworkBrowserShowing())
			NetworkBrowser_userTimeSelectionChanged("historydlg", "interval", DateUtil_userDate2serverTime( dateObj ));
	}
}

function HistoryDialog_setButtonReadOnly( val )
{
	DDD.setEnabledState('historyselection', !val);

	var elem = document.getElementById('historyselection_left');
	if (elem)
	{
		if (val)
			elem.style.display = "none";
		else
			elem.style.display = "";
	}

	elem = document.getElementById('historyselection_right');
	if (elem)
	{
		if (val)
			elem.style.display = "none";
		else
			elem.style.display = "";
	}
}

function HistoryDialog_setButtonToNothing(enableHistoryDialog)
{

	HistoryDialog_setButtonReadOnly( !enableHistoryDialog );
	HistoryDialog_setPlayPauseButtonTimeText('No Data ');
}

function HistoryDialog_setButtonToDate(date1, date2)
{
	var today = new Date();
	var dateObj1 = DateUtil_serverTime2userDate(date1, true);

	var buttonText;

	if ( (dateObj1.getFullYear()==today.getFullYear()) && (dateObj1.getMonth()==today.getMonth()) && (dateObj1.getDate()==today.getDate()) )
	{
		buttonText = 'Today ';
	}
	else
	{
		var days = dateObj1.getDate();
		if (days < 10)
		{
			days = '0' + days;
		}
		buttonText = '' + (1+dateObj1.getMonth()) + '/' + days + '/' + dateObj1.getFullYear();
	}

	var hours = dateObj1.getHours();
	var mins = dateObj1.getMinutes();
	var pm = hours>11;
	if (mins < 10)
	{
		mins = '0' + mins;
	}
	hours = hours%12;
	if (hours == 0)
	{
		hours = "12";
	}

	
	
	if (date2)
	{
		var dateObj2 = DateUtil_serverTime2userDate(date2, true);

		var hours2 = dateObj2.getHours();
		var mins2 = dateObj2.getMinutes();
		if (mins2 < 10)
		{
			mins2 = '0' + mins2;
		}
		hours2 = hours2%12;
		if (hours2 == 0)
		{
			hours2 = "12";
		}
	}

	var AmPmString = pm ? "PM" : "AM";

	buttonText += " " + hours + ":" + mins;

	if (date2)
		buttonText += "-" + hours2 + ":" + mins2;

	buttonText += " " + AmPmString;

	HistoryDialog_setButtonReadOnly( false );
	HistoryDialog_setPlayPauseButtonTimeText(buttonText);
}


function HistoryDialog_setPlayPauseButtonTimeText(text)
{
	var elem = document.getElementById('PlayPauseButtonTime');
	if(!elem)
		return;

	elem.innerHTML = text;
}


function HistoryDialog_onPlayPausePressed()
{
	if (HistoryDialog_StatisticsPaused)
	{
		
		if (typeof NetworkBrowser_userTimeSelectionChanged != "undefined")
			NetworkBrowser_userTimeSelectionChanged( "historydlg", "mostrecent" );
	}
	else
	{
		
		if (typeof NetworkBrowser_userTimeSelectionChanged != "undefined")
			NetworkBrowser_userTimeSelectionChanged( "historydlg", "holdcurrent" );
	}
	DDD.hidePopup();
}





function HistoryDialog_setHighlighted(elem)
{
	elem.className = 'dddstyle-selected';
}

function HistoryDialog_setNormal(elem)
{
	elem.className = 'dddstyle-inside';
}






function HistoryDialog_disallowDate(date)
{
	
/*
	if (!AdminPage_LastGatherTime)
		return true; 

	if (DateUtil_userTime2serverTime(date) > AdminPage_LastGatherTime )
		return true; 
*/
	return false; 
}

