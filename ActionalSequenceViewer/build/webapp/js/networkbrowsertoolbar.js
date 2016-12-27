

















Ext.namespace('com.actional.serverui.network');



var LayoutOptions =
{
	layoutId: undefined, 		
	logicalTypePrefix: undefined,	
	groupingSchemeId: undefined,	
	showOneHop: false		
};

var noLogicalTypesInDataset = true;

function enableToolbarCtrl(el, enable)
{
	if (el)
	{
		if (enable)
			el.enable();
		else
			el.disable();
	}
}


/**
 * @class com.actional.serverui.network.NetworkBrowser
 * @extends Ext.Panel
 * @lastrev fix37574 - PCT-AMS roles integration: new hideconfigurehyperlinks option
 */
com.actional.serverui.network.NetworkBrowserToolbar = Ext.extend(Ext.Toolbar,
{
    /**
     * @cfg {Boolean} hideconfigurehyperlinks (Optional) defaults to false
     *
     * Set to true to hide all hyperlinks that jump to pages that configures
     * the product
     */

    /**
     * @cfg {Boolean} noexternalhyperlinks (Optional) defaults to false
     *
     * Set to true to hide all hyperlinks that jump to other pages in the
     * product.
     */

	itsCtrlLogicalType : undefined,
	itsCtrlGroupingScheme : undefined,
	itsCtrlShowOneHop : undefined,

	itsEventSourceName: 'networkbrowsertoolbar',
	/**
	 * Whether the network browser really has a map
	 */
	itHasMap : true,

	constructor: function(config)
	{
		
		var logical_types = new Ext.data.SimpleStore({
						fields: ['prefix','name'],
						data : []
						});

		com.actional.DataStore.logicalTypes.onDataSetChanged(function()
		{
			var data = com.actional.DataStore.logicalTypes.getLogicalTypesList();
			var storearray = [];

			for(var i=0;i<data.length; i++)
			{
				var item = data[i];
				storearray[i] = [item.prefix, item.name];
			}

			logical_types.loadData(storearray);

			if(logical_types.getCount() > 0)
				noLogicalTypesInDataset = false;
		}, this);

		
		var disablegrouping = config.disabletimeseries || config.disablegrouping;

		var grouping_schemes_store = new Ext.data.SimpleStore({
						fields: ['id','name'],
						data : []
						});

		com.actional.DataStore.groupingSchemes.onDataSetChanged(function()
		{
			var data = com.actional.DataStore.groupingSchemes.getGroupingSchemesList();
			var storearray = [];

			for(var i=0;i<data.length; i++)
			{
				var item = data[i];
				storearray[i] = [item.id, item.name];
			}

			if(!config.hideconfigurehyperlinks)
			{
				
				storearray[i] = ['config', 'Configure/Add New...'];
			}

			grouping_schemes_store.loadData(storearray);
		}, this);

		this.itsCtrlLogicalType = new Ext.form.ComboBox({
					    	id: 'logicaltype-filter',
						xtype: 'combo',
						store: logical_types,
						fieldLabel: 'Show ',
						displayField: 'name',
						valueField: 'prefix',
						mode: 'local',
						triggerAction: 'all',
						width: 120,
						forceSelection: true,
						editable: false,
						disabled: noLogicalTypesInDataset,
						listeners:
						{
							'select' : this.onLogicalTypeSelect,
							scope: this
						}
					});

		this.itsCtrlGroupingScheme = new Ext.form.ComboBox({
						xtype: 'combo',
						id: 'grouping-scheme',
						store: grouping_schemes_store,
						displayField: 'name',
						valueField: 'id',
						mode: 'local',
						triggerAction: 'all',
						width: 150,
						forceSelection: true,
						editable: false,
						disabled : disablegrouping,
						value: LayoutOptions.groupingSchemeId,
						listeners:
						{
							'select' : this.onSelectGroupingScheme,
							scope: this
						}
				        });

		this.itsCtrlShowOneHop = new Ext.Button({
				        	id: 'show-one-hop',
				            	xtype: 'tbbutton',
					            text: this.getToolbarLabel('includeBoundaryCalls'),
				            	enableToggle: true,
				            	allowDepress: true,
				            	toggleHandler: this.onShowOneHopToggle,
				            	scope: this,
				            	tooltip: 'Toggle ON to display calls that are one hop away',
				            	tooltipType: 'title'
				     	});

		com.actional.serverui.network.NetworkBrowserToolbar.superclass.constructor.call(this, Ext.applyIf(config,
		{
			id: 'netbar',
			items: function()
			{
				var items =
				[
					'&nbsp;' + this.getToolbarLabel('showTrafficBetween') + '&nbsp;',
					this.itsCtrlLogicalType
				];

				if (!config.noexternalhyperlinks)
				{
					items = items.concat([
						'&nbsp;',
					        '-',
						'&nbsp;' + this.getToolbarLabel('grouping') +  '&nbsp;',
						this.itsCtrlGroupingScheme
					]);
				}

				items = items.concat([
						'&nbsp;',
					        '-',
					        this.itsCtrlShowOneHop,
					        '-',
					        {xtype: 'tbfill'},
					        '-'
				        ]);

			        if (config.showloglinks)
			        {
					items = items.concat(
						[{
							id: 'audit-logs-btn',
							xtype: 'tbbutton',
							text: this.getToolbarLabel('auditLogs'),
							scope: this,
							disabled: true,
							tooltip: 'View related Audit Log records',
							tooltipType: 'title',
							handler: function()
							{
								var url = contextUrl('admin/logging/auditreportcfg.jsp');
								url += "?flow="+displayed_alert_id+"&button=Show+Report";

								
								url += '&self_addrcolumn=on&l3_namecolumn=on';
								url += '&req_msg_sizecolumn=on&flowcolumn=on';

								window.location.href = url;
							}
						},
						' ', 
						'-', 
						' ', 
					        {	id: 'application-logs-btn',
					            	text: this.getToolbarLabel('applicationLogs'),
					            	scope: this,
					            	disabled: true,
					            	tooltip: 'View related Application Log records',
					            	tooltipType: 'title',
							handler: function()
							{
								var url = contextUrl('admin/services/grouping/grouping_list.jsp');
								url += "?flow="+displayed_alert_id+"&button=Show+Report";

								
								url += '&flowcolumn=on&self_addrcolumn=on&messagecolumn=on';
								url += '&log_datetimecolumn=on&logger_namecolumn=on';

								window.location.href = url;
							}
					        },
						' ', 
						'-', 
						' '  
					]);
			        }

				
				items = items.concat({
				    	xtype: 'tbbutton',
					id: 'options-btn',
				    	text: this.getToolbarLabel('options'),
				    	tooltip: 'Options',
				    	tooltipType: 'title',
				    	noexternalhyperlinks: config.noexternalhyperlinks,
				    	disabletimeseries: config.disabletimeseries,
				    	handler: function(btn)
				    	{
						var manager = com.actional.serverui.OptionsManager.getManager();
						if(manager)
							manager.showOptionsDialog();
				    	},
				    	scope: this
				});

				return items;
			}.call(this)
		}));

		this.initLayoutSynchro();
	},

	initLayoutSynchro : function()
	{
		OpenAjax.hub.subscribe('com.actional.serverui.NetworkLayoutChanged',
					this.onNetworkLayoutChanged,
					this,
					{source : this.itsEventSourceName});

		





	},

	onNetworkLayoutChanged : function(event, publisherData, subscriberData)
	{
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			
			return;

		if(LayoutOptions.layoutId != publisherData.layoutid)
		{
			var servletUrl = contextUrl('portal/network_layout.jsrv?type=layoutopts');
			servletUrl += this.getExtraLayoutOptionsParam();

			
			XMLHttp_GetAsyncRequest(servletUrl, function(responseText, userData, status, statusText)
					{
						var layoutSettingsObj = eval(responseText);

						
						LayoutOptions.layoutId = jsLayoutId = layoutSettingsObj.layoutId;
						LayoutOptions.logicalTypePrefix = jsContextType = layoutSettingsObj.logicalTypePrefix;
						LayoutOptions.groupingSchemeId = layoutSettingsObj.groupingSchemeId;
						LayoutOptions.showOneHop = !!layoutSettingsObj.showOneHop;

						
						var ctrlLogicalType = Ext.getCmp('logicaltype-filter');
						var ctrlGroupingScheme = Ext.getCmp('grouping-scheme');
						var ctrlShowOneHop = Ext.getCmp('show-one-hop');

						if(ctrlLogicalType && !ctrlLogicalType.disabled && !noLogicalTypesInDataset)
							ctrlLogicalType.setValue(layoutSettingsObj.logicalTypePrefix);

						if(!ctrlGroupingScheme.disabled)
							ctrlGroupingScheme.setValue(layoutSettingsObj.groupingSchemeId);

						enableToolbarCtrl(ctrlShowOneHop, layoutSettingsObj.logicalTypePrefix != '^NODE^');
						ctrlShowOneHop.toggle(!!layoutSettingsObj.showOneHop, true);
					}, null, null, '');
		}
	},

	/**
	 * @lastrev fix36203 - When there is no map (eg: in alert analyzer page )  enable is always treated as false
	 */
	enableToolbarCtrls : function(enable)
	{
		if (!this.itHasMap)
		{
			enable = false;
		}

		enableToolbarCtrl(this.itsCtrlLogicalType, enable);
		enableToolbarCtrl(this.itsCtrlGroupingScheme, enable);
		enableToolbarCtrl(this.itsCtrlShowOneHop, this.isMapShowingNodes() ? false : enable);
	},

	/**
	 * @lastrev fix35778 - clearing site selection
	 */
	onShowOneHopToggle : function(item, pressed)
	{
		LayoutOptions.showOneHop = pressed;
		this.saveNewLayoutOptions();
	},

	testParent : function(a, b)
	{
		return true;
	},

	onLogicalTypeSelect : function(combo, record, index)
	{
		if(record.get('prefix') == LayoutOptions.logicalTypePrefix)
			return;

		
		LayoutOptions.logicalTypePrefix = record.get('prefix');

		
		if(this.isMapShowingNodes())
		{
			LayoutOptions.showOneHop = false;
			Ext.getCmp('show-one-hop').toggle(LayoutOptions.showOneHop, true);
		}

		this.enableToolbarCtrls(true);

		
		this.saveNewLayoutOptions();
	},

	onSelectGroupingScheme : function(combo, record, index)
	{
		if(record.get('id') == LayoutOptions.groupingSchemeId)
			return;

		if(record.get('id') == 'config')
		{
			var url = contextUrl('admin/services/grouping/grouping_list.jsp');
			window.location.href = url;
		}
		else
		{
			
			LayoutOptions.groupingSchemeId = record.get('id');
			this.saveNewLayoutOptions();
		}
	},

	initAlertOccurenceSelection : function()
	{
		OpenAjax.hub.subscribe('com.actional.serverui.statDomainChanged',
					this.onStatDomainChanged,
					this,
					{source : this.itsEventSourceName});

		
		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: this.itsEventSourceName,
			events	: ['com.actional.serverui.statDomainChanged']
		});
	},

	/**
	 * @lastrev fix36203 - if no map, disable controls.
	 */
	onStatDomainChanged : function(event, publisherData, subscriberData)
	{
		
		if(publisherData.source.valueOf() == this.itsEventSourceName)
			return;

		if(this.domainidEventValue != publisherData.statdomainid)
			this.domainidEventValue = publisherData.statdomainid;

		this.itHasMap = publisherData.hasmap;

		this.enableToolbarCtrls(this.itHasMap);

	},

	/**
	 * @lastrev fix36582 - inhibit saving if not in the good state
	 */
	saveNewLayoutOptions: function()
	{
		if(this.domainid == 'EVENT' && !this.domainidEventValue || !this.itHasMap)
		{
			
			
			
			return;
		}

		var servletUrl = contextUrl('portal/operations/overview/networkimage.xml?type=layoutopts' +
					    '&typefilter=' + LayoutOptions.logicalTypePrefix +
					    '&onehop=' + LayoutOptions.showOneHop +
					    '&setscheme=' + LayoutOptions.groupingSchemeId);

		servletUrl += this.getExtraLayoutOptionsParam();

		
		XMLHttp_GetAsyncRequest(servletUrl, function(responseText, userData, status, statusText)
		{
			var layoutObj = eval(responseText);

			
			LayoutOptions.layoutId = jsLayoutId = layoutObj.layoutid;
			jsContextType = LayoutOptions.logicalTypePrefix;

			
			OpenAjax.hub.publish('com.actional.serverui.networkLayoutOptionsChanged',
			{
				source: this.itsEventSourceName
			});
		}, null, null, "", false);

		
		OpenAjax.hub.publish('com.actional.serverui.siteSelectionChanged',
				     {type:'nothing', source: this.itsEventSourceName});
	},

	getExtraLayoutOptionsParam : function()
	{
		var domainid = this.getDomainIdValue();
		var extraParam = '';

		if (domainid)
			extraParam = "&domain=" + domainid;

		return extraParam;
	},

	getDomainIdValue : function()
	{
		if(this.domainid == 'EVENT')
			return this.domainidEventValue;

		return this.domainid;
	},

	isMapShowingNodes : function()
	{
		return (LayoutOptions.logicalTypePrefix == '^NODE^');
	},

	getToolbarLabel: function(key)
	{
		return com.actional.serverui.technicalview.getMessage('overviewMap.toolbar.label.' + key);
	}
});