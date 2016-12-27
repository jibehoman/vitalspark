

















var tsPageURL = undefined;
var returnPageURL = undefined;

Ext.apply(Ext.form.VTypes,
{
	workspacePathVType: function(value, field)
	{
		if (!value)
		{
			this.workspacePathVTypeText = 'Workspace path must not be empty';
			return false;
		}

		
		if (value)
		{
			if (value.indexOf('/') != 0)
		        {
		        	this.workspacePathVTypeText = 'Workspace path must begin with a "/", e.g. /users/user_name/workspace_name';
				return false;
		        }
			else if (value.length <= 1)
			{
				this.workspacePathVTypeText = 'Workspace path must not be empty';
				return false;
			}
		}

		return true;
	},
	workspacePathVTypeText: 'hello??'
});

Ext.onReady(function()
{
	
	
	Ext.QuickTips.init();

	
	
	Ext.form.Field.prototype.msgTarget = 'side';

	var exportBtnT 		= Ext.get('exportBtnT');
	var exportBtnB 		= Ext.get('exportBtnB');

	if (!exportBtnT && !exportBtnB)
		return;

	if (exportBtnT)
		exportBtnT.on('click', exportOnClick);
	if (exportBtnB)
		exportBtnB.on('click', exportOnClick);
});

function exportOnClick()
{
	gLastClickedEl = this.id;
	gIsExport = "EXPORT";
	exportExchange();
}

function exportExchange()
{
	var cmb_store 		= new Ext.data.SimpleStore({ fields: ['id', 'name'] });
	var ua 			= UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'teamservertransferdefault');
	var uname 		= UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'teamservertransferuser');
	var emptyComboText 	= "Click 'Update Service Spaces for User' to load";
	var isBatch		= gIsExport ? "BATCH" == gIsExport : false;

	var exportWin = new Ext.Window(
	{
        	bodyStyle	: 'padding:5px;',
		title	    	: 'Transfer to Team Server',
		layout      	: 'fit',
		width       	: 483,
		height      	: 320,
		plain       	: true,
		modal		: true,
		id		: 'exportWindow',
		items		:
		[{
			xtype		: 'form',
			baseCls		: 'x-plain',
			id		: 'exportForm',
			defaultType	: 'textfield',
			url		: contextUrl('admin/logging/exportexchange.jsrv'),
			waitMsgTarget	: true,
			items		:
			[{
				xtype		: 'container',
				layout		: 'column',
				autoEl		:{},
				width:470,
				layoutConfig	: { columns: 2},
				items		:
				[{
					xtype		: 'checkbox',
					name		: 'useAdmin',
					id		: 'useAdmin',
					checked		: (ua && ua == "true") ? true : false,
					handler  	: useDefault
				},
				{
					xtype:'label',
					html: '<label class="x-form-item-label x-form-item" style="width: 100%; height:26px;padding-left:3px;" for="useAdmin">Use Team Server Account</label>'
				}]
			},
			{
				xtype: 'fieldset',
				title: 'User Credentials',
				autoHeight:true,
				id:'credentialsFieldSet',
				defaultType: 'textfield',
				buttonAlign: 'center',
				collapsible: false,
				items:[
				{
					xtype		: 'container',
					layout		: 'table',
					autoEl		: {},
					defaultType	: 'textfield',
					layoutConfig	: { columns: 4},
					items		:
					[{
						xtype:'label',
						html: '<label class="x-form-item-label x-form-item" style="width: 130px; height:22px;" for="exportUsername">User Name:</label>'
					},
					{
						name		:'exportUsername',
						id		:'exportUsername',
						allowBlank	: false,
						onBlur		: credentialsChanged,
						tabIndex	:1
					},
					{
						xtype:'label',
						html: '<label class="x-form-item-label x-form-item" style="width: 5px;"></label>'
					},
					{
						xtype	: 'button',
						text    : 'Modify User Information',
						id	:'modifyUserButton',
						disabled: true,
						onClick : modifyUserButtonClick
					},
					{
						xtype:'label',
						html: '<label class="x-form-item-label x-form-item" style="width: 130px; height:22px;" for="exportPassword">Password:</label>'
					},
					{
						name		:'exportPassword',
						id		:'exportPassword',
						inputType	:'password',
						allowBlank	: false,
						tabIndex	: 2,
						colspan		: 3,
						onBlur		: credentialsChanged
					},
					{
						xtype:'label',
						html: '<label class="x-form-item-label x-form-item" style="width: 130px; height:22px;"></label>'
					},
					{
						xtype	:'button',
						text    : 'Update Service Spaces for User',
						id	:'updateServiceSpaceButton',
						tabIndex:3,
						colspan : 3,
						disabled: true,
						handler : function()
						{
							loadServicesCombo();
						}
					}]
				}]
			},
			{
				xtype: 'fieldset',
				title: 'Workspace Information',
				collapsible: false,
				autoHeight:true,
				items:[
				{
					xtype		: 'combo',
					id		: 'svcspc_combo',
					store		: cmb_store,
					displayField	: 'name',
					valueField	: 'id',
					mode		: 'local',
					triggerAction	: 'all',
					width		: 280,
					forceSelection	: true,
					editable	: false,
					fieldLabel	: 'Service Space',
					allowBlank	: false,
					labelStyle	: 'width:130px;',
					disabled	: true,
					emptyText	: emptyComboText,
					emptyClass	: 'x-form-field',
					tabIndex	: 4,
					invalidText 	: 'Select a Service Space from those this user belongs to.'
				},
				{
					xtype		: 'textfield',
					fieldLabel	:'Workspace Path',
					name		:'exportWorkspace',
					id		:'exportWorkspace',
					width		: 260,
					hideParent	: true,
					allowBlank	: false,
					labelStyle	: 'width:130px;',
					tabIndex	: 5,
					vtype		: 'workspacePathVType'
				}]
			}]
		}],
		buttons: [
		{
			text	: 'Close',
			handler	: function()
			{
				exportWin.close();
			}
		},
		{
			text     : 'Transfer to Team Server',
			id	 : 'transferbtn',
			tabIndex : 5,
			handler  : transferExchange
		},
		{
			text     : 'Launch Team Server',
			id	 : 'launchbtn',
			tabIndex : 6,
			disabled : true,
			handler	 : launchTS
		}]
	});

	exportWin.on('beforehide', abortPendingAjax, this);
	exportWin.on('show', function()
	{
		useDefault(null, ua && ua == 'true');
	} , this);

	exportWin.show(Ext.get(gLastClickedEl));
}

