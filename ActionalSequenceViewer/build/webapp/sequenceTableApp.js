//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/trunk/product/src/webapps.lg/lgserver/tests/sequenceDiagram/sequenceApp.js $
// Checked in by: $Author: ipavin $
// $Date: 2015-12-28 13:19:58 -0500 (Mon, 28 Dec 2015) $
// $Revision: 68182 $
//---------------------------------------------------------------------------------------------------------------------
// Copyright (c) 2015. Aurea Software, Inc. All Rights Reserved.
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
 *
 * @class A Web 2.0 Ext-js V3 or V2 app to test the display of the sequence diagram component
 * For Ext-js V4 see file sequenceAppExtV4.js
 *
 * @constructor
 * @param config
 * @config appElements An object literal containing the Ext elements (where to render the app and the surrounding elements).
 */
com.actional.sequence.TableApp = function ( config )
{
    // ---- Object State
    var itsMainPanel;
    var itsDiagram;

    init ();

    function init () // Constructor
    {
        Ext.QuickTips.init();

        itsDiagram = new com.actional.ui.SequenceTable ( );
        var centerPanel = new Ext.Panel (
            { layout: 'fit'
            , region: 'center'
            , header: false
            , width: 100
//            , autoScroll: true
            , border: true
            , bodyBorder: true
//            , html: "Center panel"
//            , bodyStyle: 'background-color: #F6F9ED;'
            , items: [ itsDiagram.getMainPanelConfigObject() ]
            });

        itsMainPanel = new Ext.Panel (
                { layout: 'border'
                , frame: true
                , border: true
                , width: '100%'
                , height: 600
                , bodyBorder: true
                , items: [ centerPanel ]
                });

        itsMainPanel.render ( config.appElement );
    }

    function resetData ( oldData, data )
    {
        itsMainPanel.setVisible(true);
        itsDiagram.resetData ( oldData, data );
    }
    function hide (  )
    {
        itsMainPanel.setVisible(false);
    }
    function setIconData ( mapIconsUrlByIconId )
    {
        itsMainPanel.setVisible(true);
        itsDiagram.setIconData ( mapIconsUrlByIconId );
    }

    // ---- Public Functions
    /** @scope com.actional.sequence.TableApp */
    return  { resetData: resetData
            , hide: hide
            , setIconData: setIconData
	    	, setFlagEnableExpandersCollapsers: function( flag ) { itsDiagram.setFlagEnableExpandersCollapsers( flag ); }
	    	, getDiagramHeight: function() { return itsDiagram.getDiagramHeight(); }
            };
};
