

















Ext.namespace('com.actional.serverui.network');



/**
 *
 * @class com.actional.serverui.network.NetworkActionBar
 * @extends Ext.Toolbar
 *
 * @lastrev fix38515 - extend this class from FloatingToolbar & remove unwanted methods.
 */
com.actional.serverui.network.NetworkActionBar = Ext.extend(com.actional.ui.FloatingToolbar,
{

	/**
	 * This field stores the current time selection information. More precisely the published data from
	 * 'com.actional.serverui.timeSelectionChanged' event.
	 *
	 * this field is undefined until a first TimeSelection event has been received
	 */
	itsCurrentTimeSelection: undefined,
	itsSendFetchInfoInStandBy: false,

	/**
	* @cfg {Boolean} hideactioncombo (Optional) defaults to false
	*
	* Set to true to hide the actioncombo
	*
	*/

	/**
	* @cfg {Boolean} hideconfigurehyperlinks (Optional) defaults to false
	*
	* Set to true to hide all hyperlinks that jump to pages that configures
	* the product
	*/

	constructor: function(config)
	{
		this.addEvents(
			/**
			 * @event openMapExplorer
			 *
			 * Fires to signify that we want to show the path explorer (map explorer)
			 */
			"openMapExplorer",

			/**
			 * @event closeMapExplorer
			 *
			 * Fires to signify that we want to close the path explorer and return to the map
			 */
			"closeMapExplorer"
		);

		var actions = [];

		actions.push([3, 'Show related Alerts', 'admin/operations/alerts/alert_group_list.jsp?siteKeyId=']);



		if(!config.hideconfigurehyperlinks)
		{
			actions.push([1, 'Configure this Node', 'admin/services/nodes/node_details.jsp?task=edit&keyID=']);
			actions.push([4, 'Provision this Node', 'admin/deployment/provisioning/provision_list.jsp?preSelect=']);
		}

		var actions_store = new Ext.data.SimpleStore({
						fields: ['op', 'action', 'url'],
						data : actions
						});

		
		this.itsIdPrefix = (config.mode == 0) ? "main-" : "popup-";

		com.actional.serverui.network.NetworkActionBar.superclass.constructor.call(this, Ext.applyIf(config,
		{
			id: this.itsIdPrefix + 'actionbar',
			width: config.hideactioncombo ? 80 : 210,
			hidden: true,
			autoPositionAt: [25, 5],
			items: function()
			{
				var items =
				[{
					id: this.itsIdPrefix + 'actionbar-map-btn',
					xtype: 'tbbutton',
					iconCls: 'network_map_btn',
					enableToggle: true,
					allowDepress: false,
					pressed: (config.mode == 0) ? true : false,
					toggleHandler: this.onSwitchNetworkMode,
					scope: this,
					toggleGroup: 'network_modes',
					tooltip: com.actional.serverui.technicalview.getMessage('overviewMap.actionbar.tooltip.displayNetworkMap'),
					tooltipType: 'title'
				},
	/*
				' ',
				' ',
				{
					id: this.itsIdPrefix + 'actionbar-tree-btn',
					xtype: 'tbbutton',
					iconCls: 'item_tree_btn',
					enableToggle: true,
					allowDepress: false,
					pressed: (config.mode == 1) ? true : false,
					toggleHandler: this.onSwitchNetworkMode,
					scope: this,
					toggleGroup: 'network_modes',
					tooltip: 'Display Item Tree',
					tooltipType: 'title'
				},
	*/
				' ',
				' ',
				{
					id: this.itsIdPrefix + 'actionbar-path-btn',
					xtype: 'tbbutton',
					iconCls: 'path_explorer_btn',
					enableToggle: true,
					allowDepress: false,
					pressed: (config.mode == 2) ? true : false,
					toggleHandler: this.onSwitchNetworkMode,
					scope: this,
					toggleGroup: 'network_modes',
					tooltip: com.actional.serverui.technicalview.getMessage('overviewMap.actionbar.tooltip.displayPathExplorer'),
					tooltipType: 'title'
				}];

				if (!config.hideactioncombo)
				{
		                        var spacer = new Ext.Toolbar.Spacer();
		                        var separator = new Ext.Toolbar.Separator();

					items = items.concat([
						spacer,
						spacer,
						separator,
						spacer,
						spacer,
						{
							id: this.itsIdPrefix + 'more-actions',
							xtype: 'combo',
							store: actions_store,
							displayField: 'action',
							mode: 'local',
							triggerAction: 'all',
							width: 130,
							listWidth: 130,
							forceSelection: true,
							editable: false,
							value: 'More actions',
							listeners:
							{
								'select' : this.onActionSelect,
								'expand' : this.onExpandActions,
								scope: this
							}
						}]);
				}
				return items;
			}.call(this)
		}));

		OpenAjax.hub.subscribe('com.actional.serverui.siteSelectionChanged',
				this.onSiteSelectionChanged, this, {source:'networkactionbar'});

		OpenAjax.hub.subscribe('com.actional.serverui.timeSelectionChanged',
				this.onTimeSelectionChanged, this, {source:'networkactionbar'});

		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: 'networkactionbar',
			events	: ['com.actional.serverui.siteSelectionChanged',
			      	   'com.actional.serverui.timeSelectionChanged']
		});
	},

	/**
	 * @lastrev fix36272 - new method.
	 */
	onTimeSelectionChanged : function(event, publisherData, subscriberData)
	{
		this.itsCurrentTimeSelection = Ext.apply({}, publisherData);

		if(this.itsSendFetchInfoInStandBy)
		{
			this.itsSendFetchInfoInStandBy = false;
			this.sendFetchInfoRequest();
		}
	},

	
	defaultAction: function()
	{
		this.openMapExplorer(2);
	},

	onSwitchNetworkMode : function(button, state)
	{
		if(state == false)
			return;

		var btnId = button.getId();
		var modePos = btnId.indexOf('-') + 1;

		if (btnId.substring(modePos) == 'actionbar-tree-btn')
		{
			this.openMapExplorer(1);
		}
		else if(btnId.substring(modePos) == 'actionbar-path-btn')
		{
			this.openMapExplorer(2);
		}
		else 
		{
			this.fireEvent('closeMapExplorer');
		}
	},

	onActionSelect : function(combo, record, index)
	{
		var url = contextUrl(record.get('url'));
		url += this.itsNetworkSelectionId;

		if(this.itsNetworkPeerSelectionId)
			url += "&peerSiteKeyId=" + this.itsNetworkPeerSelectionId;

		window.location.href = url;
	},

	onExpandActions : function(combo, a, b)
	{
		var store = combo.store;
		store.filterBy(this.filterChoices, this);
	},

	/** @lastrev fix36334 - look at what was returned by the task instead of calling "isNode()"
	 */
	filterChoices : function(record, given_id)
	{
		var op = record.get('op');

		switch(op)
		{
			case 1:
				if(this.itsSiteConfigurable)
					return true;
				break;

			case 2:
				if(this.itsNetworkSelectionType != 'arrow')
					return true;
				break;

			case 3: 
				   return true;

			case 4: 
				if(this.itsSiteProvisionable)
				   return true;
				break;
		}

		return false;
	},

	/** @lastrev fix36334 - renamed method; modify behavior to follow NetworkComponentHandle.java a bit more
	 *                      -- add warning to avoid doing that
	 */
	isPotentialNode:function()
	{
		
		

		
		
		
		if(		(this.itsNetworkSelectionType == 'arrow') ||
				 this.itsNetworkSelectionId.indexOf('^') == 0 || 
				 this.itsNetworkSelectionId.indexOf('LNODE') == 0 || 
				 this.itsNetworkSelectionId.indexOf('GRP') == 0)
			return false;
		return true;
	},

	/**
	 * @lastrev fix36272 - Send the time selection information as parameters.
	 */
	sendFetchInfoRequest : function()
	{
		if(this.itsCurrentTimeSelection)
		{
			Ext.Ajax.request(
				{
					url: contextUrl('portal/operations/overview/networkimage.xml'),
					method: 'GET',
					params:
					{
						source: this.id,
						type: 'layoutopts',
						getMenu:true,
						site: this.itsNetworkSelectionId,
						peersite: this.itsNetworkPeerSelectionId,
						ttype: 'interval',
						tstart: this.itsCurrentTimeSelection.selection_t0,
						tend: this.itsCurrentTimeSelection.selection_t1
					},
					scope: this,
					callback : this.sendFetchInfoCallback
				} );
		}
		else
		{
			
			this.itsSendFetchInfoInStandBy = true;
		}
	},

	/** @lastrev fix36334 - keep what is returned by the task in itsSiteConfigurable
	 */
	sendFetchInfoCallback : function(options, success,responseObject)
	{
		if(!success)
		{
			this.itsSiteProvisionable = false;
			this.itsSiteConfigurable = false;
			return;
		}
		var result = eval(responseObject.responseText);
		this.itsSiteProvisionable = result.provision;
		this.itsSiteConfigurable = result.configure;
	},

	/** @lastrev fix36334 - also reset itsSiteConfigurable; isNode() renamed to isPotentialNode()
	 */
	onSiteSelectionChanged : function(event, publisherData, subscriberData)
	{
		var actionCombo = Ext.getCmp(this.itsIdPrefix + 'more-actions');
		var btnNetworkMap = Ext.getCmp(this.itsIdPrefix + 'actionbar-map-btn');
		var btnPathExplorer = Ext.getCmp(this.itsIdPrefix + 'actionbar-path-btn');

		if(!btnNetworkMap || !btnPathExplorer)
			return;

		
		this.itsNetworkSelectionId = publisherData.site_id;
		this.itsNetworkSelectionType = publisherData.type;

		
		if(this.itsNetworkSelectionType == 'arrow')
			this.itsNetworkPeerSelectionId = publisherData.peersite_id;
		else
			this.itsNetworkPeerSelectionId = '';

		this.itsSiteProvisionable = false;
		this.itsSiteConfigurable = false;

		
		if (publisherData.type == 'nothing')
		{
			
			this.hide();
		}
		else
		{
			if(this.hidden)
			{
				
				
				this.show();
				this.getEl().fadeIn({
						endOpacity: 1,
						easing: 'easeNone',
						duration: 0.5});
			}

			
			if(this.isPotentialNode())
				this.sendFetchInfoRequest();
		}
	},

	openMapExplorer: function(mode)
	{
            this.fireEvent('openMapExplorer');
	}
});

Ext.reg('com.actional.serverui.network.NetworkActionBar', com.actional.serverui.network.NetworkActionBar);

