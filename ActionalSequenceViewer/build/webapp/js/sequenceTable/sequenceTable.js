//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceTable/sequenceTable.js $
// Checked in by: $Author: mohamed.sahmoud $
// $Date: 2015-04-14 14:03:31 +0000 (Tue, 14 Apr 2015) $
// $Revision: 64893 $
//---------------------------------------------------------------------------------------------------------------------
// Copyright (c) 2010-2015. Aurea Software, Inc. All Rights Reserved.
//
// You are hereby placed on notice that the software, its related technology and services may be covered by one or
// more United States ("US") and non-US patents. A listing that associates patented and patent-pending products
// included in the software, software updates, their related technology and services with one or more patent numbers
// is available for you and the general public's access at www.aurea.com/legal/ (the "Patent Notice") without charge.
// The association of products-to-patent numbers at the Patent Notice may not be an exclusive listing of associations,
// and other unlisted patents or pending patents may also be associated with the products. Likewise, the patents or
// pending patents may also be associated with unlisted products. You agree to regularly review the products-to-patent
// number(s) association at the Patent Notice to check for updates.
//=====================================================================================================================

Ext.namespace("com.actional.ui");
/**
 *  @lastrev fix39624 - SONAR: Critical: Duplicate property names not allowed in object literals
 */
