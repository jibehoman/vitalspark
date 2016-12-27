

















Ext.ns('com.actional.serverui');

/**
 * @class com.actional.serverui.AlternateDbServerEditorList
 * @extends Ext.grid.EditorGridPanel
 * Ext-based component to edit/display alternate server list for database Failover and Load-balancing
 *
 * @lastrev fix38877 - make grid look "readonly"
 */

com.actional.serverui.AlternateDbServerEditorList = Ext.extend(Ext.grid.EditorGridPanel,
{
    /**
     * @cfg {Boolean} failOver
     * Database Failover is enabled
     */
    /**
     * @cfg {Boolean} loadBalancing
     * Database Load-balancing is enabled
     */
	/**
     * @cfg {Array} alternateServerList
     * Alternate server list
     */
	/**
     * @cfg {String} primaryPortNumber
     * primary port number
     */
	/**
     * @cfg {String} primaryDatabaseName
     * Primary database name
     */

	constructor: function(config)
	{
		config = config || {};

		com.actional.serverui.AlternateDbServerEditorList.superclass.constructor.call(this, Ext.applyIf(config,
		{
			id: 'AlternateServerListGridPanel',
			disabled: !(config.failOver || config.loadBalancing),
			store: new Ext.data.JsonStore(
			{
				fields:
				[
					{
						name: 'host'
					},
					{
						name: 'port'
					},
					{
						name: 'databaseName'
					}
				]
			}),
			columns:
			[
				new Ext.grid.RowNumberer(
						{
							header: '#',
							width: 25
						}),
				{
					id: 'host',
					header: 'Host(required)',
					width: 40,
					dataIndex: 'host',
					editor : new Ext.form.TextField({allowBlank: false})
				},
	          	{
					header: 'Port',
					width: 15,
					dataIndex: 'port',
					editor : new Ext.form.NumberField({allowBlank: false}),
					renderer : this.portRenderer.createDelegate(this)
	          	},
	          	{
	          		header: 'Database Name',
	          		width: 20,
	          		dataIndex: 'databaseName',
	          		editor : new Ext.form.TextField(),
	          		renderer : this.dbNameRenderer.createDelegate(this)
	          	}
			],
			viewConfig:
			{
				forceFit: true,
				scrollOffset: 0
			},
			listeners:
			{
				rowclick: this.onRowClick,
				afteredit: this.onAfterEdit,
				scope: this
			},
			sm: new Ext.grid.RowSelectionModel(
			{
				singleSelect:true
			}),
			height: 250,
			iconCls: 'icon-grid',
			tbar:
			[
				{
					text: 'Add Server',
					handler: this.onAddServer,
					scope: this
				},
				{
					text: 'Remove Server',
					handler: this.onRemoveServer,
					ref: '../removeServerButton',
					disabled: true,
					scope: this
				},
				{
					xtype: 'tbseparator'
				},
				{
					text: 'Move Up',
					ref: '../moveRowUpButton',
					icon: contextUrl('images/grid_arrow_up.gif'),
					disabled: true,
					handler: this.moveSelectedRow.createDelegate(this, [-1])
				},
				{
					text: 'Move Down',
					ref: '../moveRowDownButton',
					icon: contextUrl('images/grid_arrow_down.gif'),
					disabled: true,
					handler: this.moveSelectedRow.createDelegate(this, [1])
				}
			],
			renderTo: 'failoverLoadBalancingOptionsTable',
			enableHdMenu: false,
			enableColumnMove: false,
			autoExpandColumn: 'displaymode'
		}));

		var serverList = config.alternateServerList;
		if(serverList)
		{
			this.getStore().loadData(serverList);
			this.updateGridParam();
		}
	},

	updatePrimaryDatabaseValues: function(portNumber, dbName)
	{
		this.primaryPortNumber = portNumber;
		this.primaryDatabaseName = dbName;
		this.getView().refresh(false);
	},

	portRenderer: function(value, metaData, record, rowIndex, colIndex, store)
	{
		if (value == this.primaryPortNumber)
		{
			return "<span style='font-style:italic;color:#65656d;'>primary(" + value + ")</span>";
		}
		else
		{
			return value;
		}
	},

	dbNameRenderer: function(value, metaData, record, rowIndex, colIndex, store)
	{
		if (value == this.primaryDatabaseName)
		{
			return "<span style='font-style:italic;color:#65656d;'>primary(" + value + ")</span>";
		}
		else
		{
			return value;
		}
	},

	onRowClick: function(grid, rowIndex, e)
	{
		this.removeServerButton.enable();
		this.moveRowUpButton.enable();
		this.moveRowDownButton.enable();
	},

	onAddServer: function()
	{
		var ServerEntry = this.getStore().recordType;
		var se = new ServerEntry(
		{
			host : '',
			port : this.primaryPortNumber,
			databaseName : this.primaryDatabaseName
		});
		this.stopEditing();
		this.getStore().insert(this.getStore().getCount(), se);
		this.startEditing(this.getStore().getCount() - 1, 1);
		this.updateGridParam();
	},

	onRemoveServer: function(button, event)
	{
		var sm = this.getSelectionModel();
		var sel = sm.getSelections();
		this.getStore().remove(sel[0]);
		button.setDisabled(true);
		this.moveRowUpButton.setDisabled(true);
		this.moveRowDownButton.setDisabled(true);
		this.getView().refresh(false);
		this.updateGridParam();
	},

	onAfterEdit: function()
	{
		this.updateGridParam();
	},

	moveSelectedRow: function(direction)
	{
		var record = this.getSelectionModel().getSelected();
		if (!record)
		{
			return;
		}
		var index = this.getStore().indexOf(record);
		if (direction < 0)
		{
			index--;
			if (index < 0)
			{
				return;
			}
		}
		else
		{
			index++;
			if (index >= this.getStore().getCount())
			{
				return;
			}
		}
		this.getStore().remove(record);
		this.getStore().insert(index, record);
		this.getView().refresh(false);
		this.updateGridParam();

		this.getSelectionModel().selectRow(index, true);
	},

	updateGridParam: function()
	{
		var store = this.getStore();
		var str = '';
		for(var i = 0; i < store.getCount(); ++i)
		{
			var record = store.getAt(i);
			var obj = {};
			obj['host' + i] = record.get('host');
			obj['port' + i] = record.get('port');
			obj['databaseName' + i] = record.get('databaseName');
			str += Ext.urlEncode(obj) + '&';
		}
		document.getElementById('alternateServersListString').value = str;
	}
});

