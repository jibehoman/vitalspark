

















function TimeSelection_setDate(id, dateobj)
{

	TimeSelection_setTime(id, dateobj.getHours(), dateobj.getMinutes());
}

/** @param dateobj is optional - if passed, this date instance will be
 *		modified with the new time
 *         (using the current timezone)
 *
 *  @return a Date object
 */
function TimeSelection_getDate(id, dateobj)
{
	var ctx = TimeSelection_getTimeSelectionContext(id);
	if(!dateobj)
		dateobj = new Date();

	var datelong = dateobj.getTime();

	
	datelong = Math.ceil(datelong / 60000) * 60000;

	dateobj.setTime(datelong);

	dateobj.setHours(ctx.hour);
	dateobj.setMinutes(ctx.minute);
	return dateobj;
}

/**
 *  @return an object that has a field 'hours' and a field 'minutes'.
 *  hours is a number ranging 0..23 and minutes 0..59
 */
function TimeSelection_getTime(id)
{
	var ctx = TimeSelection_getTimeSelectionContext(id);
	if(!ctx) return;

	return { hours:ctx.hour, minutes:ctx.minute };
}

function TimeSelection_setTime(id, hour24, minutes)
{
	var ctx = TimeSelection_getTimeSelectionContext(id);
	if(!ctx) return;

	ctx.hour = hour24;
	ctx.minute = minutes;

	TimeSelection_updateTimeCells(ctx);
}

function TimeSelection_getTimeSelectionContext(id)
{

	var elem = document.getElementById(id);

	if(!elem)
		return null;

	var context = elem.TimeSelection_context;
	if(!context)
	{
		elem.TimeSelection_context = context = {};
		context.id = id;
	}

	return context;
}

function TimeSelection_getEditField(ctx)
{
	return document.getElementById(ctx.id + '_textbox');
}

/** return false if could not parse date */
function TimeSelection_parseDate(ctx)
{
	var textboxelem = TimeSelection_getEditField(ctx);
	if(!textboxelem) return;

	var str = textboxelem.value.toLowerCase();

	

	
	
	

	var ndx_colon = str.indexOf(":");
	if(ndx_colon < 0)
		return false;

	var hourstr = str.substr(0, ndx_colon);
	hourstr = hourstr.replace(/ /,"");
	if(hourstr.length == 0)
		return false;

	var hour = parseInt(hourstr, 10);

	var ndx_am = str.indexOf("am");
	var ndx_pm = str.indexOf("pm");

	var minutestopndx = -1;

	if(ndx_am >= 0)
	{
		if(ndx_pm >= 0)
			return false; 
		else
			minutestopndx = ndx_am;
	}
	else
	{
		if(ndx_pm >= 0)
			minutestopndx = ndx_pm;
		else
			minutestopndx = str.length;
	}

	var minutestr = str.substr(ndx_colon + 1, minutestopndx);
	minutestr = minutestr.replace(/ /,"");
	if(minutestr.length == 0)
		return false;

	var minute = parseInt(minutestr, 10);

	if(ndx_pm >= 0 || ndx_am >= 0)
	{
		if(hour > 12)
			return false;  

		if(hour == 12)
			hour = 0;

		if(ndx_pm >= 0)
			hour += 12;
	}

	while(hour >= 24)
	{
		hour -= 24;
	}

	if(!(hour >= 0 && hour < 24))
		return false;

	if(!(minute >= 0 && minute < 60))
		return false;

	ctx.hour = hour;
	ctx.minute = minute;

	return true;
}

function TimeSelection_cycleHours(id, step)
{

	var ctx = TimeSelection_getTimeSelectionContext(id);

	if(!ctx) return;

	if(ctx.hour < 12)
	{
		ctx.hour+=step;

		if(ctx.hour >= 12)
			ctx.hour -= 12;

		if(ctx.hour < 0)
			ctx.hour += 12;
	}
	else
	{
		ctx.hour+=step;

		if(ctx.hour >= 24)
			ctx.hour -= 12;

		if(ctx.hour < 12)
			ctx.hour += 12;
	}


	TimeSelection_updateTimeCells(ctx);
}

function TimeSelection_cycleMinutes(id, step)
{

	var ctx = TimeSelection_getTimeSelectionContext(id);

	if(!ctx) return;

	ctx.minute+=step;

	if(step < 0)
		ctx.minute = Math.floor(ctx.minute/5) * 5;
	else
		ctx.minute = Math.ceil(ctx.minute/5) * 5;

	if(ctx.minute >= 60)
		ctx.minute -= 60;

	if(ctx.minute < 0)
		ctx.minute += 60;

	TimeSelection_updateTimeCells(ctx);
}

function TimeSelection_cycleAMPM(id, step)
{

	var ctx = TimeSelection_getTimeSelectionContext(id);

	if(!ctx) return;

	ctx.hour += 12;
	if(ctx.hour >= 24)
		ctx.hour -= 24;

	TimeSelection_updateTimeCells(ctx);
}

