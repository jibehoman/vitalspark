

















Ext.namespace('com.actional.serverui');

var SEARCH_FIELD_WIDTH = 170;
var SEARCH_RESULT_LIST_WIDTH = 500;
var AUTO_COMPLETE_SEARCH_SCOPE = 0;	
var AUTO_COMPLETE_EXCLUDES = undefined;

var SearchField_LocateInMainMapId = undefined;


var json_reader = new Ext.data.JsonReader({
	root: 'results',
	id: 'id',
	totalProperty: 'nbmatches',
	fields: [
		{name: 'iconurl'},
		{name: 'name'},
		{name: 'category'},	
		{name: 'type'},		
		{name: 'scope'},
		{name: 'node'},
		{name: 'nbrinst', type: 'int'},
		{name: 'sectionheader'},
		{name: 'actionlabel'},
		{name: 'defaultaction'}
	]});

/**
 * The main container which houses the TimeLine flash control
 * and the 'ControlPanel' which is used to control it.
 *
 * @class com.actional.serverui.timemanagement.TimeLine
 * @extends Ext.Panel
 *
 * @lastrev fix37714 - use iconCls instead of icon so that it can be easily themed.
 */
com.actional.serverui.SearchField = Ext.extend(Ext.Toolbar,
{
    /**
     * @cfg {object} initialTimeInterval
     *
     * the initial time interval. Object containing 2 values:
     * 	startTime : (Number - epoch)
     *  endTime   : (Number - epoch)
     */

	itsEventSourceName: 'searchfield',
	itsListenForKeyPress: true,
	isOnPageWithMap: false,
	itsPageId: undefined,

	constructor: function(config)
	{
		this.isOnPageWithMap = !!config.layoutId;
		this.itsPageId = config.pageid;		

		var search_ds = new Ext.data.Store({
						proxy: new Ext.data.ScriptTagProxy({
						url: contextUrl('portal/network_search.jsrv')
					}),
					baseParams: {
						output: 'droplist',
						contexttype: config.contextType,
						layoutid: config.layoutId,
						showfilter: config.showfilter,
						pageid: config.pageid
					},
					reader: json_reader
				});

		
		var resultTpl = new Ext.XTemplate(
					'<tpl for=".">',
						'<tpl if="sectionheader" >',
							'<div class="search-separator">',
								'{sectionheader}',
							'</div>',
						'</tpl>',
						'<tpl if="actionlabel" >',
							'<div class="search-item search-results-action">',
								'{actionlabel}',
							'</div>',
						'</tpl>',
						'<tpl if="this.isNetworkItem(category)" >',
							'<div class="search-item">',
								'<tpl if="iconurl">',
									'<h2><div><img src="{iconurl}" /></div></h2>',
								'</tpl>',
								'<h3><span>{type}</span>{name}</h3>',

								'<tpl if="this.isGroupScheme(type, nbrinst)">',
									'&nbsp;{nbrinst} group members',
								'</tpl>',
								'<tpl if="this.isLogicalGroup(type, nbrinst)">',
									'&nbsp;{nbrinst} instances',
								'</tpl>',
								'<tpl if="scope">',

									'&nbsp;from {[values.scope.replace("\\x5C", "XXX")]}',
								'</tpl>',
								'<tpl if="node">',
									'&nbsp;on {node}',
								'</tpl>',
							'</div>',
						'</tpl>',
						'<tpl if="this.isBusiness(category)" >',
							'<div class="search-item">',
								'<tpl if="iconurl">',
									'<h2><div>&nbsp;</div></h2>',
								'</tpl>',
								'<h3><span>{type}</span>{name}</h3>',
							'</div>',
						'</tpl>',
					'</tpl>',
					{
						disableFormats: true,
						compiled: true,

						isBusiness: function(category)
						{
							return (category == 'business');
						},
						isNetworkItem: function(category)
						{
							
							return (category == 'infra') || (category == 'network') || (category == 'notfound');
						},
						isGroupScheme: function(type, nbrinst)
						{
							
							return (type.indexOf('group') >= 0) && (nbrinst > 1);
						},
						isLogicalGroup: function(type, nbrinst)
						{
							
							return (type.indexOf('group') < 0) && (nbrinst > 1);
						}
					});

				var field = new com.actional.serverui.EnhancedCombo({
					id: 'search-field',
					autoSelectOnLoad: false,
					inactiveRowFlag: 'sectionheader',
				        store: search_ds,
				        displayField: 'name',
				        typeAhead: false,
				        emptyText: 'Type here to search',
				        loadingText: 'Searching...',
				        minChars: config.autoSearchMinChars,
				        width: SEARCH_FIELD_WIDTH,
				        listWidth: SEARCH_RESULT_LIST_WIDTH,
				        maxHeight: 1200,
				        hideTrigger: true,
				        resizable: true,
				        tpl: resultTpl,
				        itemSelector: 'div.search-item',
				        enableKeyEvents: true,
				        queryDelay: 750,
				        queryParam: 'query',
				        selectOnFocus: true,

				        listeners:
					{
						'beforequery': this.onBeforeQuery,
						'expand' : this.onExpand,
						'collapse': this.onCollapse,
						'change' : this.onChange,
						'keypress' : this.onKeyPress,
						'keydown' : this.onKeyDown,
						'beforeselect' : this.onBeforeSelect,
						scope: this
					}
				});

		com.actional.serverui.SearchField.superclass.constructor.call(this, Ext.applyIf(config,
		{
			id: 'global-search',
			width: 210,
			style: 'border:none;background:transparent',
			items:
			[
				field,
				{
					iconCls: 'search-button-cls',
					cls: 'x-btn-icon',
					tooltip: '<b>Global Search</b><br/>Use this text field to search everywhere',
					listeners:
					{
						'click': this.onSearchBtnClick,
						scope: this
					}
				},
				{
					xtype: 'hidden',
					name: 'customaction'
				},
				{
					xtype: 'hidden',
					name: 'customactionvalue'
				}
			]
		}));

	},

	onBeforeQuery : function(event)
	{
		
		var obj = Ext.getCmp('all-search-results');
		if(obj && obj.isVisible())
			return false;

		if(this.isOnPageWithMap)
		{
			
			Ext.getCmp("search-field").store.baseParams = {
				output: 'droplist',
				contexttype: jsContextType,
				layoutid: jsLayoutId,
				showfilter: this.showfilter,
				pageid: this.pageid
				};
		}

		return true;
	},

	onExpand : function(combo)
	{
		if ((combo.getValue() != '') && !combo.trigger.isVisible())
		{
			combo.trigger.show();

			if (Ext.isIE)
				combo.setWidth(SEARCH_FIELD_WIDTH + 20);
			else
				combo.setWidth(SEARCH_FIELD_WIDTH);

			combo.syncSize();
		}
	},

	onCollapse : function(combo)
	{
		var val = combo.getValue();

		if (val == '')
		{
			combo.trigger.visibilityMode = Ext.Element.DISPLAY;
			combo.trigger.hide();
			combo.setWidth(SEARCH_FIELD_WIDTH);
		}
	},

	onChange : function(combo, newVal, oldVal)
	{
		if (newVal == '')
		{
			combo.trigger.visibilityMode = Ext.Element.DISPLAY;
			combo.trigger.hide();
			combo.setWidth(SEARCH_FIELD_WIDTH);
		}
	},

        onKeyDown : function(combo, key)
        {
 		if((key.keyCode == key.DOWN) && !combo.isExpanded())
        		combo.doQuery(combo.getValue(), true);
        },

        onKeyPress : function(combo, key)
        {
        	if((key.keyCode == key.ENTER) && (this.itsListenForKeyPress == true))
			this.openSearchResultsWindow();
        	else
        		
        		this.itsListenForKeyPress = true;
        },

        onBeforeSelect : function(combo, record, index)
        {
        	
        	
        	this.itsListenForKeyPress = false;

		combo.collapse();

		var action = record.get('defaultaction');

		if(record.id == 'TEXTFILTER_LIST')
		{
			
			this.applyTextFilterOnPage(action);
		}
		else if(record.id == 'SHOW_ALL_RESULTS')
		{
			
			this.doOpenSearchResultsWindow(action);
		}
		else
			performSearchResultAction(record.get('defaultaction'), record.id, this.itsPageId);

		return false;	
        },

	onSearchBtnClick : function(btn, event)
	{
		this.openSearchResultsWindow();
	},

	openSearchResultsWindow : function()
	{
		var searchText = Ext.getCmp("search-field").getValue();
	        this.doOpenSearchResultsWindow(searchText);
	},

	doOpenSearchResultsWindow : function(searchText)
	{
		
		Ext.getCmp("search-field").collapse();

	        var results = new com.actional.serverui.SearchResults({
	        			searchText: searchText,
	        			pageId: this.pageid,
					contextType: jsContextType,
					layoutId: jsLayoutId
	        		});
	        results.show(this);
	},

	applyTextFilterOnPage : function(searchText)
	{
		var params = extractAllUrlParameters({filtertext:true, action:true});

		
		var reloadURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
		reloadURL += "?filtertext=" + searchText;

		
		for (var paramName in params)
		{
			var paramValue = params[paramName];
			reloadURL += "&" + paramName + "=" + paramValue;
		}

		
		window.location.replace(reloadURL);
	}
});

