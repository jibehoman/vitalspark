

















Ext.namespace('com.actional.serverui.network');

var breakdownStatInfo = undefined;
var breakdownTimeInfo = undefined;

var blueShade1Color = '#D7EAF7';
var blueShade2Color = '#B3CDDF';
var blueBorderColor = '#4684B0';
var blueBorderStroke = 1;

var greyShade1Color = '#E3E3E3';
var greyShade2Color = '#D7D7D7';
var greyBorderColor = '#7B7B7B';
var greyBorderStroke = 1;

var redShade1Color = '#EADDDD';
var redShade2Color = '#E0CCCC';
var redBorderColor = '#F38353';
var redBorderStroke = 1;

var white = '#FFFFFF';


var breakdown_statistics;
var breakdown_selection = null;		
var breakdown_data =
{
	inbound:
	{
		list: new Array(),	
		map: new Object()	
	},
	outbound:
	{
		list: new Array(),	
		map: new Object()	
	}
};
/**
 *
 * @class com.actional.serverui.network.ItemBreakdownpane
 * @extends Ext.Panel
 *
 * @lastrev fix38284 - updated the method which retrieves the localized string.
 */
com.actional.serverui.network.ItemBreakdownpane = Ext.extend(Ext.Panel,
{
	constructor: function(config)
	{
		this.emptyString = "<center><i>" + this.getLabel('infoMessage.makeASelection') + "</i></center>";
		this.itsBaseTitle = this.getLabel('baseTitle');

		com.actional.serverui.network.ItemBreakdownpane.superclass.constructor.call(this, Ext.applyIf(config,
		{
			layout:'border',
	        	tools: [
	        	{
				id: 'gear',
				qtip: this.getLabel('settingsIcon.tooltip'),
				handler: function(event, toolel, panel)
				{
					
					var val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'breakdownstatselect');

					com.actional.serverui.network.StatisticsMenu.showStatististicsMenu(toolel,
					{
						statsetid: this.statsetid,
						selectedstatid:val,
						statSelectionHandler: this.onStatMenuSelectionChanged,
						statSelectionScope: this
					});
				},
				scope:this
			}],
			items:[{
					border: false,
				        region: 'center',
					html:"<div id='network_breakdown_pane_inner' style='padding:2px; overflow:auto' ><center>"+
									"<i>" + this.getLabel('infoMessage.makeASelection') + "</i></center></div>"
			}]
		}));

		this.init();
		this.on('beforeExpand', this.sendBreakdownInfoRequest, this);
		this.on('resize', this.syncInnerSize, this);
	},

	syncInnerSize : function()
	{
		var cp = Ext.get("network_breakdown_pane_inner");

		if (cp)
		{
			
			cp.setHeight(this.getInnerHeight());
		}
	},

	/**
	* private
	* Subscribes to events and requests
	*/
	init: function()
	{
		var val = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'breakdownstatselect');

		if(val == null)
			val = com.actional.DataStore.statList.getDefaultSubStatId(this.statsetid);

		this.newStatSelection(val);

		OpenAjax.hub.subscribe('com.actional.serverui.timeSelectionChanged',
				this.onTimeSelectionChanged, this, {source:'itembreakdownpane'});

		OpenAjax.hub.subscribe('com.actional.serverui.siteSelectionChanged',
				this.onSiteSelectionChanged, this, {source:'itembreakdownpane'});

		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: 'itembreakdownpane',
			events	: ['com.actional.serverui.timeSelectionChanged', 'com.actional.serverui.siteSelectionChanged']
		});

		if (this.domainid == 'EVENT')
		{
			OpenAjax.hub.subscribe('com.actional.serverui.statDomainChanged',
				this.onStatDomainChanged, this, {source:'itembreakdownpane'});

			OpenAjax.hub.publish('com.actional.util.EventRequest',
			{
				source	: 'itembreakdownpane',
				events	: ['com.actional.serverui.statDomainChanged']
			});
		}
	},

	itsTimeInfo : undefined,
	itsSiteInfo : undefined,
	itsStatInfo : undefined,

	onTimeSelectionChanged: function (event, publisherData, subscriberData)
	{
		
		if (this.itsTimeInfo && this.itsTimeInfo.selection_t0 == publisherData.selection_t0 &&
			this.itsTimeInfo.selection_t1 == publisherData.selection_t1)
		{
			return;
		}

		
		if (publisherData.context_t0)
		{
			this.itsTimeInfo = {
				selection_t0 : publisherData.selection_t0,
				selection_t1 : publisherData.selection_t1,
				context_t0   : publisherData.context_t0,
				context_t1   : publisherData.context_t1
			};
		}
		else
		{
			this.itsTimeInfo = {
				selection_t0 : publisherData.selection_t0,
				selection_t1 : publisherData.selection_t1
			};
		}

		breakdownTimeInfo = this.itsTimeInfo;

		
		if (!this.isVisible())
			return;

		this.sendBreakdownInfoRequest();
	},

	onStatMenuSelectionChanged: function (event, selected_id, menucfg)
	{
		this.newStatSelection(selected_id);
	},

	newStatSelection: function (selected_id)
	{
		var sendRequest = !this.itsStatInfo;

		
		if (this.itsStatInfo && this.itsStatInfo.id == selected_id)
			return;

		var statMetaData = com.actional.DataStore.statList.getSubStatMetadata(selected_id);
		var statinfo = com.actional.DataStore.statList.getStatMetadata(statMetaData.statid, true);

		this.itsStatInfo =
		{
			id	: selected_id,
			statinfo: statinfo,
			substatinfo: statMetaData
		};

		breakdownStatInfo = this.itsStatInfo;

		this.setPaneTitle(' - ' + this.itsStatInfo.statinfo.name);

		saveItemBreakdownMetricsToUserSettings();

		
		if (!this.isVisible())
			return;

		
		
		
		if (sendRequest)
		{
			
			this.sendBreakdownInfoRequest();
		}
		else
		{
			
			
			this.redrawPaneContents();
		}
	},

	onSiteSelectionChanged: function (event, publisherData, subscriberData)
	{
		if (!publisherData)
			return;

		
		if (this.itsSiteInfo && this.itsSiteInfo.type == publisherData.type &&
			this.itsSiteInfo.site_id == publisherData.site_id &&
			this.itsSiteInfo.peersite_id == publisherData.peersite_id)
		{
			return;
		}

		if (publisherData.type == 'nothing' || !publisherData.site_id)
		{
			this.reset();
			var cp = Ext.get("network_breakdown_pane_inner");
			if (cp)
				cp.dom.innerHTML = "<center><i>" + this.getLabel('infoMessage.pleaseMakeASelection') + "</i></center>";
			this.itsSiteInfo = null;
			return;
		}

		this.itsSiteInfo = {
			type : publisherData.type,
			site_id : publisherData.site_id,
			peersite_id : publisherData.peersite_id
		};

		
		if (!this.isVisible())
			return;

		this.sendBreakdownInfoRequest();
	},

	/**
	 * @lastrev fix40464 - Item Breakdown Information Disappears when node is deselected.
	 */
	onStatDomainChanged: function (event, publisherData, subscriberData)
	{
		
		if (this.domainid && this.domainid == publisherData.statdomainid && !publisherData.forceRefresh)
		{
			return;
		}

		this.domainid = publisherData.statdomainid;



		if (!this.domainid)
			this.domainid = 'EVENT';

		
		this.reset();

		if (publisherData.forceRefresh)
		{
			this.sendBreakdownInfoRequest();
			return;
		}

		var cp = Ext.get("network_breakdown_pane_inner");
		if (cp)
			cp.dom.innerHTML = "<center><i>" + this.getLabel('infoMessage.pleaseMakeASelection') + "</i></center>";
		this.itsSiteInfo = null;
	},

	sendBreakdownInfoRequest : function()
	{
		this.reset();

		
		if (!this.itsSiteInfo)
			return;

		
		if (this.domainid == 'EVENT')
			return;

		
		
		
		
		if (!this.itsStatInfo)
		{
			setPaneMessage(this.getNoStatMessage());
			return;
		}

		var mgr = new Ext.Updater("network_breakdown_pane_inner");

		mgr.update({
			url: contextUrl('portal/operations/statistics/item_breakdown.jsp'),
			params:{
				source		: 'ItemBreakdownpane',
				nodeId1		: this.itsSiteInfo.site_id,
				nodeId2		: this.itsSiteInfo.peersite_id,
				tend		: this.itsTimeInfo.selection_t1,
				tstart		: this.itsTimeInfo.selection_t0,
				ttype		: 'interval',
				domain		: this.domainid
			},
			scope: this,
			method: 'GET',
			callback: this.breakdownInfoAccept,
			scripts:true
		});
	},

	breakdownInfoAccept : function(el, success, response, options)
	{
		if (!success)
		{
			setPaneMessage('<font color="red">' + this.getLabel('infoMessage.errorRetrievingData') + '</font>');
			return;
		}

		var delim = '</script>';

		var toEval = response.responseText.substring(
				response.responseText.indexOf('>', response.responseText.indexOf('<script') + 3) + 1,
				response.responseText.indexOf(delim));

		eval(toEval);

		this.redrawPaneContents();
	},

	redrawPaneContents : function()
	{
		breakdown_jsGraphObjects = new Object();

		sort_subnode(breakdown_data.inbound.list, true);
		breakdown_populateTable('breakdowntable_in', true);
		sort_subnode(breakdown_data.outbound.list, false);
		breakdown_populateTable('breakdowntable_out', false);

		this.applyDisplayData();
		applyDisplaySettingsForVisibleGroupMembers();

		this.syncInnerSize();
	},

	getNoStatMessage : function()
	{
		return this.getLabel('infoMessage.selectBreakdownMetric');
	},

	applyDisplayData :function()
	{
		var statkey = this.itsStatInfo.statinfo.id;

		if (!statkey)
		{
			setPaneMessage(this.getNoStatMessage());
			return;
		}

		if (breakdown_data.inbound.list == null && breakdown_data.outbound.list == null)
			return;

		this.updateHeadings(breakdown_getRowObject(true, 'totals').statistics[statkey],
					breakdown_getRowObject(false, 'totals').statistics[statkey],
					this.itsStatInfo.substatinfo, 0);

		
		var list = breakdown_data.inbound.list;
		var zeroStat = false;
		var posForClass = 0;

		
		for (var i = 0; i < list.length; i++)
		{
			var curElem = list[i];
			var curObj = breakdown_getRowObject(true, curElem.keyID);
			var stat = curObj.statistics[statkey];

			var tr_elem = document.getElementById('row_in_' + curElem.keyID);
			if (tr_elem)
			{
				tr_elem.className = posForClass%2==0 ? 'tableform1' : 'tableform2';
			}

			zeroStat = false;

			
			if (curElem.keyID != "totals" &&
				(stat.aggregate && !stat.hasValue) ||
				(!stat.aggregate && stat.displayvalue == '0'))
			{
				zeroStat = true;
			}
			else
				posForClass++;

			
			if (i > 0 && zeroStat)
				setElemVisible(false, document.getElementById('row_in_'+curElem.keyID));
			else
				updateBreakdownStats('in', curElem.keyID, stat, i);

			var arrElem = breakdown_getArrayElem(true, curElem.keyID);
			if (arrElem.children)
			{
				for (var k=1; k < arrElem.children.length; k++)
				{
					var childRowObj = breakdown_getRowObject(true /*in*/, arrElem.children[k].keyID);
					updateBreakdownStats(	'in',
								arrElem.children[k].keyID,
								childRowObj.statistics[statkey],
								'true' + arrElem.keyID + k);
				}
			}
		}

		
		list = breakdown_data.outbound.list;
		var offset = breakdown_data.inbound.list.length;
		posForClass = 0;
		
		for (var j=0; j<list.length; j++)
		{
			zeroStat = false;
			var curElem1 = list[j];
			var curObj1 = breakdown_getRowObject(false, curElem1.keyID);
			var stat1 = curObj1.statistics[statkey];
			var tr_elem1 = document.getElementById('row_out_' + curElem1.keyID);
			if (tr_elem1)
			{
				tr_elem1.className = posForClass%2==0 ? 'tableform1' : 'tableform2';
			}


			
			if (curElem1.keyID != "totals" &&
				(stat1.aggregate && !stat1.hasValue) ||
				(!stat1.aggregate && stat1.displayvalue == '0'))
			{
				zeroStat = true;
			}
			else
				posForClass++;

			
			if (j > 0 && zeroStat)
				setElemVisible(false, document.getElementById('row_out_'+curElem1.keyID));
			else
				updateBreakdownStats('out', curElem1.keyID, stat1, offset+j);

			var arrElem1 = breakdown_getArrayElem(false, curElem1.keyID);
			if (arrElem1.children)
			{
				for (var m = 1; m < arrElem1.children.length; m++)
				{
					var childRowObj1 = breakdown_getRowObject(false /*out*/, arrElem1.children[m].keyID);
					updateBreakdownStats(	'out',
								arrElem1.children[m].keyID,
								childRowObj1.statistics[statkey],
								'false' + curElem1.keyID + m);
				}
			}
		}
	},

	updateHeadings : function(inSummaryStat, outSummaryStat, substatinfo)
	{
		
		var headingHtml = 'Total';
		var inValuesHtml = '';
		var outValuesHtml = '';

		if (inSummaryStat && inSummaryStat.aggregate == true)
		{
			headingHtml = this.getColHeader(substatinfo.name);

			inValuesHtml = htmlForLeftRightAlignment(inSummaryStat.globalmindisplay,
								inSummaryStat.globalmaxdisplay,
								inSummaryStat.globalmintooltip,
								inSummaryStat.globalmaxtooltip);
			outValuesHtml = htmlForLeftRightAlignment(outSummaryStat.globalmindisplay,
								outSummaryStat.globalmaxdisplay,
								outSummaryStat.globalmintooltip,
								outSummaryStat.globalmaxtooltip);
		}
		

		setInnerHtmlToElementWithId('stat_in_heading', headingHtml);
		setInnerHtmlToElementWithId('stat_in_values', inValuesHtml);
		setInnerHtmlToElementWithId('stat_out_heading', headingHtml);
		setInnerHtmlToElementWithId('stat_out_values', outValuesHtml);
	},

	getColHeader: function(name)
	{
		if (name.indexOf('imum') > 0)
			return "Min - Max";
		return name;
	},

	setPaneTitle : function(extra)
	{
		if (extra)
		{

			this.setTitle(this.itsBaseTitle + extra);
			return;
		}

		this.setTitle(this.itsBaseTitle);
	},

	reset : function()
	{
		breakdown_selection = null;
		breakdown_current_group_member_keyid = null;
		breakdown_current_group_member_isInbound = null;
		breakdown_jsGraphObjects = new Object();
		breakdown_data.inbound.list = null;
		breakdown_data.inbound.map = null;
		breakdown_data.outbound.list = null;
		breakdown_data.outbound.map = null;
	},

	getLabel: function(key)
	{
		return com.actional.serverui.technicalview.getMessage('overviewMap.itemBreakdownPane.' + key);
	}
});

