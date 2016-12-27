

















Ext.namespace('com.actional.serverui.network');
Ext.namespace('com.actional.alertanalyzer');

/**
 * @class com.actional.serverui.network.AlertAnalyzer
 * @extends Ext.Panel
 *
 * @lastrev fix38515 - add the technicalflowtoolbar plugin to the tabs.
 */
com.actional.serverui.network.AlertAnalyzer = Ext.extend(Ext.Panel,
{
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

	itsOccurencesStore: null,
	itsSequenceData: null,

	constructor: function(config)
	{
		
		com.actional.alertanalyzer.faketimeline = new com.actional.EventDataOwner();
		com.actional.alertanalyzer.faketimeline.addEvent('com.actional.serverui.timeSelectionChanged',
		{
			selection_t0: 1,
			selection_t1: 2,
			context_t0: 1,
			context_t1: 2
		});
		com.actional.alertanalyzer.faketimeline.finalSetup('faketimeline');

		com.actional.alertanalyzer.domainidowner = new com.actional.EventDataOwner();
		com.actional.alertanalyzer.domainidowner.addEvent('com.actional.serverui.statDomainChanged');
		com.actional.alertanalyzer.domainidowner.finalSetup('domainidowner',['forceRefresh']);

		itsSequenceData = com.actional.sequence.SequenceData();
		itsSequenceData.bindWithStatDomainChangedEvent();

		var sequenceTable = new com.actional.ui.SequenceTable();
		var imagesPath;
	    	try { imagesPath = contextUrl("images/"); }
	    	catch ( e ) { imagesPath = "/lgserver/images/"; }

		var sequenceDiagramConfig =
					 { i18n: 
					 	{ string1: 'string1'
						, string2: 'string2'
						}
					 , imagesPath: imagesPath
					 };
		var sequenceDiagram = new com.actional.sequence.Diagram( sequenceDiagramConfig );
		var seqDiagramMainPanelConfig = sequenceDiagram.getMainPanelConfigObject();
		var seqDiagramPanelId = seqDiagramMainPanelConfig.id;
		var seqDiagramConfig = 	Ext.applyIf ( { title: 'Sequence Map' }, seqDiagramMainPanelConfig );

		com.actional.serverui.network.AlertAnalyzer.superclass.constructor.call(this, Ext.applyIf(config,
		{
			layout: 'border',
			items: [
			{
				region: 'north',
				id: 'alert-analyzer-pane',
				xtype: 'panel',
				margins: '0 4 0 4',
			        collapsible: true,
				split: true,
				useSplitTips: true,
		        	height: 200,
		        	domainid:'EVENT',
				title: 'Grouped Alerts',
				layout: 'fit',
				autoScroll: false,
				items: [{
					region: 'center',
					id: 'analyzer-table-panel'
				}],
		        	listeners:
		        	{
		        		'resize' : function(el)
		        		{
		        			var cp = Ext.get("alert-analyzer-top-section");

							if (cp)
							{
								var ht = this.getInnerHeight();
								
								cp.setHeight(ht);
								cp.setWidth(this.getInnerWidth());

								var sidepanel = Ext.get("alert_table_pane");
								if (sidepanel && sidepanel.getHeight() < ht)
								{
									
									sidepanel.setHeight(ht);
								}
							}
		        		}
		        	}
			},
			{
				id: 'network_main_pane',
				title: 'Alert Flow Map',
				region: 'center',
				margins: '0 4 2 4',
				layout:'fit',
				items:
				[{
					xtype:'tabpanel',
					activeItem:'overview',
					plugins:
					[
						new com.actional.serverui.technicalview.TechnicalViewToolbar()
					],
					items: [
					{
						title: 'Overview Map',
						id:'overview',
						xtype: 'com.actional.serverui.network.NetworkBrowser',
						statsetid: 'main',
						showloglinks: 'true',
						hideactioncombo: true,
						disabletimeseries: 'true',
						disabledormantinfo: 'true',
						userPreferences: config.userPreferences,
						hideconfigurehyperlinks: config.hideconfigurehyperlinks,
						settingPrefix: config.settingPrefix,
				        	domainid:'EVENT'
		        		},
					seqDiagramConfig,
					(Ext.applyIf({
						title: 'Sequence Table'
					},sequenceTable.getMainPanelConfigObject()))
					]
				}]
			}]
		}));
	}
});

Ext.reg('com.actional.serverui.network.AlertAnalyzer', com.actional.serverui.network.AlertAnalyzer);

