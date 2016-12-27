

















var CONTEXT_PATH;

var gLastClickedEl;
var gUserName;
var gIsExport;
var gExchangeGUID;
var gContractGUID;

Ext.onReady ( function()
{
	CONTEXT_PATH = contextUrl("sos");

	var formatBtnT 		= Ext.get('formatBtnT');
	var formatBtnB 		= Ext.get('formatBtnB');

	if (!formatBtnT && !formatBtnB)
		return;

	if (formatBtnT)
		formatBtnT.on('click', viewOnClick);
	if (formatBtnB)
		formatBtnB.on('click', viewOnClick);
});

function viewOnClick()
{
	gLastClickedEl = this.id;
	gIsExport = "";

	var componentWin = Ext.getCmp('componentWin');
	if (!componentWin)
	{
		componentWin = new Ext.Window(
		{
			title		: 'Message Data',
			id 		: 'componentWin',
		    	closable	:true,
		    	closeAction	:'hide',
			width		:600,
			height		:350,
			plain		:true,
			layout		: 'fit',
			autoScroll	:true,
			items:
			[{
				xtype	: 'form',
				id	: 'loadingMsg',
				items	:
				[{
					xtype: 'label',
					html: '<div class="loading-indicator" height="100">Initializing exchange...</div>',
					height	:100
				}]
			}],
			buttons:
			[{
				text    : 'Close',
				id	: 'view_close_btn',
				disabled: true,
				handler : function()
				{
					var cWin = Ext.getCmp('componentWin');
					if (cWin)
						cWin.hide();
				}
		        },
		        {
		               	text     : 'Transfer to Team Server',
				id	: 'view_transfer_btn',
				disabled : true,
		               	handler  : exportOnClick
		        }]

		});

		componentWin.on('beforehide', abortPendingAjax, this);
	}

	componentWin.show(gLastClickedEl);

	initializeExchange();
}

function displayComponent(exchangeId)
{
	var showExchangeCompConfig =
                { exchangeId: exchangeId,
                 hideToolbar: true,
                 hideAnalysis: false,
                 hideAnnotation: true,
                 callbackWhenDone: showExchangeCompCreated,
                 loggedInUser: gUserName,
                 ajaxUrlPrefix: contextUrl("sos")
	};
/*
	            var showExchangeCompConfig =
	               { workspaceGuid: wsGUID,
	                  exchangeGuid: exGUID,
	                  hideToolbar: true,
	                  hideAnalysis: true,
	                  hideAnnotation: true,
	                  callbackWhenDone: showExchangeCompCreated,
	                  loggedInUser: gUserName,
	                  editWindowModal: false
	                };
*/
	mrCreateShowExchangeComponent ( showExchangeCompConfig );

	var componentWin = Ext.getCmp('componentWin');
	if (componentWin)
		componentWin.show(gLastClickedEl);
}

function initializeExchange()
{
	
	
	if (!exchangeIdValue || exchangeIdValue == 'null')
		createExchange();
	else
		displayComponent(exchangeIdValue);
}

function showExchangeCompCreated ( component )
{
	var parentPanel = component.getPanel();

	
	var componentPanel = parentPanel.getComponent(0);
	var componentWin = Ext.getCmp('componentWin');
	var xferToATSButtonDisabled;
	try
	{
		if ( gMessageExchangeWithMtom !== undefined && gMessageExchangeWithMtom )
			xferToATSButtonDisabled = true;
		else
			xferToATSButtonDisabled = false;
	}
	catch (e)
	{
		xferToATSButtonDisabled = false;
	}

	if (!componentWin)
	{
		componentWin = new Ext.Window(
		{
		    title	: 'Message Data',
		    id		: 'componentWin',
		    closable	:true,
		    closeAction	:'hide',
		    width	:600,
		    height	:350,
		    plain	:true,
		    layout	: 'fit',
		    autoScroll	:true,
		    items	: [componentPanel],
	            buttons	:
	            [{
			text     : 'Close',
			handler  : function()
			{
				componentWin.hide();
			}
	            },
	            {
	                    text     : 'Transfer to Team Server',
	                    handler  : exportOnClick,
			    disabled : xferToATSButtonDisabled
	            }]
		});

		componentWin.on('beforehide', abortPendingAjax, this);
	}
	else
	{
		componentWin.remove(Ext.getCmp('loadingMsg'), true);
		componentWin.add(componentPanel);

		var closeBtn = Ext.getCmp('view_close_btn');
		if (closeBtn)
			closeBtn.enable();

		var transferBtn = Ext.getCmp('view_transfer_btn');
		if (transferBtn && !xferToATSButtonDisabled)
			transferBtn.enable();

		componentWin.doLayout();
	}

	componentWin.show(gLastClickedEl);
}

