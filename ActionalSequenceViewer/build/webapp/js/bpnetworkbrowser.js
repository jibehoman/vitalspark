

















Ext.namespace('com.actional.serverui.network');

var BPDETAILS_BusinessProcessKeyID = '';

/**
 * @class com.actional.serverui.network.BPNetworkBrowser
 * @extends Ext.Panel
 * @lastrev fix39624 - SONAR: Critical: Duplicate property names not allowed in object literals
 */
com.actional.serverui.network.BPNetworkBrowser = Ext.extend(Ext.Panel,
{
    /**
     * @cfg {String} domainid (Optional)
     *
     * The domainid to use. pass "EVENT" to make the controls wait for events to get
     * a domainid. For the main network, you do not need to define it (or use null)
     */

    /**
     * @cfg {Object} metricParams
     *
     * The parameters to render the 'Metrics' summary graph with
     *
     */

    /**
     * @cfg {Boolean} hideconfigurehyperlinks (Optional) defaults to false
     *
     * Set to true to hide all hyperlinks that jump to pages that configures 
     * the product
     */

    /**
     * @cfg {Object} summaryParams
     *
     * The parameters to render the 'Summary' summary graph with
     *
     */
	itsEventSourceName: 'bpnetworkbrowser',

	itsSplitterOptions:
	{
		
		showAlertsPane: true,
		showBPStatPane: true,
		bpStatPaneSize: 235,
		alertsPaneSize: 180
	},

	constructor: function(config)
	{
		this.loadSplittersSettings();

		BPDETAILS_BusinessProcessKeyID = config.domainid;
		
		com.actional.serverui.network.BPNetworkBrowser.superclass.constructor.call(this, Ext.applyIf(config,
		{
			border: false,
			id: 'bp-details-page',
			layout:'border',
			region:'west',
		    	items:
		    	[{
				title: 'Business Process',
				id: 'bp-stat-pane',
				region:'west',
				margins: '3 0 0 0',
				split: true,
				collapsed: !this.itsSplitterOptions.showBPStatPane,
				width: this.itsSplitterOptions.bpStatPaneSize,
				minSize:225,
				maxSize:400,
				animCollapse :false,
				collapsible: true,
				collapseMode:'mini',
			        layout:'border',
			        border:false,
				items: [
				{
					region:'center',
				        layout:'fit',
				        id: 'metrics-summary-panel',
					border:true,
					items: [
					{
						xtype:'tabpanel',
						border: false,
						activeTab: 0,
						autoScroll:true,
						defaults: {
							autoScroll: true ,
							style:{position:'absolute'},
							hideMode:'visibility'
       						},
					        items:[
					        {
			                		title: 'Metrics',
							xtype: 'panel',
							autoScroll:true,
							layout: 'fit',
							items: [
								{
								xtype: 'com.actional.serverui.network.SummaryGraphPane',
								disablearrowwidth : config.metricParams.disablearrowwidth,
								uniqueId : config.metricParams.uniqueId,
								queryParams : config.metricParams.queryParams,
								disableheaders : config.metricParams.disableheaders,
								disablesiteids : config.metricParams.disablesiteids,
								statsetid : config.metricParams.statsetid,
								tabName: 'Metrics',
								statalign:'RIGHT',
								settingPrefix:config.metricParams.settingPrefix,
								userPreferences:config.metricParams.userPreferences

							}]

					        },
					       	{
							title: 'Summary',
							xtype: 'panel',
							autoScroll:true,
							layout: 'fit',
							items: [
								{
								xtype: 'com.actional.serverui.network.SummaryGraphPane',
								disablearrowwidth : config.summaryParams.disablearrowwidth,
								uniqueId : config.summaryParams.uniqueId,
								queryParams : config.summaryParams.queryParams,
								disableheaders : config.summaryParams.disableheaders,
								disablesiteids : config.summaryParams.disablesiteids,
								statsetid : config.summaryParams.statsetid,
								tabName: config.summaryParams.tabName,
								statalign:'RIGHT',
								settingPrefix:config.summaryParams.settingPrefix,
								userPreferences:config.summaryParams.userPreferences
							}]
						}]
					}]
				},
				{
					region:'south',
					id: 'alerts-pane',
					title: 'Outstanding Alerts',
				        collapsible: true,
					collapseMode:'mini',
					collapseFirst: false,
					collapsed: !this.itsSplitterOptions.showAlertsPane,
					height: this.itsSplitterOptions.alertsPaneSize,
					split: true,
					useSplitTips: true,
					minSize: 100,
					maxSize: 400,
					layout: 'border',
					autoScroll: true,
					items: [{
						region: 'center',
						id: 'oustanding-alerts-panel'
					}]
				}]
			},
			{
		        	region: 'center',
				xtype: 'com.actional.serverui.network.NetworkBrowser',
		        	margins: '3 0 0 0',
				border: false,
		        	id: 'bp_network_main_pane',
				statsetid: 'main',
		        	domainid: config.domainid,
		        	isprocessflow: config.isprocessflow,
				disablegrouping: true,
				hideconfigurehyperlinks: config.hideconfigurehyperlinks,
				settingPrefix: config.statParams.settingPrefix,
				userPreferences: config.statParams.userPreferences,
				tabName: 'Business Process Map'
		    	}]
		}));

		this.itsBPStatsPane = Ext.getCmp('bp-stat-pane');
		this.itsAlertsPane = Ext.getCmp('alerts-pane');
		this.initPanesState();
	},

	initPanesState : function()
	{
		
		this.itsSplitterChangedEventOwner = new com.actional.EventDataOwner();
		this.itsSplitterChangedEventOwner.addEvent('com.actional.serverui.BPPanesOptionsChanged');
		this.itsSplitterChangedEventOwner.finalSetup(this.itsEventSourceName);

		OpenAjax.hub.subscribe('com.actional.serverui.BPPanesOptionsChanged',
					this.onBPPanesOptionsChanged,
					this,
					{source : this.itsEventSourceName});

		OpenAjax.hub.publish('com.actional.serverui.BPPanesOptionsChanged',
		{
			source: this.itsEventSourceName,
			showAlertsPane: this.itsSplitterOptions.showAlertsPane,
			showBPStatPane: this.itsSplitterOptions.showBPStatPane
		});
	},

	loadSplittersSettings : function()
	{
		
		var val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'alertsplitsize');
		if(val)
			this.itsSplitterOptions.alertsPaneSize = strToNumber(val);
		else
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
					   'alertsplitsize',
					   '' + this.itsSplitterOptions.alertsPaneSize);
		}

		
		val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'bpstatsplitsize');
		if(val)
			this.itsSplitterOptions.bpStatPaneSize = strToNumber(val);
		else
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
					   'bpstatsplitsize',
					   '' + this.itsSplitterOptions.bpStatPaneSize);
		}

		
		val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'alertsdisplay');
		if(val)
			this.itsSplitterOptions.showAlertsPane = ((val == 'on')||(val == 'true')) ? true : false;
		else
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
					   'alertsdisplay',
					   '' + this.itsSplitterOptions.showAlertsPane);
		}

		
		val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'bpstatdisplay');
		if(val)
			this.itsSplitterOptions.showBPStatPane = ((val == 'on')||(val == 'true')) ? true : false;
		else
		{
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
					   'bpstatdisplay',
					   '' + this.itsSplitterOptions.showBPStatPane);
		}
	},

	onBPPanesOptionsChanged : function(event, publisherData, subscriberData)
	{
		
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			return;

		if(this.itsBPStatsPane)
		{

			if(publisherData.showBPStatPane == true)
				this.itsBPStatsPane.expand(false);
			else
				this.itsBPStatsPane.collapse(false);
		}

		if(this.itsAlertsPane)
		{

			if(publisherData.showAlertsPane == true)
				this.itsAlertsPane.expand(true);
			else
				this.itsAlertsPane.collapse(true);
		}
	}
});

