

















/**
 * @lastrev fix36813 - no need to overwrite the GroupingStore sorting functionality.
 */
Ext.namespace('com.actional.serverui');


Ext.override(Ext.ToolTip, {
	onTargetOver : function(e){
		if(this.disabled || e.within(this.target.dom, true)){
			return;
		}
		var t = e.getTarget(this.delegate);
		if (t) {
			this.triggerElement = t;
			this.clearTimer('hide');
			this.targetXY = e.getXY();
			this.delayShow();
		}
	},
	onMouseMove : function(e){
		var t = e.getTarget(this.delegate);
		if (t) {
			this.targetXY = e.getXY();
			if (t === this.triggerElement) {
				if(!this.hidden && this.trackMouse){
					this.setPagePosition(this.getTargetXY());
				}
			} else {
				this.hide();
				this.lastActive = new Date(0);
				this.onTargetOver(e);
			}
		} else if (!this.closable && this.isVisible()) {
			this.hide();
		}
	},
	hide: function(){
		this.clearTimer('dismiss');
		this.lastActive = new Date();
		delete this.triggerElement;
		Ext.ToolTip.superclass.hide.call(this);
	}
});


var SearchResults_currentActions = undefined;		

/**
 * @lastrev fix37757 - position the window to top in case of rendering in pct 2.0
 */
