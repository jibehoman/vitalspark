

















Ext.namespace("com.actional.serverui");

/** <!-- ------------------------------------------------------------------------------------ -->
 * Keeps a list of available Grouping Schemes.<br>
 *
 * Works in conjunction with GroupingSchemesDataSet.java<br>
 *
 * GroupingScheme structure contains:
 * <ul>
 * <li>id:  Java's GroupingScheme KeyId
 * <li>name: displayable name
 * </ul>
 *
 * @class com.actional.serverui.GroupingSchemesDataSet
 * @extends com.actional.datastore.PreloadedDataSet
 */
com.actional.serverui.GroupingSchemesDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	groupingSchemeLookup: null,

	/**
	 *
	 * @param {Array} dataObj -- list of available grouping schemes. 
	 */
	preload: function(dataObj)
	{
		var groupingSchemeLookup = {};

		for(var i=0; i<dataObj.length; i++)
		{
			var groupingSchemeItem = dataObj[i];

			groupingSchemeLookup[groupingSchemeItem.id] = groupingSchemeItem;
		}

		this.groupingSchemeLookup = groupingSchemeLookup;

		com.actional.serverui.GroupingSchemesDataSet.superclass.preload.call(this, dataObj);
	},

	getGroupingSchemesList: function()
	{
		return this.getData();
	},

	getGroupingScheme: function(groupingschemeid)
	{
		this.assertReady();

		var type = this.groupingSchemeLookup[groupingschemeid];

		if(!type)
			throw "Grouping Scheme " + groupingschemeid + "not found";

		return type;
	},

	/**
	 *
	 * @param {String} groupingschemeid
	 * @return {String}
	 */
	getGroupingSchemeName: function(groupingschemeid)
	{
		return this.getGroupingScheme(groupingschemeid).name;
	}
});


com.actional.serverui.GroupingSchemesDataSet.ID = "groupingSchemes";


com.actional.serverui.GroupingSchemesDataSet.EVENT_DATASETCHANGED =
	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.serverui.GroupingSchemesDataSet.ID);