function credentialClick()
{
	var credentialSet = Ext.getCmp('credentialsFieldSet');
	var un = Ext.getCmp('exportUsername');
	var pw = Ext.getCmp('exportPassword');

	if (credentialSet.checkbox.dom.checked)
	{
		un.enable();
		pw.enable();
	}
	else
	{
		un.disable();
		pw.disable();
	}
	return false;
}

function transferExchange()
{
	var isBatch = gIsExport ? "BATCH" == gIsExport : false;

	storeParams();

	var form = Ext.getCmp('exportForm').getForm();

	if (!form.isValid())
		return;

	var cmbo = Ext.getCmp('svcspc_combo');

	if (!cmbo)
		return;

	var exGUID = undefined;
	var cntrctGUID = undefined;
        var selected = undefined;
        var recordID = undefined;

        if (!isBatch)
	{
		
		
		
		
		
		
		exGUID = exchangeGUID;
		if ((!exchangeGUID || "null" == exchangeGUID))
		{
			exGUID = undefined;

			if(gExchangeGUID && gExchangeGUID != "null")
				exGUID = gExchangeGUID;
		}

		cntrctGUID = contractGUID;
		if ((!contractGUID || "null" == contractGUID))
		{
			cntrctGUID = undefined;

			if(gContractGUID && gContractGUID != "null")
				cntrctGUID = gContractGUID;
		}

		recordID = recordId;
	}
	else
	{
		enableBatchPageLaunchButton(false);
		selected = gatherSelected();
	}

	if (!cmbo || !cmbo.getValue())
	{
		showMessagePopup("Select Service Space", "Service Space cannot be null");
		return;
	}

	var uname = Ext.getCmp('exportUsername').getValue();
	var upass = Ext.getCmp('exportPassword').getValue();
	var wspth = Ext.getCmp('exportWorkspace').getValue();

	var theBaseReturnUrl;
	try{ theBaseReturnUrl = baseReturnUrl; }
	catch (e)
	{
		theBaseReturnUrl = null;
	}
	
	var params = {  sscode 		: cmbo.getValue(),
			exportUsername	: uname,
			exportPassword	: upass,
			exportWorkspace : wspth,
			recordId	: recordID,
			exportExchange	: !isBatch,
			exchangeGuid	: exGUID,
			contractGuid	: cntrctGUID,
			batchTransfer	: isBatch,
			selectedRecords	: selected,
			baseReturnUrl: theBaseReturnUrl};

	form.submit(
	{
		'params': params,
		timeout : 30000,
		waitMsg:'Transferring Data...',
		success: function(form, action)
		{
			updateLaunchBtns(action.result);

			showMessagePopup("Exchange(s) transfered", "Click 'Launch Team Server' to access.");
		},
		failure: function(form, action)
		{
			var m;
			if (action.result)
				m = action.result.message;
			else if (action.response)
				m = action.response.responseText;
			showMessagePopup("Problem transferring Exchange(s) to Team Server", m);
		}
	});
}