Ext.reg('com.actional.serverui.SearchField', com.actional.serverui.SearchField);


function performSearchResultAction(action, recordid, pageid)
{
	if((action.indexOf("LocateInMap") == 0) || (action.indexOf("ShowStatistics") == 0))
	{
		
		var servletUrl = contextUrl('portal/network_search.jsrv?action=' + action + '&id=' + recordid);
		servletUrl += getExtraLayoutOptionsParam();

		XMLHttp_GetAsyncRequest(servletUrl, function(responseText, userData, status, statusText)
		{
			var locateItemInfo = eval(responseText);

			if(action.indexOf("LocateInMap") == 0)
				performLocateInMapAction(locateItemInfo, pageid);
			else if(action.indexOf("ShowStatistics") == 0)
				publishSiteSelectionChangedEvent(locateItemInfo);

		}, null, null, "", false);
	}
	else
	{
		
		window.location = action;
	}
}

function performLocateInMapAction(locateItemInfo, pageid)
{
	if("" == locateItemInfo.errorid)
	{
		
		publishLocateInMapEvent(locateItemInfo);
		return;
	}

	if('ERROR_CANNOT_CONVERT_ID' == locateItemInfo.errorid)
	{
		
		if(locateItemInfo.showmsg == false)
		{
			
			
			window.location = contextUrl("portal/infrastructure.jsp?info=1&id=" + locateItemInfo.logicalid);
		}
		else
		{
			
			Ext.MessageBox.show({
				title: 'Item Selection Error',
				msg: 'Unable to select the requested item.',
				buttons: Ext.MessageBox.OK,
				icon: 'error'
			});
		}
		return;
	}

	if('MAIN' == locateItemInfo.domainid)
	{
		

		
		SearchField_LocateInMainMapId = locateItemInfo.logicalid;

		if(!locateItemInfo.showmsg)
		{
			window.location = contextUrl("admin/operations/overview/index.jsp?locateInMap="
							+ SearchField_LocateInMainMapId
							+ "&ignoreDomain=1");
			return;
		}

		var scope = "";
		var message;

		if(pageid.indexOf("alerts") > -1)
			scope = "Alert";
		else if(pageid.indexOf("business_process") > -1)
			scope = "Business Process";

		if('WARNING_ID_FOUND_OUTSIDE_DOMAIN' == locateItemInfo.errorid)
			message = 'The selected item was found outside this ' + scope
					+ '.<br />Do you want to proceed to the main '
					+ locateItemInfo.sitetypename + '&#39;s map?';
		else if('WARNING_ID_FOUND_WITH_ONEHOP' == locateItemInfo.errorid)
			message = 'The selected item was found outside this ' + scope + '. '
					+ 'The <i>Include Boundary Calls</i> feature will also need to be enabled for the item to appear. '
					+ 'Do you want to proceed to the main '
					+ locateItemInfo.sitetypename + '&#39;s map?';
		else
			message = 'Unhandled LocateInMap case (01)';

		
		customConfirmation({
			title: 'Item Found',
			msg: message,
			btns:[{
				buttonText:'Proceed to Main Map',
				fn:function(){
					window.location = contextUrl("admin/operations/overview/index.jsp?locateInMap="
									+ SearchField_LocateInMainMapId
									+ "&ignoreDomain=1");
				}
			},{
				buttonText:'Cancel'
			}],
			icon: 'warning'
		});
	}
	else
	{
		

		
		SearchField_LocateInMainMapId = locateItemInfo.logicalid;

		if(!locateItemInfo.showmsg)
		{
			publishLocateInMapEvent(locateItemInfo);
			return;
		}

		var message1;

		if('WARNING_ID_FOUND_OUTSIDE_MAP' == locateItemInfo.errorid)
			message1 = 'The selected item was found in a different map.<br />Do you want to proceed to the '
					+ locateItemInfo.sitetypename + '&#39;s map?';
		else if('WARNING_ID_FOUND_WITH_ONEHOP' == locateItemInfo.errorid)
			message1 = 'The selected item was found in the ' + locateItemInfo.sitetypename + '&#39;s map. '
					+ 'The <i>Include Boundary Calls</i> feature will be enabled for the item to appear. '
					+ 'Do you want to proceed to the ' + locateItemInfo.sitetypename + '&#39;s map?';
		else
			message1 = 'Unhandled LocateInMap case (02)';

		customConfirmation({
			title: 'Item Found',
			msg: message1,
			btns:[{
				buttonText:'Proceed to Map',
				fn:function(){
					publishLocateInMapEvent(locateItemInfo);
				}
			},{
				buttonText:'Cancel'
			}],
			icon: 'warning'
		});
	}
}