Ext.reg('com.actional.serverui.network.ItemBreakdownpane', com.actional.serverui.network.ItemBreakdownpane);

	/**
	 * @lastfix fix36123 - added domainId as an argument; pass it to sendBreakdownChildrenRequest(...)
	 */
	function Breakdown_toggleSubNodeStatsDisplayForGroupMember (isInbound, keyID, domainId)
	{
		var pane = Ext.get("network_breakdown_pane_inner");

		var arrElem = breakdown_getArrayElem(isInbound, keyID);

		if (arrElem.children)
		{
			breakdown_current_group_member_keyid = keyID;
			breakdown_current_group_member_isInbound = isInbound;

			applyGroupMemberDisplaySettings();
		}
		else
		{
			sendBreakdownChildrenRequest(isInbound, keyID, domainId);
		}
	}

	/**
	 * @lastrev fix36325 - pass down nodeid2 for proper statistic computation; pass tstart
	 */
 	function sendBreakdownChildrenRequest (isInbound, keyID, domainId)
 	{
		var rowObj = breakdown_getRowObject(isInbound, keyID);
		var arrElem = breakdown_getArrayElem(isInbound, keyID);

		
		
		
		

		var nodeid1;
		var nodeid2;

		if(breakdown_top_nodeId2) 
		{
			
			if(isInbound)
			{
				nodeid1 = keyID;
				nodeid2 = breakdown_top_nodeId2;
			}
			else
			{
				nodeid1 = breakdown_top_nodeId1;
				nodeid2 = keyID;
			}
		}
		else
		{
			 
			nodeid1 = keyID;
			nodeid2 = undefined;
		}

		var hideNested;
		if (arrElem.list && arrElem.list[arrElem.list.length-1].keyID == keyID)
			hideNested = "true";

		Ext.Ajax.request(
	        {
	        	url: contextUrl('portal/operations/statistics/item_breakdown.jsp'),
	                callback: breakdownChildrenAccept,
	                params:   { 	source		: 'ItemBreakdownpane',
					groupmode	: 'true',
					isinbound	: isInbound,
					nodeId1		: nodeid1,
					nodeId2		: nodeid2,
					hidenestedimage	: hideNested,
					tstart		: breakdownTimeInfo.selection_t0,
					tend		: breakdownTimeInfo.selection_t1,
					ttype		: 'interval',
					domain		: domainId
			},
	                method: 'GET'
		});
	}

	function breakdownChildrenAccept (el, success, response, options)
	{
		if (!success)
		{
			var message = com.actional.serverui.technicalview.getMessage('overviewMap.itemBreakdownPane.infoMessage.errorRetrievingData');
			setPaneMessage('<font color="red">' + message + '</font>');
			return;
		}

		var delim = '</script>';

		var toEval = response.responseText.substring(
				response.responseText.indexOf('>', response.responseText.indexOf('<script') + 3) + 1,
				response.responseText.indexOf(delim));

		eval(toEval);

		applyGroupMemberDisplaySettings();
	}

	/**
	 * @lastrev fix36325 - now show stuff when 1 or more entries. (before it was hiding when only one)
	 */
	function applyGroupMemberDisplaySettings(isInbound, keyID)
	{
		if (typeof isInbound == 'undefined')
			isInbound = breakdown_current_group_member_isInbound;
		if (typeof keyID == 'undefined')
			keyID = breakdown_current_group_member_keyid;

		var statkey = breakdownStatInfo.statinfo.id;

		var highlight = '0';

		var rowObj = breakdown_getRowObject(isInbound, keyID);
		var arrElem = breakdown_getArrayElem(isInbound, keyID);

		var numberOfRowsToCreate = arrElem.children ? arrElem.children.length-1 : 0;
		if (numberOfRowsToCreate < 1)
		{
			
			disableHyperlink(isInbound, keyID);
			return;
		}

		rowObj.childrenVisible = !rowObj.childrenVisible;
		sort_subnode(arrElem.children, isInbound);
		Breakdown_setGroupMemberRowsVisible(isInbound, keyID, rowObj.childrenVisible);

		
		var currentStatsArray = rowObj.statistics;
		var offset = currentStatsArray.length;
		if (arrElem.children)
		{
			for (var k = 1; k < arrElem.children.length; k++)
			{
				var childRowObj = breakdown_getRowObject(isInbound, arrElem.children[k].keyID);
				updateBreakdownStats(isInbound?'in':'out', arrElem.children[k].keyID,
					childRowObj.statistics[statkey], isInbound+keyID+k);
			}
		}
	}

	function setPaneMessage(msg)
	{
		var cp = Ext.get("network_breakdown_pane_inner");
		cp.dom.innerHTML = "<center><i>" + msg + "</i></center>";
	}

	function sort_subnode (arr, inbound)
	{
		if (!arr)
			return;
		var firstElement = arr[0];

		
		arr.splice(0,1);

		if (inbound)
		{
			arr.sort(function(x, y)
			{
				if (!breakdownStatInfo || !breakdownStatInfo.statinfo)
				{
					setPaneMessage(this.getNoStatMessage());
					return 0;
				}

				return compare_subnode(breakdownStatInfo.statinfo.id, x, y, true);
			});
		}
		else
		{
			arr.sort(function(x, y)
			{
				if (!breakdownStatInfo || !breakdownStatInfo.statinfo)
				{
					setPaneMessage(this.getNoStatMessage());
					return 0;
				}

				return compare_subnode(breakdownStatInfo.statinfo.id, x, y, false);
			});
		}

		
		arr.splice(0, 0, firstElement);

		
		for (var i = 1; i < arr.length; i++)
		{
			if (arr[i].children != null)
				sort_subnode(arr[i].children, inbound);
		}
	}

	function compare_subnode (statkey, x, y, inbound)
	{
		var x_obj = breakdown_getRowObject(inbound, x.keyID);
		var y_obj = breakdown_getRowObject(inbound, y.keyID);
		var x_val = null;
		var y_val = null;

		if (x_obj.statistics[statkey].aggregate)
		{
			var highlight = getNormIndexFromLGStatType(breakdownStatInfo.id); 

			if (highlight==0) 
			{
				x_val = x_obj.statistics[statkey].avg;
				y_val = y_obj.statistics[statkey].avg;
			}
			else if (highlight==1) 
			{
				x_val = x_obj.statistics[statkey].max;
				y_val = y_obj.statistics[statkey].max;
			}
			else 
			{
				x_val = x_obj.statistics[statkey].dev;
				y_val = y_obj.statistics[statkey].dev;
			}
		}
		else
		{
			x_val = x_obj.statistics[statkey].total_value;
			y_val = y_obj.statistics[statkey].total_value;
		}

		if (!x_obj.statistics || typeof x_val == 'undefined')
			return 1;
		else if (!y_obj.statistics || typeof y_val == 'undefined')
			return -1;

		if (x_val < y_val)
			return 1;
		else if (x_val > y_val)
			return -1;
		else
			return 0;
	}

	function getNormIndexFromLGStatType (lgstatid)
	{
		var pos = lgstatid.indexOf("_AVERAGE");
		if (pos > 0)
			return 0;

		pos = lgstatid.indexOf("_MAXIMUM");
		if (pos > 0)
			return 1;

		pos = lgstatid.indexOf("_MINIMUM");
		if (pos > 0)
			return 1;

		pos = lgstatid.indexOf("_DEVIATION");
		if (pos > 0)
			return 2;
	}




















