//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/plugins/agenteventinfotypedataset.js $
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
 * Keeps a list of Agent Event Info Type.<br>
 *
 * Works in conjunction with AgentEventInfoTypeDataSet.java<br>
 *
 * AgentEventInfoType structure contains:
 * <ul>
 * <li>id:  Java's AgentEventInfoType KeyId (enum)
 * <li>name: displayable name
 * <li>defaultJmsType: default JMS Content type
 * </ul>
 *
 * @class com.actional.pluginui.AgentEventInfoTypeDataSet
 * @extends com.actional.datastore.PreloadedDataSet
 * @lastrev fix38550 - New class
 */

com.actional.pluginui.AgentEventInfoTypeDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	agentEventInfoTypeLookup: null,

	/**
	 *
	 * @param {Array} dataObj -- list of Agent Event Info Type. 
	 */
	preload: function(dataObj)
	{
		var agentEventInfoTypeLookup = {};

		for(var i=0; i<dataObj.length; i++)
		{
			var agentEventInfoType = dataObj[i];

			agentEventInfoTypeLookup[agentEventInfoType.id] = agentEventInfoType;
		}

		this.agentEventInfoTypeLookup = agentEventInfoTypeLookup;

		com.actional.pluginui.AgentEventInfoTypeDataSet.superclass.preload.call(this, dataObj);
	},

	getAgentEventInfoTypeList: function()
	{
		return this.getData();
	},

	getAgentEventInfoType: function(agentEventInfoTypeId)
	{
		this.assertReady();

		var type = this.agentEventInfoTypeLookup[agentEventInfoTypeId];

		if(!type)
			return null;

		return type;
	},

	getAgentEventInfoTypeName: function(agentEventInfoTypeId)
	{
		var agentEventInfoType = this.getAgentEventInfoType(agentEventInfoTypeId);
		if (agentEventInfoType)
			return agentEventInfoType.name;
		else
			return '';
	},
	
	getAgentEventInfoDefaultJmsType: function(agentEventInfoTypeId)
	{
		var agentEventInfoType = this.getAgentEventInfoType(agentEventInfoTypeId);
		if (agentEventInfoType)
			return agentEventInfoType.defaultJmsType;
		else
			return '';
	}
});

//const static -- access methods above using: "com.actional.DataStore.agentEventInfoTypes.xxx()" syntax
com.actional.pluginui.AgentEventInfoTypeDataSet.ID = "agentEventInfoTypes";

//const static
com.actional.pluginui.AgentEventInfoTypeDataSet.EVENT_DATASETCHANGED =
	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.pluginui.AgentEventInfoTypeDataSet.ID);


