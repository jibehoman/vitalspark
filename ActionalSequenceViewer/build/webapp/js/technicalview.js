

















Ext.namespace('com.actional.serverui');
Ext.namespace('com.actional.serverui.technicalview');

/**
 * @class com.actional.serverui.TechnicalView
 * @extends Ext.Panel
 *
 * @lastrev fix38621 - added support to have activeTab
 */
com.actional.serverui.TechnicalView = Ext.extend(Ext.Panel,
{
	/** cfg {Array} portletid
	 *
	 * PCT portlet id for IPC communication
	 */

	/** cfg {Array} tabs
	 *
	 * List of tabs to render. (tabs are numbered from 1 to 4), if only one is provided,
	 * the tab control will not display.
	 */

	/**
	 * @cfg {String} settingPrefix (Optional)
	 *
	 * An optional id to save statistic summary settings on server side.
	 */

	/**
	 * @cfg {String} userPreferences (Optional)
	 *
	 * user preferences for the statistic summary component.
	 */

	/**
	 * @cfg {Boolean} hideconfigurehyperlinks (Optional) defaults to false
	 *
	 * Set to true to hide all hyperlinks that jump to pages that configures
	 * the product
	 */

	/**
	 * @cfg {String} activeTab (Optional)
	 *
	 * The id of the tab to activate by default. The following are the ids of different tabs
	 * - 'overview' - network overview tab.
	 * - 'sequenceDiagramPanelId' - sequence diagram tab.
	 * - 'sequencetable' - sequence table tab.
	 * - 'auditreport' - audit report tab.
	 */

	/**
	 * @cfg {String} toBeSelectedInteractionId (Optional)
	 *
	 * The default row to be selected when the activeTab is set to audit report tab. The
	 * row with the given interactionId is selected & focused by default.
	 */

	itsOccurencesStore: null,
	itsSequenceData: null,

	isBlank: function( str )
	{
		return (str === null || str == "");
	},

	ipcCallback: function ( srcPortletId, eventType, tokens, values, destinationPortletId )
	{
		var flowIds = null;
		var processId = null;

		for (var i = 0; i < tokens.length; i++)
		{
			if ( tokens[i] == "Flow Ids" )
			{
				flowIds = values[i];
			}
			else if ( tokens[i] == "Process Id" )
			{
				processId = values[i];
			}
		}

		if( this.isBlank(flowIds) && this.isBlank(processId))
		{
			this.displayNothing();
			return;
		}

		if( ! this.isBlank(flowIds) )
		{
			this.publishFlowIds(flowIds);
			return;
		}

		

		if (typeof (window.top.PCT.BusinessTechnicalMapper) == "undefined")
		{
			this.displayNothing();
			return;
		}

		var jsCallback = new Object();

		var scope = this;

		jsCallback.onSuccess = function(result)
		{
			var flowIds = scope.encodeFlowIds(result);

			if(!flowIds || flowIds.length == 0)
			{
				scope.displayNothing();
				return;
			}

			scope.publishFlowIds(flowIds);
		};

		jsCallback.onFailure = function(error)
		{
			scope.displayNothing();
			
			
		};

		window.top.PCT.BusinessTechnicalMapper.mapProcessIdToFlowIds(processId, jsCallback);
	},

	encodeFlowIds: function(flowIdArray)
	{
		flowIdArray.sort();

		
		
		var flowIds = flowIdArray.join(",");

		return flowIds;
	},

	displayNothing: function()
	{
		
		OpenAjax.hub.publish('com.actional.serverui.statDomainChanged',
		{
			source: 'technicalview',
			statdomainid: '',
			hasmap: false
		});
	},

	publishFlowIds: function(flowIds)
	{
		var domainid = "$FLOWIDS." + flowIds;

		OpenAjax.hub.publish('com.actional.serverui.statDomainChanged',
		{
			source: 'technicalview',
			statdomainid: domainid,
			hasmap: true
		});
	},

	/**
	 * @lastrev fix38531 - add Audit Records tab
	 */

	constructor: function(config)
	{
		
		com.actional.serverui.technicalview.faketimeline = new com.actional.EventDataOwner();
		com.actional.serverui.technicalview.faketimeline.addEvent('com.actional.serverui.timeSelectionChanged',
		{
			selection_t0: 1,
			selection_t1: 2,
			context_t0: 1,
			context_t1: 2
		});
		com.actional.serverui.technicalview.faketimeline.finalSetup('faketimeline');

		com.actional.serverui.technicalview.domainidowner = new com.actional.EventDataOwner();
		com.actional.serverui.technicalview.domainidowner.addEvent('com.actional.serverui.statDomainChanged');
		com.actional.serverui.technicalview.domainidowner.finalSetup('domainidowner',['forceRefresh']);

		itsSequenceData = com.actional.sequence.SequenceData();
		itsSequenceData.bindWithStatDomainChangedEvent();

		var sequenceTable = new com.actional.ui.SequenceTable();
		var auditReport = new com.actional.ui.AuditReport(config.portletid);
		auditReport.setToBeSelectedInteractionId(config.toBeSelectedInteractionId);

		var imagesPath;
	    	try { imagesPath = contextUrl("images/"); }
	    	catch ( e ) { imagesPath = "/lgserver/images/"; }

		var sequenceDiagramConfig = { imagesPath: imagesPath };
		var sequenceDiagram = new com.actional.sequence.Diagram( sequenceDiagramConfig );
		var seqDiagramMainPanelConfig = sequenceDiagram.getMainPanelConfigObject();
		var seqDiagramPanelId = seqDiagramMainPanelConfig.id;
		var seqDiagramConfig = 	Ext.applyIf(
		{
			title: com.actional.serverui.technicalview.getMessage('sequenceDiagram.panelTitle')
		}, seqDiagramMainPanelConfig );

		var networkOverviewConfig =
		{
			title: com.actional.serverui.technicalview.getMessage('overviewMap.panelTitle'),
			id:'overview',
			xtype: 'com.actional.serverui.network.NetworkBrowser',
			hideStatisticsPane: true,
			statsetid: 'main',
			showloglinks: 'true',
			hideactioncombo: true,
			disabletimeseries: 'true',
			disabledormantinfo: 'true',
			userPreferences: config.userPreferences,
			hideconfigurehyperlinks: config.hideconfigurehyperlinks,
			settingPrefix: config.settingPrefix,
			domainid: 'EVENT'
		};

		var auditingTabConfig =
		{
			title: com.actional.serverui.technicalview.getMessage('auditingTab.panelTitle'),
			id:'auditing',
			xtype: 'com.actional.ui.AuditReport'
		};

		var tabPanelItems = [];

		for(i=0; i<config.tabs.length; i++)
		{
			switch(config.tabs[i])
			{
			case 1:
				tabPanelItems.push(networkOverviewConfig);
				break;
			case 2:
				tabPanelItems.push(seqDiagramConfig);
				break;
			case 3:
				tabPanelItems.push(
					(Ext.applyIf({
						title: com.actional.serverui.technicalview.getMessage('sequenceTable.panelTitle')
					},sequenceTable.getMainPanelConfigObject())));
				break;
			case 4:
				tabPanelItems.push(
						(Ext.applyIf({
							title: com.actional.serverui.technicalview.getMessage('auditingTab.panelTitle')
						},auditReport.getMainPanelConfigObject())));
				break;
			default:
				break;
			}
		}

		var mainPanel;

		if(tabPanelItems.length == 1)
		{
			mainPanel = tabPanelItems[0];

			
			delete mainPanel.title;
		}
		else
		{
			
			var activeItem = tabPanelItems[0].id;

			if (typeof config.activeTab !== 'undefined')
			{
				for (var i = 0; i < tabPanelItems.length; i++)
				{
					if (config.activeTab == tabPanelItems[i].id)
					{
						activeItem = tabPanelItems[i].id;
						break;
					}
				}
			}

			mainPanel = {
				xtype:'tabpanel',
				activeItem: activeItem,
				items: tabPanelItems
			};
		}

		com.actional.serverui.TechnicalView.superclass.constructor.call(this, Ext.applyIf(config,
		{
			layout:'fit',
			plugins:
			[
				new com.actional.serverui.technicalview.TechnicalViewToolbar()
			],
			items: [ mainPanel ]
		}));

		if(window.top.PCT && window.top.PCT.eventmanager)
		{
			
			window.top.PCT.eventmanager.registerPortlet ( config.portletid, this, this.ipcCallback );
		}
	}
});

Ext.reg('com.actional.serverui.TechnicalView', com.actional.serverui.TechnicalView);

