

















/**
 * @name StatFormatter
 */

Ext.namespace ( "com.actional" );

/**
 * @class A singleton providing general utility functions common to formatting
 * statistic-related data
 * 
 * this depends on a proper StatListDataSet to be present on the page
 * 
 * Note: this was inspired by FormattingType.as - only the minimum required was 
 * moved/adapted to javascript 
 *
 * @lastrev fix37407 - new file
 */
com.actional.StatFormatter = function()
{
	
	
	

	var TYPE_BYTES	= 'bytes';
	var TYPE_TIME	= 'time';
	var TYPE_COUNT	= 'count';
	var TYPE_GENERIC= 'generic';

	/** StatListDataSet instance */
	var itsStatList;

	/**
	 *  @lastrev fix37407 - adapted from FormattingType.as, dropped showUnits and integral options/types 
	 */
	function formatValue(statId, value)
	{
		var formatType = getDefaultFormattingTypeForStat(statId);

		switch(formatType)
		{
			case TYPE_BYTES:
				return formatByteValue(value) + ' ' + getUnitForStat(statId);
		
			case TYPE_TIME:
				return formatTimeValue(value);
	
			case TYPE_COUNT:
			case TYPE_GENERIC:
			{
				var unit = getUnitForStat(statId);
				if(!unit)
					return formatNumberValue(value);
				
				return formatNumberValue(value) + ' ' + unit;
			}
		}
		
		return value.toString();
	}

	function labelForStat(statId)
	{
		if ( itsStatList !== undefined && itsStatList != null )
		{
			var statMetadata = itsStatList.getStatMetadata(statId, false);

			if(statMetadata)
				return statMetadata.name;
		}

		return statId.toLowerCase(); 
	}
	
	/**
	 *  @lastrev fix37407 - ported from FormattingType.as
	 */
	function getDefaultFormattingTypeForStat(statId)
	{
		if ( itsStatList !== undefined && itsStatList != null )
		{
			var statMetaData = itsStatList.getStatMetadata(statId, false);
			if (statMetaData && statMetaData.formattype)
			{
				return statMetaData.formattype;
			}
		}

		return TYPE_GENERIC;
	}

	/**
	 *  @lastrev fix37407 - ported from FormattingType.as (was getFormattingUnitForSubStat)
	 */
	function getUnitForStat(statId, shortUnit)
	{
		if(shortUnit == undefined)
			shortUnit = true;

		var unit;
		if ( itsStatList !== undefined && itsStatList != null )
		{
			var statMetaData = itsStatList.getStatMetadata(statId, false);
			if (statMetaData)
			{
				unit = shortUnit ? statMetaData.shortunit : statMetaData.unit;
			}
		}

		if((!unit) || unit == 'NONE')
		{
			unit = '';
		}

		return unit;
	}

	/** keeps the number of total digits under four
	 */
	function formatDigitsAfterDecimal(value)
	{
		if (value < 10)
		{
			return value.toFixed(2);
		}
		else if (value < 100)
		{
			return value.toFixed(1);
		}

		return value.toFixed(0);
	}

	
	
	
	
	

	var MILLIS		= 'ms';
	var SECONDS	 	= 'secs';
	var MINUTES	 	= 'mins';
	var HOURS		= 'hours';
	var DAYS		= 'days';

	var formats = [ SECONDS, MINUTES, HOURS, DAYS ];

	var DURATION_SECOND		= 1000;
	var DURATION_MINUTE		= DURATION_SECOND * 60;
	var DURATION_HOUR		= DURATION_MINUTE * 60;
	var DURATION_DAY		= DURATION_HOUR * 24;

	var durations = [ DURATION_SECOND, DURATION_MINUTE, DURATION_HOUR, DURATION_DAY ];

	/**
	 *  @lastrev fix37407 - ported from TimeValueFormatter.as 
	 */
	function formatTimeValue(value)
	{
		var format = formatTimeValueToObject(value);

		return format.value + ' ' + format.units;
	}

	/**
	 * this method formats a time value and returns an object with properties 'value' & 'units'
	 * value - string representation of numerical value
	 * units - the units along with the value.
	 *
	 * @return {} {value, units}
	 */
	function formatTimeValueToObject(value)
	{
		if (value == 0)
		{
			return {
				value : '0',
				units : MILLIS
			};
		}

		if (value < 1000)
		{
			return {
				value : value.toFixed(0),
				units : MILLIS
			};
		}

		var i = durations.length - 1;

		for (; i >= 0; i--)
		{
			if (value >= durations[i])
			{
				break;
			}
		}

		value = value/durations[i];

		return {
			value : formatDigitsAfterDecimal(value),
			units : formats[i]
		};
	}

	
	
	
	
	

	var THOUSAND 	= 1000;
	var MILLION	= THOUSAND * THOUSAND;

	var markers = [ THOUSAND, MILLION ];
	var markerStrings = [ 'K', 'M' ];

	function formatNumberValue(value)
	{
		if (value == 0)
		{
			return '0';
		}

		if (value < THOUSAND)
		{
			return parseFloat(formatDigitsAfterDecimal(value)).toString();
		}

		var i = markers.length - 1;

		for (; i >= 0; i--)
		{
			if (value >= markers[i])
			{
				break;
			}
		}

		value /= markers[i];

		return formatDigitsAfterDecimal(value) + markerStrings[i];
	}

	
	
	
	
	

	var KILO_BYTES = 1024;
	var MEGA_BYTES = KILO_BYTES * KILO_BYTES;

	var bytesMarkers = [ KILO_BYTES, MEGA_BYTES ];
	var bytesMarkerStrings = [ 'K', 'M' ];
	
	function formatByteValue(value)
	{
		if (value == 0)
		{
			return '0';
		}

		if (value < KILO_BYTES)
		{
			return value.toFixed(0);
		}

		var i = bytesMarkers.length - 1;
		for (; i >= 0; i--)
		{
			if (value >= bytesMarkers[i])
			{
				break;
			}
		}

		value /= bytesMarkers[i];

		return formatDigitsAfterDecimal(value) + bytesMarkerStrings[i];
	}

	

	
	function singleton_init()
	{
		itsStatList = com.actional.DataStore.statList;
		
		OpenAjax.hub.subscribe(com.actional.serverui.StatListDataSet.EVENT_DATASETCHANGED,
			function()
			{
				itsStatList = com.actional.DataStore.statList; 
			});
		
		OpenAjax.hub.publish('com.actional.util.EventRequest', {'source':'StatFormatter',
			events:[com.actional.serverui.StatListDataSet.EVENT_DATASETCHANGED]});
	}

	singleton_init();
	
	return	{ formatValue:formatValue
		, labelForStat:labelForStat
		};
}();

