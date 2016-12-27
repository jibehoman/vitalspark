

















Ext.namespace('com.actional.serverui');

/**
 *
 * @class com.actional.serverui.OptionsTab
 * @extends Ext.Panel
 */

com.actional.serverui.OptionsTab = Ext.extend(Ext.Panel,
{
	itsDialog: undefined,		
	itsEventSourceName: 'default',
	itsTabName: 'default',		
	itsIsModified: false,

	safeGetCmpValue : function(html_id)
	{
		var obj = Ext.getCmp(html_id);
		if(!obj)
			return null;
		else	
			return obj.getValue();
	},
	
	setCmpValue : function(html_id, value)
	{
		var obj = Ext.getCmp(html_id);
		if(obj)
			obj.setValue(value);
	},
	
	onSettingModified : function()
	{
		this.itsIsModified = true;
		this.itsDialog.enableOkApply();
		this.itsDialog.renameButtonAsCancel();
	},
	
	revertSettings : function()
	{
		
	}
});

Ext.reg('com.actional.serverui.OptionsTab', com.actional.serverui.OptionsTab);
