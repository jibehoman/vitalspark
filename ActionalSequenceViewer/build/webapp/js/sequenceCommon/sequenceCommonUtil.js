//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceCommon/sequenceCommonUtil.js $
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

/**
 * @fileOverview A collection of general functions reused in several objects.
 *
 * @name sequenceCommonUtil
 */

Ext.namespace ( "com.actional.sequence" );

/**
 * @class A singleton providing general utility functions common to the sequence components.  
 * The name of the available functions is self descriptive.
 *
 * @lastrev fix37407 - call new statformatter
 */
com.actional.sequence.sequenceCommonUtil = function()
{
	/**
	 * returns a short, plain text label to identify the statistic
	 *  
	 * @param statType the statistic type (as defined in statlistdataset)
	 */
	function getStatDataLabel(statType)
	{
		return com.actional.StatFormatter.labelForStat(statType);  
	}

	/**
	 * returns a statistic value along with its unit in a relatively compact form.
	 * 
	 * @param statType the statistic type (as defined in statlistdataset)
	 * @param value the consumerValue or providerValue to format
	 */
	function formatStatDataValue(statType, value)
	{
		return com.actional.StatFormatter.formatValue(statType, value);  
	}

    /**
     * Convert the input text to a value that is usable as html attribute
     * A typical usage example is convert the text for a tooltip (title attribute)
     */
    function escapeHtmlAttributeValue(inputText)
    {
        if(inputText == undefined)
            return undefined;

        var escapedText = inputText.replace(/&/g, "&amp;");
        escapedText = escapedText.replace(/'/g, "&#039;");
        escapedText = escapedText.replace(/"/g, "&quot;");
        escapedText = escapedText.replace(/</g, "&lt;");
        escapedText = escapedText.replace(/>/g, "&gt;");

        return escapedText;
    }

    /**
     * Convert the input text to a value that is usable in an html text value.
     */
    function escapeHtml(inputText)
    {
        if(inputText == undefined)
            return undefined;

        var escapedText = inputText.replace(/&/g, "&amp;");
        escapedText = escapedText.replace(/</g, "&lt;");
        escapedText = escapedText.replace(/>/g, "&gt;");
        escapedText = escapedText.replace(/\n/g, "<br>");

        return escapedText;
    }

	function getUniqueTime()
	{
		var time = new Date().getTime();
		while ( time == new Date().getTime() );

		var uniqueTime = new Date().getTime();

//		console.log (" ***** getUniqueTime " + uniqueTime );
		
		return uniqueTime;
	}

	return  {getStatDataLabel: getStatDataLabel
		, formatStatDataValue: formatStatDataValue
        , escapeHtmlAttributeValue: escapeHtmlAttributeValue
        , escapeHtml: escapeHtml
		, getUniqueTime: getUniqueTime
	    };
} ();
