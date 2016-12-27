

















Ext.namespace('com.actional.serverui.network');


/**
  *
  * @class com.actional.serverui.network.SummaryGraphPane
  * @extends Ext.Panel
  *
  * @lastrev fix37599 - pass portletId & pt (portletType) as flashvars into summary graph.
  */
com.actional.serverui.network.SummaryGraphPane = Ext.extend(Ext.Panel,
{
	itsStatList: undefined,
	itsStatSet: undefined,
	itsStatPrefs: undefined,
	itsStatsOptionsChangedEventOwner: undefined,
	itsEventSourceName: 'summarypane',
	itsCustomOptionsEventId: 'com.actional.serverui.statsDisplayOptionsChanged', 
	itsSettingPrefix: '',
	itsUserPreferences:undefined,

    /**
     * @cfg {String} statsetid
     *
     * the statsetid used to control which statistic is displayed
     */

    /**
     * @cfg {String} domainid (Optional)
     *
     * The domainid to use. pass "EVENT" to make the controls wait for events to get
     * a domainid. For the main network, you do not need to define it (or use null)
     */

    /**
     * @cfg {String} disabletimeseries (Optional)
     *
     * pass true to disable seeing timeseries (used when we have no timeline like in
     * the alert analyzer or mindreef Workspace)
     */

    /**
     * @cfg {String} disablesiteids (Optional)
     *
     * pass true to disable listening to site id change events (used when site ids are
     * irrelevant as in portal pages)
     */

    /**
     * @cfg {String} disablearrowwidth (Optional)
     *
     * pass true to disable The 'arrow width' menu item
     */

     /**
     * @cfg {String} disableheaders (Optional)
     *
     * pass true to disable rendering of header and footer column headers by the graph
     */

    /**
     * @cfg {String} uniqueId (Optional)
     *
     * A unique id for the summarypane to indentify itself in a web page with multiple
     * summarygraph instances.
     */

    /**
     * @cfg {String} queryParams (Optional)
     *
     * Serialized query for the summarygraph to send to the server. The only missing piece
     * of information in the query is the time and timeunittype.
     */

    /**
     * @cfg {String} optionsManagerId (Optional)
     *
     * An optional id to create a new OptionsManger instance per summary graph.
     * Note: currently used only in dashboard
     */

     /**
      * @cfg {String} settingPrefix (Optional)
      *
      * An optional id to save summary settings on server side.
      */

     /**
      * @cfg {String} userPreferences (Optional)
      *
      * An optional id to initialize summary preferences else takes default preference.
      */

     /**
      * @cfg {String} pt (Optional)
      *
      * The portletType (com.actional.lg.serverui.portal.PortletType) id. This will
      * be useful in the pct ipc subscribe dril down.
      */

     /**
      * @cfg {Boolean} networklayoutsensitive (Optional)
      *
      * true if statistics contained in this graph is sensitive to which network layout
      * is currently displayed. For example, when the 'one hop' option is toggled, statistics
      * for a particular site might be different. This means the component will listen to the
      * com.actional.serverui.networkLayoutOptionsChanged event
      */

	constructor: function(config)
	{
		
		
		
		this.uniqueId = config.uniqueId || '';
		this.itsStatList = com.actional.DataStore.statList;
		this.itsSettingPrefix = config.settingPrefix;

		this.itsUserPreferences = config.userPreferences,

		this.loadStatisticsPreferences(config.statsetid);

		if(config.uniqueId)
			this.itsCustomOptionsEventId = this.itsCustomOptionsEventId.concat(".", config.uniqueId);

		
		var manager = com.actional.serverui.OptionsManager.getManager(config.optionsManagerId);

		if(manager)
		{
    			manager.addTab({
					xtype: 'com.actional.serverui.StatisticsOptionsTab',
					itsOrderedStats: this.itsStatPrefs, 
					itsStatSetId: config.statsetid,
					itsCustomOptionsEventId: this.itsCustomOptionsEventId,
					tabName: config.tabName,
					ctrlPrefix: this.uniqueId  
					});
		}

		this.itsStatsOptionsChangedEventOwner = new com.actional.EventDataOwner();
		this.itsStatsOptionsChangedEventOwner.addEvent(this.itsCustomOptionsEventId);
		this.itsStatsOptionsChangedEventOwner.finalSetup('summarypane');

		
		OpenAjax.hub.subscribe( this.itsCustomOptionsEventId,
					this.onStatsDisplayOptionsChanged,
					this,
					{source : 'summarypane'});

		
		this.publishStatOptionsChanged();

		/**
 		* @lastrev fix36736 - don't render drop down for summary graph statistics in PCT
 		*/
		com.actional.serverui.network.SummaryGraphPane.superclass.constructor.call(this,Ext.applyIf(config,
		{
			border: false,
		    	layout:'fit',
		    	id:'summarypane' + this.uniqueId,
		    	items:
		    	[
		        	{
					xtype: 'com.actional.Flash',
					swfUrl: contextUrl('images/temp80_SummaryGraph.swf?l='+PageState_pageid),  
					objectId: 'SummaryGraph' + this.uniqueId,
					flashvars:
					{
						timeselectionsource: config.timeselectionsource,
						portletId : config.portletId,
						pt: config.pt,
						statsetid: config.statsetid,
						domainid: config.domainid,
						disabletimeseries: config.disabletimeseries,
						disablesiteids: config.disablesiteids,
						uniqueId: this.uniqueId,
						statalign:config.statalign,
						queryParams: config.queryParams,
						disablearrowwidth: config.disablearrowwidth,
						disableheaders: config.disableheaders,
						customOptionsEventId: this.itsCustomOptionsEventId,
						networklayoutsensitive: config.networklayoutsensitive,
						showStatDropDown:config.showStatDropDown
					}
				}
			]
		}));
	},

	loadStatisticsPreferences : function(statsetid)
	{
		this.itsStatPrefs = new Array();

		
		this.itsStatSet = this.itsStatList.getStatSet(statsetid);

		
		var i=0;
		while(1)
		{
			if(!this.itsUserPreferences)
				break;
			var statInfo = {};
			var baseKey = this.getPrefix() + 's' + i;
			statInfo.statid = this.itsUserPreferences[baseKey];
			if(!statInfo.statid)
				break;

			
			for(var j=0; j < this.itsStatSet.length; j++)
			{
				if(statInfo.statid == this.itsStatSet[j])
				{
					
					var statMetadata = this.itsStatList.getStatMetadata(statInfo.statid, true);

					statInfo.displayname = statMetadata.name;
					var baseKey_s = baseKey + '_s';
					statInfo.subStatId = this.itsUserPreferences[baseKey_s];
					var baseKey_m = baseKey + '_m';
					statInfo.mode = this.itsUserPreferences[baseKey_m];
					this.itsStatPrefs.push(statInfo);
				}

				
			}

			i++;
		}

		if(!this.itsStatPrefs.length)
		{
			
			this.itsStatPrefs = this.defaultStatisticsPrefs();
		}
		else
		{
			
			
			this.addAnyExtraStats();
		}
	},

	addAnyExtraStats : function()
	{
		
		for(var i=0; i < this.itsStatSet.length; i++)
		{
			for(var j=0; j < this.itsStatPrefs.length; j++)
			{
				if(this.itsStatPrefs[j].statid == this.itsStatSet[i])
				{
					
					break;
				}
			}

			if(j >= this.itsStatPrefs.length)
			{
				
				
				var newStat = this.makeDefaultSettings(this.itsStatSet[i]);
				if(newStat)
					this.itsStatPrefs.splice(0, 0, newStat);
			}
		}
	},

	defaultStatisticsPrefs : function()
	{
		var defaultStatArray = new Array();

		for(var i=0; i < this.itsStatSet.length; i++)
		{
			var defaultStat = this.makeDefaultSettings(this.itsStatSet[i]);
			if(defaultStat)
				defaultStatArray.push(defaultStat);
		}

		return defaultStatArray;
	},

	makeDefaultSettings : function(stat_id)
	{
		var statMetadata = this.itsStatList.getStatMetadata(stat_id, true);
		var stat = {};

		if(!statMetadata)
			return null;

		stat.statid = statMetadata.id;
		stat.displayname = statMetadata.name;
		stat.subStatId = (statMetadata.substattype == 'total') ? 'TOTAL' : 'AVERAGE';
		stat.mode = this.getDefaultDisplayMode(stat.statid, statMetadata.substattype);

		return stat;
	},

	getDefaultDisplayMode : function(id, type)
	{
		
		


		if(type == 'total')
		{
			if(   (id == 'THROUGHPUT')
			   || (id == 'TOTAL_FAULTS')
			   || (id == 'TOTAL_SL_VIOLATION')
			   || (id == 'TOTAL_SECURITY_VIOLATION')
			   || (id == 'THROUGHPUT'))
				return 'COMPACT';
			else
				return 'NORMAL';
		}
		else
		{
			if(   (id == 'CALLOPENTIME')
			   || (id == 'RECORDS'))
				return 'HIDDEN';
			else if(id == 'ELAPSEDTIME')
				return 'NORMAL';
			else
				return 'FULL';
		}

	},

	saveStatisticsPreferences : function()
	{
		var scopeValue = UserSettings_Scopes.USERPREFERENCES;
		for(var i=0; i < this.itsStatPrefs.length; i++)
		{
			var statInfo = this.itsStatPrefs[i];
			var baseKey = this.getPrefix() + 's' + i;

			UserSettings_Write(scopeValue,
					   baseKey,
					   statInfo.statid);

			UserSettings_Write(scopeValue,
					   baseKey + '_s',
					   statInfo.subStatId);

			UserSettings_Write(scopeValue,
					   baseKey + '_m',
					   statInfo.mode);
		}
	},

	publishStatOptionsChanged : function()
	{
		OpenAjax.hub.publish(this.itsCustomOptionsEventId,
		{
			source: 'summarypane',
			stats: this.getEventData()
		});
	},

	onStatsDisplayOptionsChanged : function(event, publisherData, subscriberData)
	{
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			return;

		if(!publisherData.stats)
			return;

		this.itsStatPrefs = {};
		this.itsStatPrefs = publisherData.stats;

		this.saveStatisticsPreferences();
	},

	getEventData : function()
	{
		var stats = new Array();

		for(var i=0 ; i < this.itsStatPrefs.length ; i++)
		{
			var stat = new Object();
			var statPref = this.itsStatPrefs[i];

			stat.statid = statPref.statid;
			stat.displayname = statPref.displayname;
			stat.subStatId = statPref.subStatId;
			stat.mode = statPref.mode;

			stats.push(stat);
		}

		return stats;
	},

	getPrefix : function()
	{
		if(!this.itsSettingPrefix)
			return '';
		else
			return this.itsSettingPrefix + '_';

	}
});