function breakdown_addRow(keyID, isInbound, parentKeyID)
{
	var rowObj = new Object();

	
	rowObj.statistics = null;
	rowObj.identity = '';
	rowObj.childrenVisible = false;

	var arrayElem = new Object();
	arrayElem.keyID = keyID;
	arrayElem.children = null;
	arrayElem.parentKeyID = parentKeyID ? parentKeyID : null;

	var parentArrayElem = breakdown_getArrayElem(isInbound, parentKeyID);
	if (parentArrayElem && !parentArrayElem.children)
		parentArrayElem.children = new Array();

	
	if (isInbound)
	{
		if (!breakdown_data.inbound.map)
			breakdown_data.inbound.map = new Object();

		breakdown_data.inbound.map[keyID] = rowObj;

		if (!breakdown_data.inbound.list)
			breakdown_data.inbound.list = new Array();
	}
	else
	{
		if (!breakdown_data.outbound.map)
			breakdown_data.outbound.map = new Object();

		breakdown_data.outbound.map[keyID] = rowObj;

		if (!breakdown_data.outbound.list)
			breakdown_data.outbound.list = new Array();
	}
	var list;
	var matchingKeyID;
	if (parentArrayElem)
	{
		list = parentArrayElem.children;
		matchingKeyID = parentKeyID;
	}
	else
	{
		list = (isInbound) ? breakdown_data.inbound.list : breakdown_data.outbound.list;
		matchingKeyID = keyID;
	}

	var exists = false;
	for (var i=0; i<list.length; i++)
	{
		if (list[i].keyID == matchingKeyID)
		{
			list[i] = arrayElem;
			exists = true;
			break;
		}
	}
	if (!exists)
		list.push(arrayElem);

	return rowObj;
}









