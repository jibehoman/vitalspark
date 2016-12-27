

















Ext.namespace("com.actional.generalui");

/**
 * com.actiona.generalui.TimeZoneDataSet - data set holding the current user set timezone information.
 * @lastrev fix35988 - new class
 */
com.actional.generalui.TimeZoneDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{

	itsYearIndex : null,
	itsIndexDate : null,

	/**
	 *
	 * @param {Array} dataObj -- raw JSON object generated in Java
	 */
	preload: function(dataObj)
	{

		
		

		var ts = dataObj.itsTransitions;

		if (!dataObj.itIsNative && ts.length > 0)
		{
			this.itsYearIndex = {};
			this.itsIndexDate = new Date();

			for (var i = 0; i < ts.length; i++)
			{
				/**
				 * From TimeZoneDataSet.java it comes in as seconds so convert it back into
				 * milliseconds. This converted millis is given to flash's TimeZoneDataSet.as
				 */
				ts[i].t *= 1000;
				ts[i].o *= 1000;

				this.itsIndexDate.setTime(ts[i].t);

				var yr = this.itsIndexDate.getFullYear().toString();

				if (this.itsYearIndex.hasOwnProperty(yr))
				{
					continue;
				}
				var index = this.itsYearIndex[yr];

				if(!this.itsYearIndex.hasOwnProperty('minYear'))
				{
					this.itsYearIndex['minYear'] = yr;
				}
				this.itsYearIndex['maxYear'] = yr;
				this.itsYearIndex[yr] = i;
			}
		}

		com.actional.generalui.TimeZoneDataSet.superclass.preload.call(this, dataObj);
	},

	isNative: function()
	{
		return this.getData().itIsNative;
	},

	hasTransitions: function()
	{
		var tsns = this.getData().itsTransitions;
		return (tsns && tsns.length > 0);
	},

	getRawOffset: function()
	{
		return this.getData().itsRawOffset;
	},

	getTransitionBucket: function(time)
	{
		if ((!this.hasTransitions()))
		{
			return {
				'prev' : -Number.MAX_VALUE,
				'next' : +Number.MAX_VALUE,
				'offset' : getRawOffset()
			};

		}

		var ts = this.getData().itsTransitions;

		var i = this.getIndex(time);

		for (; i < ts.length; i++)
		{
			if (time < ts[i].t)
			{
				i = (i-1);
				break;
			}
		}

		if (i == -1)
		{
			return {
				'prev' : -Number.MAX_VALUE,
				'next' : ts[0].t,
				'offset' : this.getRawOffset()
			};
		}

		if (i >= ts.length)
		{
			return {
				'prev' : ts[i-1].t,
				'next' : Number.MAX_VALUE,
				'offset' : this.getRawOffset()
			};

		}

		return {
			'prev' : ts[i].t,
			'next' : ts[i+1].t,
			'offset' : ts[i].o
		};

	},

	getIndex: function(time)
	{
		if(this.isNative())
		{
			throw 'unsupported for native timezone';
		}
		this.itsIndexDate.setTime(time);

		var year = this.itsIndexDate.getFullYear();

		if (year < this.itsYearIndex.minYear)
			return 0;

		if (year > this.itsYearIndex.maxYear)
			return this.getData().itsTransitions.length;

		return this.itsYearIndex[year.toString()] || 0;
	}
});


com.actional.generalui.TimeZoneDataSet.ID = "timeZone";


com.actional.generalui.TimeZoneDataSet.EVENT_DATASETCHANGED = 	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.generalui.TimeZoneDataSet.ID);