com.actional.serverui.network.SummaryGraphPane.prototype.itsStatsDetailsEventOwner = new com.actional.EventDataOwner();
com.actional.serverui.network.SummaryGraphPane.prototype.itsStatsDetailsEventOwner.addEvent('com.actional.serverui.statisticDetailsOptionsChanged');
com.actional.serverui.network.SummaryGraphPane.prototype.itsStatsDetailsEventOwner.finalSetup('statDetailsEventOwner');

Ext.reg('com.actional.serverui.network.SummaryGraphPane', com.actional.serverui.network.SummaryGraphPane);


/**
 * The function called from the Summary Graph Flash widget
 * when its height is changed.
 * TODO: make this an instance method of com.actional.serverui.network.SummaryGraphPane
 *
 * @lastrev fix36813 - increase the container height by 1px so that the border of the container is visible.
 */

function changeStatsHeight(newHeight, ownerId, stageWidth)
{

	
	var flashObject = Ext.get('SummaryGraph'  + ownerId);
	if (flashObject && flashObject.dom)
	{
		var clientWidth = flashObject.dom.clientWidth;
		var scale = clientWidth / stageWidth;
		newHeight = Math.ceil(scale * newHeight);
	}

	var summaryContainer = Ext.getCmp('summarypane' + ownerId);

	if(!summaryContainer)
	{
		return;
	}

	
	
	
	

	var containerDiv = summaryContainer.el.findParentNode(
				'div#act_summarygraph_container' + ownerId, 10, true);

	if(containerDiv)
	{
		containerDiv.setHeight(newHeight + 3);

		var childDiv = containerDiv.first();

		while(childDiv && childDiv != summaryContainer.el)
		{
			childDiv.setHeight(newHeight);
			childDiv = childDiv.first();
		}
	}

	var parentEl = summaryContainer.el.parent();
	var parentHeight = parentEl.getHeight();
	var parentWidth = parentEl.getWidth();

	if(parentHeight >= newHeight)
	{
		summaryContainer.setSize(summaryContainer.getSize().width, newHeight);
	}
	else
	{
		
		
		
		
		summaryContainer.setSize((parentWidth - com.actional.UiUtils.computeScrollbarSize().width - 2), newHeight);
	}

	
        
	
	
	
	OpenAjax.hub.publish("com.actional.lgserver.controltowerportal.heightChange");
}
