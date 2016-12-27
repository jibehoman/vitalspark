//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceCommon/callStack.js $
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

com.actional.sequence.CallStack = function(callDepthField)
{
	var stackPtr = 0;
	var callStack = []; // stack contains objects

    function oneCall ( data )
    {
        stackPtr++;
        callStack[stackPtr] = data;

		if ( callDepthField !== undefined )
			updateCallDepth();
    }

	function updateCallDepth()
	{
		for ( var i=1; i<=stackPtr; i++ )
		{
			var callDepth = callStack[i][callDepthField];
			if ( callDepth !== undefined )
			{
				if ( callDepth <= ( stackPtr - i ) )
					callStack[i][callDepthField] += 1;
			}
			else
				callStack[i][callDepthField] = 1;
		}
	}

    function currentCall()
    {
	    if ( isEmpty() )
	        throw new Error ("Empty call stack");
	
        return callStack[stackPtr];
    }
    
    function previousCall()
    {
	    if ( stackPtr <= 1 )
	        return null;

        return callStack[stackPtr-1];
    }

    function callReturn ()
    {
        if ( isEmpty() )
            throw new Error ("Empty call stack");
        
        var data = callStack[stackPtr];
        callStack[stackPtr] = null;
        stackPtr--;

        return data;
    }

    function isEmpty ()
    {
        return stackPtr == 0;
    }
    
    function isOnFirstObject ()
    {
        return stackPtr == 1;
    }

    return  { oneCall: oneCall
	        , currentCall: currentCall
	        , previousCall: previousCall
            , callReturn: callReturn
            , isEmpty: isEmpty
            , isOnFirstObject: isOnFirstObject
            };
};