Ext.reg('com.actional.serverui.network.BPNetworkBrowser', com.actional.serverui.network.BPNetworkBrowser);






Ext.layout.BorderLayout.SplitRegion.prototype.onSplitMove =
Ext.layout.BorderLayout.SplitRegion.prototype.onSplitMove.createInterceptor(function(splitter, size)
{
	savePanelSize(splitter, size);
	saveBPPanelSize(splitter, size);
	return true;	
});

Ext.layout.BorderLayout.SplitRegion.prototype.onCollapse =
Ext.layout.BorderLayout.SplitRegion.prototype.onCollapse.createInterceptor(function(panel)
{
	savePanelState(panel);
	saveBPPanelState(panel);
	return true;	
});

Ext.layout.BorderLayout.SplitRegion.prototype.onExpand =
Ext.layout.BorderLayout.SplitRegion.prototype.onExpand.createInterceptor(function(panel)
{
	savePanelState(panel);
	saveBPPanelState(panel);
	return true;	
});

function saveBPPanelSize(splitter, size)
{
	
	if(splitter.resizingEl.id == 'alerts-pane') 
		UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, 'alertsplitsize', '' + size);
	else if(splitter.resizingEl.id == 'bp-stat-pane') 
		UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, 'bpstatsplitsize', '' + size);
}

function saveBPPanelState(panel)
{
	


	if (panel.id == 'alerts-pane')
	{
		UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
			   'alertsdisplay',
			   '' + !panel.collapsed);
	}
	else if (panel.id == 'bp-stat-pane')
	{
		UserSettings_Write(UserSettings_Scopes.PAGECOOKIE,
				   'bpstatdisplay',
				   '' + !panel.collapsed);
	}

	OpenAjax.hub.publish('com.actional.serverui.BPPanesOptionsChanged',
	{
		source: 'bpnetworkbrowser',
		showBPStatPane: !Ext.getCmp('bp-stat-pane').collapsed,
		showAlertsPane: !Ext.getCmp('alerts-pane').collapsed
	});
}

function getExtraLayoutOptionsParam()
{
	return '&domain=' + BPDETAILS_BusinessProcessKeyID;
}

