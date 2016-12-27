

















Ext.namespace('com.actional.serverui.network');

/**
 * The Ext Menu popped up (and shared) by the Summary Graph Flash Widget(s)
 *
 * @lastrev fix37512 - use header menu item css class for header menu items.
 */

com.actional.serverui.network.SummaryMenu = Ext.extend(Ext.menu.Menu,
{
	itsStatId: undefined,
	itsLgStatId: undefined,
	itsOwnerId: undefined,
	itsIsNormBin: undefined,
	itsSubStatId : undefined,

	constructor: function(config, idprefix)
	{
		com.actional.serverui.network.SummaryMenu.superclass.constructor.call(this,Ext.applyIf(config,
		{
			id: idprefix + 'stat-section-config-menu',
			minWidth: 200,
			defaults:
			{
				handler: this.menuItemClickHandler,
				scope: this
			},
			items :
			[
				{
					id: 'stat-section-move-up',
					text: this.getLabel('moveup'),
					iconCls:'statsection_move_up_menu'
				},
				{
					id: 'stat-section-move-down',
					text: this.getLabel('movedown'),
					iconCls:'statsection_move_down_menu'
				},
				'-',
				{
					id: 'stat-section-arrow-width',
					text: this.getLabel('arrowWidth'),
					handler: this.arrowStatChanged,
					scope: this
				},

				config.arrowItemSeparator = new Ext.menu.Separator(),

				
				{
					text: '<b>' + this.getLabel('focusOn') + '</b>',
					cls: 'ext-menu-header-item',
					activeClass: '',
					disabled: true,
					disabledClass: ''
				},
				{
					id: 'AVERAGE',
					text: '&nbsp;&nbsp;&nbsp;' + this.getLabel('average'),
					group: 'substat',
					groupClass: 'x-menu-group-item',
					checked: true
				},
				{
					id: 'MINIMUM',
					text: '&nbsp;&nbsp;&nbsp;' + this.getLabel('minimum'),
					group: 'substat',
					groupClass: 'x-menu-group-item',
					checked: false
				},
				{
					id: 'MAXIMUM',
					text: '&nbsp;&nbsp;&nbsp;' + this.getLabel('maximum'),
					group: 'substat',
					groupClass: 'x-menu-group-item',
					checked: false
				},
				{
					id: 'DEVIATION',
					text: '&nbsp;&nbsp;&nbsp;' + this.getLabel('stddev'),
					group: 'substat',
					groupClass: 'x-menu-group-item',
					checked: false
				},
				{
					id: 'TOTAL',
					text: '&nbsp;&nbsp;&nbsp;' + this.getLabel('total'),
					group: 'substat',
					groupClass: 'x-menu-group-item',
					checked: false,
					hidden: true
				},
				'-',
				
				{
					text: '<b>' + this.getLabel('show') + '</b>',
					cls: 'ext-menu-header-item',
					activeClass: '',
					disabled: true,
					disabledClass: ''
				},
				{
					id: 'FULL',
					text: '&nbsp;&nbsp;&nbsp;' + this.getLabel('allValues'),


					group: 'displaymode',
					groupClass: 'x-menu-group-item',
					checked: true
				},
				{
					id: 'NORMAL',
					text: '&nbsp;&nbsp;&nbsp;' + this.getLabel('focusedValueOnly'),

					group: 'displaymode',
					groupClass: 'x-menu-group-item',
					checked: false
				},
				{
					id: 'COMPACT',
					text: '&nbsp;&nbsp;&nbsp;' + this.getLabel('focusedValueWithoutGraph'),

					group: 'displaymode',
					groupClass: 'x-menu-group-item',
					checked: false
				},
				{
					id: 'HIDDEN',
					text: '&nbsp;&nbsp;&nbsp;' + this.getLabel('nothing'),
					group: 'displaymode',
					groupClass: 'x-menu-group-item',
					checked: false
				}
			]
		}));
	},

	init : function(ownerId, statId, lgStatId, statName, currentDisplayMode, currentSubStat, isNormBin, showArrowMenu)
	{
		this.itsOwnerId = ownerId;
		this.itsStatId = statId;
		this.itsLgStatId = lgStatId;
		this.itsIsNormBin = isNormBin;
		this.itsSubStatId = currentSubStat;

		
		var curDisplayModeItem = Ext.getCmp(currentDisplayMode);
		if(curDisplayModeItem)
			curDisplayModeItem.setChecked(true);

		
		var curSubStatItem = Ext.getCmp(currentSubStat);
		if(curSubStatItem)
			curSubStatItem.setChecked(true);

		var subStatLabel = curSubStatItem.text.substr(3*6);  

		
		Ext.getCmp('stat-section-move-up').setText(this.getFormattedLabel('moveup', [statName]));
		Ext.getCmp('stat-section-move-down').setText(this.getFormattedLabel('movedown', [statName]));
		Ext.getCmp('stat-section-arrow-width').setText(this.getFormattedLabel('arrowWidth', [subStatLabel, statName]));
		Ext.getCmp('NORMAL').setText('&nbsp;&nbsp;&nbsp;' + this.getFormattedLabel('focusedValueOnly', [subStatLabel]));
		Ext.getCmp('HIDDEN').setText('&nbsp;&nbsp;&nbsp;' + this.getFormattedLabel('nothing', [statName]));

		
		Ext.getCmp('AVERAGE').setVisible(isNormBin);
		Ext.getCmp('MINIMUM').setVisible(isNormBin);
		Ext.getCmp('MAXIMUM').setVisible(isNormBin);
		Ext.getCmp('DEVIATION').setVisible(isNormBin);

		var arrowItem = Ext.getCmp('stat-section-arrow-width');
		if(arrowItem)
		{
			arrowItem.setVisible(showArrowMenu);
			if(this.arrowItemSeparator)
				this.arrowItemSeparator.setVisible(showArrowMenu);
		}

		
		var totalItem = Ext.getCmp('TOTAL');
		if(totalItem)
		{
			totalItem.setVisible(!isNormBin);
			totalItem.setChecked(!isNormBin);
		}

		
		Ext.getCmp('FULL').setVisible(isNormBin);
	},

	/**
	 * @lastrev fix36813 - remove call to this.getEl().getWidth().
	 */
	showMenuAt : function(x, y)
	{
		var parentBox = Ext.getCmp('summarypane' + this.itsOwnerId).getBox();
		this.showAt([(parentBox.x + x), (y + parentBox.y)]);
	},

	menuItemClickHandler : function(item, evt)
	{
		document.getElementById('SummaryGraph' + this.itsOwnerId).renderMenuEvents(this.itsStatId, item.id);
	},

	arrowStatChanged : function(item, evt)
	{


		OpenAjax.hub.publish('com.actional.serverui.statisticSelectionChanged',
				{
					statistic_id : this.itsLgStatId,

					source : 'summarymenu'
				});
	},

	renderMenu : function(x, y, ownerId, statId, lgStatId, statName, currentDisplayMode, currentSubStat, isNormBin, showArrowMenu)
	{
		this.init(ownerId, statId, lgStatId, statName, currentDisplayMode, currentSubStat, isNormBin, showArrowMenu);
		this.showMenuAt(x, y);
	},

	getFormattedLabel: function(key, values)
	{
		var value = this.getLabel(key);
		return new Ext.Template(value).applyTemplate(values);
	},

	getLabel: function(key)
	{
		return com.actional.serverui.technicalview.getMessage('overviewMap.statspane.summaryMenu.menuItem.' + key);
	}
});

com.actional.serverui.network.SummaryMenu.exportAsCsv = function(portletUniqueId,portletTitle,portletId)
{

	var location=contextUrl('')+"portal/operations/stats.jsrv?title="+escape(portletTitle)+"&id="+escape(portletId)+"&"+
			"&"+document.getElementById('SummaryGraph' + portletUniqueId).constructCsvQuery();

	window.location = location;

};

Ext.reg('com.actional.serverui.network.SummaryMenu', com.actional.serverui.network.SummaryMenu);

com.actional.serverui.network.statSectionConfigMenu = new com.actional.serverui.network.SummaryMenu({}, '');
