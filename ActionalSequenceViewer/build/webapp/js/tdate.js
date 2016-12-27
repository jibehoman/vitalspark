

















Ext.namespace("com.actional.util");


/**
 * A Date which behaves as a Date object of a target Time Zone.
 * it has all setters and getters of Date. (excluding UTC setters and getters)
 *
 * @lastrev fix35988 - new class;
 */
com.actional.util.TDate =  function(utcMillis)
	{
		if (!this.itsTimeZone)
		{
			throw 'TDate has not been intialized with TimeZone information.';
		}

		this.itsDelegate = new Date();

		if (isNaN(utcMillis))
		{
			utcMillis = this.itsDelegate.getTime();
		}

		this.itsTime = utcMillis;

		if (this.itIsEmulating)
		{
			this.itsPrevTransTime = this.itsNextTransTime = this.itsTime;
			this.initThis();
		}
		else
		{
			this.itsDelegate.setTime(this.itsTime);
		}
	};

com.actional.util.TDate.init = function(name, event)
	{
		var staticMe = com.actional.util.TDate;
		if(!staticMe.prototype.itsTimeZone)
		{
			var timeZone = staticMe.prototype.itsTimeZone = com.actional.DataStore.timeZone;
			staticMe.prototype.itIsEmulating = !timeZone.isNative();
		}
	};


com.actional.util.TDate.isNative = function()
	{
		var staticMe = com.actional.util.TDate;
		return staticMe.prototype.itsTimeZone.isNative();

	};


