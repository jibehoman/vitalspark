


















Ext.namespace('com.actional.serverui.network');

/**
 * The Ext Menu popped up (and shared) by the TimeLine and Detail Popup scrollbars
 * One instance is created for each mode - NEXT and PREV
 *
 * @lastrev fix35592 - new class
 */

com.actional.serverui.network.ScrollBarMenu = Ext.extend(Ext.menu.Menu,
{

	/**
	* @cfg {String} id
	*
	* id of this menu instance
	*/

	/**
	* @cfg {String} mode
	*
	* mode in which this instance operates - 'NEXT' or  'PREV'
	*/
	constructor: function(config)
	{

		com.actional.serverui.network.ScrollBarMenu.superclass.constructor.call(this,Ext.applyIf(config,
		{
			minWidth: 80,
			defaults:
			{
				handler: this.clickHandler,
				scope: this,
				iconCls:'scrollbarmenu-no-icon'
			},
			cls: 'scrollbarmenu-no-vseparator',

			
			itsItems : undefined,

			
			itsCallerId : undefined

		}));


	},

	/**
	 * @lastrev fix37512 - renamed the header menu item css class name
	 */
	init: function(name, eventData)
	{
		var timeUnitList = null;

		try
		{
			timeUnitList =	com.actional.DataStore.timeUnits.getTimeUnitList();
		}
		catch (e)
		{
			
			
			
			
			return;
		}

		this.itsItems = [];

		for (var unitIndex in timeUnitList)
		{
			if(unitIndex == 0)
			{
				
				this.add({
					text: '<b>Jump to...</b>',
					canActivate: false,
					disabled: true,
					disabledClass: '',
					cls: 'ext-menu-header-item',
					style :
					{
						'padding-left' : '5px'
					},
					handler: null
				});

			}

			var unit = timeUnitList[timeUnitList.length -1 - unitIndex];

			
			if(unit && (unit.id != 'GATHER'))
			{
				var displayText = (this.mode == 'PREV')? 'Previous ' : 'Next ';
				displayText += unit.name;
				this.add({
						id: 'scrollbarmenu-jumpto-' + unit.id + '-' + this.mode,
						text: displayText,
						style :
						{
							'padding-left' : '5px'
						},
						unitId: unit.id
					});

				this.itsItems.push('scrollbarmenu-jumpto-' + unit.id + '-' + this.mode);

			}
		}

		
		if (this.mode == 'NEXT')
		{
			this.add({
					id: 'scrollbarmenu-jumpto-' + 'NOW' + '-' + this.mode,
					text: 'Now',
					style :
					{
						'padding-left' : '5px'
					},
					unitId: 'NOW'
				});
		}
	},


	isInited: function()
	{
		
		return  Ext.isArray(this.itsItems);
	},

	clickHandler: function(clickedItem)
	{
		var callerDom = Ext.get(this.itsCallerId).dom;

		if (callerDom)
		{
			callerDom.doJump(clickedItem.unitId, this.mode);
		}
	},

	adjustItems: function(timeUnitsToDisplay)
	{
		for (var i = (this.itsItems.length -1) ; i > -1; i--)
		{
			var item = Ext.getCmp(this.itsItems[i]);

			if(item)
			{
				var visible = (timeUnitsToDisplay.indexOf(item.unitId) > -1);
				item.setVisible(visible);
			}
		}
	},

	showMenu: function(callerId,
		mode,
		location,
		timeUnitsToDisplay)
	{
		this.itsCallerId = callerId;
		this.adjustItems(timeUnitsToDisplay);
		this.showAt(location);
	}


});

/**
 * Static getter function
 */
com.actional.serverui.network.ScrollBarMenu.getInstance = function(mode)
	{
		var instance = Ext.menu.MenuMgr.get('scrollbarmenu-' + mode);
		if (!instance)
		{
			instance  =
				new com.actional.serverui.network.ScrollBarMenu({
					 'id': 'scrollbarmenu-' + mode,
					  'mode' : mode});
		}
		if(!instance.isInited())
		{
			instance.init();
		}
		return instance;
	};

/**
 * Static function to display the menu.
 *
 * @param  callerId - id of the calling swf
 * @param  mode - NEXT or PREV
 * @param  location - location in the caller's stage, where the menu has to be popped up
 * @param  timeUnitsToDisplay - list of timeunits to be included in the menu. Others are hidden for this call
 */
com.actional.serverui.network.ScrollBarMenu.showMenu = function(
		callerId,
		mode,
		location,
		timeUnitsToDisplay)
	{
		var instance = com.actional.serverui.network.ScrollBarMenu.getInstance(mode);

		var callerCmp = Ext.get(callerId);

		if (!callerCmp)
		{
			return;
		}

		var callerBox = callerCmp.getBox();

		var menuLocation = [(callerBox.x + location.x), (callerBox.y  + location.y)];

		instance.showMenu(callerId, mode, menuLocation, timeUnitsToDisplay);
	};

Ext.reg('com.actional.serverui.network.ScrollBarMenu', com.actional.serverui.network.ScrollBarMenu);