function breakdown_updateParentMaxValues(isInbound, keyID, parentKeyID)
{
	if (!keyID || !parentKeyID)
		return;

	var childObj = isInbound ? breakdown_data.inbound.map[keyID] : breakdown_data.outbound.map[keyID];
	var parentObj = isInbound ? breakdown_data.inbound.map[parentKeyID] : breakdown_data.outbound.map[parentKeyID];

	if (!parentObj.statistics || !childObj.statistics)
		return;

	for (var statid in parentObj.statistics)
	{
		childObj.statistics[statid].parentglobalmax  = parentObj.statistics[statid].parentglobalmax;
	}
}

function setTooltip(labelElemId, statistic, normIndex)
{
	var elem = document.getElementById(labelElemId);

	if (!elem || !statistic)
		return;

	if (statistic.hasValue == false)
	{
		elem.title="";
		return;
	}

	if (statistic.aggregate == true)
		elem.title = statistic.tooltipvalue[normIndex];
	else
		elem.title = statistic.tooltipvalue;
}

function getLabel(statistic, normIndex)
{
	if (!statistic)
		return null;

	if (statistic.hasValue == false)
	{
		return 'n/a';
	}

	var newLabelText;

	if (statistic.aggregate == true)
		return statistic.displayvalue[normIndex];
	else
		return statistic.displayvalue;
}