function TimeSelection_onblur(id)
{
	var ctx = TimeSelection_getTimeSelectionContext(id);
	if(!ctx) return;

	if(ctx.timerid)
	{
		clearInterval(ctx.timerid);
		ctx.timerid = null;
	}

	TimeSelection_handleDateChanged(ctx);

	TimeSelection_hideTextBox(ctx);
}

function TimeSelection_oncellclick(id)
{
	var ctx = TimeSelection_getTimeSelectionContext(id);
	if(!ctx) return;

	TimeSelection_displayTextBox(ctx);
}

function TimeSelection_onIntervalTimer(id)
{
	var ctx = TimeSelection_getTimeSelectionContext(id);
	if(!ctx) return;

	TimeSelection_handleDateChanged(ctx);
}

function TimeSelection_ontextfocus(id)
{
	var ctx = TimeSelection_getTimeSelectionContext(id);
	if(!ctx) return;

	ctx.timerid = setInterval("TimeSelection_pollingDateCheck('"+id+"')", 300);
}

function TimeSelection_onkeypress(event, id)
{
	var ctx = TimeSelection_getTimeSelectionContext(id);
	if(!ctx) return;

	if(event.keyCode == 13)
		TimeSelection_hideTextBox(ctx, true);

	TimeSelection_handleDateChanged(ctx);
}

function TimeSelection_pollingDateCheck(id)
{
	var ctx = TimeSelection_getTimeSelectionContext(id);
	if(!ctx) return;

	TimeSelection_handleDateChanged(ctx);
}

function TimeSelection_handleDateChanged(ctx)
{
	var textboxelem = TimeSelection_getEditField(ctx);
	if(!textboxelem) return;

	var valid = TimeSelection_parseDate(ctx);

	if(!valid)
	{
		textboxelem.style.color = '#FF0000';
		return;
	}

	textboxelem.style.color = '#000000';

	TimeSelection_updateTimeCells(ctx);
}

function TimeSelection_convertToDisplayable(ctx)
{
	var displayTime = {};

	displayTime.minute = ctx.minute<10?('0'+ctx.minute):(''+ctx.minute);

	displayTime.isPM = (ctx.hour >= 12);
	displayTime.hour = displayTime.isPM?(ctx.hour-12):ctx.hour;

	if(displayTime.hour == 0)
		displayTime.hour = 12;

	displayTime.hour = ''+displayTime.hour;
	displayTime.ampm = displayTime.isPM?'PM':'AM';

	return displayTime;
}

function TimeSelection_updateTimeCells(ctx)
{

	var displayTime = TimeSelection_convertToDisplayable(ctx);

	if(ctx.displayedhour == displayTime.hour &&
	   ctx.displayedminute == displayTime.minute &&
	   ctx.displayedampm == displayTime.ampm)
	{

		return;
	}

ctx.displayedhour = displayTime.hour;
	ctx.displayedminute = displayTime.minute;
	ctx.displayedampm = displayTime.ampm;

	var elem;

	elem = document.getElementById(ctx.id+'_minutes');
	if(!elem)
	{

		return;
	}

	elem.innerHTML = ctx.displayedminute;


	elem = document.getElementById(ctx.id+'_hour');
	if(!elem)
	{

		return;
	}

	elem.innerHTML = ctx.displayedhour;

	elem = document.getElementById(ctx.id+'_ampm');
	if(!elem)
	{

		return;
	}

	elem.innerHTML = '&nbsp;'+ctx.displayedampm;
}

function TimeSelection_displayTextBox(ctx)
{
	var cellrowelem = document.getElementById(ctx.id+'_cellsrow');
	if(!cellrowelem)
		return;
	var textboxrowelem = document.getElementById(ctx.id+'_textboxrow');
	if(!textboxrowelem)
		return;
	var textboxelem = TimeSelection_getEditField(ctx);
	if(!textboxelem) return;

	cellrowelem.style.display = 'none';
	textboxrowelem.style.display = '';

	var displayTime = TimeSelection_convertToDisplayable(ctx);

	textboxelem.value = displayTime.hour + ':' + displayTime.minute + ' ' + displayTime.ampm;

	

	textboxelem.focus();
	
}

function TimeSelection_hideTextBox(ctx, handlefocus)
{
	var cellrowelem = document.getElementById(ctx.id+'_cellsrow');
	if(!cellrowelem)
		return;
	var textboxrowelem = document.getElementById(ctx.id+'_textboxrow');
	if(!textboxrowelem)
		return;

	cellrowelem.style.display = '';
	textboxrowelem.style.display = 'none';

	if(handlefocus)
	{
		var elem = document.getElementById(ctx.id+'_nextfocus');
		if(!elem)
			return;

		elem.focus();
	}
}
