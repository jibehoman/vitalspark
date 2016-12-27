

















Ext.ns('com.actional.serverui');

/**
 * This class creates the menu for the topx portlets.
 *
 * lastrev 	fix38850 - add id to export to url menu component to allow modifying its url; add helper to do it
 */
com.actional.serverui.TopXPortletMenu = Ext.extend(Ext.menu.Menu,
{
	constructor: function(config)
	{
		config = config || {};

		config.id = config.id || Ext.id();

		var items = [] ;


		
		this.createTopBottomUrls(items, config);

		
		if (config.selectedNum && config.displayNumUrl && config.numbersArray)
		{
			items.push(this.createDisplayNumMenu(config));
			items.push('-');
		}

		
		this.createShowHideChartLabelsMenu(items, config);

		
		this.createAddToDashboardMenu(items, config);

		
		this.createExportUrls(items, config);

		var hasIcons = false;

		if ((config.topUrl && config.bottomUrl) || (config.showChartLabelUrl && config.hideChartLabelUrl))
		{
			hasIcons = true;
		}

		var cls = hasIcons ? '' : 'ext-menu-no-vseperator';
		var defaults = {};
		if (!hasIcons)
		{
			defaults =
			{
				style:
				{
					'padding-left' : '5px'
				}
			};
		}

		com.actional.serverui.TopXPortletMenu.superclass.constructor.call(this, Ext.applyIf(config,
		{
			items: items,
			cls: cls,
			defaults: defaults
		}));
	},

	createTopBottomUrls: function(items, config)
	{
		if (config.topUrl && config.bottomUrl)
		{
			items.push(
			{
				text: 'Top',
				href: config.topUrl,
				checked: config.topChecked,
				group: 'top-bottom-' + config.id
			});

			items.push(
			{
				text: 'Bottom',
				href: config.bottomUrl,
				checked: !config.topChecked,
				group: 'top-bottom-' + config.id
			});

			items.push('-');
		}
	},

	createAddToDashboardMenu: function(items, config)
	{
		if (config.addToDashboardUrl)
		{
			items.push(
			{
				text: 'Add To Dashboard',
				href: config.addToDashboardUrl
			});

			items.push('-');
		}
	},

	createDisplayNumMenu: function(config)
	{
		var url = config.displayNumUrl;
		var selectedNum = config.selectedNum;
		var id = config.id;
		var nums = config.numbersArray;

		var items = [];

		Ext.each(nums, function(item, index)
		{
			items.push(
			{
				text: item,
				href: url + '&listcount=' + item,
				group: 'display-number-' + id,
				checked: (selectedNum == item)
			});
		});

		return {
			text: 'Number to Display:',
			menu:
			{
				items: items
			}
		};
	},

	createShowHideChartLabelsMenu: function(items, config)
	{
		if (config.showChartLabelUrl && config.hideChartLabelUrl)
		{
			items.push(
			{
				text: 'Show Chart Labels',
				href: config.showChartLabelUrl,
				checked: config.showChartLabel,
				group: 'show-hide-chart-label-' + config.id
			});

			items.push(
			{
				text: 'Hide Chart Labels',
				href: config.hideChartLabelUrl,
				checked: !config.showChartLabel,
				group: 'show-hide-chart-label-' + config.id
			});

			items.push('-');
		}
	},

	createExportUrls: function(items, config)
	{
		if (config.exportUrl)
		{
			items.push(
			{
				text: 'Export as URL',
				href: config.exportUrl
			});
		}

		if (config.exportCsvUrl)
		{
			items.push(
			{
				id: config.id + '_exportCsvUrl',
				text: 'Export Data as CSV',
				href: config.exportCsvUrl
			});
		}

		if (config.exportPctUrl)
		{
			items.push(
			{
				text: 'Export to <i>Control Tower</i>...',
				href: config.exportPctUrl
			});
		}

		if (config.publishPctUrl)
		{
			items.push(
			{
				text: 'Publish to <i>Control Tower</i>...',
				href: config.publishPctUrl
			});
		}

		if (config.publishAsPortletUrl)
		{
			items.push(
			{
				text: 'Publish as Portlet',
				href: config.publishAsPortletUrl
			});
		}
	}
});