function updateLaunchBtns(result)
{
	var launchbtn = Ext.getCmp('launchbtn');
	if (launchbtn)
	{
		tsPageURL = result.tsPageURL;
		returnPageURL = result.returnPageURL;
		launchbtn.enable();
	}

	if ("BATCH" == gIsExport)
	{
		enableBatchPageLaunchButton(true);
	}
}

function launchTS()
{
	var ua 		= UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'teamservertransferdefault');
	if (ua && ua == 'true')
	{
		
		
		redirectToTS("");
		return;
	}

	var uname 	= UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'teamservertransferuser');
	var pw 		= UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'teamservertransferpw');

	Ext.Ajax.request(
        {
        	url: contextUrl('admin/logging/exportexchange.jsrv'),
                success: getTokenSuccess,
                failure: ajaxFailed,
                params:   { getToken	: true,
                            tokenName	: uname,
                            tokenPw	: pw
                             },
                method: 'GET'
	});
}

function getTokenSuccess (connection, options )
{
	if (!connection.responseText)
		return;

	var result = Ext.util.JSON.decode ( connection.responseText );

	if (!result.success)
	{
		showMessagePopup('Error', result.message);
		return;
	}

	redirectToTS(result.token);
}

function redirectToTS(token)
{
	if (returnPageURL && tsPageURL)
	{
		var rtnURL = returnPageURL + token;
		var pageURL = tsPageURL + token;
		window.location.href = contextUrl('admin/logging/teamserver.jsp?returnURL=' + rtnURL + '&tsURL=' + pageURL);
	}
	else
	{
		
		
		var baseTeamServerJsp = contextUrl("admin/logging/teamserver.jsp");
		window.location.href = baseTeamServerJsp + '?returnURL=auditing.jsp?' + token +
										'&tsURL=' + tsPageBtnURL + token;
	}
}

function gatherSelected()
{
	var source = document.forms[0].auditListModel;
	var selected = new Array();
	var i = 0;
	var len = 0;
	for (; i < source.length; i++)
	{
		if (source[i].checked)
		{
			selected[len] = source[i].defaultValue;
			len ++;
		}
	}

	
	if (i == 0 && source.checked)
		selected[0] = source.defaultValue;

	return selected;
}

function loadServicesCombo ()
{
	var uname = Ext.getCmp('exportUsername');
	if (!uname)
		return;

	var exportWin = Ext.getCmp('exportWindow');
	exportWin.getEl().mask('Loading service spaces...');

	loadUserServiceSpaces(ajaxSvcSpcSuccess, uname.getValue(), Ext.getCmp('exportPassword').getValue());
}