function publishLocateInMapEvent(locateItemInfo)
{
	OpenAjax.hub.publish('com.actional.serverui.locateInMap',
	{
		source: 'searchresult',
		siteid: locateItemInfo.siteid,
		layouttype: locateItemInfo.layoutinfo.type,
		layoutgrouping: locateItemInfo.layoutinfo.grouping,
		layoutonehop: locateItemInfo.layoutinfo.onehop,
		domainid: locateItemInfo.domainid

	});
}

function publishSiteSelectionChangedEvent(locateItemInfo)
{
	OpenAjax.hub.publish('com.actional.serverui.siteSelectionChanged',
	{
		source: 'searchresult',
		type:'node',
		site_id: locateItemInfo.siteid,
		forstatsonly: true
	});
}

function customConfirmation (config){
	var labels = ['ok', 'cancel', 'yes', 'no'];
	var savedLabels = Ext.apply({},Ext.Msg.buttonText);

	Ext.applyIf(config,{buttons:{}, method: 'show', fn: function(buttonId){

		for (i=0; i < config.btns.length; i++){
			var btn=config.btns[i], label=labels[i];
			if (buttonId == label){
				if (btn.fn) return btn.fn.apply(btn, arguments);
			}
		}
	}});

	for (i=0; i < config.btns.length && i < 4; i++){
		var btn = config.btns[i], label=labels[i];
		Ext.Msg.buttonText[label] = "&nbsp;" + btn.buttonText + "&nbsp;";
		config.buttons[label] = true;
	}

	Ext.Msg[config.method](config);

	Ext.apply(Ext.Msg.buttonText, savedLabels);
}
