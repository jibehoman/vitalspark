//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceDiagram/diagramColors.js $
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

// The various colors used in the sequence diagram.
com.actional.sequence.DiagramColors = function()
{
    return  { ACTIVATION_BOX: "#202020"
            , ACTIVATION_FILL_MANAGED: '#b3ecb7'
            , ACTIVATION_FILL_UNMANAGED: '#f6f6f6'
            , SCALE: "#202020"
            , SCALE_BACKGROUND: "white"
            , CANVAS_BACKGROUND: "#F6F9ED"
            , LIFELINE: "#202020"
            , CALL_LINE: "blue"
            , CALL_LINE_WITH_FAILURE: "#ff2323"
            , RETURN_CALL_LINE: "#4ed459"
            };
} (); // singleton
