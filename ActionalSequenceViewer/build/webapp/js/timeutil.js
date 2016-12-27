

















/**
 * @lastrev fix39622 - SONAR: Critical: Do not use Octal numbers
 */
com.actional.util.TimeUtil = {};

(function(){

	var itIsInited = false;
	var ampmStrings;
	var quarterStrings;

	var localeInfo;
	var fullWeekDays;
	var mediumWeekDays;
	var shortWeekDays;
	var fullMonths;
	var mediumMonths;
	var isDefault24HrTime;

	
	var DATE_FORMAT ;
	var DATE_FORMAT_NO_YEAR ;
	var DATE_FORMAT_NO_MON ;
	var DATE_FORMAT_NO_YEAR_NO_MON ;

	
	
	
	var HOUR_FORMAT ;
	var HOUR_FORMAT_NO_SEC ;
	var HOUR_FORMAT_NO_MIN_NO_SEC ;
	var HOUR_FORMAT_NO_AM ;
	var HOUR_FORMAT_NO_SEC_NO_AM ;
	var HOUR_FORMAT_NO_MIN_NO_SEC_NO_AM ;

	var HOUR_24_FORMAT ;
	var HOUR_24_FORMAT_NO_MIN_NO_SEC ;
	var HOUR_24_FORMAT_NO_SEC ;


	/**
	 * return the number as a string with leading zero if the it is between 0-9 inclusive
	 *
	 * @lastrev fix35988 - new method
	 */
	function leadZero(i)
	{
		if (i >=0 && i <= 9)
		{
			return '0' + i;
		}

		return i;
	}

	/**
	 * return converts a number from 0 to 999 as a string with potential leading zero to make it
	 * 3 digits all the time.  Converts 0-999 to '000'-'999'
	 *
	 * Note: no check for invalid input.
	 *
	 * @lastrev fix36686 - new method
	 */
	function doubleLeadZero(v)
	{
		if( v >= 100 )
		{
			return v;
		}
		else if ( v >= 10 )
		{
			return '0'+v;
		}
		else 
		{
			return '00'+v;
		}
	}

	/**
	 * Returns the hour value in 12 hour format.
	 *
	 * @lastrev fix35988 - new method
	 */
	function get12Hour(date)
	{
		var h = date.getHours() % 12;
		if (h == 0)
		{
			return 12;
		}

		return h;
	}

	/**
	 * formats the date in the given pattern.
	 * if (date1 & connector & rangedToken are present. then date1's rangedToken is appended to the date's
	 * rangedToken (only if present) with connector in between and returned.
	 *
	 * @lastrev fix35988 - new method
	 */
	function format(date, pattern, date1, connector, rangedToken)
	{
		init();
		return pattern.replace(/'[^']*'|zz?z?|dd?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|aa?|SSS|./g, function (token)
					{
						var a = formatToken(date, token);

						if (date1 && connector && (rangedToken == token))
						{
							a = a + connector  + formatToken(date1, token);
						}
						return a;
					});
	}

	/**
	 * formats the date in the given token and returns
	 * token - 'H', 'HH' etc.. returns '1', '01' etc.. respectively
	 *
	 * @lastrev fix36686 - support for milliseconds
	 */
	function formatToken(date, token)
	{
		switch (token)
		{
			case "hh":
				return leadZero(get12Hour(date));
			case "h":
				return get12Hour(date);
			case "HH":
				return leadZero(date.getHours());
			case "H":
				return date.getHours();
			case "mm":
				return leadZero(date.getMinutes());
			case "m":
				return date.getMinutes();
			case "ss":
				return leadZero(date.getSeconds());
			case "s":
				return date.getSeconds();
			case "yyyy":
				return date.getFullYear();
			case "yy":
				return leadZero((date.getFullYear() % 100));
			case "EEEE":
				return fullWeekDays[date.getDay()];
			case "EEE":
				return mediumWeekDays[date.getDay()];
			case "E":
				return shortWeekdays[date.getDate()];
			case "dd":
				return leadZero(date.getDate());
			case "d":
				return date.getDate();
			case "MMMM":
				return fullMonths[date.getMonth()];
			case "MMM":
				return mediumMonths[date.getMonth()];
			case "MM":
				return leadZero((date.getMonth() + 1));
			case "M":
				return (date.getMonth() + 1);
			case "a":
				return date.getHours() < 12 ? ampmStrings[0] : ampmStrings[1];
			case "aa":
				return date.getHours() < 12 ? ampmStrings[0] : ampmStrings[1];
			case "q":
				return quarterStrings[Math.floor(date.getMonth()/3)];
			case "SSS":
				return doubleLeadZero(date.getMilliseconds());
			case "zzz":
			case "zz":
			case "z" :
				return "";
			default :
				
				token = token.replace(/'([^']*)'/g,'$1');
				return token;
		}
	}

	/**
	 * Returns if the given object is date or not.
	 * @lastrev fix35988 - new method
	 */
	function isDate(date)
	{
		return date && (typeof date.getTime == 'function') ;
	}

	/**
	 * Returns the TDate object when a date object/ millis are given
	 *
	 * @lastrev fix35988 - new method
	 */
	function getTDate(date)
	{
		if (isDate(date))
		{
			return new com.actional.util.TDate(date.getTime());
		}
		else
		{
			return new com.actional.util.TDate(date);
		}
	}

	/**
	 * Initializes the time util class to obtain all the locale specific formats , symbols, names.
	 *
	 * @lastrev fix35988 - new method
	 */
	function init()
	{
		if (itIsInited)
		{
			return;
		}

		localeInfo = com.actional.DataStore.localeInfo;

		
		ampmStrings = function (){
			var ampm = com.actional.DataStore.localeInfo.getAmPmStrings();

			var amLen = "AM".length * 2;

			var more = false;
			for (var i = 0; i < ampm.length; i++)
			{
				if (ampm[i].length > amLen)
				{
					more = true;
				}
			}

			if (more)
			{
				ampm = ["AM", "PM"];
			}

			return ampm;
		}();

		
		quarterStrings = function (){
			var qs = com.actional.DataStore.localeInfo.getQuarterStrings();

			var q4Len = "Q4".length ;

			var more = false;
			for (var i = 0; i < qs.length; i++)
			{
				if (qs[i].length > q4Len)
				{
					more = true;
				}
			}

			if (more)
			{
				qs = ["Q1", "Q2", "Q3", "Q4"];
			}

			return qs;
		}();


		
		fullMonths = localeInfo.getFullMonths();
		mediumMonths = localeInfo.getMediumMonths();

		fullWeekDays = localeInfo.getFullWeekDays();
		mediumWeekDays = localeInfo.getMediumWeekDays();
		shortWeekDays = localeInfo.getShortWeekDays();

		isDefault24HrTime = localeInfo.isDefault24HrTime();

		
		DATE_FORMAT			= localeInfo.getTimeUtilFullDate();
		DATE_FORMAT_NO_YEAR		= localeInfo.getTimeUtilFullDateNoYear();
		DATE_FORMAT_NO_MON		= localeInfo.getTimeUtilFullDateNoMonth();
		DATE_FORMAT_NO_YEAR_NO_MON	= localeInfo.getTimeUtilFullDateNoMonthYear();

		
		HOUR_FORMAT			= localeInfo.getTimeUtilTime();
		HOUR_FORMAT_NO_SEC		= localeInfo.getTimeUtilTimeNoSec();
		HOUR_FORMAT_NO_MIN_NO_SEC	= localeInfo.getTimeUtilTimeNoMinSec();
		HOUR_FORMAT_NO_AM		= localeInfo.getTimeUtilTime().replace(/aa?/g, '').trim();
		HOUR_FORMAT_NO_SEC_NO_AM		= localeInfo.getTimeUtilTimeNoSec().replace(/aa?/g, '').trim();
		HOUR_FORMAT_NO_MIN_NO_SEC_NO_AM	= localeInfo.getTimeUtilTimeNoMinSec().replace(/aa?/g, '').trim();

		HOUR_24_FORMAT			= localeInfo.getTimeUtil24HrTime();
		HOUR_24_FORMAT_NO_SEC		= localeInfo.getTimeUtil24HrTimeNoSec();
		HOUR_24_FORMAT_NO_MIN_NO_SEC	= localeInfo.getTimeUtil24HrTimeNoMinSec();

		itIsInited = true;
	}

	
	var DATE_TIME_CONNECTOR = ' ';		
	var DATE_RANGE_CONNECTOR = ' - ';	
	var TIME_RANGE_CONNECTOR = '-';		
	var DAY_CONNECTOR = '-';		
	var YEAR_CONNECTOR = '-';		
	var TODAY_STR = "Today";
	var YESTERDAY_STR = "Yesterday";


	
	
	

	/*
	 * Renders a time range
	ctx
	{
		start_date: (required) Date object containing the start date/time
		end_date: (required) Date object containing the end date/time
		rel_start_date: (optional) Start date/time of a relative interval that may be used to skip parts of the date
		rel_end_date: (optional) End date/time of a relative interval that may be used to skip parts of the date

	}
	 */
	function displayDateTimeRange(ctx)
	{

		init();
		if (!ctx)
			alert('displayDateTimeRange: ctx not specified!');

		var date1, date2;
		date1 = getTDate(ctx.start_date);
		date2 = getTDate(ctx.end_date);

		var rel_date1;
		var rel_date2;

		if (ctx.rel_start_date)
		{
			rel_date1 = getTDate(ctx.rel_start_date);
		}

		if (ctx.rel_end_date)
		{
			rel_date2 = getTDate(ctx.rel_end_date);
		}

		var sameYear = date1.getYear() == date2.getYear();
		var sameMonth = date1.getMonth() == date2.getMonth();
		var sameDay = date1.getDate() == date2.getDate();
		var sameHour = date1.getHours() == date2.getHours();
		var sameMinutes = date1.getMinutes() == date2.getMinutes();
		var sameSeconds = date1.getSeconds() == date2.getSeconds();

		var yearRequired = 	ctx.forceYear || (!rel_date1 && !rel_date2) ||
					(rel_date1 && rel_date2 && rel_date1.getYear() != rel_date2.getYear()) ||
					(rel_date1 && !rel_date2 && rel_date1.getYear() != date1.getYear()) ||
					(rel_date1 && rel_date2 && rel_date1.getYear() == rel_date2.getYear() && rel_date1.getYear() == date1.getYear() && rel_date1.getYear() == date2.getYear());

		

		var differenceInDays = Math.ceil((date2.getTime()-date1.getTime())/(1000*60*60*24));

		var midnight2midnight =	differenceInDays > 0 &&
						date1.getHours() == 0 && date1.getMinutes() == 0 &&
						date2.getHours() == 0 && date2.getMinutes() == 0;

		var sameAmPm = isInSameAmOrPm(date1, date2);

		var startsAtBeginningOfYear = date1.getDate() == 1 && date1.getMonth() == 0 && date1.getHours() == 0 && date1.getMinutes() == 0;
		var endsAtBeginningOfYear = date2.getDate() == 1 && date2.getMonth() == 0 && date2.getHours() == 0 && date2.getMinutes() == 0;
		if (midnight2midnight)
		{
			
			date2.setHours(date2.getHours()-1);
		}
		var daySubstitutionReq =	isToday(date1) || isYesterday(date1) ||
						isToday(date2) || isYesterday(date2);

		var vFormat;

		if (sameYear && sameMonth && sameDay && sameHour && sameMinutes && sameSeconds)
		{
			
			vFormat = renderDateTime(date1, {excludeYear:!yearRequired});
		}
		else if (!sameYear && startsAtBeginningOfYear && endsAtBeginningOfYear)
		{
			
			

			if (date2.getYear() - date1.getYear() == 0)
				vFormat = date1.getFullYear().toString();
			else
			{
				vFormat = date1.getFullYear().toString() +
						YEAR_CONNECTOR + date2.getFullYear().toString();
			}
		}
		else if (midnight2midnight && differenceInDays == 1)
		{
			/*
			 * When the time range falls onto 1 full calendar day, only display the corresponding date,
			 * or a special constant if the date corresponds to the current ("Today") or previous day
			 * ("Yesterday").
			 *
			 * Examples:	1) Yesterday
			 * 		2) Oct 10-11, 2007
			 * 		3) Oct 10-11
			 */

			vFormat = renderDate(date1, {excludeYear:!yearRequired});
		}
		else if (sameYear)
		{
			if (sameMonth)
			{
				if (midnight2midnight)
				{
					if (daySubstitutionReq)
					{
						
						vFormat =	renderDate(date1, {excludeYear: true}) +
								DATE_RANGE_CONNECTOR +
								renderDate(date2, {excludeYear: true});
					}
					else
					{
						
						vFormat =	renderDate(date1,
								{
									excludeYear: !yearRequired,
									hasDateRange: true,
									rangedToken: DATE_FORMAT_NO_YEAR_NO_MON,
									connector : DATE_RANGE_CONNECTOR,
									date2: date2
								});
					}
				}
				else if (sameDay)
				{
					
					vFormat =	renderDateTime(date1,
							{
								excludeYear: !yearRequired,
								excludeAmPm:sameAmPm,
								hasTimeRange: true,
								date2 : date2
							});
				}
				else 
				{
					/*
					 * When the day is different and at least one of the endpoints includes the
					 * time, always include the full date/time of the start and end points.
					 *
					 * Example:	Oct 18, 6am - Oct 20, 2008, 10pm
					 */

					vFormat =	renderDateTime(date1, {excludeYear:true}) +
							DATE_RANGE_CONNECTOR +
							renderDateTime(date2, {forceTime: true,
											excludeYear:!yearRequired});
				}
			}
			else 
			{
				if (midnight2midnight)
				{
					if (daySubstitutionReq)
					{
						
						vFormat =	renderDate(date1, {excludeYear: !yearRequired}) +
								DATE_RANGE_CONNECTOR +
								renderDate(date2, {excludeYear:true});
					}
					else
					{
						
						vFormat =	renderDate(date1, {excludeYear:true}) +
								DATE_RANGE_CONNECTOR +
								renderDate(date2, {excludeYear:!yearRequired});
					}
				}
				else
				{
					/*
					 * When the month is different, always include the full date/time of the
					 * endpoints.
					 */

					
					vFormat =	renderDateTime(date1, {excludeYear:true}) +
							DATE_RANGE_CONNECTOR +
							renderDateTime(date2, {excludeYear:!yearRequired});
				}
			}
		}
		else 
		{
			if (midnight2midnight)
			{
				
				vFormat =	renderDate(date1) +
						DATE_RANGE_CONNECTOR +
						renderDate(date2);
			}
			else
			{
				/*
				 * When the year is different, always include the full date/time, including the year,
				 * for both endpoints. (The case where the interval spans full calendar years has
				 * already been covered previously.)
				 */

				vFormat =	renderDateTime(date1) +
						DATE_RANGE_CONNECTOR +
						renderDateTime(date2);
			}
		}

		return vFormat;
	}

	/**
	 * Returns true if both date1->hour & date2->hour are in AM || date1->hour & date2->hour are in PM
	 *
	 * @lastrev fix35988 - new method
	 */
	function isInSameAmOrPm(date1, date2)
	{
		return (date1.getHours() < 12 && date2.getHours() < 12)
				|| (date1.getHours() >= 12 && date2.getHours() >= 12);
	}

	/**
	 * Returns true if the date corresponds to today.
	 *
	 * @lastrev fix35988 - new method
	 */
	function isToday(date)
	{
		var today = new com.actional.util.TDate();

		return (today.getFullYear() == date.getFullYear()
				&& today.getMonth() == date.getMonth()
				&& today.getDate() == date.getDate());
	}

	/**
	 * Returns true if the date corresponds to yesterday
	 *
	 * @lastrev fix35988 - new method
	 */
	function isYesterday(date)
	{
		var yesterday = new com.actional.util.TDate();
		yesterday.setDate(yesterday.getDate() - 1);

		return (yesterday.getFullYear() == date.getFullYear()
				&& yesterday.getMonth() == date.getMonth()
				&& yesterday.getDate() == date.getDate());
	}

	/*
	 * Renders both the date and time for a specified Date object.
	 *	ctx
	 *	{
	 *		excludeDate: If true, does not render the date portion
	 *		excludeTime: If true, does not render the time portion
	 *		forceTime: forces time (default: do not render time when hours/minutes are 0)
	 *		
	 *		hasTimeRange: true if there is a date2 object in the context for which a time range has
	 *				to be rendered.
	 *		date2: formats the time of date2 object and connects that to the current renderTime's String
	 *				with TIME_RANGE_CONNECTOR
	 *	}
	 * @lastrev fix35988 - added time range formatting implementation.
	 */
	function renderDateTime(dateParam, ctx)
	{
		init();
		if (!ctx)
			ctx = {};

		var dateObj = getTDate(dateParam);

		if (!ctx.forceTime)
			ctx.excludeTime = ctx.excludeTime || (dateObj.getHours() == 0 && dateObj.getMinutes() == 0);

		var result = '';
		if (!ctx.excludeDate)
		{
			result = renderDate(dateObj, ctx);
			if (!ctx.excludeTime)
				result += DATE_TIME_CONNECTOR;
		}
		if (!ctx.excludeTime)
		{
			result += renderTime(dateObj, ctx);

			if (ctx.hasTimeRange)
			{
				result += TIME_RANGE_CONNECTOR + renderTime(ctx.date2);
			}
		}

		return result;
	}

	/*
	 * Renders the date using the specified Date object.
	 *
	 *	ctx
	 *	{
	 *		excludeYear: excludes year from the format.
	 *		excludeMonth: excludes month from the format.
	 *		hasDateRange: true if this is a date range and has to be connected with another date's token.
	 *		date2: used in formatting the date range. only valid when hasDateRange is true.
	 *		connector: the connector connecting the date2 formatted token.
	 *		rangedToken: the token which has to be extracted from date2 and connect it with first date object
	 *	}
	 *
	 * @lastrev fix35988 - added range formatting implementation.
	 */
	function renderDate(dateObj, ctx)
	{
		init();
		if (!ctx)
			ctx = {};


		var vFormat = '';
		var date = getTDate(dateObj);

		var excludeYear = ctx.excludeYear;
		var excludeMonth = ctx.excludeMonth;

		if (isToday(date))
			return TODAY_STR;
		else if (isYesterday(date))
			return YESTERDAY_STR;

		if (excludeYear)
		{
			if (excludeMonth)
				vFormat = DATE_FORMAT_NO_YEAR_NO_MON;
			else
				vFormat = DATE_FORMAT_NO_YEAR;
		}
		else
		{
			if (excludeMonth)
				vFormat = DATE_FORMAT_NO_MON;
			else
				vFormat = DATE_FORMAT;
		}

		if (ctx.hasDateRange)
		{
			return format(date, vFormat, ctx.date2, ctx.connector, ctx.rangedToken);
		}

		return format(date, vFormat);
	}

	/*
	 *
	 *  Helper function for rendering the time from a given Date object.
	 *  ctx is optional and may contain the following parameters:
	 *	ctx
	 *	{
	 *		use24h: whether or not to use a 24 clock (default: false)
	 *		excludeMin: whether the minutes should be excluded (note that this excludes seconds as well)
	 *		excludeSec: whether the seconds should be excluded
	 *		excludeAmPm: whether the AM/PM portion should be included (default: false), will be ignored when use24h=true		}
	 *		forceSec:   whether the seconds (and minutes) should be shown even if zero
	 *	}
	 *
	 *  For rendering a time range send date2 date2ctx. date2 will be time rendered with date2ctx and
	 *  connected to the main formatted time with TIME_RANGE_CONNECTOR
	 *
	 *  @lastrev fix38750 - support to force to show seconds (and minutes) even if zero
	 */
	function renderTime(dateParam, ctx, date2, date2ctx)
	{
		init();

		if (!ctx)
			ctx = {};

		var vFormat = '';

		var date = getTDate(dateParam);

		var excludeAmPm = ctx.excludeAmPm;
		var excludeMin = ctx.excludeMin;
		var excludeSec = ctx.excludeSec;
		var forceSec = ctx.forceSec;
		var use24h = ctx.use24h || isDefault24HrTime;

		if (use24h)
		{
			if(forceSec)
				vFormat = HOUR_24_FORMAT;
			else if ((date.getMinutes() == 0 && date.getSeconds() == 0) || excludeMin)
				vFormat = HOUR_24_FORMAT_NO_MIN_NO_SEC;
			else if (date.getSeconds() == 0 || excludeSec)
				vFormat = HOUR_24_FORMAT_NO_SEC;
			else
				vFormat = HOUR_24_FORMAT;
		}
		else
		{
			if (excludeAmPm)
			{
				if(forceSec)
					vFormat = HOUR_FORMAT_NO_AM;
				else if ((date.getMinutes() == 0 && date.getSeconds() == 0) || excludeMin)
					vFormat = HOUR_FORMAT_NO_MIN_NO_SEC_NO_AM;
				else if (date.getSeconds() == 0 || excludeSec)
					vFormat = HOUR_FORMAT_NO_SEC_NO_AM;
				else
					vFormat = HOUR_FORMAT_NO_AM;
			}
			else
			{
				if(forceSec)
					vFormat = HOUR_FORMAT;
				else if ((date.getMinutes() == 0 && date.getSeconds() == 0) || excludeMin)
					vFormat = HOUR_FORMAT_NO_MIN_NO_SEC;
				else if (date.getSeconds() == 0 || excludeSec)
					vFormat = HOUR_FORMAT_NO_SEC;
				else
					vFormat = HOUR_FORMAT;
			}
		}

		if (date2)
		{
			return format(date, vFormat) + TIME_RANGE_CONNECTOR + renderTime(date2, date2ctx);
		}

		return format(date, vFormat);
	}

	/*
	 * Renders the quarter corresponding to the specified date using locale specified quarterStrings.
	 *
	 * @lastrev fix35988 - updated to use locale specified quarter strings.
	 */
	function renderQuarter(dateObj)
	{
		var date = getTDate(dateObj);

		return quarterStrings[Math.floor(date.getMonth()/3)];
	}

	/*
	 * Renders the interval between 2 specified dates in days, hours and minutes.
	 *
	 * @lastrev fix35988 - updated to use TDate instead of Date.
	 */
	function displayIntervalLength(date1, date2)
	{
		date1 = getTDate(date1);
		date2 = getTDate(date2);

		var ms = date2.getTime() - date1.getTime();
		var days = Math.floor(ms / 86400000);
		var hours = Math.floor((ms - (days * 86400000 ))/3600000);
		var minutes = Math.floor((ms - (days * 86400000 ) - (hours * 3600000 ))/60000);
		var seconds = Math.floor((ms - (days * 86400000 ) - (hours * 3600000 ) - (minutes * 60000))/1000);

		var displayStr = '';
		if (days)
		{
			displayStr += days + 'd';


			if (hours || minutes)
				displayStr += ' ';
		}
		if (hours)
		{
			displayStr += hours + 'h';


			if (minutes || seconds)
				displayStr += ' ';
		}
		if (minutes)
		{
			displayStr += minutes + 'min';
			if (minutes > 1)
				displayStr += 's';
			if (seconds)
				displayStr += ' ';
		}

		if (seconds)
		{
			displayStr += seconds + 's';


		}

		return displayStr;
	}

	/*
	 * Helper function for testing the different scenarios
	 */
	function test_displayTimeRange()
	{
		var today = new Date( (new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate());
		var yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
		var tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

		var testcases =	[
			
			[ yesterday, today, YESTERDAY_STR],

			
			[ today, tomorrow, TODAY_STR],

			
			[ new Date(2006,0,1,0,0), new Date(2007,0,1,0,0), '2006'],
			[ new Date(2006,0,1,0,0), new Date(2008,0,1,0,0), '2006-2007'],

			
			[ new Date(2006,0,1,0,0), new Date(2006,0,2,0,0), 'Jan 1, 2006'],

			
			[ new Date(2006,0,1,0,0), new Date(2006,0,8,0,0), 'Jan 1-7, 2006'],
			[ new Date(2006,0,1,10,30), new Date(2006,0,1,10,30), 'Jan 1, 2006, 10:30am'],
			[ new Date(2006,0,1,10,30,25), new Date(2006,0,1,10,30,25), 'Jan 1, 2006, 10:30:25am'],
			[ new Date(2006,0,1,10,30,1), new Date(2006,0,1,10,30,15), 'Jan 1, 2006, 10:30:01-10:30:15am'],
			[ new Date(2006,0,1,10,0), new Date(2006,0,1,11,30), 'Jan 1, 2006, 10-11:30am'],

			
			[ new Date(2007,9,19,0,0), new Date(2008,8,21,0,0), 'Oct 19, 2007 - Sep 20, 2008'],
			[ new Date(2007,9,19,9,0), new Date(2008,8,21,22,0), 'Oct 19, 2007, 9am - Sep 21, 2008, 10pm'],
			[ new Date(2007,9,19,9,0), new Date(2008,8,21,22,30), 'Oct 19, 2007, 9am - Sep 21, 2008, 10:30pm'],
			[ new Date(2007,9,19,9,30), new Date(2008,8,21,22,0), 'Oct 19, 2007, 9:30am - Sep 21, 2008, 10pm'],
			[ new Date(2007,9,19,9,30), new Date(2008,8,21,22,30), 'Oct 19, 2007, 9:30am - Sep 21, 2008, 10:30pm'],

			
			[ new Date(2008,0,1,0,0), new Date(2008,0,4,4,30), 'Jan 1 - Jan 4, 4:30am'],
			[ new Date(2007,0,1,0,0), new Date(2008,0,4,4,30), 'Jan 1, 2007 - Jan 4, 2008, 4:30am'],
			[ new Date(2007,0,1,0,0), new Date(2007,0,4,4,30), 'Jan 1 - Jan 4, 2007, 4:30am'],
			[ new Date(2007,0,1,0,5), new Date(2007,0,4,4,30), 'Jan 1, 12:05am - Jan 4, 2007, 4:30am'],
			[ new Date(2007,0,1,0,5), new Date(2007,0,1,4,30), 'Jan 1, 2007, 12:05-4:30am'],
			[ new Date(2007,0,1,0,5), new Date(2007,0,1,16,30), 'Jan 1, 2007, 12:05am-4:30pm'],

			
			[ new Date(2008,0,1,0,0), new Date(2008,0,4,4,30,33), 'Jan 1 - Jan 4, 4:30:33am'],
			[ new Date(2007,0,1,0,0), new Date(2008,0,4,4,30), 'Jan 1, 2007 - Jan 4, 2008, 4:30am'],
			[ new Date(2007,0,1,0,0), new Date(2007,0,4,4,30), 'Jan 1 - Jan 4, 2007, 4:30am'],
			[ new Date(2007,0,1,0,5,59), new Date(2007,0,4,4,0,1), 'Jan 1, 12:05:59am - Jan 4, 2007, 4:00:01am'],
			[ new Date(2007,0,1,0,5), new Date(2007,0,1,4,59,59), 'Jan 1, 2007, 12:05-4:59:59am'],
			[ new Date(2007,0,1,0,5), new Date(2007,0,1,16,30,1), 'Jan 1, 2007, 12:05am-4:30:01pm']
		];

		var ctx = { rel_start_date: new Date()};
		for (var i = 0; i < testcases.length; i++)
		{
			var testcase = testcases[i];
			ctx.start_date = testcase[0];
			ctx.end_date = testcase[1];
			var expected_result = testcase[2];
			var result = displayDateTimeRange(ctx);
			if (result == expected_result)
			{
				trace('test ' + (i+1) + ' <font color=green>passed</font>: ' + result);
			}
			else
			{
				trace('test ' + (i+1) + ' <font color=red>failed</font>: Expected "' + expected_result + '", found "' + result + '"');
			}
		}
	}

	/**
	* Utility function to get the Hour and Mins of a date in the AM/PM format
	* @lastrev fix34887 - new function.
	*/
	function getMeridiemHrMins(aDate)
	{
		if(aDate)
		{
			var hours = aDate.getHours();
			var mins = aDate.getMinutes();
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

			return hours+':'+mins + ' ' + (pm ? "PM" : "AM");
		}
		return "";
	}

	
	
	
	
	

	
	function DateUtil_serverTime2userTime(serverTime)
	{
		var server_UTC_offset	= (new Date().getTimezoneOffset()/60)*(-1); 
		var local_UTC_offset	= (new Date().getTimezoneOffset()/60)*(-1);

		var userTime = serverTime + ( (server_UTC_offset - local_UTC_offset) * 3600000 );
		return userTime;
	}

	
	function DateUtil_userTime2serverTime(userTime)
	{
		var server_UTC_offset	= (new Date().getTimezoneOffset()/60)*(-1); 
		var local_UTC_offset	= (new Date().getTimezoneOffset()/60)*(-1);

		var serverTime = userTime - ( (server_UTC_offset - local_UTC_offset) * 3600000 );
		return serverTime;
	}

	
	function DateUtil_serverTime2userDate(serverTime, roundToMinute)
	{
		var userTime = DateUtil_serverTime2userTime(serverTime);

		
		if (roundToMinute)
			userTime = (userTime + 30000) / 60000 * 60000;

		var userDate = new Date(userTime);
		return userDate;
	}

	
	
	

	Ext.apply(com.actional.util.TimeUtil, {
		displayDateTimeRange : displayDateTimeRange,
		renderDateTime : renderDateTime,
		renderDate : renderDate,
		renderTime : renderTime,
		renderQuarter : renderQuarter,
		displayIntervalLength : displayIntervalLength,
		test_displayTimeRange : test_displayTimeRange,
		format : format,

		getMeridiemHrMins : getMeridiemHrMins

		/*
		serverTime2userTime : DateUtil_serverTime2userTime,
		userTime2serverTime : DateUtil_userTime2serverTime,
		serverTime2userDate : DateUtil_serverTime2userDate,
		serverTime2userDate : DateUtil_serverTime2userDate
		*/
	});
})();