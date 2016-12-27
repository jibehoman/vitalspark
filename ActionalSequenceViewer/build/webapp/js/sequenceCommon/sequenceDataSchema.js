//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceCommon/sequenceDataSchema.js $
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

/*  Schema in pseudo object literal notation

sequenceData =
{ allSites: array // All sites used in messages.  Each element is an object litteral  (see site)
, allMessages: array // Each element is an object litteral  (see message)
, allIcons: object literal // where key is iconId and value is an icon object literal
}

icon =
{ url16: string // the url to the 16x16 icon (whether the icon is desaturated or not is completely opaque to the client (in other words it's a decision made on the server when generating the data
}

site =
{ id: string // unique identifier used in messages to avoid duplicating a lot of data
, managed: boolean
, allLevels: array // An array of object litterals (See level)
}

level =
{ icon: number // index into arrays of icons?
, name: string // the displayable name
}

message =
{ sequenceOrder: number // 'sequence ordering' number - may not follow message array index
, type: string // Valid values: { request, reply }
, oneWay: undefined // true if this message denotes a one way operation (flag set on both request and reply)
, synthetic: undefined // true if this messsage have been created just to "fit" the datastructure. It does not represent real data.
, from: string  // NGSO id
, to: string  // NGSO id
, failure: string // empty: no failure, otherwise failure text
, securityFault: true
, associatedAlert : {...}  // message associated alert
, statistics: [...] 	// array of STAT_DATA
};


 @lastrev fix37335 - Sequence UI: one way calls integration commit
*/

Ext.namespace ( "com.actional.sequence" );