function updateBreakdownStats(statType, index, statistic, jsGraphIndex)
{
	var graphElemId = 'stat_graph_' + statType + '_' + index;
	var labelElemId = 'stat_value_' + statType + '_' + index;

	var jsGraph;
	if (jsGraphIndex != null && breakdown_jsGraphObjects[jsGraphIndex])
		jsGraph = breakdown_jsGraphObjects[jsGraphIndex];
	else
	{
		jsGraph = new jsGraphics(graphElemId);
		breakdown_jsGraphObjects[jsGraphIndex] = jsGraph;
	}

	var normIndex = getNormIndexFromLGStatType(breakdownStatInfo.id);
	setInnerHtmlToElementWithId( labelElemId, getLabel(statistic, normIndex), normIndex);
	setTooltip(labelElemId, statistic, normIndex);
	drawGraphics(graphElemId, statistic, jsGraph, normIndex);
}

function breakdown_getArrayElem(isInbound, keyID)
{
	if (!keyID)
		return null;

	var list = null;
	if (isInbound)
	{
		if (breakdown_data.inbound.list == null)
			breakdown_data.inbound.list = new Array();
		list = 	breakdown_data.inbound.list;
	}
	else
	{
		if (breakdown_data.outbound.list == null)
			breakdown_data.outbound.list = new Array();
		list = 	breakdown_data.outbound.list;
	}

	for (var i=0; i<list.length; i++)
	{
		if (list[i].keyID == keyID)
			return list[i];
	}
	return null;
}

function breakdown_getRowObject(isInbound, keyID)
{
	var rowObj = isInbound ? breakdown_data.inbound.map[keyID] : breakdown_data.outbound.map[keyID];

	if (rowObj)
		return rowObj;

	return null;
}

function breakdown_populateTable(tableID, isInbound)
{
	var tableElem = document.getElementById(tableID);
	if (!tableElem)
		return;
	var list = (isInbound) ? breakdown_data.inbound.list : breakdown_data.outbound.list;
	var currentRowIndex = 0;

	
	for (var i=tableElem.rows.length-1; i>=1; i--)
		tableElem.deleteRow(i);

	
	for (var j=0; j<list.length; j++) 
	{
		var currentArrayElem = list[j];
		if (!breakdown_insertRow(tableElem, ++currentRowIndex, currentArrayElem.keyID, isInbound, true, j<list.length-1))
			--currentRowIndex;

		if (currentArrayElem.children != null && currentArrayElem.children.length>0)
		{
			for (var j=1; j<currentArrayElem.children.length; j++)
			{
				var childKeyID = currentArrayElem.children[j].keyID;
				var currentRowObj = breakdown_getRowObject(isInbound, childKeyID);
				if (!breakdown_insertRow(tableElem, ++currentRowIndex, childKeyID, isInbound,
				    currentRowObj.childrenVisible, j<currentArrayElem.children.length-1))
			    			--currentRowIndex;
			}
		}
	}
}

var breakdon_selection = null;

var breakdown_current_group_member_keyid = null;
var breakdown_current_group_member_isInbound = null;



var breakdown_jsGraphObjects = new Object();
