com.actional.ui.SequenceTable = function()
{
	var SCHEMA = com.actional.sequence.SequenceDataSchema;
	var TABLESCHEMA = com.actional.sequence.SequenceTableDataSchema;
	var SEQUENCECOMMONUTIL = com.actional.sequence.sequenceCommonUtil;
	var getI18nMessages = com.actional.serverui.technicalview.getMessage;

	var MINIMUM_ARROW_DISTANCE = 5;
	var SYNTHETIC_BAR_OPACITY = 45;

	var DEBUG_PIXELPOS = false;

	//TODO: support for multiple gantt tables on the same page
	var tableidprefix = 'gantt-';

	/**  */
	var itsDataStore;

	var itsScalingData;

	var imagesPath = contextUrl("images/");

	var itsLastOverlayXPosition;
	var itsLastCellWidthForScaling;

	var itsMaxActivationColumnWidth = 0; // variable to hold the width the Activation column should expand
	var itsInitialActivationColumnWidth = 0; // width of the Activation column shown without horizantal scrollbar

	/**
	 * render of a site with its icon.
	 *
	 */
	function siteRenderer(levelNumber, val, metaData, record, rowIndex, colIndex, store)
	{
		var iconsrc = record.json[TABLESCHEMA.ROW.SITEICONSRCLx + levelNumber];

		if(!iconsrc)
			return val;

		var h = [];
		h[h.length] = '<img src="';
		h[h.length] = iconsrc;
		h[h.length] = '" width=16 height=16 style="padding-right:4px;vertical-align:middle">';

		h[h.length] = val;

		return h.join('');
	}

	function sequenceRenderer(val, metaData, record, rowIndex, colIndex, store)
	{
		if(!record.json.fault)
			return val;

		return renderFaultIcon(record.json.fault, record) + " " + val;
	}

	function faultRenderer(val, metaData, record, rowIndex, colIndex, store)
	{
		if(!record.json.fault)
			return val;

		return renderFaultIcon(record.json.fault, record) + " " + val;
	}

	function renderFaultIcon(val, record)
	{
		var h = [];

		if(val == 'f' || val == 's')
		{
			var tooltip = record.json.combinedFailureText;

			h[h.length]='<span ';

			if(tooltip)
			{
				h[h.length] = ' title="';
				h[h.length] = com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(tooltip);
				h[h.length] = '"';
			}

			h[h.length]=' class="gantt-';

			if(val == 's')
				h[h.length]='security';

			h[h.length]='fault-icon">&nbsp;&nbsp;</span>';
		}

		return h.join('');
	}

	/** val is a stat_data */
	function statisticSortType(val)
	{
		if(val == undefined || typeof(val) == "string")
			return "";

		// sort on the raw consumer value (or use provider if no consumer)
		var value = val.consumerValue;

		if(value == undefined)
			value = val.providerValue;

		return value;
	}

	/** val is a stat_data */
	function statisticRenderer(val, metaData, record, rowIndex, colIndex, store)
	{
		if(val == undefined || typeof(val) == "string")
			return "";

		if(val.consumerValue == undefined)
			return SEQUENCECOMMONUTIL.formatStatDataValue(val.statType, val.providerValue);

		if(val.providerValue == undefined)
			return SEQUENCECOMMONUTIL.formatStatDataValue(val.statType, val.consumerValue);

		if(val.consumerValue == val.providerValue)
			return SEQUENCECOMMONUTIL.formatStatDataValue(val.statType, val.consumerValue);

		return SEQUENCECOMMONUTIL.formatStatDataValue(val.statType, val.consumerValue) +
			" (*" + SEQUENCECOMMONUTIL.formatStatDataValue(val.statType, val.providerValue) + ")";
	}

	function checkScalingData()
	{
		if(itsScalingData === undefined)
			computeScalingData();

		return itsScalingData !== undefined;
	}

	/**
	 * Custom function used for column renderer
	 * @param {Object} val
	 *
	 *  @lastrev fix38230 - calculate max activation column width
	 */
	function durationBarRenderer(val, metaData, record, rowIndex, colIndex, store)
	{
		if(!checkScalingData())
			return;

		var cellheight = 19;
		var barheight = 13;
		var barposy = Math.floor((cellheight-barheight)/2);

		var barposition = scaledPixelPos(record.json[TABLESCHEMA.ROW.ACTIVATIONSTARTORDER]);
		var barwidth = scaledPixelPos(record.json[TABLESCHEMA.ROW.ACTIVATIONENDORDER]) - barposition;

		// Expand Activation column only when duration bar length exceeds the initial activation column width
		if (rowIndex == 0)
		{
			itsMaxActivationColumnWidth = itsInitialActivationColumnWidth;
		}
		if (itsMaxActivationColumnWidth < (barwidth + barposition + 40))
		{
			itsMaxActivationColumnWidth = (barwidth + barposition) + 40;  // 40px randomly picked to accommodate the time units
		}

		var synthetic = false;

		var color;

		var tooltip = '';

		if(record.json[TABLESCHEMA.ROW.REQUEST] && record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.SYNTHETIC])
			synthetic = true;

		if (record.json[TABLESCHEMA.ROW.REPLY] && record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.SYNTHETIC])
			synthetic = true;

		if(record.json.request && record.json.request.associatedAlert)
		{
			if(record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].alertMessage)
				tooltip += record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].alertMessage;

			if(record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].condition)
				tooltip += " " + record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].condition;

			if(record.json.request.associatedAlert.severity == 'ALARM')
				color = "red";
			else
				color = "yellow";
		}
		else if(record.json.reply && record.json.reply.associatedAlert)
		{
			if(record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].alertMessage)
				tooltip += record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].alertMessage;

			if(record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].condition)
				tooltip += " " + record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].condition;

			if(record.json.reply.associatedAlert.severity == 'ALARM')
				color = "red";
			else
				color = "yellow";
		}
		else if(record.json.reply && record.json.reply.securityFault)
		{
			color = 'securityfault';

			if(record.json.reply[TABLESCHEMA.MESSAGE.FAILURE_TEXT])
				tooltip = record.json.reply[TABLESCHEMA.MESSAGE.FAILURE_TEXT];
		}
		else if(record.json.reply && record.json.reply[TABLESCHEMA.MESSAGE.FAILURE_TEXT])
		{
			color = 'fault';

			tooltip = record.json.reply[TABLESCHEMA.MESSAGE.FAILURE_TEXT];
		}
		else if(record.json.request && record.json.request[TABLESCHEMA.MESSAGE.FAILURE_TEXT])
		{
			color = 'fault';

			tooltip = record.json.request[TABLESCHEMA.MESSAGE.FAILURE_TEXT];
		}
		else if(record.get('managed'))
		{
			color = 'green';
		}
		else
		{
			color = 'desaturated';
		}

		var h = [];

		h[h.length] = '<div';

		h[h.length] = ' class="gantt-cellcanvas"';

		h[h.length] = ' id="';
		h[h.length] = tableidprefix;
		h[h.length] = "cellcanvas";
		h[h.length] = rowIndex;
		h[h.length] = '"';

		h[h.length] = ' style="';

		if(synthetic)
			h[h.length] = 'opacity:0.'+SYNTHETIC_BAR_OPACITY+';filter: alpha(opacity = '+SYNTHETIC_BAR_OPACITY+');';

		h[h.length] = 'height:';
		h[h.length] = cellheight;
		h[h.length] = 'px">';

	// ------------------

		// left and right borders
		// (done using 2 divs inside a bigger one to
		// avoid the box model issue with IE)

		h[h.length] = '<div ';

		h[h.length] = ' id="';
		h[h.length] = tableidprefix;
		h[h.length] = "activationbar";
		h[h.length] = rowIndex;
		h[h.length] = '"';

		h[h.length] = ' class="gantt-activationbar"';

		h[h.length] = ' style="';

		h[h.length] = 'top:';
		h[h.length] = barposy;
		h[h.length] = 'px;';
		h[h.length] = 'left:';
		h[h.length] = barposition;
		h[h.length] = 'px;';

		h[h.length] = 'width:';
		h[h.length] = barwidth+2;
		h[h.length] = 'px;';

		h[h.length] = '">';

			h[h.length] = '<div ';
			h[h.length] = ' class="gantt-activationbar-leftborder';
			if(color == 'desaturated')
			{
				h[h.length] = '-desaturated';
			}

			h[h.length] = '"></div>';


			h[h.length] = '<div ';
			h[h.length] = ' class="gantt-activationbar-rightborder';
			if(color == 'desaturated')
			{
				h[h.length] = '-desaturated';
			}

			h[h.length] = '"></div>';


		h[h.length] = '</div>';

	//-----------------

		// shading of the bar + top and bottom borders
		// the <img> tags (unlike <div>s) does not have the box model issue in IE

		h[h.length] = '<img';

		h[h.length] = ' title="';
		h[h.length] = com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(tooltip);
		h[h.length] = '"';

		h[h.length] = ' class="gantt-activationbar-';
		h[h.length] = color;
		h[h.length] = '"';

		h[h.length] = ' src="';
		h[h.length] = imagesPath;
		h[h.length] = 'gantt/';

		h[h.length] = color;
	    	h[h.length] = 'barshade.png';

		h[h.length] = '" style="';

		if(synthetic)
			h[h.length] = 'opacity:0.'+SYNTHETIC_BAR_OPACITY+';filter: alpha(opacity = '+SYNTHETIC_BAR_OPACITY+');';

		h[h.length] = 'top:';
		h[h.length] = barposy-1;
		h[h.length] = 'px;';
		h[h.length] = 'left:';
		h[h.length] = barposition+1;
		h[h.length] = 'px;';
		h[h.length] = 'width:';
		h[h.length] = barwidth;
		h[h.length] = 'px;';

		h[h.length] = '">';
		h[h.length] = '</img>';

	//-----------------

		// label next to the bar

		if(!synthetic)
		{
			h[h.length] = '<div style="';
			h[h.length] = 'position:absolute;';
			h[h.length] = 'top:';
			h[h.length] = 0;
			h[h.length] = 'px;';
			h[h.length] = 'line-height:';
			h[h.length] = cellheight;
			h[h.length] = 'px;';
			h[h.length] = 'vertical-align:middle;';
			h[h.length] = 'left:';
			h[h.length] = barposition + barwidth + 6;
			h[h.length] = 'px;';
			h[h.length] = '">';

			h[h.length] = SEQUENCECOMMONUTIL.formatStatDataValue("CALL_TIME", record.json[TABLESCHEMA.ROW.DURATION]);

			h[h.length] = '</div>';
		}

		h[h.length] = '</div>';

	    return h.join('');
	}

	// color: 'green'
	//	  'yellow'
	//	  'red'
	//	  'desaturated'
	//
	// arrowtype: 	'request'
	// 	  	'reply'
	//
	// highlight:   undefined (for none)
	//		'fault'
	//		'securityfault'
	//
	// @lastrev fix37378 - Sequence UI: support unavailable data
	function renderArrow(id, h, x, y1, y2, arrowtype, color, tooltip, clippingWidth, synthetic, highlight)
	{
		if(synthetic)	// do not draw synthetic arrows
			return;

		var arrowxpos = x - 5;

		var arrowWidth = 13;

		// "clip" width if required
		if(clippingWidth <= arrowxpos + arrowWidth)
		{
			arrowWidth = clippingWidth-arrowxpos;

			if(arrowWidth <= 0)
			{
				// arrow out of sight completely
				return;
			}
		}

		var headtype;

		if(arrowtype == 'request')
		{
			headtype = 'solid';
		}
		else
		{
			headtype = 'wireframe';
		}

		if(highlight !== undefined)
		{
			var highlightwidth = 9;
			var highlightxpos = x - Math.floor(highlightwidth/2);

			h[h.length] = '<div';
			h[h.length] = ' id="';
			h[h.length] = id;
			h[h.length] = '_h"';
			h[h.length] = ' class="';
			h[h.length] = 'gantt-arrow-highlight-';
			h[h.length] = highlight;
			h[h.length] = '" style="';

			h[h.length] = 'left:';
			h[h.length] = highlightxpos;
			h[h.length] = 'px;';
			h[h.length] = 'top:';
			if(y1 < y2)
				h[h.length] = y1;
			else
				h[h.length] = y2;
			h[h.length] = 'px;';
			h[h.length] = 'height:';
			if(y1 < y2)
				h[h.length] = y2-y1;
			else
				h[h.length] = y1-y2;
			h[h.length] = 'px;';
			h[h.length] = 'width:';
			h[h.length] = highlightwidth;
			h[h.length] = 'px;';
			h[h.length] = '"';

			h[h.length] = '></div>';
		}

		if(y1 < y2)
		{
			// down arrow

			// arrow body
			h[h.length] = '<div';
			h[h.length] = ' id="';
			h[h.length] = id;
			h[h.length] = '"';

			if(tooltip)
			{
				h[h.length] = ' title="';
				h[h.length] = com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(tooltip);
				h[h.length] = '"';
			}

			h[h.length] = ' class="';
			h[h.length] = 'gantt-arrow-body-';
			h[h.length] = arrowtype;
			h[h.length] = '-';
			h[h.length] = color;
			h[h.length] = '" style="';

			h[h.length] = 'left:';
			h[h.length] = arrowxpos;
			h[h.length] = 'px;';
			h[h.length] = 'top:';
			h[h.length] = y1;
			h[h.length] = 'px;';
			h[h.length] = 'height:';
			h[h.length] = (y2-y1)-8;
			h[h.length] = 'px;';
			h[h.length] = 'width:';
			h[h.length] = arrowWidth;
			h[h.length] = 'px;';

			h[h.length] = '"';
			h[h.length] = '></div>';

			// arrow tip
			h[h.length] = '<div';

			if(tooltip)
			{
				h[h.length] = ' title="';
				h[h.length] = com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(tooltip);
				h[h.length] = '"';
			}

			h[h.length] = ' id="';
			h[h.length] = id;
			h[h.length] = '_head"';
			h[h.length] = ' class="';
			h[h.length] = 'gantt-arrow-head-down-';
			h[h.length] = headtype;
			h[h.length] = '-';
			h[h.length] = color;
			h[h.length] = '" style="';

			h[h.length] = 'left:';
			h[h.length] = arrowxpos;
			h[h.length] = 'px;';
			h[h.length] = 'top:';
			h[h.length] = y2 - 8;
			h[h.length] = 'px;';
			h[h.length] = 'width:';
			h[h.length] = arrowWidth;
			h[h.length] = 'px;';

			h[h.length] = '"';
			h[h.length] = '></div>';
		}
		else
		{
			// up arrow

			// arrow tip
			h[h.length] = '<div';
			if(tooltip)
			{
				h[h.length] = ' title="';
				h[h.length] = com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(tooltip);
				h[h.length] = '"';
			}
			h[h.length] = ' id="';
			h[h.length] = id;
			h[h.length] = '_head"';
			h[h.length] = ' class="';
			h[h.length] = 'gantt-arrow-head-up-';
			h[h.length] = headtype;
			h[h.length] = '-';
			h[h.length] = color;
			h[h.length] = '" style="';

			h[h.length] = 'left:';
			h[h.length] = arrowxpos;
			h[h.length] = 'px;';
			h[h.length] = 'top:';
			h[h.length] = y2;
			h[h.length] = 'px;';
			h[h.length] = 'width:';
			h[h.length] = arrowWidth;
			h[h.length] = 'px;';

			h[h.length] = '"';
			h[h.length] = '></div>';

			// arrow body
			h[h.length] = '<div';

			if(tooltip)
			{
				h[h.length] = ' title="';
				h[h.length] = com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(tooltip);
				h[h.length] = '"';
			}

			h[h.length] = ' id="';
			h[h.length] = id;
			h[h.length] = '"';
			h[h.length] = ' class="';
			h[h.length] = 'gantt-arrow-body-';
			h[h.length] = arrowtype;
			h[h.length] = '-';
			h[h.length] = color;
			h[h.length] = '" style="';
			h[h.length] = 'left:';
			h[h.length] = arrowxpos;
			h[h.length] = 'px;';
			h[h.length] = 'top:';
			h[h.length] = y2+8;
			h[h.length] = 'px;';
			h[h.length] = 'height:';
			h[h.length] = (y1-y2)-8;
			h[h.length] = 'px;';
			h[h.length] = 'width:';
			h[h.length] = arrowWidth;
			h[h.length] = 'px;';

			h[h.length] = '"';
			h[h.length] = '></div>';
		}
	}

	function getGanttCellWidth()
	{
		var tableselector = '#'+getGridId();
		var columnid = 'activation';

		var cellDiv = Ext.get(Ext.DomQuery.selectNode(tableselector + ' div.x-grid3-hd-' + columnid));

		if(!cellDiv)
			return undefined;

		return cellDiv.getWidth();
	}

	/**
	 *  @lastrev fix38230 - delayed task is removed
	 */
	function drawOverlay()
	{
		var tableselector = '#'+getGridId();
		var columnid = 'activation';

		var row = 0;

		var bodyDiv = Ext.get(Ext.DomQuery.selectNode(tableselector + ' div.x-grid3-body'));
		var cellDiv = Ext.get(Ext.DomQuery.selectNode(tableselector + ' div.x-grid3-col-' + columnid));
		var scrollerDiv = Ext.get(Ext.DomQuery.selectNode(tableselector + ' div.x-grid3-scroller'));
		var firstRowDiv = Ext.get(Ext.DomQuery.selectNode(tableselector + ' div.x-grid3-row-first'));
		var lastRowDiv  = Ext.get(Ext.DomQuery.selectNode(tableselector + ' div.x-grid3-row-last'));

		if(!bodyDiv || !firstRowDiv || !cellDiv || !scrollerDiv || !lastRowDiv || !checkScalingData())
		{
			var overlay = Ext.get(tableidprefix+'overlay');
			if(overlay)
			{
				overlay.update('');
			}

			// no table with suitable body & 'duration' column found or simply no rows in the table.
			return;
		}

		var cellPos = cellDiv.getOffsetsTo( bodyDiv );

		itsLastOverlayXPosition = cellPos[0];

		var clippingWidth = cellDiv.getWidth() - 3;

		var h = [];

		var overlayDiv = Ext.get(tableidprefix+'overlay');
		if(overlayDiv)
		{
			overlayDiv.setLeft(cellPos[0]);
			overlayDiv.setTop(cellPos[1]);
		}
		else
		{
			// no overlay yet.
			// generate the overlay "container" div at the same time
			h[h.length] = '<div id="';
			h[h.length] = tableidprefix;
			h[h.length] = 'overlay" style="position:absolute;';
			h[h.length] = 'overflow:visible;';
			h[h.length] = 'top:';
			h[h.length] = cellPos[1];
			h[h.length] = 'px;left:';
			h[h.length] = cellPos[0];
			h[h.length] = 'px;width:0px;height:0px;">';
		}

		for(var rowIndex=0; rowIndex<itsDataStore.getCount(); rowIndex++)
		{
			var record = itsDataStore.getAt(rowIndex);

			if(!record.json[TABLESCHEMA.ROW.CONSUMERROWID])
				continue;

			var consumerRowIndex = itsDataStore.indexOfId(record.json[TABLESCHEMA.ROW.CONSUMERROWID]);

			var el = Ext.get(tableidprefix+'activationbar'+rowIndex);
			if(!el)
				continue;

			var consumerEl = Ext.get(tableidprefix+'activationbar'+consumerRowIndex);
			if(!consumerEl)
				continue;

			var barpos = el.getOffsetsTo( cellDiv );
			var consumerbarpos = consumerEl.getOffsetsTo( cellDiv );

			var arrowFrom = consumerbarpos[1];
			var arrowTo = barpos[1];

			if(arrowFrom < arrowTo)
			{
				arrowFrom += 14;
				arrowTo -= 1;
			}
			else
			{
				arrowTo += 14;
				arrowFrom -= 1;
			}

			var marginAdjustmentX = barpos[0] - scaledPixelPos(record.json[TABLESCHEMA.ROW.ACTIVATIONSTARTORDER]);

			// request arrow

			if(record.json[TABLESCHEMA.ROW.REQUEST])
			{
				var requestX = scaledPixelPos(record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.ORDER])
					+ marginAdjustmentX;

				var request_color = 'green';
				var request_tooltip = '';

				var request_synthetic = record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.SYNTHETIC];

				var highlight = undefined;

				if(record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.SECURITY_FAULT])
				{
					highlight = 'securityfault';

					if(record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.FAILURE_TEXT])
						request_tooltip += record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.FAILURE_TEXT] + " ";
				}
				else if(record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.FAILURE_TEXT])
				{
					highlight = 'fault';

					request_tooltip += record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.FAILURE_TEXT] + " ";
				}

				if(record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT])
				{
					if(record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].severity == 'ALARM')
						request_color = 'red';
					else
						request_color = 'yellow';

					if(record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].alertMessage)
						request_tooltip += record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].alertMessage;

					if(record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].condition)
						request_tooltip += " " + record.json[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].condition;
				}

				renderArrow(tableidprefix+'arrow_'+rowIndex, h, requestX, arrowFrom, arrowTo, 'request',
						request_color, request_tooltip, clippingWidth, request_synthetic, highlight);
			}

			// reply arrow

			if(record.json[TABLESCHEMA.ROW.REPLY])
			{
				var replyX = scaledPixelPos(record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ORDER])
					+ marginAdjustmentX + 1;

				var reply_color = 'green';

				var reply_tooltip = '';

				var reply_synthetic = record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.SYNTHETIC];

				var highlight1 = undefined;

				if(record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.SECURITY_FAULT])
				{
					highlight1 = 'securityfault';
					if(record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.FAILURE_TEXT])
						reply_tooltip += record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.FAILURE_TEXT] + " ";
				}
				else if(record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.FAILURE_TEXT])
				{
					highlight1 = 'fault';

					reply_tooltip += record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.FAILURE_TEXT] + " ";
				}

				if(record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT])
				{
					if(record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].severity == 'ALARM')
						reply_color = 'red';
					else
						reply_color = 'yellow';

					if(record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].alertMessage)
						reply_tooltip += record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].alertMessage;

					if(record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].condition)
						reply_tooltip += " " + record.json[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT].condition;
				}

				renderArrow(tableidprefix+'arrow_r_'+rowIndex, h, replyX, arrowTo, arrowFrom, 'reply',
						reply_color, reply_tooltip, clippingWidth, reply_synthetic, highlight1);
			}
		}

		if(overlayDiv)
		{
			overlayDiv.update(h.join(''));
		}
		else
		{
			h[h.length] = '</div>';
			scrollerDiv.insertHtml('beforeEnd', h.join(''));
		}

	}

	/**
	 *  @lastrev fix37420 - disable shadows - it was showing "on top" of the divs sometimes.
	 */
	function fixShadows()
	{
		// TODO: Do custom shadows on activation bars instead. It will be lightweight and we will do them on both the table and
  		// diagram at the same time. At the same time, synchronize the bar look (e.g. mini-rounded corners).

		drawOverlay();
	}

	function refreshGantt()
	{
		itsScalingData = undefined;
		var grid = getGrid();

		if(grid)
			grid.getView().refresh();
	}

	/**
	 *  @lastrev fix37420 - fix condition to when refresh graph
	 */
	function overlayUpdateIfMoved()
	{
		var overlayDiv = Ext.get(tableidprefix+'overlay');

		if(!overlayDiv)
		{
			refreshGantt();
			return;
		}

		var tableselector = '#'+getGridId();
		var columnid = 'activation';

		// get a few table elements	: TODO remove relying on cellcanvas, but still rely on the tableidprefix!!
		var row = 0;
		var bodyDiv = Ext.get(Ext.DomQuery.selectNode('div.x-grid3-body:has(#'+tableidprefix+'cellcanvas'+row+')'));
		var cellDiv = Ext.get(Ext.DomQuery.selectNode(tableselector + ' div.x-grid3-col-' + columnid));

		if(!bodyDiv || !cellDiv)
		{
			refreshGantt();
			return;
		}

		var cellPos = cellDiv.getOffsetsTo( bodyDiv );

		if(itsLastOverlayXPosition != cellPos[0] ||
		   !itsScalingData || itsScalingData.columnWidth != getGanttCellWidth())
		{
			refreshGantt();
			return;
		}

	}

	function init()
	{
		// create the data store
		itsDataStore = new Ext.data.JsonStore(
		{
			idProperty: 'sequence',
			root: 'rows',
			fields :
			[{
				name : 'sequence'
			},
			{
				name : 'requestOrder'
			},
			{
				name : 'siteNameL1'
			},
			{
				name : 'siteNameL2'
			},
			{
				name : 'siteNameL3'
			},
			{
				name : 'siteNameL4'
			},
			{
				name : 'combinedFailureText'
			},
			{
				name : 'activationStartTime'
			},
			{
				name : 'duration'		// activation duration
			},
			{
				name : 'replyResponseTime',	 // reply responseTime (different of duration in case of oneway)
				sortType: statisticSortType
			},
			{
				name : 'fault'			// fault or security fault.  ('f' or 's' or nothing)
			},
			{
				name : 'requestSize',
				sortType: statisticSortType
			},
			{
				name : 'replySize',
				sortType: statisticSortType
			},
			{
				name : 'requestLogicalSize',		// record count for Database for insert/update/other operations
				sortType: statisticSortType
			},
			{
				name : 'replyLogicalSize',		// record count for Database select operations
				sortType: statisticSortType
			},
			{
				name : 'callOpenTime',
				sortType: statisticSortType
			},
			{
				name : 'managed',
				type : 'boolean'
			},
			{
				name : 'consumerDuration'
			},
			{
				name : 'managed',
				type : 'boolean'
			}]
		});
	}

	function getGridId()
	{
		return "sequencetable_grid";
	}

	function getGrid()
	{
		return Ext.getCmp(getGridId());
	}

	function getGridEl()
	{
		return Ext.get(getGridId());
	}

	/**
	 * Returns true if the colIndex present in the visible column list
	 *
	 * @lastrev fix38459 - new method
	 */
	function findInArray(colIndex, array)
	{
		for (var i = 0; i < array.length; ++i)
		{
			if (colIndex == array[i])
				return true;
		}
		false;
	}

	/**
	 * Adds the column index from visible column list
	 *
	 * @lastrev fix38459 - new method
	 */
	function addVisibleColumn(columnIndex, visibleColumns)
	{
		if (!visibleColumns || visibleColumns.length == 0)
		{
			return columnIndex + ',';
		}

		var visibleColArray = visibleColumns.split(",");
		var returnVisibleCol = "";

		if (visibleColArray && visibleColArray.length > 0)
		{
			for (var i = 0; i < visibleColArray.length; ++i)
			{
				if (visibleColArray[i] && visibleColArray[i].length > 0 && visibleColArray[i] != columnIndex)
				{
					returnVisibleCol += visibleColArray[i] + ",";
				}
			}
			returnVisibleCol = returnVisibleCol + columnIndex;
		}
		else
		{
			return columnIndex + ',';
		}
		return returnVisibleCol;
	}

	/**
	 * Removes the column index from visible column list
	 *
	 * @lastrev fix38459 - new method
	 */
	function removeVisibleColumn(columnIndex, visibleColumns)
	{
		if (!visibleColumns || visibleColumns.length == 0)
		{
			return "";
		}

		var visibleColArray = visibleColumns.split(",");
		var returnVisibleCol = "";

		if (visibleColArray && visibleColArray.length > 0)
		{
			for (var i = 0; i < visibleColArray.length; ++i)
			{
				if (visibleColArray[i] && visibleColArray[i].length > 0 && visibleColArray[i] != columnIndex)
				{
					returnVisibleCol += visibleColArray[i] + ",";
				}
			}
		}
		else
		{
			return "";
		}
		return returnVisibleCol;
	}

	/**
	 * @lastrev fix39624 - SONAR: Critical: Duplicate property names not allowed in object literals
	 */
	function getMainPanelConfigObject()
	{
		var visibleColumns = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'seq_cols');
		var cookieSet = false;
		var visibleColArray;

		if (visibleColumns && visibleColumns.length > 0)
		{
			visibleColArray = visibleColumns.split(",");
			if (visibleColArray && visibleColArray.length > 0)
			{
				cookieSet = true;
			}
		}
		else
		{
			// When no cookie is set, add the columns (Order, Site Level1/2/3/4 and Activation)
			// to the visible columns list
			UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, 'seq_cols', "0,1,2,3,4,12");
		}

		return {
			id:'sequencetable',
			layout:'border',
			listeners :
			{
				activate : overlayUpdateIfMoved // TabPanel activation
			},
			items: [
			{
				region:'north',
				id:'sequencetable_message',
				height:'auto',
				bodyCssClass:'sequence-messagepanel'
			},
			{
				xtype: 'grid',
				region:'center',
				store : itsDataStore,
				id : getGridId(),
				// TODO: remember shown/hidden columns & their size
				// stateful: true,
				// stateId: 'alert_'+getGridId(),
				viewConfig :
				{
					autoFill: true,
					listeners:
					{
						refresh : drawOverlay
					}
				},
				autoExpandColumn: 'activation',
				minColumnWidth: 100,  // to avoid columns shrinking while rendering
				colModel: new Ext.grid.ColumnModel( // colModel is defined to handle column appear/disappear events
				{
					columns :
					[{
						id : 'sequence',
						header : getI18nMessages('sequenceTable.header.sequence'),
						width : 50,

						align : 'right',
						sortable : true,
						hidden : cookieSet ? !findInArray("0", visibleColArray) : false,
						dataIndex : 'requestOrder',
						renderer : sequenceRenderer
					},
					{
						id : 'siteL1',
						header : getI18nMessages('sequenceTable.header.siteL1'),
						width : 130,
						sortable : true,
						hidden : cookieSet ? !findInArray("1", visibleColArray) : false,
						renderer : function(val, metaData, record, rowIndex, colIndex, store)
						{
							return siteRenderer(1,val, metaData, record, rowIndex, colIndex, store);
						},
						dataIndex : 'siteNameL1'
					},
					{
						id : 'siteL2',
						header : getI18nMessages('sequenceTable.header.siteL2'),
						width : 130,
						sortable : true,
						hidden : cookieSet ? !findInArray("2", visibleColArray) : false,
						renderer : function(val, metaData, record, rowIndex, colIndex, store)
						{
							return siteRenderer(2,val, metaData, record, rowIndex, colIndex, store);
						},
						dataIndex : 'siteNameL2'
					},
					{
						id : 'siteL3',
						header : getI18nMessages('sequenceTable.header.siteL3'),
						width : 130,
						sortable : true,
						hidden : cookieSet ? !findInArray("3", visibleColArray) : false,
						renderer : function(val, metaData, record, rowIndex, colIndex, store)
						{
							return siteRenderer(3,val, metaData, record, rowIndex, colIndex, store);
						},
						dataIndex : 'siteNameL3'
					},
					{
						id : 'siteL4',
						header : getI18nMessages('sequenceTable.header.siteL4'),
						width : 130,
						sortable : true,
						hidden : cookieSet ? !findInArray("4", visibleColArray) : false,
						renderer : function(val, metaData, record, rowIndex, colIndex, store)
						{
							return siteRenderer(4,val, metaData, record, rowIndex, colIndex, store);
						},
						dataIndex : 'siteNameL4'
					},
					{
						id : 'responseTime',
						header : getI18nMessages('shared.technicalview.responseTime'),
						width : 130,
						sortable : true,
						hidden : cookieSet ? !findInArray(5, visibleColArray) : true,
						dataIndex : 'replyResponseTime',
						renderer : statisticRenderer
					},
					{
						id : 'requestSize',
						header : getI18nMessages('shared.technicalview.requestCallSize'),
						width : 130,
						sortable : true,
						hidden : cookieSet ? !findInArray(6, visibleColArray) : true,
						dataIndex : 'requestSize',
						renderer : statisticRenderer
					},
					{
						id : 'replySize',
						header : getI18nMessages('shared.technicalview.replyCallSize'),
						width : 130,
						sortable : true,
						hidden : cookieSet ? !findInArray(7, visibleColArray) : true,
						dataIndex : 'replySize',
						renderer : statisticRenderer
					},
					{
						id : 'fault',
						header : getI18nMessages('sequenceTable.header.fault'),
						width : 150,
						sortable : true,
						hidden : cookieSet ? !findInArray(8, visibleColArray) : true,
						dataIndex : 'combinedFailureText',
						renderer : faultRenderer
					},
					{
						id : 'requestLogicalSize',
						header : getI18nMessages('shared.technicalview.requestRecords'),
						width : 130,
						sortable : true,
						hidden : cookieSet ? !findInArray(9, visibleColArray) : true,
						dataIndex : 'requestLogicalSize',
						renderer : statisticRenderer
					},
					{
						id : 'replyLogicalSize',
						header : getI18nMessages('shared.technicalview.replyRecords'),
						width : 130,
						sortable : true,
						hidden : cookieSet ? !findInArray(10, visibleColArray) : true,
						dataIndex : 'replyLogicalSize',
						renderer : statisticRenderer
					},
					{
						id : 'callOpenTime',
						header : getI18nMessages('shared.technicalview.callOpenTime'),
						width : 130,
						sortable : true,
						hidden : cookieSet ? !findInArray(11, visibleColArray) : true,
						dataIndex : 'callOpenTime',
						renderer : statisticRenderer
					},
					{
						id : 'activation',
						header : getI18nMessages('sequenceTable.header.activation'),
						width : 780,
						sortable : true,
						renderer : durationBarRenderer,
						autoExpand : true,
						hidden : cookieSet ? !findInArray(12, visibleColArray) : false,
						dataIndex : 'requestOrder'  // this governs the "default order" when sorting by that column
					}],
					listeners:
					{
						// event handler for column appear/disappear events.
						hiddenchange: function(columnModel, columnIndex, hidden)
						{
							var visibleColumns = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'seq_cols');

							if (!hidden)
							{
								visibleColumns = addVisibleColumn(columnIndex, visibleColumns);
							}
							else
							{
								visibleColumns = removeVisibleColumn(columnIndex, visibleColumns);
							}

							UserSettings_Write(UserSettings_Scopes.PAGECOOKIE, 'seq_cols', visibleColumns);

							overlayUpdateIfMoved();
							var thisGrid = Ext.getCmp(getGridId());
							if (thisGrid)
							{
								thisGrid.fireEvent('viewready');
							}
						}
					}
				}),
				stripeRows : true,
				listeners :
				{
					// set the calculated width to Activation column on viewready
					viewready: function()
					{
						var thisGrid = Ext.getCmp(getGridId());
						if (thisGrid)
						{
							thisGrid.getColumnModel().getColumnById('activation').width = itsMaxActivationColumnWidth;
							thisGrid.getView().refresh(true);
						}
					},
					afterrender : function()
					{
						afterRender();
					},
					columnresize : overlayUpdateIfMoved,
					columnmove : overlayUpdateIfMoved,
					sortchange : overlayUpdateIfMoved,
					groupchange : overlayUpdateIfMoved,
					resize : overlayUpdateIfMoved,
					scope : this
				},
				height : '100%',
				width : '100%',
				title : getI18nMessages('sequenceTable.panelTitle')
			}]
		};
	}

	/** @lastrev fix37257 - Sequence: remove duplicate server calls */
	function afterRender()
	{
		OpenAjax.hub.subscribe('com.actional.serverui.sequenceDataChanged',
				onSequenceDataChanged,
				this,
				{source : 'sequenceTable'});

		// Request current sequence data
		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: 'sequenceTable',
			events	: ['com.actional.serverui.sequenceDataChanged']
		});
	}

	/** @lastrev fix38387 - show error message when opened as PCT portlet  */
	function onSequenceDataChanged(event, publisherData, subscriberData)
	{
		if (publisherData.error)
		{
			resetData(null);
			//TODO: show errors to the user in non intrusive way. (e.g. no message boxes)
			//trace('[Temporary debugging]: Cannot display sequence table:' + publisherData.error_message);
			if(window.top.PCT && window.top.PCT.eventmanager)
			{
				if (publisherData.error_message)
				{
					showInternalError(publisherData.error_message);
				}
			}
			return;
		}

		resetData(publisherData.data);
	}

	function computeMaxDurationLabelWidth()
	{
		//TODO: use real measurements - i.e. Ext.util.TextMetrics.measure(elem, "99.9 ms");
		return 40;
	}

	/**
	 *  @lastrev fix37420 - new method
	 */
	function scaledPixelPos(order)
	{
		if(!checkScalingData())
		{
			return order; // dummy number;
		}

		return itsScalingData[order].absolutePixelPos;
	}

	/**
	 *  @lastrev fix38230 - set initial activation column width
	 */
	function computeScalingData()
	{
		var columnwidth = getGanttCellWidth();

		if(columnwidth === undefined)
		{
			itsScalingData = undefined;
			return;
		}

		if(columnwidth == 0)
		{
			itsScalingData = undefined;
			return;
		}

		if(itsDataStore == undefined)
		{
			itsScalingData = undefined;
			return;
		}

		if(itsDataStore.getCount() == 0)
		{
			// nothing to display
			itsScalingData = undefined;
			return;
		}

		var scalingData = [];

		// to discard the Activation column width value of previous data store
		if (itsInitialActivationColumnWidth != 0 && itsInitialActivationColumnWidth < columnwidth)
		{
			columnwidth = itsInitialActivationColumnWidth;
		}
		else
		{
			columnwidth -= computeMaxDurationLabelWidth();
			columnwidth -= 25; // blindly account for various stuff and labels

			if(columnwidth < 5)
			{
				// column too narrow to display.
				// but still display it using the most compact way
				columnwidth = 5;
			}

			itsInitialActivationColumnWidth = columnwidth;  // initialize itsInitialActivationColumnWidth
		}
		scalingData.columnWidth = columnwidth;

		// compute absolute pixel positions

		for(var rowIndex=0; rowIndex<itsDataStore.getCount(); rowIndex++)
		{
			var row = itsDataStore.getAt(rowIndex).json;

			var startorder = row[TABLESCHEMA.ROW.ACTIVATIONSTARTORDER];
			var starttime = row[TABLESCHEMA.ROW.ACTIVATIONSTARTTIME];

			addToScalingData(scalingData, startorder, starttime );

			var endorder = row[TABLESCHEMA.ROW.ACTIVATIONENDORDER];
			var endtime = starttime + row[TABLESCHEMA.ROW.DURATION];

			addToScalingData(scalingData, endorder, endtime);

			if(row[TABLESCHEMA.ROW.REPLY])
			{
				addToScalingData(scalingData, row[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.ORDER],
						starttime + row[TABLESCHEMA.ROW.REPLY][TABLESCHEMA.MESSAGE.OFFSETFROMREQUEST]);
			}
		}

		var totalTime = 0;
		var prevItem = undefined;
		for(var i=0; i<scalingData.length; i++)
		{
			var scalingItem = scalingData[i];

			if(scalingItem == undefined)
				continue;

			if(prevItem !== undefined)
			{
				scalingItem.deltaTime = scalingItem.absoluteTimeHint - prevItem.absoluteTimeHint;

				if(scalingItem.deltaTime < 0)
					scalingItem.deltaTime = 0;

				totalTime += scalingItem.deltaTime;
			}

			// prepare for next iteration
			prevItem = scalingItem;
		}

		if(DEBUG_PIXELPOS)
			trace("column width = " + columnwidth + ", totaltime = " + totalTime);

		var totalVariablePixels = columnwidth;

		// avoid bugs leading to infinite loop. 10 iterations should be well enough
		var maxIteration = 10;

		while(maxIteration-- > 0)
		{
			if(DEBUG_PIXELPOS)
				trace("this round: totalVariablePixels left: "+totalVariablePixels);

			var factor;

			if(totalTime > 0)
				factor = totalVariablePixels/totalTime;
			else
				factor = 1;

			var currentPixelPos = 0;

			for(i=0; i<scalingData.length; i++)
			{
				var scalingItem1 = scalingData[i];

				if(scalingItem1 == undefined)
					continue;

				if(scalingItem1.deltaTime !== undefined)
				{
					var pixelSize = Math.round(scalingItem1.deltaTime * factor);

					if(scalingItem1.fixedDeltaPixel == undefined)
					{
						if(pixelSize < MINIMUM_ARROW_DISTANCE)
						{
							pixelSize = MINIMUM_ARROW_DISTANCE;
							scalingItem1.fixedDeltaPixel = pixelSize;
						}
					}
					else
					{
						pixelSize = scalingItem1.fixedDeltaPixel;
					}

					currentPixelPos += pixelSize;
				}

				scalingItem1.absolutePixelPos = currentPixelPos;
			}

			if(currentPixelPos <= columnwidth)
				break; // it fits: all done

			if(totalVariablePixels <= 0)
				break; // too many items to fit. Stop here.

			// reduce the totalVariablePixels by how much it went over.
			totalVariablePixels -= (currentPixelPos - columnwidth);

			if(totalVariablePixels < 0)
				totalVariablePixels = 0; // do a last round with zero variable pixels left
		}

		itsScalingData = scalingData;
	}

	/**
	 *  @lastrev fix37420 - new method
	 */
	function addToScalingData(scalingData, order, time)
	{
		var item = scalingData[order];

		if(item == undefined)
		{
			scalingData[order] = {absoluteTimeHint: time};
			return;
		}

		// keep the biggest time as the "hint"
		item.absoluteTimeHint = Math.max(item.absoluteTimeHint, time);
	}

	/** @param componentid is optional
	 *
	 *  @lastrev fix37267 - new option configure component id
	 */
	function renderTo(containerDiv, componentid)
	{
		var config = getMainPanelConfigObject();

		if(componentid)
			config.id = componentid;

		// create the main panel
		var panel = new Ext.Panel(config);

		panel.render(containerDiv);
	}

	/** @lastrev fix37315 - Display non-intrusive error messages
	 */
	function clearError()
	{
		var gridEl = getGridEl();
		if(gridEl)
		{
			gridEl.unmask();
		}
	}

	/** @lastrev fix37315 - Sequence Table: Display non-intrusive error messages
	 */
	function showInternalError(msg)
	{
		var gridEl = getGridEl();
		if(gridEl)
		{
			gridEl.mask("Internal Error<br>" + msg);
		}
		else
		{
			Ext.Msg.alert("Internal Error", msg);
		}
	}

	/** load a new sequence data
	 * @lastrev fix38230 - clear data store before loading data
	 */
	function resetData(sequenceData)
	{
		clearError();

		var rows = [];

		try
		{
			rows = com.actional.ui.SequenceTableStoreHelper.convertSequenceDataToRows(sequenceData);
		}
		catch ( e )
		{
			showInternalError(e.message);
		}

		try
		{
			TABLESCHEMA.validate(rows);
		}
		catch ( e )
		{
			showInternalError(e.message);
			rows = [];	// clear rows
		}

		itsScalingData = undefined;

		// clear data store and shrink the columns before loading data
		var thisGrid = Ext.getCmp(getGridId());
		if (thisGrid)
		{
			thisGrid.getStore().clearData();
			thisGrid.getView().refresh(true);
			thisGrid.getView().render();
		}

		itsDataStore.loadData({rows:rows, total:rows.length});

		var userMessage = getUserMessage(sequenceData);
		if(userMessage != null)
			showMessage(userMessage);
		else
			hideMessage();

		fixShadows();

		// fire 'viewready' to set Activation column width whenever
		// a data store is loaded
		if (thisGrid)
		{
			thisGrid.fireEvent('viewready');
		}
	}

	function getUserMessage(data)
	{
		if ( data===undefined || data == null )
			return null;

		var unfinished = data[SCHEMA.TOP_LEVEL_DATA.UNFINISHED_FLOW] !== undefined && data[SCHEMA.TOP_LEVEL_DATA.UNFINISHED_FLOW];
		var missingData = data[SCHEMA.TOP_LEVEL_DATA.MISSING_DATA] !== undefined && data[SCHEMA.TOP_LEVEL_DATA.MISSING_DATA];
		if ( unfinished || missingData )
		{
			var msg = getI18nMessages('shared.technicalview.partialSequence');
			msg += "\n";

			var tooltip = "";

			if ( data[SCHEMA.TOP_LEVEL_DATA.UNFINISHED_FLOW] )
			{
				msg += getI18nMessages('shared.technicalview.unfinishedFlow');
				tooltip = getI18nMessages('shared.technicalview.unfinishedFlowTooltip');
			}

			if ( data[SCHEMA.TOP_LEVEL_DATA.MISSING_DATA] )
			{
				msg += getI18nMessages('shared.technicalview.missingData');
				tooltip = getI18nMessages('shared.technicalview.missingDataTooltip');
			}

			return { msg: msg, tooltip: tooltip };
		}
		else
		{
			return null;
		}
	}

	function showMessage(userMessage)
	{
		var text = userMessage.msg;
		var toolTip = userMessage.tooltip;

		var messagePanel = Ext.getCmp('sequencetable_message');

		var html = "<div class='sequence-messagepanel-icon'></div><div title='" + toolTip + "'>"
				+ com.actional.sequence.sequenceCommonUtil.escapeHtml(text)
				+ "</div>";

		messagePanel.update(html);

		messagePanel.setHeight('auto');
		messagePanel.show();
		messagePanel.ownerCt.doLayout();
	}

	/**
	 *  @lastrev fix38765 - Some times extra tool bar is shown in Sequence table tab
	 */
	function hideMessage()
	{
		var messagePanel = Ext.getCmp('sequencetable_message');

		messagePanel.hide();
		messagePanel.ownerCt.doLayout();
		Ext.getCmp(getGridId()).setPosition(0, 0);
	}

	init();

	return(
	{
		renderTo: renderTo,
		getMainPanelConfigObject: getMainPanelConfigObject,
		resetData: resetData
	});
};

