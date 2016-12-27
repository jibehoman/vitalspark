

















Ext.namespace('com.actional.serverui');

/**
 * @lastrev fix38031 - adjust the z-index of the hover boxes so that they are visible in dark theme.
 */
com.actional.serverui.StatisticDetailsDialog = function(config)
{
	this.config = config || {};
	this.id = this.config.id || 'StatisticDetailsDialog_' + Math.floor(Math.random() * 100);
	this.followSiteSelectionChanged = this.config.followSiteSelectionChanged;
	this.gatherIntervalSeconds = this.config.gatherIntervalSeconds || 600;

	this.config = Ext.applyIf(this.config, {modifiesGlobalTimeSelection : true});

	OpenAjax.hub.subscribe('com.actional.serverui.statisticDetails.showDialog', this.showDialog, this,
										{source : this.itsEventSourceName});
};

com.actional.serverui.StatisticDetailsDialog.prototype =
{
	itsEventSourceName : 'StatisticDetailsDialog',
	itsWindow : undefined,
	itsStatisticParts : undefined,
	itsStatisticId : undefined,
	itsSiteInfo : undefined,
	itsSelectionInfo : undefined,
	itsHoverInfo : undefined,
	itsSummaryInfo : undefined,
	itsDrawTypeComboDataStore: undefined,

	itsToolbarOptions :
	{
			graph_type : 'line',
			draw_type : undefined,	
			precision : undefined,	
			show_alerts : false,
			show_baseline : false,
			show_grid : false,
			substat_preferences :
			{
				avg: false,
				min: false,
				max: false,
				std_dev: false
			}
	},

	getId : function()
	{
		return this.id;
	},

	init : function()
	{
		this.initTemplates();
	},

	/**
	 * @lastrev fix35362 - added statistic_id and parts (both optionally valid) to the event
	 */
	fireGraphOptionsChangedEvent : function(source)
	{
/*
		trace('graph_type: ' + this.itsToolbarOptions.graph_type);
		trace('precision: ' + this.itsToolbarOptions.precision);
		trace('draw: ' + this.itsToolbarOptions.draw_type);
		trace('show_alerts: ' + this.itsToolbarOptions.show_alerts);
		trace('show_baseline: ' + this.itsToolbarOptions.show_baseline);
		trace('show_grid: ' + this.itsToolbarOptions.show_grid);
*/
		OpenAjax.hub.publish('com.actional.serverui.statisticDetails.internal.optionsChanged',
		{
			source			: source,
			graph_type		: this.itsToolbarOptions.graph_type,
			draw_type		: this.itsToolbarOptions.draw_type,
			precision		: this.itsToolbarOptions.precision,
			show_alerts		: this.itsToolbarOptions.show_alerts,
			show_baseline		: this.itsToolbarOptions.show_baseline,
			show_grid		: this.itsToolbarOptions.show_grid,
			substat_preferences	: this.itsToolbarOptions.substat_preferences,
			statistic_id		: this.itsStatisticId,
			parts			: this.itsStatisticParts
		});
	},

	subscribeToEvents : function()
	{
		
		OpenAjax.hub.subscribe('com.actional.serverui.statisticDetails.internal.optionsChanged',
					this.onOptionChanged, this, {source : this.itsEventSourceName});
		OpenAjax.hub.subscribe('com.actional.serverui.statisticDetails.internal.selectionChanged',
					this.onSelectionChanged, this, {source : this.itsEventSourceName});
		OpenAjax.hub.subscribe('com.actional.serverui.statisticDetails.internal.summaryDataChanged',
					this.onSummaryDataChanged, this, {source : this.itsEventSourceName});
		OpenAjax.hub.subscribe('com.actional.serverui.statisticDetails.internal.rowSelectionChanged',
					this.onRowSelectionChanged, this, {source : this.itsEventSourceName});

		
		OpenAjax.hub.subscribe('com.actional.serverui.siteSelectionChanged',
				this.onSiteSelectionChanged, this, {source : this.itsEventSourceName});
		OpenAjax.hub.subscribe('com.actional.serverui.statisticDetailsOptionsChanged',
				this.onStatisticDetailsOptionsChanged, this, {source : this.itsEventSourceName});
		OpenAjax.hub.subscribe('com.actional.util.EventRequest',
				this.onEventRequest, this, {source : this.itsEventSourceName});
	},

	/**
	 * @lastrev fix37669 - remove "overflow:'auto'" as body style for graphPanel.
	 */
	createWindow : function(config)
	{
		var currentInstance = this;

		this.itsDrawTypeComboDataStore = new Ext.data.SimpleStore(
		{
			fields: [ 'id', 'name' ],
			data: []
		});

		var headerPanel = new Ext.Panel(
		{
			hidden : !currentInstance.followSiteSelectionChanged,
			border : false,
			height : 70,
			anchor : '',
			margins : '10 10 10 10',
			plain : true,
			id : this.getId() + '_siteHeaderPanel'
		});

		var tablePanel = new Ext.Panel(
		{
			border : false,
			anchor : '100%',
			height : 130,
			plain : true,
			id : this.getId() + '_summaryGraphDataTable'
		});

		var optionsMenu = new Ext.menu.Menu(
		{
			editable : false,
			items:
			[{
				text: 'Alerts',
				checked: currentInstance.itsToolbarOptions.show_alerts,
				checkHandler: function(item, checked)
				{
					currentInstance.itsToolbarOptions.show_alerts = checked;
					currentInstance.fireGraphOptionsChangedEvent(this.itsEventSourceName);
				}
			},
			{
				text: 'Grid',
				checked: currentInstance.itsToolbarOptions.show_grid,
				checkHandler: function(item, checked)
				{
					currentInstance.itsToolbarOptions.show_grid = checked;
					currentInstance.fireGraphOptionsChangedEvent(this.itsEventSourceName);
				}
			}],
			name : 'optionsCB',
			mode : 'local',
			width : 80
		});

		tablePanel.on('resize', this.updateBackgroundDivs);

		var graphTypeFn = function (type)
		{
			currentInstance.itsToolbarOptions.graph_type = type;
			currentInstance.fireGraphOptionsChangedEvent(this.itsEventSourceName);
		};

		function drawTypeFn(cb, record, index)
		{
			currentInstance.itsToolbarOptions.draw_type = record.data.id;
			currentInstance.fireGraphOptionsChangedEvent(this.itsEventSourceName);
		};

		function precisionFn(cb, record, index)
		{
			currentInstance.itsToolbarOptions.precision = record.data.id;
			currentInstance.fireGraphOptionsChangedEvent(this.itsEventSourceName);
		};

		var drawTypeCb = new Ext.form.ComboBox(
		{
			selectOnFocus: true,
			forceSelection: true,
			valueField: 'id',
			displayField: 'name',
			id: currentInstance.getId() + 'drawTypeCombo',
			editable : false,
			store : this.itsDrawTypeComboDataStore,
			mode : 'local',
			triggerAction : 'all',
			width : 80
		});

		
		var timeUnitStore = new Ext.data.SimpleStore(
		{
			fields: ['id', 'name', 'duration'],
			data : []
		});

		var timeUnitData = com.actional.DataStore.timeUnits.getTimeUnitList();
		var timeUnitDataStoreArray = [];
		for (var i = 0; i < timeUnitData.length; i++)
		{
			var item = timeUnitData[i];
			timeUnitDataStoreArray[i] = [item.id, item.name, item.duration];
		}
		timeUnitStore.loadData(timeUnitDataStoreArray);
		var defaultTimeUnit = com.actional.DataStore.timeUnits.getSmallestInterval().id;
		this.itsToolbarOptions.precision = defaultTimeUnit;

		
		var precisionCb = new Ext.form.ComboBox(
		{
			store:	timeUnitStore,
			value: defaultTimeUnit,
			selectOnFocus: true,
			forceSelection: true,
			displayField: 'name',
			valueField: 'id',
			id: currentInstance.getId() + 'precisionCombo',
			editable : false,
			mode : 'local',
			triggerAction : 'all',
			width : 100
		});

		drawTypeCb.on("select", drawTypeFn);
		precisionCb.on("select", precisionFn);

		var lineButton = new Ext.Button(
		{
			id: this.getId + 'Line',
			tooltipType: 'title',
			tooltip : "Line chart",
			allowDepress: false,
			pressed: this.itsToolbarOptions.graph_type == 'line',
			cls: 'x-btn-icon',
			enableToggle: true,
			toggleGroup : 'graphtype',
			icon: contextUrl('images/sdd/chart_line_small.gif'),
			toggleHandler: function(btn, e){ graphTypeFn('line', e); }
		});

		var columnButton = new Ext.Button(
		{
			id: this.getId + 'Column',
			tooltipType: 'title',
			tooltip : "Column chart",
			allowDepress: false,
			pressed: this.itsToolbarOptions.graph_type == 'column',
			cls: 'x-btn-icon',
			enableToggle: true,
			toggleGroup : 'graphtype',
			icon: contextUrl('images/sdd/chart_column_small.gif'),
			toggleHandler: function(btn, e){ graphTypeFn('column', e); }
		});

		var candleButton = new Ext.Button(
		{
			id: this.getId + 'Candle',
			tooltipType: 'title',
			tooltip : "Candle chart",
			allowDepress: false,
			pressed: this.itsToolbarOptions.graph_type == 'candle',
			cls: 'x-btn-icon',
			enableToggle: true,
			toggleGroup : 'graphtype',
			icon: contextUrl('images/sdd/chart_candle_small.gif'),
			toggleHandler: function(btn, e){ graphTypeFn('candle', e); }
		});

		var graphPanel = new Ext.Panel(
		{
			border : true,
			margins : '0 0 0 0',
			plain : true,
			minHeight : 300,
			anchor : '100% 0',
			layout:'fit',
	        	items:
	        	[
		        	{
		        		xtype: 'com.actional.Flash',
		        		swfUrl: contextUrl('images/temp80_detailgraph.swf'),
		        		objectId: 'temp80_detailgraph',
		        		flashvars :
		        		{
		        			modifiesGlobalTimeSelection : this.config.modifiesGlobalTimeSelection
		        		}
		        	}
	        	],

			tbar:
			[
				
				lineButton,
				columnButton,
				candleButton,

				' ',
				'-', 
				' ',

				'Draw:',
				drawTypeCb,

				' ',
				'-', 
				' ',

				
				'Precision:',
				precisionCb
/*
				'-', 

				
				{
					text:'Options',
					tooltip: 'Select option',
					tooltipType: 'title',
					menu: optionsMenu
				}
*/
			]
		});

		var windowPanel = new Ext.Panel(
		{
			layout : 'extendedanchor',
			layoutConfig : { relative: true },
			items : [headerPanel, tablePanel, graphPanel]
		});

		this.itsWindow = new Ext.Window(
		{
			title : 'Statistic Details',
			y : window.isInPct20 && isInPct20() ? 100 : undefined,
			closable : true,
			width : 550,
			minWidth : 400,
			height : 550,
			minHeight : 500,
			border : false,
			margins : '0 0 0 0',
			plain : true,
			layout : 'fit',
			items : windowPanel,
			constrainHeader: true,
			closeAction : 'hide'
		});

		this.itsWindow.on('hide',this.onHide, this);

		tablePanel.addListener('bodyresize', this.updateBackgroundDivs, this);
	},

	onHide: function()
	{
		OpenAjax.hub.publish('com.actional.serverui.statisticDetails.internal.dialogHidden',
			{
				source	: this.itsEventSourceName
			});
	},

	/**
	 * @lastrev fix35596 - graph options need not be fired from this method. detail graph will have this info.
	 */
	updateDrawTypeComboValues : function()
	{
		if (this.supportsTotals(this.itsStatisticId))
		{
			this.itsDrawTypeComboDataStore.removeAll();
			this.itsDrawTypeComboDataStore.loadData(
			[
				['total', 'Total']
			]);
		}
		else
		{
			this.itsDrawTypeComboDataStore.removeAll();
			this.itsDrawTypeComboDataStore.loadData(
			[
				['avg', 'Avg'],
				['min', 'Min'],
				['max', 'Max'],
				['std_dev', '95%']
			]);
		}
		var subStat = com.actional.DataStore.statList.getSubStatMetadata(this.itsStatisticId).abbr2;
		this.itsToolbarOptions.draw_type = subStat;

		
		var cb = Ext.getCmp(this.getId() + 'drawTypeCombo');
		cb.setValue(this.itsToolbarOptions.draw_type);
	},

	updatePrecisionComboValues : function(timeUnitValue)
	{
		
		var cb = Ext.getCmp(this.getId() + 'precisionCombo');
		cb.setValue(timeUnitValue);

		this.itsToolbarOptions.precision = timeUnitValue;
	},

	addBackgroundDivsToDom : function()
	{
		if (Ext.get(this.getId() + 'empty_hoverselection_background_id'))
			return;

		var dialog = Ext.get(this.getId() + '_summaryGraphDataTable');

		
		Ext.DomHelper.insertBefore(dialog, '<div class="act-sdd-summarystats_titlebox" id="' +
								this.getId() + 'summary_background_id"/>');

		
		Ext.DomHelper.insertBefore(dialog, '<div class="act-sdd-selection_titlebox" id="' +
								this.getId() + 'selection_background_id"/>');

		
		Ext.DomHelper.insertBefore(dialog, '<div class="act-sdd-hover_titlebox" id="' +
								this.getId() + 'hover_background_id"/>');

		
		Ext.DomHelper.insertBefore(dialog, '<table class="act-sdd-empty_selection_titlebox" id="' +
				this.getId() + 'empty_selection_background_id"><tr><td ' +
				'class="act-sdd-empty_selection_titlebox">Select chart data<br>to display values</td>' +
				'</tr></table>');

		
		Ext.DomHelper.insertBefore(dialog, '<table class="act-sdd-empty_hover_titlebox" id="' +
				this.getId() + 'empty_hover_background_id"><tr>' +
				'<td class="act-sdd-empty_hover_titlebox">Hold mouse pointer<br>over chart<br>' +
				'to display values</td></tr></table>');

		
		Ext.DomHelper.insertBefore(dialog, '<table class="act-sdd-empty_hoverselection_titlebox" id="' +
				this.getId() + 'empty_hoverselection_background_id">' +
				'<tr><td class="act-sdd-empty_hoverselection_titlebox">' +
				'Select chart data<br>or<br>hold mouse pointer<br>over chart<br>to display values' +
				'</td></tr></table>');

		var numStats = 1;
		for (var i = 1; i <= numStats; i++)
		{
			
			var e = Ext.DomHelper.insertBefore(dialog, '<div id="' + this.getId() + i +
				'_background_id" class="act-sdd-statistics_box"/>', true);
			e.position(null, 9450);
		}
	},


	/**
	 * @lastrev fix35548 - send the values of substat_preferences as config to the dataTable template
	 */
	renderTable : function(elem)
	{
		var ts = this.templates;

		for (var i = 0; i < this.itsStatisticParts.length; i++)
		{
			this.itsStatisticParts[i].style_suffix = (i % 2 == 0) ? '_lightblue' : '_darkblue';
		}

		var subStatPrefs = this.itsToolbarOptions.substat_preferences;

		var dataTableHtml = ts.dataTableTpl.applyTemplate(
		{
			id_prefix : this.getId(),
			totals_mode : this.supportsTotals(this.itsStatisticId),
			col1_title : 'Summary',
			statistics :
			[{
				statistic_name : this.getStatTypeName(this.itsStatisticId),
				statistic_id : this.itsStatisticId,
				parts : this.itsStatisticParts,
				id_prefix : this.getId()
			}],
			avg_postfix : subStatPrefs.avg ? "_selected" : "",
			min_postfix : subStatPrefs.min ? "_selected" : "",
			max_postfix : subStatPrefs.max ? "_selected" : "",
			std_dev_postfix : subStatPrefs.std_dev ? "_selected" : ""
		});

		return dataTableHtml;
	},

	updateTooltips : function()
	{
		
		Ext.get(this.getId() + 'drawTypeCombo').dom.title = 'Select the draw type';

		
		Ext.get(this.getId() + 'precisionCombo').dom.title = 'Select the precision for the chart';

		if (!Ext.get(this.getId() + 'data_table_id'))
			return;

		
		/* Unused code.
		if (this.itsSummaryInfo)
		{
			var startTime = this.itsSummaryInfo.interval_start;
			var endTime = this.itsSummaryInfo.interval_end;
		}

		if (this.itsSelectionInfo)
		{
			var startTime = this.itsSelectionInfo.interval_start;
			var endTime = this.itsSelectionInfo.interval_end;

		}

		if (this.itsHoverInfo)
		{
			var startTime = this.itsHoverInfo.interval_start;
			var endTime = this.itsHoverInfo.interval_end;

		}
		*/
		
		
		if (this.supportsTotals(this.itsStatisticId))
		{
			var showHide = this.itsToolbarOptions.substat_preferences.avg ? "Hide" : "Show";
			Ext.get(this.getId() + 'col1_header2_id').dom.title = showHide + ' the period Average on the chart';

			showHide = this.itsToolbarOptions.substat_preferences.min ? "Hide" : "Show";
			Ext.get(this.getId() + 'col1_header3_id').dom.title = showHide + ' the period Minimum';

			showHide = this.itsToolbarOptions.substat_preferences.max ? "Hide" : "Show";
			Ext.get(this.getId() + 'col1_header4_id').dom.title = showHide + ' the period Maximum';
		}
		else
		{
			var showHide = this.itsToolbarOptions.substat_preferences.avg ? "Hide" : "Show";
			Ext.get(this.getId() + 'col1_header1_id').dom.title = showHide + ' the period Average on the chart';

			showHide = this.itsToolbarOptions.substat_preferences.min ? "Hide" : "Show";
			Ext.get(this.getId() + 'col1_header2_id').dom.title = showHide + ' the period Minimum';

			showHide = this.itsToolbarOptions.substat_preferences.max ? "Hide" : "Show";
			Ext.get(this.getId() + 'col1_header3_id').dom.title = showHide + ' the period Maximum';

			showHide = this.itsToolbarOptions.substat_preferences.std_dev ? "Hide" : "Show";
			Ext.get(this.getId() + 'col1_header4_id').dom.title = showHide + ' the period standard deviation';
		}

		
		for (var i = 0; i < this.itsStatisticParts.length; i++)
		{
			var part = this.itsStatisticParts[i];
			var row_id = part.row_id;

			var label = part.label ? part.label + ' ' : '';
			var ttStr = part.selected ?
				'Remove the ' + label + 'data from the chart' :
				'Add the ' + label + 'data to the chart';
			Ext.get(this.getId() + row_id + 'header').dom.title = ttStr;
		}
	},

	updateSummaryStats : function() {
		if (!this.itsStatisticParts || !Ext.get(this.getId() + this.itsStatisticParts[0].row_id + '_col1_1_value'))
			return;

		for (var i = 0; i < this.itsStatisticParts.length; i++)
		{
			var part = this.itsStatisticParts[i];
			var row_id = part.row_id;
			var stats = new Object();
			if (this.itsSummaryInfo.summary_data && this.itsSummaryInfo.summary_data[row_id])
				stats = this.itsSummaryInfo.summary_data[row_id];

			if (!this.supportsTotals(this.itsStatisticId))
			{
				Ext.get(this.getId() + row_id + '_col1_1_value').update(stats['avg'] ? stats['avg'][0] : '');
				Ext.get(this.getId() + row_id + '_col1_1_unit').update(stats['avg'] ? stats['avg'][1] : '');
				Ext.get(this.getId() + row_id + '_col1_2_value').update(stats['min'] ? stats['min'][0] : '');
				Ext.get(this.getId() + row_id + '_col1_2_unit').update(stats['min'] ? stats['min'][1] : '');
				Ext.get(this.getId() + row_id + '_col1_3_value').update(stats['max'] ? stats['max'][0] : '');
				Ext.get(this.getId() + row_id + '_col1_3_unit').update(stats['max'] ? stats['max'][1] : '');
				Ext.get(this.getId() + row_id + '_col1_4_value').update(stats['std_dev'] ? stats['std_dev'][0] : '');
				Ext.get(this.getId() + row_id + '_col1_4_unit').update(stats['std_dev'] ? stats['std_dev'][1] : '');
			}
			else
			{
				Ext.get(this.getId() + row_id + '_col1_1_value').update(stats['total'] ? stats['total'][0] : '');
				Ext.get(this.getId() + row_id + '_col1_1_unit').update(stats['total'] ? stats['total'][1] : '');
				Ext.get(this.getId() + row_id + '_col1_2_value').update(stats['avg'] ? stats['avg'][0] : '');
				Ext.get(this.getId() + row_id + '_col1_2_unit').update(stats['avg'] ? stats['avg'][1] : '');
				Ext.get(this.getId() + row_id + '_col1_3_value').update(stats['min'] ? stats['min'][0] : '');
				Ext.get(this.getId() + row_id + '_col1_3_unit').update(stats['min'] ? stats['min'][1] : '');
				Ext.get(this.getId() + row_id + '_col1_4_value').update(stats['max'] ? stats['max'][0] : '');
				Ext.get(this.getId() + row_id + '_col1_4_unit').update(stats['max'] ? stats['max'][1] : '');
			}
		}
	},

	updateSelectionStats : function() {
		if (!this.itsStatisticParts || !Ext.get(this.getId() + this.itsStatisticParts[0].row_id + '_col2_value'))
			return;

		for (var i = 0; i < this.itsStatisticParts.length; i++)
		{
			var part = this.itsStatisticParts[i];
			var row_id = part.row_id;

			
			var empty_selection_background_visible = this.itsSelectionInfo == undefined && this.itsHoverInfo != undefined;
			if (empty_selection_background_visible)
			{
				Ext.get(this.getId() + row_id + '_col3_value').update('');
				Ext.get(this.getId() + row_id + '_col3_unit').update('');
			}

			if (this.itsSelectionInfo == undefined || !part.selected)
			{
				Ext.get(this.getId() + row_id + '_col2_value').update('');
				Ext.get(this.getId() + row_id + '_col2_unit').update('');
			}
			else
			{
				var stats = this.itsSelectionInfo.data[row_id];
				Ext.get(this.getId() + row_id + '_col2_value').update(stats ? stats[0] : '');
				Ext.get(this.getId() + row_id + '_col2_unit').update(stats ? stats[1] : '');
			}

			
			if (this.itsHoverInfo == undefined || !part.selected)
			{
				if (empty_selection_background_visible)
				{
					Ext.get(this.getId() + row_id + '_col2_value').update('');
					Ext.get(this.getId() + row_id + '_col2_unit').update('');
				}
				else
				{
					Ext.get(this.getId() + row_id + '_col3_value').update('');
					Ext.get(this.getId() + row_id + '_col3_unit').update('');
				}
			}
			else
			{
				var stats = this.itsHoverInfo.data[row_id];
				if (empty_selection_background_visible)
				{
					Ext.get(this.getId() + row_id + '_col2_value').update(stats ? stats[0] : '');
					Ext.get(this.getId() + row_id + '_col2_unit').update(stats ? stats[1] : '');
				}
				else
				{
					Ext.get(this.getId() + row_id + '_col3_value').update(stats ? stats[0] : '');
					Ext.get(this.getId() + row_id + '_col3_unit').update(stats ? stats[1] : '');
				}
			}
		}
	},

	updateSummaryTimeInfo : function()
	{
		if (!Ext.get(this.getId() + 'col1_timeinfo_id'))
			return;

		if (!this.itsSummaryInfo)
			Ext.get(this.getId() + 'col1_timeinfo_id').update('');

		var timeStr = com.actional.util.TimeUtil.displayDateTimeRange(
		{
			start_date:	this.itsSummaryInfo.interval_start,
			end_date:	this.itsSummaryInfo.interval_end,
			rel_start_date:	new Date()
		});

		var interval = com.actional.util.TimeUtil.displayIntervalLength(
					this.itsSummaryInfo.interval_start, this.itsSummaryInfo.interval_end);
		var intervalStr = interval ? '&nbsp;(' + interval + ')' : '';


		Ext.get(this.getId() + 'col1_timeinfo_id').update(timeStr);
		Ext.get(this.getId() + 'col1_intervalinfo_id').update(intervalStr);

	},

	updateSelectionTimeInfo : function()
	{
		if (!Ext.get(this.getId() + 'col3_timeinfo_id'))
			return;

		var empty_selection_background_visible = this.itsSelectionInfo == undefined &&
										this.itsHoverInfo != undefined;
		var empty_hoverselection_background_visible = this.itsSelectionInfo == undefined &&
										this.itsHoverInfo == undefined;

		if (this.itsHoverInfo && this.itsHoverInfo.interval_start && this.itsToolbarOptions.precision)
		{
			var precision = this.itsToolbarOptions.precision;
			var hoverTime = '';
			if (precision == 'HOUR')
			{
				hoverTime = '@ ' + com.actional.util.TimeUtil.renderTime(
					this.itsHoverInfo.interval_start, {excludeMin: true});
			}
			else if (precision == 'WEEK')
				hoverTime = 'Week ' + (new Date(this.itsHoverInfo.interval_start)).format('W');
			else if (precision == 'QUARTER')
				hoverTime = com.actional.util.TimeUtil.renderQuarter(this.itsHoverInfo.interval_start);
			else if (precision == 'YEAR')
				hoverTime = (new Date(this.itsHoverInfo.interval_start)).getFullYear();
			else 
			{
				var ctx = {	start_date : this.itsHoverInfo.interval_start,
						end_date : this.itsHoverInfo.interval_end,
						rel_start_date : this.itsSummaryInfo.interval_start,
						rel_start_end : this.itsSummaryInfo.interval_end
				};
				hoverTime = com.actional.util.TimeUtil.displayDateTimeRange(ctx);
			}

		}

		var selectionTime;
		if (!this.itsSelectionInfo)
			selectionTime = '';
		else
		{
			selectionTime = com.actional.util.TimeUtil.displayDateTimeRange(
			{
				start_date:	this.itsSelectionInfo.interval_start,
				end_date:	this.itsSelectionInfo.interval_end,
				rel_start_date:	this.itsSummaryInfo ?
							this.itsSummaryInfo.interval_start : null,
				rel_end_date:	this.itsSummaryInfo ?
							this.itsSummaryInfo.interval_end : null
			});
		}

		if (empty_selection_background_visible)
			Ext.get(this.getId() + 'col3_timeinfo_id').update('');

		if (this.itsSelectionInfo == undefined)
			Ext.get(this.getId() + 'col2_timeinfo_id').update('');
		else
			Ext.get(this.getId() + 'col2_timeinfo_id').update(selectionTime);

		
		if (this.itsHoverInfo == undefined)
		{
			if (empty_selection_background_visible)
				Ext.get(this.getId() + 'col2_timeinfo_id').update('');
			else
				Ext.get(this.getId() + 'col3_timeinfo_id').update('');
		}
		else
		{
			if (empty_selection_background_visible)
				Ext.get(this.getId() + 'col2_timeinfo_id').update(hoverTime);
			else
				Ext.get(this.getId() + 'col3_timeinfo_id').update(hoverTime);
		}
	},

	sendFetchNodeNameIconRequest : function(type, site_id, peersite_id)
	{
	      	Ext.Ajax.request(
	        {
	        	url: contextUrl('portal/operations/nodename.jsrv'),
	                method: 'GET',
	                params: {
				source : this.itsEventSourceName,
				type: type,
				site_id: site_id,
				peersite_id: peersite_id
	        	},
			scope: this,
	                success: this.sendFetchNodeNameIconAccept,
	                failure: this.sendFetchNodeNameIconFailure
		});
	},

	sendFetchNodeNameIconAccept : function(responseObject)
	{
		var result = eval(responseObject.responseText);
		this.doFullSiteHeaderUpdate(result);
	},

	sendFetchNodeNameIconFailure : function(responseObject, optionsObject)
	{
		if (responseObject.status != 200)
		{
			this.doFullSiteHeaderUpdate(
				{
					type: 'nothing',
					errorText: 'Error retrieving network icon(s): ' + responseObject.statusText
				});
		}
	},

	doFullTableUpdate : function()
	{
		var tablePanel = Ext.get(this.getId() + '_summaryGraphDataTable');
		if (!tablePanel)
			return;
		var html = this.renderTable();
		tablePanel.update(html); 
		this.hookSubStatEventHandlers();
		this.hookRowSelectionEventHandlers();
		this.updateTooltips();
	},

	/**
	 * @lastrev fix35548 - do window.doLayout() to ensure everything is properly positioned.
	 */
	doFullSiteHeaderUpdate : function(nodeInfoStruct)
	{
		var headerPanel = Ext.get(this.getId() + '_siteHeaderPanel');
		if (!this.followSiteSelectionChanged)
		{
			this.setHeaderVisible(false);
		}
		else
		{
			var html = this.templates.siteHeaderTpl.applyTemplate(
			{
				id_prefix : this.getId(),
				type : (!nodeInfoStruct || nodeInfoStruct.errorText) ? 'nothing' : nodeInfoStruct.type,
				errorText : !nodeInfoStruct ? '' : nodeInfoStruct.errorText,
				site_name : !nodeInfoStruct ? '' : nodeInfoStruct.site_name,
				peersite_name : !nodeInfoStruct ? '' : nodeInfoStruct.peersite_name,
				site_icon_url : !nodeInfoStruct ? '' : nodeInfoStruct.site_icon_url,
				peersite_icon_url : !nodeInfoStruct ? '' : nodeInfoStruct.peersite_icon_url,
				arrow_icon_url : contextUrl('images/sdd/network_arrow.gif')
			});

			if (headerPanel)
			{
				this.setHeaderVisible(true);
				headerPanel.update(html);
			}
		}
		this.updateBackgroundDivs();
		this.itsWindow.doLayout();
	},

	hookSubStatEventHandlers : function()
	{
		if (!Ext.get(this.getId() + 'col1_header1_id'))
			return;

		var currentInst = this;

		var subStatFn = function(subStatId, elem)
		{
			var newValue = elem.hasClass('act-sdd-topheader_selected') ? false : true;

			if ('avg' == subStatId)
				currentInst.itsToolbarOptions.substat_preferences.avg = newValue;
			else if ('min' == subStatId)
				currentInst.itsToolbarOptions.substat_preferences.min = newValue;
			else if ('max' == subStatId)
				currentInst.itsToolbarOptions.substat_preferences.max = newValue;
			else if ('std_dev' == subStatId)
				currentInst.itsToolbarOptions.substat_preferences.std_dev = newValue;

			if (newValue)
				elem.replaceClass('act-sdd-topheader', 'act-sdd-topheader_selected');
			else
				elem.replaceClass('act-sdd-topheader_selected', 'act-sdd-topheader');
			currentInst.fireGraphOptionsChangedEvent(this.itsEventSourceName);
			currentInst.updateTooltips();
		};

		if (!this.supportsTotals(this.itsStatisticId))
		{
			var headerTd1 = Ext.get(this.getId() + 'col1_header1_id');
			headerTd1.on('click', function() { subStatFn('avg', headerTd1); }, this);

			var headerTd2 = Ext.get(this.getId() + 'col1_header2_id');
			headerTd2.on('click', function() { subStatFn('min', headerTd2); }, this);

			var headerTd3 = Ext.get(this.getId() + 'col1_header3_id');
			headerTd3.on('click', function() { subStatFn('max', headerTd3); }, this);

			var headerTd4 = Ext.get(this.getId() + 'col1_header4_id');
			headerTd4.on('click', function() { subStatFn('std_dev', headerTd4); }, this);
		}
		else
		{
			var headerTd1 = Ext.get(this.getId() + 'col1_header2_id');
			headerTd1.on('click', function() { subStatFn('avg', headerTd1); }, this);

			var headerTd2 = Ext.get(this.getId() + 'col1_header3_id');
			headerTd2.on('click', function() { subStatFn('min', headerTd2); }, this);

			var headerTd3 = Ext.get(this.getId() + 'col1_header4_id');
			headerTd3.on('click', function() { subStatFn('max', headerTd3); }, this);
		}
	},

	hookRowSelectionEventHandlers : function()
	{
		function rowSelectionFn()
		{
			OpenAjax.hub.publish('com.actional.serverui.statisticDetails.internal.rowSelectionChanged',
			{
				row_id		: this.row_id,
				selected	: !this.selected
			});
		};

		for (var i = 0; i < this.itsStatisticParts.length; i++)
		{
			var part = this.itsStatisticParts[i];
			var headerTd = Ext.get(this.getId() + part.row_id + 'header');
			if (headerTd)
			{
				headerTd.removeAllListeners();
				headerTd.on('click', rowSelectionFn, part);
			}
		}
	},

	updateColumnTitles : function()
	{
		if (!Ext.get(this.getId() + 'col2_title_id'))
			return;

		if (this.itsSelectionInfo)
		{
			Ext.get(this.getId() + 'col2_title_id').update('Selection Info');
			if (this.itsHoverInfo)
				Ext.get(this.getId() + 'col3_title_id').update('Quick Info');
			else
				Ext.get(this.getId() + 'col3_title_id').update('');
		}
		else
		{
			Ext.get(this.getId() + 'col3_title_id').update('');
			if (this.itsHoverInfo)
				Ext.get(this.getId() + 'col2_title_id').update('Quick Info');
			else
				Ext.get(this.getId() + 'col2_title_id').update('');
		}

		var col2_header = Ext.get(this.getId() + 'col2_header_id');
		col2_header.setWidth(col2_header.getTextWidth() + 6);

		var col3_header = Ext.get(this.getId() + 'col3_header_id');
		col3_header.setWidth(col3_header.getTextWidth() + 6);
	},

	updateBackgroundDivs : function()
	{
		var data_table = Ext.get(this.getId() + 'data_table_id');
		if (!data_table)
			return;
		data_table.setWidth('auto');

		var summary_background = Ext.get(this.getId() + 'summary_background_id');
		var hover_background = Ext.get(this.getId() + 'hover_background_id');
		var selection_background = Ext.get(this.getId() + 'selection_background_id');
		var empty_hover_background = Ext.get(this.getId() + 'empty_hover_background_id');
		var empty_selection_background = Ext.get(this.getId() + 'empty_selection_background_id');
		var empty_hoverselection_background = Ext.get(this.getId() + 'empty_hoverselection_background_id');

		if (!summary_background || !hover_background || !selection_background || !empty_hover_background)
			return;

		var empty_selection_background_visible = this.itsSelectionInfo == undefined && this.itsHoverInfo != undefined;
		var empty_hover_background_visible = this.itsHoverInfo == undefined && this.itsSelectionInfo != undefined;
		var empty_hoverselection_background_visible = this.itsSelectionInfo == undefined && this.itsHoverInfo == undefined;

		var col1HeaderCell = Ext.get(this.getId() + 'col1_header_id');
		var col2HeaderCell = Ext.get(this.getId() + 'col2_header_id');
		var col3HeaderCell = Ext.get(this.getId() + 'col3_header_id');

		
		summary_background.setOpacity();
		summary_background.anchorTo(col1HeaderCell, 'tl');
		summary_background.setWidth(col1HeaderCell.getWidth());
		summary_background.setHeight(data_table.getHeight());
		summary_background.position(null, 9400, summary_background.getX(), summary_background.getY());
		summary_background.show();

		
		if (this.itsSelectionInfo == undefined)
			selection_background.hide();
		else
		{
			selection_background.hide();
			selection_background.anchorTo(col2HeaderCell, 'tl');
			selection_background.setWidth(col2HeaderCell.getWidth());
			selection_background.setHeight(data_table.getHeight());
			selection_background.position(null, 9400);
			selection_background.show();
		}

		
		if (this.itsHoverInfo == undefined)
			hover_background.hide();
		else
		{
			hover_background.hide();
			var hover_header_id = this.itsSelectionInfo == undefined ? 'col2_header_id' : 'col3_header_id';
			var headerCell = Ext.get(this.getId() + hover_header_id);
			hover_background.anchorTo(headerCell, 'tl');
			hover_background.setWidth(headerCell.getWidth());
			hover_background.setHeight(data_table.getHeight());
			hover_background.position(null, 9400);
			hover_background.show();
		}

		
		if (empty_hoverselection_background_visible)
		{
			var left = col2HeaderCell.getX();
			var right = col3HeaderCell.getX() + col3HeaderCell.getWidth();
			empty_hoverselection_background.anchorTo(col2HeaderCell, 'tl');
			empty_hoverselection_background.setWidth(right - left);
			empty_hoverselection_background.setHeight(data_table.getHeight());
			empty_hoverselection_background.position(null, 10000);
			empty_hoverselection_background.show();
		}
		else
			empty_hoverselection_background.hide();

		
		if (empty_selection_background_visible)
		{
			empty_selection_background.anchorTo(col3HeaderCell, 'tl');
			empty_selection_background.setWidth(col3HeaderCell.getWidth());
			empty_selection_background.setHeight(data_table.getHeight());
			empty_selection_background.position(null, 10000);
			empty_selection_background.show();
		}
		else
			empty_selection_background.hide();

		
		if (empty_hover_background_visible)
		{
			empty_hover_background.anchorTo(col3HeaderCell, 'tl');
			empty_hover_background.setWidth(col3HeaderCell.getWidth());
			empty_hover_background.setHeight(data_table.getHeight());
			empty_hover_background.position(null, 10000);
			empty_hover_background.show();
		}
		else
		{
			empty_hover_background.hide();
		}

		
		var paddingCell = Ext.get(this.getId() + 'col0_id');
		var xOffset = 3;
		var yOffset = 5;
		var numStats = 1;	
		for (var statsNum = 1; statsNum <= numStats; statsNum++)
		{
			var parts = this.itsStatisticParts;
			var headerRow = Ext.get(this.getId() + this.itsStatisticId + '_header_row_id');
			var firstRowId = parts[0].row_id;
			var lastRowId = parts[parts.length - 1].row_id;

			var firstRow = Ext.get(this.getId() + firstRowId + '_data_row');
			var lastRow = Ext.get(this.getId() + lastRowId + '_data_row');

			var statisticBackgroundDiv = Ext.get(this.getId() + statsNum + '_background_id');
			statisticBackgroundDiv.hide();

			var left = paddingCell.getX();
			var right;
			if (empty_hoverselection_background_visible)
				right = col1HeaderCell.getX() + col1HeaderCell.getWidth();
			else if (empty_hover_background_visible || empty_selection_background_visible)
				right = col2HeaderCell.getX() + col2HeaderCell.getWidth();
			else
				right = col3HeaderCell.getX() + col3HeaderCell.getWidth() + xOffset;
			statisticBackgroundDiv.setWidth(right - left);
			var top = headerRow.getY();
			var bottom = lastRow.getY() + lastRow.getHeight();
			statisticBackgroundDiv.setHeight(bottom - top + yOffset);
			statisticBackgroundDiv.anchorTo(headerRow, 'tl', [0, 0]);
			statisticBackgroundDiv.show();
		}
		data_table.position(null, 9500);
	},

	populateStatisticsData : function()
	{
		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: this.itsEventSourceName,
			events	:
			[
				'com.actional.serverui.statisticDetails.internal.summaryDataChanged',
				'com.actional.serverui.statisticDetails.internal.selectionChanged'
			]
		});

	},

	setHeaderVisible : function(showHeader)
	{
		var headerPanel = Ext.getCmp(this.getId() + '_siteHeaderPanel');
		if (!headerPanel)
			return;

		if (showHeader)
		{
			headerPanel.setHeight(70);
			headerPanel.show();
		}
		else
		{
			headerPanel.hide();
			headerPanel.setHeight(0);
		}

		this.itsWindow.doLayout();
	},

	
	onEventRequest : function(event, publisherData, subscriberData)
	{
		var eventList = publisherData.events;

		if (eventList.indexOf('com.actional.serverui.statisticDetails.internal.optionsChanged') > -1)
			this.fireGraphOptionsChangedEvent(this.itsEventSourceName);
	},

	onStatisticDetailsOptionsChanged : function(event, publisherData, subscriberData)
	{
		this.itsStatisticParts = publisherData.parts;
		this.itsStatisticId = publisherData.statistic_id;
		this.followSiteSelectionChanged = publisherData.followSiteSelectionChanged;
		this.setHeaderVisible(this.followSiteSelectionChanged);

		this.doFullTableUpdate();
		this.updateColumnTitles();
		this.populateStatisticsData();
		this.updateBackgroundDivs();
		this.itsWindow.doLayout();

		this.updateDrawTypeComboValues();

		if (this.followSiteSelectionChanged)
		{
			
			var siteType = 'nothing';
			if (publisherData.site_id && publisherData.peersite_id)
				siteType = 'arrow';
			else if (publisherData.site_id)
				siteType = 'node';
			var sitePublisherData = new Object();
			sitePublisherData.source = 'internal';
			sitePublisherData.type = siteType;
			sitePublisherData.site_id = publisherData.site_id;
			sitePublisherData.peersite_id = publisherData.peersite_id;
			this.onSiteSelectionChanged(null, sitePublisherData);
		}
	},

	onOptionChanged : function(event, publisherData, subscriberData)
	{
		
		if (publisherData.source == this.itsEventSourceName)
			return;

		if (publisherData.precision)
			this.updatePrecisionComboValues(publisherData.precision);
	},

	/**
	 * @lastrev fix35596 - just return if this.followSiteSelectionChanged is false;
	 */
	onSiteSelectionChanged : function(event, publisherData, subscriberData)
	{
		if (!this.followSiteSelectionChanged)
		{
			return;
		}

		if (this.itsSiteInfo &&
			this.itsSiteInfo.type == publisherData.type &&
			this.itsSiteInfo.site_id == publisherData.site_id &&
			this.itsSiteInfo.peersite_id == publisherData.peersite_id)
		{
			return;	
		}

		this.itsSiteInfo = {
				type : publisherData.type,
				site_id : publisherData.site_id,
				peersite_id : publisherData.peersite_id
		};

		

		if (publisherData.type == 'nothing')
		{
			this.itsSelectionData = {};
			this.doFullSiteHeaderUpdate();
			this.populateStatisticsData();
			this.updateBackgroundDivs();
			this.itsWindow.doLayout();
		}
		else
		{
			this.sendFetchNodeNameIconRequest(publisherData.type, publisherData.site_id, publisherData.peersite_id);
		}
	},

	showDialog : function(event, publisherData, subscriberData)
	{
		if (!this.itsWindow)
		{
			this.init();
			this.createWindow();
			this.subscribeToEvents();
		}

		this.itsWindow.show();
		this.addBackgroundDivsToDom();
		this.updateTooltips();

		if (this.itsStatisticId == undefined)
		{
			OpenAjax.hub.publish('com.actional.util.EventRequest',
			{
				source	: this.itsEventSourceName,
				events	:
				[
					'com.actional.serverui.statisticDetailsOptionsChanged',
					'com.actional.serverui.siteSelectionChanged'
				]
			});
		}
	},

	onSelectionChanged : function(event, publisherData, subscriberData)
	{
		this.itsSelectionInfo = publisherData.selection;
		this.itsHoverInfo = publisherData.quick_info;

		this.updateColumnTitles();
		this.updateSelectionTimeInfo();
		this.updateSelectionStats();
		this.updateBackgroundDivs();
	},

	onSummaryDataChanged : function(event, publisherData, subscriberData)
	{
		this.itsSummaryInfo = publisherData;
		this.updateSummaryTimeInfo();
		this.updateSummaryStats();
		this.updateBackgroundDivs();
	},

	/**
	 * @lastrev fix35362 - now piggybacking on fireGraphOptionsChangedEvent; doing manual UI update
	 */
	onRowSelectionChanged : function(event, publisherData, subscriberData)
	{
		var row_id = publisherData.row_id;
		var selected = publisherData.selected;

		for (var i = 0; i < this.itsStatisticParts.length; i++)
		{
			var part = this.itsStatisticParts[i];
			if (part.row_id == row_id)
			{
				if (part.selected == selected)
					return;
				else
					part.selected = selected;

				this.fireGraphOptionsChangedEvent(this.itsEventSourceName);

				this.doFullTableUpdate();
				this.updateColumnTitles();
				this.populateStatisticsData();
				this.updateBackgroundDivs();

				break;
			}
		}
	},

	onOptionsComboChanged : function(event, publisherData, subscriberData)
	{
		var option = publisherData.option;
		var value = publisherData.value;

		if (option == 'alerts')
			this.itsToolbarOptions.show_alerts = value;
		else if (option == 'baseline')
			this.itsToolbarOptions.show_baseline = value;
		else if (option == 'grid')
			this.itsToolbarOptions.show_grid = value;
		this.fireGraphOptionsChangedEvent(this.itsEventSourceName);
	},


	/**
	 * private
	 *
	 * @lastrev fix35548 - in dataTable template use the substat_preferences to render the table.
	 */
	initTemplates : function() {
		var ts = this.templates || {};

		if (!ts.siteHeaderTpl)
		{
			ts.siteHeaderTpl = new Ext.XTemplate(
				'\n',
				'<table class="act-sdd-title">',
				'\n',
				'	<tr>',
				'\n',
				'		<td id="{id_prefix}title_icon_id" class="act-sdd-titleicon">',

					
				'<tpl if="type == \'node\'">',

					'<img width="64" height="64" src="',
					'{site_icon_url}',
					'">',
					'</tpl>', 

					
					
					'<tpl if="type == \'arrow\'">',
					'<table border=0 cellpadding=0 cellspacing=0><tr><td>',
					'<img width="16" height="16" src="',
					'{site_icon_url}',
					'">',
					'</td><td colspan="2">&nbsp;</td></tr>',

					'<tr><td>&nbsp;</td><td>',
					'<img src="',
					'{arrow_icon_url}',
					'">',
					'</td><td>&nbsp;</td></tr>',

					'<tr><td colspan="2">&nbsp</td><td>',
					'<img width="16" height="16" src="',
					'{peersite_icon_url}',
					'">',
					'</td></tr></table',

				'</tpl>', 


				'		</td>',
				'\n',
				'		<td class="act-sdd-titletext">',
				'\n',
				'			<table>',
				'\n',
				'				<tr>',
				'\n',
				'					<td class="act-sdd-title_callsfrom">',
				'<tpl if="type == \'node\'">',
					'Calls on',
					'</tpl>', 
					'<tpl if="type == \'arrow\'">',
					'Calls from',
				'</tpl>', 
				'</td>',
				'\n',
				'					<td class="act-sdd-title_items">',
				'<tpl if="type == \'nothing\'">',
					'<tpl if="errorText != \'\'">',
						'<font color="#ff0000">{errorText}</font>',	
					'</tpl>', 
					'<tpl if="errorText == \'\'">',
						'<i>No site is currently selected.</i>',
					'</tpl>', 
				'</tpl>', 
				'<tpl if="type == \'node\'">',
					'{site_name}',
				'</tpl>', 
				'<tpl if="type == \'arrow\'">',
					'{site_name}',
				'</tpl>', 
				'</td>',
				'\n',
				'				</tr>',
				'\n',
				'				<tr>',
				'\n',
				'					<td class="act-sdd-title_callsfrom">',
				'<tpl if="type == \'arrow\'">',
					'to',
				'</tpl>', 
				'</td>',
				'\n',
				'					<td class="act-sdd-title_items">',
				'<tpl if="type == \'arrow\'">',
					'{peersite_name}',
				'</tpl>', 
				'</td>',
				'\n', '				</tr>',
				'\n', '			</table>', '\n', '		</td>',
				'\n', '	</tr>', '\n', '</table>', '\n'
			);
		}

		if (!ts.dataTableTpl)
		{
			ts.dataTableTpl = new Ext.XTemplate(
				'<table class="act-sdd-data_table" id="{id_prefix}data_table_id">\n',
				'<colgroup span=7"/><colgroup><col width="*"/></colgroup>',
				
				'<tr>\n',
					
				'	<td rowspan="3" id="{id_prefix}col0_id">&nbsp;</td>\n',

					
				'	<td colspan=4 id="{id_prefix}col1_header_id" class="act-sdd-column_header">',
						  	'<span id="{id_prefix}col1_title_id" class="act-sdd-column_title">{col1_title}</span>',
						  	'<span id="{id_prefix}col1_intervalinfo_id" class="act-sdd-stats_daterange">&nbsp;</span>',
					'</td>\n',

					
				'	<td id="{id_prefix}col2_header_id" class="act-sdd-column_header">',
					'<span id="{id_prefix}col2_title_id" class="act-sdd-column_title">&nbsp;</span>',
					'</td>',

					
				'	<td id="{id_prefix}col3_header_id" class="act-sdd-column_header">',
					'<span id="{id_prefix}col3_title_id" class="act-sdd-column_title">&nbsp;</span>',
					'</td>',
					'<td/>',
				'</tr>\n',

				
				'<tr>\n',
					
				'	<td colspan=4 id="{id_prefix}col1_header_id" class="act-sdd-timeinfo">',
						  	'<span id="{id_prefix}col1_timeinfo_id" class="act-sdd-stats_daterange">&nbsp;</span>',
					'</td>\n',

					
				'	<td rowspan="2" id="{id_prefix}col2_header_id" class="act-sdd-timeinfo">',
					'<span id="{id_prefix}col2_timeinfo_id" class="act-sdd-stats_daterange">&nbsp;</span>',
					'</td>',

					
				'	<td rowspan="2" id="{id_prefix}col3_header_id" class="act-sdd-timeinfo">',
					'<span id="{id_prefix}col3_timeinfo_id" class="act-sdd-stats_daterange">&nbsp;</span>',
					'</td>',
					'<td/>',
				'</tr>\n',

				
				'<tr>\n',

				
				'<tpl if="totals_mode == true">',
					'<td class="act-sdd-topheader_noflag" id="{id_prefix}col1_header1_id">Total</td>\n',
					'<td class="act-sdd-topheader" id="{id_prefix}col1_header2_id">Avg</td>\n',
					'<td class="act-sdd-topheader" id="{id_prefix}col1_header3_id">Min</td>\n',
					'<td class="act-sdd-topheader" id="{id_prefix}col1_header4_id">Max</td>\n',
				'</tpl>', 
				'<tpl if="totals_mode == false">',
					'<td class="act-sdd-topheader{avg_postfix}" id="{id_prefix}col1_header1_id">Avg</td>\n',
					'<td class="act-sdd-topheader{min_postfix}" id="{id_prefix}col1_header2_id">Min</td>\n',
					'<td class="act-sdd-topheader{max_postfix}" id="{id_prefix}col1_header3_id">Max</td>\n',
					'<td class="act-sdd-topheader{std_dev_postfix}" id="{id_prefix}col1_header4_id">95%</td>\n',
				'</tpl>', 

					
				'</tr>\n',

				'<tpl for="statistics">',

					
					'<tr id="{id_prefix}{statistic_id}_header_row_id">\n',
						'<td class="act-sdd-statheader_title" colspan="7" id="{id_prefix}{statistic_id}_header_cell_id">{statistic_name}</td>\n',
					'</tr>\n',

					'<tpl for="parts">',
						'<tr id="{parent.id_prefix}{row_id}_data_row">\n',

							
							'<td style="width:1px;"><table cellspacing=0 cellpadding=0 class="act-sdd-labels"><tr>',
							'<tpl if="selected == true">',
								'<td id="{parent.id_prefix}{row_id}header" class="act-sdd-label{style_suffix}">',
								'{label}</td>\n',
							'</tpl>', 
							'<tpl if="selected == false">',
								'<td id="{parent.id_prefix}{row_id}header" class="act-sdd-label{style_suffix}_disabled">',
								'{label}</td>\n',
							'</tpl>', 
							'</tr></table></td>',

							
							'<td id="{parent.id_prefix}{row_id}_col1_1" class="act-sdd-{[this.summaryValueClassName(values.selected)]}">',
								'<span id="{parent.id_prefix}{row_id}_col1_1_value" class="act-sdd-datavalue">&nbsp;</span>',
								'<span id="{parent.id_prefix}{row_id}_col1_1_unit" class="act-sdd-unit">&nbsp;</span>',
							'</td>\n',
							'<td id="{parent.id_prefix}{row_id}_col1_2" class="act-sdd-{[this.summaryValueClassName(values.selected)]}">',
								'<span id="{parent.id_prefix}{row_id}_col1_2_value" class="act-sdd-datavalue">&nbsp;</span>',
								'<span id="{parent.id_prefix}{row_id}_col1_2_unit" class="act-sdd-unit">&nbsp;</span>',
							'</td>\n',
							'<td id="{parent.id_prefix}{row_id}_col1_3" class="act-sdd-{[this.summaryValueClassName(values.selected)]}">',
								'<span id="{parent.id_prefix}{row_id}_col1_3_value" class="act-sdd-datavalue">&nbsp;</span>',
								'<span id="{parent.id_prefix}{row_id}_col1_3_unit" class="act-sdd-unit">&nbsp;</span>',
							'</td>\n',
							'<td id="{parent.id_prefix}{row_id}_col1_4" class="act-sdd-{[this.summaryValueClassName(values.selected)]}">',
								'<span id="{parent.id_prefix}{row_id}_col1_4_value" class="act-sdd-datavalue">&nbsp;</span>',
								'<span id="{parent.id_prefix}{row_id}_col1_4_unit" class="act-sdd-unit">&nbsp;</span>',
							'</td>\n',
							'<td id="{parent.id_prefix}{row_id}_col2" class="act-sdd-data_regular_cell">',
								'<span id="{parent.id_prefix}{row_id}_col2_value" class="act-sdd-datavalue">&nbsp;</span>',
								'<span id="{parent.id_prefix}{row_id}_col2_unit" class="act-sdd-unit">&nbsp;</span>',
							'</td>\n',
							'<td id="{parent.id_prefix}{row_id}_col3" class="act-sdd-data_regular_cell">',
								'<span id="{parent.id_prefix}{row_id}_col3_value" class="act-sdd-datavalue">&nbsp;</span>',
								'<span id="{parent.id_prefix}{row_id}_col3_unit" class="act-sdd-unit">&nbsp;</span>',
							'</td>\n',
							'<td/>',
						'</tr>\n',
					'</tpl>',	
				'</tpl>',	

				'</table>\n\n',
				{
					summaryValueClassName: function(selected)
					{
						if (selected)
							return 'data_summary_cell';
						else
							return 'data_summary_cell_disabled';
					}
				}
			);
		}

		for (var k in ts)
		{
			var t = ts[k];
			if (t && typeof t.compile == 'function' && !t.compiled)
			{
				t.disableFormats = true;
				t.compile();
			}
		}

		this.templates = ts;
	},

	getStatTypeName : function(statID)
	{
		var substatMetadata = com.actional.DataStore.statList.getSubStatMetadata(statID);
		var statMetadata = com.actional.DataStore.statList.getStatMetadata(substatMetadata.statid);
		return statMetadata.name;
	},

	supportsTotals : function(statID)
	{
		var substatMetadata = com.actional.DataStore.statList.getSubStatMetadata(statID);
		return 'total' == com.actional.DataStore.statList.getStatMetadata(substatMetadata.statid).substattype;
	}
};