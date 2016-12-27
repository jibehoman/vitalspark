

















Ext.namespace('com.actional.serverui.sitecriteria');

/**
 *
 * @class com.actional.serverui.sitecriteria.SiteCriteria
 * @extends Ext.Panel
 *
 * @lastrev fix39057 - support custom formfieldname and new hideallsitesoption
 */
com.actional.serverui.sitecriteria.SiteCriteria = Ext.extend(Ext.Panel,
{
	/**
	 * @cfg {Boolean} hideAllSitesOption
	 * 
	 */
	
	/**
	 * @cfg {String} networkTreePanelHtml
	 *
	 */

	/**
	 * @cfg {Object} networkTreeObj
	 *
	 * The networkTree object (treeobj)
	 */

	/**
	 * @cfg {String} formFieldName
	 *
	 * The hidden textarea field id and name used to transfer the data to the control 
	 */
	
	itsDataStore: null,
	itsData : null,
	specificSiteMatchExpression: null,

	validate: function()
	{
		if(this.customRulesRadio.getValue())
		{
			var validRuleCount = 0;
			var matchExpressionObj = {};
			var hasConsumerSide = false;

			for(var i = 0; i < this.itsDataStore.getCount(); i++)
			{
				var record = this.itsDataStore.getAt(i);

				var id = record.data.name;
				var val = trim(record.data.value);

				if(id.length == 0 && val.length == 0)
					continue;

				if(id.length == 0)
				{
					
					alert("Missing criteria name for '" + val + "'");
					return false;
				}

				var label = com.actional.DataStore.sitecriteria.getSiteCriteriaFieldName(id);

				if(val.length == 0)
				{
					
					alert("Missing criteria value for '" + label + "'");

					return false;
				}

				if (matchExpressionObj[id])
				{
					
					alert("Duplicate criteria for '" + label + "'");

					return false;
				}

				if (id == com.actional.DataStore.sitecriteria.consumerSideFieldID)
					hasConsumerSide = true;

				matchExpressionObj[id] = val;

				++validRuleCount;
			}

			if (validRuleCount == 0)
			{
				alert("No custom criteria specified.");
				return false;
			}

			
			if (validRuleCount == 1 && hasConsumerSide)
			{
				alert("It is not valid to only specify a consumer-side criteria.");
				return false;
			}

		}
		if (this.specificSiteRadio.getValue())
		{
			if (!this.specificSiteTriggerField.getValue())
			{
				alert("No specific site selected.");
				return false;
			}
		}

		return true;
	},

	onAfterGridEdit: function()
	{
		var addEmptyLine = false;

		if(this.itsDataStore.getCount() == 0)
		{
			addEmptyLine = true;
		}
		else
		{
			var lastRecord = this.itsDataStore.getAt(this.itsDataStore.getCount()-1);

			if(!isEmptyString(lastRecord.data.name) || !isEmptyString(lastRecord.data.value))
				addEmptyLine = true;
		}

		if(addEmptyLine)
		{
			var record = new Ext.data.Record();
			record.data = {name:'', value:''};
			this.itsDataStore.insert(this.itsDataStore.getCount(), record);
		}

		
		this.updateMatchExpressionString();
	},

	forceSpecificSiteRadio: function()
	{
		this.specificSiteRadio.setValue(true);
		this.updateBasedOnRadio();
	},

	updateBasedOnRadio: function()
	{
		this.specificSiteTriggerField.setDisabled(!this.specificSiteRadio.getValue());
		this.rulesGrid.setDisabled(!this.customRulesRadio.getValue());

		this.updateMatchExpressionString();
	},

	updateSpecificSiteMatchExpression: function(matchExpressionObj)
	{
		this.specificSiteMatchExpression = matchExpressionObj;

		if (this.specificSiteMatchExpression.siteid == KEYID_FOR_NONE &&
			this.specificSiteMatchExpression.originalsitecritiera != null	)
		{
			this.specificSiteTriggerField.setValue("");
			return;
		}

		Ext.Ajax.request(
	        {
	        	url: contextUrl('admin/sitecriteria.jsrv'),
	                params: matchExpressionObj,
	                method: 'GET',
	                scope: this,
	                callback: function(options, success, response)
	                {
	                	var displayPath = "";
	                	var iconUrl;

	        		if (success)
	        		{
		        		try
		        		{
			        		var data = Ext.util.JSON.decode(response.responseText);

			                	displayPath = data.displayPath;
			                	iconUrl = data.iconUrl;
		        		}
		        		catch(e)
		        		{
		        			
		        		}
	        		}

				this.specificSiteTriggerField.setValue(displayPath);

				
/*				if(iconUrl)
				{
					this.specificSiteIconPanel.setWidth(20);
					this.specificSiteTriggerField.setWidth(580);
					this.specificSiteIcon.el.dom.src = iconUrl;
					this.doLayout();
				}
				else
				{
					this.specificSiteIconPanel.setWidth(0);
					this.specificSiteTriggerField.setWidth(600);
					this.specificSiteIcon.el.dom.src = Ext.BLANK_IMAGE_URL;
					this.doLayout();
				}
*/	                }
		});
	},

	updateMatchExpressionString: function()
	{
		var matchExpressionObj;

		if(this.allSiteRadio.getValue())
		{
			matchExpressionObj = {siteid: '*'};
		}
		else if(this.specificSiteRadio.getValue())
		{
			matchExpressionObj = this.specificSiteMatchExpression;
		}
		else 
		{
			matchExpressionObj = {};

			for(var i = 0; i<this.itsDataStore.getCount(); i++)
			{
				var record = this.itsDataStore.getAt(i);

				var id = record.data.name;
				var val = trim(record.data.value);

				if(id.length == 0 && val.length == 0)
					continue;

				if(id.length == 0 || val.length == 0)
				{
					
					continue;
				}

				matchExpressionObj[id] = val;
			}
		}

		var matchExpressionStr = this.generateMatchExpressionString(matchExpressionObj);

		

		Ext.get(this.formFieldName).dom.value = matchExpressionStr;
	},

	generateMatchExpressionString: function(obj)
	{
		var str = "";

		if(!obj)
			return str;

		for(name in obj)
		{
			if(str.length > 0)
				str += '&';

			str += escape(name);
			str += '=';
			str += escape(obj[name]);
		}

		return str;
	},

	parseMatchExpressionString: function(str)
	{
		var obj = {};
		var empty = true;

		var predicates = str.split('&');

		for(var i=0; i<predicates.length; i++)
		{
			var predicate = predicates[i];

			var equalpos = predicate.indexOf('=');

			var name;
			var val;

			if(equalpos < 0)
			{
				name = unescape(predicate);
				val = null;
			}
			else
			{
				name = unescape(predicate.substring(0,equalpos));
				val = unescape(predicate.substring(equalpos+1));
			}

			obj[name] = val;
			empty = false;
		}

		if(empty)
			obj.siteid="*"; 

		return obj;
	},

	updateGrid: function(matchExpressionObj)
	{
		var fieldList = com.actional.DataStore.sitecriteria.getSiteCriteriaFieldList();

		var gridData = [];

		for(var i=0; i<fieldList.length; i++)
		{
			var field = fieldList[i];

			var val = matchExpressionObj[field.id];

			if(val === undefined)
				continue;

			gridData.push({name:field.id, value:val});
		}

		
		gridData.push({name:'', value:''});

		this.itsDataStore.loadData({rows:gridData, total:gridData.length});
	},

	initializeAfterRender: function()
	{
		
		

		var matchExpressionStr = Ext.get(this.formFieldName).dom.value;

		var matchExpressionObj = this.parseMatchExpressionString(matchExpressionStr);

		if(matchExpressionObj.siteid == "*")
		{
			
			this.allSiteRadio.setValue(true);
			this.specificSiteRadio.setValue(false);
			this.customRulesRadio.setValue(false);
		}
		else if(matchExpressionObj.siteid)
		{
			
			this.allSiteRadio.setValue(false);
			this.specificSiteRadio.setValue(true);
			this.customRulesRadio.setValue(false);

			this.updateSpecificSiteMatchExpression(matchExpressionObj);
		}
		else
		{
			
			this.allSiteRadio.setValue(false);
			this.specificSiteRadio.setValue(false);
			this.customRulesRadio.setValue(true);

			this.updateGrid(matchExpressionObj);
		}

		this.updateBasedOnRadio();
	},

	constructor: function(config)
	{
		
		this.itsDataStore = new Ext.data.JsonStore(
		{
			idProperty: 'name',
			root: 'rows',
			fields :
			[{
				name : 'name'
			},
			{
				name : 'value'
			}]
		});

		
		this.itsDataStore.loadData({rows:[ {name:'', value:''}], total:1});

		this.specificSiteMatchExpression = {siteid:KEYID_FOR_NONE};

		var fieldList = com.actional.DataStore.sitecriteria.getSiteCriteriaFieldList();

		var nameComboStore = new Ext.data.JsonStore(
		{
			idProperty: 'id',
			root: 'rows',
			fields :
				[{
					name : 'id'
				},
				{
					name : 'name'
				}],

			data : {rows:fieldList, total:fieldList.length}
		});

		var nameComboBox = new Ext.form.ComboBox(
		{
			store: nameComboStore,
			displayField: 'name',
			valueField: 'id',
			mode: 'local',
			triggerAction: 'all',
			editable: false,
			typeAhead: true,
			forceSelection: true
		});

		var yesNoComboBox = new Ext.form.ComboBox(
		{
			store: new Ext.data.JsonStore(
			{
				idProperty: 'id',
				root: 'rows',
				fields :
				[{
					name : 'id'
				},
				{
					name : 'name'
				}],
				data :
				{
					rows:[ {name:'Yes', id:'true'},
				               {name:'No', id:'false'}],
					total:2
				}
			}),
			displayField: 'name',
			valueField: 'id',
			mode: 'local',
			triggerAction: 'all',
			editable: false,
			forceSelection: true
		});

		function computeFieldEditorType(fieldid)
		{
			var field = com.actional.DataStore.sitecriteria.getSiteCriteriaField(fieldid);

			var editor;

			if(field.usage == 'generic')
				editor = field.datatype;
			else
				editor = field.usage;

			return editor;
		}

		function gridValueColumnRenderer(val, cell, record, row, col, store)
		{
			if (record != undefined)
			{
/*				
				if (val == '')
				{
					
					cell.css += ' x-form-invalid';
					cell.attr = 'ext:qtip="Please enter a value"; ext:qclass="x-form-invalid-tip"';
				}
				else
				{
					
					cell.css = '';
					cell.attr = 'ext:qtip=""';
				}
*/			}

			
			return val;
		}

		
		var mainComponent = this;

		com.actional.serverui.sitecriteria.SiteCriteria.superclass.constructor.call(this, Ext.applyIf(config,
		{
			layout: 'form',
			border: false,
			hideLabels: true,
			items: [
			{
				xtype:'radio',
				hidden: config.hideAllSitesOption,
				ref: 'allSiteRadio',
				boxLabel: 'All Sites',
				name: 'act-sitecriteria-type',
				inputValue: "*",
				handler: this.updateBasedOnRadio,
				scope: this
			},
			{
				xtype:'radio',
				ref: 'specificSiteRadio',
				boxLabel: 'Specific Site :',
				name: 'act-sitecriteria-type',
				inputValue: "site",
				handler: this.updateBasedOnRadio,
				scope: this
			},
			{
				xtype: 'panel',
				layout: 'hbox',
				align: 'stretchmax', 
				border: false,
				bodyStyle : { "padding-left": 40 },
				items:
				[{
					xtype: 'panel',
					width: 0,
					height: 22,
					ref: '../specificSiteIconPanel',
					border: false,
					items:
					[{
						xtype: 'box',
						ref: '../../specificSiteIcon',
						autoEl: { tag: 'img', src: Ext.BLANK_IMAGE_URL }
					}]
				},
				{
					xtype: 'trigger',
					width: 600,
					triggerClass : 'x-form-search-trigger',
					ref: '../specificSiteTriggerField',
					editable: false,
					value: '',
					emptyText: '<Select site>',
					listeners:
					{
						afterrender: function()
						{
						        
							
						        this.getEl().on("click", this.onTriggerClick, this);
						},
						specialkey: function(field, e)
						{
							
							
							if (e.getKey() == e.ENTER || e.getKey() == e.DOWN)
							{
							    this.onTriggerClick();
							}
						}
					},
					onTriggerClick : function()
					{
					      if(this.disabled)
					      {
					    	  
					    	  mainComponent.forceSpecificSiteRadio();
					      }

					      if(!mainComponent.locationSiteCriteriaDialog)
					      {
					    	  mainComponent.locationSiteCriteriaDialog =
					    		new com.actional.serverui.sitecriteria.LocationSiteCriteriaDialog(
					    		{
					    			networkTreePanelHtml: mainComponent.networkTreePanelHtml,
					    			siteCtx: mainComponent.siteCtx,
					    			selectionData:
					    			{
					    				anyNodeEnabled: (mainComponent.specificSiteMatchExpression.anynode == 'yes')
					    			},
					    			networkTreeObj: mainComponent.networkTreeObj,
					    			listeners:
					    			{
					    				save: function(dlg, selectionData)
					    				{
					    					

					    					
					    					
					    					mainComponent.specificSiteTriggerField.setValue(selectionData.displayPath);

					    					
					    					var matchExpressionObj = {};

					    					matchExpressionObj.siteid = selectionData.selectedSiteId;
					    					if(selectionData.anyNodeEnabled)
					    						matchExpressionObj.anynode = "yes";

					    					mainComponent.updateSpecificSiteMatchExpression(matchExpressionObj);

					    					
					    					mainComponent.updateMatchExpressionString();
					    				}
					    			}
					    		});
					      }

					      mainComponent.locationSiteCriteriaDialog.show();
					},
					disabled: true
				}]
			},
			{
				xtype:'radio',
				ref: 'customRulesRadio',
				boxLabel: 'Custom Site Criteria :',
				name: 'act-sitecriteria-type',
				inputValue: "rules",
				handler: this.updateBasedOnRadio,
				scope: this
			},
			{
				xtype: 'panel',
				border: false,
				layout: 'fit',
				bodyStyle : { "padding-left": 40 },
				items: [
				{
					xtype: 'editorgrid',
					ref: '../rulesGrid',
					autoExpandColumn: 'value',
					store : mainComponent.itsDataStore,
					clicksToEdit: 1,
					selModel: new Ext.grid.RowSelectionModel(
					{
					}),
					height:200,
					listeners:
					{
						validateedit: function(e)
						{
							if(e.field == "name")
							{
								function initValueWithDefault(e)
								{
									var editorid = computeFieldEditorType(e.value);

									if(editorid)
										e.record.data.value = e.grid.colModel.defaultValues[editorid];
									else
										e.record.data.value = '';
								}

								if(isEmptyString(e.value) || isEmptyString(e.originalValue))
								{
									initValueWithDefault(e);
									return;
								}

								
								
								
								
								
								
								
								
								

								var originalEditor = computeFieldEditorType(e.originalValue);
								var editor = computeFieldEditorType(e.value);

								if(originalEditor != editor)
								{
									initValueWithDefault(e);
								}
							}
						},

						afteredit: this.onAfterGridEdit,
						afterrender: function(grid)
						{
							var resizer = new Ext.Resizable(grid.el,
							{
							    handles: 'se s e',
							    minHeight: 100,
							    dynamic:false,
							    pinned: true
							});

							function onresize()
							{
							    var x = resizer.getEl().getSize();
							    grid.setSize(x);
							    grid.syncSize();
	
							}

							resizer.on('resize', onresize);

							setTimeout(function() { resizer.resizeTo(600,200);},100);

							
							grid.el.on('mouseover', function(evt, el, obj)
							{
								Ext.fly(el).addClass('x-tool-close-over');
							}, el, { delegate: '.x-tool-close' });

							grid.el.on('mouseout', function(evt, el, obj)
							{
								Ext.fly(el).removeClass('x-tool-close-over');
							}, el, { delegate: '.x-tool-close' });
						},
						cellclick: function(grid, rowIndex, columnIndex, e)
						{
							if(columnIndex == grid.getColumnModel().getIndexById('deleter'))
							{
								if(Ext.fly(e.getTarget()).hasClass('x-tool-close'))
								{
									var record = grid.getStore().getAt(rowIndex);
									grid.getStore().remove(record);
									mainComponent.onAfterGridEdit();
									grid.getView().refresh();
								}
							}
						},

						scope: mainComponent
					},

					
					viewConfig:
					{
						markDirty: false
					},
					colModel : new Ext.grid.ColumnModel(
					{
						isCellEditable: function(colIndex, rowIndex)
						{
							var field = this.getDataIndex(colIndex);
							if (field == 'value')
							{
								var record = mainComponent.itsDataStore.getAt(rowIndex);

								var fieldid = record.data.name;

								return !isEmptyString(fieldid);
							}

							return true;
						},

						getCellEditor: function(colIndex, rowIndex)
						{
							var field = this.getDataIndex(colIndex);
							if (field == 'value')
							{
								var record = mainComponent.itsDataStore.getAt(rowIndex);

								var fieldid = record.data.name;

								
								if(!isEmptyString(fieldid))
								{
									var editor = computeFieldEditorType(fieldid);

									return this.editors[editor];
								}
							}

							
							return Ext.grid.ColumnModel.prototype.getCellEditor.call(this, colIndex, rowIndex);
						},

						editors:
						{
							'STRING': new Ext.grid.GridEditor(new Ext.form.TextField({})),
							'BOOLEAN': new Ext.grid.GridEditor(yesNoComboBox),
							'displaytype': new Ext.grid.GridEditor(new com.actional.serverui.DisplayTypeCombo({}))
						},

						defaultValues:
						{
							'STRING': '',
							'BOOLEAN': 'true',
							'displaytype': ''
						},

						columns:
						[{
							id : 'name',
							header : 'Name',
							width : 200,
							sortable : true,
							dataIndex : 'name',
							renderer : function(val, metaData, record, rowIndex, colIndex, store)
							{
								var fieldid = record.data.name;

								if(isEmptyString(fieldid))
								{
									return "<i>&lt;click to add&gt;</i>";
								}

								return com.actional.DataStore.sitecriteria.getSiteCriteriaFieldName(fieldid);
							},
							editor : nameComboBox
						},
						{
							id : 'value',
							header : 'Value',
							width : 300,
							sortable : true,
							editor : new Ext.form.TextField(),
							renderer: function(val, metaData, record, rowIndex, colIndex, store)
							{
								var renderers =
								{
									'STRING': function(val, metaData, record, rowIndex, colIndex, store)
									{
										return val;
									},
									'BOOLEAN': function(val, metaData, record, rowIndex, colIndex, store)
									{
										if(val == 'true')
											return "Yes";
										else
											return "No";
									},
									'displaytype': function(val, metaData, record, rowIndex, colIndex, store)
									{
										if(!val)
											return "<i>&lt;select type&gt;</i>";

										var displayType = com.actional.DataStore.displaytypes.getDisplayType(val);

										if(!displayType)
											return "<i>unregisted type="+val+"</i>";

										return "<div class='act-icon-combo-item "+displayType.iconstyle+"'>"+displayType.name+"</div>";
									}
								};

								var fieldid = record.data.name;

								if(isEmptyString(fieldid))
									return "";

								var renderer = computeFieldEditorType(fieldid);

								return renderers[renderer](val, metaData, record, rowIndex, colIndex, store);
							},
							dataIndex : 'value'
						},
						{
							id: 'deleter',
							header : '',
							width: 32,
							dataIndex: 'name',
							editable: false,
							sortable: false,
							menuDisabled: true,
							fixed: true,

							renderer: function(val, p, record, rowIndex)
							{
								if(isEmptyString(val))
									return '';
								else
									return '<div class="x-tool x-tool-close" style="float:none"></div>';
							}
						}]
					})
				}]
			}],
			listeners:
			{
				afterrender: mainComponent.initializeAfterRender
			}
		}));
	}
});

