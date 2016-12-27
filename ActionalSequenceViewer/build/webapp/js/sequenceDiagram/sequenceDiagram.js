//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceDiagram/sequenceDiagram.js $
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

Ext.namespace ( "com.actional.sequence" );

/**
 * @class An Ext-Js panel implementing the sequence diagram as a component
 *
 * @constructor
 * @param config
 * @config
 *   icons: object literal with all used icons or images
 *
 * @lastrev fix39617 - SONAR: Critical: Functions call arguments should not start on new line - javascript
 */
com.actional.sequence.Diagram = function ( config )
{
	// ---- Constants
	var FAILURE_HIGHLIGHTER_OPACITY = 0.75;
	var SYNTHETIC_OPERATIONS_OPACITY = 0.35;
	var ARROW_HEAD_HEIGHT = 11;
	var ARROW_HEAD_WIDTH = 8;
	var DEBUG_COORD = false;
	var DEBUG_LINE_COORD = false;
	var DEBUG_MSG_DATA = false;
	var MODE_DISPLAY_BASED_ON_MSG_ORDER_NBR = true; // When false it displays as we used to in 8.2.2
	var ENABLE_PENDING_ACTIVATION = true;  // to display parallel processing: when true, display either parallel or like recursion, when false, display activation bar on top of one another.
	var SHOW_PARALLEL_ACTIVATION_BAR_LIKE_RECURSION = false; // This is relevant when ENABLE_PENDING_ACTIVATION is true
	var MARGIN_BETWEEN_LIFELINE_BOXES = 10;
	var LIFELINE_MIN_WIDTH_TEXT = "Mmm";  // This text will be measured using the life line style and the current browser text size
	var LIFE_LINE_BOXES_STYLE_CLASS = "lifelineBox";
	var LIFE_LINE_BOXES_L1_INFO_STYLE_CLASS = "lifelineBoxL1";
	var LIFE_LINE_BOXES_L2_L3_INFO_STYLE_CLASS = "lifelineBoxL2L3";
	var LIFE_LINE_CALL_OUT_STYLE_CLASS = "lifelineCallout";
	var LINE_CALL_OUT_STYLE_CLASS = "lineCallout";
	var LIFE_LINE_CALL_OUT_L1_STYLE_CLASS = "lifelineL1Callout";
	var LIFE_LINE_CALL_OUT_L2_L3_STYLE_CLASS = "lifelineL2L3Callout";
	var OPERATIONS_STYLE_CLASS = "operationName";
	var OVERFLOW_STYLE = "overflow: hidden;text-overflow: ellipsis;-o-text-overflow: ellipsis;";
	var X_OFFSET_LIFELINE_BOXES = 10;
	var INITIAL_Y_OFFSET_LIFELINE_BOXES = 4;
	var Y_OFFSET_LIFELINE_BOXES = INITIAL_Y_OFFSET_LIFELINE_BOXES;
	var Y_OFFSET_FIRST_SEQUENCE = 8;
	var ACTIVATION_LINE_WIDTH = 15;
	var HALF_ACTIVATION_LINE_WIDTH = Math.round ( ACTIVATION_LINE_WIDTH / 2 );
	var HALF_ACTIVATION_LINE_WIDTH_RIGHT = ACTIVATION_LINE_WIDTH - HALF_ACTIVATION_LINE_WIDTH;
	var HEIGHT_OFFSET_FOR_RECURSION_ON_ACTIVATION_BAR = 20;
	var MAX_CONCURRENT_PROCESSING_COLORS = 10;
	var LEGEND_ICON_WIDTH = 32;
	var INDIVIDUAL_EXPANDER_HEIGHT = 10;
	var INDIVIDUAL_EXPANDER_WIDTH = 10;
	var GLOBAL_EXPANDER_HANDLE_HEIGHT = 16;
	var GLOBAL_EXPANDER_HANDLE_MARGIN = 4;
	var GLOBAL_EXPANDER_HORIZONTAL_BAR_WIDTH = 100 - (2*GLOBAL_EXPANDER_HANDLE_MARGIN);
	var MIN_TOTAL_CALL_NUMBER_TO_PRECOLLAPSE_DIAGRAM = 30;
	
	var HIGHLIGHTER_SCHEMA =
		{ DRAW_HIGHLIGHTER: 'draw'
		, TITLE: 'title'
		, STYLE: 'style'
		};

	// Synonym to make code more readable
	var SCHEMA = com.actional.sequence.SequenceDataSchema;
	var getI18nMessages = com.actional.serverui.technicalview.getMessage;

	// ---- Object State
	var itsDiagramLogic;
	var itsPanel;
	var itsMainPanel;
	var itsDiagramContentPanelEl;
	var itsMainPanelEl;
	var itsElToMeasureOperationNames;
	var itsSitesBySiteIdMap; // Map: key: site Id id, value:
	var itsUniqueLLBIdBySiteIdMap; // Map: key: site Id, value: unique llbox id
	var itsLifelineBoxes; // Map: key: unique llbox id, value: lifelinebox
	var itsLifelineBoxesCount;
	var itsLifeLineEls; // Array of all lifelines Ext elements
	var itsMainContentOffsetX;
	var itsMainContentOffsetY;
	var itsFirstSequenceX;
	var itsFirstSequenceY;
	var itsLastSequenceY;
	var itsLastData;
	var itsIcons;
	var itsImagesPath;
	var itsFailureImageTagBegin;
	var itsFailureImageTagEnd;
	var itsDiagramHeight;
	var itsConcurrentProcessingContexts; // map
	var itsNbrConcurrentProcessingContexts;
	var itsToolbar;
	var itsFlagColorConcurrentProcessingUnits = false;
	var itsFlagDisplayOneWayActivationBarUpToReturn = false;
	var itsCheckBoxColorCP;
	var itsCheckBoxColorCPLabel;
    var itsCheckBoxDisplayCallStackOrder;
    var itsCheckBoxDisplayCallStackOrderLabel;
    //var itsCheckBoxDisplayOneWayActivationBarUpToReturn;
    var itsLLBLevels;   // The number of levels to display in life line boxes
	var itsFlagEnableExpandersCollapsers = true;
	var itsCurrentExpandCollapseLevel;
	var itsFlagGlobalExpanderCollapserControlNeedsPositioning;
	var itsFlagDoNotPreCollapse;
	var itsFlagExtVersion4;
	var itsMainPanelConfig;
	var itsEncapsulatingPanelCommonConfig;
	var itsSequenceDiagramCommonConfig;
	var itsMainPanelId;
	var itsEncapsulatingPanelId;
	var itsSequenceDiagramId;
	var itsExpanderId;
	var itsCollapserId;
	var itsExpanderHandleId;
	var itsUniqueId;
    var itsComponentUser;

	init();

	function init () // Constructor
	{
		var version;
		if ( Ext.version !== undefined )
		{
			version = Ext.version;
			itsFlagExtVersion4 = false;
		}
		else
		{
			version = Ext.getVersion();
			itsFlagExtVersion4 = true;
		}				
//		console.log ( "EXT VERSION: " + version + " - itsFlagExtVersion4: " + itsFlagExtVersion4 );

		if ( itsFlagExtVersion4 )
			Ext.tip.QuickTipManager.init();
		else
			Ext.QuickTips.init();


        itsComponentUser = null; // by default no component user: it's the mode used in traditional ui.

		itsDiagramLogic = new com.actional.sequence.SequenceDiagramLogic();

		if ( config.imagesPath === undefined || config.imagesPath == null )
			itsImagesPath = "/lgserver/images/";
		else
			itsImagesPath = config.imagesPath;


		itsFailureImageTagBegin = "<img height='15' width='6' style='z-index: 6; padding-right: 4px; padding-left: 4px; vertical-align: middle;' src='" + itsImagesPath;
		itsFailureImageTagEnd = "'/>";

		itsToolbar = new Ext.Toolbar();
        itsLLBLevels = 3;
		itsFlagDoNotPreCollapse = false;
		itsFlagGlobalExpanderCollapserControlNeedsPositioning = false;

		Ext.EventManager.onWindowResize ( resizeForNewWindowSize );

		if ( !itsFlagExtVersion4
			&& Ext.EventManager.onTextResize !== undefined  // This is needed when using the Ext 3 compatibility files 
			)
    		Ext.EventManager.onTextResize ( resizeForNewTextSize );

		var uniqueId = com.actional.sequence.sequenceCommonUtil.getUniqueTime();
		itsUniqueId = uniqueId;
//		console.log ( "*** Seq Diag: uniqueId: "+uniqueId);
		initPanelsConfigs( uniqueId );
		initExpanderCollapserIds( uniqueId );
	}

	function initExpanderCollapserIds(uniqueId)
	{
		itsExpanderId = 'amsid_expanderId' + uniqueId;
		itsCollapserId = 'amsid_collapserId' + uniqueId;
		itsExpanderHandleId = 'amsid_expanderHandleId' + uniqueId;
	}

	function initPanelsConfigs(uniqueId)
	{
		itsMainPanelId = 'amsid_sequenceDiagramMainPanelId' + uniqueId;
		itsMainPanelConfig =
			{ id: itsMainPanelId
			, layout: 'border'
			, frame: false
			, border: false
			, bodyBorder: false
			, cls: 'sequenceDiagramContainer'
			};

		itsEncapsulatingPanelId = 'amsid_sequenceDiagramScrollPanelId' + uniqueId;
		itsEncapsulatingPanelCommonConfig =
			{ layout: 'fit'
			, region: 'center'
			, border: false
			, split: false
			, header: false
			, collapsible: false
			, autoScroll: true  // This is needed on the parent panel
			, id: itsEncapsulatingPanelId
			};

		itsSequenceDiagramId = 'amsid_sequenceDiagramPanelId'  + uniqueId;
		itsSequenceDiagramCommonConfig =
			{ id: itsSequenceDiagramId 
			, border: false
			, split: false
			, header: false
			, collapsible: false
			, html: '&nbsp;'
			};
	}

	var itsResizeTask = new Ext.util.DelayedTask ( function()
	{
//		outputToConsole("Calling redisplayData from delayed task");
		redisplayData();
	});

	function resizeForNewWindowSize ()
	{
		//		console.log ("resizeForNewWindowSize");

		// When processing this event right away, the panel is not yet to the actual final size.
		// I tried hooking into the events bodyresize and resize but that didn't help.
		// So, for now we use a delayed task to re-size when the panel is actually sized with the new width.
		// Note: If more event comes during that delay, it will be cancelled and we'll wait another x ms.
		itsResizeTask.delay ( 200 );
	}

	function resizeForNewTextSize ( oldSize, newSize )
	{
//		outputToConsole("Calling redisplayData from resizeForNewTextSize");
		redisplayData();
	}

	// , bodyresize: afterPanelResized, resize: afterComponentResize
	//	function afterPanelResized ( panel, theWidth, theHeight )
	//	{
	//		console.log ("resizeForNewWindowSize");
	//		redisplayData ();
	//	}
	//
	//	function afterComponentResize ( component, theWidth, theHeight, rawWidth, rawHeight )
	//	{
	//		console.log ("afterComponentResize");
	//		redisplayData ();
	//	}

	function redisplayData ()
	{
		// ignore first activate
		if ( itsLastData === undefined || itsLastData == null )
			return;

		// We could consider trying to position everything based on where the scroll position is but that's more complicated
		// and it also brings the issue of text size changes, zoom,... between tab activations.  So for now, it's much simpler
		// to do that.  It's doubtful this would be a real issue with customers, so it's not worth all the complication.
		var scrollPanelEl = Ext.get ( itsEncapsulatingPanelId );
		scrollPanelEl.dom.scrollTop = 0;

//		outputToConsole("Calling resetdata from redisplayData");
		resetData ( itsLastData );
	}

	function getMainPanelConfigObject ()
	{
		//the following does not work
		//    	return
		//    		{ html: "&nbsp;xxxxx"
		//	    	, xtype: "panel"
		//	    	, title: 'Sequence Diagram'
		//		    , id: 'sequencemap'
		//	    	};

		var sequenceDiagramPanelConfig = itsSequenceDiagramCommonConfig;
		sequenceDiagramPanelConfig['xtype'] = "box";
		sequenceDiagramPanelConfig['listeners'] = { afterrender: afterRenderConfig };

		var encapsulatingPanelConfig = itsEncapsulatingPanelCommonConfig;
		encapsulatingPanelConfig['xtype'] = "panel";
		encapsulatingPanelConfig['items'] = [ sequenceDiagramPanelConfig ];

		var mainPanelConfig = itsMainPanelConfig;
		mainPanelConfig['xtype'] = "panel";
		mainPanelConfig['listeners'] = { activate: afterPanelActivated };
//		mainPanelConfig['listeners'] = { deactivate: afterPanelDeactivated };
		mainPanelConfig['items'] = [ encapsulatingPanelConfig ];
		mainPanelConfig['tbar'] = itsToolbar;

		return mainPanelConfig;
	}

	function getPanel ()
	{
		if ( itsMainPanel == null )
			createPanels();

		return itsMainPanel;
	}

	function createPanels ()
	{
		var sequenceDiagramPanelConfig = itsSequenceDiagramCommonConfig;
		sequenceDiagramPanelConfig['layout'] = "fit";
		sequenceDiagramPanelConfig['listeners'] = { afterrender: afterRenderPanelsCreatedExplicitly };

		if ( itsFlagExtVersion4 )
//			itsPanel = new Ext.Panel ( sequenceDiagramPanelConfig ); // http://www.sencha.com/forum/showthread.php?125753-components-missing
			itsPanel = new Ext.Component ( sequenceDiagramPanelConfig ); // http://www.sencha.com/forum/showthread.php?125753-components-missing
		else
			itsPanel = new Ext.BoxComponent ( sequenceDiagramPanelConfig );

		// needed to have autoscroll
		var encapsulatingPanelConfig = itsEncapsulatingPanelCommonConfig;
		encapsulatingPanelConfig['items'] = [ itsPanel ];
		var encapsulatingPanel = new Ext.Panel ( encapsulatingPanelConfig );

		var mainPanelConfig = itsMainPanelConfig;
		mainPanelConfig['layout'] = "border";
		mainPanelConfig['items'] = [ encapsulatingPanel ];
		mainPanelConfig['tbar'] = itsToolbar;
		itsMainPanel = new Ext.Panel ( mainPanelConfig );
	}

	function afterRenderPanelsCreatedExplicitly ()
	{
//		console.log ("afterRenderPanelsCreatedExplicitly ");
		itsDiagramContentPanelEl = itsPanel.getEl();
		itsMainPanelEl = itsMainPanel.getEl();
		createToolbarElements ();
	}

	/** @lastrev fix37257 - Sequence: remove duplicate server calls */
	function afterPanelActivated ()
	{
		// ignore first activate
		if ( itsLastData === undefined || itsLastData == null )
			return;

		redisplayData();
	}

	function afterRenderConfig ()
	{
//		console.log ("afterRenderConfig");
		itsDiagramContentPanelEl = Ext.get ( itsSequenceDiagramId );
		itsMainPanelEl = Ext.get ( itsMainPanelId );
		createToolbarElements ();

		if ( itsDiagramContentPanelEl == null || itsMainPanelEl == null )
		{
			reportInternalError ( "Couldn't locate necessary panels" );
			return;
		}

		OpenAjax.hub.subscribe ( 'com.actional.serverui.sequenceDataChanged'
			, onSequenceDataChanged
			, this
			, { source: 'sequenceDiagram'}
			);

		// Request current sequence data
		OpenAjax.hub.publish ( 'com.actional.util.EventRequest'
			, { source: 'sequenceDiagram', events: ['com.actional.serverui.sequenceDataChanged'] }
			);
	}

	function resetToolbarItems ()
	{
		itsFlagColorConcurrentProcessingUnits = false;
		itsCheckBoxColorCP.setValue ( itsFlagColorConcurrentProcessingUnits );
	}

	/** @lastrev fix38387 - show error message when opened as portlet in PCT */
	function onSequenceDataChanged ( event, publisherData )
	{
        // ignore events that are not for this instance of the component
//        debugger;
        if ( publisherData.componentUser !== undefined && itsComponentUser != null )
        {
            if ( publisherData.componentUser != itsComponentUser )
                return;
        }

		resetObjectState( publisherData.data );

		if ( publisherData.error )
		{
			resetData ( null );
			if(window.top.PCT && window.top.PCT.eventmanager)
			{
				if (publisherData.error_message)
				{
					showStatus(publisherData.error_message);
				}
			}
			return;
		}

//		outputToConsole("Calling resetdata from onSequenceDataChanged");
		resetData ( publisherData.data );
		itsLastData = publisherData.data;
	}

	function destroy ()
	{
		itsDiagramLogic = null;
		itsLastData = null;
		itsIcons = null;
		itsLifeLineEls = [];

		if ( itsDiagramContentPanelEl != null )
			clearElementOfPreviousContent ( itsDiagramContentPanelEl );
	}

	function resetExpandCollapseLevel(data)
	{
		if ( data != null && data[SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS] !== undefined )
		{
			if ( data[SCHEMA.TOP_LEVEL_DATA.TOTAL_NBR_CALL] >= MIN_TOTAL_CALL_NUMBER_TO_PRECOLLAPSE_DIAGRAM )
				itsCurrentExpandCollapseLevel = Math.round( ( data[SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS].length - 1 ) / 2 );
			else
				itsCurrentExpandCollapseLevel = 0;

//			outputToConsole("resetExpandCollapseLevel: number Levels: " + data[SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS].length + " - itsCurrentExpandCollapseLevel: " + itsCurrentExpandCollapseLevel + " Total nbr calls: "+data[SCHEMA.TOP_LEVEL_DATA.TOTAL_NBR_CALL]);
		}
		else
			itsCurrentExpandCollapseLevel = 0;
	}

	function resetObjectState( data )
	{
		resetToolbarItems();
		resetExpandCollapseLevel( data );
		itsFlagGlobalExpanderCollapserControlNeedsPositioning = true;
	}

	function resetData ( data )
	{
//		var date1 = new Date();
//		var milliseconds1 = date1.getTime();
//		outputToConsole( "In resetData - itsFlagPanelActivated: " + itsFlagPanelActivated );

		Y_OFFSET_LIFELINE_BOXES = INITIAL_Y_OFFSET_LIFELINE_BOXES;

		itsLastData = data;

		clearElementOfPreviousContent ( itsDiagramContentPanelEl );

		// null data is now a valid case.  It indicates there is no sequence data.
		// We just need to ensure the current diagram is cleared before we return.
		if ( data == null )
		{
			return;
		}

		clearStatus();

		try
		{
			if ( data[SCHEMA.TOP_LEVEL_DATA.CONCURRENT_PROCESSING_DONE] === undefined || !data[SCHEMA.TOP_LEVEL_DATA.CONCURRENT_PROCESSING_DONE] )
				SCHEMA.validate ( data );
		}
		catch ( e )
		{
			showStatus ( e.message );
			return;
		}

		if ( itsFlagEnableExpandersCollapsers )
		{
			if ( data[SCHEMA.TOP_LEVEL_DATA.NBR_CALL_COMPUTED] === undefined || !data[SCHEMA.TOP_LEVEL_DATA.NBR_CALL_COMPUTED] )
			{
				computeCallDepthAndCount ( data );
				computeDiscreteExpanderElementsBasedOnNbrCalls ( data );
				data[SCHEMA.TOP_LEVEL_DATA.NBR_CALL_COMPUTED] = true;
			}

			if ( itsFlagDoNotPreCollapse )
				itsFlagDoNotPreCollapse = false;
			else
				preCollapseCallsExceedingThreshold ( data );

			markMessagesToIgnore ( data[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES] );
		}
		
		var ownData = itsDiagramLogic.cloneDataWithMessagesDeepCopy ( data );

		if ( itsDiagramContentPanelEl == null || itsMainPanelEl == null )
		{
			reportInternalError ( "Rendering panels are not available." );
			return;
		}

		itsIcons = ownData[SCHEMA.TOP_LEVEL_DATA.ALL_ICONS];

		itsMainContentOffsetY = itsDiagramContentPanelEl.getTop();  // tried to get everything to work with local coordinates but couldn't because I had to style the lifelinebox with position absolute (with position relative ext-js set negative coord on them).  so we'll substract  this value to draw things in canvas at correct pos
		itsMainContentOffsetX = itsDiagramContentPanelEl.getLeft();

		createSitesArrayMap ( ownData );
		countAndCreateLifelineBoxes ( ownData );

		var res = itsDiagramLogic.preProcessMessages ( ownData, itsUniqueLLBIdBySiteIdMap, MODE_DISPLAY_BASED_ON_MSG_ORDER_NBR, DEBUG_MSG_DATA, reportInternalError );
		itsConcurrentProcessingContexts = res.concurrentProcessingContexts;
		itsNbrConcurrentProcessingContexts = res.nbrConcurrentProcessingContexts;

		enableUIElements ();

		if ( itsLifelineBoxesCount == 0 )
			return; // no calls at all

		createElToMeasureOperationNames();
		displayDiagram ( data, ownData );

//		outputToConsole("diagram displayed");
		if ( itsFlagEnableExpandersCollapsers && itsFlagGlobalExpanderCollapserControlNeedsPositioning )
		{
			adjustPositionGlobalExpanderHandle( data );
			itsFlagGlobalExpanderCollapserControlNeedsPositioning = false;
		}

//		var date2 = new Date();
//		var milliseconds2 = date2.getTime();
//		var difference = milliseconds2 - milliseconds1;
//		outputToConsole("Timing for resetData: "+difference);
	}

	function enableUIElements ()
	{
		if ( itsNbrConcurrentProcessingContexts > 1 )
		{
			itsCheckBoxColorCP.setVisible( true );
			itsCheckBoxColorCPLabel.setVisible( true );
			var tplt = getI18nMessages('sequenceDiagram.colorConcurrentActivities');
			var label = new Ext.Template ( tplt ).applyTemplate ( [itsNbrConcurrentProcessingContexts] );
			itsCheckBoxColorCPLabel.setText( label );
			itsCheckBoxDisplayCallStackOrder.setVisible( true );
			itsCheckBoxDisplayCallStackOrderLabel.setVisible( true );
		}
		else
		{
			itsCheckBoxColorCP.setVisible( false );
			itsCheckBoxColorCPLabel.setVisible( false );
            itsCheckBoxDisplayCallStackOrder.setVisible( false );
			itsCheckBoxDisplayCallStackOrderLabel.setVisible( false );
		}
	}

	function createElToMeasureOperationNames ()
	{
		var html = "<div style='position:absolute' class='" + OPERATIONS_STYLE_CLASS + "'>&nbsp;</div>";
		itsElToMeasureOperationNames = itsDiagramContentPanelEl.createChild ( html );
		itsElToMeasureOperationNames.setWidth ( 1 );
	}

	function clearElementOfPreviousContent ( contentEl )
	{
		var previousContent = contentEl.query ( "*" );
		for ( var i = 0; i < previousContent.length; i++ )
		{
			var el = Ext.get ( previousContent[i] );
			el.removeAllListeners();
			el.remove();     //Removes this element from the DOM and deletes it from the Ext cache
		}

		itsLifeLineEls = [];
	}

	function displayDiagram ( originalData, copiedData )
	{
		displayWarningIfNeeded ( copiedData );
		displayLifeLineBoxes();
		displaySequences ( copiedData );
		displayLifeLines();
		displayLegend();
	}

	function displayWarningIfNeeded ( data )
	{
		var warningData = getWarningMessages ( data );
		if ( warningData != null )
		{
			var msg = warningData.msg;
			var title = warningData.tooltip;
			var html = "<div title='" + title + "' class='warningBox'><div class='warningBox-icon'></div>"
                    + com.actional.sequence.sequenceCommonUtil.escapeHtml ( msg )
                    + "</div>";

			var el = itsDiagramContentPanelEl.createChild ( html );
			setElementPosition ( el, 0, 0 );
			var h = el.getHeight();
			Y_OFFSET_LIFELINE_BOXES += h;
		}
	}

    function setElementPositionAndDimensions ( el, x, y, w, h )
    {
        setElementPosition ( el, x, y );
        el.setWidth ( w );
		el.setHeight ( h );
    }

    function setElementPosition ( el, x, y )
    {
        el.setX ( Math.round ( x + itsMainContentOffsetX ) );
        el.setY ( Math.round ( y + itsMainContentOffsetY ) );        
    }

	function getWarningMessages ( data )
	{
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

	function computeLegendXPosition()
	{
		var X_OFFSET = 10;
		var x;
		var firstLLB = getFirstLifelineBox();
		var xFirstLLB = firstLLB.el.getLeft();

		// If there is enough room float it to the left of the first LLB, otherwise float it to the left of the first activation box.
		if (( ( xFirstLLB - itsMainContentOffsetX ) - X_OFFSET ) > LEGEND_ICON_WIDTH)
			x = ( xFirstLLB - LEGEND_ICON_WIDTH ) - X_OFFSET;
		else if (( xFirstLLB - itsMainContentOffsetX ) > LEGEND_ICON_WIDTH)
			x = xFirstLLB - LEGEND_ICON_WIDTH;
		else
			x = itsFirstSequenceX - ( LEGEND_ICON_WIDTH + HALF_ACTIVATION_LINE_WIDTH + X_OFFSET );

		if ( x < itsMainContentOffsetX )
			x = itsMainContentOffsetX;

		return x;
	}

	function displayLegend ()
	{
		var el = itsDiagramContentPanelEl.createChild ( "<div style='z-index: 1; position: absolute;'><img src='" + itsImagesPath + "seqDiagram/legendIcon.png'/></div>" );

		var legendTitle = '<div style="text-align: center;"><b>' + getI18nMessages('sequenceDiagram.legendTitle') + '</b></div>';

		var callOut;
		callOut = legendTitle;
		callOut += "<table class='legendCallOutTable'>";

		if ( Ext.isIE )
		{
			callOut += "<tr><td colspan='4'>&nbsp;</td></tr>";
		}

		var align = "center";
		var activationBarHeight = 2.7;
		var activationBarWidth = 0.9;
		var lineWidth = 1.5;
		if ( itsFlagColorConcurrentProcessingUnits )
		{
			var nbrCP;
			if ( itsNbrConcurrentProcessingContexts > MAX_CONCURRENT_PROCESSING_COLORS )
				nbrCP = MAX_CONCURRENT_PROCESSING_COLORS;
			else
				nbrCP = itsNbrConcurrentProcessingContexts;

			for ( var i=1; i<=nbrCP; i+=2 )
			{
				var tplt = getI18nMessages('sequenceDiagram.legendConcurrentActivities');
				var label1 = new Ext.Template ( tplt ).applyTemplate ( [i] );
				var label2 = new Ext.Template ( tplt ).applyTemplate ( [i+1] );
				callOut += "<tr>";
				callOut += "<td align='right' valign='top'>" + getActivationBoxForCPLegend ( activationBarWidth, activationBarHeight, i-1 ) + "&nbsp;</td><td>" + label1 + "</td>";
				callOut += "<td>&nbsp;</td>";

				if ( i+1 <= nbrCP )
					callOut += "<td align='right' valign='top'>" + getActivationBoxForCPLegend ( activationBarWidth, activationBarHeight, i ) + "&nbsp;</td><td>" + label2 + "</td>";
				else
					callOut += "<td align='right' valign='top'>&nbsp;</td><td>&nbsp;</td>";

				callOut += "</tr>";
			}
		}
		else
		{
			callOut += "<tr>";
			callOut += "<td align='right' valign='top'>" + getActivationBoxForLegend ( null, true, false, null, activationBarWidth, activationBarHeight ) + "&nbsp;</td><td>" + getI18nMessages('sequenceDiagram.legendActivationBar') + "</td>";
			callOut += "<td>&nbsp;</td>";
			callOut += "<td align='right' valign='center'>" + getRequestLineForLegend ( null, lineWidth ) + "</td><td valign='" + align + "'>" + getI18nMessages('sequenceDiagram.legendRequest') + "</td>";
			callOut += "</tr>";
			callOut += "<tr>";
			callOut += "<td align='right' valign='top'>" + getActivationBoxForLegend ( null, false, false, null, activationBarWidth, activationBarHeight ) + "&nbsp;</td><td>" + getI18nMessages('sequenceDiagram.legendActivationBarUnmanaged') + "</td>";
			callOut += "<td>&nbsp;</td>";
			callOut += "<td align='right' valign='center'>" + getResponseLineForLegend ( lineWidth ) + "</td><td valign='" + align + "'>" + getI18nMessages('sequenceDiagram.legendResponse') + "</td>";
			callOut += "</tr>";
			callOut += "<tr>";
			callOut += "<td align='right' valign='top'>" + getActivationBoxForLegend ( "alert", false, false, null, activationBarWidth, activationBarHeight ) + "&nbsp;</td><td>" + getI18nMessages('sequenceDiagram.legendActivationBarAlert') + "</td>";
			callOut += "<td>&nbsp;</td>";
			callOut += "<td align='right' valign='center'>" + getRequestLineForLegend ( "alert", lineWidth ) + "</td><td valign='" + align + "'>" + getI18nMessages('sequenceDiagram.legendCallWithAlert') + "</td>";
			callOut += "</tr>";
			callOut += "<tr>";
			callOut += "<td align='right' valign='top'>" + getActivationBoxForLegend ( null, true, false, "failure", activationBarWidth, activationBarHeight ) + "&nbsp;</td><td>" + getI18nMessages('sequenceDiagram.legendActivationBarFault') + "</td>";
			callOut += "<td>&nbsp;</td>";
			callOut += "<td align='right' valign='center'>" + getFailureHighlighterLineForLegend ( lineWidth ) + "</td><td valign='" + align + "'>" + getI18nMessages('sequenceDiagram.legendCallWithFault') + "</td>";
			callOut += "</tr>";
			callOut += "<tr>";
			callOut += "<td align='right' valign='top'>" + getActivationBoxForLegend ( null, true, true, null, activationBarWidth, activationBarHeight ) + "&nbsp;</td><td>" + getI18nMessages('sequenceDiagram.legendActivationBarSecurityFault') + "</td>";
			callOut += "<td>&nbsp;</td>";
			callOut += "<td align='right' valign='center'>" + getSecurityFaultHighlighterLineForLegend ( lineWidth ) + "</td><td valign='" + align + "'>" + getI18nMessages('sequenceDiagram.legendCallWithSecurityFault') + "</td>";
			callOut += "</tr>";
			callOut += "</table>";
		}

		var calloutConfig =
				{ target: el.id
				, anchor: 'top'
				, html: callOut
				, trackMouse: false
				, autoHide: true
//				, title: legendTitle // this screws up the callout (in ext js 4) because it gets positioned absolute over the content. I suppose it is a bug in Ext js 4
//				, autoHide: false // to debug and see the html
//				, closable: true // to debug and see the html
//				, dismissDelay: 10000
				, dismissDelay: 0
				, autoWidth: true
				, baseCls: 'legendCallOut'
				, maxWidth: 500
				};

		if ( !itsFlagExtVersion4 )
		{
			new Ext.ToolTip ( calloutConfig );
		}
		else
		{
			Ext.create('Ext.tip.ToolTip', calloutConfig );
		}

		var x = computeLegendXPosition();
		el.setX ( x );
		el.setY ( itsFirstSequenceY + itsMainContentOffsetY );
	}

	function getActivationBoxForCPLegend ( w, h, concurrentProcessingNbr )
	{
		var styleClass = getStyleClassForActivationBox ( null, false, false, false, null, concurrentProcessingNbr, null );
		var html = "<div class='" + styleClass + "' style=' width: " + w + "em; height: " + h + "em;'/>";
		return html;
	}

	function getActivationBoxForLegend ( alertCallOutContent, flagManaged, securityFault, failureText, w, h )
	{
		var styleClass = getStyleClassForActivationBox ( alertCallOutContent, flagManaged, false, securityFault, failureText, -1, null );
		var html = "<div class='" + styleClass + "' style=' width: " + w + "em; height: " + h + "em;'/>";
		return html;
	}

	function getRequestLineForLegend ( alertCallOutContent, w )
	{
		var styleClass = getRequestLineStyle ( alertCallOutContent, "ALARM" );
		var html = "<div class='" + styleClass + "' style=' width: " + w + "em; height: 2px;'/>";
		return html;
	}

	function getResponseLineForLegend ( w )
	{
		var styleClass = getResponseLineStyle ( null, "ALARM" );
		var html = "<div class='" + styleClass + "' style=' width: " + w + "em; height: 2px;'/>";
		return html;
	}

	function getFailureHighlighterLineForLegend ( w )
	{
		return "<div class='failureHighlighterBox' style=' width: " + w + "em; height: 0.8em;'/>";
	}

	function getSecurityFaultHighlighterLineForLegend ( w )
	{
		return "<div class='replySecurityFaultHighlighterBox' style=' width: " + w + "em; height: 0.8em;'/>";
	}

	function computeHeightBasedOpNameFontSize ()
	{
		var h;
		h = itsElToMeasureOperationNames.getHeight() + 2;

		if ( h < 17 ) // ensure it's at least the size of operation icon
			h = 17;

		if ( DEBUG_MSG_DATA )
			h += 4;

		return h;
	}

	function getFirstLifelineBox ()
	{
		for ( var key in itsLifelineBoxes )
		{
			return itsLifelineBoxes[key];
		}

		return null;
	}

	function getOperationInfo ( toSite )
	{
		var operationName;
		var operationIconUrl;

		var indexLevel;
		if ( toSite[SCHEMA.SITE.ALL_LEVELS].length == 4 )
		{
			indexLevel = 3;
		}
		else
		{
			if ( toSite[SCHEMA.SITE.ALL_LEVELS].length >= 1 )
				indexLevel = toSite[SCHEMA.SITE.ALL_LEVELS].length - 1;
			else
				indexLevel = -1;
		}

		if ( indexLevel == -1 )
		{
			operationName = "";
			operationIconUrl = "";
		}
		else
		{
			var level = toSite[SCHEMA.SITE.ALL_LEVELS][indexLevel];
			operationName = level[SCHEMA.LEVEL.NAME];
			operationIconUrl = SCHEMA.getIconUrl ( level[SCHEMA.LEVEL.ICON], itsIcons );
		}

		var callOut = createLifeLineBoxCallOutHtml ( toSite );

		return { operationName: operationName, operationIconUrl: operationIconUrl, callOut: callOut };
	}

	function getSeverity ( alertData )
	{
		var severity;
		if ( alertData !== undefined && alertData !== null )
			severity = alertData[SCHEMA.ALERT_DATA.SEVERITY];
		else
			severity = "Missing severity";

		return severity;
	}

	function getAlertCallOutContent ( alertData )
	{
		var callOut;
		if ( alertData !== undefined && alertData !== null )
		{
			var msg = alertData[SCHEMA.ALERT_DATA.ALERT_MESSAGE];
			var condition = alertData[SCHEMA.ALERT_DATA.CONDITION];
			callOut = "<div><table class='callout'><tr><th style='text-align:center' valign='center' colspan='2'>"
						+ getI18nMessages('sequenceDiagram.alertCalloutTitle')
						+ "</th></tr>";

			if ( msg !== undefined && alertData != "" )
				callOut += "<tr><td colspan='2'>" + com.actional.sequence.sequenceCommonUtil.escapeHtml ( msg ) + "</td></tr>";

			if ( condition !== undefined && condition != "" )
			{
				callOut += "<tr><th align='left' valign='top'>"
						+ getI18nMessages('sequenceDiagram.alertConditionHeader')
						+ "</th><td>"
						+ com.actional.sequence.sequenceCommonUtil.escapeHtml ( condition )
						+ "</td></tr>";
			}


			callOut += "</table></div>";
		}
		else
			callOut = null;

		return callOut;
	}

	function computeStartCallLineFromPendingActivations ( xStart, fromSiteId, pendingActivationBoxes )
	{
		if ( pendingActivationBoxes[fromSiteId] === undefined )
			return -1;

		if ( ! ENABLE_PENDING_ACTIVATION || ! itsDiagramLogic.isPendingActivation ( fromSiteId, pendingActivationBoxes ) )
			return -1;
		else
		{
			var nbrPendingActivation = itsDiagramLogic.getPendingActivationCount ( fromSiteId, pendingActivationBoxes );
			var recursionCount = itsDiagramLogic.getPendingActivationRecursionCount ( fromSiteId, pendingActivationBoxes );
			var offsetX = getXOffsetFromPendingActivation ( nbrPendingActivation, recursionCount );
			return xStart + offsetX;
		}
	}

	function computeEndCallLineFromPendingActivations ( xStart, lifeLineX, toSiteId, pendingActivationBoxes )
	{
		// Special case first:
		// Check if where we are going to is one way, in which case we don't care about the pending activation
		// since we will display the activation bar shortened to the one way request and not up to the response
		if ( itsDiagramLogic.isPreviousPendingActivationOneWay ( toSiteId, pendingActivationBoxes ) )
			return lifeLineX;

		if ( ! ENABLE_PENDING_ACTIVATION || ! itsDiagramLogic.isPendingActivation ( toSiteId, pendingActivationBoxes ) )
			return lifeLineX;
		else
		{
			var nbrPendingActivation = itsDiagramLogic.getPendingActivationCount ( toSiteId, pendingActivationBoxes );
			var recursionCount = itsDiagramLogic.getPendingActivationRecursionCount ( toSiteId, pendingActivationBoxes );
			var offsetX = getXOffsetFromPendingActivation ( nbrPendingActivation, recursionCount );
			return lifeLineX + offsetX;
		}
	}

	function computeStartReturnLineFromCorrespondingRequest ( correspondingRequest )
    {
        if ( correspondingRequest[SCHEMA.MESSAGE.X_BEGIN_LINE] === undefined
            || correspondingRequest[SCHEMA.MESSAGE.X_END_LINE] === undefined
            || correspondingRequest[SCHEMA.MESSAGE.LINE_POINTING_TO_RIGHT] === undefined
           )
        {
            reportInternalError ( "missing corresponding request coordinates. Message Index: "+correspondingRequest[SCHEMA.MESSAGE.INDEX] + " - Message Order: "+correspondingRequest[SCHEMA.MESSAGE.SEQUENCEORDER] );
        }

        if ( correspondingRequest[SCHEMA.MESSAGE.LINE_POINTING_TO_RIGHT] )
            return correspondingRequest[SCHEMA.MESSAGE.X_END_LINE];
        else
            return correspondingRequest[SCHEMA.MESSAGE.X_END_LINE] - ACTIVATION_LINE_WIDTH;
    }

//	function computeStartReturnLineFromPendingActivations ( xEnd, lifeLineX, toSiteId, pendingActivationBoxes )
//	{
//		// Special case first:
//		// Check if where we are going to is one way, in which case we don't care about the pending activation
//		// since we will display the activation bar shortened to the one way request and not up to the response
//		if ( itsDiagramLogic.isPreviousPendingActivationOneWay ( toSiteId, pendingActivationBoxes ) )
//			return lifeLineX;
//
//		if ( ! ENABLE_PENDING_ACTIVATION || ! itsDiagramLogic.isPendingActivation ( toSiteId, pendingActivationBoxes ) )
//			return lifeLineX;
//		else
//		{
//			var nbrPendingActivation = itsDiagramLogic.getPendingActivationCount ( toSiteId, pendingActivationBoxes );
//			var recursionCount = itsDiagramLogic.getPendingActivationRecursionCount ( toSiteId, pendingActivationBoxes );
//			var offsetX = getXOffsetFromPendingActivation ( nbrPendingActivation, recursionCount );
//			if ( isLineToRight ( lifeLineX, xEnd ) )
//				return lifeLineX + offsetX;
//			else
//				return lifeLineX - offsetX;
//		}
//	}
//
//    function isLineToRight ( xStart, xEnd )
//    {
//        return xStart <= xEnd;
//    }

	function getXOffsetFromPendingActivation ( nbrPendingActivation, recursionCount )
	{
		var offsetX;

		if ( SHOW_PARALLEL_ACTIVATION_BAR_LIKE_RECURSION ) // To look like recursion
		{
			offsetX = ( nbrPendingActivation - 1 ) * HALF_ACTIVATION_LINE_WIDTH_RIGHT;
			offsetX -= recursionCount * HALF_ACTIVATION_LINE_WIDTH_RIGHT;
		}
		else // To look parallel to previous activation line
		{
            var nbrPendingActivationWithoutRecursion = nbrPendingActivation - recursionCount;
            if ( nbrPendingActivationWithoutRecursion > 0 )
			    offsetX = ( nbrPendingActivationWithoutRecursion - 1 ) * ( ACTIVATION_LINE_WIDTH + 1 );
            else
                offsetX = 0;

			offsetX += recursionCount * HALF_ACTIVATION_LINE_WIDTH_RIGHT;
		}

		return offsetX;
	}

	function getRecursionNestingLevel ( siteId, recursionNestingLevelsMap )
	{
		if ( recursionNestingLevelsMap[siteId] === undefined )
			return 0;
		else
			return recursionNestingLevelsMap[siteId];
	}

	function incrementRecursionNestingLevel ( siteId, recursionNestingLevelsMap, idxMsg )
	{
		// special process a recursion on the first message (we don't need to offset anything since we are starting
		// from an empty diagram.
		if ( idxMsg == 0 )
			return 0;
		if ( recursionNestingLevelsMap[siteId] === undefined )
			recursionNestingLevelsMap[siteId] = 1;
		else
			recursionNestingLevelsMap[siteId] = recursionNestingLevelsMap[siteId] + 1;

		return recursionNestingLevelsMap[siteId];
	}

	function decrementRecursionNestingLevel ( siteId, recursionNestingLevelsMap )
	{
		if ( recursionNestingLevelsMap[siteId] === undefined )
			recursionNestingLevelsMap[siteId] = 0;
		else
			recursionNestingLevelsMap[siteId] = recursionNestingLevelsMap[siteId] - 1;
	}

	function getMsgNbrToDisplay ( msg )
	{
		if ( !DEBUG_MSG_DATA )
			return null;

		var msgIndex = msg[SCHEMA.MESSAGE.INDEX];
		var msgOrder = msg[SCHEMA.MESSAGE.NORMALIZED_SEQUENCE_ORDER];
		var concurrentProcessingId = msg[SCHEMA.MESSAGE.CONCURRENT_PROCESSING_ID];

		return "o: " + msgOrder + ", i: " + msgIndex + ", cp: " + concurrentProcessingId;
	}

    function storeDataForMainCP ( msg, llbFrom, concurrentProcessingId, fromLLBId, toPendingActivationBoxes )
    {
        msg[SCHEMA.MESSAGE.LLB_FROM] = llbFrom;  // note: need to remember it since it's not necessarily the first one.

        if ( itsDiagramLogic.isRootConcurrentProcessingId ( concurrentProcessingId ) )
            itsDiagramLogic.startPendingActivation ( fromLLBId, toPendingActivationBoxes, false, false );  // Note: The root activation is with the fromSiteId, all others are with the toSiteId
    }

    function computeYSequenceForReply ( ctx, ySequence, heightForFittingOperation )
    {
		var returnedY = ySequence;
        var CONCURRENT_PROC_SCHEMA = itsDiagramLogic.CONCURRENT_PROC_SCHEMA; // Synonym for readibility

        // only add additional height for bottom of activation bar if there was no recursion before
        if ( ctx[CONCURRENT_PROC_SCHEMA.FLAG_PREVIOUS_REPLY_WAS_FROM_RECURSION] )
            ctx[CONCURRENT_PROC_SCHEMA.FLAG_PREVIOUS_REPLY_WAS_FROM_RECURSION] = false;
        else
            returnedY += heightForFittingOperation; // we use the height of the operation to be symmetrical to the additional height consumed at the top of the activation bar

        return returnedY;
    }

    function displayResponseLine ( flagDisplayResponseLine, correspondingRequest, msgNbrToDisplay, ySequence,
                                   failureText, alertCallOutContent, fromSite, toSite, syntheticOperation,
                                   replySecurityFault, msgStats, severity )
    {
        if ( flagDisplayResponseLine )
        {
            var xReplyStart = correspondingRequest[SCHEMA.MESSAGE.X_END_LINE];
            var xReplyEnd = correspondingRequest[SCHEMA.MESSAGE.X_BEGIN_LINE];
            displayOneReturnLine ( msgNbrToDisplay, xReplyStart, xReplyEnd, ySequence, failureText, alertCallOutContent, fromSite, toSite, syntheticOperation, replySecurityFault, msgStats, severity );
        }
    }

    function computeEndActivation ( correspondingRequest, heightForFittingOperation, ySequence, yStartActivation )
    {
        // compute where to end activation box depending on whether there is a one way in the "mix"
        var yEndActivation;
        if ( correspondingRequest[SCHEMA.MESSAGE.Y_END_ACTIVATION_ONE_WAY] !== undefined && !itsFlagDisplayOneWayActivationBarUpToReturn )
            yEndActivation = correspondingRequest[SCHEMA.MESSAGE.Y_END_ACTIVATION_ONE_WAY] + heightForFittingOperation + 1;
        else if ( ( ySequence - yStartActivation ) < heightForFittingOperation )
            yEndActivation = yStartActivation + heightForFittingOperation;
        else
            yEndActivation = ySequence;
        return yEndActivation;
    }

    function displayAllNeededActivationBoxes ( msg, xStart, yStartActivation, fromSiteManagedFlag, fromLLBId,
                                               alertCallOutContent, severity, syntheticOperation,
                                               replySecurityFault, failureText, concurrentProcessingNbr, llbTo,
                                               ySequence, correspondingRequest, heightForFittingOperation, toLLBId,
                                               toPendingActivationBoxes )
    {
        var yEndActivation = computeEndActivation ( correspondingRequest, heightForFittingOperation, ySequence, yStartActivation );
        var zIndexOffset = getActivationBoxZIndexOffset ( fromLLBId, toPendingActivationBoxes, 0 );
        var ret = getAlertCallOutContentForActivationBox ( correspondingRequest, alertCallOutContent, severity );
		var alertCallOutContentForActivationBox;
		var severityForActivationBox;
		if ( ret === undefined )
		{
			alertCallOutContentForActivationBox = undefined;
			severityForActivationBox = undefined;
		}
		else
		{
			alertCallOutContentForActivationBox = ret.alertCallOutContent;
			severityForActivationBox = ret.severity;
		}

        if ( msg[SCHEMA.MESSAGE.END_CONCURRENT_PROCESSING_UNIT] === undefined )
            displayActivationBox ( xStart, yStartActivation, yEndActivation, fromSiteManagedFlag, zIndexOffset, alertCallOutContentForActivationBox, syntheticOperation, replySecurityFault, failureText, concurrentProcessingNbr, severityForActivationBox );
        else
        {
            if ( msg[SCHEMA.MESSAGE.NBR_REQUEST_IN_CONCURRENT_PROCESSING_UNIT] == 0 )
                displayActivationBox ( xStart, yStartActivation, yEndActivation, fromSiteManagedFlag, zIndexOffset, alertCallOutContentForActivationBox, syntheticOperation, replySecurityFault, failureText, concurrentProcessingNbr, severityForActivationBox );
            else
            {
                var toSiteManagedFlag3 = llbTo.site[SCHEMA.SITE.MANAGED];
                yEndActivation = ySequence;

                if ( correspondingRequest[SCHEMA.MESSAGE.Y_BEGIN_ACTIVATION_FOR_CONPROC_TRANSITION] !== undefined )
                    displayActivationBox ( xStart, correspondingRequest[SCHEMA.MESSAGE.Y_BEGIN_ACTIVATION_FOR_CONPROC_TRANSITION], yEndActivation, toSiteManagedFlag3, zIndexOffset, alertCallOutContentForActivationBox, syntheticOperation, replySecurityFault, failureText, concurrentProcessingNbr, severityForActivationBox );
            }
        }

        if ( msg[SCHEMA.MESSAGE.END_MAIN_CONCURRENT_PROCESSING] !== undefined // special process consumer
           || correspondingRequest[SCHEMA.MESSAGE.DISCONNECTED_ACTIVATION] !== undefined // an activation without any incoming call to it
           )
        {
            var mainLLBFrom = correspondingRequest[SCHEMA.MESSAGE.LLB_FROM];
            var toSiteManagedFlag = mainLLBFrom.site[SCHEMA.SITE.MANAGED];
            if ( correspondingRequest[SCHEMA.MESSAGE.Y_END_ACTIVATION_ONE_WAY] !== undefined )
                yEndActivation = correspondingRequest[SCHEMA.MESSAGE.Y_END_ACTIVATION_ONE_WAY] + heightForFittingOperation + 1;
            else
                yEndActivation = ySequence;

            displayActivationBox ( mainLLBFrom.llx - HALF_ACTIVATION_LINE_WIDTH, correspondingRequest[SCHEMA.MESSAGE.Y_BEGIN_ACTIVATION], yEndActivation, toSiteManagedFlag, 0, null, false, false, null, correspondingRequest[SCHEMA.MESSAGE.CONCURRENT_PROCESSING_ID], null );
            itsDiagramLogic.stopPendingActivation ( toLLBId, toPendingActivationBoxes, false, reportInternalError );
        }
    }

	function setGlobalExpanderHandleX(data, collapserEl, handleEl, expanderEl)
	{
		var handleX;
		var numberLevels;
		if ( data !== undefined && data !==null )
			numberLevels = data[SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS].length;
		else
			numberLevels = 1;
		
		if (numberLevels < 2)
			handleX = collapserEl.getX() + collapserEl.getWidth() + GLOBAL_EXPANDER_HANDLE_MARGIN;
		else
		{
			var handleWidth = handleEl.getWidth();
			if (itsCurrentExpandCollapseLevel == numberLevels - 1)
				handleX = collapserEl.getX() + collapserEl.getWidth() + GLOBAL_EXPANDER_HANDLE_MARGIN;
			else if (itsCurrentExpandCollapseLevel == 0)
				handleX = ( expanderEl.getX() - handleWidth ) - GLOBAL_EXPANDER_HANDLE_MARGIN;
			else
			{
				var nbrPixelsPerLevel = GLOBAL_EXPANDER_HORIZONTAL_BAR_WIDTH / ( numberLevels - 1 );
				var nbrPixelsFromRight = Math.round(itsCurrentExpandCollapseLevel * nbrPixelsPerLevel); // + 1 because levels are 0 based
				nbrPixelsFromRight += Math.round(handleWidth / 2);
				handleX = ( expanderEl.getX() - GLOBAL_EXPANDER_HANDLE_MARGIN ) - nbrPixelsFromRight;
			}
		}

		if (handleX < collapserEl.getX())
			handleX = collapserEl.getX() + GLOBAL_EXPANDER_HANDLE_MARGIN;

		handleEl.setX(handleX);
//		outputToConsole("adjustPositionGlobalExpanderHandle: itsCurrentExpandCollapseLevel: " + itsCurrentExpandCollapseLevel + " - handleX: " + handleX + " - nbrPixelsFromRight: " + nbrPixelsFromRight);
	}

	function adjustPositionGlobalExpanderHandle( data )
	{
		if ( data === undefined || data == null )
		{
			reportInternalError("adjustPositionGlobalExpanderHandle: no data");
			return false;
		}

		var expanderEl = Ext.get( itsExpanderId );
		var collapserEl = Ext.get( itsCollapserId );
		var handleEl = Ext.get( itsExpanderHandleId );
		if ( handleEl == null )
		{
			outputToConsole("adjustPositionGlobalExpanderHandle: no handle Element"); // this is normal in unit test cases.
			return false;
		}

		setGlobalExpanderHandleX(data, collapserEl, handleEl, expanderEl);

		setGlobalExpanderHandleY(handleEl, collapserEl);

		return true;
	}

	function createDragDropOverridesForGlobalExpanderHandle()
	{
		var overrides =
//		{ onDrag: function( evt )
		{ onDrag: function()
			{
//				var x = evt.getPageX();
//				var y = evt.getPageY();
				var expanderEl = Ext.get( itsExpanderId );
				var collapserEl = Ext.get( itsCollapserId );
				var handleEl = Ext.get( itsExpanderHandleId );
				var handleWidth = handleEl.getWidth();
				var xStart = collapserEl.getX() + collapserEl.getWidth() + GLOBAL_EXPANDER_HANDLE_MARGIN;
				var xEnd = ( expanderEl.getX() - handleWidth ) - GLOBAL_EXPANDER_HANDLE_MARGIN;

				if ( handleEl.getX() < xStart )
					handleEl.setX( xStart );
				else if ( handleEl.getX() > xEnd )
					handleEl.setX( xEnd );

				setGlobalExpanderHandleY(handleEl, collapserEl);

				handleEl.setHeight ( GLOBAL_EXPANDER_HANDLE_HEIGHT );
			}
		, endDrag: function( evt )
			{
				if ( itsLastData === undefined || itsLastData == null )
					return;
				
				var expanderEl = Ext.get( itsExpanderId );
				var handleEl = Ext.get( itsExpanderHandleId );
				var handleWidth = handleEl.getWidth();
				var xEnd = ( expanderEl.getX() - handleWidth ) - GLOBAL_EXPANDER_HANDLE_MARGIN;
				var nbrPixelsWhereDraggedFromRight = xEnd - evt.getPageX();
				var numberLevels = itsLastData[SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS].length;
//				outputToConsole ( "endDrag: numberLevels: " + numberLevels + " - xEnd: " + xEnd + " - evt.getPageX(): " + evt.getPageX() + " expanderEl.getX(): " + expanderEl.getX() + " handleWidth: " + handleWidth + " - nbrPixelsWhereDraggedFromRight: " + nbrPixelsWhereDraggedFromRight );

				var level;
				if ( nbrPixelsWhereDraggedFromRight < 0 )
				{
					level = 0;
				}
				else
				{
					var availableWidth = GLOBAL_EXPANDER_HORIZONTAL_BAR_WIDTH;
					var nbrPixelsPerLevel = availableWidth / numberLevels;
					var levelNotRounded = nbrPixelsWhereDraggedFromRight / nbrPixelsPerLevel;
					level = Math.round(levelNotRounded);
//					outputToConsole ( "numberLevels: " + numberLevels + " - availableWidth: " + availableWidth + " - level: " + level + " - nbrPixelsPerLevel: " + nbrPixelsPerLevel );
					if ( level < 0 )
						level = 0;
					else if ( level >= numberLevels )
						level = numberLevels - 1;
				}

//				outputToConsole ( "endDrag: x: " + evt.getPageX() + " - xStart: " + xStart + " - xEnd: " + xEnd + " - level: " + level );

				if ( itsCurrentExpandCollapseLevel != level )
				{
					itsCurrentExpandCollapseLevel = level;
					ProcessExpandCollapseRemaining();
				}
			}
		};

		return overrides;
	}

	function setGlobalExpanderHandleY(handleEl, collapserEl)
	{
		var y;
		if ( Ext.isIE )
			y = collapserEl.getY() + 2;
		else
			y = 2 + collapserEl.getY() - (GLOBAL_EXPANDER_HANDLE_HEIGHT/2);

		handleEl.setY ( y );
//		outputToConsole("setGlobalExpanderHandleY: y: "+y+" - collapserEl.getY(): "+collapserEl.getY());
	}

	function getHtmlForGlobalExpanderCollapserControl ()
	{
		var html = "";
		html += "<span title='" + com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(getI18nMessages('sequenceDiagram.globalCollapseTooltip')) + "' id='" + itsCollapserId + "'><img width='20' height='20' src='" + itsImagesPath + "seqDiagram/collapserLarge.png'/></span>";
		html += "<span><img width='100' height='20' src='" + itsImagesPath + "seqDiagram/expanderBar.png'/></span>";
		html += "<span title='"  + com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(getI18nMessages('sequenceDiagram.globalExpandTooltip')) + "' id='" + itsExpanderId + "'><img width='20' height='20' src='" + itsImagesPath + "seqDiagram/expanderLarge.png'/></span>";

		// this kind of works but the handle is not draggable from the upper part
//		html += "<span id='expanderHandleId' style='position: absolute; background-repeat: no-repeat; background-image: url("+ itsImagesPath + "seqDiagram/Handle.png);'>" +
//				"&nbsp;&nbsp;&nbsp;<img src='" + itsImagesPath + "seqDiagram/HandleHeightSizer.png'/></span>";

		html += "<span id='" + itsExpanderHandleId + "' style='position: absolute;'>" +
				"<img width='8' height='16' src='" + itsImagesPath + "seqDiagram/expanderHandle.png'/></span>";

		return html;
	}

	function finishCreatingGlobalExpanderCollapserControl ()
	{
//		outputToConsole("in finishCreatingGlobalExpanderCollapserControl ");
		var expanderEl = Ext.get( itsExpanderId );
		if ( expanderEl == null )
		{
			outputToConsole("expanderEl null");
			return;
		}
		expanderEl.on ( 'click', globalExpandOneLevel, this, {} );

		var collapserEl = Ext.get( itsCollapserId );
		if ( expanderEl == null )
		{
			outputToConsole("collapserEl null");
			return;
		}

		collapserEl.on ( 'click', globalCollapseOneLevel, this, {} );

		var handleEl = Ext.get( itsExpanderHandleId );
		handleEl.dd = new Ext.dd.DD ( handleEl, 'expanderCollapserHandle', { isTarget: false } );
		Ext.apply ( handleEl.dd, createDragDropOverridesForGlobalExpanderHandle() );

		setGlobalExpanderHandleX(itsLastData, collapserEl, handleEl, expanderEl);

		setGlobalExpanderHandleY(handleEl, collapserEl);

		handleEl.setHeight ( GLOBAL_EXPANDER_HANDLE_HEIGHT );
		handleEl.setWidth ( GLOBAL_EXPANDER_HANDLE_HEIGHT/2 );
//		outputToConsole( "expanderEl X: " + expanderEl.getX() + " y : " + expanderEl.getY() );
//		outputToConsole( "collapserEl X: " + collapserEl.getX() + " y : " + collapserEl.getY() );
//		outputToConsole( "handleEl X: " + handleEl.getX() + " y : " + handleEl.getY() );
	}

	// This means displaying more calls <=> collapse threshold that decreases
	function globalExpandOneLevel()
	{
		if ( itsCurrentExpandCollapseLevel > 0 )
		{
			itsCurrentExpandCollapseLevel--;
			itsFlagGlobalExpanderCollapserControlNeedsPositioning = true;
			ProcessExpandCollapseRemaining();
		}
	}

	function globalCollapseOneLevel()
	{
		if ( itsLastData === undefined || itsLastData == null )
			return; // no data set yet.  ignore this call.

		var maxExpandLevel = itsLastData[SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS].length - 1;
		if ( itsCurrentExpandCollapseLevel < maxExpandLevel )
		{
			itsCurrentExpandCollapseLevel++;
			itsFlagGlobalExpanderCollapserControlNeedsPositioning = true;
        	ProcessExpandCollapseRemaining();
		}
	}

	function setGlobalExpanderCollapserToMinOrMax( flagAllExpanded )
	{
		if ( itsLastData === undefined || itsLastData == null )
			return; // no data set yet.  ignore this call.

		var maxExpandLevel = itsLastData[SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS].length - 1;
		var newLevel;
		if ( flagAllExpanded )
			newLevel = maxExpandLevel;
		else
			newLevel = 0;

		if ( newLevel != itsCurrentExpandCollapseLevel )
		{
			itsCurrentExpandCollapseLevel = newLevel;
			itsFlagGlobalExpanderCollapserControlNeedsPositioning = true;
        	ProcessExpandCollapseRemaining();
		}
	}

	function ProcessExpandCollapseRemaining()
	{
		if ( itsLastData === undefined || itsLastData == null )
			return; // no data set yet.  ignore this call.

		resetIndividualExpanderState();
		redisplayData();
	}

	function resetIndividualExpanderState()
	{
		var allMessages = itsLastData[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES];
		for ( var idxMsg=0; idxMsg<allMessages.length; idxMsg++ )
		{
			if ( allMessages[idxMsg][SCHEMA.MESSAGE.TYPE] == SCHEMA.MESSAGE_TYPE_ENUM.REQUEST )
			{
				allMessages[idxMsg][SCHEMA.MESSAGE.IGNORE] = false;
				allMessages[idxMsg][SCHEMA.MESSAGE.COLLAPSED_STATE] = false;
				allMessages[idxMsg][SCHEMA.MESSAGE.FIRST_IN_CALLSTACK_COLLAPSED] = false;
			}
		}
	}

    function displayIndividualExpander ( x, y, linePointingToRight, requestMsg, fromToHtmlForCallOut, toSite )
    {
		if ( !itsFlagEnableExpandersCollapsers )
			return;

        if ( requestMsg[SCHEMA.MESSAGE.INDEX] == 0 ) 
            return;

        if ( requestMsg[SCHEMA.MESSAGE.BEGIN_SEGMENT] !== undefined && requestMsg[SCHEMA.MESSAGE.BEGIN_SEGMENT] )
            return;

		var expanded = ( requestMsg[SCHEMA.MESSAGE.COLLAPSED_STATE] === undefined || !requestMsg[SCHEMA.MESSAGE.COLLAPSED_STATE] );

		var image;
		if ( expanded )
            image = "seqDiagram/collapserSmall.png);";
		else
			image = "seqDiagram/expanderSmall.png);";

		var html = "<div style='background-image: url("+ itsImagesPath + image
				+ " background-repeat: no-repeat; z-index: 1000;'>&nbsp;</div>";

        var el = itsDiagramContentPanelEl.createChild ( html );
		var htmlCallOut = "<table>";
        htmlCallOut += "<tr><td align='center'>";

		var tplt = getI18nMessages('sequenceDiagram.expanderCollapserStats');
		var callDepth = requestMsg[SCHEMA.MESSAGE.CALL_DEPTH_FROM_HERE];
		var nbrCalls = requestMsg[SCHEMA.MESSAGE.NBR_CALL_FROM_HERE];
		var stats = new Ext.Template ( tplt ).applyTemplate ( [callDepth, nbrCalls] );
		if ( !expanded && toSite !== null )
		{
			var operationInfo = getOperationInfo ( toSite );
			var tplt2 = getI18nMessages('sequenceDiagram.expandCallTo');
			var label = new Ext.Template ( tplt2 ).applyTemplate ( [operationInfo.operationName] );
			htmlCallOut += "<div class='operationName'>" + label + stats + "</div>" + fromToHtmlForCallOut;
		}
		else
        {
            var content = getI18nMessages('sequenceDiagram.collapseCallsFromHere') + stats;
            htmlCallOut += "<div class='operationName'>" + content + "</div>";
        }


		htmlCallOut += "</td></tr></table>";
        
		callOut = addCallOutToElement ( htmlCallOut, el );

// used when displayed on operation line		
//        if ( linePointingToRight )
//            el.setX ( x + 1 );
//        else
//            el.setX ( x - size.width );

		if ( expanded )  // we are displaying the - sign
		{
			if ( linePointingToRight )
				el.setX ( x - ( INDIVIDUAL_EXPANDER_WIDTH + 2 ) );
			else
				el.setX ( x + 2 );
		}
		else   // we are displaying the + sign
		{
			if ( linePointingToRight )
				el.setX ( x - INDIVIDUAL_EXPANDER_WIDTH );
			else
				el.setX ( x + 2 );
		}
//        el.setY ( y - size.height ); // used when displayed on operation line
        el.setY ( y - (INDIVIDUAL_EXPANDER_HEIGHT/2) );
        el.setWidth ( INDIVIDUAL_EXPANDER_WIDTH ); // to not overlap on the operation name
        el.on ( 'click', processExpander, this, { requestMsg: requestMsg, callOut: callOut } );
    }

    function processExpander ( evt, htmlEl, options )
    {
		if ( options.callOut !== undefined && options.callOut != null )
			options.callOut.destroy();

        var copiedRequestMsg = options.requestMsg;
		// need to work on the original data because that's the one that will be used when we redisplay.
        var allMsg = itsLastData[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES];
        var originalRequestMsg = allMsg[copiedRequestMsg[SCHEMA.MESSAGE.INDEX]];
//        alert ('in expander: msg index ' + requestMsg[SCHEMA.MESSAGE.INDEX] );
        if ( originalRequestMsg[SCHEMA.MESSAGE.COLLAPSED_STATE] === undefined )
        {
            copiedRequestMsg[SCHEMA.MESSAGE.COLLAPSED_STATE] = true;
            originalRequestMsg[SCHEMA.MESSAGE.COLLAPSED_STATE] = true;
        }
        else
        {
            if ( originalRequestMsg[SCHEMA.MESSAGE.COLLAPSED_STATE] )
            {
                copiedRequestMsg[SCHEMA.MESSAGE.COLLAPSED_STATE] = false;
                copiedRequestMsg[SCHEMA.MESSAGE.FIRST_IN_CALLSTACK_COLLAPSED] = false;
                originalRequestMsg[SCHEMA.MESSAGE.COLLAPSED_STATE] = false;
                originalRequestMsg[SCHEMA.MESSAGE.FIRST_IN_CALLSTACK_COLLAPSED] = false;
            }
            else
            {
                copiedRequestMsg[SCHEMA.MESSAGE.COLLAPSED_STATE] = true;
                originalRequestMsg[SCHEMA.MESSAGE.COLLAPSED_STATE] = true;
            }
        }

		itsFlagDoNotPreCollapse = true;
        itsResizeTask.delay ( 10 );
    }

    // needs to be called in callstack order
    function computeCallDepthAndCount ( data )
    {
		var allMessages = data[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES];
        var callStack = new com.actional.sequence.CallStack(SCHEMA.MESSAGE.CALL_DEPTH_FROM_HERE);
		var totalCallNbr = 0;
        for ( var idxMsg=0; idxMsg<allMessages.length; idxMsg++ )
        {
            var msg = allMessages[idxMsg];
            if ( msg[SCHEMA.MESSAGE.TYPE] == SCHEMA.MESSAGE_TYPE_ENUM.REQUEST )
            {
                callStack.oneCall( msg );
				msg[SCHEMA.MESSAGE.NBR_CALL_FROM_HERE] = 0;
				totalCallNbr++;
            }
            else
            {
				var parentRequest = callStack.previousCall();
                var matchingRequest = callStack.callReturn();
				incrementCallCount ( matchingRequest, 1 );
				if ( parentRequest != null )
					incrementCallCount ( parentRequest, matchingRequest[SCHEMA.MESSAGE.NBR_CALL_FROM_HERE] );
			}
        }

		data[SCHEMA.TOP_LEVEL_DATA.TOTAL_NBR_CALL] = totalCallNbr;
//		outputToConsole( "data[SCHEMA.TOP_LEVEL_DATA.TOTAL_NBR_CALL]: "+data[SCHEMA.TOP_LEVEL_DATA.TOTAL_NBR_CALL]);
    }

	function computeDiscreteExpanderElementsBasedOnNbrCalls ( data )
	{
		var allMessages = data[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES];
		var uniqueNbrCallsMap = new Object();
		for ( var idxMsg=1; idxMsg<allMessages.length; idxMsg++ ) // note: we skip consumer!
		{
			var msg = allMessages[idxMsg];
			if ( msg[SCHEMA.MESSAGE.TYPE] == SCHEMA.MESSAGE_TYPE_ENUM.REQUEST )
			{
				uniqueNbrCallsMap[msg[SCHEMA.MESSAGE.NBR_CALL_FROM_HERE]] = msg[SCHEMA.MESSAGE.NBR_CALL_FROM_HERE];
			}
		}

		var uniqueNbrOfCalls = [];
		uniqueNbrOfCalls[0] = 0;  // this is to ensure we display all without collapse
		var i=1;
		for ( var key in uniqueNbrCallsMap )
		{
			uniqueNbrOfCalls[i] = uniqueNbrCallsMap[key];
			i++;
		}

		uniqueNbrOfCalls.sort ( function ( a, b ) { return a - b; } );

		data[SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS] = uniqueNbrOfCalls;
//		outputToConsole("data[SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS].length: "+data[SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS].length);

		resetExpandCollapseLevel( data );
	}

	// needs to be called in callstack order
    function preCollapseCallsExceedingThreshold ( data )
    {
		var nbrCallsCollapseThreshold = data[SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS][itsCurrentExpandCollapseLevel];
		var allMessages = data[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES];
		var msgIndex;
		var flagCollapseMsgDownStack = false;
		var callStack = new com.actional.sequence.CallStack();
        for ( var idxMsg=0; idxMsg<allMessages.length; idxMsg++ )
        {
            var msg = allMessages[idxMsg];
            if ( msg[SCHEMA.MESSAGE.TYPE] == SCHEMA.MESSAGE_TYPE_ENUM.REQUEST )
            {
				callStack.oneCall( msg );
				if ( idxMsg == 0 )
					continue; // Note: we start at 1: we don't consider consumer for collapse
				
				if ( flagCollapseMsgDownStack )
				{
					msg[SCHEMA.MESSAGE.COLLAPSED_STATE] = true;
				}
				else
				{
					if ( msg[SCHEMA.MESSAGE.NBR_CALL_FROM_HERE] <= nbrCallsCollapseThreshold )
					{
						msgIndex = msg[SCHEMA.MESSAGE.INDEX];
						msg[SCHEMA.MESSAGE.COLLAPSED_STATE] = true;
						flagCollapseMsgDownStack = true;
					}
				}
            }
			else
			{
				var matchingRequest = callStack.callReturn();
				if ( flagCollapseMsgDownStack && matchingRequest[SCHEMA.MESSAGE.INDEX] == msgIndex )
				{
					flagCollapseMsgDownStack = false;
				}
			}
        }
    }

    // needs to be called in callstack order
    function markMessagesToIgnore ( allMessages )
    {
        var callStack = new com.actional.sequence.CallStack();
        var flagIgnore = false;
        var collapsedCount = 0;
        for ( var idxMsg=0; idxMsg<allMessages.length; idxMsg++ )
        {
            var msg = allMessages[idxMsg];
            if ( msg[SCHEMA.MESSAGE.TYPE] == SCHEMA.MESSAGE_TYPE_ENUM.REQUEST )
            {
                callStack.oneCall( msg );
                if ( msg[SCHEMA.MESSAGE.COLLAPSED_STATE] !== undefined && msg[SCHEMA.MESSAGE.COLLAPSED_STATE] )
				{
					if ( collapsedCount == 0 )
						msg[SCHEMA.MESSAGE.FIRST_IN_CALLSTACK_COLLAPSED] = true;
					else
						msg[SCHEMA.MESSAGE.FIRST_IN_CALLSTACK_COLLAPSED] = false; // need to clear previous instances

					collapsedCount++;
					flagIgnore = true;
				}

                msg[SCHEMA.MESSAGE.IGNORE] = flagIgnore;
            }
            else
            {
                msg[SCHEMA.MESSAGE.IGNORE] = flagIgnore;
                var matchingRequest = callStack.callReturn();
                if ( matchingRequest[SCHEMA.MESSAGE.COLLAPSED_STATE] !== undefined && matchingRequest[SCHEMA.MESSAGE.COLLAPSED_STATE] )
				{
					collapsedCount--;
					if ( collapsedCount == 0 )
						flagIgnore = false;
				}
            }
        }
    }

	function incrementCallCount ( request, byHowMuch )
	{
		if ( request[SCHEMA.MESSAGE.NBR_CALL_FROM_HERE] === undefined )
			request[SCHEMA.MESSAGE.NBR_CALL_FROM_HERE] = byHowMuch;
		else
			request[SCHEMA.MESSAGE.NBR_CALL_FROM_HERE] += byHowMuch;
	}

    function addOneWayActiveRequest ( activeRequestsMap, msg )
    {
        var idx = msg[SCHEMA.MESSAGE.INDEX];
        activeRequestsMap[idx] = msg;
    }

    function resetYActivationBar ( activeRequestsMap, currentMsg, ySequence )
    {
        for ( var key in activeRequestsMap )
        {
            var msg = activeRequestsMap[key]; 
            if ( msg[SCHEMA.MESSAGE.TO] == currentMsg[SCHEMA.MESSAGE.FROM] )
                msg[SCHEMA.MESSAGE.Y_END_ACTIVATION_ONE_WAY] = ySequence;
        }
    }

    function removeCorrespondingOneWayActiveRequest ( activeRequestsMap, msg )
    {
        var requestMsg = msg[SCHEMA.MESSAGE.CORRESPONDING_REQUEST_MSG];
        var idx = requestMsg[SCHEMA.MESSAGE.INDEX];
        delete activeRequestsMap[idx];
    }

    function detectDisconnectedActivation ( fromLLBId, toPendingActivationBoxes, msg, llbFrom )
    {
        // This is the case of a call starting without an incoming call to it AND it is not the consumer case
        // For example, a call is made from A to B, B returns to A but later on calls A (or something else)
        // See test case 38 when showing by operations: B operation joining Join Operation.
        if ( ! itsDiagramLogic.isPendingActivation ( fromLLBId, toPendingActivationBoxes ) && !itsDiagramLogic.isRootConcurrentProcessingId ( msg[SCHEMA.MESSAGE.CONCURRENT_PROCESSING_ID] ) )
        {
            msg[SCHEMA.MESSAGE.DISCONNECTED_ACTIVATION] = true;
            msg[SCHEMA.MESSAGE.LLB_FROM] = llbFrom;
        }
    }

    function displaySequences ( data )
	{
		var CONCURRENT_PROC_SCHEMA = itsDiagramLogic.CONCURRENT_PROC_SCHEMA; // Synonym for readibility 		
		var llbFirstSequence = getFirstLifelineBox();
		var ySequence = llbFirstSequence.llyFrom + Y_OFFSET_FIRST_SEQUENCE;

		var oneWayActiveRequestsMap = new Object(); // Map: key: msg id, value: irrelevant
		var toPendingActivationBoxes = new Object(); // Map: key: site id, value: an integer representing the level of indentation
		var recursionNestingLevelsMap = new Object(); // Map: key: site id, value: an integer representing the recursion nesting level
		var allMsgs = data[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES];
		var lastXStart = 0;
		var heightForFittingOperation = computeHeightBasedOpNameFontSize();
		for ( var idxMsg = 0; idxMsg < allMsgs.length; idxMsg++ )
		{
			var msg = allMsgs[idxMsg];
			if ( msg[SCHEMA.MESSAGE.IGNORE] && !msg[SCHEMA.MESSAGE.FIRST_IN_CALLSTACK_COLLAPSED] ) // skip all ignored msgs except the one where we need to draw the expander
				continue;

			var concurrentProcessingId = msg[SCHEMA.MESSAGE.CONCURRENT_PROCESSING_ID];
			var ctx = itsConcurrentProcessingContexts[concurrentProcessingId];
			var callStack = ctx[CONCURRENT_PROC_SCHEMA.CALL_STACK];
			var msgType = msg[SCHEMA.MESSAGE.TYPE];
			var fromSiteId = msg[SCHEMA.MESSAGE.FROM];
			var toSiteId = msg[SCHEMA.MESSAGE.TO];
			var fromSite = itsSitesBySiteIdMap[fromSiteId];
			var toSite = itsSitesBySiteIdMap[toSiteId];
			var fromLLBId = itsUniqueLLBIdBySiteIdMap[fromSiteId];
			var toLLBId = itsUniqueLLBIdBySiteIdMap[toSiteId];
			var llbFrom = itsLifelineBoxes[fromLLBId];
			if ( llbFrom === undefined )
			{
				if ( msg[SCHEMA.MESSAGE.FIRST_IN_CALLSTACK_COLLAPSED] )
					continue; // normal. the LLB was not computed for this one.
				else
				{
					reportInternalError("displaySequences no llbFrom for " + fromLLBId );
					return;
				}
			}

			var xStart = llbFrom.llx;
			var fromTheRight = ( xStart < lastXStart );
			lastXStart = xStart;
            if ( msg[SCHEMA.MESSAGE.FIRST_IN_CALLSTACK_COLLAPSED] )
            {
                ySequence += heightForFittingOperation;
				var fromToHtmlForCallOut = createFromToHtmlForCallOut ( fromSite, toSite, true );
//                displayExpander ( xStart + HALF_ACTIVATION_LINE_WIDTH_RIGHT + itsMainContentOffsetX, ySequence + itsMainContentOffsetY, true, msg, fromToHtmlForCallOut, toSite );
				var offset = ( ACTIVATION_LINE_WIDTH - HALF_ACTIVATION_LINE_WIDTH_RIGHT ) - 4;
				var yExpander = ySequence + itsMainContentOffsetY - 5; 
                displayIndividualExpander ( xStart + offset + itsMainContentOffsetX, yExpander, true, msg, fromToHtmlForCallOut, toSite );
                continue;
            }

			var failureText = msg[SCHEMA.MESSAGE.FAILURE_TEXT];
			var alertCallOutContent = getAlertCallOutContent ( msg[SCHEMA.MESSAGE.ASSOCIATED_ALERT] );
			var severity = getSeverity ( msg[SCHEMA.MESSAGE.ASSOCIATED_ALERT] );
			var llbTo = itsLifelineBoxes[toLLBId];
			var xEnd = llbTo.llx;
			var flagOneWay = itsDiagramLogic.getOneWayFlag ( msg );
			var syntheticOperation = itsDiagramLogic.getSyntheticOperationFlag ( msg );
			var msgStats = msg[SCHEMA.MESSAGE.STATISTICS];
			var recursionNestingLevel;
			var recursionFlag = ( fromLLBId == toLLBId );
			var msgNbrToDisplay = getMsgNbrToDisplay ( msg );

			if ( msgType == SCHEMA.MESSAGE_TYPE_ENUM.REQUEST )
			{
                detectDisconnectedActivation ( fromLLBId, toPendingActivationBoxes, msg, llbFrom );

                itsDiagramLogic.startPendingActivation ( toLLBId, toPendingActivationBoxes, false, recursionFlag );
				ctx[CONCURRENT_PROC_SCHEMA.FLAG_PREVIOUS_REPLY_WAS_FROM_RECURSION] = false;
				var operationInfo = getOperationInfo ( toSite );
				msg[SCHEMA.MESSAGE.ALERT_CALLOUT_CONTENT] = alertCallOutContent;
				var callData = { idxMsg: idxMsg };

                if ( flagOneWay )  // For test case 37 out of order 1-way reply and case 38 when Showing by Operation
                    addOneWayActiveRequest ( oneWayActiveRequestsMap, msg );

                resetYActivationBar( oneWayActiveRequestsMap, msg, ySequence );
                
				if ( recursionFlag )
				{
					recursionNestingLevel = incrementRecursionNestingLevel ( fromLLBId, recursionNestingLevelsMap, idxMsg );
					ySequence = processRecursionRequest ( msgNbrToDisplay, callStack, msg, xStart, ySequence, operationInfo.operationIconUrl, operationInfo.operationName, failureText, alertCallOutContent, recursionNestingLevel, llbFrom, fromSite, toSite, syntheticOperation, msgStats, fromTheRight, concurrentProcessingId, flagOneWay, severity );
				}
				else
				{
					recursionNestingLevel = getRecursionNestingLevel ( fromLLBId, recursionNestingLevelsMap );
					ySequence += heightForFittingOperation;

					var xStart2 = computeStartCallLine ( callStack, allMsgs, xStart, fromLLBId, toPendingActivationBoxes, recursionNestingLevel );
					xEnd = computeEndCallLineFromPendingActivations ( xStart2, llbTo.llx, toLLBId, toPendingActivationBoxes );
                    displayCallLine ( msg, operationInfo, msgNbrToDisplay, xStart2, xEnd, ySequence, failureText, alertCallOutContent, fromSite, toSite, syntheticOperation, msgStats, flagOneWay, severity );

					if ( msg[SCHEMA.MESSAGE.BEGIN_MAIN_CONCURRENT_PROCESSING] !== undefined ) // Remember data for the main concurrent processing context to display the consumer or main activation bar.
                        storeDataForMainCP ( msg, llbFrom, concurrentProcessingId, fromLLBId, toPendingActivationBoxes );
				}

				if ( msg[SCHEMA.MESSAGE.BEGIN_CONCURRENT_PROCESSING_UNIT] ) // this is required to display an activation bar at the boundary of a concurrent processing unit.
					msg[SCHEMA.MESSAGE.Y_BEGIN_ACTIVATION_FOR_CONPROC_TRANSITION] = ySequence;

                callStack.oneCall ( callData );
			}
			else if ( msgType == SCHEMA.MESSAGE_TYPE_ENUM.REPLY )
			{
				var correspondingRequest = msg[SCHEMA.MESSAGE.CORRESPONDING_REQUEST_MSG];
				if ( correspondingRequest[SCHEMA.MESSAGE.IGNORE] )
					continue;

				//var lineFrom = callStack.callReturn();
//				if ( !callStack.isEmpty() )
				callStack.callReturn();	

				var fromSiteManagedFlag = llbFrom.site[SCHEMA.SITE.MANAGED];
				var toSiteManagedFlag = toSite[SCHEMA.SITE.MANAGED];
				var replySecurityFault = msg[SCHEMA.MESSAGE.SECURITY_FAULT];
				var yStartActivation = correspondingRequest[SCHEMA.MESSAGE.Y_BEGIN_ACTIVATION];
				var concurrentProcessingNbr = computeConcurrentProcessingNbr ( msg );
                var flagDisplayResponseLine = ( !flagOneWay && !syntheticOperation );
//                var flagDisplayResponseLine = true;

                if ( flagOneWay )
                    removeCorrespondingOneWayActiveRequest ( oneWayActiveRequestsMap, msg );

				// When a recursion reply after a regular reply, we need a bit more space to display the recursion reply // Case 29
				if ( correspondingRequest[SCHEMA.MESSAGE.RECURSION_WITH_OUTBOUND_CALL] !== undefined )
					ySequence += heightForFittingOperation;

				recursionNestingLevel = getRecursionNestingLevel ( toLLBId, recursionNestingLevelsMap );
				if ( correspondingRequest[SCHEMA.MESSAGE.X_RECURSION] !== undefined )
				{
                    ySequence = processRecursionReply ( ySequence, fromLLBId, toLLBId, recursionNestingLevelsMap, toPendingActivationBoxes, recursionNestingLevel, correspondingRequest, toSiteManagedFlag, syntheticOperation, replySecurityFault, failureText, concurrentProcessingNbr, flagDisplayResponseLine, msgNbrToDisplay, fromSite, toSite, msgStats );
				}
				else
				{
                    xStart = computeStartReturnLineFromCorrespondingRequest ( correspondingRequest );
                    ySequence = computeYSequenceForReply ( ctx, ySequence, heightForFittingOperation );
                    displayResponseLine ( flagDisplayResponseLine, correspondingRequest, msgNbrToDisplay, ySequence, failureText, alertCallOutContent, fromSite, toSite, syntheticOperation, replySecurityFault, msgStats, severity );
                    displayAllNeededActivationBoxes ( msg, xStart, yStartActivation, fromSiteManagedFlag, fromLLBId, alertCallOutContent, severity, syntheticOperation, replySecurityFault, failureText, concurrentProcessingNbr, llbTo, ySequence, correspondingRequest, heightForFittingOperation, toLLBId, toPendingActivationBoxes );
                }

				itsDiagramLogic.stopPendingActivation ( fromLLBId, toPendingActivationBoxes, recursionFlag, reportInternalError );
			}
			//else//ignore incorrect message types: that should be detected by the schema validate method.

			if ( idxMsg == 0 )
			{
				itsFirstSequenceY = ySequence;
				itsFirstSequenceX = xStart;
			}
		}

		itsLastSequenceY = ySequence;
	}

    function processRecursionReply ( ySequence, fromLLBId, toLLBId, recursionNestingLevelsMap, toPendingActivationBoxes, recursionNestingLevel, correspondingRequest, fromSiteManagedFlag, syntheticOperation, replySecurityFault, failureText, concurrentProcessingNbr, displayResponseLine, msgNbrToDisplay, fromSite, toSite, msgStats )
    {
        var recursionZIndexOffset = getActivationBoxZIndexOffset ( fromLLBId, toPendingActivationBoxes, recursionNestingLevel );

        var xLeft = correspondingRequest[SCHEMA.MESSAGE.X_RECURSION] - HALF_ACTIVATION_LINE_WIDTH;
        var yFrom = correspondingRequest[SCHEMA.MESSAGE.Y_BEGIN_ACTIVATION];
        var alertCalloutContent = correspondingRequest[SCHEMA.MESSAGE.ALERT_CALLOUT_CONTENT];
		var severity = getSeverity ( correspondingRequest[SCHEMA.MESSAGE.ASSOCIATED_ALERT] );
        displayActivationBox ( xLeft, yFrom, ySequence, fromSiteManagedFlag, recursionZIndexOffset
                  , alertCalloutContent, syntheticOperation, replySecurityFault, failureText, concurrentProcessingNbr, severity );

        var newYSequence;
        if ( displayResponseLine )
        {
            displayRecursionResponseLine ( msgNbrToDisplay, correspondingRequest[SCHEMA.MESSAGE.X_RECURSION], ySequence
                    , alertCalloutContent, failureText, fromSite, toSite, syntheticOperation, replySecurityFault, msgStats, severity );
            newYSequence = ySequence + HEIGHT_OFFSET_FOR_RECURSION_ON_ACTIVATION_BAR;
        }
        else
            newYSequence = ySequence + 5; // On 1-way, add a few pixels to look better

        decrementRecursionNestingLevel ( toLLBId, recursionNestingLevelsMap );

        return newYSequence;
    }

    function computeStartCallLine ( callStack, allMsgs, xStart, fromLLBId, toPendingActivationBoxes, recursionNestingLevel )
    {
        if ( ! callStack.isEmpty() )
        {
            var call = callStack.currentCall();
            var msgR = allMsgs[call.idxMsg]; // Note: Looking at the stack for a previous recursion does not handle the case where the request is one way (which starts a new CP and thus new stack)
            if ( msgR[SCHEMA.MESSAGE.X_RECURSION] !== undefined ) // Case 22 msg idx 4 and case 29 (idx 4)
                return msgR[SCHEMA.MESSAGE.X_RECURSION]; // This works whether the request goes left or right
        }

        var xStart2 = computeStartCallLineFromPendingActivations ( xStart, fromLLBId, toPendingActivationBoxes );
        if ( xStart2 == -1 )
            return xStart + ( recursionNestingLevel * HALF_ACTIVATION_LINE_WIDTH_RIGHT );
        else
            return xStart2; // We are in the case of some parallel lines displayed on from LL (See test case 33 Reordered without one-way (3 CP)
    }

    function storeLineCoordinates ( msg, coord )
    {
        // Store them relative to diagram base and not page base
        msg[SCHEMA.MESSAGE.X_BEGIN_LINE] = coord.xStartLine - itsMainContentOffsetX;
        msg[SCHEMA.MESSAGE.X_END_LINE] = coord.xEndLine - itsMainContentOffsetX;
        msg[SCHEMA.MESSAGE.LINE_POINTING_TO_RIGHT] = coord.linePointingToRight;
        msg[SCHEMA.MESSAGE.Y_LINE] = coord.yLine - itsMainContentOffsetY;

        if ( Ext.isGecko && DEBUG_LINE_COORD )
        {
            var log = "storeLineCoordinates: X_BEGIN_LINE: " + msg[SCHEMA.MESSAGE.X_BEGIN_LINE] + " - X_END_LINE: " + msg[SCHEMA.MESSAGE.X_END_LINE] + " - Y_LINE: " + msg[SCHEMA.MESSAGE.Y_LINE];
            outputToConsole ( log );
        }
    }

	function computeConcurrentProcessingNbr ( msg )
	{
		var cpNbr;
		if ( msg[SCHEMA.MESSAGE.END_CONCURRENT_PROCESSING_UNIT] !== undefined && msg[SCHEMA.MESSAGE.END_CONCURRENT_PROCESSING_UNIT] )
			cpNbr = msg[SCHEMA.MESSAGE.PREVIOUS_CONCURRENT_PROCESSING_UNIT_WHEN_END_CP_UNIT];
		else
			cpNbr = msg[SCHEMA.MESSAGE.CONCURRENT_PROCESSING_ID];

		return cpNbr;
	}

	function getActivationBoxZIndexOffset ( fromSiteId, pendingActivationBoxes, recursionNestingLevels )
	{
		var zIndexOffset = recursionNestingLevels;
		if ( ENABLE_PENDING_ACTIVATION )
			zIndexOffset += itsDiagramLogic.getPendingActivationCount ( fromSiteId, pendingActivationBoxes );

		return zIndexOffset;
	}

	function getAlertCallOutContentForActivationBox ( correspondingRequest, alertCallOutContent, severity )
	{
		if ( alertCallOutContent !== undefined && alertCallOutContent != null )
			return { alertCallOutContent: alertCallOutContent, severity: severity };    // use the one from reply if it exists
		else
        {
            if ( correspondingRequest[SCHEMA.MESSAGE.ASSOCIATED_ALERT] !== undefined && correspondingRequest[SCHEMA.MESSAGE.ASSOCIATED_ALERT] )
                return { alertCallOutContent: "", severity: getSeverity ( correspondingRequest[SCHEMA.MESSAGE.ASSOCIATED_ALERT] ) };
            else
                return undefined;
        }			
	}

	function comingToRecursionFromRight ( callStack, xStart )
	{
		if ( callStack.isEmpty() )
			return false;

		var call = callStack.currentCall();
		if ( call.xStart !== undefined && call.xStart > xStart )   //TODO: see where xStart is set?
			return true;
		else
			return false;
	}

	function processRecursionRequest ( msgNbrToDisplay, callStack, msg, xStart, ySequence, operationIconUrl, operationName, failureText, alertCallOutContent, recursionNestingLevels, lifeLineBox, fromSite, toSite, syntheticOperation, msgStats, replyFromRight, concurrentProcessingId, flagOneWay, severity )
	{
		var hd = HEIGHT_OFFSET_FOR_RECURSION_ON_ACTIVATION_BAR;
		if ( DEBUG_MSG_DATA )
			hd += 10;

		var yRecursion;

		if ( comingToRecursionFromRight ( callStack, xStart ) )   // case of a request to the right that has not completed yet.
			yRecursion = ySequence + computeHeightBasedOpNameFontSize() + 20;
		else if ( replyFromRight )  // simple case of a request/reply to the right before a recursion
			yRecursion = ySequence + computeHeightBasedOpNameFontSize();
		else
		{
			if ( recursionNestingLevels <= 1 )
				yRecursion = ySequence + computeHeightBasedOpNameFontSize();//ensure enough vertical space for name
			else
				yRecursion = ySequence;
		}

		var xRecursion;
		if ( callStack.isEmpty() &&  itsDiagramLogic.isRootConcurrentProcessingId ( concurrentProcessingId )  )
			xRecursion = xStart;
		else
		{
			var offset = recursionNestingLevels * HALF_ACTIVATION_LINE_WIDTH_RIGHT;
			xRecursion = xStart + offset;
		}

		var recursionData = displayRecursionRequestLine ( msgNbrToDisplay, xRecursion, yRecursion, hd, failureText, alertCallOutContent, fromSite, toSite, syntheticOperation, msgStats, severity );
		var yExpander = ( yRecursion - OFFSET_VERTICAL_FROM_RECURSION_ACTIVATION_LINE ) + itsMainContentOffsetY;
        displayIndividualExpander ( xRecursion + itsMainContentOffsetX, yExpander, true, msg, recursionData.fromToHtmlForCallOut, toSite );
		displayOperationNameForRecursion ( operationIconUrl, operationName, failureText, recursionData.xOpName, yRecursion, lifeLineBox, msgStats );

        msg[SCHEMA.MESSAGE.X_RECURSION] = xRecursion;
        msg[SCHEMA.MESSAGE.Y_BEGIN_ACTIVATION] = yRecursion;
        if ( flagOneWay )
            msg[SCHEMA.MESSAGE.Y_END_ACTIVATION_ONE_WAY] = ySequence;  // This is the y position we shorten the activation box for one way, if there are no more calls from this activation

		return recursionData.ySequence;
	}

	function createOperationElement ( operationIconUrl, opName, failureText, flagAlignLeft )
		//	function createOperationElement ( operationIconUrl, opName, failureText, flagAlignLeft, callOut )
	{
		var html = "<div style='z-index: 500; position: absolute; ";
		//        var L4CallOutHtml = "<div";
		if ( flagAlignLeft )
			html += "text-align: left;";


		html += "' class='" + OPERATIONS_STYLE_CLASS + "' title='"
                + com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(opName)
                + "'>";
		//        L4CallOutHtml += "' class='" + LIFE_LINE_CALL_OUT_L2_L3_STYLE_CLASS + "'>";

		html += getIfNeededFailureIcon ( html, failureText, false );

		var iconHtml = getIconHtmlFromUrl ( operationIconUrl );
		if ( iconHtml != null )
		{
			html += iconHtml;
			//            L4CallOutHtml += iconHtml;
		}

		html += opName + "</div>";
		//		L4CallOutHtml += opName + "</div>";

		var el = itsDiagramContentPanelEl.createChild ( html );

		//        if ( callOut !== undefined && callOut != null )
		//        {
		//            var callOutContent = callOut.L1Html + callOut.L2L3Html;
		//            addCallOutToElement ( callOutContent, el );
		//        }

		return el;
	}

	function getIfNeededFailureIcon ( html, failureText, securityFault )
	{
		if ( failureText !== undefined && failureText != null )
		{
			var icon;
			if ( securityFault )
				icon = "securityFaultIcon.png";
			else
				icon = "failureIcon.png";

			return itsFailureImageTagBegin + icon + "' title='"
                    + com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(failureText)
                    + itsFailureImageTagEnd;
		}
		else
			return "";
	}

	function displayOperationNameForRecursion ( operationIconUrl, opName, failureText, x, y, lifeLineBox, msgStats )
	{
		if ( opName == null || opName == "" )
			return;

		var el = createOperationElement ( operationIconUrl, opName, failureText, true );
		var m = Ext.util.TextMetrics.measure ( el.id, opName );
        setElementPosition ( el, x, y - m.height );

		var width = -1;

		// Is there a box to the right?
		for ( var key in itsLifelineBoxes )
		{
			var llbx = itsLifelineBoxes[key];
			if ( llbx.index == lifeLineBox.index + 1 )
			{
				width = ( ( llbx.llx - x ) - HALF_ACTIVATION_LINE_WIDTH ) - 1;
				break;
			}
		}

		if ( width <= 0 ) // there is no LLBx to the right
		{
			var availableWidth = ( getDiagramPanelAvailableWidth() - x ) - 20;
			width = availableWidth;
		}

		var callOut = createStatsHtml ( msgStats, true );
		addCallOutToElement ( callOut, el );
		el.setWidth ( width );
	}

	function displayOperationName ( operationInfo, failureText, xStart, xEnd, ySequence, msgStats )
	{
		var callOut = createStatsHtml ( msgStats, true );
		var opName = operationInfo.operationName;

		if ( opName == null || opName == "" )
			return;

		var el = createOperationElement ( operationInfo.operationIconUrl, opName, failureText, false );
		addCallOutToElement ( callOut, el );

		var x1;
		var x2;
		if ( xStart < xEnd )
		{
			x1 = xStart + HALF_ACTIVATION_LINE_WIDTH_RIGHT;
			x2 = xEnd - HALF_ACTIVATION_LINE_WIDTH;
		}
		else
		{
			x1 = xEnd + HALF_ACTIVATION_LINE_WIDTH_RIGHT;
			x2 = xStart - HALF_ACTIVATION_LINE_WIDTH;
		}

		var width = Math.round ( x2 - x1 );

		var MARGIN_LEFT = 2;
		width -= MARGIN_LEFT + com.actional.sequence.canvasUtil.ARROW_DEPTH + 2;  // so that text does not touche the arrow head

		var cvX = itsDiagramContentPanelEl.getX();
		var cvY = itsDiagramContentPanelEl.getY();
		var m = Ext.util.TextMetrics.measure ( el.id, opName );
		el.setX ( Math.round ( x1 + cvX + MARGIN_LEFT ) );
		el.setY ( Math.round ( ySequence + cvY - m.height ) - 3 );
		el.setWidth ( width );

		if ( Ext.isGecko && DEBUG_COORD )
		{
			var msg = "DisplayOperation: " + opName + " - x: " + xStart + " - y: " + ySequence + " - width: " + width;
			outputToConsole ( msg );
		}
	}

	function getStyleClassForActivationBox ( alertCallOutContent, flagManaged, syntheticOperation, securityFault, failureText, concurrentProcessingId, severity )
	{
		var styleClass = "activationBox";

		if ( concurrentProcessingId != -1 && itsFlagColorConcurrentProcessingUnits )
		{
			return "activationBoxCP activationBoxCP" + concurrentProcessingId%MAX_CONCURRENT_PROCESSING_COLORS;
		}

		var flagAlert = ( alertCallOutContent !== undefined && alertCallOutContent != null );
		if ( flagAlert )
		{
			if ( severity == null )
				styleClass += "Alert";
			else
			{
				if ( isSeverityAlarm ( severity ) )
					styleClass += "Alert";
				else
					styleClass += "Warning";
			}
		}

		if ( flagManaged )
			styleClass += "Managed";
		else
			styleClass += "Unmanaged";

		if ( ! flagAlert ) // never override alert style
		{
			if ( syntheticOperation )
				styleClass += "Synthetic";
			else if ( securityFault )
				styleClass += "SecurityFault";
			else if ( failureText !== undefined && failureText != null )
				styleClass += "WithFailure";
		}

		return styleClass;
	}

	function displayActivationBox ( xLeft, yFrom, yTo, flagManaged, zIndexOffset, alertCallOutContent, syntheticOperation, securityFault, failureText, concurrentProcessingId, severity )
	{
		var styleClass = getStyleClassForActivationBox ( alertCallOutContent, flagManaged, syntheticOperation, securityFault, failureText, concurrentProcessingId, severity );

		var title;
		if ( failureText !== undefined && failureText != null )
			title = com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(failureText);
		else
			title = "";

		var zIndex = 4 + zIndexOffset;
		var el = itsDiagramContentPanelEl.createChild ( "<div title='" + title + "'style='z-index: " + zIndex + "; position: absolute; " + OVERFLOW_STYLE + "' class='" + styleClass + "'></div>" );

		var h = Math.round ( yTo - yFrom );
        setElementPositionAndDimensions ( el, xLeft, yFrom, ACTIVATION_LINE_WIDTH, h );

		// if(opacity !== undefined)
		//        el.setOpacity ( opacity );  // Don't set the opacity because we see through to the lifeline or to the border of other activation boxes in the recursion case.
	}

	var OFFSET_VERTICAL_FROM_RECURSION_ACTIVATION_LINE = 11;
	var WIDTH_RECURSION_LINE = 30 - HALF_ACTIVATION_LINE_WIDTH;

	function displayRecursionRequestLine ( msgNbrToDisplay, xStartFromPreviousLifeLine, ySequence, heightFromDuration, failureText, alertCallOutContent, fromSite, toSite, syntheticOperation, msgStats, severity )
	{
		var fromToHtmlForCallOut = createFromToHtmlForCallOut ( fromSite, toSite, true );
		var statsHtml = createStatsHtml ( msgStats, true );

		var yStart = ySequence - OFFSET_VERTICAL_FROM_RECURSION_ACTIVATION_LINE;
		var xEnd = xStartFromPreviousLifeLine + WIDTH_RECURSION_LINE;

		var boundary = computeLineBoundaryForRecursion ( xStartFromPreviousLifeLine, xEnd );
		var boundaryForHighlighter = computeLineBoundaryForRecursion ( xStartFromPreviousLifeLine, xEnd + 6 );

		var xOpName = boundary.x2 + 2;
		var opacity = getOperationOpacity ( syntheticOperation );
		var styleClass = getRequestLineStyle ( alertCallOutContent, severity );
		var verticalLineStyleClass = styleClass + "Vertical";

		var boundary2 = computeLineBoundaryForRecursion ( xEnd, xStartFromPreviousLifeLine + HALF_ACTIVATION_LINE_WIDTH_RIGHT );
		var boundaryForHighlighter2 = computeLineBoundaryForRecursion ( xEnd + 6, xStartFromPreviousLifeLine + HALF_ACTIVATION_LINE_WIDTH_RIGHT );

		// draw highlight before the arrows so they all appear "under"
		drawIfNeededHighlighter ( boundaryForHighlighter, yStart, failureText, false );
		drawIfNeededHighlighter ( boundaryForHighlighter2, ySequence, failureText, false );

		// draw recursion arrow
		drawHorizontalLine ( null, boundary, yStart, styleClass, alertCallOutContent, fromToHtmlForCallOut, statsHtml, opacity, false );
		drawVerticalLine ( yStart, ySequence + 1, boundary.x2, verticalLineStyleClass, opacity );
		drawRequestLine ( null, boundary2, ySequence, failureText, alertCallOutContent, fromToHtmlForCallOut, statsHtml, syntheticOperation, severity );

		displayMsgDebugInfo ( boundary.x2 + 2 + itsMainContentOffsetX, ySequence + 1 + itsMainContentOffsetY, msgNbrToDisplay );

		var toReturn = { fromToHtmlForCallOut: fromToHtmlForCallOut, ySequence: ySequence + heightFromDuration, xOpName: xOpName, yCrtlPt1: ySequence + heightFromDuration / 2, yCrtlPt2: ySequence + heightFromDuration };

		return toReturn;
	}

	function displayRecursionResponseLine ( msgNbrToDisplay, xLifeline, yActivationBox, alertCallOutContent, failureText, fromSite, toSite, syntheticOperation, replySecurityFault, msgStats, severity )
	{
		if ( syntheticOperation )
			return; // for now we do not display these.

		var fromToHtmlForCallOut = createFromToHtmlForCallOut ( fromSite, toSite, true );
		var statsHtml = createStatsHtml ( msgStats, true );

		var yReturnBegin = yActivationBox - 1;
		var yReturnEnd = yReturnBegin + OFFSET_VERTICAL_FROM_RECURSION_ACTIVATION_LINE;
		var xStart = xLifeline + HALF_ACTIVATION_LINE_WIDTH_RIGHT;
		var xEnd = xStart + WIDTH_RECURSION_LINE - HALF_ACTIVATION_LINE_WIDTH;

		var boundary = computeLineBoundaryForRecursion ( xStart, xEnd );
		var boundaryForHighlighter = computeLineBoundaryForRecursion ( xStart, xEnd + 6 );

		var opacity = getOperationOpacity ( syntheticOperation );
		var styleClass = getResponseLineStyle ( alertCallOutContent, severity );
		var verticalLineStyleClass = styleClass + "Vertical";

		var boundary2 = computeLineBoundaryForRecursion ( xEnd, xLifeline );
		var boundaryForHighlighter2 = computeLineBoundaryForRecursion ( xEnd + 6, xLifeline );

		// draw highlight before the arrows so they all appear "under"
		drawIfNeededHighlighter ( boundaryForHighlighter, yReturnBegin, failureText, replySecurityFault );
		drawIfNeededHighlighter ( boundaryForHighlighter2, yReturnEnd, failureText, replySecurityFault );

		// draw recursion arrow
		drawHorizontalLine ( null, boundary, yReturnBegin, styleClass, alertCallOutContent, fromToHtmlForCallOut, statsHtml, opacity, false );
		drawVerticalLine ( yReturnBegin, yReturnEnd, xEnd, verticalLineStyleClass, opacity );
		drawResponseLine ( null, boundary2, yReturnEnd, null, alertCallOutContent, fromToHtmlForCallOut, statsHtml, opacity, false, severity );  // We don't pass the failure text so that we don't show the failure icon

		displayMsgDebugInfo ( xEnd + 2 + itsMainContentOffsetX, yReturnBegin + itsMainContentOffsetY, msgNbrToDisplay );

		var html = getIfNeededFailureIcon ( html, failureText, replySecurityFault );
		if ( html != "" )
		{
			var failureEl = itsDiagramContentPanelEl.createChild ( html );
            setElementPosition ( failureEl, xEnd + 1, yReturnBegin );
		}
	}

	function displayOneReturnLine ( msgNbrToDisplay, xStart, xEnd, ySequence, failure, alertCallOutContent, fromSite, toSite, syntheticOperation, replySecurityFault, msgStats, severity )
	{
        if ( Ext.isGecko && DEBUG_LINE_COORD )
		{
			var msg = "Return line: xStart: " + xStart + " - xEnd: " + xEnd + " - ySequence: " + ySequence;
			outputToConsole ( msg );
		}

        var linePointingToRight = xStart <= xEnd;
		var fromToHtmlForCallOut = createFromToHtmlForCallOut ( fromSite, toSite, linePointingToRight );
		var statsHtml = createStatsHtml ( msgStats, linePointingToRight );
		var opacity = getOperationOpacity ( syntheticOperation );
        var boundary = computeLineBoundaryForResponse ( xStart, xEnd );
		drawResponseLine ( msgNbrToDisplay, boundary, ySequence, failure, alertCallOutContent, fromToHtmlForCallOut, statsHtml, opacity, replySecurityFault, severity );
	}

	function drawArrowHeadHtml ( y, boundary, headStyleClass, alertCallOutContent, fromToHtmlForCallOut, statsHtml, opacity )
	{
		var arrowY = y;
		arrowY -= ARROW_HEAD_HEIGHT / 2;
		arrowY = Math.round ( arrowY );

		var x;
		var arrowHeadStyle = headStyleClass;
		if ( boundary.linePointingToRight )
		{
			arrowHeadStyle += "Right";
			x = boundary.x2 - ARROW_HEAD_WIDTH + itsMainContentOffsetX;
		}
		else
		{
			arrowHeadStyle += "Left";
			x = boundary.x2 + itsMainContentOffsetX;
		}

		var el = itsDiagramContentPanelEl.createChild ( "<div style='z-index: 500;' class='" + arrowHeadStyle + "'></div>" );

		el.setX ( x );
		el.setY ( arrowY );
		el.setWidth ( ARROW_HEAD_WIDTH );
		el.setHeight ( ARROW_HEAD_HEIGHT );
		if ( opacity !== undefined )
			el.setOpacity ( opacity );

		addLineCallOut ( alertCallOutContent, fromToHtmlForCallOut, statsHtml, el );
	}

	function addCallOutToElement ( callOutContent, el )
	{
		if ( callOutContent !== undefined && callOutContent != null )
		{
			var calloutConfig =
				{ target: el.id
				, anchor: 'top'
				, html: callOutContent
				, trackMouse: true
				, autoHide: true
				, dismissDelay: 0
				//							  , closable: true
				//							  , draggable: true
				//                              , autoScroll: true
				, autoWidth: true
				, baseCls: LINE_CALL_OUT_STYLE_CLASS
//				, bodyCls: LINE_CALL_OUT_STYLE_CLASS   // do not use that it makes for long empty popup on ie
                , maxWidth: 500
				};

			if ( !itsFlagExtVersion4 )
			{
				return new Ext.ToolTip ( calloutConfig );
			}
			else
			{
				return Ext.create('Ext.tip.ToolTip', calloutConfig );
			}
		}
		else
			return null;
	}

	function displayCallLine ( resquestMsg, operationInfo, msgNbrToDisplay, xStart, xEnd, ySequence, failureText, alertCallOutContent, fromSite, toSite, syntheticOperation, msgStats, flagOneWay, severity )
	{
		var boundary = computeLineBoundary ( xStart, xEnd );

		if ( Ext.isGecko && DEBUG_COORD )
		{
			var log = "displayCallLine bound.x1: " + boundary.x1 + " - bound.x2: " + boundary.x2 + " - ySequence: " + ySequence;
			outputToConsole ( log );
		}

		var fromToHtmlForCallOut = createFromToHtmlForCallOut ( fromSite, toSite, boundary.linePointingToRight );
		var statsHtml = createStatsHtml ( msgStats, boundary.linePointingToRight );

		var coord = drawRequestLine ( msgNbrToDisplay, boundary, ySequence, failureText, alertCallOutContent, fromToHtmlForCallOut, statsHtml, syntheticOperation, severity );

		var yExpander = coord.yLine;
		if ( flagOneWay )
			yExpander -= 4;

        displayIndividualExpander ( coord.xStartLine, yExpander, coord.linePointingToRight, resquestMsg, fromToHtmlForCallOut, toSite );
        displayOperationName ( operationInfo, failureText, xStart, xEnd, ySequence, msgStats );

        // Store in request what we need in order to draw the response and the activation box
        storeLineCoordinates ( resquestMsg, coord );
        resquestMsg[SCHEMA.MESSAGE.Y_BEGIN_ACTIVATION] = ySequence;
        if ( flagOneWay )
            resquestMsg[SCHEMA.MESSAGE.Y_END_ACTIVATION_ONE_WAY] = ySequence;  // This is the y position we shorten the activation box for one way, if there are no more calls from this activation
	}

	function createStatsHtml ( msgStats, linePointingToRight )
	{
		var html = "";
		if ( msgStats !== undefined && msgStats != null && msgStats.length != 0 )
		{
			html += "<table class='statsTable'>";
			//            html += "<tr><td colspan='3' align='left'><span style='font-weight:bold;'>&nbsp;&nbsp;Statistics</span></td>";

			var statLabel = getI18nMessages('shared.technicalview.statistics');
			var consumerLabel = getI18nMessages('shared.technicalview.consumer');
			var providerLabel = getI18nMessages('shared.technicalview.provider');
			if ( linePointingToRight )
			{
				html += "<tr><th>&nbsp;" + statLabel
						+ "&nbsp;</th><th class='lineStat' align='center'>" + consumerLabel
						+ "&nbsp;</th><th class='lineStat' align='center'>" + providerLabel + "</th>";
			}
			else
			{
				html += "<tr><th>&nbsp;" + statLabel
						+ "&nbsp;</th><th class='lineStat' align='center'>" + providerLabel
						+ "&nbsp;</th><th class='lineStat' align='center'>" + consumerLabel + "</th>";
			}


			for ( var i = 0; i < msgStats.length; i++ )
			{
				var stat = msgStats[i];
				var label = com.actional.sequence.sequenceCommonUtil.getStatDataLabel ( stat[SCHEMA.STAT_DATA.STAT_TYPE] );
				var consumerValue;
				if ( stat[SCHEMA.STAT_DATA.CONSUMER_VALUE] !== undefined && stat[SCHEMA.STAT_DATA.CONSUMER_VALUE] != null )
					consumerValue = com.actional.sequence.sequenceCommonUtil.formatStatDataValue ( stat[SCHEMA.STAT_DATA.STAT_TYPE], stat[SCHEMA.STAT_DATA.CONSUMER_VALUE] );
				else
					consumerValue = "&nbsp;";

				var providerValue;
				if ( stat[SCHEMA.STAT_DATA.PROVIDER_VALUE] !== undefined && stat[SCHEMA.STAT_DATA.PROVIDER_VALUE] != null )
					providerValue = com.actional.sequence.sequenceCommonUtil.formatStatDataValue ( stat[SCHEMA.STAT_DATA.STAT_TYPE], stat[SCHEMA.STAT_DATA.PROVIDER_VALUE] );
				else
					providerValue = "&nbsp;";

				html += "<tr><td class='lineStat'>" + label + "&nbsp;" + "</td>";
				if ( linePointingToRight )
				{
					html += "<td class='lineStat'>" + consumerValue + "&nbsp;</td>";
					html += "<td class='lineStat'>" + providerValue + "</td>";
				}
				else
				{
					html += "<td class='lineStat'>" + providerValue + "&nbsp;</td>";
					html += "<td class='lineStat'>" + consumerValue + "</td>";
				}
				html += "</tr>";
			}

			html += "</table>";
		}
		else
			html = null;

		return html;
	}

	function createFromToHtmlForCallOut ( fromSite, toSite, linePointingToRight )
	{
		var callOutHtmlFrom = createLifeLineBoxCallOutHtml ( fromSite );
		var callOutHtmlTo = createLifeLineBoxCallOutHtml ( toSite );
		var leftColumn;
		var rightColumn;
		if ( linePointingToRight )
		{
			leftColumn = callOutHtmlFrom;
			rightColumn = callOutHtmlTo;
		}
		else
		{
			leftColumn = callOutHtmlTo;
			rightColumn = callOutHtmlFrom;
		}

		var html = "";
		html += "<table><tr><td align='center'>";
		html += "<table class='callout'>";

		var fromLabel = getI18nMessages('sequenceDiagram.fromCalloutHeader');
		var toLabel = getI18nMessages('sequenceDiagram.toCalloutHeader');
		if ( linePointingToRight )
			html += "<tr><th style='text-align:center'>" + fromLabel + "</th><th style='text-align:center'>" + toLabel + "</th></tr>";
		else
			html += "<tr><th style='text-align:center'>" + toLabel + "</th><th style='text-align:center'>" + fromLabel + "</th></tr>";

		html += "<tr><td>" + leftColumn.L1Html + "</td>";
		html += "<td>" + rightColumn.L1Html + "</td></tr>";
		html += "<tr><td>" + leftColumn.L2L3Html + "</td>";
		html += "<td>" + rightColumn.L2L3Html + "</td></tr>";

		html += "</table>";
		html += "</td></tr></table>";

		return html;
	}

	function isSeverityAlarm ( severity )
	{
		if ( severity == "ALARM" )
			return true;
		else if ( severity == "WARNING" )
			return false;
		else
		{
			reportInternalError ( "Incorrect severity value: " + severity );
			return false;
		}
	}

	function getRequestLineStyle ( alertCallOutContent, severity )
	{
		if ( alertCallOutContent !== undefined && alertCallOutContent != null )
		{
			if ( isSeverityAlarm( severity ) )
				return "arrowAlert";
			else
				return "arrowYellow";
		}
		else
			return "arrowGreen";
	}

	function getResponseLineStyle ( alertCallOutContent, severity )
	{
		if ( alertCallOutContent !== undefined && alertCallOutContent != null )
		{
			if ( isSeverityAlarm( severity ) )
				return "arrowResponseAlert";
			else
				return "arrowDashedYellow";
		}
		else
			return "arrowDashedGreen";
	}

	function getResponseArrowHeadStyle ( alertCallOutContent, severity )
	{
		if ( alertCallOutContent !== undefined && alertCallOutContent != null )
		{
			if ( isSeverityAlarm( severity ) )
				return "arrowHeadOpenAlert";
			else
				return "arrowHeadOpenYellow";
		}
		else
			return "arrowHeadOpenGreen";
	}

	function getRequestArrowHeadStyle ( alertCallOutContent, severity )
	{
		if ( alertCallOutContent !== undefined && alertCallOutContent != null )
		{
			if ( isSeverityAlarm( severity ) )
				return "arrowHeadFilledInAlert";
			else
				return "arrowHeadFilledInYellow";
		}
		else
			return "arrowHeadFilledInGreen";
	}

	function drawResponseLine ( msgNbrToDisplay, boundary, ySequence, failureText, alertCallOutContent, fromToHtmlForCallOut, statsHtml, opacity, replySecurityFault, severity )
	{
		drawIfNeededHighlighter ( boundary, ySequence, failureText, replySecurityFault );

		var styleClass = getResponseLineStyle ( alertCallOutContent, severity );
		var html = "<div style='z-index: 500;' class='" + styleClass + "'></div>";

		var el = itsDiagramContentPanelEl.createChild ( html );

		var y = ySequence + itsMainContentOffsetY - 1;
		var x;
		if ( boundary.linePointingToRight )
			x = boundary.x1 + itsMainContentOffsetX;
		else
			x = boundary.x2 + itsMainContentOffsetX + ARROW_HEAD_WIDTH;

		el.setX ( x );
		el.setY ( y );
		el.setWidth ( boundary.width - ARROW_HEAD_WIDTH );
		if ( opacity !== undefined )
			el.setOpacity ( opacity );

		adjustElementHeightForCallOut ( el, alertCallOutContent, fromToHtmlForCallOut );
		addLineCallOut ( alertCallOutContent, fromToHtmlForCallOut, statsHtml, el );

		displayMsgDebugInfo ( x, y, msgNbrToDisplay );

		// display failure if needed
		var hd = getHighlighterData ( failureText, replySecurityFault );
		if ( hd[HIGHLIGHTER_SCHEMA.DRAW_HIGHLIGHTER] )
		{
			html = getIfNeededFailureIcon ( html, failureText, replySecurityFault );
			var htmlHighlighter = "<div style='z-index: 1;' class='" + hd[HIGHLIGHTER_SCHEMA.STYLE] + "'></div>"; //&nbsp;
			var highlighterEl = itsDiagramContentPanelEl.createChild ( htmlHighlighter );
			highlighterEl.setOpacity ( FAILURE_HIGHLIGHTER_OPACITY );
			var htmlFailure = "<div style='z-index: 500; " + OVERFLOW_STYLE + "'" + "' class='failureTextOnReply' title='"
                    + com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(hd[HIGHLIGHTER_SCHEMA.TITLE])
                    + "'>" + html + hd[HIGHLIGHTER_SCHEMA.TITLE] + "</div>";
			var failureEl = itsDiagramContentPanelEl.createChild ( htmlFailure );
			highlighterEl.setHeight ( failureEl.getHeight() );
			var highlighterY = y - 15;
			failureEl.setY ( highlighterY );
			highlighterEl.setY ( highlighterY );
			var w = ( boundary.width - ( 2 * ARROW_HEAD_WIDTH ) ) - 2;
			failureEl.setWidth ( w );
			highlighterEl.setWidth ( boundary.width );

			//			var centerX = Math.round ( boundary.width / 2 );
			if ( boundary.linePointingToRight )
			{
				failureEl.setX ( boundary.x1 + ARROW_HEAD_WIDTH + itsMainContentOffsetX + 1 );
				highlighterEl.setX ( boundary.x1 + itsMainContentOffsetX );
			}
			else
			{
				failureEl.setX ( boundary.x2 + ARROW_HEAD_WIDTH + itsMainContentOffsetX + 1 );
				highlighterEl.setX ( boundary.x2 + itsMainContentOffsetX );
			}
		}

		var headStyleClass = getResponseArrowHeadStyle ( alertCallOutContent, severity );
		drawArrowHeadHtml ( y, boundary, headStyleClass, alertCallOutContent, fromToHtmlForCallOut, statsHtml, opacity );
	}

	/** @return undefined if opacity should not be overriden */
	function getOperationOpacity ( syntheticOperation )
	{
		if ( syntheticOperation )
			return SYNTHETIC_OPERATIONS_OPACITY;
		else
			return undefined;
	}

	function drawRequestLine ( msgNbrToDisplay, boundary, ySequence, failureText, alertCallOutContent, fromToHtmlForCallOut, statsHtml, syntheticOperation, severity )
	{
		var opacity = getOperationOpacity ( syntheticOperation );

		drawIfNeededHighlighter ( boundary, ySequence, failureText, false );

		var styleClass = getRequestLineStyle ( alertCallOutContent, severity );
		var coord = drawHorizontalLine ( msgNbrToDisplay, boundary, ySequence, styleClass, alertCallOutContent, fromToHtmlForCallOut, statsHtml, opacity, true );
        var y = coord.yLine;
		var headStyleClass = getRequestArrowHeadStyle ( alertCallOutContent, severity );
		drawArrowHeadHtml ( y, boundary, headStyleClass, alertCallOutContent, fromToHtmlForCallOut, statsHtml, opacity );

        return coord;
	}

	function getHighlighterData ( failureText, replySecurityFault )
	{
		var drawHighlighter = false;
		var title = "";
		var styleClass = " ";

		// A reply with a security fault has its message in the failure text.
		// A regular failure is defined has securityFault is false and failureText is defined.
		if ( replySecurityFault )
		{
			drawHighlighter = true;
			styleClass += "replySecurityFaultHighlighterBox ";
		}
		else
		{
			if ( failureText !== undefined && failureText != null )
				styleClass += "failureHighlighterBox ";
		}

		if ( failureText !== undefined && failureText != null )
		{
			title = failureText;
			drawHighlighter = true;
		}

		var hd = new Object();
		hd[HIGHLIGHTER_SCHEMA.DRAW_HIGHLIGHTER] = drawHighlighter;
		hd[HIGHLIGHTER_SCHEMA.TITLE] = title;
		hd[HIGHLIGHTER_SCHEMA.STYLE] = styleClass;
		return hd;
	}

	function drawIfNeededHighlighter ( boundary, yCoord, failureText, replySecurityFault )
	{
		var hd = getHighlighterData ( failureText, replySecurityFault );

		if ( hd[HIGHLIGHTER_SCHEMA.DRAW_HIGHLIGHTER] )
		{
			var html = "<div style='z-index: 500;"
				+ "' title='" + com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(hd[HIGHLIGHTER_SCHEMA.TITLE])
				+ "' class='" + hd[HIGHLIGHTER_SCHEMA.STYLE] + "'></div>";

			var el = itsDiagramContentPanelEl.createChild ( html );

            var x;
			if ( boundary.linePointingToRight )
				x = boundary.x1;
			else
				x = boundary.x2;

			var highlighterHeight = ARROW_HEAD_HEIGHT;
			var y = yCoord + 1 - highlighterHeight / 2;
            setElementPositionAndDimensions ( el, x, y, boundary.width, highlighterHeight );
			el.setOpacity ( FAILURE_HIGHLIGHTER_OPACITY );
		}
	}

	function drawHorizontalLine ( msgNbrToDisplay, boundary, ySequence, styleClass, alertCallOutContent, fromToHtmlForCallOut, statsHtml, opacity, forArrow )
	{
		var html = "<div style='z-index: 500;' class='" + styleClass + "'></div>";

		var el = itsDiagramContentPanelEl.createChild ( html );

		var arrowHeadWidth;
		if ( forArrow )
			arrowHeadWidth = ARROW_HEAD_WIDTH;
		else
			arrowHeadWidth = 0;

		var y = ySequence + itsMainContentOffsetY;
		var x, xStart, xEnd;
		if ( boundary.linePointingToRight )
        {
			x = boundary.x1 + itsMainContentOffsetX;
            xStart = x;
            xEnd = x + boundary.width;
        }
		else
        {
            xStart = boundary.x1 + itsMainContentOffsetX;
			x = boundary.x2 + itsMainContentOffsetX + arrowHeadWidth;
            xEnd = x - arrowHeadWidth;
        }

		el.setX ( x );
		el.setY ( y );
		el.setWidth ( boundary.width - arrowHeadWidth );

		if ( opacity !== undefined )
			el.setOpacity ( opacity );

		displayMsgDebugInfo ( x, y, msgNbrToDisplay );

		adjustElementHeightForCallOut ( el, alertCallOutContent, fromToHtmlForCallOut );
		addLineCallOut ( alertCallOutContent, fromToHtmlForCallOut, statsHtml, el );

		return { xStartLine: xStart, xEndLine: xEnd, yLine: y, linePointingToRight: boundary.linePointingToRight };
	}

	function displayMsgDebugInfo ( x, y, msgNbrToDisplay )
	{
		if ( DEBUG_MSG_DATA && msgNbrToDisplay !== undefined && msgNbrToDisplay != null )
		{
			var html = "<div style='position: absolute; z-index: 1000; background-color: #f8f8f8; font: 9px tahoma,arial,helvetica,sans-serif;border: 1px solid #404040;'>" + msgNbrToDisplay + "</div>";
			var el = itsDiagramContentPanelEl.createChild ( html );
			el.setX ( x + 2 );
			el.setY ( y + 2 );
		}
	}

	function addLineCallOut ( alertCallOutContent, fromToHtmlForCallOut, statsHtml, el )
	{
		var atLeastOneCallOut = false;
		var callOut = "";
		callOut += "<table style='border-spacing: ;border-style: hidden;border-color: gray; border-collapse: collapse;'>";
		if ( alertCallOutContent !== undefined && alertCallOutContent != null )
		{
			callOut += "<tr><td style='border: 1px solid #202020;'>" + alertCallOutContent + "</td></tr>";
			atLeastOneCallOut = true;
		}

		if ( fromToHtmlForCallOut !== undefined && fromToHtmlForCallOut != null )
		{
			callOut += "<tr><td style='border: 1px solid #202020;'>" + fromToHtmlForCallOut + "</td></tr>";
			atLeastOneCallOut = true;
		}

		if ( statsHtml !== undefined && statsHtml != null )
		{
			callOut += "<tr><td style='border: 1px solid #202020;'>" + statsHtml + "</td></tr>";
			atLeastOneCallOut = true;
		}

		if ( atLeastOneCallOut )
		{
			callOut += "</table>";
			addCallOutToElement ( callOut, el );
		}
	}

	function adjustElementHeightForCallOut ( el, alertCallOutContent, fromToHtmlForCallOut )
	{
		if ( alertCallOutContent !== undefined && alertCallOutContent != null
			|| fromToHtmlForCallOut !== undefined && fromToHtmlForCallOut != null )
			el.setHeight ( 6 );
		else
			el.setHeight ( 1 );
	}

	function drawVerticalLine ( yStart, yEnd, x, styleClass, opacity )
	{
		var el = itsDiagramContentPanelEl.createChild ( "<div style='z-index: 500;' class='" + styleClass + "'></div>" );
		var height;
		if ( yEnd > yStart )
			height = yEnd - yStart;
		else
			height = yStart - yEnd;

        setElementPositionAndDimensions ( el, x, yStart, 4, height );
		if ( opacity !== undefined )
			el.setOpacity ( opacity );
	}

	function computeLineBoundaryForRecursion ( xStart, xEnd )
	{
		var x1;
		var x2;
		var width;
		var directionRight = xStart <= xEnd;
		if ( directionRight )
		{
			x1 = xStart;
			x2 = xEnd;
			width = x2 - x1;
		}
		else
		{
			x1 = xStart;
			x2 = xEnd;
			width = x1 - x2;
		}

		return { x1: x1, x2: x2, linePointingToRight: directionRight, width: width };
	}

	function computeLineBoundary ( xStart, xEnd )
	{
		var x1;
		var x2;
		var width;
		var directionRight = xStart <= xEnd;
		if ( directionRight )
		{
			x1 = xStart + HALF_ACTIVATION_LINE_WIDTH_RIGHT;
			x2 = xEnd - HALF_ACTIVATION_LINE_WIDTH;
			width = x2 - x1;
		}
		else
		{
			x1 = xStart - HALF_ACTIVATION_LINE_WIDTH;
			x2 = xEnd + HALF_ACTIVATION_LINE_WIDTH_RIGHT;
			width = x1 - x2;
		}

		return { x1: x1, x2: x2, linePointingToRight: directionRight, width: width };
	}

	function computeLineBoundaryForResponse ( xStart, xEnd )
	{
		var x1;
		var x2;
		var width;
		var directionRight = xStart <= xEnd;
		if ( directionRight )
		{
			x1 = xStart;
			x2 = xEnd;
			width = x2 - x1;
		}
		else
		{
			x1 = xStart;
			x2 = xEnd;
			width = x1 - x2;
		}

		return { x1: x1, x2: x2, linePointingToRight: directionRight, width: width };
	}

	function computeYLifeline ( el )
	{
		return ( el.getY() + el.getHeight() ) - itsMainContentOffsetY;
	}

	function displayLifeLines ()
	{
        var widthToolTip = 6;
		var yEndLifeLine = itsLastSequenceY + 20;
		var i = 0;
		for ( var key in itsLifelineBoxes )
		{
			var el = itsDiagramContentPanelEl.createChild ( "<div style='z-index: 1;' class='lifeLine'></div>" );
			itsLifeLineEls[i] = el;
			i++;

            var llb = itsLifelineBoxes[key];
			var callOutHtml = llb.callOutHtml;

			var calloutConfig;
			if ( !itsFlagExtVersion4 )
			{
				calloutConfig =
					{ title: callOutHtml.L1Html
					, target: el.id
					, anchor: 'left'
					, dismissDelay: 0
					, html: callOutHtml.L2L3Html
					, trackMouse: true
					, autoHide: true
					//								  , closable: true
					//								  , draggable: true
					, autoWidth: true
					, baseCls: LIFE_LINE_CALL_OUT_STYLE_CLASS
					};

				new Ext.ToolTip ( calloutConfig );
			}
			else
			{
				calloutConfig =
					{ target: el.id
					, anchor: 'left'
					, dismissDelay: 0
					, html: callOutHtml.L1Html + callOutHtml.L2L3Html
					, trackMouse: true
					, autoHide: true
					//								  , closable: true
					//								  , draggable: true
					, autoWidth: true
					, baseCls: LIFE_LINE_CALL_OUT_STYLE_CLASS
					};

				Ext.create('Ext.tip.ToolTip', calloutConfig );
			}


            var yFrom = llb.llyFrom;
            var yTo = llb.llyTo;
			var x = Math.ceil ( llb.llx - widthToolTip / 2 );
            if ( Ext.isGecko && DEBUG_COORD )
            {
                var msg = "Lifeline: x: " + x + " - yFrom: " + yFrom + " - yTo: " + yTo;
                outputToConsole ( msg );
            }

            setElementPositionAndDimensions ( el, x, yFrom, widthToolTip, yEndLifeLine - yFrom );
		}

		itsDiagramHeight = yEndLifeLine + 10;
	}

	function clearStatus ()
	{
		if ( itsMainPanelEl != null )
		{
			itsMainPanelEl.unmask();
		}
	}

	function showStatus ( msg )
	{
		// Watch out that this "blocks" the control, so do not use
		// for operations that are not for initializing or re-loading the entire
		// diagram.
		if ( itsMainPanelEl != null )
		{
			itsMainPanelEl.mask ( "Sequence Diagram Internal Error:<br>" + msg );//No need to I18N
		}
	}

	function reportInternalError ( msg )
	{
		Ext.Msg.alert ( "Sequence Diagram Internal Error", msg );//No need to I18N
	}

	function createAllLifeLineBoxes ()
	{
		var allBoxes = [];
		var i = 0;
		for ( var key in itsLifelineBoxes )
		{
			var site = itsLifelineBoxes[key].site;
			if ( site === undefined || site == null )
			{
				reportInternalError ( "createAllLifeLineBoxes - No site for key: " + key );
				break;
			}

			var lifeLineHtml = createLifeLineBoxHtml ( site );
			var el = itsDiagramContentPanelEl.createChild ( lifeLineHtml );
			var callOutHtml = createLifeLineBoxCallOutHtml ( site );
			allBoxes[i] = { el: el, key: key, site: site, callOutHtml: callOutHtml };
			i++;
		}

		return allBoxes;
	}

	function getDiagramPanelAvailableWidth ()
	{
		if ( Ext.isIE )
			return itsDiagramContentPanelEl.getStyleSize().width;
		else
			return itsDiagramContentPanelEl.getSize().width;
	}

	function displayLifeLineBoxes ()
	{
		var allBoxes = createAllLifeLineBoxes();
		var widths = computeSmallestAndLargestLifelineBoxWidth ( allBoxes );
		var availableWidth = getDiagramPanelAvailableWidth() - X_OFFSET_LIFELINE_BOXES;

		var x;
		var marginBetweenBoxes;
		var lifelineBoxWidth;
		var totalWidth = itsLifelineBoxesCount * widths.largest + ( ( itsLifelineBoxesCount - 1 ) * MARGIN_BETWEEN_LIFELINE_BOXES );

		// if all boxes would fit with width of largest one then use it, otherwise we use available space divided by boxes count
		// down to a minimum width per box.  When we are at minimum, user will have to scroll left and right.
		if ( totalWidth <= availableWidth )
		{
			lifelineBoxWidth = widths.largest;
			var remainingWidth = availableWidth - totalWidth;
			marginBetweenBoxes = MARGIN_BETWEEN_LIFELINE_BOXES;
			var leftOverForSpacingBoxes = Math.round ( remainingWidth / itsLifelineBoxesCount );
			if ( itsLifelineBoxesCount == 1 || leftOverForSpacingBoxes < lifelineBoxWidth * 2 )
			{
				marginBetweenBoxes += leftOverForSpacingBoxes;
				x = Math.round ( marginBetweenBoxes / 2 );  // to center
			}
			else
			{
				marginBetweenBoxes += lifelineBoxWidth * 2;  // We augment the margin to the maximum allowed
				totalWidth = itsLifelineBoxesCount * lifelineBoxWidth + ( ( itsLifelineBoxesCount - 1 ) * marginBetweenBoxes );
				remainingWidth = availableWidth - totalWidth;
				x = Math.round ( remainingWidth / 2 );  // to center
			}

			x += itsMainContentOffsetX;
		}
		else
		{
			var width1 = Math.round ( availableWidth / itsLifelineBoxesCount );
			lifelineBoxWidth = width1 - MARGIN_BETWEEN_LIFELINE_BOXES;
			if ( lifelineBoxWidth < widths.smallest )
			{
				lifelineBoxWidth = widths.smallest;
			}

			x = X_OFFSET_LIFELINE_BOXES + itsMainContentOffsetX;
			marginBetweenBoxes = MARGIN_BETWEEN_LIFELINE_BOXES;
		}

		var y = Y_OFFSET_LIFELINE_BOXES + itsMainContentOffsetY;

		for ( var i = 0; i < allBoxes.length; i++ )
		{
			positionLifelineBox ( allBoxes[i], lifelineBoxWidth, x, y );
			x += lifelineBoxWidth + marginBetweenBoxes;
		}
	}

	function positionLifelineBox ( box, lifelineBoxWidth, x, y )
	{
		var boxEl = box.el;
		var key = box.key;
		var site = box.site;
		boxEl.setX ( x );
		boxEl.setY ( y );
		boxEl.setWidth ( lifelineBoxWidth );
		if ( Ext.isGecko && DEBUG_COORD )
		{
			var msg1 = "positionLifelineBox: " + key + " - x: " + x + " - y: " + y + " - width: " + lifelineBoxWidth;
			outputToConsole ( msg1 );
		}

		// compute lifelines coordinates
		var yFrom = computeYLifeline ( boxEl );
		var yTo = yFrom + 20;  // Ensure a minimum of 20.  When we are done displaying the diagram we resize the life lines to the proper height anyway.
		var llx = Math.round ( ( x - itsMainContentOffsetX ) + lifelineBoxWidth / 2 );

		if ( Ext.isGecko && DEBUG_COORD )
		{
			var llindex = itsLifelineBoxes[key].index;
			var msg = "lifelines coordinates: llindex: " + llindex + " - llx: " + llx + " - yFrom: " + yFrom + " - yTo: " + yTo;
			outputToConsole ( msg );
		}

		var index = itsLifelineBoxes[key].index;
		itsLifelineBoxes[key] =
			{ index: index
			, site: site
			, el: boxEl
			, llx: llx
			, llyFrom: yFrom
			, llyTo: yTo
			, callOutHtml: box.callOutHtml
			};
	}

	function computeLargestLifeLineBoxesWidth ( allBoxes )
	{
		var width = 0;
		for ( var i = 0; i < allBoxes.length; i++ )
		{
			var el = allBoxes[i].el;
			if ( el.getWidth() > width )
				width = el.getWidth();
		}

		return width;
	}

	function computeMinLifeLineBoxesWidth ()
	{
		// assume the L1 style has the largest font
		var html = "<div class='" + LIFE_LINE_BOXES_STYLE_CLASS + " " + LIFE_LINE_BOXES_L1_INFO_STYLE_CLASS + "'>" + LIFELINE_MIN_WIDTH_TEXT + "</div>";
		var elToMeasureLLBoxNames = itsDiagramContentPanelEl.createChild ( html );
		var minWidth = elToMeasureLLBoxNames.getWidth();
		elToMeasureLLBoxNames.remove();
		return minWidth + 16; //16 for the icon
	}

	function computeSmallestAndLargestLifelineBoxWidth ( allBoxes )
	{
		var minWidth = computeMinLifeLineBoxesWidth();
		var largestWidth = computeLargestLifeLineBoxesWidth ( allBoxes );
		return { smallest: minWidth, largest: largestWidth };
	}

	function getLevelNameForHtml ( levelName )
	{
		if ( levelName == "" )
			return "&nbsp;";
		else
			return levelName;
	}

	function getIconHtml ( allLevels, level )
	{
		var html = null;

		if ( allLevels[level] !== undefined && allLevels[level] !== null )
		{
			var iconUrl = SCHEMA.getIconUrl ( allLevels[level][SCHEMA.LEVEL.ICON], itsIcons );
			html = getIconHtmlFromUrl ( iconUrl );
		}

		return html;
	}

	function getIconHtmlFromUrl ( iconUrl )
	{
		var html;
		if ( iconUrl !== undefined && iconUrl != null )
			html = "<img height='16' width='16' style='padding-right: 4px; vertical-align: middle;' src='" + iconUrl + "'>";
		else
			html = null;

		return html;
	}

	function createLevelWithIconHtml ( allLevels, levelIndex )
	{
		var html = "";
		var name = allLevels[levelIndex][SCHEMA.LEVEL.NAME];
		var htmlName = getLevelNameForHtml ( name );

		html += "<div style='" + OVERFLOW_STYLE + "' class='" + LIFE_LINE_BOXES_L2_L3_INFO_STYLE_CLASS + "' title='"
                + com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(htmlName)
                + "'>";

		var iconHtml = getIconHtml ( allLevels, levelIndex );
		if ( iconHtml != null )
			html += iconHtml;

		html += htmlName + "</div>";

		return html;
	}

	function createLifeLineBoxCallOutHtml ( site )
	{
		var allLevels = site[SCHEMA.SITE.ALL_LEVELS];
		var name = getLevelNameForHtml ( allLevels[0][SCHEMA.LEVEL.NAME] ).substring ( 0, 100 );

		var L1Html = "<div class='" + LIFE_LINE_CALL_OUT_L1_STYLE_CLASS + "'>";

		var iconHtml = getIconHtml ( allLevels, 0 );
		if ( iconHtml != null )
			L1Html += iconHtml;

		L1Html += name + "</div>";

		var L1L2Html = "<div>";
		if ( allLevels.length > 1 )
			L1L2Html += createLevelWithIconHtml ( allLevels, 1 );
		else
			L1L2Html += "<div " + "class='" + LIFE_LINE_CALL_OUT_L2_L3_STYLE_CLASS + "'>" + "&nbsp;</div>";

		if ( allLevels.length > 2 )
			L1L2Html += createLevelWithIconHtml ( allLevels, 2 );
		else
			L1L2Html += "<div " + "class='" + LIFE_LINE_CALL_OUT_L2_L3_STYLE_CLASS + "'>" + "&nbsp;</div>";

		L1L2Html += "</div>";

		return { L1Html: L1Html, L2L3Html: L1L2Html };
	}

	function createLifeLineBoxHtml ( site )
	{
        var nbrLevelsAdded = 0;
		var allLevels = site[SCHEMA.SITE.ALL_LEVELS];
		var name = getLevelNameForHtml ( allLevels[0][SCHEMA.LEVEL.NAME] );

		var html ="<div style='z-index: 2; " + OVERFLOW_STYLE + "' class='" + LIFE_LINE_BOXES_STYLE_CLASS + "'>"
			+ "<div style='" + OVERFLOW_STYLE + "' class='" + LIFE_LINE_BOXES_L1_INFO_STYLE_CLASS + "' title='"
            + com.actional.sequence.sequenceCommonUtil.escapeHtmlAttributeValue(name)
            + "'>"
			;

		var iconHtml = getIconHtml ( allLevels, 0 );
		if ( iconHtml != null )
			html += iconHtml;

		html += name + "</div><div>";
        nbrLevelsAdded++;

		if ( allLevels.length > 1 && itsLLBLevels > 1 )
        {
			html += createLevelWithIconHtml ( allLevels, 1 );
            nbrLevelsAdded++;
        }

		if ( allLevels.length > 2 && itsLLBLevels > 2 )
        {
			html += createLevelWithIconHtml ( allLevels, 2 );
            nbrLevelsAdded++;
        }
		if ( allLevels.length > 3 && itsLLBLevels > 3 )
        {
			html += createLevelWithIconHtml ( allLevels, 3 );
            nbrLevelsAdded++;
        }
        for ( var i=nbrLevelsAdded; i<itsLLBLevels; i++ )
			html += "<div " + "class='" + LIFE_LINE_BOXES_L2_L3_INFO_STYLE_CLASS + "'>" + "&nbsp;</div>";

		html += "</div></div>";

		return html;
	}

	function createSitesArrayMap ( data )
	{
		var result = itsDiagramLogic.buildMapOfSites ( data, itsLLBLevels );
		itsSitesBySiteIdMap = result.sitesMap;
		itsUniqueLLBIdBySiteIdMap = result.uniqueLLBIdMap;
	}

	function countAndCreateLifelineBoxes ( data )
	{
		var result = itsDiagramLogic.countAndCreateLifelineBoxes ( data, itsSitesBySiteIdMap );
		itsLifelineBoxesCount = result.lifelineBoxesCount;
		itsLifelineBoxes = result.lifelineBoxes;
	}

	function outputToConsole ( msg )
	{
		if ( Ext.isIE )
			return;
		
		if ( console !== undefined )
			console.log ( msg );
	}

	function _unitTest_getLifelineBoxesCount ()
	{
		if ( itsLifelineBoxesCount === undefined )
			return 0;
		else
			return itsLifelineBoxesCount;
	}

	function processColorConcurrentProcessing ( theCheckBox, checked )
	{
		itsFlagColorConcurrentProcessingUnits = checked;
		redisplayData();//Could consider something more efficient if that becomes an issue. Ideas: like 2 arrays of activation bars (show one set and hide the other). Or apply style dynamically (to try)
	}

	function processDisplayCallStackOrder ( theCheckBox, checked )
	{
		MODE_DISPLAY_BASED_ON_MSG_ORDER_NBR = !checked;
		redisplayData();
	}

//	function processDisplayOneWayActivationBarUpToReturn ( theCheckBox, checked )
//	{
//		itsFlagDisplayOneWayActivationBarUpToReturn = checked;
//		redisplayData();
//	}

    function changeMessageListFromFilterExtV3 ( combo, record, index )
    {
        itsLLBLevels = record.data.key;
        redisplayData();
    }

    function changeMessageListFromFilterExtV4 ( combo, selectedRecords, eOpts )
    {
        itsLLBLevels = selectedRecords[0].data.key;
        redisplayData();
    }

    function applyTooltipsToToolbarElements()
    {
        // Couldn't get this to work. Will need further investigation why.
//        var colorCPCalloutHtml = "Color the activation bars to visually distinguish concurrent activities";
//        new Ext.ToolTip ( { target: itsCheckBoxColorCP.getEl()
//                        , anchor: 'left'
//                        , dismissDelay: 0
//                        , html: colorCPCalloutHtml
//                        , autoHide: true
//                        , autoWidth: true
//                        , baseCls: LIFE_LINE_CALL_OUT_STYLE_CLASS
//                        });
//
//        new Ext.ToolTip ( { target: itsCheckBoxColorCPLabel.getEl()
//                        , anchor: 'left'
//                        , dismissDelay: 0
//                        , html: colorCPCalloutHtml
//                        , autoHide: true
//                        , autoWidth: true
//                        , baseCls: LIFE_LINE_CALL_OUT_STYLE_CLASS
//                        });
    }
    
	function createToolbarElements ()
	{
		if ( itsFlagExtVersion4 )
		    createToolbarElementsExtV4 ();
		else
		    createToolbarElementsExtV3 ();
	}

	function createToolbarElementsExtV4()
	{
//        debugger;
        
		itsCheckBoxColorCP = new Ext.form.field.Checkbox(
			{ name: 'colorCP'
//			, id: 'sequenceDiagramColorCPId'
			//, fieldLabel: //note: not used when not in a form, thus we create our own label
			, checked: false
            , hidden: true
			, handler: processColorConcurrentProcessing
			});

		itsCheckBoxColorCPLabel = new Ext.toolbar.TextItem(
            { text: 'x' // Text is set dynamically based on number of CP
            , hidden: true
            });

        itsCheckBoxDisplayCallStackOrder = new Ext.form.field.Checkbox(
            { name: 'DisplayCallStackOrder'
//            , id: 'sequenceDiagramDisplayCallStackOrderId'
            //, fieldLabel: //note: not used when not in a form, thus we create our own label
            , checked: false
            , hidden: true
            , handler: processDisplayCallStackOrder
            });

        itsCheckBoxDisplayCallStackOrderLabel = new Ext.toolbar.TextItem (
            { text: getI18nMessages('sequenceDiagram.toolbar.displayWithoutOverlap')
            , hidden: true
            });

//        var checkBoxDisplayOneWayActivationBarUpToReturnLabel = new Ext.toolbar.TextItem ( {text: 'Display full 1-way activation bar'} );
//        itsCheckBoxDisplayOneWayActivationBarUpToReturn = new Ext.form.Checkbox(
//            { name: 'DisplayOneWayActivationBarUpToReturn'
//            , id: 'sequenceDiagramDisplayOneWayActivationBarUpToReturnId'
//            , checked: false
//            , handler: processDisplayOneWayActivationBarUpToReturn
//            });

        var levels = [ [ 1, getI18nMessages('shared.technicalview.L1Name') ]
                     , [ 2, getI18nMessages('shared.technicalview.L2Name') ]
                     , [ 3, getI18nMessages('shared.technicalview.L3Name') ]
                     , [ 4, getI18nMessages('shared.technicalview.L4Name') ]
                     ];

//        var states = Ext.create('Ext.data.Store', {
//            fields: ['abbr', 'name'],
//            data : [
//                {"abbr":"AL", "name":"Alabama"},
//                {"abbr":"AK", "name":"Alaska"},
//                {"abbr":"AZ", "name":"Arizona"}
//                //...
//            ]
//        });

        var store = new Ext.data.ArrayStore( { fields:['key','text'], data: levels } );
        var combo = new Ext.form.field.ComboBox(
                    { store: store
                    , displayField:'text'
                    , valueField: 'key'
                    , queryMode: 'local'
                    , typeAhead: true
                    , triggerAction: 'all'
                    , selectOnFocus:true
                    , width: 110
                    });

        combo.setValue ( getI18nMessages('shared.technicalview.L3Name') );
        combo.on ( 'select', changeMessageListFromFilterExtV4 );
		combo.on ( 'afterrender', function() {
			var postProcessing = new Ext.util.DelayedTask ( function()
			{
//				console.log ("global expander control");
				finishCreatingGlobalExpanderCollapserControl ();
			});
			postProcessing.delay ( 200 );
		});


        itsToolbar.add ( getI18nMessages('sequenceDiagram.toolbar.showBy') );
        itsToolbar.add ( combo );

		if ( itsFlagEnableExpandersCollapsers )
		{
			itsToolbar.add('-');
			itsToolbar.add ( '<span>' + getHtmlForGlobalExpanderCollapserControl() + '</span>' );
            itsToolbar.add('-');
		}

//		itsToolbar.addFill();
		itsToolbar.add('->');
		itsToolbar.add ( itsCheckBoxColorCPLabel
				, itsCheckBoxColorCP
        	);
//			( '<span class="x-panel-header-text"><span style="font-size: 200%;">&nbsp;</span></span>'  // Size the toolbar
			

        itsToolbar.add('-');
        itsToolbar.add ( itsCheckBoxDisplayCallStackOrderLabel
            , itsCheckBoxDisplayCallStackOrder
            );

//        itsToolbar.add('-');
//        itsToolbar.add
//            ( checkBoxDisplayOneWayActivationBarUpToReturnLabel
//            , itsCheckBoxDisplayOneWayActivationBarUpToReturn
//            );
		var postProcessingToolbarTask = new Ext.util.DelayedTask ( function() { postProcessingToolbar(); } );
		postProcessingToolbarTask.delay ( 200 );
	}

	function createToolbarElementsExtV3()
	{
		itsCheckBoxColorCP = new Ext.form.Checkbox(
			{ name: 'colorCP'
//			, id: 'sequenceDiagramColorCPId'
			//, fieldLabel: //note: not used when not in a form, thus we create our own label
			, checked: false
            , hidden: true
			, handler: processColorConcurrentProcessing
			});

		itsCheckBoxColorCPLabel = new Ext.Toolbar.TextItem(
            { text: 'x' // Text is set dynamically based on number of CP
            , hidden: true
            });
        itsCheckBoxDisplayCallStackOrder = new Ext.form.Checkbox(
            { name: 'DisplayCallStackOrder'
//            , id: 'sequenceDiagramDisplayCallStackOrderId'
            //, fieldLabel: //note: not used when not in a form, thus we create our own label
            , checked: false
            , hidden: true
            , handler: processDisplayCallStackOrder
            });

        itsCheckBoxDisplayCallStackOrderLabel = new Ext.Toolbar.TextItem ( {text: getI18nMessages('sequenceDiagram.toolbar.displayWithoutOverlap'), hidden: true} );

//        var checkBoxDisplayOneWayActivationBarUpToReturnLabel = new Ext.Toolbar.TextItem ( {text: 'Display full 1-way activation bar'} );
//        itsCheckBoxDisplayOneWayActivationBarUpToReturn = new Ext.form.Checkbox(
//            { name: 'DisplayOneWayActivationBarUpToReturn'
//            , id: 'sequenceDiagramDisplayOneWayActivationBarUpToReturnId'
//            , checked: false
//            , handler: processDisplayOneWayActivationBarUpToReturn
//            });

        var levels = [ [ 1, getI18nMessages('shared.technicalview.L1Name') ]
                     , [ 2, getI18nMessages('shared.technicalview.L2Name') ]
                     , [ 3, getI18nMessages('shared.technicalview.L3Name') ]
                     , [ 4, getI18nMessages('shared.technicalview.L4Name') ]
                     ];

        var store = new Ext.data.SimpleStore ( { fields:['key','text'], data: levels });
        var combo = new Ext.form.ComboBox(
                    { store: store
                    , displayField:'text'
                    , typeAhead: true
                    , mode: 'local'
                    , triggerAction: 'all'
                    , selectOnFocus:true
                    , width: 110
                    });

        combo.setValue ( getI18nMessages('shared.technicalview.L3Name') );
        combo.on ( 'select', changeMessageListFromFilterExtV3 );

        itsToolbar.addText ( getI18nMessages('sequenceDiagram.toolbar.showBy') );
        itsToolbar.add ( combo );

		if ( itsFlagEnableExpandersCollapsers )
		{
			itsToolbar.addSeparator();
			itsToolbar.add ( '<span>' + getHtmlForGlobalExpanderCollapserControl() + '</span>' );
        	itsToolbar.addSeparator();
		}

		itsToolbar.addFill();
		itsToolbar.add ( itsCheckBoxColorCPLabel
				, itsCheckBoxColorCP
        	);
//			( '<span class="x-panel-header-text"><span style="font-size: 200%;">&nbsp;</span></span>'  // Size the toolbar
			

//        itsToolbar.addSeparator();
        itsToolbar.add ( itsCheckBoxDisplayCallStackOrderLabel
            , itsCheckBoxDisplayCallStackOrder
            );

//        itsToolbar.addSeparator();
//        itsToolbar.add
//            ( checkBoxDisplayOneWayActivationBarUpToReturnLabel
//            , itsCheckBoxDisplayOneWayActivationBarUpToReturn
//            );
		var postProcessingToolbarTask = new Ext.util.DelayedTask ( function() { postProcessingToolbar(); } );
		postProcessingToolbarTask.delay ( 200 );
	}

	function postProcessingToolbar()
	{
//		outputToConsole("in postProcessingToolbar - itsFlagGlobalExpanderCollapserControlNeedsPositioning: "+itsFlagGlobalExpanderCollapserControlNeedsPositioning);
		applyTooltipsToToolbarElements();

		if ( itsFlagEnableExpandersCollapsers )
			finishCreatingGlobalExpanderCollapserControl ();
	}

    function setLifeLineBoxesLevels( newLevel )
    {
        if ( newLevel > 0 && newLevel <= 4 )
            itsLLBLevels = newLevel; 
    }

	function setFlagEnableExpandersCollapsers ( flag, level )
	{
		itsFlagEnableExpandersCollapsers = flag;

		if ( flag && level !== undefined )
		{
			if ( level < 0 )
				itsCurrentExpandCollapseLevel = 0;
			else
				itsCurrentExpandCollapseLevel = level;
		}
	}

	// ---- Public Functions
	/** @scope com.actional.sequence.Diagram */
	return  { resetData: function(data) { resetObjectState( data ); resetData( data ); }
            /** Returns the Ext panel rendering this component */
            , getPanel: getPanel
            , getDiagramHeight: function(){ return itsDiagramHeight; }
            , getMainPanelConfigObject: getMainPanelConfigObject
            , destroy: destroy
            , setLifeLineBoxesLevels: setLifeLineBoxesLevels
			, setFlagEnableExpandersCollapsers: setFlagEnableExpandersCollapsers
			, globalExpandOneLevel: globalExpandOneLevel
			, globalCollapseOneLevel: globalCollapseOneLevel
			, setGlobalExpanderCollapserToMinOrMax: setGlobalExpanderCollapserToMinOrMax
            , _unitTest_getLifelineBoxesCount: _unitTest_getLifelineBoxesCount
            , _unitTest_getOperationStyleClass: function(){ return OPERATIONS_STYLE_CLASS; }
            , _unitTest_getLifelineBoxStyleClass: function(){ return LIFE_LINE_BOXES_STYLE_CLASS; }
            , _unitTest_getLifelineBoxAdditionalInfoStyleClass: function(){ return LIFE_LINE_BOXES_L2_L3_INFO_STYLE_CLASS; }
			, getId: function() { return itsUniqueId; }
            , setComponentUser: function(componentUser) { itsComponentUser = componentUser; }
            };
};
