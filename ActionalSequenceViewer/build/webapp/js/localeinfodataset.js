


















Ext.namespace("com.actional.ui");
/**
 * Dataset holding the locale specific information to be able access it from javascript.
 *
 * @lastrev fix35988 - new class
 */
com.actional.ui.LocaleInfoDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	preload: function(dataObj)
	{
		com.actional.ui.LocaleInfoDataSet.superclass.preload.call(this, dataObj);

		this.initExtLocaleInfo(dataObj);
	},

	/**
	 * @lastrev fix36129 - Inject some localized data into Date.CultureInfo
	 */
	initExtLocaleInfo: function(dataObj)
	{
		Ext.apply(Date,
		{
			monthNames: dataObj.fullMonths,

			getShortMonthName : function(month)
			{
				return dataObj.mediumMonths[month];
			},

			dayNames: dataObj.fullWeekDays,

			getShortDayName: function (day)
			{
				return dataObj.mediumWeekDays[day];
			}
		});

		if (Date.CultureInfo)
		{
			
			
			

			
			var ampms = this.getAmPmStrings();
			Date.CultureInfo.amDesignator = ampms[0];
			Date.CultureInfo.pmDesignator = ampms[1];

			
			if (!(/^(a\.?m?\.?|p\.?m?\.?)/i.test(ampms[0])))
			{
				
				Date.CultureInfo.regexPatterns.longMeridian = new RegExp("^("+ampms[0]+"|"+ampms[1]+")");


				var meridianFn = function (s)
					{
				            return function ()
				            {
				            	
				                this.meridian = (s.indexOf(Date.CultureInfo.amDesignator) == 0)? "a" : "p";
				            };
					};

				
				
				var _ = Date.Parsing.Operators, g = Date.Grammar;
    				g.tt = _.cache(_.process(g.ctoken2("longMeridian"), meridianFn));
			}

			
			Date.CultureInfo.dateElementOrder = this.getDateElementOrder();
		}
	},

	getLocaleInfo: function()
	{
		return this.getData();
	},

	getLanguage: function()
	{
		return this.getData().language;
	},

	isDefault24HrTime : function()
	{
		return this.getData().isDefault24Hour;
	},

	/**
	 * @lastrev fix36040 - updated method name
	 */
	getDatePattern: function()
	{
		return this.getData().datePattern;
	},

	/**
	 * @lastrev fix36040 - updated method name
	 */
	getTimePattern: function()
	{
		return this.getData().timePattern;
	},

	/**
	 * @lastrev fix36129 - new method
	 */
	getDateElementOrder: function()
	{
		return this.getData().dateElementOrder;
	},

	/**
	 * @lastrev fix36040 - updated method name
	 */
	getDateTimePattern: function()
	{
		return this.getData().dateTimePattern;
	},

	getShortDateTime: function(forDatejs)
	{
		var format = this.getData().shortDateTime;

		if (forDatejs)
		{
			return this.fixPatternForDatejs(format);
		}
		return format;
	},

	getShortDate: function()
	{
		return this.getData().shortDate;
	},

	getShortTime: function(forDatejs)
	{
		var format = this.getData().shortTime;

		if (forDatejs)
		{
			return this.fixPatternForDatejs(format);
		}
		return format;
	},

	getAmPmStrings: function()
	{
		return this.getData().ampm;
	},

	getQuarterStrings: function()
	{
		return this.getData().quarters;
	},

	getFullMonths: function()
	{
		return this.getData().fullMonths;
	},

	getMediumMonths: function()
	{
		return this.getData().mediumMonths;
	},

	getShortMonths: function()
	{
		return this.getData().shortMonths;
	},

	getFullWeekDays: function()
	{
		return this.getData().fullWeekDays;
	},

	getMediumWeekDays: function()
	{
		return this.getData().mediumWeekDays;
	},

	getShortWeekDays: function()
	{
		return this.getData().shortWeekDays;
	},

	getTimeUtilFullDate: function()
	{
		return this.getData().timeUtilFullDate;
	},

	getTimeUtilFullDateNoYear: function()
	{
		return this.getData().timeUtilFullDateNoYear;
	},

	getTimeUtilFullDateNoMonth: function()
	{
		return this.getData().timeUtilFullDateNoMonth;
	},

	getTimeUtilFullDateNoMonthYear: function()
	{
		return this.getData().timeUtilFullDateNoMonthYear;
	},

	getTimeUtilTime: function()
	{
		return this.getData().timeUtilTime;
	},

	getTimeUtilTimeNoSec: function()
	{
		return this.getData().timeUtilTimeNoSec;
	},

	getTimeUtilTimeNoMinSec: function()
	{
		return this.getData().timeUtilTimeNoMinSec;
	},

	getTimeUtil24HrTime: function()
	{
		return this.getData().timeUtil24HrTime;
	},

	getTimeUtil24HrTimeNoSec: function()
	{
		return this.getData().timeUtil24HrTimeNoSec;
	},

	getTimeUtil24HrTimeNoMinSec: function()
	{
		return this.getData().timeUtil24HrTimeNoMinSec;
	},

	/**
	 * Datejs uses 't' and 'tt' for short and long AM/PM
	 * Other libraries (java, Ext) use 'a'.
	 * So, if we use those patterns with datejs, we'll end up with a string like 'Today 11:35 A'.
	 * For Western locales, it looks bad. For Chinese, it simply wont work.
	 * We want to avoid that. So all patterns fed to datejs are fixed to replace 'a' or 'aa' by 'tt'
	 */
	fixPatternForDatejs: function(pattern)
	{
		return pattern.replace(/aa?/g, 'tt');
	}

});


com.actional.ui.LocaleInfoDataSet.ID = "localeInfo";


com.actional.ui.LocaleInfoDataSet.EVENT_DATASETCHANGED =
	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.ui.LocaleInfoDataSet.ID);


