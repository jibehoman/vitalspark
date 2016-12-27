

















Ext.namespace("com.actional.serverui");

/** <!-- ------------------------------------------------------------------------------------ -->
 * Keeps a list of active Logical Types.<br>
 *
 * Works in conjunction with LogicalTypesDataSet.java<br>
 *
 * LogicalTypes structure contains:
 * <ul>
 * <li>id:  Java's LogicalElement KeyId
 * <li>name: displayable name
 * </ul>
 *
 * @class com.actional.serverui.LogicalTypesDataSet
 * @extends com.actional.datastore.PreloadedDataSet
 */
com.actional.serverui.LogicalTypesDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	logicalTypeLookup: null,

	/**
	 *
	 * @param {Array} dataObj -- list of active logical types. 
	 */
	preload: function(dataObj)
	{
		var logicalTypeLookup = {};

		for(var i=0; i<dataObj.length; i++)
		{
			var logicalTypeItem = dataObj[i];

			logicalTypeLookup[logicalTypeItem.id] = logicalTypeItem;
		}

		this.logicalTypeLookup = logicalTypeLookup;

		com.actional.serverui.LogicalTypesDataSet.superclass.preload.call(this, dataObj);
	},

	getLogicalTypesList: function()
	{
		return this.getData();
	},

	getLogicalType: function(logicaltypeid)
	{
		this.assertReady();

		var type = this.logicalTypeLookup[logicaltypeid];

		if(!type)
			throw "Logical Type " + logicaltypeid + "not found";

		return type;
	},

	/**
	 *
	 * @param {String} logicaltypeid
	 * @return {String}
	 */
	getLogicalTypeName: function(logicaltypeid)
	{
		return this.getLogicalType(logicaltypeid).name;
	}
});


com.actional.serverui.LogicalTypesDataSet.ID = "logicalTypes";


com.actional.serverui.LogicalTypesDataSet.EVENT_DATASETCHANGED =
	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.serverui.LogicalTypesDataSet.ID);


