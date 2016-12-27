//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceCommon/sequenceData.js $
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

Ext.namespace ( "com.actional.sequence" );

/**
 * @class takes care of querying the server for sequence data
 *
 * An instance of this class will manage one sequence data set that can
 * be shared with other components. 
 * 
 * This is not a singleton and requires to be instantiated. 
 * 
 * 'userData' is used to bind the right data set if multiple sequence data is
 * on the page.
 * 
 * This can be configured to respond automatically to global statDomainChanged 
 * events by calling bindWithStatDomainChangedEvent().
 * 
 * The OpenAjax event "com.actional.serverui.sequenceDataChanged" 
 * (can also use com.actional.sequence.SequenceData.EVENT)
 * will take place to signify that a new data is
 * available or changed.
 * 
 * publisherData will contain:
 * 
 * {
 * 	data:	{...},
 * 	error: false,
 * 	error_message: '',
 * 	user_data: userData,
 * 	source: 'sequencedata'
 * }
 *
 * data is the actual data structure. This can be null if there is no data
 * (meaning that components should display nothing). This is a normal situation.
 * When there is an error, the errorMsg will (hopefully) contain the cause explanation
 * to show to the user. (This message can be augmented to say that we cannot display 
 * something or whatever applies to the UI component).
 *
 * SequenceData is the "owner" of that event, and thus an EventRequest can
 * be used to retrieve the current data.
 * 
 * @lastrev fix38531 - prevent double or triple reloading of the same data
 */
com.actional.sequence.SequenceData = function (userData)
{
	var EVENT = 'com.actional.serverui.sequenceDataChanged';
	var SOURCEID = 'sequencedata';
	var itsUserData = userData;
	
	var itsCurrentDomainId = undefined;
	
	var itsEventOwner = new com.actional.EventDataOwner();
	
	itsEventOwner.addEvent(EVENT);
	itsEventOwner.finalSetup(SOURCEID);

	function publishSequenceData(data)
	{
		OpenAjax.hub.publish(EVENT,
		{
			source	  : SOURCEID,
			user_data : itsUserData,
			error	  : false,
			data 	  : data
		});
	}

	function publishError(errormsg)
	{
		OpenAjax.hub.publish(EVENT,
		{
			source		: SOURCEID,
			user_data	: itsUserData,
			error		: true,
			error_message	: errormsg
		});
	}

	/**
	 * mask with error message when domainid is invalid for PCT technical view portlet
 	 * @lastrev fix38531 - add forceRefresh to prevent double or triple reloading of the same data
	 */
	function onStatDomainChanged(domainid, forceRefresh)
	{
		// if domainid is an empty string, the error message should be published as invalid on sequencediagram/table
		// in which case this if block should not be executed.
		if(typeof domainid == 'undefined') 
		{
			// no domainid means no selection
			itsCurrentDomainId = undefined;
			publishSequenceData(null);
			return;
		}
		
		if(!forceRefresh && itsCurrentDomainId == domainid)
			return;
		
		itsCurrentDomainId = domainid;
		
		Ext.Ajax.request(
		{
	        	url: contextUrl('portal/operations/sequencedata.jsrv'),
	                params: 
	                { 
	                	domain : domainid 
	                },
	                method: 'GET',
	                callback: function(options, success, response)
	                {
		        		if (!success)
		        		{
		        			itsCurrentDomainId = undefined;
		        			if (response && response.getResponseHeader)
		        				publishError(response.getResponseHeader("X-Actional-Error-Message"));
		        			else
		        				publishError("internal error");
		        			return;
		        		}
		        
		        		try
		        		{
			        		var data;
							if ( Ext.util.JSON !== undefined )
								data = Ext.util.JSON.decode(response.responseText); // Extjs V3 or less
							else
								data = Ext.JSON.decode(response.responseText);      // Extjs V4 or greater
			        		
			                	publishSequenceData(data);
		        		}
		        		catch(e)
		        		{
		        			publishError(e.message);
		        			itsCurrentDomainId = undefined;
		        		}
	                }
		});
	}

	/**
 	 * @lastrev fix38531 - add forceRefresh to prevent double or triple reloading of the same data
	 */
	function bindWithStatDomainChangedEvent()
	{
		OpenAjax.hub.subscribe('com.actional.serverui.statDomainChanged',
		function(event, publisherData, subscriberData)
		{
			onStatDomainChanged(publisherData.statdomainid, publisherData.forceRefresh);
		},
		this,
		{source : SOURCEID});
	
		// Request current domainid (i.e. alert ID or flowmap ID) if already known
		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: SOURCEID,
			events	: ['com.actional.serverui.statDomainChanged']
		});
	}	
	
	return { EVENT:EVENT,
		 onStatDomainChanged:onStatDomainChanged,
		 bindWithStatDomainChangedEvent:bindWithStatDomainChangedEvent
		 };
};