com.actional.serverui.sitecriteria.LocationSiteCriteriaDialog = Ext.extend(Ext.Window,
{
	/**
	 * @cfg {String} networkTreePanelHtml
	 *
	 */

	/**
	 * @cfg {String} siteCtx
	 *
	 * The context is which the site matching is occuring. This string is used when building the helptext.
	 */

	/**
	 * @cfg {Object} networkTreeObj
	 *
	 * The networkTree object (treeobj)
	 */

	/**
	 * @cfg {Object} selectionData
	 *
	 * The selection data
	 */


	networkTreePanelHtml : null,
	siteCtx : null,
	networkTreeObj : null,

	saveSettings : function()
	{
		var treeObj = this.networkTreeObj;

		var selection = {};

		if (!treeObj.SelectedID || treeObj.SelectedID == KEYID_FOR_NONE)
		{
			alert("Please select a Location");
			return false;
		}

		selection.selectedSiteId = TreeWidget_singleSelectMode_selection(treeObj);
		selection.anyNodeEnabled = this.anyNodeCheckbox.getValue();

		var elem = document.getElementById(treeObj.SelectedID);
		if (elem)
		{
			selection.displayPath = getElemPath(treeObj.itsId, elem);
			selection.displayIconHtml = getImageHTML(treeObj.itsId, elem);
		}

		

		if (selection.anyNodeEnabled)
		{
			var topElem = findTopElement(elem);

			if(topElem)
			{
				

				var level1Node = isRootItem(treeObj.itsId, topElem.id);

				if (level1Node)
				{
					alert("Site Matching does not apply to unmanaged sites or node-level sites. Please select " +
							"another site.");

					return false;
				}

				

				var managed = isManagedID(treeObj.itsId, selection.selectedSiteId);

				if (!managed)
				{
					alert("Site Matching does not apply to unmanaged sites or node-level sites. Please select " +
							"another site.");

					return false;
				}
			}
		}

		this.fireEvent('save', this, selection);

		return true;
	},

	
	initComponent: function()
	{
		this.addEvents(
		{
			/**
			 * @event save
			 * Fires after user clicked OK
			 * @param {com.actional.serverui.sitecriteria.LocationSiteCriteriaDialog} this
			 * @param {Object} selection object which contains:  selectedSiteId, anyNodeEnabled, displayPath and displayIconHtml
			 */
			save: true,

			/**
			 * @event cancel
			 * Fires after user clicked Cancel
			 * @param {com.actional.serverui.sitecriteria.LocationSiteCriteriaDialog} this
			 */
			cancel: true
		});

		com.actional.serverui.sitecriteria.LocationSiteCriteriaDialog.superclass.initComponent.call(this);
	},

	constructor: function(config)
	{
		config = config || {};

		networkTreeObj = config.networkTreeObj;

		config.listeners = Ext.applyIf(config.listeners,
		{
			afterrender: networkTreeSiteCriteriaAfterRender
		});

		com.actional.serverui.sitecriteria.LocationSiteCriteriaDialog.superclass.constructor.call(this, Ext.applyIf(config,
		{
			title: 'Select Location',
			closeAction: 'hide',
			layout: 'vbox',
	        	layoutConfig: { align: 'stretch' },
			width: 600,
			height: 600,
			border: false,
			items:
			[{
				xtype: 'panel',
				bodyCssClass: 'x-toolbar', 
				autoHeight: true,
				html: 'Select a location for the ' + config.siteCtx + ' to execute on.'
			},
			{
				xtype: 'panel',
				ref:	'networkTreePanel',
				autoScroll: true,
				flex: 1,
				html: config.networkTreePanelHtml
			},
			{
				xtype: 'panel',
				title: 'Site Matching',
				bodyCssClass: 'x-toolbar',	
				autoHeight: true,
				html: 'Enable this option to evaluate the ' + config.siteCtx + ' on all managed nodes where the site appears. '+
					'This is useful when the same service, operation, etc, appears on multiple nodes. '+
					'It also allows matching on nodes where the site has not yet been discovered. '
			},
			{
				layout: 'form',
				labelWidth: 120,
			        items:
			        [{
			        	xtype: 'checkbox',
			        	ref : '../anyNodeCheckbox',
			        	fieldLabel: 'All Managed Nodes',
			        	checked: config.selectionData.anyNodeEnabled
			        }]
			}],
			buttons:
			[{
				text     : 'OK',
				handler  : function()
				{
					if(this.saveSettings())
						this.hide();
				},
				scope	: this

			},
			{
				text     : 'Cancel',
				handler  : function()
				{
					this.hide();
				},
				scope	: this

			}]
		}));
	}
});

Ext.reg('com.actional.serverui.sitecriteria.SiteCriteria', com.actional.serverui.sitecriteria.SiteCriteria);
