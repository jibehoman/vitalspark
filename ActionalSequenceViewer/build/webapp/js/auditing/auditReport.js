//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/auditing/auditReport.js $
// Checked in by: $Author: mohamed.sahmoud $
// $Date: 2015-04-14 14:03:31 +0000 (Tue, 14 Apr 2015) $
// $Revision: 64893 $
//---------------------------------------------------------------------------------------------------------------------
// Copyright (c) 2012-2015. Aurea Software, Inc. All Rights Reserved.
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
 *  @lastrev fix38746 - added loading message when the data is being loaded.
 */
com.actional.ui.AuditReport = function(portletId)
{
	var getI18nMessages = com.actional.serverui.technicalview.getMessage;

	var itsDataStore;
	var itsCurrentDomainId;

	// used only if this panel is visible in pct portlet.
	var itsPortletId = portletId;
	var itsToBeSelectedInteractionId;

	function displayAuditReport(data)
	{
		clearError();
		hideMessage();
		var thisGrid = Ext.getCmp(getGridId());

		if(!data)
		{
			itsDataStore.clearData();
			showMessage({msg:'No Audit Records'});
			return;
		}

		if (!thisGrid)
			return;

		var rows = data.rows;

		var columnModel = thisGrid.getColumnModel();

		var visibleheaders = data.visibleheaders;

		for(var i=0; i<visibleheaders.length; i++)
		{
			var header = visibleheaders[i];
			var index = columnModel.getIndexById( header.id );

			columnModel.setHidden( index, !header.visible );
		}

		itsDataStore.loadData({rows:rows, total:rows.length});
	}

	/** load audit record data from server
	 */
	function loadAndRefreshIfNeeded(domainid)
	{
        	if(itsCurrentDomainId != domainid)
        		return loadAndRefresh(domainid);
	}

	function loadAndRefresh(domainid)
	{
        	itsCurrentDomainId = domainid;

		clearError();
		markLoading();

		Ext.Ajax.request(
		{
			url: contextUrl('portal/logging/auditreport.jsrv'),
			params:
			{
				domain : domainid
			},
			method: 'GET',
			callback: function(options, success, response)
			{
				clearError();

				if (!success)
				{
					itsCurrentDomainId = undefined;

					if (response && response.getResponseHeader)
						showMessage({msg:response.getResponseHeader("X-Actional-Error-Message")});
					else
						showMessage({msg:"internal error"});

					return;
				}

				try
				{
					var data = Ext.util.JSON.decode(response.responseText);

					displayAuditReport(data);
				}
				catch(e)
				{
					itsCurrentDomainId = undefined;

					showMessage({msg:e.message});
				}
			}
		});

	}

	function onStatDomainChanged(domainid, forceRefresh)
	{
		if(typeof domainid == 'undefined')
		{
			// no domainid means no selection
			itsCurrentDomainId = undefined;
			displayAuditReport(null);
			return;
		}

		if(forceRefresh)
			loadAndRefresh(domainid);
		else
			loadAndRefreshIfNeeded(domainid);
	}

	function init()
	{
		var fieldList = com.actional.DataStore.auditfield.getAuditFieldList();

		var jsonStoreFields = [];

		for(var i=0; i<fieldList.length; i++)
		{
			var field = fieldList[i];

			var storeField = {};
			storeField.name = field.id;

			jsonStoreFields.push(storeField);
		}

		// create the data store
		itsDataStore = new Ext.data.ArrayStore(
		{
			idProperty: 'sequence',
			root: 'rows',
			fields : jsonStoreFields  // all known fields
		});
	}

	function getGridId()
	{
		return "auditreport_grid";
	}

	function getGrid()
	{
		return Ext.getCmp(getGridId());
	}

	function getGridEl()
	{
		return Ext.get(getGridId());
	}

	function tabPanelActivation()
	{
	}

	function fieldWidth(id)
	{
		switch(id)
		{
		case 'interaction':
		case 'flow':
		case 'chain':
			return 180;
		case 'reception_datetime':
			return 140;
		case 'status':
			return 75;
		default:
			return 120;
		}
	}

	function jumpToAuditRecordDetails(dbKey, interactionId, flowId)
	{
		if (top.PCT && top.PCT.eventmanager && top.document.location.href.indexOf("pctDisplayMode=rpmsuite") < 0)
		{
			// we are in PCT dashboard page publish the ipc event.
			var tokens = ["Interaction Id", "Flow Id", "Actional Database Id"];
			var values = [interactionId, flowId, dbKey];

			top.PCT.eventmanager.publish(itsPortletId, tokens, values);
		}
		else
		{
			// we are in standalone actional or rpm suite page
			var paramsToConvert =
			{
				flowId: flowId,
				interactionId: interactionId,
				dbKey: dbKey
			};

			if (typeof auditRecordDetailsBackUrl !== 'undefined' && auditRecordDetailsBackUrl)
			{
				paramsToConvert.returnUrl = auditRecordDetailsBackUrl;
			}

			var params = Ext.urlEncode(paramsToConvert);

			document.location.href = contextUrl("portal/pct/auditrecord.jsp?" + params);
		}
	}

	function getMainPanelConfigObject()
	{
		var fieldList = com.actional.DataStore.auditfield.getAuditFieldList();

		var columnList = [];

		for(var i=0; i<fieldList.length; i++)
		{
			var field = fieldList[i];

			var column = {
				id : field.id,
				dataIndex : field.id,
				header : field.name,
				hidden : true,
				hideable: ((field.id == "dbkey") ? false : true),
				width : fieldWidth(field.id),
				sortable : true
			};

			columnList.push(column);
		}

		columnList.push(
		{
			xtype : 'actioncolumn',
			sortable : false,
			menuDisabled : true,
			fixed : true,
			resizable : false,
			hideable : false,
			width : 40,
			items :
			[{
				getClass : function(v, meta, rec)
				{
					return 'act-grid-drilldown-action-icon';
				},
				tooltip : 'Jump to Details',
				handler : function(grid, rowIndex, colIndex)
				{
					var rec = grid.store.getAt(rowIndex);
					var flowId = rec.get('flow');
					var interactionId = rec.get('interaction');
					var dbKey = rec.get('dbkey');
					jumpToAuditRecordDetails(dbKey, interactionId, flowId);
				}
			}]
		});

		return {
			id:'auditreport',
			layout:'border',
			listeners :
			{
				activate : tabPanelActivation
			},
			items: [
			{
				region:'north',
				id:'auditreport_message',
				height:'auto',
				bodyCssClass:'sequence-messagepanel'
			},
			{
				xtype: 'grid',
				region:'center',
				store : itsDataStore,
				id : getGridId(),
				// TODO: remember shown/hidden columns & their size
				// stateful: true,
				// stateId: 'alert_'+getGridId(),
				minColumnWidth: 25,
				colModel: new Ext.grid.ColumnModel( // colModel is defined to handle column appear/disappear events
				{
					columns : columnList
				}),
				stripeRows : true,
				listeners :
				{
					afterrender : function()
					{
						afterRender();
					},
					scope : this
				},
				height : '100%',
				width : '100%',
				title : getI18nMessages('auditReport.panelTitle'),
				viewConfig:
				{
					listeners:
					{
						refresh: function()
						{
							afterGridRefresh.defer(1);
						},
						scope: this
					}
				}
			}]
		};
	}

	function afterGridRefresh()
	{
		if (itsToBeSelectedInteractionId)
		{
			var index = itsDataStore.find('interaction', itsToBeSelectedInteractionId);

			// clear it off because the grid may be also refreshed by refresh button.
			// in that case we donot want to auto select this record.
			itsToBeSelectedInteractionId = null;

			if (index != -1)
			{
				var grid = Ext.getCmp(getGridId());
				grid.getSelectionModel().selectRow(index);
				grid.getView().focusRow(index);
			}
		}
	}

	function afterRender()
	{
		hideMessage();
		var SOURCEID = "AuditReport";

		OpenAjax.hub.subscribe(
			'com.actional.serverui.statDomainChanged',
			function(event, publisherData, subscriberData)
			{
				onStatDomainChanged(publisherData.statdomainid, publisherData.forceRefresh);
			},
			this,
			{source : SOURCEID}
		);

		// Request current domainid (i.e. alert ID or flowmap ID) if already known
		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: SOURCEID,
			events	: ['com.actional.serverui.statDomainChanged']
		});
	}

	/** @param componentid is optional
	 *
	 *  @lastrev fix37267 - new option configure component id
	 */
	function renderTo(containerDiv, componentid)
	{
		var config = getMainPanelConfigObject();

		if(componentid)
			config.id = componentid;

		// create the main panel
		var panel = new Ext.Panel(config);

		panel.render(containerDiv);
	}

	/** @lastrev fix37315 - Display non-intrusive error messages
	 */
	function clearError()
	{
		var gridEl = getGridEl();
		if(gridEl)
		{
			gridEl.unmask();
		}
	}

	function markLoading()
	{
		var gridEl = getGridEl();
		if (gridEl)
		{
			gridEl.mask("Loading...");
		}
	}

	/** @lastrev fix37315 - Sequence Table: Display non-intrusive error messages
	 */
	function showInternalError(msg)
	{
		var gridEl = getGridEl();
		if(gridEl)
		{
			gridEl.mask("Internal Error<br>" + msg);
		}
		else
		{
			Ext.Msg.alert("Internal Error", msg);
		}
	}


	function getUserMessage(data)
	{
		if ( data===undefined || data == null )
			return null;

		var unfinished = data[SCHEMA.TOP_LEVEL_DATA.UNFINISHED_FLOW] !== undefined && data[SCHEMA.TOP_LEVEL_DATA.UNFINISHED_FLOW];
		var missingData = data[SCHEMA.TOP_LEVEL_DATA.MISSING_DATA] !== undefined && data[SCHEMA.TOP_LEVEL_DATA.MISSING_DATA];
		if ( unfinished || missingData )
		{
			var msg = getI18nMessages('shared.technicalview.partialSequence');
			msg += "\n";

			var tooltip = "";

			if ( data[SCHEMA.TOP_LEVEL_DATA.UNFINISHED_FLOW] )
			{
				msg += getI18nMessages('shared.technicalview.unfinishedFlow');
				tooltip = getI18nMessages('shared.technicalview.unfinishedFlowTooltip');
			}

			if ( data[SCHEMA.TOP_LEVEL_DATA.MISSING_DATA] )
			{
				msg += getI18nMessages('shared.technicalview.missingData');
				tooltip = getI18nMessages('shared.technicalview.missingDataTooltip');
			}

			return { msg: msg, tooltip: tooltip };
		}
		else
		{
			return null;
		}
	}

	function showMessage(userMessage)
	{
		var text = userMessage.msg;
		var toolTip = userMessage.tooltip;

		if(!toolTip)
			toolTip = '';

		var messagePanel = Ext.getCmp('auditreport_message');

		var html = "<div class='sequence-messagepanel-icon'></div><div title='" + toolTip + "'>"
				+ com.actional.sequence.sequenceCommonUtil.escapeHtml(text)
				+ "</div>";

		messagePanel.update(html);

		messagePanel.setHeight('auto');
		messagePanel.show();
		messagePanel.ownerCt.doLayout();
	}

	function hideMessage()
	{
		var messagePanel = Ext.getCmp('auditreport_message');

		messagePanel.hide();
		messagePanel.ownerCt.doLayout();
	}

	function setToBeSelectedInteractionId(interactionId)
	{
		itsToBeSelectedInteractionId = interactionId;
	}

	init();

	return(
	{
		setToBeSelectedInteractionId: setToBeSelectedInteractionId,
		renderTo: renderTo,
		getMainPanelConfigObject: getMainPanelConfigObject
	});
};