function breakdown_insertRow(tableElem, pos, keyID, isInbound, isVisible, useT)
{
	var newKeyID = (isInbound ? 'row_in_' : 'row_out_') + keyID;
	if (document.getElementById(newKeyID))
		return false;	

	var rowObj = breakdown_getRowObject(isInbound, keyID);

	var tr_elem = document.getElementById(newKeyID);
	var new_tr_elem = tableElem.insertRow(pos);

	new_tr_elem.className = tr_elem ? tr_elem.className : (pos%2==0?'tableform2':'tableform1');
	new_tr_elem.id = newKeyID;

	var td_1 = new_tr_elem.insertCell(0);
	td_1.style.paddingLeft = '2px';
	td_1.style.paddingTop = '0px';
	td_1.style.paddingBottom = '0px';
	td_1.style.verticalAlign = 'middle';
	td_1.className = new_tr_elem.className;
	td_1.innerHTML = rowObj.identity;

	var td_2 = new_tr_elem.insertCell(1);
	td_2.style.paddingTop = '0px';
	td_2.style.paddingBottom = '0px';
	td_2.style.verticalAlign = 'middle';
	td_2.className = new_tr_elem.className;
	var td_2_div = document.createElement('DIV');
	td_2_div.id = 'stat_value_' + (isInbound ? 'in_' : 'out_') + keyID;
	td_2.appendChild(td_2_div);

	var td_3 = new_tr_elem.insertCell(2);
	td_3.style.paddingTop = '0px';
	td_3.style.paddingBottom = '0px';
	td_3.className = new_tr_elem.className;
	var td_3_div = document.createElement('DIV');
	td_3_div.style.position = 'relative';
	td_3_div.style.width = '120px';
	td_3_div.style.height = '20px';
	td_3_div.id = 'stat_graph_' + (isInbound ? 'in_' : 'out_') + keyID;
	td_3.appendChild(td_3_div);

	
	var imgElem = document.getElementById('treeimg_' + (isInbound?'in':'out') + '_' + keyID);
	if (imgElem)
	{
		if (useT)
			imgElem.src = contextUrl('images/T.png');
		else
			imgElem.src = contextUrl('images/L.png');
	}

	
	if (rowObj.isLeaf)
		disableHyperlink(isInbound, keyID);

	setElemVisible(isVisible, new_tr_elem);
	return true; 
}

function htmlForLeftRightAlignment(value1, value2, title1, title2)
{
	if (!value1)
	{
		value1 = '';
		title1 = '';
	}
	if (!value2)
	{
		value2 = '';
		title2 = '';
	}

	return 	'<table style="border-collapse:collapse;" width="100%"><tr>' +
			'<td class=innerbreakdownheader align=left title="' + title1 + '">' +
			value1 +
			'</td><td class=innerbreakdownheader align=right title="' + title2 + '">' +
			value2 +
			'</td>' +
			'</tr></table>';
}
function drawGraphics(id, statistics, jsGraph, highlightIndex)
{
	var canvasElem = document.getElementById(id);

	if (!canvasElem)
		return;

	if (!jsGraph)
		return;

	jsGraph.clear();

	
	if (nopx(canvasElem.style.width) > 4 && statistics.hasValue == true)
	{
		if (statistics.aggregate == true)
		{
			drawCoolCandle(jsGraph, canvasElem, statistics, highlightIndex);
		}
		else
			drawBar(jsGraph, canvasElem, statistics);

		jsGraph.paint();
	}
	
}


function nopx(txt)
{
	var pos = txt.indexOf('px');
	if(pos == -1)
		return Math.floor(txt);
	return Math.floor(txt.substring(0,pos));
}

function drawBar(drawingCanvasJsGraph, canvasElem, statistics)
{
	var general = computeVars(canvasElem, statistics);

	

	var barSize = Math.round( (statistics.total_value - general.graphmin) * general.unit2Pixel );

	if (barSize < 1)
		barSize = 1;

	drawingCanvasJsGraph.setColor(general.borderColor);
	drawingCanvasJsGraph.drawRect(1, general.centery - general.candleHalf, barSize, (general.candleHalf - 1) * 2 );

	if (barSize > 1)
	{
		
		drawingCanvasJsGraph.setColor(general.shade1Color);
		drawingCanvasJsGraph.fillRect(2, general.centery - general.candleHalf + 1, barSize - 1, (general.candleHalf - 1) * 2 - 1 );
	}
	else
	{
		
		drawingCanvasJsGraph.setColor(general.borderColor);
		drawingCanvasJsGraph.drawRect(2, general.centery - general.candleHalf + 1, barSize - 1, (general.candleHalf - 1) * 2 - 1);
	}
}

function drawCoolCandle(drawingCanvasJsGraph, canvasElem, statistics, highlight)
{
	var general = computeVars(canvasElem, statistics);

	

	var devLowPos = Math.round(((statistics.avg - statistics.dev) - general.graphmin) * general.unit2Pixel);
	var devHighPos = Math.round(((statistics.avg + statistics.dev) - general.graphmin) * general.unit2Pixel);
	var minPos = Math.round((statistics.min - general.graphmin) * general.unit2Pixel);
	var maxPos = Math.round((statistics.max - general.graphmin) * general.unit2Pixel);
	var avgPos = Math.round((statistics.avg - general.graphmin) * general.unit2Pixel);

	
	if (devLowPos < minPos)
		devLowPos = minPos;

	if (devHighPos > maxPos)
		devHighPos = maxPos;

	
	if (avgPos > maxPos)
		avgPos = maxPos;

	if (avgPos < minPos)
		avgPos = minPos;

	drawCoolCandleGraph(drawingCanvasJsGraph, general.centery, avgPos, minPos, maxPos, devLowPos, devHighPos, statistics, highlight);
}

