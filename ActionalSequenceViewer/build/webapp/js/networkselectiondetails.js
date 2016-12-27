

















/**
 * @class com.actional.serverui.network.NetworkSelectionDetail
 * @extends Ext.Panel
 *
 * @lastrev fix38284 - updated the method which retrieves the localized string.
 */

Ext.namespace('com.actional.serverui.network');

com.actional.serverui.network.NetworkSelectionDetails = Ext.extend(Ext.Panel,
{
    /**
     * @cfg {Boolean} noexternalhyperlinks (Optional) defaults to false
     *
     * Set to true to hide all hyperlinks that jump to other pages
     * in the product.
     *
     */

    /**
     * @cfg {Boolean} disabledormantinfo (Optional) defaults to false
     *
     * Set to true to hide the "dormant since.." hyperlink
     *
     */

	constructor: function(config)
	{
		this.itsSiteInfo= undefined;

		this.itsSelection_t0 = undefined;

		this.itsSelection_t1 =  undefined;

		this.itsDormantTime =  undefined;

		this.id = config.id || 'statspane_networkselectiondetails';

		this.init();

		var siteInfoPanel = new Ext.Panel(
		{
			border : false,
			height : 20,
			id : this.id+'_siteinfo_panel',
			html : '<center><i>' + com.actional.serverui.technicalview.getMessage('shared.infoMessage.makeASelection') + '</i></center>'
		});

		var alertInfoPanel = new Ext.Panel(
		{
			border : false,
			height : config.noexternalhyperlinks == 'true' ? 1 : 20,
			id : this.id+'_alertinfo_panel'
		});

		var myitems;
		if (!config.disabledormantinfo)
		{
			var dormantInfoPanel = new Ext.Panel(
			{
				border : false,
				height : 20,
				id : this.id+'_dormantinfo_panel'
			});
			myitems =	[siteInfoPanel,dormantInfoPanel,alertInfoPanel];
		}
		else
			myitems =	[siteInfoPanel,alertInfoPanel];

		com.actional.serverui.network.NetworkSelectionDetails.superclass.constructor.call(this,Ext.applyIf(config,
		{
			border: false,
			margins:'1 1 1 1',
			items :	myitems
		}));

		
		

		OpenAjax.hub.subscribe('com.actional.serverui.siteSelectionChanged',
				this.onSiteSelectionChanged, this, {source:'NetworkSelectionDetails'});

		OpenAjax.hub.subscribe('com.actional.serverui.timeSelectionChanged',
				this.onTimeSelectionChanged, this, {source:'NetworkSelectionDetails'});

		OpenAjax.hub.subscribe('com.actional.serverui.newGatherInterval', function(name, event)
		{
			this.lastinterval  = event.lastinterval;
		}, this);

		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: 'NetworkSelectionDetails',
			events	: [
					'com.actional.serverui.newGatherInterval',
					'com.actional.serverui.siteSelectionChanged',
					'com.actional.serverui.timeSelectionChanged']
		});

		
		if (!this.disabledormantinfo)
		{
			UserSettings_ReadFromServer('USERPREFERENCES', ['DormantThreshold'], function(values)
			{
				this.dormantThresoldValue = parseInt(values['DormantThreshold']);
			}, this);

			OpenAjax.hub.subscribe('com.actional.serverui.dormantThresold', function(event, publisherData)
			{
				this.dormantThresoldValue = parseInt(publisherData.dormantThresold);
			}, this);
		}
	},

	/**
	 * if disabledormantinfo is not true then always return true. Else return based on the dormantThresoldValue.
	 * this method should be used instead of fetching this.disabledormantinfo directly
	 *
	 * @lastrev fix38111 - new method.
	 */
	getDisableDormantThresoldBoolean: function()
	{
		if (!this.disabledormantinfo)
		{
			return this.dormantThresoldValue == 0;
		}

		return true;
	},

	doResize : function()
	{
		this.updatePanelsHeight.defer(100,this);
	},

	getId : function()
	{
		return this.id;
	},

	init : function()
	{
		this.initTemplates();
	},

	/**
	 * @lastrev fix38284 - do a null check for dormantInfoPanel
	 */
	doAllPanelsUpdate : function(nodeInfoStruct)
	{
		var siteInfoPanel = Ext.get(this.getId()+ '_siteinfo_panel');

		if(!siteInfoPanel)
			return;

		var html = this.templates.siteInfoTpl.applyTemplate(
		{
			id_prefix : this.getId(),
			type : !nodeInfoStruct ? 'nothing' : nodeInfoStruct.type,
			site_name : !nodeInfoStruct ? '' : nodeInfoStruct.site_name,
			peersite_name : !nodeInfoStruct ? '' : nodeInfoStruct.peersite_name,
			site_icon_url : !nodeInfoStruct ? '' : nodeInfoStruct.site_icon_url,
			peersite_icon_url : !nodeInfoStruct ? '' : nodeInfoStruct.peersite_icon_url,
			label_calls_from: com.actional.serverui.technicalview.getMessage('overviewMap.statspane.networkSelectionDetails.label.callsFrom'),
			label_to: com.actional.serverui.technicalview.getMessage('overviewMap.statspane.networkSelectionDetails.label.to')
		});

		siteInfoPanel.update(html);

		if (!this.getDisableDormantThresoldBoolean())
		{
			this.doDormantPanelUpdate(nodeInfoStruct);
		}
		else
		{
			var dormantInfoPanel = Ext.get(this.getId()+ '_dormantinfo_panel');
			if (dormantInfoPanel)
			{
				dormantInfoPanel.setStyle("display", "none");
			}
		}

		if (!this.noexternalhyperlinks)
		{
			html = this.templates.alertInfoTpl.applyTemplate(
			{
				id_prefix : this.getId(),
				blankImageUrl : Ext.BLANK_IMAGE_URL,
				type : !nodeInfoStruct ? 'nothing' : nodeInfoStruct.type,
				outstanding_alarms : !nodeInfoStruct ? '' : nodeInfoStruct.outstanding_alarms,
				outstanding_warnings : !nodeInfoStruct ? '' : nodeInfoStruct.outstanding_warnings,
				outstanding_alerts_url : !nodeInfoStruct ? '' : nodeInfoStruct.outstanding_alerts_url,
				outstanding_alerts_alarms_icon_cls : !nodeInfoStruct ? '' : nodeInfoStruct.outstanding_alerts_alarms_icon_cls,
				outstanding_alerts_alarms_icons_gap_url : !nodeInfoStruct ? '' : nodeInfoStruct.outstanding_alerts_alarms_icons_gap_url,
				outstanding_alerts_warnings_icon_cls : !nodeInfoStruct ? '' : nodeInfoStruct.outstanding_alerts_warnings_icon_cls
			});

			var alertInfoPanel = Ext.get(this.getId()+ '_alertinfo_panel');
			alertInfoPanel.update(html);
		}

		this.doResize();
	},

	doDormantPanelUpdate : function(nodeInfoStruct)
	{
		this.itsDormantTime = !nodeInfoStruct ? this.itsDormantTime : nodeInfoStruct.dormant_timestamp;

		var dormantLegend = nodeInfoStruct ? nodeInfoStruct.dormant_legend : 'none';

		if (!dormantLegend)
		{
			dormantLegend = com.actional.util.TimeUtil.renderDateTime(this.itsDormantTime);
		}

		var html = this.templates.dormantInfoTpl.applyTemplate(
		{
			id_prefix : this.getId(),
			type : !nodeInfoStruct ? 'nothing' : nodeInfoStruct.type,
			dormant_legend : dormantLegend
		});

		var dormantInfoPanel = Ext.get(this.getId()+ '_dormantinfo_panel');
		dormantInfoPanel.update(html);
		dormantInfoPanel.setStyle("display", "");

		var dormantInfoLink = Ext.get(this.getId()+ '_dormantinfo_link');

		if(dormantInfoLink)
		{
			dormantInfoLink.on('click',this.onDormantLinkClick,this,{single:true,stopEvent : true});
		}

	},

	updatePanelsHeight : function()
	{
		var siteInfoPanel = Ext.get(this.getId()+ '_siteinfo_panel');

		if (!this.getDisableDormantThresoldBoolean())
			var dormantInfoPanel = Ext.get(this.getId()+ '_dormantinfo_panel');

		if (!this.noexternalhyperlinks)
			var alertInfoPanel = Ext.get(this.getId()+ '_alertinfo_panel');

		var thisHeight = 0;

		thisHeight += siteInfoPanel.getHeight();

		if (!this.getDisableDormantThresoldBoolean())
		{
			if(dormantInfoPanel.dom.innerHTML == "")
			{
				dormantInfoPanel.addClass("act-nsd-dormantpanel");
			}
			else
			{
				dormantInfoPanel.removeClass("act-nsd-dormantpanel");
			}

			thisHeight += dormantInfoPanel.getHeight();
		}

		if (!this.noexternalhyperlinks)
			thisHeight += alertInfoPanel.getHeight();

		/* taking margins into account */
		thisHeight+=5;

		this.setHeight(thisHeight);

		if(this.ownerCt)
		{
			this.ownerCt.doLayout();
		}
	},

	sendFetchInfoRequest : function(type, site_id, peersite_id, reqInfo)
	{
		var conn = new Ext.data.Connection();

		var end = this.itsSelection_t1;
		var start = this.itsSelection_t0;

		if(this.lastinterval)
		{
			
			if(end > this.lastinterval)
			{
				end = this.lastinterval;
			}

			if(start >= end)
			{
				
				
				
				start = end - 60000;
			}
		}

		conn.request(
		{
			url: contextUrl('portal/operations/nodedetails.jsrv'),
			method: 'GET',
			params:{
				source: this.getId(),
				type: type,
				site_id: site_id,
				peersite_id: peersite_id,
				endTime: end,
				startTime: start,
				disabledormantinfo: this.getDisableDormantThresoldBoolean(),
				required: reqInfo,
				domain_id: this.domainid		
			},
			scope: this,
			success: this.sendFetchInfoAccept,
			failure: this.sendFetchInfoFailure
		});
	},

	sendFetchInfoAccept : function(responseObject)
	{
		var result = eval(responseObject.responseText);

		if(result.req_info == 'all')
		{
			this.doAllPanelsUpdate(result);
		}
		else
		{
			if (!this.getDisableDormantThresoldBoolean())
				this.doDormantPanelUpdate(result);
			this.doResize();
		}

	},

	sendFetchInfoFailure : function()
	{
		this.doAllPanelsUpdate();
		var message = com.actional.serverui.technicalview.getMessage('overviewMap.statspane.networkSelectionDetails.info.failedToObtainSiteInfo');
		var html = '<center><i style="color : red;">' + message + '</i></center>';

		var siteInfoPanel = Ext.get(this.getId()+ '_siteinfo_panel');

		siteInfoPanel.update(html);

	},

	onSiteSelectionChanged : function(event, publisherData, subscriberData)
	{
		if (this.itsSiteInfo && this.itsSiteInfo.type == publisherData.type &&
			this.itsSiteInfo.site_id == publisherData.site_id &&
			this.itsSiteInfo.peersite_id == publisherData.peersite_id)
		{
			return;	
		}

		this.itsSiteInfo = {
				type : publisherData.type,
				site_id : publisherData.site_id,
				peersite_id : publisherData.peersite_id
		};

		

		if (publisherData.type == 'nothing')
		{
			this.doAllPanelsUpdate();
		}
		else
		{
			this.sendFetchInfoRequest(this.itsSiteInfo.type, this.itsSiteInfo.site_id, this.itsSiteInfo.peersite_id,"all");
		}
	},

	onTimeSelectionChanged : function(event, publisherData, subscriberData)
	{
		if(!publisherData.context_t0 || !publisherData.context_t1 || publisherData.source == this.getId())
		{
			
			
			return;
		}

		this.itsSelection_t0 = publisherData.selection_t0;
		this.itsSelection_t1 = publisherData.selection_t1;

		if(this.itsSiteInfo && this.itsSiteInfo.type != 'nothing' && this.itsDormantTime)
		{
			this.sendFetchInfoRequest(this.itsSiteInfo.type, this.itsSiteInfo.site_id, this.itsSiteInfo.peersite_id,"dormant");
		}
	},

	onDormantLinkClick : function()
	{
		var selT0 = this.itsDormantTime;
		var selT1 =  selT0 - (this.itsSelection_t0 - this.itsSelection_t1);
		OpenAjax.hub.publish('com.actional.serverui.timeSelectionChanged',
		{
			source : this.getId(),
			selection_t0 : selT0,
			selection_t1 : selT1,
            		isLive : false
		});
	},

	/**
	 * private method.
	 *
	 * @lastrev fix37883 - use css class as a variable rather than the image url.
	 */
	initTemplates : function() {

		var ts = this.templates || {};

		if (!ts.siteInfoTpl)
		{
			ts.siteInfoTpl = new Ext.XTemplate(
							'\n',
				'<tpl if="this.isValid(type)">',
				'\n',
				'<div id="{id_prefix}_siteinfo_icon">','\n',
				'  <table style="padding: 2px;border-bottom: solid 2px #B1B1D0;width:100%">','\n',
				'	 <tr>','\n',
				'		<td>','\n',

				'             <tpl if="type == \'node\'">',
				'                 <table id="{id_prefix}_siteinfo_table">','\n',
				'                      <tr>','\n',
				'                         <td id="{id_prefix}_siteinfo_col" valign="middle" style="padding-bottom: 2px;">','\n',
				'                                 <nobr><img src="{site_icon_url}"/> <b>{site_name}</b></nobr>','\n',
				'                         </td>','\n',
	            '                      </tr>','\n',
	            '                 </table>','\n',
				'             </tpl>',

				'             <tpl if="type == \'arrow\'">',
				'                 <table id="{id_prefix}_siteinfo_table">','\n',
				'                      <tr>','\n',
				'                         <td id="{id_prefix}_siteinfo_col" valign="middle" style="padding-bottom: 2px;">','\n',
				'                               {label_calls_from} <nobr><img src="{site_icon_url}"/> <b>{site_name}</b></nobr> {label_to} <nobr><img src="{peersite_icon_url}"/> <b>{peersite_name}</b></nobr>','\n',
				'                         </td>','\n',
	            '                      </tr>','\n',
	            '                 </table>','\n',
				'             </tpl>',
                '        </td>','\n',
				'	 </tr>', '\n',
				'  </table>', '\n',
				'</div>','\n',
				'</tpl>','\n',
				'<tpl if="type == \'nothing\'">',
				'    <center><i>Make a selection</i></center>','\n',
				'</tpl>','\n',{
							isValid:function(type){
								return (type == 'node' || type=='arrow');
					        }
				}
			);
		}

		if (!this.disabledormantinfo && !ts.dormantInfoTpl)
		{
			ts.dormantInfoTpl = new Ext.XTemplate(
				'\n',
				'<tpl if="this.isValid(type,dormant_legend)">',
				'  <div id="{id_prefix}_dormant_activity" style="margin-top: 2px; text-align: center;">','\n',
				'    <i style="font-size: 95%;">No activity since <nobr>','\n',
				'	    <a id="{id_prefix}_dormantinfo_link" title="Move back to this time period" href="">{dormant_legend}</a></nobr>','\n',
				'    </i>','\n',
				'  </div>','\n',
				'</tpl>',{
							isValid:function(type,dormant_legend){
								return (dormant_legend != 'none' && (type == 'node' || type=='arrow'));
					        }
				}

			);
		}

		if (!this.noexternalhyperlinks && !ts.alertInfoTpl)
		{
			ts.alertInfoTpl = new Ext.XTemplate(
				'\n',
				'<tpl if="this.isValid(type)">',
				'   <div id="{id_prefix}_outstanding_alerts" style="margin-top: 3px;padding-left: 2px;">','\n',
                '      <nobr> <b style="font-size:smaller;">Outstanding Alerts</b>: ','\n',
                '      <a href="{outstanding_alerts_url}" style="text-decoration: none;">','\n',
                '      <img src="{blankImageUrl}" class="{outstanding_alerts_alarms_icon_cls}" style="margin-right: 3px;vertical-align: middle; border: none;"/>','\n',
                '      <span id="{id_prefix}_alarms_count" style="text-decoration: underline;">{outstanding_alarms}</span>','\n',
                '      <img src="{outstanding_alerts_alarms_icons_gap_url}" width="3px"/>','\n',
                '      <img src="{blankImageUrl}" class="{outstanding_alerts_warnings_icon_cls}" style="margin-right:3px;vertical-align: middle; border: none;" />','\n',
                '      <span id="{id_prefix}_warnings_count" style="text-decoration: underline;">{outstanding_warnings}</span>','\n',
                '      </a></nobr>','\n',
                '   </div>','\n',
				'</tpl>',{
							isValid:function(type){
								return (type == 'node' || type=='arrow');
					        }
				}
			);
		}

		for (var k in ts)
		{
			var t = ts[k];
			if (t && typeof t.compile == 'function' && !t.compiled)
			{
				t.disableFormats = true;
				t.compile();
			}
		}

		this.templates = ts;
	}

});

Ext.reg('com.actional.serverui.network.NetworkSelectionDetails', com.actional.serverui.network.NetworkSelectionDetails);
