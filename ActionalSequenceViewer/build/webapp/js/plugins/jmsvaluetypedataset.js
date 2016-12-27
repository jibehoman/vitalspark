//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/plugins/jmsvaluetypedataset.js $
// Checked in by: $Author: mohamed.sahmoud $
// $Date: 2015-04-14 14:03:31 +0000 (Tue, 14 Apr 2015) $
// $Revision: 64893 $
//---------------------------------------------------------------------------------------------------------------------
// Copyright (c) 2012-2015. Aurea Software, Inc. All Rights Reserved.
//
// You are hereby placed on notice that the software, its related technology and services may be covered by one or
// more United States ("US") and non-US patents. A listing that associates patented and patent-pending products
// included in the software, software updates, their related technology and services with one or more patent numbers
// is available for you and the general public's access at www.aurea.com/legal/ (the "Patent Notice") without charge.
// The association of products-to-patent numbers at the Patent Notice may not be an exclusive listing of associations,
// and other unlisted patents or pending patents may also be associated with the products. Likewise, the patents or
// pending patents may also be associated with unlisted products. You agree to regularly review the products-to-patent
// number(s) association at the Patent Notice to check for updates.
//=====================================================================================================================

Ext.namespace("com.actional.pluginui");

/** <!-- ------------------------------------------------------------------------------------ -->
 * Keeps a list of JMS Value Types.<br>
 *
 * Works in conjunction with JMSValueTypeDataSet.java<br>
 *
 * JMSValueType structure contains:
 * <ul>
 * <li>id:  Java's JMSValueType KeyId (enum)
 * <li>name: displayable name
 * </ul>
 *
 * @class com.actional.pluginui.JMSValueTypeDataSet
 * @extends com.actional.datastore.PreloadedDataSet
 * @lastrev fix38550 - New class
 */

com.actional.pluginui.JMSValueTypeDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	jmsValueTypeLookup: null,

	/**
	 *
	 * @param {Array} dataObj -- list of JMS Value Types. 
	 */
	preload: function(dataObj)
	{
		var jmsValueTypeLookup = {};

		for(var i=0; i<dataObj.length; i++)
		{
			var jmsValueType = dataObj[i];

			jmsValueTypeLookup[jmsValueType.id] = jmsValueType;
		}

		this.jmsValueTypeLookup = jmsValueTypeLookup;

		com.actional.pluginui.JMSValueTypeDataSet.superclass.preload.call(this, dataObj);
	},

	getJmsValueTypeList: function()
	{
		return this.getData();
	},

	getJmsValueType: function(jmsValueTypeId)
	{
		this.assertReady();

		var type = this.jmsValueTypeLookup[jmsValueTypeId];

		if(!type)
			return null;

		return type;
	},

	getJmsValueTypeName: function(jmsValueTypeId)
	{
		var jmsValueType =  this.getJmsValueType(jmsValueTypeId);
		if (jmsValueType)
			return jmsValueType.name;
		else
			return '';
	}
});

//const static -- access methods above using: "com.actional.DataStore.jmsValueTypes.xxx()" syntax
com.actional.pluginui.JMSValueTypeDataSet.ID = "jmsValueTypes";

//const static
com.actional.pluginui.JMSValueTypeDataSet.EVENT_DATASETCHANGED =
	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.pluginui.JMSValueTypeDataSet.ID);


