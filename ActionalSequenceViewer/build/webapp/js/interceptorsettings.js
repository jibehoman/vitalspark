

















Ext.namespace('com.actional.serverui.interceptorsettings');


/**
 * Compound class. use the appropriate concrete class:  
 * 
 * com.actional.serverui.interceptorsettings.InterceptorSettingsDetails
 * com.actional.serverui.interceptorsettings.InterceptorSettingsEdit
 *
 * @class com.actional.serverui.interceptorsettings.InterceptorSettings
 * @extends Ext.grid.GridPanel 
 * @extends Ext.grid.GridPanelEditor
 *
 * @lastrev fix38877 - new class
 */
com.actional.serverui.interceptorsettings.InterceptorSettingsBaseConfig = 		
{
	itsDataStore: null,
	itsData : null,

	validate: function()
	{
		var dataTransferObj = {};

		for(var i = 0; i < this.itsDataStore.getCount(); i++)
		{
			var record = this.itsDataStore.getAt(i);

			var name = trim(record.data.name);
			var val = trim(record.data.value);
			var agentid = trim(record.data.agentid);
			var override = trim(record.data.override);

			if(name.length == 0 && val.length == 0)
				continue;

			if(name.length == 0)
			{
				
				alert("Missing name for '" + val + "'");
				return false;
			}

			if(val.length == 0)
			{
				
				alert("Missing value for '" + name + "'");

				return false;
			}

			var id = name + "_" + agentid;
			
			if (dataTransferObj[id])
			{
				
				alert("Duplicate criteria for '" + name + "'");

				return false;
			}

			dataTransferObj[id] = val;
		}

		return true;
	},

	onAfterGridEdit: function()
	{
		var addEmptyLine = false;

		if(this.itsDataStore.getCount() == 0)
		{
			addEmptyLine = true;
		}
		else
		{
			var lastRecord = this.itsDataStore.getAt(this.itsDataStore.getCount()-1);

			if(!isEmptyString(lastRecord.data.name) || !isEmptyString(lastRecord.data.value) || 
					!isEmptyString(lastRecord.data.agentid))
				addEmptyLine = true;
		}

		if(addEmptyLine)
		{
			var record = new Ext.data.Record();
			record.data = {name:'', value:'', agentid:'', override:'true'};
			this.itsDataStore.insert(this.itsDataStore.getCount(), record);
		}

		
		this.updateDataTransferString();
	},

	updateDataTransferString: function()
	{
		var dataTransferObj;

		var dataTransferStr = "";

		dataTransferObj = {};

		for(var i = 0; i<this.itsDataStore.getCount(); i++)
		{
			var record = this.itsDataStore.getAt(i);

			var name = trim(record.data.name);
			var value = trim(record.data.value);
			var agentid = trim(record.data.agentid);
			var override = trim(record.data.override);
			
			if(name.length == 0 && value.length == 0 && agentid.length == 0)
			{
				
				continue;
			}
			
			if(name.length == 0)
			{
				
			}

			var id = name + "_" + agentid;
			
			if(dataTransferObj[id])
			{
				
			}
			else
				dataTransferObj[id] = true;

			if(dataTransferStr.length > 0)
				dataTransferStr += '&';

			dataTransferStr += escape(name);
			dataTransferStr += ':';
			dataTransferStr += escape(agentid);
			dataTransferStr += '=';
			dataTransferStr += (override == 'false')?'0':'1';
			dataTransferStr += ':';
			dataTransferStr += escape(value);
		}

		
		if(this.updateHiddenField)
		{
			this.updateHiddenField(dataTransferStr);
		}	
	},

	parseDataTransferString: function(str)
	{
		var regex = /^(.*):(.*)=(.*):(.*)$/;
		
		var rows = [];

		if(str.length == 0)
			return rows;
		
		var settings = str.split('&');

		for(var i=0; i<settings.length; i++)
		{
			var settingStr = settings[i];

			var match = regex.exec(settingStr);

			var name = unescape(match[1]);
			var agentid = unescape(match[2]);
			var override = (match[3] == '1')?'true':'false';
			var value = unescape(match[4]);
			
			var setting = 
			{ 	
				name: name, 
				agentid: agentid, 
				override:override, 
				value: value 
			};
			
			rows.push(setting);
		}

		return rows;
	},

	loadGridData: function(dataTransferString)
	{
		var gridData = this.parseDataTransferString(dataTransferString);

		if(this.editmode)
		{
			
			gridData.push({name:'', agentid:'', value:'', override:'true'});
		}
		
		this.itsDataStore.loadData({rows:gridData, total:gridData.length});
	},

	onGroupingClick: function(button, pressed)
	{
		if(this.groupByNameButton.pressed === true)
		{
			this.itsDataStore.groupBy("name");
		}
		else if(this.groupByApplyToButton.pressed === true)
		{
			this.itsDataStore.groupBy("agentid");
		}
		else if(this.noGroupingButton.pressed === true)
		{
			this.itsDataStore.clearGrouping();
		}
	},
	
	commonConstructor: function(config)
	{
		var cc = {};
		
		
		this.itsDataStore = new Ext.data.GroupingStore(
		{
			reader: new Ext.data.JsonReader(
			{
				root: 'rows',
				fields :
				[{
					name : 'name'
				},
				{
					name : 'agentid'
				},
				{
					name : 'value'
				},
				{
					name : 'override'
				}]				
			})
		});

		cc.gridColumns = 
		[{
			id : 'name',
			dataIndex : 'name',
			header : 'Setting',
			width : 200,
			sortable : true,
			menuDisabled: true,
			editor : new Ext.form.TextField(),
			renderer : function(val, metaData, record, rowIndex, colIndex, store)
			{
				var name = record.data.name;

				if(isEmptyString(name))
				{
					return "<i>&lt;click to add&gt;</i>";
				}

				return Ext.grid.ColumnModel.defaultRenderer(val, metaData, 
							record, rowIndex, colIndex, store);
			}
		},
		{
			id : 'value',
			dataIndex : 'value',
			header : 'Value',
			width : 200,
			sortable : true,
			menuDisabled: true,
			editor : new Ext.form.TextField()
		},
		{
			id : 'applyTo',
			dataIndex : 'agentid',
			header : 'Target Host',
			width : 200,
			sortable : true,
			menuDisabled: true,
			editor: new com.actional.serverui.AgentPickerList(),
			renderer: function(val, metaData, record, rowIndex, colIndex, store)
			{
				var name = record.data.name;

				if(isEmptyString(name))
					return "";
				
				if(!val)
					val = '*';

				var agent = com.actional.serverui.AgentPickerList.getAgent(val);

				if(!agent)
					return "<i>unknown agent id="+val+"</i>";

				return "<div class='act-icon-combo-item "+agent.iconstyle+"'>"+agent.name+"</div>";
			}
		},
		{
			id : 'override',
			dataIndex : 'override',
			header : 'Override Behavior',
			width : 180,
			sortable : true,
			menuDisabled: true,
			renderer : function(val, metaData, record, rowIndex, colIndex, store)
			{
				var name = record.data.name;

				if(isEmptyString(name))
				{
					return "";
				}

				if(val == "true")
					return "Overrides Local Setting";
				else
					return "Can be Overridden Locally";
			},
			editor: new Ext.form.ComboBox(
			{
				store: new Ext.data.JsonStore(
				{
					idProperty: 'id',
					root: 'rows',
					fields :
					[{
						name : 'id'
					},
					{
						name : 'name'
					}],
					data :
					{
						rows:[ {name:'Overrides Local Setting', id:'true'},
					               {name:'Can be Overridden Locally', id:'false'}],
						total:2
					}
				}),
				displayField: 'name',
				valueField: 'id',
				mode: 'local',
				triggerAction: 'all',
				editable: false,
				forceSelection: true
			})
		}];
		
		
		config = Ext.applyIf(config,
		{
			autoHeight: true,
			scrollOffset: 1,
			autoExpandColumn: 'value',
			store : this.itsDataStore,
			view: new Ext.grid.GroupingView(
			{
				markDirty: false,
				showGroupName: false
			}),
			tbar: ['->',
			{
				ref: '../groupByNameButton',
				text: 'Group by Name',
				enableToggle: true,
				allowDepress: false,
				toggleGroup: 'groupby',
				toggleHandler: this.onGroupingClick,
				pressed: false,
				scope: this
			},'-',
			{
				ref: '../groupByApplyToButton',
				text: 'Group by Target',
				enableToggle: true,
				allowDepress: false,
				toggleGroup: 'groupby',
				toggleHandler: this.onGroupingClick,
				pressed: false,
				scope: this
			},'-',
			{
				ref: '../noGroupingButton',
				text: 'No Grouping',
				enableToggle: true,
				allowDepress: false,
				toggleGroup: 'groupby',
				toggleHandler: this.onGroupingClick,
				pressed: true,
				scope: this
			}]
		});
		
		return cc;
	}
};

