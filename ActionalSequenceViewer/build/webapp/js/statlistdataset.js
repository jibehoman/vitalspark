

















Ext.namespace("com.actional.serverui");

/** <!-- ------------------------------------------------------------------------------------ -->
 * Keeps a list of Statistics.<br>
 *
 * Works in conjunction with StatListDataSet.java. Look in that file for the dataObj structure<br>
 *
 * StatType structure contains:
 * <ul>
 * <li>id:  Java's Stat Id
 * <li>name: displayable name
 * </ul>
 *
 * @class com.actional.serverui.StatListDataSet
 * @extends com.actional.datastore.PreloadedDataSet
 */
com.actional.serverui.StatListDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	/**
	 * lookup of LGStatType (substat) ids. Typically to find the "parent statid"
	 *
	 * @type Object:
	 * 	{
	 * 		statid:  'CALLSIZE',
	 * 		substatsentry:  
	 * 		{
	 * 			idsuffix:'_AVERAGE', name:'Average', abbr1:'Avg', abbr2:'avg'
	 * 		}
	 * 	}
	 */
	itsSubStatIdLookup: null,

	/**
	 *
	 * @param {Array} dataObj -- raw JSON object generated in Java
	 */
	preload: function(dataObj)
	{
		var substatidLookup = {};

		var statMetadata = dataObj.statmetadata;

		for(var statid in statMetadata)
		{
			var statMetadataItem = statMetadata[statid];

			var subStats = dataObj.substats[statMetadataItem.substattype];

			if(!subStats)
				continue;

			for(var i=0; i<subStats.length; i++)
			{
				var subStat = subStats[i];

				var lgStatTypeId = statid;

				if(subStat.idsuffix)
					lgStatTypeId += subStat.idsuffix;

				substatidLookup[lgStatTypeId] =
				{
					'statid':statid,
					substatsentry: subStat
				};
			}
		}

		this.itsSubStatIdLookup = substatidLookup;

		com.actional.serverui.StatListDataSet.superclass.preload.call(this, dataObj);
	},

	/**
	 * return the list of statistic for a particular statsetid
	 *
	 *
	 * @param {String} statsetid
	 * @return {Array} ordered array of statid (highlevel ids). returns undefined if not found.
	 */
	getStatSet: function(statsetid)
	{
		return this.getData().statsets[statsetid];
	},

	/** this only works for the ids as given in the statsets (these are not the LGStatType ids)
	 *
	 * @param {} statid
	 * @return {}  { id, name, unit, shortunit, substattype:'norm', substats: {id, name, fullname} }
	 */
	getStatMetadata: function(statid, includeSubStats)
	{
		this.assertReady();

		var statMetadata = this.getData().statmetadata[statid];

		var subStatsInfo = this.getData().substatsinfo;

		if(!statMetadata)
			throw "Statistic " + statid + " not found";

		var statInfo = { id: statid };

		for (var attr in statMetadata)
		{
			statInfo[attr] = statMetadata[attr];
		}

		if(includeSubStats)
		{
			var subStats = this.getData().substats[statMetadata.substattype];

			if(!subStats || !subStatsInfo)
				throw "SubStat info not found for " + statid;

			statInfo['substats'] = [];

			for(var i=0; i< subStats.length; i++)
			{
				var subStat = subStats[i];

				var lgStatTypeId = statid;

				if(subStat.idsuffix)
					lgStatTypeId += subStat.idsuffix;

				var substatMetadata = subStatsInfo[lgStatTypeId];

				if(!substatMetadata)
				{
					
					continue;
				}

				var newSubStat =
				{
					id: lgStatTypeId,
					name: subStat.name,
					fullname: substatMetadata.name
				};

				statInfo.substats[statInfo.substats.length] = newSubStat;
			}
		}

		return statInfo;
	},

	/** this only works for the LGStatType ids
	 *
	 * @param {} substatid
	 * @return {}  { id, statid, name, fullname, abbr1, abbr2, statid, unit, shortunit }
	 */
	getSubStatMetadata: function(substatid)
	{
		var substat = this.itsSubStatIdLookup[substatid];
		var substatinfo = this.getData().substatsinfo[substatid];

		if(!substat || !substatinfo)
			throw "SubStat info not found for " + substatid;

		var statMetadata = this.getData().statmetadata[substat.statid];

		return {
			id: substatid,
			statid: substat.statid,
			name: substat.substatsentry.name,
			fullname: substatinfo.name,
			abbr1: substat.substatsentry.abbr1,
			abbr2: substat.substatsentry.abbr2,
			unit: statMetadata.unit,
			shortunit: statMetadata.shortunit,
			formattype : statMetadata.formattype
		};
	},

	/**
	 * return a generic default substatid for the current statsetid
	 */
	getDefaultSubStatId: function(statsetid)
	{
		return this.getStatMetadata(this.getStatSet(statsetid)[0], true).substats[0].id;
	},

	/** this only works for the LGStatType ids
	 *
	 * @param {} substatid
	 * @return {}  array of substatids & name
	 * 	[
	 * 		{ id:'SOMEID', name:'display name1'},
	 * 		{ id:'SOMEID2', name:'display name2'},
	 * 		{ id:'SOMEMOREID', name:'display name3'}
	 * 	]
	 */
	getSubStatList: function(statsetid)
	{
		var statIds = this.getData().statsets[statsetid];
		var statList = [];

		var subStatInfo =  this.getData().substatsinfo;

		for(var i=0; i<statIds.length; i++)
		{
			var statId = statIds[i];

			var statMetadata = this.getData().statmetadata[statId];

			var subStats = this.getData().substats[statMetadata.substattype];
			for(var j=0; j<subStats.length; j++)
			{
				var subStat = subStats[j];
				var newSubStat = {};

				newSubStat.id = statId;

				if(subStat.idsuffix)
					newSubStat.id += subStat.idsuffix;

				newSubStat.name = subStatInfo[newSubStat.id].name;

				statList[statList.length] = newSubStat;
			}
		}

		return statList;
	}


});


com.actional.serverui.StatListDataSet.ID = "statList";


com.actional.serverui.StatListDataSet.EVENT_DATASETCHANGED =
	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.serverui.StatListDataSet.ID);