function loadUserServiceSpaces (successfunction, uname, pw)
{
	resetServiceSpaceCombo();

	
	if (!uname)
	{
		return;
	}

	var unameEl 	= Ext.getCmp('exportUsername');
	var upassEl 	= Ext.getCmp('exportPassword');
	var useAdmin 	= Ext.getCmp('useAdmin');

	if (unameEl)
		unameEl.disable();
	if (upassEl)
		upassEl.disable();

	var btn = Ext.getCmp('transferbtn');
	if (btn)
		btn.disable();

	var currentlySelectedService = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'teamservertransfersvcspc');

	Ext.Ajax.request(
        {
        	url: contextUrl('admin/logging/exportexchange.jsrv'),
                success: successfunction,
                failure: ajaxFailed,
                params:   { fetchServices	: true,
                            exportUsername	: uname,
                            exportPassword	: pw,
                            currentSvc		: currentlySelectedService
                             },
                method: 'GET'
	});
}

function useDefault(checkbox, checked)
{
	var win = Ext.getCmp('exportWindow');
	win.getEl().mask("Loading account details...");

	if (checked)
	{
		updateValues(true, "", "", "", "");
		fetchDefaults();
	}
	else
	{
		loadSessionValues(checked, ajaxReloadSvcSpcSuccess);
	}
}

function fetchDefaults()
{
	var btn = Ext.getCmp('transferbtn');

	if (!btn)
		return;

	btn.disable();

	Ext.Ajax.request(
        {
        	url: contextUrl('admin/logging/exportexchange.jsrv'),
                success: ajaxDefaultSuccess,
                failure: ajaxFailed,
                params:   { fetchDefaults : true },
                method: 'GET'
	});
}

function loadSessionValues(checked, ajaxSuccess)
{
	var uname 	= UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'teamservertransferuser');
	var pw 		= UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'teamservertransferpw');
	var ws 		= UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'teamservertransferws');

	if (!uname || uname == '')
	{
		unmaskExportWindow();
		updateValues(false, "", "", "", "");

		return;
	}

	loadUserServiceSpaces(ajaxSuccess, uname, pw);

	
	updateValues(checked, uname, pw, "", ws);
}

function updateValues(disabled, uname, pw, svcspc, ws)
{
	var ew = Ext.getCmp('exportWorkspace');
	if(ew)
	{
		ew.setDisabled(disabled);
		ew.setValue(ws);
	}

	
	
	if (uname)
		disabled = true;

	var un = Ext.getCmp('exportUsername');
	if (un)
	{
		un.setDisabled(disabled);
		un.setValue(uname);
	}
	var ep = Ext.getCmp('exportPassword');
	if (ep)
	{
		ep.setDisabled(disabled);
		ep.setValue(pw);
	}
	var sc = Ext.getCmp('svcspc_combo');
	if (sc)
	{
		if (!uname)
			sc.setDisabled(true);
		else
			sc.setDisabled(disabled);

		sc.setValue(svcspc);
	}
}

function credentialsChanged()
{
	resetServiceSpaceCombo();
	var cmbo = Ext.getCmp('svcspc_combo');

	if (!cmbo)
		return;

	cmbo.setValue( "Click 'Update Service Spaces for User' to load");

	var un = Ext.getCmp('exportUsername');
	var pw = Ext.getCmp('exportPassword');

	var btn = Ext.getCmp('updateServiceSpaceButton');
	if (btn)
	{
		if ((!un || !un.getValue()) || (!pw || !pw.getValue()))
			btn.disable();
		else
			btn.enable();
	}
}

function modifyUserButtonClick()
{
	var un = Ext.getCmp('exportUsername');
	var pw = Ext.getCmp('exportPassword');
	var bt = Ext.getCmp('modifyUserButton');

	if (un)
		un.enable();
	if (pw)
		pw.enable();
	if (bt)
		bt.disable();
}

function resetServiceSpaceCombo()
{
	var cmbo = Ext.getCmp('svcspc_combo');

	if (!cmbo)
		return;

	cmbo.store.removeAll();
	cmbo.setValue('');
	cmbo.disable();
}

