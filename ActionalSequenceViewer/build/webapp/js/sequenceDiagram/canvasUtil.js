//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceDiagram/canvasUtil.js $
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

/**
 * @fileOverview A collection of general canvas operations
 *
 * @name Utility
 */

Ext.namespace ( "com.actional.sequence" );

/**
 * @class A singleton providing canvas functions.  The name of the available functions is self descriptive.
 */
com.actional.sequence.canvasUtil = function()
{
    var ARROW_DEPTH = 8;
    var ARROW_HEIGHT = 6;

    var SIZE_DASH = 5; // the height or width of a dashed line
    var SIZE_SPACER = 5; // the space between each dash

	function displayDashedRectangle ( ctx, x, y, width, height )
	{
		displayHorizontalDashedLine ( ctx, y, x, x + width, 2, 3 );
		displayHorizontalDashedLine ( ctx, y + height, x, x + width, 2, 3 );
		displayVerticalDashedLine ( ctx, x, y, y + height, 3, 3 );
		displayVerticalDashedLine ( ctx, x + width, y, y + height, 3, 3 );
	}

	function getSizeDash ( sizeDashInput )
	{
		if ( sizeDashInput === undefined )
			return SIZE_DASH;
		else
			return sizeDashInput;
	}

	function getSizeSpacer ( sizeSpacerInput )
	{
		if ( sizeSpacerInput === undefined )
			return SIZE_SPACER;
		else
			return sizeSpacerInput;
	}

    function displayVerticalDashedLine ( ctx, xVertical, yFrom, yTo, sizeDashInput, sizeSpacerInput )
    {
		var sizeDash = getSizeDash ( sizeDashInput );
		var sizeSpacer = getSizeSpacer ( sizeSpacerInput );

        ctx.beginPath();
        for ( var y=yFrom; y<yTo; )
        {
            ctx.moveTo ( xVertical, y );
			if ( y + sizeDash > yTo )
				y = yTo;
			else
            	y += sizeDash;
			
            ctx.lineTo ( xVertical, y );
            y += sizeSpacer;
        }
        ctx.stroke();
    }

    function displayHorizontalDashedLine ( ctx, yHorizontal, xFrom, xTo, sizeDashInput, sizeSpacerInput )
    {
		var sizeDash = getSizeDash ( sizeDashInput );
		var sizeSpacer = getSizeSpacer ( sizeSpacerInput );

        var xStart;
        var xEnd;
        var directionRight = xFrom <= xTo;
        if ( directionRight )
        {
            xStart = xFrom;
            xEnd = xTo;
        }
        else
        {
            xStart = xTo;
            xEnd = xFrom;
        }

        ctx.beginPath();
        for ( var x=xStart; x<xEnd; )
        {
            ctx.moveTo ( x, yHorizontal );
            x += sizeDash;
            ctx.lineTo ( x, yHorizontal );
            x += sizeSpacer;
        }
        ctx.stroke();
    }

    function drawArrowRight ( ctx, xTip, yTip )
    {
        drawArrow ( ctx, xTip, yTip, true );
    }

    function drawArrowLeft ( ctx, xTip, yTip )
    {
        drawArrow ( ctx, xTip, yTip, false );
    }

    function drawArrow ( ctx, xTip, yTip, pointToRight )
    {
        ctx.beginPath();
        ctx.moveTo( xTip, yTip );

        if ( pointToRight )
        {
            ctx.lineTo( xTip - ARROW_DEPTH, yTip - ARROW_HEIGHT );
            ctx.lineTo( xTip - ARROW_DEPTH, yTip + ARROW_HEIGHT );
        }
        else
        {
            ctx.lineTo( xTip + ARROW_DEPTH, yTip - ARROW_HEIGHT );
            ctx.lineTo( xTip + ARROW_DEPTH, yTip + ARROW_HEIGHT );
        }

        ctx.fill();
    }

    function displayHorizontalLine ( ctx, xFrom, xTo, y )
    {
        ctx.beginPath();
        ctx.moveTo ( xFrom, y );
        ctx.lineTo ( xTo, y );
        ctx.stroke();
    }

    return  { displayHorizontalLine: displayHorizontalLine
            , displayVerticalDashedLine: displayVerticalDashedLine
            , displayHorizontalDashedLine: displayHorizontalDashedLine
            , drawArrowRight: drawArrowRight
            , drawArrowLeft: drawArrowLeft
			, displayDashedRectangle: displayDashedRectangle
            , ARROW_DEPTH: ARROW_DEPTH
            };
} ();
