//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceTable/sequenceTableStoreHelper.js $
// Checked in by: $Author: mohamed.sahmoud $
// $Date: 2015-04-14 14:03:31 +0000 (Tue, 14 Apr 2015) $
// $Revision: 64893 $
//---------------------------------------------------------------------------------------------------------------------
// Copyright (c) 2011-2015. Aurea Software, Inc. All Rights Reserved.
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
 *  @lastrev fix38612 - Show response time for all rows
 */
com.actional.ui.SequenceTableStoreHelper = function()
{
	var SCHEMA = com.actional.sequence.SequenceDataSchema;
	var TABLESCHEMA = com.actional.sequence.SequenceTableDataSchema;

	/**
	* @lastrev fix38395 - Sequence Table: support multiple flow/segments
	*/
	function convertSequenceDataToRows(sequenceData)
	{
		var itsSites = {};
		var itsIcons = {};
	 
		function getIconUrl(iconid)
		{
			var icon = itsIcons[iconid];
			
			if(!icon)
				return null;
			
			return icon.url16;
		}
		
		function fixSiteData(row)
		{
			var site = itsSites[row[TABLESCHEMA.ROW.SITEID]];
			
			row[TABLESCHEMA.ROW.SITENAMEL1] = site[SCHEMA.SITE.ALL_LEVELS][0]?site[SCHEMA.SITE.ALL_LEVELS][0][SCHEMA.LEVEL.NAME]:'';
			row[TABLESCHEMA.ROW.SITENAMEL2] = site[SCHEMA.SITE.ALL_LEVELS][1]?site[SCHEMA.SITE.ALL_LEVELS][1][SCHEMA.LEVEL.NAME]:'';
			row[TABLESCHEMA.ROW.SITENAMEL3] = site[SCHEMA.SITE.ALL_LEVELS][2]?site[SCHEMA.SITE.ALL_LEVELS][2][SCHEMA.LEVEL.NAME]:'';
			row[TABLESCHEMA.ROW.SITENAMEL4] = site[SCHEMA.SITE.ALL_LEVELS][3]?site[SCHEMA.SITE.ALL_LEVELS][3][SCHEMA.LEVEL.NAME]:'';
			
			row[TABLESCHEMA.ROW.SITEICONSRCL1] = site[SCHEMA.SITE.ALL_LEVELS][0]?getIconUrl(site[SCHEMA.SITE.ALL_LEVELS][0][SCHEMA.LEVEL.ICON]):null;
			row[TABLESCHEMA.ROW.SITEICONSRCL2] = site[SCHEMA.SITE.ALL_LEVELS][1]?getIconUrl(site[SCHEMA.SITE.ALL_LEVELS][1][SCHEMA.LEVEL.ICON]):null;
			row[TABLESCHEMA.ROW.SITEICONSRCL3] = site[SCHEMA.SITE.ALL_LEVELS][2]?getIconUrl(site[SCHEMA.SITE.ALL_LEVELS][2][SCHEMA.LEVEL.ICON]):null;
			row[TABLESCHEMA.ROW.SITEICONSRCL4] = site[SCHEMA.SITE.ALL_LEVELS][3]?getIconUrl(site[SCHEMA.SITE.ALL_LEVELS][3][SCHEMA.LEVEL.ICON]):null;
			
			row[TABLESCHEMA.ROW.MANAGED] = site[SCHEMA.SITE.MANAGED];
		}
		
		if(!sequenceData)
		{
			// return empty array when no data
			return [];
		}

		SCHEMA.validate ( sequenceData );
		
	        var sites = sequenceData[SCHEMA.TOP_LEVEL_DATA.ALL_SITES];
	        var messages = sequenceData[SCHEMA.TOP_LEVEL_DATA.ALL_MESSAGES];
	        
	        itsIcons = sequenceData[SCHEMA.TOP_LEVEL_DATA.ALL_ICONS];

	        itsSites = {};
	        
	        for(var i=0;i<sites.length;i++)
	        {
	        	var site = sites[i];
	        	
	        	itsSites[site.id] = site;
	        }
	      
	        var orderedRows = [];
	        
		var rows = [];

       	        var messageCount = 0;

	        var callStack = new com.actional.sequence.CallStack(); // stack contains row objects

	        for ( var idxMsg=0; idxMsg<messages.length; idxMsg++ )
	        {
	            var msg = messages[idxMsg];

	            var msgType = msg[SCHEMA.MESSAGE.TYPE];
	            var msgOrder = msg[SCHEMA.MESSAGE.SEQUENCEORDER];
	            var oneWay = msg[SCHEMA.MESSAGE.ONE_WAY];
	            var synthetic = msg[SCHEMA.MESSAGE.SYNTHETIC];
	            var msgFailureText = msg[SCHEMA.MESSAGE.FAILURE_TEXT];
	            var msgHasSecurityFault = msg[SCHEMA.MESSAGE.SECURITY_FAULT];
	            var msgAssociatedAlert = msg[SCHEMA.MESSAGE.ASSOCIATED_ALERT];
	            var offsetFromParent = msg[SCHEMA.MESSAGE.OFFSETFROMPARENT];
	            var statistics = msg[SCHEMA.MESSAGE.STATISTICS];
	            
	            if(offsetFromParent === undefined)
	        	    offsetFromParent = 0;

	        	if ( msgType == SCHEMA.MESSAGE_TYPE_ENUM.REQUEST )
	            {
		            var fromSiteId = msg[SCHEMA.MESSAGE.FROM];
		            var toSiteId = msg[SCHEMA.MESSAGE.TO];
		            
	        	    var newRow = {};

	        	    var rowIndex = rows.length; 

        		    var consumerRow;

	        	    if(callStack.isEmpty())
	        	    {
	        		    // new segment detected: create the initial "consumer" row
	        		    consumerRow = {};
	        		    
	        		    consumerRow[TABLESCHEMA.ROW.SEQUENCE] = rowIndex+1;
	        		    consumerRow[TABLESCHEMA.ROW.SITEID] = fromSiteId;
	        		    consumerRow[TABLESCHEMA.ROW.ACTIVATIONSTARTTIME] = 0;
	        		    consumerRow[TABLESCHEMA.ROW.ACTIVATIONSTARTORDER] = msgOrder;

		        	    fixSiteData(consumerRow);

		        	    rows[rowIndex] = consumerRow;
		        	    callStack.oneCall( consumerRow );

		        	    // register the consumer row in the new row
	        		    rowIndex++;
	        	    }
	        	    else
	        	    {
	        		    consumerRow = callStack.currentCall();
	        	    }

	        	    newRow[TABLESCHEMA.ROW.CONSUMERROWID] = consumerRow[TABLESCHEMA.ROW.SEQUENCE];
	        	    newRow[TABLESCHEMA.ROW.CONSUMERDURATION] = undefined;
	        	    
	        	    newRow[TABLESCHEMA.ROW.SEQUENCE] = rowIndex + 1;
	        	    newRow[TABLESCHEMA.ROW.SITEID] = toSiteId;
	        	    fixSiteData(newRow);
	        	    
	        	    newRow[TABLESCHEMA.ROW.ACTIVATIONSTARTTIME] = 
	        		    consumerRow[TABLESCHEMA.ROW.ACTIVATIONSTARTTIME] + offsetFromParent;
        		    newRow[TABLESCHEMA.ROW.ACTIVATIONSTARTORDER] = msgOrder;

	        	    var messageObj = { };
	        	    
	        	    messageObj[TABLESCHEMA.MESSAGE.OFFSETFROMPARENT] = offsetFromParent; 
	        	    messageObj[TABLESCHEMA.MESSAGE.ORDER] = msgOrder;
	        	    
	        	    if(msgHasSecurityFault)
	        	    {
	        		    newRow[TABLESCHEMA.ROW.FAULT] = 's';
	        		    messageObj[TABLESCHEMA.MESSAGE.SECURITY_FAULT] = msgHasSecurityFault;
	        	    }
	        	    
	        	    if(msgFailureText)
	        	    {
	        		    if(newRow[TABLESCHEMA.ROW.FAULT] != 's')
	        			    newRow[TABLESCHEMA.ROW.FAULT] = 'f';

	        		    messageObj[TABLESCHEMA.MESSAGE.FAILURE_TEXT] = msgFailureText;
	        	    }
	        	    
	        	    if(msgAssociatedAlert)
	        		    messageObj[TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT] = msgAssociatedAlert;

	        	    if(synthetic)
	        		    messageObj[TABLESCHEMA.MESSAGE.SYNTHETIC] = true;

	        	    if(statistics)
	        		    requestStatistics(statistics, newRow);
	        	    
	        	    newRow[TABLESCHEMA.ROW.REQUEST] = messageObj;

	        	    rows[rowIndex] = newRow;
	                    callStack.oneCall ( newRow );
	                    
	                    messageCount++;
	        	    orderedRows[msgOrder] = newRow;
	        	    
	        	    // Fill CALL_TIME stats for all rows
		            fillResponseTime(statistics, newRow);
	            }
	            else if ( msgType == SCHEMA.MESSAGE_TYPE_ENUM.REPLY )
	            {
	        	    var row = callStack.callReturn();
	        	    
	        	    var duration = offsetFromParent - row[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.OFFSETFROMPARENT];

	        	    if(duration < 0)
	        		    duration = 1; // error

	        	    row[TABLESCHEMA.ROW.DURATION] = duration;
	        	    row[TABLESCHEMA.ROW.ACTIVATIONENDORDER] = msgOrder;

	        	    if(!oneWay)
	        	    {
		        	    var messageObj1 = { };

		        	    messageObj1[TABLESCHEMA.MESSAGE.ORDER] = msgOrder;
		        	    messageObj1[TABLESCHEMA.MESSAGE.OFFSETFROMREQUEST] = duration;
		        	    messageObj1[TABLESCHEMA.MESSAGE.OFFSETFROMPARENT] = offsetFromParent;
		        	    
		        	    if(msgHasSecurityFault)
		        	    {
		        		    row[TABLESCHEMA.ROW.FAULT] = 's';
		        		    
		        		    messageObj1[TABLESCHEMA.MESSAGE.SECURITY_FAULT] = msgHasSecurityFault;
		        	    }
		        	    
		        	    if(msgFailureText)
		        	    {
		        		    if(row[TABLESCHEMA.ROW.FAULT] != 's')
		        			    row[TABLESCHEMA.ROW.FAULT] = 'f';
		        		    
		        		    messageObj1[TABLESCHEMA.MESSAGE.FAILURE_TEXT] = msgFailureText;
		        	    
		        	    }
		        	    if(msgAssociatedAlert)
		        		    messageObj1[TABLESCHEMA.MESSAGE.ASSOCIATED_ALERT] = msgAssociatedAlert;
		        	    if(synthetic)
		        		    messageObj1[TABLESCHEMA.MESSAGE.SYNTHETIC] = true;
		        	    if(statistics)
		        		    replyStatistics(statistics, row);
		        	    
		        	    row[TABLESCHEMA.ROW.REPLY] = messageObj1;
	        	    }

	        	    // combine failureTexts of both request and reply
	        	    
	        	    var combinedFailure = undefined;
	        	    
	        	    if(row[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.FAILURE_TEXT])
	        	    {
	        		    if(msgFailureText)
	        		    {
	        			   combinedFailure = row[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.FAILURE_TEXT] +
	        			   		"\n" + msgFailureText;
	        		    }
	        		    else
	        		    {
	        			   combinedFailure = row[TABLESCHEMA.ROW.REQUEST][TABLESCHEMA.MESSAGE.FAILURE_TEXT];
	        		    }
	        	    }
	        	    else if (msgFailureText)
	        	    {
	        		    combinedFailure = msgFailureText;
	        	    }    
	        	    
	        	    if(combinedFailure)
	        		    row[TABLESCHEMA.ROW.COMBINEDFAILURETEXT] = combinedFailure;

	        	    // is this the last message and therefore we need to close the "consumer" box?
	        	    // TODO: add "scope" information to allow many calls from the same "top" consumer.
	        	    if( callStack.isOnFirstObject() )
        		    {
	        		    // connect it to the initial consumer row
	        		    var initialConsumerRow = rows[callStack.callReturn()[TABLESCHEMA.ROW.SEQUENCE]-1];
        		    
	        		    initialConsumerRow[TABLESCHEMA.ROW.DURATION] = duration;
	        		    initialConsumerRow[TABLESCHEMA.ROW.ACTIVATIONENDORDER] = msgOrder;
        		    }
	        	    
	                    messageCount++;
	            }
	        }
	        
	        if(rows.length > 0)
	        {
		        // inject request order & sort rows based on it
	        	var sortedRows = [];
		        var requestOrder = 0;
		        
		        for(var j=0; j<orderedRows.length; j++)
		        {
		        	var r = orderedRows[j];
		        	if(r == undefined)
		        		continue;

		        	var consumerNewRow = rows[r[TABLESCHEMA.ROW.CONSUMERROWID]-1];
		        	
		        	if(consumerNewRow[TABLESCHEMA.ROW.ACTIVATIONSTARTORDER] == 
		        		r[TABLESCHEMA.ROW.ACTIVATIONSTARTORDER])
		        	{
			        	// msgOrder of consumerRow2 is the same as this one.
		        		
		        		// insert consumer row (was not a message in the input structure)
			        	sortedRows[requestOrder] = consumerNewRow;
			        	requestOrder++;
			        	consumerNewRow[TABLESCHEMA.ROW.REQUEST_ORDER] = requestOrder;
		        	}
		        	
		        	sortedRows[requestOrder] = r;
		        	requestOrder++;
		        	r[TABLESCHEMA.ROW.REQUEST_ORDER] = requestOrder;
		        }
		        
		        rows = sortedRows;
	        }
	        
	        return rows;
	}

	/**
	* @lastrev fix37407 - new method
	*/
	function requestStatistics(statistics, row)
	{
		for(var i=0;i<statistics.length;i++)
		{
			var stat = statistics[i];

			if(stat.statType == SCHEMA.STAT_DATA_TYPE_ENUM.CALLSIZE)
			{
				row.requestSize = stat;
			}
			else if(stat.statType == SCHEMA.STAT_DATA_TYPE_ENUM.RECORDS)
			{
				row.requestLogicalSize = stat;
			}
		}
	}

	/**
	* @lastrev fix38612 - CALL_TIME stat are omitted
	*/
	function replyStatistics(statistics, row)
	{
		for(var i=0;i<statistics.length;i++)
		{
			var stat = statistics[i];

			if(stat.statType == SCHEMA.STAT_DATA_TYPE_ENUM.CALLSIZE)
			{
				row.replySize = stat;
			}
			else if(stat.statType == SCHEMA.STAT_DATA_TYPE_ENUM.CALLOPENTIME)
			{
				row.callOpenTime = stat;
			}
			else if(stat.statType == SCHEMA.STAT_DATA_TYPE_ENUM.RECORDS)
			{
				row.replyLogicalSize = stat;
			}
		}
	}
	
	/**
	* @lastrev fix38612 - new method
	*/
	function fillResponseTime(statistics, row)
	{
		if (statistics)
		{
			for (var i = 0; i < statistics.length; i++)
			{
				var stat = statistics[i];
				if (stat.statType == SCHEMA.STAT_DATA_TYPE_ENUM.CALL_TIME)
				{
					row.replyResponseTime = stat;
					break;
				}
		  	}
		}
	}
	
	return(
	{
		convertSequenceDataToRows: convertSequenceDataToRows
	});
}();

