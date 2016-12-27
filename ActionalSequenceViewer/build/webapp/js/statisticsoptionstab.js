

















Ext.namespace('com.actional.serverui');










/**
 *
 * @class com.actional.serverui.StatisticsOptionsTab
 * @extends com.actional.serverui.OptionsTab
 *
 * @lastrev fix38284 - updated the method which retrieves the localized string.
 */
com.actional.serverui.StatisticsOptionsTab = Ext.extend(com.actional.serverui.OptionsTab,
{
    /**
     * @cfg {String} itsStatSetId
     *
     * the itsStatSetId used to control which statistic is displayed
     */
	itsStatSetId : undefined,
	itsOrderedStats : undefined,
	itsStatSectionsStore : undefined,
	itsModeComboArray : undefined,
	itsSubstatArray : undefined,
	itsCustomOptionsEventId: undefined,
	itsCtrlPrefix: undefined,
	itsSnapshotStoreArray: undefined,







	/**
	 * @lastrev fix36714 - make the editor combo boxes of columns "Focus On" & "Show" non editable.
	 */
	constructor: function(config)
	{
		this.itsEventSourceName = 'statisticsoptionstab';




















		var displayModeMap = 	 [['FULL','All Values'],
					 ['NORMAL','Focused Value Only'],
					 ['COMPACT','Focused Value (no graph)'],
					 ['HIDDEN','Hide section']];

		var substatMap =  	 [['AVERAGE','Average'],
					 ['MAXIMUM','Maximum'],
					 ['MINIMUM','Minimum'],
					 ['DEVIATION','Std Dev (95%)']];

		this.itsStatSectionsStore = new Ext.data.SimpleStore({
						fields: ['id', 'name', 'displaymode', 'substat', 'pos'],
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
			           header: this.getLabel('gridHeader.statisticName'),
			           dataIndex: 'name',
			           width: 120,
			           fixed: true,
			           hideable: false
			        },{
			           header: this.getLabel('gridHeader.focusOn'),
			           dataIndex: 'substat',
			           width: 110,
			           fixed: true,
			           hideable: false,
			           renderer: function(val)
			           {
			           	if(!this.itsSubstatArray)
			           	{
			           		
						this.itsSubstatArray = new Array();
						for (var i=0; i < substatMap.length; i++)
							this.itsSubstatArray[substatMap[i][0]] = substatMap[i][1];
			           	}

					if (this.itsSubstatArray[val] != undefined)
						return this.itsSubstatArray[val];
					else
						return val;
			           },
			           editor: new Ext.form.ComboBox({
			               triggerAction: 'all',
			               lazyRender:true,
			               listClass: 'x-combo-list-small',
			               store: substatMap,
			               editable: false
			            })
			        },{
			           id:'displaymode',
			           header: this.getLabel('gridHeader.show'),
			           dataIndex: 'displaymode',
			           width: 140,
			           fixed: true,
			           hideable: false,
			           renderer: function(val)
			           {
			           	if(!this.itsModeComboArray)
			           	{
			           		
						this.itsModeComboArray = new Array();
						for (var i=0; i < displayModeMap.length; i++)
							this.itsModeComboArray[displayModeMap[i][0]] = displayModeMap[i][1];
			           	}

					if (this.itsModeComboArray[val] != undefined)
						return this.itsModeComboArray[val];
					else
						return val;
			           },

			           editor: new Ext.form.ComboBox({
			               triggerAction: 'all',
			               lazyRender:false,
			               listClass: 'x-combo-list-small',
			               store: displayModeMap,
			               editable: false
			            })
			        }
		]);

		this.itsTabName = (config.tabName) ? config.tabName : this.getLabel('title');
		this.itsCtrlPrefix = (config.ctrlPrefix) ? config.ctrlPrefix : '';

		com.actional.serverui.StatisticsOptionsTab.superclass.constructor.call(this, Ext.applyIf(config,
		{
			title: this.itsTabName,
			layout:'form',

			items:
			[{
				id: this.getPrefixedCtrlId('statlist'),
				xtype: 'editorgrid',
				store: this.itsStatSectionsStore,
				colModel: cm,
				autoHeight: false,
				height: 279,
				width: 434,
				autoExpandColumn: 'displaymode',
				title: this.getLabel('gridTitle'),
				clicksToEdit: 1,
				enableHdMenu: false,
				enableColumnMove: false,
				listeners:
				{
					'rowclick' : this.onSelectRow,
					'beforeedit' : this.onBeforeEdit,
					'afteredit' : this.onAfterEdit,
					scope: this
				},
				selModel: new Ext.grid.RowSelectionModel({
				    				singleSelect: true
								}),

			        tbar:
			        [
			            {xtype: 'tbfill'},
			            {
			            	text: this.getLabel('gridToolbar.label.moveup'),
			            	id: this.getPrefixedCtrlId('grid-move-up-btn'),
			            	iconCls: 'grid_move_up_btn',
			            	disabled: true,
			            	handler: function(){ this.moveSelectedRow(-1); },
			            	scope: this
			            },
			            {
			            	text: this.getLabel('gridToolbar.label.movedown'),
			            	id: this.getPrefixedCtrlId('grid-move-down-btn'),
			            	iconCls: 'grid_move_down_btn',
			            	disabled: true,
			            	handler: function(){ this.moveSelectedRow(1); },
			            	scope:this
			            }
			        ]
			}
/*
			{
				xtype: 'checkboxgroup',
				hideLabel: true,
				columns: 1,
				ctCls: 'top_padding_10px',

		            	items:
		            	[
				    {boxLabel: 'Auto-hide Statistic Sections when empty', name: 'autoHideStatsections', checked: true},
				    {boxLabel: 'Always display both In & Out columns', name: 'forceDualColumnsstatPane', checked: false}
		                ]
			}*/]
		}));



		
		OpenAjax.hub.subscribe( this.itsCustomOptionsEventId,
					this.onStatsDisplayOptionsChanged,
					this,
					{source : 'statisticsoptionstab'});

		
		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: 'statisticsoptionstab',
			events	: [this.itsCustomOptionsEventId]
		});

		
		com.actional.DataStore.statList.onDataSetChanged(function()
		{
			var statList = com.actional.DataStore.statList;
			var data = statList.getStatSet(this.itsStatSetId);
			var storearray = [];

			if(data.length == this.itsStatSectionsStore.getCount())
				
				
				
				return;

			for(var i=0;i<data.length; i++)
			{
				var id = data[i];
				var statMetadata = statList.getStatMetadata(id);

				storearray[i] = [id,
						 statMetadata.name,
						 (statMetadata.substattype == 'total') ? 'Focused Value Only' : 'All Values',
						 (statMetadata.substattype == 'total') ? '<font color=#666666>Total</font>' : 'Average',
						 i+1];
			}

			this.itsStatSectionsStore.loadData(storearray);
		}, this);

	},

	saveSettings : function()
	{
		if(!this.itsIsModified)
			return;

		OpenAjax.hub.publish(this.itsCustomOptionsEventId,
		{
			source: 'statisticsoptionstab',
			stats: this.getEventData()
		});
	},

	revertSettings : function()
	{
		var grid = Ext.getCmp(this.getPrefixedCtrlId('statlist'));
		if(!grid)
			return null;

		if(this.itsSnapshotStoreArray)
			grid.getStore().loadData(this.itsSnapshotStoreArray);
	},

	onStatsDisplayOptionsChanged : function(event, publisherData, subscriberData)
	{
		
		

		this.updateStatData(publisherData);
	},

	updateStatData : function(publisherData)
	{
		
		
		

		var stats = publisherData.stats;

		if(stats)
		{
			var storearray = [];

			for (i = 0; i < stats.length; i++)
			{
				var stat = stats[i];

				storearray[i] = [stat.statid,
						 stat.displayname,
						 stat.mode,
						 (stat.subStatId == 'TOTAL') ? '<font color=#666666>Total</font>' : stat.subStatId,
						 i+1];
			}

			
			this.itsSnapshotStoreArray = storearray;

			this.itsStatSectionsStore.loadData(storearray);
		}
	},

	onSelectRow : function(grid, rowIndex, event)
	{
		Ext.getCmp(this.getPrefixedCtrlId('grid-move-up-btn')).enable();
		Ext.getCmp(this.getPrefixedCtrlId('grid-move-down-btn')).enable();
	},

	onBeforeEdit : function(config)
	{
		if(config.value.indexOf('Total') >= 0)
			return false;
/*
		if(config.field == 'displaymode')
		{


			var substatValue = config.record.data.substat;

			if(substatValue.indexOf('Total') < 0)
			{
				

				this.itsDisplayModeCombo.bindStore(null);
				this.itsDisplayModeCombo.bindStore(this.itsDisplayModeStore, true);
			}
			else
			{
				

				this.itsDisplayModeCombo.bindStore(null);
				this.itsDisplayModeCombo.bindStore(this.itsReducedModeStore, true);
			}
		}
*/
	},

	onAfterEdit : function(config)
	{
		this.itsIsModified = true;
		this.itsDialog.enableOkApply();
	},

	moveSelectedRow : function(direction)
	{
		var grid = Ext.getCmp(this.getPrefixedCtrlId('statlist'));
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

		this.itsDialog.enableOkApply();
	},

	getEventData : function()
	{
		var grid = Ext.getCmp(this.getPrefixedCtrlId('statlist'));
		if(!grid)
			return null;

		var store = grid.getStore();
		var nbStats = store.getCount();

		var stats = new Array();

		for(var i=0; i < nbStats; i++)
		{
			var stat = new Object();
			var statRecord = store.getAt(i);

			stat.statid = statRecord.get('id');
			stat.displayname = statRecord.get('name');
			stat.mode = statRecord.get('displaymode');

			
			var substat = statRecord.get('substat');
			stat.subStatId = (substat.indexOf('Total') >= 0) ? 'TOTAL' : substat;

			stats.push(stat);
		}

		return stats;
	},

	getPrefixedCtrlId : function(baseid)
	{
		if(this.itsCtrlPrefix == '')
			return baseid;
		else
			return this.itsCtrlPrefix + '_' + baseid;
	},

	getLabel: function(key)
	{
		return com.actional.serverui.technicalview.getMessage('overviewMap.optionsDialog.statisticDetailsTab.' + key);
	}
});

Ext.reg('com.actional.serverui.StatisticsOptionsTab', com.actional.serverui.StatisticsOptionsTab);
