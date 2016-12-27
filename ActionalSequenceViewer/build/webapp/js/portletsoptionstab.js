

















Ext.namespace('com.actional.serverui');

var PORTLETORDER_PREFIX	= "PortletOrder_";	// the prefix "UserSettings_" will also be inserted

/**
 *
 * @class com.actional.serverui.PortletsOptionsTab
 * @extends com.actional.serverui.OptionsTab
 *
 * @lastrev fix36758 - added itsElementType & itIsWatchListPage variables.
 */
com.actional.serverui.PortletsOptionsTab = Ext.extend(com.actional.serverui.OptionsTab,
{
	itsPortletPrefId : undefined,
	itsElementType : undefined,
	itIsWatchListPage : false,
	itsPortletStore : undefined,
	itsVisibilityCombo : undefined,
	itsCtrlPrefix: undefined,
	itsSnapshotStoreArray: undefined,

	/**
	 * @lastrev fix36714 - make the editor combo box non editable.
	 */
	constructor: function(config)
	{

		var visibilityMap = 	 [['VISIBLE','Show'],
					 ['HIDDEN','Hide']];

		this.itsPortletStore = new Ext.data.SimpleStore({
						fields: ['id', 'name', 'visibility', 'pos'],
						data : []
						});

		var cm = new Ext.grid.ColumnModel([{
			           header: "#",
			           dataIndex: 'pos',
			           width: 20,
			           fixed: true,
			           hideable: false
			        },{
			           id:'name',
			           header: "Portlet Name",
			           dataIndex: 'name',
			           width: 100,
			           fixed: true,
			           hideable: false
			        },{
			           header: "Visibility",
			           dataIndex: 'visibility',
			           width: 140,
			           fixed: true,
			           hideable: false,
			           renderer: function(val)
			           {
			           	if(!this.itsVisibilityCombo)
			           	{
			           		
						this.itsVisibilityCombo = new Array();
						for (var i=0; i < visibilityMap.length; i++)
							this.itsVisibilityCombo[visibilityMap[i][0]] = visibilityMap[i][1];
			           	}

					if (this.itsVisibilityCombo[val] != undefined)
						return this.itsVisibilityCombo[val];
					else
						return val;
			           },
			           editor: new Ext.form.ComboBox({
			               triggerAction: 'all',
			               lazyRender: false,
			               listClass: 'x-combo-list-small',
			               store: visibilityMap,
			               editable: false
			            })
			        }
		]);

		this.itsTabName = (config.tabName) ? config.tabName : 'Top 10s';
		this.itsCtrlPrefix = (config.ctrlPrefix) ? config.ctrlPrefix : '';
		this.itsPortletPrefId = config.prefId;
		this.itsElementType = config.elementType;
		this.itIsWatchListPage = config.isWatchListPage;
		this.loadPortletOrderSettings();

		com.actional.serverui.PortletsOptionsTab.superclass.constructor.call(this, Ext.applyIf(config,
		{
			title: this.itsTabName,
			layout: 'form',
			defaults: {width: 434},

			items:
			[{
				id: this.getPrefixedCtrlId('portletlist'),
				xtype: 'editorgrid',
				store: this.itsPortletStore,
				colModel: cm,
				autoHeight: false,
				height: 258,
				autoExpandColumn: 'name',
				title: 'Top 10 Portlets',
				clicksToEdit: 1,
				enableHdMenu: false,
				enableColumnMove: false,
				listeners:
				{
					'rowclick' : this.onSelectRow,
					'afteredit' : this.onAfterEdit,
					scope: this
				},
				selModel: new Ext.grid.RowSelectionModel({ singleSelect: true }),
			        tbar:
			        [
			            {xtype: 'tbfill'},
			            {
			            	text: 'Move Up',
			            	id: this.getPrefixedCtrlId('grid-move-up-btn'),
			            	iconCls: 'grid_move_up_btn',
			            	disabled: true,
			            	handler: function(){ this.moveSelectedRow(-1); },
			            	scope: this
			            },
			            {
			            	text: 'Move Down',
			            	id: this.getPrefixedCtrlId('grid-move-down-btn'),
			            	iconCls: 'grid_move_down_btn',
			            	disabled: true,
			            	handler: function(){ this.moveSelectedRow(1); },
			            	scope:this
			            }
			        ]
			}]

		}));

		
		OpenAjax.hub.subscribe( 'com.actional.serverui.portletsOptionsChanged',
					this.onPortletsOptionsChanged,
					this,
					{source : 'portletsoptionstab'});
	},

	/**
	 * @lastrev fix36758 - updated this method as the  json structure is updated. updated params to be sent to url.
	 */
	loadPortletOrderSettings : function()
	{
		
		var orderUrl = 'portal/portletusersettings.jsrv?getPortletOrder=' + this.itsPortletPrefId ;
		orderUrl += '&elementType=' + this.itsElementType;
		orderUrl += '&isWatchListPage=' + this.itIsWatchListPage;

		var servletUrl = contextUrl(orderUrl);

		XMLHttp_GetAsyncRequest(servletUrl, function(responseText, userData, status, statusText)
		{
			
			
			var portletSettingsArray = eval(responseText);

			OpenAjax.hub.publish('com.actional.serverui.portletsOptionsChanged',
			{
				source: 'portletsoptionstab',
				portlets: portletSettingsArray
			});
		}, null, null, "", false);
	},

	saveSettings : function()
	{
		if(!this.itsIsModified)
			return;

		
		UserSettings_Write(UserSettings_Scopes.USERPREFERENCES,
				   PORTLETORDER_PREFIX + this.itsPortletPrefId,
				   this.getEventDataString());

		
		setTimeout("window.location.reload(false)", 250);
	},

	revertSettings : function()
	{
		var grid = Ext.getCmp(this.getPrefixedCtrlId('portletlist'));
		if(!grid)
			return null;

		if(this.itsSnapshotStoreArray)
			grid.getStore().loadData(this.itsSnapshotStoreArray);
	},

	onPortletsOptionsChanged : function(event, publisherData, subscriberData)
	{
		this.updatePortletData(publisherData);
	},

	updatePortletData : function(publisherData)
	{
		var portlets = publisherData.portlets;

		if(portlets)
		{
			var storearray = [];

			for (i = 0; i < portlets.length; i++)
			{
				var toptenportlet = portlets[i];

				storearray[i] = [toptenportlet.id,
						 toptenportlet.name,
						 toptenportlet.visibility,
						 i+1];
			}

			
			this.itsSnapshotStoreArray = storearray;

			this.itsPortletStore.loadData(storearray);
		}
	},

	onSelectRow : function(grid, rowIndex, event)
	{
		Ext.getCmp(this.getPrefixedCtrlId('grid-move-up-btn')).enable();
		Ext.getCmp(this.getPrefixedCtrlId('grid-move-down-btn')).enable();
	},

	onAfterEdit : function(config)
	{
		this.itsIsModified = true;

		
		this.itsDialog.enableOkOnly();
	},

	moveSelectedRow : function(direction)
	{
		var grid = Ext.getCmp(this.getPrefixedCtrlId('portletlist'));
		if(!grid)
			return;

		var record = grid.getSelectionModel().getSelected();
		if (!record)
			return;

		var index = grid.getStore().indexOf(record);
		if (direction < 0)
		{
			index--;
			if (index < 0)
				return;
		}
		else
		{
			index++;
			if (index >= grid.getStore().getCount())
				return;
		}
		grid.getStore().remove(record);
		grid.getStore().insert(index, record);
		grid.getSelectionModel().selectRow(index, true);

		this.itsIsModified = true;

		
		this.itsDialog.enableOkOnly();
	},

	/**
	 * @lastrev fix36758 - no need to save the displayText in the settings.
	 */
	getEventDataString : function()
	{
		var grid = Ext.getCmp(this.getPrefixedCtrlId('portletlist'));
		if(!grid)
			return null;

		var store = grid.getStore();
		var nbPortlets = store.getCount();

		var settingString = "";

		for(var i=0; i < nbPortlets; i++)
		{
			var portletRecord = store.getAt(i);

			var tmp = "";
			tmp = tmp.concat(portletRecord.get('id'),
					 ",",
					 portletRecord.get('visibility'),
					 "::");

			settingString = settingString.concat(tmp);
		}

		return settingString;
	},

	getPrefixedCtrlId : function(baseid)
	{
		if(this.itsCtrlPrefix == '')
			return baseid;
		else
			return this.itsCtrlPrefix + '_' + baseid;
	}
});

Ext.reg('com.actional.serverui.PortletsOptionsTab', com.actional.serverui.PortletsOptionsTab);