(function() {

	var prototypeElems = {

		getTimeZone: function()
		{
			return this.itsTimeZone;
		},

		initThis: function()
		{
			if (this.hasTransitions())
			{
				this.updateTransitionBucket();
				this.itsDelegateTime = this.itsTime + this.itsCurrentOffset;
				this.itsDelegate.setTime(this.itsDelegateTime);

			}
			else
			{
				this.itsPrevTransTime = -Number.MAX_VALUE;
				this.itsNextTransTime = +Number.MAX_VALUE;
				this.itsDelegateTime = this.itsTime + this.getRawOffset();
				this.itsCurrentOffset = this.getRawOffset();
				this.itsDelegate.setTime(this.itsDelegateTime);
			}
		},

		hasTransitions :function()
		{
			return this.getTimeZone().hasTransitions();
		},

		getRawOffset :function()
		{
			return this.getTimeZone().getRawOffset();
		},

		/**
		 * Updates the transition bucket for the current time in millis.
		 * Resets the current offset, prev transition time, next transition time if needed
		 *
		 * @lastrev fix35988 - new method.
		 */
		updateTransitionBucket:function()
		{
			if (!this.hasTransitions())
			{
				return false;
			}

			if (this.itsTime >= this.itsPrevTransTime && this.itsTime < this.itsNextTransTime)
			{
				return false;
			}

			var transitionBucket = this.getTransitionBucket(this.itsTime);
			this.itsPrevTransTime = transitionBucket.prev;
			this.itsNextTransTime = transitionBucket.next;
			this.itsCurrentOffset = transitionBucket.offset;

			return true;
		},

		getTransitionBucket:function (time)
		{
			return this.getTimeZone().getTransitionBucket(time);
		},

		/**
		 * Updates the delegate's time and wall time ( itsTime) after an API call.
		 * The method should only be called after an API call to modify time.
		 *
		 * @lastrev fix35988 - new method.
		 */
		update:function()
		{
			var diff = this.itsDelegate.getTime() - this.itsDelegateTime;

			this.itsTime += diff;
			this.itsDelegateTime += diff;

			var oldOffset = this.itsCurrentOffset;
			if (this.updateTransitionBucket())
			{
				/**
				 * Assume our timezone has offsets of -5h and -4h ( DST)
				 * The API call caused the time to cross over a DST transition
				 * 4 cases.
				 * 1) Increased time by x units across DST Start
				 * diff = x units. ( Because the call was made on  itsDelegate.setUTCxxx();
				 * But real time (itsTime) only increased by x - 1h. ie, x + (-5h) - (-4h)
				 * Ex: 12am Mar/8/2009 -> 12am Mar/9/2009 EST. Time actually only increased by 23h.
				 *
				 * 2) Decreased time by x units across DST Start
				 * diff = -x units. ( Because the call was made on  itsDelegate.setUTCxxx();
				 * But real time (itsTime) only decreased by (-x + 1h). ie, -x + (-4h) - (-5h)
				 * Ex: 12am Mar/9/2009 -> 12am Mar/8/2009 EST. Time actually only decreased by 23h.
				 *
				 * 3) Increased time by x units across DST End
				 * diff = x units. ( Because the call was made on  itsDelegate.setUTCxxx();
				 * But real time (itsTime) increased by x + 1h. ie, x + (-4h) - (-5h)
				 * Ex: 12am Nov/2/2008 -> 12am Nov/3/2008 EST. Time actually increased by 25h.
				 *
				 * 4) Decreased time by x units across DST End
				 * diff = -x units. ( Because the call was made on  itsDelegate.setUTCxxx();
				 * But real time (itsTime) only decreased by (-x - 1h). ie, -x + (-5h) - (-4h)
				 * Ex: 12am Nov/3/2008 -> 12am Nov/2/2008 EST. Time actually decreased by 25h.
 				 */
				this.itsTime = this.itsTime + oldOffset - this.itsCurrentOffset;
				this.itsDelegate.setTime( this.itsDelegateTime = (this.itsTime +
											this.itsCurrentOffset));
			}
		},

		getDate:function()
		{
			if (this.itIsEmulating)
			{
				return this.itsDelegate.getUTCDate();
			}
			else
			{
				return this.itsDelegate.getDate();
			}
		},

		getDay:function()
		{
			if (this.itIsEmulating)
			{
				return this.itsDelegate.getUTCDay();
			}
			else
			{
				return this.itsDelegate.getDay();
			}
		},

		getFullYear:function()
		{
			if (this.itIsEmulating)
			{
				return this.itsDelegate.getUTCFullYear();
			}
			else
			{
				return this.itsDelegate.getFullYear();
			}
		},

		getYear:function()
		{
			return this.getFullYear() % 100;
		},

		getHours:function()
		{
			if (this.itIsEmulating)
			{
				return this.itsDelegate.getUTCHours();
			}
			else
			{
				return this.itsDelegate.getHours();
			}
		},

		getMilliseconds:function()
		{
			if (this.itIsEmulating)
			{
				return this.itsDelegate.getUTCMilliseconds();
			}
			else
			{
				return this.itsDelegate.getMilliseconds();
			}
		},

		getMinutes:function()
		{
			if (this.itIsEmulating)
			{
				return this.itsDelegate.getUTCMinutes();
			}
			else
			{
				return this.itsDelegate.getMinutes();
			}
		},

		getMonth:function()
		{
			if (this.itIsEmulating)
			{
				return this.itsDelegate.getUTCMonth();
			}
			else
			{
				return this.itsDelegate.getMonth();
			}
		},

		getSeconds:function()
		{
			if (this.itIsEmulating)
			{
				return this.itsDelegate.getUTCSeconds();
			}
			else
			{
				return this.itsDelegate.getSeconds();
			}
		},

		getTime:function()
		{
			if (this.itIsEmulating)
			{
				return this.itsTime;
			}
			else
			{
				return this.itsDelegate.getTime();
			}
		},

		doDelegate : function(f, args, callUpdate)
		{
			f.apply(this.itsDelegate, args);
			if (callUpdate)
			{
				this.update();
			}
			return this.getTime();
		},

		setDate : function (day)
		{
			if (this.itIsEmulating)
			{
				return this.doDelegate(this.itsDelegate.setUTCDate, arguments , true);
			}
			else
			{
				return this.doDelegate(this.itsDelegate.setDate, arguments , false);
			}
		},

		setFullYear : function (year, month, day)
		{
			if (this.itIsEmulating)
			{
				return this.doDelegate(this.itsDelegate.setUTCFullYear, arguments , true);
			}
			else
			{
				return this.doDelegate(this.itsDelegate.setFullYear, arguments , false);
			}
		},


		setHours : function (hour, minute, second, milliseconds)
		{
			if (this.itIsEmulating)
			{
				return this.doDelegate(this.itsDelegate.setUTCHours, arguments , true);
			}
			else
			{
				return this.doDelegate(this.itsDelegate.setHours, arguments , false);
			}
		},

		setMilliseconds : function (milliseconds)
		{
			if (this.itIsEmulating)
			{
				return this.doDelegate(this.itsDelegate.setUTCMilliseconds, arguments , true);
			}
			else
			{
				return this.doDelegate(this.itsDelegate.setMilliseconds, arguments , false);
			}
		},

		setMinutes : function (minutes, seconds, milliseconds)
		{
			if (this.itIsEmulating)
			{
				return this.doDelegate(this.itsDelegate.setUTCMinutes, arguments , true);
			}
			else
			{
				return this.doDelegate(this.itsDelegate.setMinutes, arguments , false);
			}
		},

		setMonth : function(month, day)
		{
			if (this.itIsEmulating)
			{
				return this.doDelegate(this.itsDelegate.setUTCMonth, arguments , true);
			}
			else
			{
				return this.doDelegate(this.itsDelegate.setMonth, arguments , false);
			}
		},

		setSeconds : function (second, millisecond)
		{
			if (this.itIsEmulating)
			{
				return this.doDelegate(this.itsDelegate.setUTCSeconds, arguments , true);
			}
			else
			{
				return this.doDelegate(this.itsDelegate.setSeconds, arguments , false);
			}
		},

		setTime : function (milliseconds)
		{
			if (this.itIsEmulating)
			{
				this.itsTime = milliseconds;
				this.itsPrevTransTime = this.itsNextTransTime = this.itsTime;
				this.initThis();
				return this.itsTime;
			}
			else
			{
				return this.itsDelegate.setTime(milliseconds);
			}
		}
	};

	Ext.apply(com.actional.util.TDate.prototype,prototypeElems);


})();


