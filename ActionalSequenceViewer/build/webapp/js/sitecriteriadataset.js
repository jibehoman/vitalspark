

















Ext.namespace("com.actional.serverui");

/** <!-- ------------------------------------------------------------------------------------ -->
 * Exposes the list of Site Criteria Fields (and potentially other related stuff) to javascript.<br>
 *
 * Works in conjunction with SiteCriteriaDataSet.java<br>
 *
 * SiteCriteriaField structure contains:
 * <ul>
 * <li>id:  <FieldID>  (e.g. "L1NAME")
 * <li>name: <displayable name> (e.g. "Level 1 Name")
 * <li>datatype: <fieldtype> (e.g. "STRING", "INTEGER", "BOOLEAN" from FieldType in java).  
 * <li>usage: <usage string>  values:
 * 			"displaytype_level1"
 * 			"displaytype_level2" 
 * 			"displaytype_level3" 
 * 			"displaytype_level4"
 * 			"generic"  
 * </ul>
 *
 * @class com.actional.serverui.SiteCriteriaDataSet
 * @extends com.actional.datastore.PreloadedDataSet
 *
 * @lastrev fix38034 - new
 */
com.actional.serverui.SiteCriteriaDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	fieldLookup: null,

	/**
	 *
	 * @param {Array} dataObj -- list of site criteria fields. 
	 */
	preload: function(dataObj)
	{
		var lookup = {};

		for(var i=0; i<dataObj.length; i++)
		{
			var fieldItem = dataObj[i];

			lookup[fieldItem.id] = fieldItem;
		}

		this.fieldLookup = lookup;

		com.actional.serverui.SiteCriteriaDataSet.superclass.preload.call(this, dataObj);
	},

	getSiteCriteriaFieldList: function()
	{
		return this.getData();
	},

	getSiteCriteriaField: function(fieldid)
	{
		this.assertReady();

		var type = this.fieldLookup[fieldid];

		if(!type)
			throw "SiteCriteria Field " + fieldid + " not found";

		return type;
	},

	/**
	 *
	 * @param {String} fieldid
	 * @return {String}
	 */
	getSiteCriteriaFieldName: function(fieldid)
	{
		return this.getSiteCriteriaField(fieldid).name;
	}
});


com.actional.serverui.SiteCriteriaDataSet.ID = "sitecriteria";


com.actional.serverui.SiteCriteriaDataSet.EVENT_DATASETCHANGED =
	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.serverui.SiteCriteriaDataSet.ID);

