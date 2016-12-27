

















Ext.namespace('com.actional.serverui.network');


var cookieSettingsPrefix = '';

/**
 * @class com.actional.serverui.network.NetworkBrowser
 * @extends Ext.Panel
 *
 * @lastrev fix38531 - EventOwner api calls proper ordering
 */
com.actional.serverui.network.NetworkBrowser = Ext.extend(Ext.Panel,
{
    /**
     * @cfg {String} statsetid
     *
     * the statsetid to use for the statistic list
     */

    /**
     * @cfg {String} domainid (Optional)
     *
     * The domainid to use. pass "EVENT" to make the controls wait for events to get
     * a domainid. For the main network, you do not need to define it (or use null)
     */

    /**
     * @cfg {Boolean} hideconfigurehyperlinks (Optional) defaults to false
     *
     * Set to true to hide all hyperlinks that jump to pages that configures
     * the product
     */

    /**
     * @cfg {Boolean} noexternalhyperlinks (Optional) defaults to false
     *
     * Set to true to hide all hyperlinks that jump to other pages in the
     * product.
     */

    /**
     * @cfg {Boolean} hideactioncombo (Optional) defaults to false
     *
     * Set to true to hide the "action" drop down list appearing
     * in the action toolbar. (implicit with noexternalhyperlinks)
     */

    /**
     * @cfg {Boolean} explorer_expandAllMode (Optional)
     *
     * Pass true to enable "auto expand" option in the Path Explorer.
     * This is typically enabled for displaying flowmaps.
     * (Alert Analyzer or Mindreef's Workspace)
     */

    /**
     * @cfg {Boolean} isprocessflow (Optional)
     *
     * pass true to show bp details page (needed by Path Explorer)
     */

    /**
     * @cfg {Boolean} showloglinks (Optional) defaults to false
     *
     * Set to true to show hyperlinks that jump to audit and
     * application log pages (used on alert anaylzer)
     *
     */

    /**
     * @cfg {Boolean} disableeditlayout (Optional)
     *
     * If true, the Edit Layout functionality will be removed.
     *
     */

    /**
     * @cfg {Boolean} disablegrouping (Optional)
     *
     * If true, the grouping combo will be disabled and the link
     * will not be shown
     *
     */

    /**
     * @cfg {Boolean} disabledormantinfo (Optional) defaults to false
     *
     * Set to true to hide the "dormant since.." hyperlink
     * Also disables the dormantThreshold filtering option.
     *
     */

   /**
     * @cfg {String} locateInMapId (Optional)
     *
     * The ID of a network item to select upon rendering. This must be an ID
     * understood by the siteSelectionChanged event (e.g. not a Logical ID).
     * The appropriate Network Map will be displayed automatically, if needed,
     * in order to make the selection.
     */

	itsSiteSelectionChangedEventOwner : undefined,
	itsStatsSelectionChangedEventOwner : undefined,
	itsSplitterChangedEventOwner : undefined,
	itsMiscOptionsChangedEventOwner : undefined,
	itsStatPane: undefined,
	itsBreakdownPane: undefined,
	itsEventSourceName: 'networkbrowser',
	itsPathExplorer: null,
	itsToolbar: null,

	itsSplitterOptions:
	{
		
		showStatisticsPane: true,
		showBreakdownPane: false,
		statisticsPaneSize: 225,
		itemBreakdownPaneSize: 100
	},

	itsMiscOptions:
	{
		showAllPathHints: true
	},

	constructor: function(config)
	{
		cookieSettingPrefix = config.settingPrefix;

		this.loadSplittersSettings();

		var manager = com.actional.serverui.OptionsManager.getManager();
		if(manager)
			
			manager.insertTab({
					xtype:'com.actional.serverui.NetworkOptionsTab',
					statsetid: config.statsetid,
					disabledormantthreshold: config.disabledormantinfo,
					disabletimeseries: config.disabletimeseries,
					disablegrouping: config.disablegrouping,
					tabName: config.tabName
					}, 0);

		this.itsToolbar = new com.actional.serverui.network.NetworkBrowserToolbar({
											   showloglinks: config.showloglinks,
											   noexternalhyperlinks: config.noexternalhyperlinks,
											   hideconfigurehyperlinks: config.hideconfigurehyperlinks,
											   disabletimeseries: config.disabletimeseries,
											   domainid: config.domainid
											   });
		/**
		 * @lastrev fix38387 - collapse statistics pane when opened from technical view portlet
		 */
		com.actional.serverui.network.NetworkBrowser.superclass.constructor.call(this, Ext.applyIf(config,
		{
			border: false,
		    	layout:'border',
		    	tbar: this.itsToolbar,
        		listeners:
        		{
				deactivate: this.hidePathExplorer,
        			scope: this
        		},
		    	items:
		    	[{
		        	xtype: 'com.actional.serverui.network.Statspane',
				title: com.actional.serverui.technicalview.getMessage('overviewMap.statspane.title'),
				region:'east',
				margins: '3 0 0 0',
				animCollapse :false,
				collapsible: true,
				collapseMode:'mini',
				collapsed: config.hideStatisticsPane || !this.itsSplitterOptions.showStatisticsPane,
				split: true,
				useSplitTips: true,
				width: this.itsSplitterOptions.statisticsPaneSize,
				minSize: 225,
				maxSize: 400,
				statsetid: config.statsetid,
		        	id: 'stat-pane',
			        domainid: config.domainid,
			        noexternalhyperlinks: config.noexternalhyperlinks,
			        disabledormantinfo: config.disabledormantinfo,
			        disabletimeseries: config.disabletimeseries,
			        settingPrefix: config.settingPrefix,
				userPreferences:config.userPreferences,
		        	listeners:
		        	{
			        	render: function(component)
			        	{
			        		var bwrap = component.bwrap;

			        
			        

			        		bwrap.setVisibilityMode(1/*Element.VISIBILITY*/);
			        	}
		        	}
			},
			{
		        	region: 'center',
		        	margins: '3 0 0 0',
			        layout:'border',
				border: false,
			        items:
			        [{
		        		xtype: 'com.actional.serverui.network.ItemBreakdownpane',
		        		id: 'item-breakdown-pane',
				        title: com.actional.serverui.technicalview.getMessage('overviewMap.itemBreakdownPane.baseTitle'),
				        region: 'south',
				        collapsible: true,
					collapseMode:'mini',
					collapseFirst: false,
					collapsed: !this.itsSplitterOptions.showBreakdownPane,
					split: true,
					useSplitTips: true,
			        	height: this.itsSplitterOptions.itemBreakdownPaneSize,
				        minSize: 75,
			        	maxSize: 400,
					statsetid: config.statsetid,
					domainid: config.domainid
				},
			        {
			        	region: 'center',
			        	id: 'network-map-panel',
			        	layout: 'fit',
		        		plugins:
		        		[
		        			new com.actional.serverui.network.NetworkActionBar(
		        			{
		        				mode: 0, 
		        				id: 'map_actionbar',
		        				listeners:
	        					{
		        					openMapExplorer: this.showPathExplorer,
		        					closeMapExplorer: this.hidePathExplorer,
		        					scope: this
	        					},
	        					hideactioncombo: (config.hideactioncombo || config.noexternalhyperlinks),
	        					hideconfigurehyperlinks: config.hideconfigurehyperlinks
		        			})
		        		],
			        	items:[
				        {
				        	xtype: 'com.actional.Flash',
			        		objectId: 'network_overview_swf',
			        		swfUrl: contextUrl('portal/operations/network.swf?l='+PageState_pageid),  
			        		flashvars:
			        		{
			        			pageid: PageState_pageid,
			        			domainid: config.domainid,
		        				isprocessflow: config.isprocessflow,
			        			disableeditlayout: config.disableeditlayout,
			        			isie: Ext.isIE
			        		},
						onAwakening: this.onOverviewAwakening,
						onDoubleClickedItem: this.showPathExplorer,
						enableToolbarCtrls: this.enableToolbarCtrls,
						scope: this
			        	}]
			        }]
		    	}]
		}));

		this.itsStatPane = Ext.getCmp('stat-pane');
		this.itsBreakdownPane = Ext.getCmp('item-breakdown-pane');

		if(config.domainid == 'EVENT')
		{
			
			this.initAlertOccurenceSelection();
			this.itsToolbar.initAlertOccurenceSelection();
		}

		this.initSiteSelection(config.locateInMapId);
		this.initStatSelection();
		this.initPanesState();
		this.initMiscOptions();
	},

	initSiteSelection : function(locateInMapId)
	{
		
		this.itsSiteSelectionChangedEventOwner = new com.actional.EventDataOwner();
		this.itsSiteSelectionChangedEventOwner.addEvent('com.actional.serverui.siteSelectionChanged');
		this.itsSiteSelectionChangedEventOwner.finalSetup(this.itsEventSourceName);

		OpenAjax.hub.subscribe('com.actional.serverui.siteSelectionChanged',
			this.onSiteSelectionChanged,
			this,
			{source : this.itsEventSourceName});

		
		this.itsLocateInMapEventOwner = new com.actional.EventDataOwner();
		this.itsLocateInMapEventOwner.addEvent('com.actional.serverui.locateInMap');
		this.itsLocateInMapEventOwner.finalSetup(this.itsEventSourceName);

		OpenAjax.hub.subscribe('com.actional.serverui.locateInMap',
					this.onLocateInMap,
					this,
					{source : this.itsEventSourceName});

		
		
		
		
		if(locateInMapId)
		{
			
			OpenAjax.hub.publish('com.actional.serverui.siteSelectionChanged',
			{
				type:'node',
				site_id: locateInMapId
			});
		}
		else
			
			this.clearSiteSelection();
	},

	clearSiteSelection : function()
	{
		
		OpenAjax.hub.publish('com.actional.serverui.siteSelectionChanged',
				     {type:'nothing', source: this.itsEventSourceName});
	},

	initStatSelection : function()
	{
		
		var arrowWidthStat = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, prefixed('lgarrowwidth'));
		if(!arrowWidthStat)
		{
			
			arrowWidthStat = "CALLTIME_AVERAGE";
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, prefixed('lgarrowwidth'), arrowWidthStat);
		}

		
		this.itsStatsSelectionChangedEventOwner = new com.actional.EventDataOwner();
		this.itsStatsSelectionChangedEventOwner.addEvent('com.actional.serverui.statisticSelectionChanged');
		this.itsStatsSelectionChangedEventOwner.finalSetup(this.itsEventSourceName);

		
		OpenAjax.hub.subscribe('com.actional.serverui.statisticSelectionChanged',
					this.onStatisticSelectionChanged,
					this,
					{source : this.itsEventSourceName});

		
		OpenAjax.hub.publish('com.actional.serverui.statisticSelectionChanged',
		{
			source: this.itsEventSourceName,
			statistic_id: arrowWidthStat,
			"parts":
				[{
					label:"IN",
					row_id: arrowWidthStat,
					selected: true
				},
				{
					label:"OUT",
					row_id: arrowWidthStat,
					selected: true
				}]
		});
	},

	initPanesState : function()
	{
		
		this.itsSplitterChangedEventOwner = new com.actional.EventDataOwner();
		this.itsSplitterChangedEventOwner.addEvent('com.actional.serverui.PanesOptionsChanged');
		this.itsSplitterChangedEventOwner.finalSetup(this.itsEventSourceName);

		OpenAjax.hub.subscribe('com.actional.serverui.PanesOptionsChanged',
					this.onPanesOptionsChanged,
					this,
					{source : this.itsEventSourceName});

		OpenAjax.hub.publish('com.actional.serverui.PanesOptionsChanged',
		{
			source: this.itsEventSourceName,
			showStatPane: this.itsSplitterOptions.showStatisticsPane,
			showBreakdownPane: this.itsSplitterOptions.showBreakdownPane
		});
	},

	initAlertOccurenceSelection : function()
	{
		OpenAjax.hub.subscribe('com.actional.serverui.statDomainChanged',
					this.onStatDomainChanged,
					this,
					{source : this.itsEventSourceName});

		
		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: this.itsEventSourceName,
			events	: ['com.actional.serverui.statDomainChanged']
		});
	},

	loadSplittersSettings : function()
	{
		
		var val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, prefixed('statsplitsize'));
		if(!val)
			
			val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'st_split_2');

		if(val)
			this.itsSplitterOptions.statisticsPaneSize = strToNumber(val);
		else
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
					   prefixed('statsplitsize'),
					   '' + this.itsSplitterOptions.statisticsPaneSize);
		}

		
		val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, prefixed('breaksplitsize'));
		if(!val)
			val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'br_split_2');

		if(val)
			this.itsSplitterOptions.itemBreakdownPaneSize = strToNumber(val);
		else
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
					   prefixed('breaksplitsize'),
					   '' + this.itsSplitterOptions.itemBreakdownPaneSize);
		}

		
		val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, prefixed('statisticsdisplay'));
		if(val)
			this.itsSplitterOptions.showStatisticsPane = ((val == 'on')||(val == 'true')) ? true : false;
		else
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
					   prefixed('statisticsdisplay'),
					   '' + this.itsSplitterOptions.showStatisticsPane);
		}

		
		val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, prefixed('breakdowndisplay'));
		if(val)
			this.itsSplitterOptions.showBreakdownPane = ((val == 'on')||(val == 'true')) ? true : false;
		else
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
					   prefixed('breakdowndisplay'),
					   '' + this.itsSplitterOptions.showBreakdownPane);
		}
	},

	initMiscOptions : function()
	{
		
		var val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, prefixed('allpathhints'));
		if(val)
			this.itsMiscOptions.showAllPathHints = (val == "true");
		else
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
					   prefixed('allpathhints'),
					   '' + this.itsMiscOptions.showAllPathHints);
		}

		
		this.itsMiscOptionsChangedEventOwner = new com.actional.EventDataOwner();
		this.itsMiscOptionsChangedEventOwner.addEvent('com.actional.serverui.MiscOptionsChanged');
		this.itsMiscOptionsChangedEventOwner.finalSetup(this.itsEventSourceName);

		OpenAjax.hub.subscribe('com.actional.serverui.MiscOptionsChanged',
					this.onMiscOptionsChanged,
					this,
					{source : this.itsEventSourceName});

		OpenAjax.hub.publish('com.actional.serverui.MiscOptionsChanged',
		{
			source: this.itsEventSourceName,
			showAllPathHints: this.itsMiscOptions.showAllPathHints
		});
	},

	
	onOverviewAwakening: function()
	{
	},

	
	showPathExplorer: function()
	{
	        if(this.itsPathExplorer == null)
	        {
			
			this.itsPathExplorer = new Ext.Window(
			{
				id: 'map-explorer',
				layout: 'fit',
				closeAction: 'hide',
				plain: true,
				domainid: this.domainid,
				constrainHeader: true,
				minWidth: 250,
		        	listeners:
		        	{
		        		'hide' : function(el)
					{
						this.hidePathExplorer();

						var mapBtn = Ext.getCmp('main-actionbar-map-btn');
						mapBtn.toggle(true);
					},
		        		scope: this
		        	},
				items:[
				{
					layout: 'fit',
					border: false,
					plugins:
			        	[
			        		new com.actional.serverui.network.NetworkActionBar(
			        		{
				        		mode: 2, 
				        		id: 'popup-actionbar',
				        		listeners:
				        		{
								closeMapExplorer: this.hidePathExplorer,
				        			scope: this
				        		},
				        		hideactioncombo: (this.hideactioncombo || this.noexternalhyperlinks),
				        		hideconfigurehyperlinks: this.hideconfigurehyperlinks
			        		})
			        	],
			        	items:[
					{
						xtype: 'com.actional.CustomScrollbarFlash',
						autoScroll:true,
			        		objectId: 'network_explorer_swf',
			        		hasStablePercentageVertical: true,
			        		swfUrl: contextUrl('portal/operations/explorer.swf?l='+PageState_pageid),  
			        		flashvars:
			        		{
			        			urlctx: contextUrl(''),
			        			pageid: PageState_pageid,
			        			expandAllMode: this.explorer_expandAllMode,
			        			domainid: this.domainid,
			        			isprocessflow: this.isprocessflow
			        		},
						onAwakening: function()
						{
						}
					}]
				}]
			});
	        }

	        var pathExplorer = this.itsPathExplorer;

		pathExplorer.show();

		var panel = Ext.getCmp('network-map-panel');
		var panelBox = panel.getBox(false);

		pathExplorer.setTitle('Path Explorer');
		pathExplorer.setSize(panelBox.width - 30, panelBox.height - 30);
		pathExplorer.setPosition(panelBox.x + 15, panelBox.y + 15);
		Ext.getCmp('popup-actionbar-path-btn').toggle(true);

		
		this.enableToolbarCtrls(false);




	},

	/** @lastrev fix36582 - enableToolbarCtrls only when a path explorer is present disregarding its "hidden" state
         */
	
	hidePathExplorer: function()
	{
		var pathExplorer = this.itsPathExplorer;

		if(pathExplorer && (pathExplorer.hidden == false))
		{
			pathExplorer.hide();



		}

		if(pathExplorer)
		{
			
			this.enableToolbarCtrls(true);
		}
	},

	/**
	 * @lastrev fix35662 - new method
	 */
	enableToolbarCtrls: function(enable)
	{
		this.itsToolbar.enableToolbarCtrls(enable);
	},

	/**
	 * @lastrev fix35675 - for expanding and collapsing of stats pane disable the animation
	 */
	onPanesOptionsChanged : function(event, publisherData, subscriberData)
	{
		
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			return;

		if(this.itsStatPane)
		{

			if(publisherData.showStatPane == true)
				this.itsStatPane.expand(false);
			else
				this.itsStatPane.collapse(false);
		}

		if(this.itsBreakdownPane)
		{

			if(publisherData.showBreakdownPane == true)
				this.itsBreakdownPane.expand(true);
			else
				this.itsBreakdownPane.collapse(true);
		}
	},

	onSiteSelectionChanged : function(event, publisherData, subscriberData)
	{
		if((publisherData.type == 'nothing') || publisherData.forstatsonly)
			this.hidePathExplorer();
	},

	onLocateInMap : function(event, publisherData, subscriberData)
	{
		
		var servletUrl = contextUrl('portal/operations/overview/networkimage.xml?type=layoutopts' +
					    '&typefilter=' + publisherData.layouttype +
					    '&onehop=' + publisherData.layoutonehop +
					    '&setscheme=' + publisherData.layoutgrouping);

		
		
		if(publisherData.domainid != "MAIN")
			servletUrl += this.getExtraLayoutOptionsParam();

		
		XMLHttp_GetAsyncRequest(servletUrl, function(responseText, userData, status, statusText)
		{
			var layoutObj = eval(responseText);

			
			OpenAjax.hub.publish('com.actional.serverui.networkLayoutOptionsChanged',
			{
				source: this.itsEventSourceName
			});
		}, null, null, "", false);


		
		OpenAjax.hub.publish('com.actional.serverui.siteSelectionChanged',
		{
			type:'node',
			site_id: publisherData.siteid
		});
	},

	getExtraLayoutOptionsParam : function()
	{
		var domainid = this.getDomainIdValue();
		var extraParam = '';

		if (domainid)
			extraParam = "&domain=" + domainid;

		return extraParam;
	},

	getDomainIdValue : function()
	{
		if(this.domainid == 'EVENT')
			return this.domainidEventValue;

		return this.domainid;
	},

	onStatisticSelectionChanged : function(event, publisherData, subscriberData)
	{
		
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			return;

		UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
				   prefixed('lgarrowwidth'), publisherData.statistic_id);
	},

	onMiscOptionsChanged : function(event, publisherData, subscriberData)
	{
		
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			return;

		UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
				   prefixed('allpathhints'),
				   '' + publisherData.showAllPathHints);
	},

	onStatDomainChanged : function(event, publisherData, subscriberData)
	{
		
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			return;

		if(this.domainidEventValue != publisherData.statdomainid)
		{
			this.domainidEventValue = publisherData.statdomainid;
			this.clearSiteSelection();
		}


	}
});