/**
 * @class com.actional.serverui.AlternateDbServerList
 * @extends Ext.grid.EditorGridPanel
 * Ext-based component to display alternate server list for database Failover and Load-balancing
 *
 */

com.actional.serverui.AlternateDbServerList = Ext.extend(Ext.grid.GridPanel,
{
    /**
     * @cfg {Array} alternateServerList
     * Alternate server list
     */
	/**
     * @cfg {String} primaryPortNumber
     * Primary port number
     */
	/**
     * @cfg {String} primaryDatabaseName
     * Primary database name
     */
	constructor: function(config)
	{
		config = config || {};

		com.actional.serverui.AlternateDbServerList.superclass.constructor.call(this, Ext.applyIf(config,
		{
			store: new Ext.data.JsonStore(
			{
				fields:
				[
					{
						name: 'host'
					},
					{
						name: 'port'
					},
					{
						name: 'databaseName'
					}
				],
				data: config.alternateServerList || []
			}),
			columns:
			[
				new Ext.grid.RowNumberer(
						{
							header: '#',
							width: 20
						}),
				{
					id: 'host',
					header: 'Host(required)',
					width: 40,
					dataIndex: 'host'
				},
	          	{
					header: 'Port',
					width: 20,
					dataIndex: 'port',
					renderer : this.portRenderer.createDelegate(this)
	          	},
	          	{
	          		header: 'Database Name',
	          		width: 20,
	          		dataIndex: 'databaseName',
	          		renderer : this.dbNameRenderer.createDelegate(this)
	          	}
			],
			viewConfig:
			{
				markDirty: false,
				forceFit: true,
				scrollOffset: 0
			},
			disableSelection: true,
			trackMouseOver: false,
			cls: 'act-grid-readonly',
			height: 200,
			renderTo: 'falioverLoadBalancingList',
			enableHdMenu: false,
			enableColumnMove: false,
			autoExpandColumn: 'displaymode'
		}));
	},

	portRenderer: function(value, metaData, record, rowIndex, colIndex, store)
	{
		if (value == this.primaryPortNumber)
		{
			return "<span style='font-style:italic;color:#65656d;'>primary(" + value + ")</span>";
		}
		else
		{
			return value;
		}
	},

	dbNameRenderer: function(value, metaData, record, rowIndex, colIndex, store)
	{
		if (value == this.primaryDatabaseName)
		{
			return "<span style='font-style:italic;color:#65656d;'>primary(" + value + ")</span>";
		}
		else
		{
			return value;
		}
	}
});

/**
 * Toggles enable/disable the grid panel on checking/unchecking the failover and load-balancing
 * check boxes
 * @param checkBoxObj
 */
function toggleAlternateServerListGridPanel(checkBoxObj)
{
	if(checkBoxObj.checked)
	{
		checkBoxObj.value='true';
	}
	else
	{
	  	checkBoxObj.value='false';
	}
	var grid = Ext.getCmp('AlternateServerListGridPanel');
	if(grid)
	{
		if(/*Ext.get('failoverCb')*/document.getElementById('failoverCb').checked ||
		   /*Ext.get('loadBalancingCb')*/document.getElementById('loadBalancingCb').checked)
		{
			grid.setDisabled(false);
		}
		else
		{
			grid.setDisabled(true);
		}
	}
}