com.actional.sequence.SequenceDataSchema = function()
{
    var TOP_LEVEL_DATA =
        { ALL_SITES: "allSites"
        , ALL_MESSAGES: "allMessages"
        , ALL_ICONS: "allIcons"
        , USER_MESSAGE: "userMessage"  // undefined if no message to display to the user along with the data
        , UNFINISHED_FLOW: "unfinishedFlow"  // If the flow was unfinished
        , MISSING_DATA: "missingData"  // If flow is missing data (partial sequence)
        , MAJOR_VERSION: "majorVersion"
        , MINOR_VERSION: "minorVersion"
        };

    var USER_MESSAGE =
        {   TEXT: "text"	// text mandatory if there's a user message. Plain text format, /n is allowed for multi-lines.
        };

	var ICON = { URL16: "url16" };

    var SITE =
        { ID: "id"
        , MANAGED: "managed"
        , ALL_LEVELS: "allLevels"
        , UNIQUE_LLBX: "uniqueLLBoxId"  // A lifeline box may represent multiple sites, for example, sites that have the same operation (L4)
        };

    var MESSAGE_TYPE_ENUM =
        { REQUEST: 'request'
        , REPLY: 'reply'
        };

    var MESSAGE =
        { SEQUENCEORDER: 'sequenceOrder' // sequence order -- this is not the index, but a global ordering of the sequence as computed/guessed by the server 
        , TYPE: 'type'		// message type 'request' or 'reply'
        , ONE_WAY: 'oneWay'	// Optional. When not present, defaults to false.  True for one way request (also set on the reply)
        , SYNTHETIC: 'synthetic' // Optional. When not present, defaults to false.  True for synthetic messages to keep the call stack structure "valid" when we have partial data.
        , FROM: 'from'
        , TO: 'to'
        , OFFSETFROMPARENT: 'offsetFromParent'
        , FAILURE_TEXT: 'failureText'
        , ASSOCIATED_ALERT: 'associatedAlert'
        , SECURITY_FAULT: 'securityFault' // Optional: When not present, defaults to false.  True to indicate there was a security fault (For now for replies only) 
        , MESSAGE_NUMBER: 'msgNbr'  // Not sent by the server but computed locally
        , STATISTICS : 'statistics'	// undefined if none. This is an array of STAT_DATA objects.
		, BEGIN_SEGMENT: 'beginSegment' // Boolean: when true we are at beginning of a new segment. Undefined is equivalent to false. 
        };

    var STAT_DATA =			// Follow the array (natural) order when displaying statistics in a list.
        { STAT_TYPE: 'statType'		// stat identifier (Enum string). Compatible with com.actional.serverui.StatListDataSet "statmetadata".
        , CONSUMER_VALUE:'consumerValue'	// "raw" value (an integer) as reported by the consumer interceptor. Use 
        					// com.actional.serverui.StatListDataSet.getStatMetadata() or TypeFormatter
        					// to know how to interpret this statistic value.
        , PROVIDER_VALUE:'providerValue'  	// "raw" value (an integer) as reported by the provider interceptor. NOTE: there will always be 
        					// at least a consumerValue or a providerValue.
        };

    var STAT_DATA_TYPE_ENUM =		// Complete list of statType identifier that could be seen in STAT_DATA 
	{ CALL_TIME:"CALL_TIME"		// a.k.a. response time or duration
	, CALLSIZE:"CALLSIZE"
	, RECORDS:"RECORDS"		// a.k.a. "logical size"
	, CALLOPENTIME:"CALLOPENTIME"
	};

    var ALERT_DATA =
        { ALERT_MESSAGE: 'alertMessage'	// String (optional? user may not have entered any)
        , SEVERITY: 'severity'   	// 'ALARM' or 'WARNING' (red or yellow). NOTE: as of today, no flowmap generated for WARNINGs
        , CONDITION: 'condition'	// Optional: Generated string containing the condition that led to the alert
        				// (if a condition was used for that purpose)
        , STAT_TYPE: 'statType'   	// Optional: Enum (string). Only when a metric was involved
        };

    var LEVEL =
        { ICON: 'icon'
        , NAME: 'name'
        };

    function validate ( data )
    {
		// null data is now a valid case.  It indicates there is no sequence data.
		if ( data == null )
			return "ok";
		
        // Verify top level items
        validateItemExistsAndItsType ( data[TOP_LEVEL_DATA.ALL_SITES], "object", TOP_LEVEL_DATA.ALL_SITES );
        validateItemExistsAndItsType ( data[TOP_LEVEL_DATA.ALL_MESSAGES], "object", TOP_LEVEL_DATA.ALL_MESSAGES );
        validateItemExistsAndItsType ( data[TOP_LEVEL_DATA.ALL_ICONS], "object", TOP_LEVEL_DATA.ALL_ICONS );
        
        if(data[TOP_LEVEL_DATA.USER_MESSAGE] !== undefined)
        {
        	validateItemExistsAndItsType ( data[TOP_LEVEL_DATA.USER_MESSAGE], "object", TOP_LEVEL_DATA.USER_MESSAGE );
        	validateItemExistsAndItsType ( data[TOP_LEVEL_DATA.USER_MESSAGE][USER_MESSAGE.TEXT], "string", USER_MESSAGE.TEXT );
        }
        
		var allIcons = data[TOP_LEVEL_DATA.ALL_ICONS];
		
        // Verify sites
        var uniqueBoxesIdMapBySiteId = new Object();   // used to validate request messages are chained correctly.
        var sitesMap = new Object();   // used to validate site data in messages.
        var allSites = data[TOP_LEVEL_DATA.ALL_SITES];
        for ( var idxSite=0; idxSite<allSites.length; idxSite++ )
        {
            var site = allSites[idxSite];
            var siteId = site[SITE.ID];
            validateItemExistsAndItsType ( siteId, "string", SITE.ID );
            validateItemExistsAndItsType ( site[SITE.ALL_LEVELS], "object", SITE.ALL_LEVELS );
            validateItemExistsAndItsType ( site[SITE.MANAGED], "boolean", SITE.MANAGED );

            var allLevels = site[SITE.ALL_LEVELS];
            if ( allLevels.length == 0 || allLevels.length > 4 )
                throw new Error ( "Site " + siteId + " does not have any levels or too many levels - " + allLevels.length );

            for ( var j=0; j<allLevels.length; j++ )
            {
                var level = allLevels[j];
                validateItemExistsAndItsType ( level[LEVEL.ICON], "string", "level icon" );
                validateItemExistsAndItsType ( level[LEVEL.NAME], "string", "level name" );
				validateIconExists ( level[LEVEL.ICON], allIcons, level[LEVEL.NAME] );
            }

            sitesMap[siteId] = site;
            uniqueBoxesIdMapBySiteId[siteId] = computeUniqueBoxId ( site, 4 ); // From L1 to L4 - All request should be chained using L1 to L4 independently of what we display.
        }

        // Verify messages
        var messagesMap = new Object();
        var allMessages = data[TOP_LEVEL_DATA.ALL_MESSAGES];
        for ( var idxMsg=0; idxMsg<allMessages.length; idxMsg++ )
        {
            var msg = allMessages[idxMsg];
            var msgSequence = msg[MESSAGE.SEQUENCEORDER];
            validateItemExistsAndItsType ( msgSequence, "number", "message sequence" );
            if ( messagesMap[msgSequence] === undefined )
                messagesMap[msgSequence]= idxMsg;
            else
                throw new Error ( "message sequence is not unique - index 1st msg " + messagesMap[msgSequence] + " - index 2nd msg " + idxMsg );

            var type = msg[MESSAGE.TYPE];
            if ( type != MESSAGE_TYPE_ENUM.REQUEST && type != MESSAGE_TYPE_ENUM.REPLY )
	            throw new Error ("incorrect message type " + type + " for message " + msgSequence);

            if ( msg[MESSAGE.SECURITY_FAULT] !== undefined && type != MESSAGE_TYPE_ENUM.REPLY )
                throw new Error ( "Security fault is only for reply. Message " + msgSequence );

            var fromSite = msg[MESSAGE.FROM];
            validateItemExistsAndItsType ( fromSite, "string", "from site id" );
            var toSite = msg[MESSAGE.TO];
            validateItemExistsAndItsType ( toSite, "string", "to site id" );

            if ( sitesMap[fromSite] === undefined )
                throw new Error ("missing FROM site for message " + msgSequence + " - SiteID: "+fromSite);

            if ( sitesMap[toSite] === undefined )
                throw new Error ("missing TO site for message " + msgSequence + " SiteID: "+toSite);
            
            if(msg[MESSAGE.STATISTICS] !== undefined)
            {
        	    validateItemExistsAndItsType ( msg[MESSAGE.STATISTICS], "object", MESSAGE.STATISTICS );

        	    var statistics = msg[MESSAGE.STATISTICS];
        	    for ( var idxStat=0; idxStat<statistics.length; idxStat++ )
        	    {
        		    validateItemExistsAndItsType (statistics[idxStat], "object", MESSAGE.STATISTICS + "[]");
        		    verifyStatistic(statistics[idxStat], "message sequence :" + msgSequence);
        	    }
            }
        }

        validateSequences ( allMessages, uniqueBoxesIdMapBySiteId );

        return "ok";
    }

    function verifyStatType(statType, itemDescription)
    {
	    if(STAT_DATA_TYPE_ENUM[statType] === undefined)
		    throw new Error ("Unknown statistic '" + statType + "' for " + itemDescription);        
    }
    
    function verifyStatistic(stat_data, itemDescription)
    {
	    verifyStatType(stat_data[STAT_DATA.STAT_TYPE], itemDescription);
	    
	    if(stat_data[STAT_DATA.CONSUMER_VALUE] == undefined && stat_data[STAT_DATA.PROVIDER_VALUE] == undefined)
		    throw new Error ("missing statistic value (either consumerValue or providerValue) for "+itemDescription);

	    if(stat_data[STAT_DATA.CONSUMER_VALUE] != undefined)
		    validateItemExistsAndItsType(stat_data[STAT_DATA.CONSUMER_VALUE], "number", STAT_DATA.CONSUMER_VALUE);

	    if(stat_data[STAT_DATA.PROVIDER_VALUE] != undefined)
		    validateItemExistsAndItsType(stat_data[STAT_DATA.PROVIDER_VALUE], "number", STAT_DATA.PROVIDER_VALUE);
    }
    
    function computeUniqueBoxId ( site, nbrOfLevels )
    {
        var uniqueLLBoxId = "";

        var allLevels = site[SITE.ALL_LEVELS];
        for ( var i=0; i<nbrOfLevels; i++ )
        {
        	if ( allLevels[i] !== undefined )
        		uniqueLLBoxId += allLevels[i][LEVEL.NAME];
        }

        return uniqueLLBoxId;
    }

	function validateIconExists ( iconId, allIcons, levelName )
	{
		var icon = allIcons[iconId];

		if ( icon === undefined )
			throw new Error ("missing icon entry for icondId " + iconId + " levelName: " + levelName );

		var iconUrl = icon[ICON.URL16];
		if ( iconUrl === undefined || iconUrl == null || iconUrl == "" )
			throw new Error ("missing icon url for icondId " + iconId + " levelName: " + levelName );		
	}

    function validateSequences ( allMessages, uniqueBoxesIdMapBySiteId )
    {
        var callStack = new com.actional.sequence.CallStack();
        
        for ( var idxMsg=0; idxMsg<allMessages.length; idxMsg++ )
        {
            var msg = allMessages[idxMsg];
            var type = msg[MESSAGE.TYPE];

            if ( type == MESSAGE_TYPE_ENUM.REQUEST )
            {
                if ( ! callStack.isEmpty() )
                {
                    var currentCall = callStack.currentCall();
                    var boxWhereThisCallShouldStart = uniqueBoxesIdMapBySiteId[msg[MESSAGE.FROM]];
                    var currentCallBox = uniqueBoxesIdMapBySiteId[currentCall[MESSAGE.TO]];
                    if ( boxWhereThisCallShouldStart != currentCallBox )
                        throw new Error ( "Request not chained correctly at msg index: " + idxMsg );
                }

                callStack.oneCall( msg );
            }
            else if ( type == MESSAGE_TYPE_ENUM.REPLY )
            {
                if ( ! callStack.isEmpty() )
                {
                    var matchingRequest = callStack.callReturn();
                    if  ( msg[MESSAGE.FROM] != matchingRequest[MESSAGE.TO]
                        || msg[MESSAGE.TO] != matchingRequest[MESSAGE.FROM]
                        )
                        throw new Error ( "Reply not chained correctly at msg index: " + idxMsg );

                    validateOneWayFlag ( matchingRequest, msg, idxMsg );
                }
                else
                    throw new Error ( "Unmatched requests and replies detected at msg index: " + idxMsg );
            }
        }

        if ( ! callStack.isEmpty () )
        {
            var lastMsg = callStack.callReturn();
            throw new Error ( "Missing return messages - last message sequence: " + lastMsg[MESSAGE.SEQUENCE] );
        }
    }

    /**
     * Request      Response
     * =============================
     * undefined    undefined   OK
     * true         true        OK
     * true         false       fail
     * false        true        fail
     * true         undefined   fail
     * false        undefined   OK
     * undefined    true        fail
     * undefined    false       OK 
     *
     * @param request
     * @param response
     * @param idxMsg
     */
    function validateOneWayFlag ( request, response, idxMsg )
    {
        var requestHasOneWayFlag = request[MESSAGE.ONE_WAY] !== undefined;
        var requestIsOneWay;
        if  ( requestHasOneWayFlag )
            requestIsOneWay = request[MESSAGE.ONE_WAY];
        else
            requestIsOneWay = false;

        var responseHasOneWayFlag = response[MESSAGE.ONE_WAY] !== undefined;
        var responseIsOneWay;
        if ( responseHasOneWayFlag )
            responseIsOneWay = response[MESSAGE.ONE_WAY];
        else
            responseIsOneWay = false;

        if  ( requestIsOneWay && !responseIsOneWay )
        {
            throw new Error ( "Reply missing one way flag or flag has incorrect value at msg index: " + idxMsg );
        }

        if  ( responseIsOneWay && !requestIsOneWay )
        {
            throw new Error ( "Request missing one way flag or flag has incorrect value at msg index: " + idxMsg );
        }
    }

    function validateItemExistsAndItsType ( item, expectedType, itemDescription )
    {
        if ( item === undefined )
            throw new Error ("Missing item " + itemDescription );

        if ( typeof ( item ) !== expectedType )
            throw new Error ("Item " + itemDescription + " of incorrect type - " + typeof ( item ) );        
    }

	function getIconUrl ( iconId, allIcons )
	{
		var icon = allIcons[iconId];

		if ( !icon )
			return null;

		return icon[ICON.URL16];
	}

    return  { TOP_LEVEL_DATA: TOP_LEVEL_DATA
	    , USER_MESSAGE: USER_MESSAGE
            , ICON: ICON
            , SITE: SITE
            , LEVEL: LEVEL
            , MESSAGE: MESSAGE
            , STAT_DATA: STAT_DATA
            , STAT_DATA_TYPE_ENUM: STAT_DATA_TYPE_ENUM
            , MESSAGE_TYPE_ENUM: MESSAGE_TYPE_ENUM
            , ALERT_DATA: ALERT_DATA
            , validate: validate
            , getIconUrl: getIconUrl
            , computeUniqueBoxId: computeUniqueBoxId
            };
} (); // singleton
