

















Ext.namespace('com.actional.serverui.network');


/**
 * @class com.actional.serverui.network.OptionsDialog
 * @extends Ext.Window
 *
 * @lastrev fix38284 - updated the method which retrieves the localized string.
 */
com.actional.serverui.network.OptionsDialog = Ext.extend(Ext.Window,
{

	constructor: function(config, manager)
	{

		this.itsId = config.itsId || '';

		com.actional.serverui.network.OptionsDialog.superclass.constructor.call(this, Ext.applyIf(config,
		{
			title       	: this.getDialogLabel('title'),
			itsManager  	: manager,
			id	    	: this.componentId('options-dialog'),
	               layout      	: 'fit',
	                width       	: 500,
			height      	: 430,
	                closeAction 	: 'hide',
	                modal	    	: true,
	                plain       	: true,
	                y		: isInPct20() ? 100 : undefined,

	                items:
	                {
	                    xtype: 'form',
	                    labelWidth: 140,
	                    border: false,
	                    width: 400,

			    items:
			    {
			    	id: this.componentId('options-tab-container'),
				xtype: 'tabpanel',
				activeTab: 0,
				border: false,
	 			defaults:
	 			{
	 				autoHeight:true,
	 				bodyStyle:'padding:25px',
	 				itsDialog: this
	 			},
				items: manager.itsTabsClass
			    }
	                },

			buttons:
			[{
				id       : this.componentId('btn_ok'),
				text     : this.getDialogLabel('buttons.ok'),
				disabled : true,
				handler  : function()
				{
					this.saveSettings();
					this.hide();
				},
				scope    : this

			},
			{
				id       : this.componentId('btn_cancel'),
				text     : this.getDialogLabel('buttons.cancel'),
				handler  : function()
				{
					this.hide();
					this.revertsettings();
				},
				scope    : this
			},
			{
				id       : this.componentId('btn_apply'),
				text     : this.getDialogLabel('buttons.apply'),
				handler  : function(btn)
				{
					this.saveSettings();
					this.disableOkApply();
					this.renameButtonAsClose();
				},
				scope: this,
				disabled : true
			}]
		}));

		this.itsTabPanel = Ext.getCmp(this.componentId('options-tab-container'));

		this.itsInitialized = true;
	},
	
	componentId: function(name)
	{
		if(this.itsId == '')
			return name;
		else
			return name + '_' + this.itsId;
	},

	enableOkApply : function()
	{
		if(!this.itsInitialized)
			return;

		Ext.getCmp(this.componentId('btn_ok')).enable();
		Ext.getCmp(this.componentId('btn_apply')).enable();
	},

	
	
	enableOkOnly : function()
	{
		if(!this.itsInitialized)
			return;

		Ext.getCmp(this.componentId('btn_ok')).enable();
		Ext.getCmp(this.componentId('btn_apply')).disable();
	},

	disableOkApply : function()
	{
		Ext.getCmp(this.componentId('btn_ok')).disable();
		Ext.getCmp(this.componentId('btn_apply')).disable();
	},

	renameButtonAsClose : function()
	{
		Ext.getCmp(this.componentId('btn_cancel')).setText(this.getDialogLabel('buttons.close'));
	},

	renameButtonAsCancel: function()
	{
		Ext.getCmp(this.componentId('btn_cancel')).setText(this.getDialogLabel('buttons.cancel'));
	},

	saveSettings : function()
	{
		var nbTabs = this.itsTabPanel.items.getCount();

		for(var i=0; i < nbTabs; i++)
		{
			var tab = this.itsTabPanel.items.get(i);
			tab.saveSettings();
		}
	},

	revertsettings : function()
	{
		var nbTabs = this.itsTabPanel.items.getCount();

		for(var i=0; i < nbTabs; i++)
		{
			var tab = this.itsTabPanel.items.get(i);
			tab.revertSettings();
		}
	},

	getDialogLabel: function(key)
	{
		return com.actional.serverui.technicalview.getMessage('overviewMap.optionsDialog.' + key);
	}
});

Ext.reg('com.actional.serverui.network.OptionsDialog', com.actional.serverui.network.OptionsDialog);