function drawCoolCandleGraph(drawingCanvasJsGraph, centery, avgPos, minPos, maxPos, devLowPos, devHighPos, statistics, highlight)
{
	
	var overallSize = maxPos - minPos;

	var drawMainLine = (overallSize >= 4) ? true : false;
	var drawDevBox = (overallSize >= 6) ? true : false;

	if (drawDevBox == true)
	{
		

		if (devLowPos - minPos < 2)
		{
			devLowPos = minPos + 2;
			if (devLowPos > devHighPos)
			{
				
				devHighPos = devLowPos;
			}
		}

		if (maxPos - devHighPos < 2)
		{
			devHighPos = maxPos - 2;
			if (devHighPos < devLowPos)
			{
				
				devLowPos = devHighPos;
			}
		}
	}

	

	
	drawingCanvasJsGraph.setColor(white); 
	drawingCanvasJsGraph.drawRect(minPos - 1, centery - 5, 2, 9);
	drawingCanvasJsGraph.drawRect(maxPos - 1, centery - 5, 2, 9);

	
	if (drawMainLine == true)
	{
		drawingCanvasJsGraph.drawLine(minPos + 2, centery - 2, maxPos - 2, centery - 2);
		drawingCanvasJsGraph.drawLine(minPos + 2, centery + 1, maxPos - 2, centery + 1);
	}

	
	if (drawDevBox == true)
	{
		var width = devHighPos - devLowPos;
		if (width > 0)
			drawingCanvasJsGraph.drawRect(devLowPos - 1, centery - 6, width + 2, 6);
	}

	
	drawCoolCandleAvgMarquerHighlight(drawingCanvasJsGraph, centery, avgPos, white);

	

	var coolCandleHighlight = highlight; 

	
	if (coolCandleHighlight != 1)
		drawCoolCandleMinMaxLines(drawingCanvasJsGraph, centery, minPos, maxPos, blueBorderColor);

	
	if (drawDevBox == true && coolCandleHighlight != 2)
		drawCoolCandleDevBox(drawingCanvasJsGraph, centery, devLowPos, devHighPos, blueBorderColor, blueShade1Color, blueShade2Color);

	
	if (drawDevBox == true && coolCandleHighlight == 2)
		drawCoolCandleDevBox(drawingCanvasJsGraph, centery, devLowPos, devHighPos, redBorderColor, redShade1Color, redShade2Color);

	
	if (drawMainLine == true && coolCandleHighlight != 1)
		drawCoolCandleMainLine(drawingCanvasJsGraph, centery, minPos, maxPos, blueBorderColor);

	
	if (coolCandleHighlight != 0)
		drawCoolCandleAvgMarquer(drawingCanvasJsGraph, centery, avgPos, blueBorderColor);

	

	
	if (coolCandleHighlight == 1)
		drawCoolCandleMinMaxLines(drawingCanvasJsGraph, centery, minPos, maxPos, redBorderColor);

	
	if (drawMainLine && coolCandleHighlight == 1)
		drawCoolCandleMainLine(drawingCanvasJsGraph, centery, minPos, maxPos, redBorderColor);

	
	if (coolCandleHighlight == 0)
		drawCoolCandleAvgMarquer(drawingCanvasJsGraph, centery, avgPos, redBorderColor);
}

function drawCoolCandleMinMaxLines(drawingCanvasJsGraph, centery, minPos, maxPos, pen)
{
	drawingCanvasJsGraph.setColor(pen);
	drawingCanvasJsGraph.drawLine(minPos, centery - 4, minPos, centery + 3);
	drawingCanvasJsGraph.drawLine(maxPos, centery - 4, maxPos, centery + 3);
}

function drawCoolCandleMainLine(drawingCanvasJsGraph, centery, minPos, maxPos, pen)
{
	drawingCanvasJsGraph.setColor(pen);
	drawingCanvasJsGraph.drawLine(minPos + 2, centery - 1, maxPos - 2, centery - 1);
	drawingCanvasJsGraph.drawLine(minPos + 2, centery, maxPos - 2, centery);
}

function drawCoolCandleDevBox(
	drawingCanvasJsGraph,
	centery, devLowPos, devHighPos,
	pen, shade1Color, shade2Color)
{
	var width = devHighPos - devLowPos;
	if (width > 1)
	{
		
		drawingCanvasJsGraph.setColor(shade2Color);
		drawingCanvasJsGraph.fillRect(devLowPos, centery - 5, width, 4);
		drawingCanvasJsGraph.setColor(pen);
		drawingCanvasJsGraph.drawRect(devLowPos, centery - 5, width, 4);
	}
	else
	{
		
		drawingCanvasJsGraph.setColor(pen);
		drawingCanvasJsGraph.drawLine(devLowPos, centery - 5, devLowPos, centery - 1);
	}
}

function drawCoolCandleAvgMarquer(drawingCanvasJsGraph, centery, avgPos, brush)
{
	drawingCanvasJsGraph.setColor(brush);
	drawingCanvasJsGraph.fillPolygon(
		new Array(	avgPos,		avgPos - 3,	avgPos,		avgPos + 3),
		new Array(	centery + 1,	centery + 4,	centery + 7,	centery + 4));
}

function drawCoolCandleAvgMarquerHighlight(drawingCanvasJsGraph, centery, avgPos, brush)
{
	drawingCanvasJsGraph.setColor(brush);
	drawingCanvasJsGraph.fillPolygon(
		new Array(	avgPos,		avgPos - 3,	avgPos,		avgPos + 3),
		new Array(	centery + 1,	centery + 4,	centery + 7,	centery + 4));
}

