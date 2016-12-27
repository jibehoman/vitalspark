

















Ext.namespace("com.actional.serverui");

/** <!-- ------------------------------------------------------------------------------------ -->
 * Keeps an ordered list of available time units. (i.e. mega intervals).<br>
 * Larger (years) first, smallest (minutes) last.<br>
 * <br>
 * The smallest corresponds to the gather interval<br>
 *
 * Works in conjunction with TimeUnitsDataSet.java/.as<br>
 *
 * TimeUnit structure contains:
 * <ul>
 * <li>id:  Java's TimeUnitType enum
 * <li>name: displayable name
 * <li>duration: in ms. (This is an approximation of the duration - special cases like "MONTH"
 * 	won't work with this number)
 * </ul>
 *
 * @class com.actional.serverui.TimeUnitsDataSet
 * @extends com.actional.datastore.PreloadedDataSet
 */
com.actional.serverui.TimeUnitsDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	timeUnitLookup: null,

	/**
	 *
	 * @param {Array} dataObj -- ordered list of available time units. (i.e. mega intervals).
	 *   Larger (years) first, smallest (minutes) last.
	 *
	 * The smallest corresponds to the gather interval
	 */
	preload: function(dataObj)
	{
		var timeUnitLookup = {};

		for(var i=0; i<dataObj.length; i++)
		{
			var timeUnitItem = dataObj[i];

			timeUnitLookup[timeUnitItem.id] = timeUnitItem;
		}

		this.timeUnitLookup = timeUnitLookup;

		com.actional.serverui.TimeUnitsDataSet.superclass.preload.call(this, dataObj);
	},

	getTimeUnitList: function()
	{
		return this.getData();
	},

	getTimeUnit: function(timeunitid)
	{
		this.assertReady();

		var timeunit = this.timeUnitLookup[timeunitid];

		if(!timeunit)
			throw "time unit " + timeunitid + "not found";

		return timeunit;
	},

	/**
	 *
	 * @param {String} timeunitid
	 * @return {String}
	 */
	getTimeUnitName: function(timeunitid)
	{
		return this.getTimeUnit(timeunitid).name;
	},

	/**
	 * Also known as the "gather interval"
	 *
	 * @return {TimeUnit}
	 */
	getSmallestInterval: function()
	{
		var data = this.getData();

		
		return data[data.length-1];
	}
});


com.actional.serverui.TimeUnitsDataSet.ID = "timeUnits";


com.actional.serverui.TimeUnitsDataSet.EVENT_DATASETCHANGED =
	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.serverui.TimeUnitsDataSet.ID);