com.actional.serverui.interceptorsettings.InterceptorSettingsDetails = Ext.extend(Ext.grid.GridPanel,
	Ext.applyIf(
{
	constructor: function(config)
	{
		
		var mainComponent = this;

		var cc = com.actional.serverui.interceptorsettings.InterceptorSettingsBaseConfig
								.commonConstructor.call(this, config);

		com.actional.serverui.interceptorsettings.InterceptorSettingsDetails.superclass
					.constructor.call(this, Ext.applyIf(config,
		{
			cls: 'act-grid-readonly',
			disableSelection: true,
			trackMouseOver: false,
			editmode: false,
			listeners:
			{
				scope: mainComponent
			},
			colModel : new Ext.grid.ColumnModel(
			{
				columns: cc.gridColumns
			})
		}));
	}
}, com.actional.serverui.interceptorsettings.InterceptorSettingsBaseConfig));
		
com.actional.serverui.interceptorsettings.InterceptorSettingsEdit = Ext.extend(Ext.grid.EditorGridPanel,
	Ext.applyIf(
{
	constructor: function(config)
	{
		
		var mainComponent = this;

		var cc = com.actional.serverui.interceptorsettings.InterceptorSettingsBaseConfig
								.commonConstructor.call(this, config);

		
		this.itsDataStore.loadData({rows:[ {name:'', value:'', agentid:'', override:'true'}], total:1});
		
		cc.gridColumns.push(
		{
			id: 'deleter',
			header : '',
			width: 64,
			fixed: true,
			dataIndex: 'name',
			editable: false,
			sortable: false,
			menuDisabled: true,

			renderer: function(val, p, record, rowIndex)
			{
				if(isEmptyString(val))
					return "";
				
				return '<div class="x-tool x-tool-close" style="float:none"></div>';
			}
		});
		
		com.actional.serverui.interceptorsettings.InterceptorSettingsEdit.superclass.constructor.call(this, 
				Ext.applyIf(config,
		{
			editmode: true,
			clicksToEdit: 1,
			selModel: new Ext.grid.RowSelectionModel(),
			listeners:
			{
				afteredit: this.onAfterGridEdit,
				cellclick: function(grid, rowIndex, columnIndex, e)
				{
					if(columnIndex == grid.getColumnModel().getIndexById('deleter'))
					{
						if(Ext.fly(e.getTarget()).hasClass('x-tool-close'))
						{
							var record = grid.getStore().getAt(rowIndex);
							grid.getStore().remove(record);
							mainComponent.onAfterGridEdit();
							grid.getView().refresh();
						}
					}
				},
				afterrender: function(grid)
				{
					
					grid.el.on('mouseover', function(evt, el, obj)
					{
						Ext.fly(el).addClass('x-tool-close-over');
					}, el, { delegate: '.x-tool-close' });
	
					grid.el.on('mouseout', function(evt, el, obj)
					{
						Ext.fly(el).removeClass('x-tool-close-over');
					}, el, { delegate: '.x-tool-close' });
				},
	
				scope: mainComponent
			},
			colModel : new Ext.grid.ColumnModel(
			{
				isCellEditable: function(colIndex, rowIndex)
				{
					var field = this.getDataIndex(colIndex);
					if (field == 'value' || field == 'agentid' || field == 'override')
					{
						var record = mainComponent.itsDataStore.getAt(rowIndex);
	
						var name = record.data.name;
	
						return !isEmptyString(name);
					}
	
					return true;
				},
				columns: cc.gridColumns
			})
		}));
	}
}, com.actional.serverui.interceptorsettings.InterceptorSettingsBaseConfig));

Ext.reg('com.actional.serverui.interceptorsettings.InterceptorSettingsDetails', com.actional.serverui.interceptorsettings.InterceptorSettingsDetails);
Ext.reg('com.actional.serverui.interceptorsettings.InterceptorSettingsEdit', com.actional.serverui.interceptorsettings.InterceptorSettingsEdit);
