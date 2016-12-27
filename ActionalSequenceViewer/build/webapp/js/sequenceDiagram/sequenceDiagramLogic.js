//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceDiagram/sequenceDiagramLogic.js $
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

com.actional.sequence.SequenceDiagramLogic = function()
{
	// Constants
	var ROOT_CONCURRENT_PROCESSING_ID = 0;

	var CONCURRENT_PROC_SCHEMA =
		{ START_MSG: 'startMsg'
		, CALL_STACK: 'callstack'
		, FLAG_PREVIOUS_REPLY_WAS_FROM_RECURSION: 'flagPreviousReplyWasFromRecursion'
		, NBR_REQUEST_IN_CONCURRENT_PROCESSING_UNIT: 'nbrRequestsInConcurrentProcessingUnit'
		};

	// Synonym to make code more readable
	var SCHEMA = com.actional.sequence.SequenceDataSchema;

	init();

	function init()
	{
		augmentSequenceDataSchemaWithClientSideDefinitions();
	}

    function buildMapOfSites ( data, level )
    {
        var sitesMapBySiteId = new Object();
        var uniqueLLBIdMapBySiteId = new Object();
        var sitesCount = 0;
        var allSites = data[SCHEMA.TOP_LEVEL_DATA.ALL_SITES];        
        for ( var i=0; i<allSites.length; i++ )
        {
            var site = allSites[i];
            var uniqueLLBoxId = injectUniqueLifelineBoxIdentifierInSite ( site, level );
            var key = site[SCHEMA.SITE.ID];
            sitesMapBySiteId[key] = site;
            sitesCount++;

            uniqueLLBIdMapBySiteId[key] = uniqueLLBoxId;
        }

        return { sitesMap: sitesMapBySiteId, sitesCount: sitesCount, uniqueLLBIdMap: uniqueLLBIdMapBySiteId };
    }

    function injectUniqueLifelineBoxIdentifierInSite ( site, level )
    {
        var uniqueLLBoxId = SCHEMA.computeUniqueBoxId ( site, level );
        site[SCHEMA.SITE.UNIQUE_LLBX] = uniqueLLBoxId;
        return uniqueLLBoxId;
    }

    function countAndCreateLifelineBoxes ( data, sites )
    {
        // We only count and create a lifeline box for unique site (Unique L1 to L3)
        // In other words, we ignore additional sites that have the same L1 to L3 but different L4.
        var lifelineBoxesCount = 0;
        var lifelineBoxes = new Object();
        var allMsgs = data[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES];
        for ( var i=0; i<allMsgs.length; i++ )
        {
            var msg = allMsgs[i];
            
            if(!msg[SCHEMA.MESSAGE.TYPE])
                continue;	// skip non-messages entries
            
            if ( msg[SCHEMA.MESSAGE.IGNORE] !== undefined && msg[SCHEMA.MESSAGE.IGNORE] ) 
                continue;

            var from = msg[SCHEMA.MESSAGE.FROM];
            var site = sites[from];
            var fromLLBUniqueId = site[SCHEMA.SITE.UNIQUE_LLBX];
            if ( lifelineBoxes[fromLLBUniqueId] === undefined )
            {
                lifelineBoxes[fromLLBUniqueId] = { index: lifelineBoxesCount, site: site };
                lifelineBoxesCount++;
            }

            var to = msg[SCHEMA.MESSAGE.TO];
            site = sites[to];
            var toLLBUniqueId = site[SCHEMA.SITE.UNIQUE_LLBX];
            if ( lifelineBoxes[toLLBUniqueId] === undefined )
            {
                lifelineBoxes[toLLBUniqueId] = { index: lifelineBoxesCount, site: site };
                lifelineBoxesCount++;
            }
        }

        return { lifelineBoxesCount: lifelineBoxesCount, lifelineBoxes: lifelineBoxes };
    }

	function ifPreviousCallIsRecursionMarkItWithOutboundCall ( callStack )
	{
		if ( ! callStack.isEmpty() )
		{
			var previousMsg = callStack.callReturn(); // pop it temporarily
			if ( previousMsg[SCHEMA.MESSAGE.RECURSION] !== undefined )
				previousMsg[SCHEMA.MESSAGE.RECURSION_WITH_OUTBOUND_CALL] = true;

			callStack.oneCall ( previousMsg );  // put it back
		}
	}

	function augmentSequenceDataSchemaWithClientSideDefinitions ()
	{
		SCHEMA.TOP_LEVEL_DATA.CONCURRENT_PROCESSING_DONE = "concurrentProcessingDone";
		SCHEMA.MESSAGE.NORMALIZED_SEQUENCE_ORDER = 'normalizedSequenceOrder';  // Sequence order without holes - zero base
		SCHEMA.MESSAGE.MULTITHREAD = 'multithread';  // boolean: when a request starts while there is another request pending. With oneWay, this is an indication of concurrent processing.  Even though it's called multithread, it can also be caused by a multiprocess operation.
		SCHEMA.MESSAGE.INDEX = 'index';  // message index
		SCHEMA.MESSAGE.CORRESPONDING_REQUEST_MSG = 'correspondingRequestMsg';
		SCHEMA.MESSAGE.CORRESPONDING_REPLY_MSG = 'correspondingReplyMsg';
        SCHEMA.MESSAGE.X_END_LINE = 'xEndLine';
        SCHEMA.MESSAGE.X_BEGIN_LINE = 'xBeginLine';
        SCHEMA.MESSAGE.LINE_POINTING_TO_RIGHT = 'linePointingToRight';
        SCHEMA.MESSAGE.Y_LINE = 'yLine';
		SCHEMA.MESSAGE.Y_BEGIN_ACTIVATION = 'yActivation';
		SCHEMA.MESSAGE.Y_END_ACTIVATION_ONE_WAY = 'yEndActivationOneWay';
		SCHEMA.MESSAGE.Y_BEGIN_ACTIVATION_FOR_CONPROC_TRANSITION = 'yActivationConcProcTransition';
		SCHEMA.MESSAGE.RECURSION = 'flagRecursion';
		SCHEMA.MESSAGE.X_RECURSION = 'xRecursion';
		SCHEMA.MESSAGE.RECURSION_WITH_OUTBOUND_CALL = 'recursionWithOutboundCall';
		SCHEMA.MESSAGE.ALERT_CALLOUT_CONTENT = 'alertCallOutContent';
		SCHEMA.MESSAGE.BEGIN_CONCURRENT_PROCESSING_UNIT = 'beginConcurrentProcessingUnit';
		SCHEMA.MESSAGE.NEXT_CONCURRENT_PROCESSING_UNIT_WHEN_BEGIN_CP_UNIT = 'nextConcurrentProcessingUnit';
		SCHEMA.MESSAGE.END_CONCURRENT_PROCESSING_UNIT = 'endConcurrentProcessingUnit';
		SCHEMA.MESSAGE.PREVIOUS_CONCURRENT_PROCESSING_UNIT_WHEN_END_CP_UNIT = 'previousConcurrentProcessingUnit';
		SCHEMA.MESSAGE.NBR_REQUEST_IN_CONCURRENT_PROCESSING_UNIT = 'nbrRequestsInConcurrentProcessingUnit';
		SCHEMA.MESSAGE.CONCURRENT_PROCESSING_ID = 'concurrentProcId';
		SCHEMA.MESSAGE.BEGIN_MAIN_CONCURRENT_PROCESSING = 'beginMainConcProc';
		SCHEMA.MESSAGE.END_MAIN_CONCURRENT_PROCESSING = 'endMainConcProc';
		SCHEMA.MESSAGE.LLB_FROM = 'llbFrom';
        SCHEMA.MESSAGE.DISCONNECTED_ACTIVATION = 'disconnectedActivation';

		// All these used for expander/collapser
		SCHEMA.MESSAGE.FIRST_IN_CALLSTACK_COLLAPSED = 'firstCollapsed'; // to flag where to display the expand sign when a stack is collapsed
		SCHEMA.MESSAGE.COLLAPSED_STATE = 'collapsed';
		SCHEMA.MESSAGE.IGNORE = 'ignore';
		SCHEMA.MESSAGE.CALL_DEPTH_FROM_HERE = 'callDepth';
		SCHEMA.MESSAGE.NBR_CALL_FROM_HERE = 'nbrCalls';
		SCHEMA.TOP_LEVEL_DATA.NBR_CALL_COMPUTED = 'nbrCallsComputed';
		SCHEMA.TOP_LEVEL_DATA.TOTAL_NBR_CALL = 'totalNbrCalls';
		SCHEMA.TOP_LEVEL_DATA.UNIQUE_NUMBER_CALLS = 'uniqueNbrCalls';
	}

	function createConcurrentProcessingContext ( msg )
	{
		var ctx = new Object();
		ctx[CONCURRENT_PROC_SCHEMA.START_MSG] = msg;
		ctx[CONCURRENT_PROC_SCHEMA.FLAG_PREVIOUS_REPLY_WAS_FROM_RECURSION] = false;
		ctx[CONCURRENT_PROC_SCHEMA.CALL_STACK] = new com.actional.sequence.CallStack(); // stack contains object literal with begin y coordinates of activation bar
		ctx[CONCURRENT_PROC_SCHEMA.NBR_REQUEST_IN_CONCURRENT_PROCESSING_UNIT] = 0;
		return ctx;
	}

	function incrementNumberRequestInProcessingUnit ( concurrentProcessingContexts, concurrentProcessingId )
	{
		var ctx = concurrentProcessingContexts[concurrentProcessingId];
		ctx[CONCURRENT_PROC_SCHEMA.NBR_REQUEST_IN_CONCURRENT_PROCESSING_UNIT] = ctx[CONCURRENT_PROC_SCHEMA.NBR_REQUEST_IN_CONCURRENT_PROCESSING_UNIT] + 1;
	}

	function getNumberRequestInProcessingUnit ( concurrentProcessingContexts, concurrentProcessingId )
	{
		var ctx = concurrentProcessingContexts[concurrentProcessingId];
		return ctx[CONCURRENT_PROC_SCHEMA.NBR_REQUEST_IN_CONCURRENT_PROCESSING_UNIT];
	}

	function computeMsgIndex ( allMsgs )
	{
		// inject a message index, once we are sorted by order number the call stack order can only be restored with msg index
		for ( var idxMsg = 0; idxMsg < allMsgs.length; idxMsg++ )
		{
			var msg = allMsgs[idxMsg];
			msg[SCHEMA.MESSAGE.INDEX] = idxMsg;
		}
	}

	// Calculate a normalized sequence order (the sequence order sent by server may have holes in it).
	function normalizeSequenceOrder ( allMsgs )
	{
		for ( var normalizedOrder = 0; normalizedOrder < allMsgs.length; normalizedOrder++ )
		{
			var msg2 = allMsgs[normalizedOrder];
			msg2[SCHEMA.MESSAGE.NORMALIZED_SEQUENCE_ORDER] = normalizedOrder;
		}
	}

	function constructPreProcessMsgResults ( concurrentProcessingContexts, nbrConcurrentProcessingContexts )
	{
		return { concurrentProcessingContexts: concurrentProcessingContexts, nbrConcurrentProcessingContexts: nbrConcurrentProcessingContexts };
	}

	function preProcessMessages ( data, uniqueLLBIdBySiteIdMap, sortInSequenceOrder, debugMsgData, reportInternalErrorFct )
	{
		var allMsgs = data[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES];
		if ( allMsgs === undefined || allMsgs.length == 0 )
			return constructPreProcessMsgResults ( null, 0 );

		computeMsgIndex ( allMsgs ); // Need to ensure this is done before changing the order of messages, so that the call stack order can be restored if needed

		var concurrentProcessingContexts; // map: key: concurrent processing id, concurrent processing context
		concurrentProcessingContexts = new Object();
		var concurrentProcessingId;  // unique id per concurrent processing context ( that is everytime we encounter a one way message)
		var currentConcurrentProcessingId;  // unique id per concurrent processing context (that is everytime we encounter a one way message)

		// we assume the first messages up to the first one way or the first multithread are all part of the main or root concurrent processing context
		concurrentProcessingId = ROOT_CONCURRENT_PROCESSING_ID;
		concurrentProcessingContexts[concurrentProcessingId] = createConcurrentProcessingContext ( allMsgs[0] );
		currentConcurrentProcessingId = concurrentProcessingId;

		markMsgStartingMultithreading ( allMsgs, uniqueLLBIdBySiteIdMap, debugMsgData, reportInternalErrorFct );

		var callStack = new com.actional.sequence.CallStack();
		for ( var idxMsg = 0; idxMsg < allMsgs.length; idxMsg++ )
		{
			var msg = allMsgs[idxMsg];
			var fromSiteId = msg[SCHEMA.MESSAGE.FROM];
			var toSiteId = msg[SCHEMA.MESSAGE.TO];
			var fromLLBId = uniqueLLBIdBySiteIdMap[fromSiteId];
			var toLLBId = uniqueLLBIdBySiteIdMap[toSiteId];
			var flagOneWay = getOneWayFlag ( msg );
			var flagMultiThread = getMultiThreadFlag ( msg );
			var recursionFlag = ( fromLLBId == toLLBId );
			if ( recursionFlag )
				msg[SCHEMA.MESSAGE.RECURSION] = true;

			if ( msg[SCHEMA.MESSAGE.TYPE] == SCHEMA.MESSAGE_TYPE_ENUM.REQUEST )
			{
				if ( callStack.isEmpty() && currentConcurrentProcessingId == ROOT_CONCURRENT_PROCESSING_ID )
					msg[SCHEMA.MESSAGE.BEGIN_MAIN_CONCURRENT_PROCESSING] = true;

				ifPreviousCallIsRecursionMarkItWithOutboundCall ( callStack );
				callStack.oneCall ( msg );
				msg[SCHEMA.MESSAGE.CONCURRENT_PROCESSING_ID] = currentConcurrentProcessingId;

				if ( flagOneWay || flagMultiThread )
				{
					msg[SCHEMA.MESSAGE.BEGIN_CONCURRENT_PROCESSING_UNIT] = true;

					concurrentProcessingId++;
					concurrentProcessingContexts[concurrentProcessingId] = createConcurrentProcessingContext ( msg );
					currentConcurrentProcessingId = concurrentProcessingId;

					msg[SCHEMA.MESSAGE.NEXT_CONCURRENT_PROCESSING_UNIT_WHEN_BEGIN_CP_UNIT] = concurrentProcessingId;
				}
				else
					incrementNumberRequestInProcessingUnit ( concurrentProcessingContexts, currentConcurrentProcessingId ); // only count the 2 ways request
			}
			else
			{
				var fromMsg = callStack.callReturn();
				if ( currentConcurrentProcessingId != fromMsg[SCHEMA.MESSAGE.CONCURRENT_PROCESSING_ID] )
				{
					msg[SCHEMA.MESSAGE.END_CONCURRENT_PROCESSING_UNIT] = true;
					msg[SCHEMA.MESSAGE.PREVIOUS_CONCURRENT_PROCESSING_UNIT_WHEN_END_CP_UNIT] = currentConcurrentProcessingId;
					msg[SCHEMA.MESSAGE.NBR_REQUEST_IN_CONCURRENT_PROCESSING_UNIT] = getNumberRequestInProcessingUnit ( concurrentProcessingContexts, currentConcurrentProcessingId );
				}

				currentConcurrentProcessingId = fromMsg[SCHEMA.MESSAGE.CONCURRENT_PROCESSING_ID];
				msg[SCHEMA.MESSAGE.CONCURRENT_PROCESSING_ID] = currentConcurrentProcessingId;
				msg[SCHEMA.MESSAGE.CORRESPONDING_REQUEST_MSG] = fromMsg;
                fromMsg[SCHEMA.MESSAGE.CORRESPONDING_REPLY_MSG] = msg;

				if ( callStack.isEmpty() && msg[SCHEMA.MESSAGE.CONCURRENT_PROCESSING_ID] == ROOT_CONCURRENT_PROCESSING_ID )
					msg[SCHEMA.MESSAGE.END_MAIN_CONCURRENT_PROCESSING] = true;  // special processing for consumer: we need to end the activation bar for consumer on that message and not the last message
			}
		}

		if ( sortInSequenceOrder )
			sortAllMsgsInSequenceOrder ( allMsgs );

		data[SCHEMA.TOP_LEVEL_DATA.CONCURRENT_PROCESSING_DONE] = true; // mark that we don't want to validate that data again (because it's sorted in sequence order and not in callstack order)

		return constructPreProcessMsgResults( concurrentProcessingContexts, concurrentProcessingId + 1 );
	}

	function sortAllMsgsInSequenceOrder ( allMsgs )
	{
		allMsgs.sort ( function ( a, b ) { return a[SCHEMA.MESSAGE.SEQUENCEORDER] - b[SCHEMA.MESSAGE.SEQUENCEORDER]; } );
	}

	function sortAllMsgsInCallStackOrder ( allMsgs )
	{
		// resort by index (to put in back in the original order)
		allMsgs.sort ( function ( a, b ) { return a[SCHEMA.MESSAGE.INDEX] - b[SCHEMA.MESSAGE.INDEX]; } );
	}

	function getListMultiThreadMsg( allMsgs )
	{
		var list = [];
		for ( var idxMsg = 0; idxMsg < allMsgs.length; idxMsg++ )
		{
			var currentMsg = allMsgs[idxMsg];
			if ( currentMsg[SCHEMA.MESSAGE.MULTITHREAD] !== undefined && currentMsg[SCHEMA.MESSAGE.MULTITHREAD] )
				list.push (currentMsg[SCHEMA.MESSAGE.INDEX]);
		}

		return list;
	}

	function clearMultiThreadFlag( allMsgs, multiThreadMsgList, reportInternalErrorFct )
	{
		for ( var i=0; i < multiThreadMsgList.length; i++ )
		{
			var msgIdx = multiThreadMsgList[i];
			var currentMsg = allMsgs[msgIdx];

			if ( currentMsg !== undefined )
			{
				if ( currentMsg[SCHEMA.MESSAGE.MULTITHREAD] !== undefined )
					currentMsg[SCHEMA.MESSAGE.MULTITHREAD] = false;
				else
					reportInternalErrorFct( "clearMultiThreadFlag: invalid msg " + msgIdx );
			}
			else
				reportInternalErrorFct( "clearMultiThreadFlag: invalid msg index " + msgIdx );
		}
	}

	function clearMultiThreadFlagWhenInBothList ( allMsgs, multiThreadMsgList1, multiThreadMsgList2, reportInternalErrorFct )
	{
	     // Assume there are not a lot elements in either list
		for ( var i=0; i < multiThreadMsgList1.length; i++ )
		{
			var msgIdx1 = multiThreadMsgList1[i];
			for ( var j=0; j < multiThreadMsgList2.length; j++ )
			{
				if ( multiThreadMsgList2[j] == msgIdx1 )
				{
					var currentMsg = allMsgs[msgIdx1];
					if ( currentMsg !== undefined )
					{
						if ( currentMsg[SCHEMA.MESSAGE.MULTITHREAD] !== undefined )
							currentMsg[SCHEMA.MESSAGE.MULTITHREAD] = false;
						else
							reportInternalErrorFct( "clearMultiThreadFlagWhenInBothList: invalid msg " + msgIdx1 );
					}
					else
						reportInternalErrorFct( "clearMultiThreadFlagWhenInBothList: invalid msg index " + msgIdx1 );
				}
			}
		}
	}

	// A heuristic to detect concurrent processing when there is a call (request) from or to an already active activation bar.
	function markMsgStartingMultithreading ( allMsgs, uniqueLLBIdBySiteIdMap, debugMsgData, reportInternalErrorFct )
	{
		// ++
		// Now detect the From case
		// --

		// First mark message when in call stack order
		markMsgStartingMultithreadingWhenMultipleFromActivation ( allMsgs, uniqueLLBIdBySiteIdMap, reportInternalErrorFct );

		var multiThreadMsgList1 = getListMultiThreadMsg ( allMsgs );

		clearMultiThreadFlag ( allMsgs, multiThreadMsgList1, reportInternalErrorFct );

		sortAllMsgsInSequenceOrder ( allMsgs );

		if ( debugMsgData )  // While in sequence order, normalize the order number (used for debug display)
			normalizeSequenceOrder ( allMsgs );

		markMsgStartingMultithreadingWhenMultipleFromActivation ( allMsgs, uniqueLLBIdBySiteIdMap, reportInternalErrorFct );

		var multiThreadMsgList2 = getListMultiThreadMsg ( allMsgs );

		sortAllMsgsInCallStackOrder ( allMsgs );

        // To remove spurious MT detections, for example, case 7 call B to A, the From (B) is active when both sorted in call stack order and in seq order
		clearMultiThreadFlagWhenInBothList ( allMsgs, multiThreadMsgList1, multiThreadMsgList2, reportInternalErrorFct );

		// ++
		// Now detect the To case
		// --
		markMsgStartingMultithreadingWhenMultipleToActivation ( allMsgs, uniqueLLBIdBySiteIdMap, reportInternalErrorFct );
	}

	// This function has to be called with all messages sorted in sequence order.
	// It is detecting the case where 2 or more threads make a call before one completes (Case 32 and 33)
	function markMsgStartingMultithreadingWhenMultipleFromActivation ( allMsgs, uniqueLLBIdBySiteIdMap, reportInternalErrorFct )
	{
		var pendingActivationBoxes = new Object();
		for ( var idxMsg = 0; idxMsg < allMsgs.length; idxMsg++ )
		{
			var currentMsg = allMsgs[idxMsg];
			var toSiteId = currentMsg[SCHEMA.MESSAGE.TO];
			var toLLBId = uniqueLLBIdBySiteIdMap[toSiteId];
			if ( currentMsg[SCHEMA.MESSAGE.TYPE] == SCHEMA.MESSAGE_TYPE_ENUM.REQUEST )
			{
				var fromSiteId = currentMsg[SCHEMA.MESSAGE.FROM];
				var fromLLBId = uniqueLLBIdBySiteIdMap[fromSiteId];
				startPendingActivation ( fromLLBId, pendingActivationBoxes, false, false );
				var recursionFlag = ( fromLLBId == toLLBId );
				if ( ! recursionFlag )
				{
					var multiThreadFlag = ( getPendingActivationCount ( fromLLBId, pendingActivationBoxes ) > 1 );
					if ( multiThreadFlag && !currentMsg[SCHEMA.MESSAGE.ONE_WAY] )
						currentMsg[SCHEMA.MESSAGE.MULTITHREAD] = true;
				}
			}
			else
			{
				stopPendingActivation ( toLLBId, pendingActivationBoxes, false, reportInternalErrorFct );
			}
		}
	}

	// This function has to be called with all messages sorted in call stack order.
	// It is detecting the case where we call to activation bar already in diagram (right to left) for example, case 7
	function markMsgStartingMultithreadingWhenMultipleToActivation ( allMsgs, uniqueLLBIdBySiteIdMap, reportInternalErrorFct )
	{
		var pendingActivationBoxes = new Object();
		for ( var idxMsg = 0; idxMsg < allMsgs.length; idxMsg++ )
		{
			var currentMsg = allMsgs[idxMsg];
			var toSiteId = currentMsg[SCHEMA.MESSAGE.TO];
			var toLLBId = uniqueLLBIdBySiteIdMap[toSiteId];
			if ( currentMsg[SCHEMA.MESSAGE.TYPE] == SCHEMA.MESSAGE_TYPE_ENUM.REQUEST )
			{
				var fromSiteId = currentMsg[SCHEMA.MESSAGE.FROM];
				var fromLLBId = uniqueLLBIdBySiteIdMap[fromSiteId];
				startPendingActivation ( fromLLBId, pendingActivationBoxes, false, false );
				var recursionFlag = ( fromLLBId == toLLBId );
				if ( ! recursionFlag )
				{
					// We do not go beyond 1 pending activation because it is uncertain if the request
					var multiThreadFlag = isPendingActivation ( toLLBId, pendingActivationBoxes ) && ( getPendingActivationCount ( toLLBId, pendingActivationBoxes ) == 1 );
					if ( multiThreadFlag && !currentMsg[SCHEMA.MESSAGE.ONE_WAY] )
						currentMsg[SCHEMA.MESSAGE.MULTITHREAD] = true;
				}
			}
			else
			{
				stopPendingActivation ( toLLBId, pendingActivationBoxes, false, reportInternalErrorFct );
			}
		}
	}

	function getOneWayFlag ( msg )
	{
		if ( msg[SCHEMA.MESSAGE.ONE_WAY] === undefined )
			return false;
		else
			return msg[SCHEMA.MESSAGE.ONE_WAY];
	}

	function getMultiThreadFlag ( msg )
	{
		if ( msg[SCHEMA.MESSAGE.MULTITHREAD] === undefined )
			return false;
		else
			return msg[SCHEMA.MESSAGE.MULTITHREAD];
	}

	function getSyntheticOperationFlag ( msg )
	{
		if ( msg[SCHEMA.MESSAGE.SYNTHETIC] === undefined )
			return false;
		else
			return msg[SCHEMA.MESSAGE.SYNTHETIC];
	}

	function startPendingActivation ( siteId, pendingActivationBoxes, flagOneWay, recursionFlag )
	{
		var recursionCount;
		if ( recursionFlag )
			recursionCount = 1;
		else
			recursionCount = 0;

		if ( pendingActivationBoxes[siteId] === undefined )
			pendingActivationBoxes[siteId] = { pendingCount: 1, recursionCount: recursionCount, flagOneWay: [flagOneWay] };
		else
		{
			var flags = pendingActivationBoxes[siteId].flagOneWay;
			flags.push ( flagOneWay );
			pendingActivationBoxes[siteId] = { pendingCount: pendingActivationBoxes[siteId].pendingCount + 1, recursionCount: pendingActivationBoxes[siteId].recursionCount + recursionCount, flagOneWay: flags };
		}
	}

	function stopPendingActivation ( siteId, pendingActivationBoxes, recursionFlag, reportInternalErrorFct )
	{
		var recursionCount;
		if ( recursionFlag )
			recursionCount = 1;
		else
			recursionCount = 0;

		if ( pendingActivationBoxes[siteId] === undefined )
		{
			reportInternalErrorFct ( "Empty pending activation box for " + siteId );
		}
		else
		{
			var flags = pendingActivationBoxes[siteId].flagOneWay;
			flags.pop();
			pendingActivationBoxes[siteId] = { pendingCount: pendingActivationBoxes[siteId].pendingCount - 1, recursionCount: pendingActivationBoxes[siteId].recursionCount - recursionCount, flagOneWay: flags };

			if ( pendingActivationBoxes[siteId] < 0 )
			{
				reportInternalErrorFct ( "Empty pending activation box for " + siteId );
				pendingActivationBoxes[siteId] = undefined;
			}
		}
	}

	function isPendingActivation ( siteId, pendingActivationBoxes )
	{
		if ( pendingActivationBoxes[siteId] === undefined || pendingActivationBoxes[siteId].pendingCount == 0 )
			return false;
		else
			return true;
	}

	function getPendingActivationCount ( siteId, pendingActivationBoxes )
	{
		return pendingActivationBoxes[siteId].pendingCount;
	}

	function getPendingActivationRecursionCount ( siteId, pendingActivationBoxes )
	{
		return pendingActivationBoxes[siteId].recursionCount;
	}

	//    function isPendingActivationOneWay  ( siteId, pendingActivationBoxes )
	//    {
	//        var flagIndex = pendingActivationBoxes[siteId].pendingCount - 1;
	//        return pendingActivationBoxes[siteId].flagOneWay[flagIndex];
	//    }
	//
	function isPreviousPendingActivationOneWay ( siteId, pendingActivationBoxes )
	{
		if ( pendingActivationBoxes[siteId].pendingCount < 2 )
			return false;

		var flagIndex = pendingActivationBoxes[siteId].pendingCount - 2;
		return pendingActivationBoxes[siteId].flagOneWay[flagIndex];
	}

	function isRootConcurrentProcessingId ( id )
	{
		if ( id == ROOT_CONCURRENT_PROCESSING_ID )
			return true;
		else
			return false;
	}

	function cloneDataWithMessagesDeepCopy ( data )
	{
		var oneSeqData = new Object();
		oneSeqData[SCHEMA.TOP_LEVEL_DATA.ALL_SITES] = data[SCHEMA.TOP_LEVEL_DATA.ALL_SITES];
		oneSeqData[SCHEMA.TOP_LEVEL_DATA.ALL_ICONS] = data[SCHEMA.TOP_LEVEL_DATA.ALL_ICONS];
		oneSeqData[SCHEMA.TOP_LEVEL_DATA.UNFINISHED_FLOW] = data[SCHEMA.TOP_LEVEL_DATA.UNFINISHED_FLOW];
		oneSeqData[SCHEMA.TOP_LEVEL_DATA.MISSING_DATA] = data[SCHEMA.TOP_LEVEL_DATA.MISSING_DATA];

		var copiedMsgs = [];
		var allMsgs = data[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES];
		for ( var idxMsg = 0; idxMsg < allMsgs.length; idxMsg++ )
		{
			var copiedMsg = new Object();
			var msg = allMsgs[idxMsg];
			for ( var key in msg )
			{
				copiedMsg[key] = msg[key];
			}

			copiedMsgs[idxMsg] = copiedMsg;
		}

		oneSeqData[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES] = copiedMsgs;

		return oneSeqData;
	}

	return  { countAndCreateLifelineBoxes: countAndCreateLifelineBoxes
            , buildMapOfSites: buildMapOfSites
            , cloneDataWithMessagesDeepCopy: cloneDataWithMessagesDeepCopy
            , preProcessMessages: preProcessMessages
            , isRootConcurrentProcessingId: isRootConcurrentProcessingId
            , getOneWayFlag: getOneWayFlag
            , getSyntheticOperationFlag: getSyntheticOperationFlag
            , startPendingActivation: startPendingActivation
            , stopPendingActivation: stopPendingActivation
            , getPendingActivationCount: getPendingActivationCount
            , getPendingActivationRecursionCount: getPendingActivationRecursionCount
            , isPreviousPendingActivationOneWay: isPreviousPendingActivationOneWay
            , isPendingActivation: isPendingActivation
            , CONCURRENT_PROC_SCHEMA: CONCURRENT_PROC_SCHEMA
            };
};