Ext.reg('com.actional.serverui.network.NetworkBrowser', com.actional.serverui.network.NetworkBrowser);


function prefixed(settingName)
{
	return cookieSettingsPrefix + '-' + settingName;
}








Ext.layout.BorderLayout.SplitRegion.prototype.onSplitMove =
Ext.layout.BorderLayout.SplitRegion.prototype.onSplitMove.createInterceptor(function(splitter, size)
{
	savePanelSize(splitter, size);
	return true;	
});

Ext.layout.BorderLayout.SplitRegion.prototype.onCollapse =
Ext.layout.BorderLayout.SplitRegion.prototype.onCollapse.createInterceptor(function(panel)
{
	savePanelState(panel);
	return true;	
});

Ext.layout.BorderLayout.SplitRegion.prototype.onExpand =
Ext.layout.BorderLayout.SplitRegion.prototype.onExpand.createInterceptor(function(panel)
{
	savePanelState(panel);
	return true;	
});

function savePanelSize(splitter, size)
{
	
	if(splitter.resizingEl.id == 'stat-pane')
		UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, prefixed('statsplitsize'), '' + size);
	else if(splitter.resizingEl.id == 'item-breakdown-pane')
		
		UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, prefixed('breaksplitsize'), '' + (size+30));
}

function savePanelState(panel)
{
	
	var xtype = panel.getXType();	

	if(xtype == 'com.actional.serverui.network.Statspane')
	{
		UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
				   prefixed('statisticsdisplay'),
				   '' + !panel.collapsed);
	}
	else if(xtype == 'com.actional.serverui.network.ItemBreakdownpane')
	{
		UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
				   prefixed('breakdowndisplay'),
				   '' + !panel.collapsed);
	}

	OpenAjax.hub.publish('com.actional.serverui.PanesOptionsChanged',
	{
		source: 'networkbrowser',
		showStatPane: !Ext.getCmp('stat-pane').collapsed,
		showBreakdownPane: !Ext.getCmp('item-breakdown-pane').collapsed
	});
}


