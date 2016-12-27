

















Ext.namespace('com.actional.serverui.network');

/**
 * The Ext Menu popped up by the Item Breakdown to select a Statistic & sub-stat
 *
 */

com.actional.serverui.network.StatisticsMenu = Ext.extend(Ext.menu.Menu,
{
	/**
	* @cfg {String} statsetid
     	*
     	* the statsetid to use for the statistic list
     	*/

	/**
	* @cfg {String} selectedid
     	*
     	* the selectedstatid to use to pre-select a statistic in the list
     	*/

	constructor: function(config)
	{
		com.actional.serverui.network.StatisticsMenu.superclass.constructor.call(this,Ext.applyIf(config,
		{
			ignoreParentClicks: false,
			id: 'statistics-menu',
			selectedstatid: '',
			defaults:
			{
				handler: this.menuItemClickHandler,
				scope: this
			}
		}));

		var statlist = com.actional.DataStore.statList.getStatSet(this.statsetid);

		for(var i=0, l = statlist.length; i < l; i++)
		{
			var statmeta = com.actional.DataStore.statList.getStatMetadata(statlist[i], true);
			var substats = statmeta.substats;
			var statSelected = false;
			if (this.selectedstatid &&
				(this.selectedstatid == statmeta.id || this.selectedstatid.indexOf(statmeta.id) >= 0))
			{
				statSelected = true;
			}
			var hasSubMenu = (substats.length > 1) ? true : false;

			this.addMenuItem({
				id: statmeta.id,
				
				
				text: statmeta.name + "&nbsp;&nbsp;&nbsp;&nbsp;",
				checked: statSelected,
				group: 'stat',
				hideOnClick : !hasSubMenu,
				handler: hasSubMenu ? '' : this.menuItemClickHandler,
				groupClass: 'x-menu-group-item',
				menu: (substats.length > 1) ? this.createSubMenu(substats, statmeta.id) : ''
			});
		}
	},

	createSubMenu : function (stats, id)
	{
		return new Ext.menu.Menu({
				id: 'substat-menu-'+id,
				defaults:
				{
					handler: this.subMenuItemClickHandler,
					scope: this,
					group: 'substat',
					groupClass: 'x-menu-group-item'
				},

				items:
				[{
					id: stats[0].id,
					text: stats[0].name,
					checked: this.selectedstatid == stats[0].id
				},
				{
					id: stats[2].id,
					text: 'Min / Max',
					checked: this.selectedstatid == stats[2].id
				},
				{
					id: stats[3].id,
					text: stats[3].name,
					checked: this.selectedstatid == stats[3].id
				}]
			  });
	},

	/**
	 * This method re-inits the already created menu with the given config.
	 *
	 * @lastrev fix36813 - new method.
	 */
	initAndShow: function(config, el, align)
	{
		var statlist = com.actional.DataStore.statList.getStatSet(this.statsetid);
		this.initMenu(config, statlist);
		this.show(el, align);

	},

	/**
	 * @lastrev fix36813 - new method.
	 */
	initMenu: function(config, statlist)
	{
		for(var i=0, l = statlist.length; i < l; i++)
		{
			var statmeta = com.actional.DataStore.statList.getStatMetadata(statlist[i], true);
			var substats = statmeta.substats;
			var statSelected = false;
			if (config.selectedstatid &&
				(config.selectedstatid == statmeta.id || config.selectedstatid.indexOf(statmeta.id) >= 0))
			{
				statSelected = true;
			}
			var hasSubMenu = (substats.length > 1) ? true : false;

			var menuItem = this.findById(statmeta.id);
			menuItem.setChecked(statSelected, true);

			if (hasSubMenu)
			{
				this.initSubMenu(menuItem.menu, substats, config.selectedstatid);
			}
		}
	},

	/**
	 * @lastrev fix36813 - new method.
	 */
	initSubMenu: function(subMenu, stats, selectedstatid)
	{
		subMenu.findById(stats[0].id).setChecked((selectedstatid == stats[0].id), true);
		subMenu.findById(stats[2].id).setChecked((selectedstatid == stats[2].id), true);
		subMenu.findById(stats[3].id).setChecked((selectedstatid == stats[3].id), true);
	},

	menuItemClickHandler : function(item, evt)
	{
	
		Ext.getCmp('item-breakdown-pane').onStatMenuSelectionChanged(evt, item.id, this);
	},

	subMenuItemClickHandler : function(item, evt)
	{
		var parentmenu = Ext.menu.MenuMgr.get('statistics-menu');

		if(parentmenu.activeItem)
			parentmenu.activeItem.setChecked(true);
		else
		{
			var parentItems = parentmenu.items.items;

			for (var i = 0, len = parentItems.length; i < len; i++)
			{
				if (item.id.indexOf(parentItems[i].id) >= 0)
				{
					parentItems[i].setChecked(true);
					break;
				}
			}
		}

		this.statSelectionHandler.call(this.statSelectionScope, evt, item.id, this);
	}
});

Ext.reg('com.actional.serverui.network.StatisticsMenu', com.actional.serverui.network.StatisticsMenu);

/**
 * Public static method that renders (opens) a StatisticsMenu
 *
 * @lastrev fix36813 - create only one menu per statsetid & reuse it subsequently.
 */
com.actional.serverui.network.StatisticsMenu.showStatististicsMenu = function(el, config)
{
	var statsMenu = com.actional.serverui.network.StatisticsMenu;
	if (!statsMenu.instance)
	{
		statsMenu.instance = {};
	}

	if (!statsMenu.instance[config.statsetid])
	{
		statsMenu.instance[config.statsetid] = new com.actional.serverui.network.StatisticsMenu(config);
		statsMenu.instance[config.statsetid].show(el, 'br-tr');
		return;
	}

	statsMenu.instance[config.statsetid].initAndShow(config, el, 'br-tr');
};