/**
 * This class creates the chart type menu for the topx portlets.
 *
 * lastrev fix37512 - new class.
 */
com.actional.serverui.TopXPortletChartTypeMenu = Ext.extend(Ext.menu.Menu,
{
	constructor: function(config)
	{
		var items = [];

		var labels =
		[
			'Show as table',
			'Show as Column Chart',
			'Show as Pyramid',
			'Show as Pie Chart',
			'Show as Plot Chart',
			'Show as Bar Chart'
		];

		var chartTypes =
		[
			'icon_grid',
			'icon_col',
			'icon_pyr',
			'icon_pie',
			'icon_plot',
			'icon_bar'
		];

		var isExternal = config.isExternal || true;

		for (var i = 0; i < labels.length; i++)
		{
			items.push(
			{
				text: labels[i],
				iconCls: 'act-topx-' + chartTypes[i] + (isExternal ? '_dark' : ''),
				href: "javascript:changeDisplay('" + config.prefId + "', " + i + ", '" + config.prefKey + "');"
			});
		}

		com.actional.serverui.TopXPortletChartTypeMenu.superclass.constructor.call(this, Ext.applyIf(config,
		{
			items: items
		}));
	}
});

/**
 * The extjs menu which appears on dashboard portlets.
 *
 * @lastrev fix37512 - new class.
 */
com.actional.serverui.TopXPortletDashboardMenu = Ext.extend(Ext.menu.Menu,
{
	constructor: function(config)
	{
		var items = [];

		items.push(
		{
			text: 'Left',
			iconCls: 'act-dashboard-menu-left',
			href: config.leftUrl
		});

		items.push(
		{
			text: 'Right',
			iconCls: 'act-dashboard-menu-right',
			href: config.rightUrl
		});

		items.push(
		{
			text: 'Up',
			iconCls: 'act-dashboard-menu-up',
			href: config.upUrl
		});

		items.push(
		{
			text: 'Down',
			iconCls: 'act-dashboard-menu-down',
			href: config.downUrl
		});

		items.push('-');

		items.push(
		{
			text: 'Remove',
			href: config.removeUrl
		});

		items.push('-');

		items.push(
		{
			text: 'Properties',
			href: config.propertiesUrl
		});

		if (config.showChartLabelsUrl && config.hideChartLabelsUrl)
		{
			items.push('-');

			items.push(
			{
				text: 'Show Chart Labels',
				href: config.showChartLabelsUrl,
				checked: config.showChartLabels,
				group: 'show-hide-chart-labels' + config.id
			});

			items.push(
			{
				text: 'Hide Chart Labels',
				href: config.hideChartLabelsUrl,
				checked: !config.showChartLabels,
				group: 'show-hide-chart-labels' + config.id
			});
		}

		if (config.optionsUrl)
		{
			items.push('-');

			items.push(
			{
				text: 'Options...',
				href: config.optionsUrl
			});
		}

		com.actional.serverui.TopXPortletDashboardMenu.superclass.constructor.call(this, Ext.applyIf(config,
		{
			items: items
		}));
	}
});

/**
 * This method shows the menu (identified by the id) at the provided
 * element.
 *
 * @param id - the id of the Ext Menu Component.
 * @param div - the html div element which has been clicked to open this menu.
 *
 * lastrev fix37512 - new method.
 */
com.actional.serverui.TopXPortletMenu.displayAt = function(id, div)
{
	var menu = Ext.getCmp(id);

	
	
	menu.render();

	var pos = Ext.fly(div).getXY();
	pos[0] = pos[0] - menu.getWidth() + Ext.fly(div).getWidth();
	pos[1] += 20;

	menu.showAt(pos);
};

/**
 * This method shows the menu (identified by the id) at the provided
 * element.
 *
 * @param id - the id of the Ext Menu Component.
 * @param div - the html div element which has been clicked to open this menu.
 *
 * lastrev fix38850 - new method.
 */
com.actional.serverui.TopXPortletMenu.setMenuItemHref = function(menuItemId, url)
{
	var cmp = Ext.getCmp(menuItemId);
	
	if(!cmp)
		return;
	
	
	cmp.href = url;
	
	if(!cmp.rendered)
		return;
	
	
	cmp.getEl().set({ href:url });
};
