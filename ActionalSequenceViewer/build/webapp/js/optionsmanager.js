

















Ext.namespace('com.actional.serverui');

/**
 *
 * @class com.actional.serverui.OptionsManager
 * @extends Ext.util.Observable
 */
com.actional.serverui.OptionsManager = Ext.extend(Ext.util.Observable, 
{
	/**
	* @cfg {String} managerId (Optional)
	*
	* An optional id by which to identify the instance
	*/
	constructor: function(config)
	{
		this.itsId = '';

		if (config && config.managerId)
		{
			com.actional.serverui.OptionsManager.idMap[config.managerId] = this;
			this.itsId = config.managerId;
		}

		this.itsTabsClass = [];
		this.itsOptionsDialog = undefined;

	},

	addTab : function(tabClass)
	{
		this.itsTabsClass.push(tabClass);
	},

	insertTab : function(tabClass, pos)
	{
		this.itsTabsClass.splice(pos, 0, tabClass);
	},

	showOptionsDialog : function()
	{
    		if(!this.itsOptionsDialog)
    			this.itsOptionsDialog = new com.actional.serverui.network.OptionsDialog({itsId: this.itsId}, this);

    		this.itsOptionsDialog.disableOkApply();
    		this.itsOptionsDialog.show();
	}
});

Ext.reg('com.actional.serverui.OptionsManager', com.actional.serverui.OptionsManager);




com.actional.serverui.OptionsManager.itsInstance = null;

com.actional.serverui.OptionsManager.idMap = {};

com.actional.serverui.OptionsManager.getManager = function(id)
{
	if(!id)
	{
		if(!com.actional.serverui.OptionsManager.itsInstance)
			com.actional.serverui.OptionsManager.itsInstance = new com.actional.serverui.OptionsManager();

		return com.actional.serverui.OptionsManager.itsInstance;
	}
	else
	{
		var manager = com.actional.serverui.OptionsManager.idMap[id];
		if(!manager)
		{
			manager = new com.actional.serverui.OptionsManager({ managerId:id });
		}
		return manager;
	}

};