function computeVars(canvasElem, statistics)
{
	var shade1ColorVar;
	var shade2ColorVar;
	var borderColorVar;
	var borderStrokeVar;

	var maxStatValue = (typeof statistics.parentglobalmax != 'undefined')? statistics.parentglobalmax : statistics.globalmax;

	if(statistics.alternatecolor == true)
	{
		shade1ColorVar = greyShade1Color;
		shade2ColorVar = greyShade2Color;
		borderColorVar = blueBorderColor;
		borderStrokeVar = blueBorderStroke;
	}
	else
	{
		shade1ColorVar = blueShade1Color;
		shade2ColorVar = blueShade2Color;
		borderColorVar = blueBorderColor;
		borderStrokeVar = blueBorderStroke;
	}

	
	var cellHalfHeightVar = Math.round(nopx(canvasElem.style.height) / 2);
	var centeryVar = cellHalfHeightVar;

	var maxHalfHeightVar = cellHalfHeightVar - 3;
	var candleHalfVar = 5;

	if (candleHalfVar > maxHalfHeightVar)
		candleHalfVar = maxHalfHeightVar;

	if (candleHalfVar < 3)
		candleHalfVar = 3;

	
	unit2PixelVar = nopx(canvasElem.style.width) / (maxStatValue - statistics.globalmin);

	return {
		graphmin: statistics.globalmin,
		graphmax: statistics.globalmax,
		cellHalfHeight: cellHalfHeightVar,
		centery: centeryVar,
		candleHalf: candleHalfVar,
		shade1Color: shade1ColorVar,
		shade2Color: shade2ColorVar,
		borderColor: borderColorVar,
		borderStroke: borderStrokeVar,
		unit2Pixel: unit2PixelVar
		};
}




function applyDisplaySettingsForVisibleGroupMembers()
{
	for (var x in breakdown_data.inbound.map)
	{
		var rowObj = breakdown_getRowObject(true, x);
		if (rowObj && rowObj.childrenVisible)
			Breakdown_setGroupMemberRowsVisible(true, x, true);
	}

	for (var y in breakdown_data.outbound.map)
	{
		var rowObj1 = breakdown_getRowObject(false, y);
		if (rowObj1 && rowObj1.childrenVisible)
			Breakdown_setGroupMemberRowsVisible(false, y, true);
	}
}




function _updateStatisticsForVisibleGroupMembers()
{
	for (var keyID in breakdown_data.inbound.map)
	{
		var rowObj = breakdown_getRowObject(true, keyID);
		var arrElem = breakdown_getArrayElem(true, keyID);
		if (rowObj && rowObj.childrenVisible)
			Breakdown_toggleSubNodeStatsDisplayForGroupMember(true, keyID);
		else
		{
			if (arrElem)
				arrElem.children = null;
		}
	}

	for (var keyID1 in breakdown_data.outbound.map)
	{
		var rowObj = breakdown_getRowObject(false, keyID1);
		var arrElem = breakdown_getArrayElem(false, keyID1);
		if (rowObj && rowObj.childrenVisible)
			Breakdown_toggleSubNodeStatsDisplayForGroupMember(false, keyID1);
		else
		{
			if (arrElem)
				arrElem.children = null;
		}
	}
}
function disableHyperlink(isInbound, keyID)
{
	var linkID = 'link_' + (isInbound?'in':'out') + '_' + keyID;
	var linkElem = document.getElementById(linkID);
	if (!linkElem)
		return;
	var parentElem = linkElem.parentElement ? linkElem.parentElement : linkElem.parentNode;
	var nextItem = linkElem.nextSibling;
	parentElem.insertBefore(linkElem.firstChild,nextItem);
	parentElem.removeChild(linkElem);
	var rowObj = breakdown_getRowObject(isInbound, keyID);
	rowObj.isLeaf = true;
}

/**
 * Either shows or hides the specified row, as determined by the isVisible parameter.
 *
 * @param isInbound	true for inbound, false for outbound
 * @param keyID		keyID of node corresponding to this row
 * @param isVisible	true to show the row, false to hide it
 *
 * @lastrev fix38017 - update the css class to update the image.
 */
function Breakdown_setGroupMemberRowsVisible(isInbound, keyID, isVisible)
{
	var imgID = 'img_' + (isInbound?'in_':'out_') + keyID;
	var imgElem = document.getElementById(imgID);
	if (!imgElem)
		return;

	var rowObj = breakdown_getRowObject(isInbound, keyID);
	var arrElem = breakdown_getArrayElem(isInbound, keyID);

	if (isVisible)
	{
		createGroupMemberRowsIfNecessary(isInbound, keyID, arrElem);
		Ext.fly(imgElem).replaceClass('act-table-sorting-forward', 'act-table-sorting-reverse');
		for (var i=1; i<arrElem.children.length; i++)
		{
			setElemIdVisible(true,'row_' + (isInbound?'in_':'out_') + arrElem.children[i].keyID);
		}
	}
	else
	{
		Ext.fly(imgElem).replaceClass('act-table-sorting-reverse', 'act-table-sorting-forward');
		for (var j=1; j<arrElem.children.length; j++)
		{
			setElemIdVisible(false,'row_' + (isInbound?'in_':'out_') + arrElem.children[j].keyID);
		}
	}
}








function createGroupMemberRowsIfNecessary(isInbound, keyID, arrElem)
{
	var count = arrElem.children.length-1;

	var table_elem = document.getElementById(isInbound ? 'breakdowntable_in' : 'breakdowntable_out');
	if (!table_elem)
		return;

	var tr_elem = document.getElementById('row_' + (isInbound?'in_':'out_') + keyID);
	var startIndex = tr_elem.rowIndex;

	for (var i=1; i<=count; i++)
	{
		if (!document.getElementById('row_' + (isInbound?'in_':'out_') + arrElem.children[i].keyID))
			breakdown_insertRow(table_elem, ++startIndex, arrElem.children[i].keyID, isInbound, true, i<count);
	}
}

function saveItemBreakdownMetricsToUserSettings()
{
	UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, 'breakdownstatselect', breakdownStatInfo.id);
}
