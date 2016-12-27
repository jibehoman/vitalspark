//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceDiagram/sequenceUtil.js $
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
 * @fileOverview A collection of general functions reused in several objects.
 *
 * @name Utility
 */

Ext.namespace ( "com.actional.sequence" );

/**
 * @class A singleton providing general utility functions.  The name of the available functions is self descriptive.
 */
com.actional.sequence.Util = function()
{
    function getHeightSurrounding ( appSurrounding )
    {
        if ( appSurrounding == null ) // apps without surroundings
            return 0;

        var h=0;
        for ( var i=0; i<appSurrounding.length; i++ )
        {
            var size = appSurrounding[i].getSize();//getViewSize();  on IE getViewSize always returns 0.
            //alert ( size.height );
            h+=size.height;
        }

        return h;
        //return { width: w, height: h };
    }

    function setPanelSize ( panel, appSurrounding, newWidth, newHeight )
    {
//        alert ( "setMainPanelSize: newWidth " + newWidth + " - newHeight: " + newHeight );

        //alert ( "Util.setPanelSize: " + newWidth + " - " + newHeight + " - HeightSurrounding: " + getHeightSurrounding ( appSurrounding ) );
        var h = (newHeight - getHeightSurrounding ( appSurrounding ))-1;
//        console.log ( "newWidth: "+newWidth+" - newHeight: "+newHeight + " - h: "+h );
        panel.setWidth ( newWidth );
        panel.setHeight ( h );
    }

    function setPanelSizeToFitInBody ( panel, appSurrounding )
    {
        var bodyEl = Ext.getBody();
//        alert ( "container size: h: " + itsMainPanel.getInnerHeight() + " - w: "+ itsMainPanel.getInnerWidth() +
//            "\nbody size: h: " + bodyEl.getHeight( true ) + " - w: "+ bodyEl.getWidth( true ) +
//            "\nbody view size: h: " + bodyEl.getViewSize().height + " - w: "+ bodyEl.getViewSize().width
//        );

        //var size = bodyEl.getViewSize();  // viewSize returns the full size of the window in which the body is rendered, while getSize returns only the size consumed within the body (on IE; in FF both calls return the same).
        var w = bodyEl.dom.offsetWidth;
        var h = bodyEl.dom.offsetHeight - 10;
//        var w2 = appSurrounding[0].getWidth();
//        console.log ( "w: "+w+" - w2: "+w2 + " - h: "+h );
        setPanelSize ( panel, appSurrounding, w, h );
    }

    function createExtButton ( text, tooltip, handler, icon, uniqueButtonId )
    {
        // If we want to use QT we need to initialize it first.
        //Ext.QuickTips.init();
        var btn;
        if ( uniqueButtonId === undefined )
        {
            btn = new Ext.Toolbar.Button (
                    { text: text
                    , tooltip: tooltip
                    , tooltipType: 'title'
    //                , tooltip: { text:'This is a QuickTip<br/>Line2 <b>aaaa</b>', headerAsText: true, header: true, title:'Tip Title', closable: true, autoHide:true}
                    , handler: handler
                    , minWidth: 40
                    , icon: icon
                    , cls: 'x-btn-text-icon'
                    });
        }
        else
        {
            btn = new Ext.Toolbar.Button (
                    { text: text
                    , tooltip: tooltip
                    , tooltipType: 'title'
    //                , tooltip: { text:'This is a QuickTip<br/>Line2 <b>aaaa</b>', headerAsText: true, header: true, title:'Tip Title', closable: true, autoHide:true}
                    , handler: handler
                    , minWidth: 40
                    , icon: icon
                    , cls: 'x-btn-text-icon'
                    , id: uniqueButtonId
                    });
        }

        return btn;
    }

    return  { setPanelSizeToFitInBody: setPanelSizeToFitInBody
            , setPanelSize: setPanelSize
            , createExtButton: createExtButton
            };
} ();