OpenAjax.hub.subscribe(com.actional.generalui.TimeZoneDataSet.EVENT_DATASETCHANGED,
				com.actional.util.TDate.init);

OpenAjax.hub.publish('com.actional.util.EventRequest', {'source':'tdate',
		events:[com.actional.generalui.TimeZoneDataSet.EVENT_DATASETCHANGED]});


/**
 * Bridge object we use to convert TDate to and from Date.
 * This class is used by the widgets using TDate to interact
 * with third party calendars which use Date.
 *
 */
com.actional.util.TDateBridge = (function()
{

	var bridge = {

		dateToTDateTime: function(date)
		{
			return com.actional.util.TDateBridge.dateToTDate(date).getTime();
		},

		/**
		 * Converts a date object to a Tdate object.
		 * Both objects agree on the local millis, seconds, minutes, hours, date, month and year
		 * isToday : Optional pramater to set the 'date' of the date object to Today.
		 */
		dateToTDate: function(date , isToday) {

			if (!Ext.isDate(date))
				throw "not a Date object.";

			if (com.actional.util.TDate.isNative())
			{
				return new com.actional.util.TDate(date.getTime());
			}
			var yr = date.getFullYear();
			var month = date.getMonth();
			var dayOfMonth = date.getDate();

			var hrs = date.getHours();
			var mins = date.getMinutes();
			var secs = date.getSeconds();
			var mills = date.getMilliseconds();

			var tDate = new com.actional.util.TDate();

			if (isToday)
			{
				dayOfMonth = tDate.getDate();
			}
			tDate.setFullYear(yr);
			tDate.setMonth(month);
			tDate.setDate(dayOfMonth);
			tDate.setHours(hrs, mins, secs, mills);
			return tDate;
		},

		/**
		 * Converts a Tdate object to a Date object.
		 * Both objects agree on the local millis, seconds, minutes, hours, date, month and year
		 * isToday : Optional pramater to set the 'date' of the date object to Today.
		 */
		tDateToDate: function(tDate) {

			if (com.actional.util.TDate.isNative())
			{
				return new Date(tDate.getTime());
			}
			var yr = tDate.getFullYear();
			var month = tDate.getMonth();
			var dayOfMonth = tDate.getDate();

			var hrs = tDate.getHours();
			var mins = tDate.getMinutes();
			var secs = tDate.getSeconds();
			var mills = tDate.getMilliseconds();

			var date = new Date();

			date.setFullYear(yr);
			date.setMonth(month);
			date.setDate(dayOfMonth);
			date.setHours(hrs, mins, secs, mills);
			return date;
		},

		/**
		 * Converts a Tdate object's 'millis from epoch' to a Date object.
		 *
		 * isToday : Optional pramater to set the 'date' of the date object to Today.
		 */
		tDateTimeToDate: function(time) {

			var tdate;
			if (arguments.length == 0)
			{
				tdate = new com.actional.util.TDate();
			}
			else
			{
				tdate = new com.actional.util.TDate(time);
			}
			return com.actional.util.TDateBridge.tDateToDate(tdate);
		}

	};

	return bridge;
})();