function ajaxDefaultSuccess ( connection, options )
{
	if (!connection.responseText)
		return;

	var result = Ext.util.JSON.decode ( connection.responseText );

	if (!result.success || !result.defaultSS)
	{
		resetServiceSpaceCombo();
		showMessagePopup('Error', result.message);
		unmaskExportWindow();
		return;
	}

	updateValues(true, result.defaultUN, "pwholder", result.defaultSS, result.defaultWS);
	updatePopupBtns();

	unmaskExportWindow();
}

function unmaskExportWindow()
{
	var win = Ext.getCmp('exportWindow');
	if (win)
		win.getEl().unmask();
}

function ajaxSvcSpcSuccess (connection, options)
{
	if (!connection.responseText)
		return null;

	var result = Ext.util.JSON.decode ( connection.responseText );
	var cmbo = Ext.getCmp('svcspc_combo');
	cmbo.emptyText = '';

	resetServiceSpaceCombo();

	cmbo.enable();

	if (!result.success || !result.ssarray)
	{
		resetServiceSpaceCombo();
		showMessagePopup("Problem retrieving service spaces", result.message);
		modifyUserButtonClick();
		unmaskExportWindow();
		return null;
	}

	cmbo.store.loadData(result.ssarray);

	updatePopupBtns();

	unmaskExportWindow();

	return result;
}

function ajaxReloadSvcSpcSuccess (connection, options)
{
	var result = ajaxSvcSpcSuccess(connection, options);
	if (!result)
		return;

	var cmbo = Ext.getCmp('svcspc_combo');

	var storeSvcSpc = UserSettings_Read(UserSettings_Scopes.PAGECOOKIE, 'teamservertransfersvcspc');

	var e = result.storedExists ;

	if (e)
		cmbo.setValue(storeSvcSpc);
	else
	{
		if (storeSvcSpc && storeSvcSpc != 'null')
			showMessagePopup('Warning', 'Selected Service Space no longer exists, please select another one');
	}
}

function updatePopupBtns()
{
	var btn = Ext.getCmp('transferbtn');
	if (btn)
		btn.enable();

	var useAdmin = Ext.getCmp('useAdmin');
	var updatebtn 	= Ext.getCmp('updateServiceSpaceButton');
	var usercredsbtn = Ext.getCmp('modifyUserButton');

	if (useAdmin && useAdmin.getValue())
	{
		if (updatebtn)
			updatebtn.disable();

		if (usercredsbtn)
			usercredsbtn.disable();
	}
	else
	{
		if (updatebtn)
			updatebtn.enable();

		if (usercredsbtn)
			usercredsbtn.enable();
	}
}

function showMessagePopup(title, msg)
{
	var cwin = Ext.getCmp('componentWin');
	var lmsg = Ext.getCmp('loadingMsg');

	
	if (cwin && lmsg)
		cwin.hide();

	unmaskExportWindow();

	Ext.MessageBox.alert(title, msg);
}

function storeParams()
{
	var useadmin = Ext.getCmp('useAdmin');

	if (useadmin)
	{
		UserSettings_Write(	UserSettings_Scopes.PAGECOOKIE,
					'teamservertransferdefault',
					useadmin.getValue() ? "true" : "false");

		
		
		
		if (useadmin.getValue())
			return;
	}

	var user = Ext.getCmp('exportUsername');

	if (user)
	{
		UserSettings_Write(	UserSettings_Scopes.PAGECOOKIE,
					'teamservertransferuser',
					user.getValue());
	}

	var pw = Ext.getCmp('exportPassword');

	if (pw)
	{
		UserSettings_Write(	UserSettings_Scopes.PAGECOOKIE,
					'teamservertransferpw',
					pw.getValue());
	}

	var cmbo = Ext.getCmp('svcspc_combo');

	if (cmbo)
	{
		UserSettings_Write(	UserSettings_Scopes.PAGECOOKIE,
					'teamservertransfersvcspc',
					cmbo.getValue());
	}

	var ws = Ext.getCmp('exportWorkspace');

	if (ws)
	{
		UserSettings_Write(	UserSettings_Scopes.PAGECOOKIE,
					'teamservertransferws',
					ws.getValue());
	}
}