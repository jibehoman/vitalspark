

















Ext.namespace('com.actional.serverui');

/**
 *
 * @class com.actional.serverui.NetworkOptionsTab
 * @extends com.actional.serverui.OptionsTab
 *
 * @lastrev fix38284 - updated the method which retrieves the localized string.
 */
com.actional.serverui.NetworkOptionsTab = Ext.extend(com.actional.serverui.OptionsTab,
{
    /**
     * @cfg {String} statsetid
     *
     * the statsetid used to control which statistic is displayed
     */

    /**
     * @cfg {Boolean} disabledormantthreshold (Optional) defaults to false
     *
     * Set to true to disable the options related to the dormant threshold
     *
     */

	itsSettings:
	{
		isStatPaneExpanded: undefined,
		isBreakdownPaneExpanded: undefined,
		isBPStatPaneExpanded: undefined,
		isAlertPaneExpanded: undefined,
		useArrowWidth: undefined,
		arrowWidthStatId: undefined,
		showAllPathHints: undefined,
		dormantThreshold: undefined
	},

	itsControls:
	{
		itsShowStatPaneBox: undefined,
		itsShowBreakdownPaneBox: undefined,
		itsShowBPStatPaneBox: undefined,
		itsShowAlertPaneBox: undefined,
		itsShowAllPathHintsBox: undefined,
		itsArrowWidthStatCombo: undefined
	},

	constructor: function(config)
	{
		
		this.itsEventSourceName = 'networkoptionstab';
		this.itsTabName = (config.tabName) ? config.tabName : this.getFieldLabel('title');

		
		var stattypes_store = new Ext.data.SimpleStore({
						fields: ['id', 'name'],
						data : []
						});

		this.hookUpEvents();

		
		com.actional.serverui.NetworkOptionsTab.superclass.constructor.call(this, Ext.applyIf(config,
		{
			id: 'network-options-tab',
			title: this.itsTabName,
			layout: 'form',
			defaultType: 'checkbox',

			listeners:
			{
				'render': this.onCreation,
				scope: this
			},

			items: function()
			{
				var items =
				[{
					xtype: 'checkboxgroup',
					hideLabel: true,
					columns: 1,
					ctCls: 'bottom_padding_5px',
					defaults:
					{
						handler: function(btn)
						{
							this.onSettingModified();

							if(btn.id == 'useArrowWidth')
								this.enableDisableStatCombo(btn);
						},
						scope: this

					},

					items:
					[
						{
							boxLabel: this.getFieldLabel('fieldLabel.expandStatisticsPane'),
							id: 'showStatPane',
							checked: this.itsSettings.isStatPaneExpanded
						},
						{
							boxLabel: this.getFieldLabel('fieldLabel.expandItemBreakdownPane'),
							id: 'showItemBreakdownPane',
							checked: this.itsSettings.isBreakdownPaneExpanded
						},
						{
							boxLabel: 'Expand Process-wide statistics pane',
							id: 'showBPStatPane',
							hidden: (this.itsSettings.isBPStatPaneExpanded == undefined),
							checked: this.itsSettings.isBPStatPaneExpanded
						},
						{
							boxLabel: 'Expand Outstanding Alerts pane',
							id: 'showAlertPane',
							hidden: (this.itsSettings.isAlertPaneExpanded == undefined),
							checked: this.itsSettings.isAlertPaneExpanded
						},
						{
							boxLabel: this.getFieldLabel('fieldLabel.showAllPathExplorerHints'),
							id: 'showAllPathHints',
							checked: this.itsSettings.showAllPathHints
						},
						{
							boxLabel: this.getFieldLabel('fieldLabel.useArrowWidthToShowStatistic'),
							id: 'useArrowWidth',
							checked: this.itsSettings.useArrowWidth
						}
					]

				},
				{
					xtype: 'combo',
					id: 'arrowWidthstatId',
					store: stattypes_store,
					displayField: 'name',
					valueField: 'id',
					mode: 'local',
					triggerAction: 'all',
					width: 180,
					forceSelection: true,
					editable: false,
					value: (this.itsSettings.arrowWidthStatId != 'NONE') ? this.itsSettings.arrowWidthStatId : '',
					fieldLabel: this.getFieldLabel('fieldLabel.statisticMetric'),
					disabled: !this.itsSettings.useArrowWidth,
					labelStyle: 'padding-left: 20px',
					listeners:
					{
						'select' : this.onSettingModified,
						scope: this
					}
				},
				{ xtype: 'label', html: '<br><br>' },
				{
					xtype: 'checkbox',
					id: 'hideInactiveItemsId',
					hideLabel: true,
					boxLabel: 'Hide inactive items within time selection',
					disabled: config.disabledormantthreshold,
					hidden: config.disabledormantthreshold,
					handler: function(ctrl)
					{
						var enableDormantThresholdTimeCheckbox = Ext.getCmp('enableDormantThresholdTimeId');

						if(ctrl.getValue())
							enableDormantThresholdTimeCheckbox.enable();
						else
							enableDormantThresholdTimeCheckbox.disable();

						this.enableDisableDormantThresholdTimeCombo();

						this.onSettingModified();
					},
					scope: this
				},
				{
					xtype: 'container',
					autoEl: 'div',
					layout: 'column',
					hidden: config.disabledormantthreshold,
					defaults:
					{
						xtype: 'container',
						autoEl: 'div'
					},
					items:
					[{
						style: 'padding-left: 20px',
						items:
						{
							xtype: 'checkbox',
							id: 'enableDormantThresholdTimeId',
							hideLabel: true,
							boxLabel: 'Except for items that had some activity in the last:',
							disabled: true,
							checked: true,
							handler: function(ctrl)
							{
								this.enableDisableDormantThresholdTimeCombo();

								this.onSettingModified();
							},
							scope: this
						}
					},
					{
						style: 'padding-left: 10px',
						items:
						{
							xtype: 'combo',
							id: 'dormantThresholdTimeId',
							hideLabel: true,
							store: new Ext.data.SimpleStore({
							        id: 0,
							        fields: [
							            'time',
							            'displayText'
							        ],
							        data: [[      60*60*1000, 'hour'],
							               [   24*60*60*1000, 'day'],
							               [ 7*24*60*60*1000, 'week'],
							               [31*24*60*60*1000, 'month']]
							    }),
							valueField: 'time',
							displayField: 'displayText',
							mode: 'local',
							triggerAction: 'all',
							width: 100,
							forceSelection: true,
							editable: false,
							value: (24*60*60*1000),
							fieldLabel: '<remove label>',
							disabled: true,
							listeners:
							{
								'select' : this.onSettingModified,
								scope: this
							}
						}
					}]
				}];

				return items;
			}.call(this)
		}));

		com.actional.DataStore.statList.onDataSetChanged(function()
		{
			var data = com.actional.DataStore.statList.getSubStatList(this.statsetid);


			var storearray = [];

			for(var i=0; i < data.length; i++)
			{

				var item = data[i];
				storearray[i] = [item.id, item.name];
			}

			stattypes_store.loadData(storearray);
		}, this);
	},

	hookUpEvents : function()
	{
		OpenAjax.hub.subscribe('com.actional.serverui.PanesOptionsChanged',
					this.onPanesOptionsChanged,
					this,
					{source: 'networkoptionstab'});

		OpenAjax.hub.subscribe('com.actional.serverui.BPPanesOptionsChanged',
					this.onBPPanesOptionsChanged,
					this,
					{source: 'networkoptionstab'});

		
		OpenAjax.hub.subscribe('com.actional.serverui.statisticSelectionChanged',
					this.onStatisticSelectionChanged,
					this,
					{source : 'networkoptionstab'});

		
		OpenAjax.hub.subscribe('com.actional.serverui.MiscOptionsChanged',
					this.onMiscOptionsChanged,
					this,
					{source : 'networkoptionstab'});

		
		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: 'networkoptionstab',
			events	: ['com.actional.serverui.PanesOptionsChanged',
				   'com.actional.serverui.BPPanesOptionsChanged',
				   'com.actional.serverui.statisticSelectionChanged',
				   'com.actional.serverui.MiscOptionsChanged']
		});
	},

	onCreation: function()
	{
		if(!this.disabledormantthreshold)
		{
			
			UserSettings_ReadFromServer('USERPREFERENCES', ['DormantThreshold'], function(values)
			{
				
				this.itsSettings.dormantThreshold = parseInt(values['DormantThreshold']);
				this.initControlsFromDormantThresholdSettings();
			}, this);
		}
	},

	
	
	saveSettings : function()
	{
		if(!this.itsIsModified)
			return;

		var needExpandCollapseEvent = false;

		
		var val = this.safeGetCmpValue('showStatPane');
		if((val != null) && (val != this.itsSettings.isStatPaneExpanded))
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, prefixed('statisticsdisplay'), '' + val);
			this.itsSettings.isStatPaneExpanded = val;
			needExpandCollapseEvent = true;
		}

		
		val = this.safeGetCmpValue('showItemBreakdownPane');
		if((val != null) && (val != this.itsSettings.isBreakdownPaneExpanded))
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, prefixed('breakdowndisplay'), '' + val);
			this.itsSettings.isBreakdownPaneExpanded = val;
			needExpandCollapseEvent = true;
		}

		if(needExpandCollapseEvent)
			this.publishExpandCollapse();

		
		needExpandCollapseEvent = false;

		
		var val1 = this.safeGetCmpValue('showBPStatPane');
		if((val1 != null) && (!val1.hidden) && (val1 != this.itsSettings.isBPStatPaneExpanded))
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, 'bpstatdisplay', '' + val1);
			this.itsSettings.isBPStatPaneExpanded = val1;
			needExpandCollapseEvent = true;
		}

		
		var val2 = this.safeGetCmpValue('showAlertPane');
		if((val2 != null) && (!val2.hidden) && (val2 != this.itsSettings.isAlertPaneExpanded))
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, 'alertsdisplay', '' + val2);
			this.itsSettings.isAlertPaneExpanded = val2;
			needExpandCollapseEvent = true;
		}

		if(needExpandCollapseEvent)
			this.publishBPExpandCollapse();

		
		val = this.safeGetCmpValue('useArrowWidth');
		var statid = this.safeGetCmpValue('arrowWidthstatId');
		if((val != null) && (statid != null))
		{
			var newStat = val ? statid : 'NONE';
			var curStat = (this.itsSettings.useArrowWidth) ? this.itsSettings.arrowWidthStatId : 'NONE';

			if(newStat != curStat)
			{
				this.itsSettings.useArrowWidth = val;
				this.itsSettings.arrowWidthStatId = statid;
				this.publishArrowWidthStat();
			}
		}

		
		val = this.safeGetCmpValue('showAllPathHints');
		if((val != null) && (val != this.itsSettings.showAllPathHints))
		{
			this.itsSettings.showAllPathHints = val;
			this.publishMiscOptions();
		}

		
		var hideInactiveItemsCheckbox = Ext.getCmp('hideInactiveItemsId');
		var enableDormantThresholdTimeCheckbox = Ext.getCmp('enableDormantThresholdTimeId');

		if(!hideInactiveItemsCheckbox.disabled)
		{
			if(hideInactiveItemsCheckbox.getValue())
			{
				if(enableDormantThresholdTimeCheckbox.getValue())
					val = this.safeGetCmpValue('dormantThresholdTimeId');
				else
					val = 0;
			}
			else
			{
				val = -1;
			}

			if((val != null) && (val != this.itsSettings.dormantThreshold))
			{
				this.itsSettings.dormantThreshold = val;

				

				
				
				OpenAjax.hub.publish('com.actional.serverui.siteSelectionChanged',
						     {type:'nothing', source: 'networkoptionstab'});

				var dormantThresholdStr = ''+this.itsSettings.dormantThreshold;

				UserSettings_Write(UserSettings_Scopes.USERPREFERENCES,
					"DormantThreshold",  
					dormantThresholdStr, true, function()
					{
						
						
						OpenAjax.hub.publish('com.actional.serverui.networkLayoutOptionsChanged',
									{ source: 'networkoptionstab' });

						OpenAjax.hub.publish('com.actional.serverui.dormantThresold',
						{
							dormantThresold: dormantThresholdStr,
							source: 'networkoptionstab'
						});
					});
			}
		}
	},

	revertSettings : function()
	{
		
		this.setCmpValue('showStatPane', this.itsSettings.isStatPaneExpanded);

		
		this.setCmpValue('showItemBreakdownPane', this.itsSettings.isBreakdownPaneExpanded);

		
		this.setCmpValue('showBPStatPane', this.itsSettings.isBPStatPaneExpanded);

		
		this.setCmpValue('showAlertPane', this.itsSettings.isAlertPaneExpanded);

		
		this.setCmpValue('useArrowWidth', this.itsSettings.useArrowWidth);
		this.setCmpValue('arrowWidthstatId',this.itsSettings.arrowWidthStatId);

		
		this.setCmpValue('showAllPathHints', this.itsSettings.showAllPathHints);

		
		this.initControlsFromDormantThresholdSettings();
	},

	/** fix36160 - make sure checkbox is checked even if disabled */
	initControlsFromDormantThresholdSettings : function()
	{
		this.setCmpValue('hideInactiveItemsId', (this.itsSettings.dormantThreshold >= 0));

		var enableDormantThresholdTimeCheckbox = Ext.getCmp('enableDormantThresholdTimeId');

		if(this.itsSettings.dormantThreshold < 0)
			enableDormantThresholdTimeCheckbox.disable();
		else
			enableDormantThresholdTimeCheckbox.enable();

		
		
		this.setCmpValue('enableDormantThresholdTimeId', (this.itsSettings.dormantThreshold != 0));

		if(this.itsSettings.dormantThreshold > 0)
			this.setCmpValue('dormantThresholdTimeId', this.itsSettings.dormantThreshold);
		else
			this.setCmpValue('dormantThresholdTimeId', (24*60*60*1000));

		this.enableDisableDormantThresholdTimeCombo();
	},

	publishExpandCollapse : function()
	{
		OpenAjax.hub.publish('com.actional.serverui.PanesOptionsChanged',
		{
			source: 'networkoptionstab',
			showStatPane: this.itsSettings.isStatPaneExpanded,
			showBreakdownPane: this.itsSettings.isBreakdownPaneExpanded
		});
	},

	publishBPExpandCollapse : function()
	{
		OpenAjax.hub.publish('com.actional.serverui.BPPanesOptionsChanged',
		{
			source: 'networkoptionstab',
			showBPStatPane: this.itsSettings.isBPStatPaneExpanded,
			showAlertsPane: this.itsSettings.isAlertPaneExpanded
		});
	},

	publishArrowWidthStat : function()
	{
		var writeValue = (this.itsSettings.useArrowWidth) ? this.itsSettings.arrowWidthStatId : 'NONE';

		OpenAjax.hub.publish('com.actional.serverui.statisticSelectionChanged',
		{
			source: 'networkoptionstab',
			statistic_id: writeValue,
			"parts":
				[{
					label:"IN",
					row_id: writeValue,
					selected: true
				},
				{
					label:"OUT",
					row_id: writeValue,
					selected: true
				}]
		});
	},

	publishMiscOptions : function()
	{
		OpenAjax.hub.publish('com.actional.serverui.MiscOptionsChanged',
		{
			source: 'networkoptionstab',
			showAllPathHints: this.itsSettings.showAllPathHints
		});
	},

	onPanesOptionsChanged : function(event, publisherData, subscriberData)
	{
		
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			return;

		
		this.itsSettings.isStatPaneExpanded = publisherData.showStatPane;
		this.itsSettings.isBreakdownPaneExpanded = publisherData.showBreakdownPane;

		
		if(!this.rendered)
			return;

		if(!this.itsControls.itsShowStatPaneBox)
			this.itsControls.itsShowStatPaneBox = Ext.getCmp('showStatPane');
		if(!this.itsControls.itsShowBreakdownPaneBox)
			this.itsControls.itsShowBreakdownPaneBox = Ext.getCmp('showItemBreakdownPane');

		this.itsControls.itsShowStatPaneBox.setValue(this.itsSettings.isStatPaneExpanded);
		this.itsControls.itsShowBreakdownPaneBox.setValue(this.itsSettings.isBreakdownPaneExpanded);
	},

	onBPPanesOptionsChanged : function(event, publisherData, subscriberData)
	{
		
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			return;

		
		this.itsSettings.isBPStatPaneExpanded = publisherData.showBPStatPane;
		this.itsSettings.isAlertPaneExpanded = publisherData.showAlertsPane;

		
		if(!this.rendered)
			return;

		if(!this.itsControls.itsShowBPStatPaneBox)
			this.itsControls.itsShowBPStatPaneBox = Ext.getCmp('showBPStatPane');
		if(!this.itsControls.itsShowAlertPaneBox)
			this.itsControls.itsShowAlertPaneBox = Ext.getCmp('showAlertPane');

		this.itsControls.itsShowBPStatPaneBox.setValue(this.itsSettings.isBPStatPaneExpanded);
		this.itsControls.itsShowAlertPaneBox.setValue(this.itsSettings.isAlertPaneExpanded);
	},

	onStatisticSelectionChanged : function(event, publisherData, subscriberData)
	{
		
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			return;

		
		this.itsSettings.useArrowWidth = (publisherData.statistic_id == 'NONE') ? false : true;
		this.itsSettings.arrowWidthStatId = publisherData.statistic_id;

		
		if(!this.rendered)
			return;

		
		if(!this.itsUseArrowWidthBox)
			this.itsUseArrowWidthBox = Ext.getCmp('useArrowWidth');
		this.itsUseArrowWidthBox.setValue(this.itsSettings.useArrowWidth);

		
		if(!this.itsControls.itsArrowWidthStatCombo)
			this.itsControls.itsArrowWidthStatCombo = Ext.getCmp('arrowWidthstatId');

		var comboValue = (this.itsSettings.arrowWidthStatId != 'NONE') ? this.itsSettings.arrowWidthStatId : '';
		this.itsControls.itsArrowWidthStatCombo.setValue(comboValue);
	},

	onMiscOptionsChanged : function(event, publisherData, subscriberData)
	{
		
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			return;

		
		this.itsSettings.showAllPathHints = publisherData.showAllPathHints;

		
		if(!this.rendered)
			return;

		if(!this.itsControls.itsShowAllPathHintsBox)
			this.itsControls.itsShowAllPathHintsBox = Ext.getCmp('showStatPane');

		this.itsControls.itsShowAllPathHintsBox.setValue(this.itsSettings.showAllPathHints);
	},

	enableDisableStatCombo : function(btn)
	{
		if(!this.itsControls.itsArrowWidthStatCombo)
			this.itsControls.itsArrowWidthStatCombo = Ext.getCmp('arrowWidthstatId');

		if(btn.getValue())
		{
			var statId = (this.itsSettings.arrowWidthStatId != 'NONE') ? this.itsSettings.arrowWidthStatId : 'TOTAL_CALLS';
			this.itsControls.itsArrowWidthStatCombo.enable();
			this.itsControls.itsArrowWidthStatCombo.setValue(statId);
		}
		else
			this.itsControls.itsArrowWidthStatCombo.disable();

	},

	enableDisableDormantThresholdTimeCombo : function()
	{
		
		

		var enableDormantThresholdTimeCheckbox = Ext.getCmp('enableDormantThresholdTimeId');
		var dormantThresholdTimeCombo = Ext.getCmp('dormantThresholdTimeId');

		if(!enableDormantThresholdTimeCheckbox.disabled && enableDormantThresholdTimeCheckbox.getValue())
			dormantThresholdTimeCombo.enable();
		else
			dormantThresholdTimeCombo.disable();
	},

	getFieldLabel: function(key)
	{
		return com.actional.serverui.technicalview.getMessage('overviewMap.optionsDialog.networkMapTab.' + key);
	}
});

Ext.reg('com.actional.serverui.NetworkOptionsTab', com.actional.serverui.NetworkOptionsTab);
