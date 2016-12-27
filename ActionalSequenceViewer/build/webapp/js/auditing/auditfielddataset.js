//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/auditing/auditfielddataset.js $
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

Ext.namespace("com.actional.serverui");

/** <!-- ------------------------------------------------------------------------------------ -->
 * Exposes the list of Auditing Fields (and potentially other related stuff) to javascript.<br>
 *
 * Works in conjunction with AuditFieldDataSet.java<br>
 *
 * AuditFieldDataSet structure contains:
 * <ul>
 * <li>id:  <FieldID>  (e.g. "interaction")
 * <li>name: <displayable name> (e.g. "Interaction ID")
 * <li>type: <fieldtype> from com.actional.sql.SqlFieldType (e.g. "STRING", "DATETIME", "ENUM").  
 * </ul>
 *
 * @class com.actional.serverui.AuditFieldDataSet
 * @extends com.actional.datastore.PreloadedDataSet
 *
 * @lastrev fix38531 - new
 */
com.actional.serverui.AuditFieldDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	fieldLookup: null,

	/**
	 *
	 * @param {Array} dataObj -- list of auditing fields. 
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

		com.actional.serverui.AuditFieldDataSet.superclass.preload.call(this, dataObj);
	},

	getAuditFieldList: function()
	{
		return this.getData();
	},

	getAuditField: function(fieldid)
	{
		this.assertReady();

		var type = this.fieldLookup[fieldid];

		if(!type)
			throw "Audit Field " + fieldid + " not found";

		return type;
	},

	/**
	 *
	 * @param {String} fieldid
	 * @return {String}
	 */
	getAuditFieldName: function(fieldid)
	{
		return this.getAuditField(fieldid).name;
	}
});

//const static -- access methods above using: "com.actional.DataStore.auditfield.xxx()" syntax
com.actional.serverui.AuditFieldDataSet.ID = "auditfield";

//const static
com.actional.serverui.AuditFieldDataSet.EVENT_DATASETCHANGED =
	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.serverui.AuditFieldDataSet.ID);

