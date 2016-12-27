//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceTable/sequenceTableDataSchema.js $
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
 * @lastrev fix37426 - Sequence Table: Display Security Fault
 */
com.actional.sequence.SequenceTableDataSchema = function()
{
//	This structure is used as ExtJS JSON store. The main object is an 
// 	array where each item represents one row in the sequence table 
//
//	Each row is an object that looks like:	
//	{
//			sequence:
//			requestOrder:
//			siteId:
//			siteNameL1:
//			siteIconSrcL1
//			siteNameL2:
//			siteIconSrcL2:
//			siteNameL3:
//			siteIconSrcL3:
//			siteNameL4:
//			siteIconSrcL4:
//			activationStartTime:	
//			duration:      		151
//			activationStartOrder:0		// same order number than request.order (they are "linked")
//			activationEndOrder:2		// may be the same order number than reply.order (that means it they are "linked")
//			managed:       		true
//			fault:				// 'f' or 's' (or nothing)  for "fault" and "security fault" -- request and reply combined
//			request:  { order:0, offsetFromParent: 5, size:8310, failureText:'', associatedAlert:{}, synthetic:true}
//			reply:    { order:2, offsetFromParent: 156, offsetFromRequest: 151, size:145,  failureText:'', associatedAlert:{}, synthetic:true }
//				(null when no reply arrow)
//			consumerRowId:
//			consumerDuration:
//	}
	
	var ROW =
	{ 
		SEQUENCE: "sequence",
		REQUEST_ORDER: "requestOrder",	// number starting at 1 meant to show to the user. Ordering based on request's "sequence order"
		SITEID: "siteId",
		SITENAMELx: "siteNameL",
		SITENAMEL1: "siteNameL1",
		SITENAMEL2: "siteNameL2",
		SITENAMEL3: "siteNameL3",
		SITENAMEL4: "siteNameL4",
		SITEICONSRCLx: "siteIconSrcL",
		SITEICONSRCL1: "siteIconSrcL1",
		SITEICONSRCL2: "siteIconSrcL2",
		SITEICONSRCL3: "siteIconSrcL3",
		SITEICONSRCL4: "siteIconSrcL4",
		ACTIVATIONSTARTTIME: "activationStartTime",
		DURATION: "duration",
		ACTIVATIONSTARTORDER: "activationStartOrder",
		ACTIVATIONENDORDER: "activationEndOrder",
		MANAGED: "managed",
		FAULT: "fault",
		REQUEST: "request",
		REPLY: "reply",
		CONSUMERROWID: "consumerRowId",
		CONSUMERDURATION: "consumerDuration",
		COMBINEDFAILURETEXT: "combinedFailureText"
	};
    
	var MESSAGE =
        { 
		ORDER: "order",
		OFFSETFROMPARENT: "offsetFromParent", 
		OFFSETFROMREQUEST: "offsetFromRequest",
        	SIZE: "size",
        	FAILURE_TEXT: "failureText",
        	SECURITY_FAULT: "securityFault",
        	SYNTHETIC: "synthetic",			// true when arrow is "not real" (is missing in original data)
        	ASSOCIATED_ALERT: "associatedAlert"   // contents matches the same structure in the sequenceDataSchema
        };
	
    function validate ( data )
    {
        // Verify main structure
        validateItemExistsAndItsType ( data, "array", "main structure" );

        for(var i=0; i<data.length; i++)
        {
        	var row = data[i];

        	validateFieldExistsAndItsType( row, ROW.SEQUENCE, "number");
        	validateFieldExistsAndItsType( row, ROW.REQUEST_ORDER, "number");
        	validateFieldExistsAndItsType( row, ROW.SITEID, "string");
        	validateFieldExistsAndItsType( row, ROW.SITENAMEL1, "string");
        	validateFieldExistsAndItsType( row, ROW.SITENAMEL2, "string");
        	validateFieldExistsAndItsType( row, ROW.SITENAMEL3, "string");
        	validateFieldExistsAndItsType( row, ROW.SITENAMEL4, "string");

        	if(row[ROW.SITENAMEL1].length > 0)
        		validateFieldExistsAndItsType( row, ROW.SITEICONSRCL1, "string");
        	
        	if(row[ROW.SITENAMEL2].length > 0)
        		validateFieldExistsAndItsType( row, ROW.SITEICONSRCL2, "string");
        	
        	if(row[ROW.SITENAMEL3].length > 0)
        		validateFieldExistsAndItsType( row, ROW.SITEICONSRCL3, "string");
        	
        	if(row[ROW.SITENAMEL4].length > 0)
        		validateFieldExistsAndItsType( row, ROW.SITEICONSRCL4, "string");

        	validateFieldExistsAndItsType( row, ROW.ACTIVATIONSTARTTIME, "number");
        	validateFieldExistsAndItsType( row, ROW.DURATION, "number");
        	validateFieldExistsAndItsType( row, ROW.MANAGED, "boolean");

        	// CONSUMERROWID is optional
        	// CONSUMERDURATION is optional as well, but does not make sense
		// when there is no CONSUMERROWID

    	       	validateOptionalFieldType( row, ROW.CONSUMERROWID, "number");

        	if(row[ROW.CONSUMERDURATION] !== undefined)
        	{
        		validateFieldExistsAndItsType( row, ROW.CONSUMERROWID, "number");
        	}
        	else
        	{
        		validateOptionalFieldType( row, ROW.CONSUMERROWID, "number");
        	}
        	
        	// some messages may be missing (that is valid)
        	
        	if(row[ROW.REQUEST])
        		validateMessage(row[ROW.REQUEST]);
        	
        	if(row[ROW.REPLY])
        		validateMessage(row[ROW.REPLY]);
        }
        
        return "ok";
    }

	function validateMessage ( message )
	{
		validateOptionalFieldType(message, MESSAGE.OFFSETTIME, "number");
		validateOptionalFieldType(message, MESSAGE.MANAGED, "boolean");
		validateOptionalFieldType(message, MESSAGE.FAILURE_TEXT, "string");
	}

	function validateFieldExistsAndItsType ( parentObject, fieldname, expectedType )
	{
		validateItemExistsAndItsType ( parentObject[fieldname], expectedType, fieldname );
	}
    
	function validateOptionalFieldType ( parentObject, fieldname, expectedType )
	{
		validateOptionalItemType ( parentObject[fieldname], expectedType, fieldname );
	}

    	function validateOptionalItemType ( item, expectedType, itemDescription )
	{
		if ( item === undefined )
			return;
        
		validateType ( item, expectedType, itemDescription );
	}
    
	function validateItemExistsAndItsType ( item, expectedType, itemDescription )
	{
		if ( item === undefined )
			throw new Error ("Missing item " + itemDescription );

		validateType ( item, expectedType, itemDescription );
	}

	function validateType( item, expectedType, itemDescription )
	{
		if(expectedType == "array")
		{
			if ( expectedType instanceof Array )
			{
				throw new Error ("Item " + itemDescription + " of incorrect type '" + 
						typeof ( item ) + "'; expecting 'array'");
			}
		}
		else
		{
			if ( typeof ( item ) !== expectedType )
			{
				throw new Error ("Item " + itemDescription + " of incorrect type '" + 
						typeof ( item ) + "'; expecting '" + expectedType + "'");
			}
		}
	}
    
	return  { ROW: ROW
		, MESSAGE: MESSAGE
		, validate: validate
		};
} (); // singleton