function createExchange()
{
      	Ext.Ajax.request(
        {
        	url: contextUrl('admin/logging/exportexchange.jsrv'),
                success: ajaxInitExSuccess,
                failure: ajaxFailed,
                params:   { intializeExchange	: true },
                method: 'GET'
	});
}

function ajaxInitExSuccess ( connection, options )
{
	if (!connection.responseText)
		return;

	var result = Ext.util.JSON.decode ( connection.responseText );

	if (!result.success)
	{
		showMessagePopup("Error analyzing message.", result.message);
		return;
	}

	gUserName	= result.userName;

	
	gExchangeGUID 	= result.exchangeGUID;
	gContractGUID 	= result.contractGUID;

	getExIdFromGUID(result.workspaceGUID, gExchangeGUID);
}

function getExIdFromGUID (wsGuid, exGuid)
{
     var url = contextUrl("sos/exchangeEntry/getIdFromGUID");

     Ext.Ajax.request(
                 { url: url,
                  success: ajaxConvertGuidSuccess,
                  failure: ajaxFailed,
                  params:   { exchangeGuid: exGuid,
                              workspaceGuid: wsGuid
                             },
                  method: 'GET'
                 });
}

function ajaxConvertGuidSuccess ( connection, options )
{
	if (!connection.responseText)
		return;

	var result = Ext.util.JSON.decode ( connection.responseText );

	if (!result.success)
	{
		showMessagePopup("Error.", result.message);
		return;
	}

	exchangeIdValue = result.exchangeId;

	storeExchangeId(exchangeIdValue);
}

function ajaxFailed ( connection, options )
{
	
	var cwindow = Ext.getCmp('componentWin');
	if (cwindow && cwindow.hidden)
		return;

	var errorMsg = '';
	if ( connection.responseText !== undefined )
		errorMsg += connection.responseText + "\n";

	if ( connection.statusText !== undefined )
		errorMsg += connection.statusText;

	showMessagePopup('Error', errorMsg);
}

function storeExchangeId(id)
{
      	Ext.Ajax.request(
        {
        	url: contextUrl('admin/logging/exportexchange.jsrv'),
                success: ajaxStoreIdSuccess,
                failure: ajaxFailed,
                params:   { 	storeExchangeId	: true,
                		exchangeIdKey	: exchangeIdKey,
                		exchangeGUID	: gExchangeGUID,
                		exchangeIdValue	: id,
                		contractGUID	: gContractGUID
                	},
                method: 'GET'
	});
}

function ajaxStoreIdSuccess ( connection, options )
{
	if (!connection.responseText)
		return;

	var result = Ext.util.JSON.decode ( connection.responseText );

	if (!result.success)
	{
		showMessagePopup('Error', result.message);
		return;
	}

	displayComponent(result.exchangeId);
}

function getValue (elemId)
{
	var tmp = Ext.get(elemId);

	if (tmp && tmp.dom)
		return tmp.dom.value;
	return null;
}

function abortPendingAjax ()
{
	Ext.Ajax.abort();
	return true;
}