com.actional.serverui.SearchResults = Ext.extend(Ext.Window,
{
	isModeless: false,

	constructor: function(config)
	{
		this.isModeless = !!config.layoutId;

		
		var tb = new Ext.Toolbar({
			style: 'background:transparent;border:none;padding-top:12px',
			cls: 'all-search-toolbar',
			buttonAlign: 'center',
			height: 50,
			items: [
			{
				xtype: 'textfield',
				id: 'all-search-field',
				emptyText: 'Type here to search',
				value: config.searchText,
				enableKeyEvents: true,
				width: 250,
				height: 24,
				style: 'font:normal 14px tahoma, arial, helvetica, sans-serif;margin:0 0 0 0',
				selectOnFocus: true,
				listeners:
				{
					'keypress' : this.onKeyPress,
					scope: this
				}
			},
			" ",
			{
				xtype: 'button',
				id: 'all-search-btn',
				text: 'Search',
				iconCls: 'search-button-cls',
				style: 'font:normal 14px tahoma, arial, helvetica, sans-serif',
				cls: 'x-btn-text-icon',
				listeners:
				{
					'click': this.onSearchClick,
					scope: this
				}
			}]
		});

    		
		var result_ds = new Ext.data.GroupingStore({
				id: 'resultsStore',
				reader: json_reader,	
				groupField: 'category',
				sortInfo: {field: 'name', direction: "ASC"},
				autoDestroy: true,					
				proxy: new Ext.data.ScriptTagProxy({
					url: contextUrl('portal/network_search.jsrv'),
					nocache: false					
				}),
				autoLoad: (config.searchText == '') ? false : {
					params: {
						output: 'fulllist',
						query: config.searchText,
						pageid: config.pageId,
						contexttype: config.contextType,
						layoutid: config.layoutId,
						showfilter: false	
					}
				}
		});

		var results = new Ext.grid.GridPanel({
			id: 'all-results-panel',
			store: result_ds,
			sm: new Ext.grid.RowSelectionModel({
				singleSelect:true,
				listeners: {
					'selectionchange': function(sm){
						if(sm.getCount() >= 1)
							
							
							this.getAvailableActions(sm.getSelected(), this.isModeless);
					},
					scope: this
				}
			}),
			region: 'center',
		        title: 'All Search Results',
		        border: false,
		        enableColumnHide: false,
		        enableColumnMove: false,
		        loadMask: true,
			view: new Ext.grid.GroupingView({
				forceFit: true,
				showGroupName: false,
				hideGroupedColumn: true,
				scrollOffset: 0,
				emptyText: '<br><center>No results found.</center>',
				groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "items" : "item"]})'
			}),

			columns: [
				{
					id:'name',
					header: "Name",
					width: 35,
					sortable: true,
					dataIndex: 'name',
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						return getIconHtml(record) + value;
					}
				},
				{
					header: "Category",
					width: 22,
					sortable: true,
					dataIndex: 'category',
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						if(value.indexOf('infra') > 0)
							return 'Infrastructure';
						if(value.indexOf('business') > 0)
							return 'Business';
						if(value.indexOf('network') > 0)
							return 'Network';
					}
				},
				{header: "Type", width: 22, sortable: true, dataIndex: 'type'},
				{header: "Scope", width: 22, sortable: true, dataIndex: 'scope'},
				{header: "Node", width: 22, sortable: true, dataIndex: 'node'},
				{
					header: "Instances/Members",
					width: 10,
					sortable: true,
					dataIndex: 'nbrinst',
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						if(value == '0')
							return '';
						else
							return value;
					}
				}
			],

			tbar: [{
				id: 'detailsBtn',
				text: 'Open Details page',
				disabled: true,
				handler: function(){
				        var record = results.getSelectionModel().getSelected();
				        performSearchResultAction(this.getAction('DETAILS').value, record.id, this.pageId);
				},
				scope: this
			},'-',{
				id: 'locateBtn',
				text: 'Locate In Map',
				disabled: true,
				handler: function(){
				        var record = results.getSelectionModel().getSelected();
					performSearchResultAction(this.getAction('LOCATE').value, record.id, this.pageId);
				},
				scope: this
			},'-',{
				id: 'statsBtn',
				text: 'Show Statistics',
				disabled: true,
				handler: function(){
				        var record = results.getSelectionModel().getSelected();
					performSearchResultAction(this.getAction('SHOWSTATS').value, record.id, this.pageId);
				},
				scope: this
			}],
		        listeners:
			{
					'rowdblclick': this.onRowDblClick,
				'render': function() {
					results.tip = new Ext.ToolTip({
						view: results.getView(),
						target: results.getView().mainBody,
						delegate: '.x-grid3-row',
						trackMouse: true,
						renderTo: document.body,
						listeners: {
							beforeshow: function updateTipBody(tip) {
								var rec = result_ds.getAt(tip.view.findRowIndex(tip.triggerElement));
								var val = "";
								var tipStr = getIconHtml(rec) + '<b>'+ rec.get('name') + '</b>';
								if(val = rec.get('scope'))
									tipStr += '<br />in ' + val;
								if(val = rec.get('node'))
									tipStr += '<br />on ' + val;

								tip.body.dom.innerHTML = tipStr;
							}
						}
					});
				},
				scope: this
			}
			});

		
		var height = 600;
		if (isInPct20())
		{
			height = 450;
		}

		com.actional.serverui.SearchResults.superclass.constructor.call(this, Ext.applyIf(config,
		{
			id: 'all-search-results',
			title: 'Actional Management Server - Search',
			modal: !this.isModeless,
			y: isInPct20() ? 100 : undefined,
			closable: true,


			width: 700,
			height: height,
			
			border: false,
			layout: 'border',
			
			
			
			style: (this.isModeless && !Ext.isIE) ? "opacity:0.90;filter:alpha(opacity=90);" : "",

			items: [
			{
				xtype: 'panel',
				region: 'north',
				layout: 'fit',
				bodyStyle: 'background:transparent',
				border: false,
				buttonAlign: 'center',
				bbar: tb
			}, results ]
		}));

		
		this.show();

		
		var field = Ext.getCmp("all-search-field");
		if(field.getValue() == '')
			field.focus(false, 750);
	},

	onSearchClick : function(btn, event)
	{
		this.doSearch();
	},

        onKeyPress : function(combo, key)
        {
	       	if(key.keyCode == key.ENTER)
			this.doSearch();
        },

	onRowDblClick : function(grid, rowIndex, e)
	{
		var rowRecord = grid.getStore().getAt(rowIndex);

		performSearchResultAction(rowRecord.get('defaultaction'), rowRecord.id, this.pageId);
	},

	doSearch : function()
	{
		var searchText = Ext.getCmp("all-search-field").getValue();

		if(searchText != '')
		{
			var grid = Ext.getCmp('all-results-panel');
			grid.getStore().load({
					params: {
						output: 'fulllist',
						query: searchText,
						pageid: this.pageId,
						showfilter: false,	
						contexttype: jsContextType,
						layoutid: jsLayoutId
					}});
		}
	},

	getAvailableActions : function(record, onPageWithMap)
	{
		
		var servletUrl = contextUrl('portal/network_search.jsrv?requestactions=' + record.id);
		servletUrl += "&onpagewithmap=" + onPageWithMap;

		XMLHttp_GetAsyncRequest(servletUrl, function(responseText, userData, status, statusText)
		{
			var actionsObj = eval(responseText);

			SearchResults_currentActions = toActionsArray(actionsObj);

			var grid = Ext.getCmp('all-results-panel');
		 	grid.getTopToolbar().items.get('detailsBtn').setDisabled(!hasAction('DETAILS'));
			grid.getTopToolbar().items.get('locateBtn').setDisabled(!hasAction('LOCATE'));
			grid.getTopToolbar().items.get('statsBtn').setDisabled(!hasAction('SHOWSTATS'));
		}, null, null, "", false);
	},

	getAction : function(actionId)
	{
		if(!SearchResults_currentActions)
			return null;

		for(var i=0; i < SearchResults_currentActions.length; i++)
			if(actionId == SearchResults_currentActions[i].id)
				return SearchResults_currentActions[i];

		return null;
	}

});

Ext.reg('com.actional.serverui.SearchResults', com.actional.serverui.SearchResults);

function toActionsArray(actionsObj)
{
	var actionArray = new Array();
	var i = 0;

	while(actionsObj[i] != null)
	{
		var actionString = actionsObj[i];
		var actionInfo = actionString.split(",", 4);
		var action = new Object();

		action.id = actionInfo[0];
		action.type = actionInfo[1];
		action.value = actionInfo[2];
		action.text = actionInfo[3];

		actionArray.push(action);

		i++;
	}

	return actionArray;
}

function hasAction(actionId)
{
	if(!SearchResults_currentActions)
		return false;

	for(var i=0; i < SearchResults_currentActions.length; i++)
		if(actionId == SearchResults_currentActions[i].id)
			return true;

	return false;
}

function getIconHtml(record)
{
	var url;
	if(url = record.get('iconurl'))
		return '<img width=16 heigth=16 src=\'' + url + '\' style=\'vertical-align:top;margin-right:6px;\'>';
	else
		return "";
}
