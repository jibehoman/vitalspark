

















Ext.namespace("com.actional.serverui");

/** <!-- ------------------------------------------------------------------------------------ -->
 * Exposes the list of Display Types to javascript.<br>
 *
 * Works in conjunction with DisplayTypesDataSet.java<br>
 *
 * DisplayTypes structure contains:
 * <ul>
 * <li>id:  <Integer>
 * <li>name: <displayable name> (e.g. "BEA WebLogic", "Queue" or "System of record")
 * <li>url: <url to small icon>
 * <li>iconstyle: the css style class name to have a background image showing that icon
 * </ul>
 *
 * @class com.actional.serverui.DisplayTypesDataSet
 * @extends com.actional.datastore.PreloadedDataSet
 *
 * @lastrev fix38156 - tweak comments to reflect new css style field
 */
com.actional.serverui.DisplayTypesDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	displayTypeLookup: null,

	/**
	 *
	 * @param {Array} dataObj -- list of display types
	 */
	preload: function(dataObj)
	{
		var lookup = {};

		for(var i=0; i<dataObj.length; i++)
		{
			var displayTypeItem = dataObj[i];

			lookup[displayTypeItem.id] = displayTypeItem;
		}

		this.displayTypeLookup = lookup;

		com.actional.serverui.DisplayTypesDataSet.superclass.preload.call(this, dataObj);
	},

	getDisplayTypesList: function()
	{
		return this.getData();
	},

	getDisplayType: function(displaytypeid)
	{
		this.assertReady();

		var type = this.displayTypeLookup[displaytypeid];

		if(!type)
			throw "DisplayType " + displaytypeid + " not found";

		return type;
	},

	/**
	 *
	 * @param {String} displaytypeid
	 * @return {String}
	 */
	getDisplayTypeName: function(displaytypeid)
	{
		return this.getDisplayType(displaytypeid).name;
	}
});


com.actional.serverui.DisplayTypesDataSet.ID = "displaytypes";


com.actional.serverui.DisplayTypesDataSet.EVENT_DATASETCHANGED =
	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.serverui.DisplayTypesDataSet.ID);

