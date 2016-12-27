

















Ext.namespace('com.actional.serverui.sitecriteria');

/**
 *
 * @class com.actional.serverui.sitecriteria.MultiSiteCriteria
 * @extends Ext.Panel
 *
 * @lastrev fix39152 - switch to ExtJS Tree
 */
com.actional.serverui.sitecriteria.MultiSiteCriteria = Ext.extend(Ext.Panel,
{
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
	
	itsData : null,
	itsExistingSiteListMatchExpression: null,

	validate: function()
	{
		if(false)
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

		return true;
	},

	refreshExistingSiteList: function(matchExpressionObj)
	{
		this.itsExistingSiteListMatchExpression = matchExpressionObj;

		if ((this.itsExistingSiteListMatchExpression.siteid && 
			this.itsExistingSiteListMatchExpression.siteid.length == 0) || 
			!this.itsExistingSiteListMatchExpression.siteid)
		{
			this.renderExistingSiteList([]);
			return;
		}

		matchExpressionObj.multi = true;

		Ext.Ajax.request(
	        {
	        	url: contextUrl('admin/sitecriteria.jsrv'),
	                params: matchExpressionObj,
	                method: 'POST',
	                scope: this,
	                callback: function(options, success, response)
	                {
        			var data = [];
                	
	        		if (success)
	        		{
		        		try
		        		{
			        		data = Ext.util.JSON.decode(response.responseText);
		        		}
		        		catch(e)
		        		{
		        			
		        		}
	        		}

	        		this.renderExistingSiteList(data);
	                }
		});
	},

	renderExistingSiteList: function(data)
	{
		var items = [];

		if(data.length == 0)
		{
			items.push({ xtype: 'box', autoEl: { tag: 'div' } });
			items.push({ xtype: 'box', html: '<i>No Existing Site(s) Selected</i>' });
			items.push({ xtype: 'box', autoEl: { tag: 'div' } });
		}

		for(var i=0; i<data.length; i++)
		{
			var displayPath = Ext.util.Format.htmlEncode(data[i].displayPath);
		
			items.push({ xtype: 'box', autoEl: { tag: 'img', src: data[i].iconUrl } });
			
			items.push({ xtype: 'box', html: displayPath });
			
			items.push({ xtype: 'box', style: { 'margin':4 }, 
					html: '<div id="ams_existing_site_deleter-' + i + '" class="x-tool x-tool-close" style="float:none"></div>' });								
		}

		var table = 
		{
			xtype: 'container',
			ref: '../multiSelectTableList',
			layout: 
			{
				type: 'table',
				columns: 3
			},
			items: items
		};

		this.multiSelectTableContainer.removeAll();
		this.multiSelectTableContainer.add(table);
		this.multiSelectTableContainer.doLayout();
	},

	updateMatchExpressionField: function()
	{
		var me = this; 
		
		var matchExpressionStr = "";
		
		if(this.itsExistingSiteListMatchExpression)
		{
			matchExpressionStr += me.generateMatchExpressionString(
						me.itsExistingSiteListMatchExpression);
		}
		
		me.gridListContainer.items.each( function()
		{
			var grid = this.criteriaGrid;
			
			var itemMatchExpression = me.generateMatchExpressionString(
						grid.generateGridMatchExpression());
			
			if(itemMatchExpression.length == 0)
				return; 
			
			if(matchExpressionStr)
				matchExpressionStr += "\r\n";
			
			matchExpressionStr += escape(grid.itsUid);
			matchExpressionStr += ":";
			
			matchExpressionStr += itemMatchExpression;
		});

		Ext.get(this.formFieldName).dom.value = matchExpressionStr;
	},

	generateMatchExpressionString: function(obj)
	{
		if(!obj)
			return "";

		var parts = [];
		
		for(name in obj)
		{
			if(!name )
				continue;
			
			var value = obj[name];

			if(value === undefined || value === null )
				continue;
			
			if(parts.length > 0)
				parts.push('&');

			parts.push(escape(name));
			parts.push('=');
			
			
			if(Ext.isArray(value))
			{
				for(var i=0; i<value.length; i++)
				{
					if(i > 0)
						parts.push("|");
					
					parts.push(escape(value[i]));
				}
			}
			else
			{
				parts.push(escape(value));
			}
		}

		return parts.join('');
	},

	parseMultiMatchExpressionString: function(multiStr)
	{
		var lines = multiStr.split(/(\r)?\n/);
		
		var expressionArray = [];

		for(var i=0; i<lines.length; i++)
		{
			if(!lines[i])
				continue;

			var line = lines[i];

			var colonPos = line.indexOf(':');
			var uid = null; 
				
			if(colonPos >= 0)
			{
				uid = line.substring(0,colonPos);
				line = line.substring(colonPos+1);
			}

			var matchExpression = this.parseMatchExpressionString(line);
			
			expressionArray.push({uid:uid, matchExpr:matchExpression});
		}
			
		return expressionArray;
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
				val = predicate.substring(equalpos+1);
				
				if(name == "siteid")
				{
					if(!val)
					{
						val = [];
					}
					else
					{
						val = val.split('|');
						
						for(i=0; i<val.length;i++)
							val[i] = unescape(val[i]);
					}
				}
				else
				{
					val = unescape(val);
				}
			}

			obj[name] = val;
			empty = false;
		}

		if(empty)
			obj.siteid="*"; 

		return obj;
	},

	initializeAfterRender: function()
	{
		
		

		var multiMatchExpressionStr = Ext.get(this.formFieldName).dom.value;

		var multiMatchExpressionArray = this.parseMultiMatchExpressionString(multiMatchExpressionStr);

		var existingSiteRefreshed = false;
		
		for(var i=0; i<multiMatchExpressionArray.length; i++)
		{
			var matchExpr = multiMatchExpressionArray[i].matchExpr;
			
			if(matchExpr.siteid)
			{
				
				this.refreshExistingSiteList(matchExpr);
				existingSiteRefreshed = true;
			}
			else
			{
				
				var grid = this.newCustomCriteriaRow(true);
				
				grid.updateGrid(matchExpr, multiMatchExpressionArray[i].uid);
			}
		}
		
		if(!existingSiteRefreshed)
		{
			
			this.refreshExistingSiteList({siteid:[]});
		}
		
		this.gridListContainer.doLayout();
	},

	onBrowse : function(button, ev)
	{
		
		var mainComponent = this;
		
		if(!mainComponent.locationSiteCriteriaDialog)
		{
			mainComponent.locationSiteCriteriaDialog = 
				new com.actional.serverui.sitecriteria.MultiLocationSiteCriteriaDialog(
	    		{
	    			siteCtx: mainComponent.siteCtx,
	    			selectionData:
	    			{
	    				anyNodeEnabled: (mainComponent.itsExistingSiteListMatchExpression.anynode == 'yes')
	    			},
	    			networkTreeObj: mainComponent.networkTreeObj,
	    			listeners:
	    			{
	    				save: function(dlg, selectionData)
	    				{
	    					
	    					var matchExpressionObj = {};

	    					matchExpressionObj.siteid = selectionData.selectedSiteIds;
	    					if(selectionData.anyNodeEnabled)
	    						matchExpressionObj.anynode = "yes";

	    					mainComponent.refreshExistingSiteList(matchExpressionObj);
	    					mainComponent.updateMatchExpressionField();
	    				}
	    			}
	    		});
	      }

	      mainComponent.locationSiteCriteriaDialog.setSelectedSiteIds(this.itsExistingSiteListMatchExpression.siteid);  
	      mainComponent.locationSiteCriteriaDialog.show();
	},

	deleteEntryAtIndex:	function(index)
	{
		var matchExpressionObj = {};

		matchExpressionObj.siteid = this.itsExistingSiteListMatchExpression.siteid;
		matchExpressionObj.anynode = this.itsExistingSiteListMatchExpression.anynode;

		matchExpressionObj.siteid.splice(index,1);

		this.refreshExistingSiteList(matchExpressionObj);
		this.updateMatchExpressionField();
	},

	/** @return the grid component */
	newCustomCriteriaRow: function(inhibitLayout)
	{
		
		var mainComponent = this;

		var criteriaTable = new com.actional.serverui.sitecriteria.CustomCriteriaTable(
		{ 
			ref: "criteriaGrid",
    			listeners:
    			{
    				modified: function(grid)
    				{
    					mainComponent.updateMatchExpressionField();	
    				}
    			}
		}); 		

		
		var componentRef;

		var rowComponent = 				
		{
			xtype: 'container',
			layout: { type: 'table', columns: 2 },
			items: 
			[
				criteriaTable,
				{
					xtype: 'button',
					text: 'Remove Criteria',
					style: { 'margin':4 },
					handler: function()
					{
						mainComponent.gridListContainer.remove(componentRef);
						mainComponent.updateMatchExpressionField();
					}
				}
			]
		};
		
		componentRef = mainComponent.gridListContainer.add(rowComponent);
		
		if(!inhibitLayout)
			mainComponent.gridListContainer.doLayout();
		
		return componentRef.criteriaGrid;
	},

	constructor: function(config)
	{
		
		var mainComponent = this;

		com.actional.serverui.sitecriteria.MultiSiteCriteria.superclass.constructor.call(this, Ext.applyIf(config,
		{
			layout: 'auto',
		    autoHeight: true,
			border: false,
			items: [
			{
				xtype:'box',
				style: { 'margin':4 },
				html: 'Select existing site(s):'
			},
			{
				xtype: 'container',
				layout:
				{
					type: 'table',
					columns: 2
				},
				listeners:
				{
					afterrender: function()
					{
						
						this.el.on('mouseover', function(evt, el, obj)
						{
							Ext.fly(el).addClass('x-tool-close-over');
						}, el, { delegate: '.x-tool-close' });

						this.el.on('mouseout', function(evt, el, obj)
						{
							Ext.fly(el).removeClass('x-tool-close-over');
						}, el, { delegate: '.x-tool-close' });

						this.el.on('click', function(evt, el, obj)
						{
							var id = Ext.fly(el).getAttribute('id');

							var index = id.split("-")[1];

							mainComponent.deleteEntryAtIndex(index);
							
						}, el, { delegate: '.x-tool-close' });
					}
				},
				items: [
				{
					xtype: 'container',
					ref: '../multiSelectTableContainer',
					layout:
					{
						type: 'fit'
					}
				},
				{
					xtype: 'button',
					style: { 'margin':20 },
					text: 'Select Site(s)...',
					scope: this,
					handler: function() { this.onBrowse(); }
				}]
			},
			{
				xtype: 'container',
				layout: 'hbox',
				align: 'stretchmax', 
				border: false,
				style : { "padding-left": 40 },
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
				}]
			},
			{
				xtype:'box',
				style: { 'margin':4 },
				html: 'Select site(s) based on criteria:'
			},
			{
				xtype: 'container',
				layout: 'auto',
				ref: 'gridListContainer',
				autoHeight: true,
				style : { "padding-left": 40 },
				border: false,
				items: [ ]
			},
			{
				xtype: 'button',
				text: 'New Criteria',
				style: { "padding-left": 40, 'margin':8 },
				handler: function()
				{
					mainComponent.newCustomCriteriaRow();
				}
			}],
			listeners:
			{
				afterrender: mainComponent.initializeAfterRender
			}
		}));
	}
});

com.actional.serverui.sitecriteria.MultiSiteCriteria.itsUniqueIdCounter = 1;

com.actional.serverui.sitecriteria.CustomCriteriaTable = Ext.extend(Ext.grid.EditorGridPanel,
{
	itsDataStore: null,
	
	/** Id to track the instance. Id must be unique within the page. This is to track instances 
	 * when other piece of information (in Java) is attached to this component. */
	itsUid: null,	
	
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
		
		this.fireEvent('modified', this);							
	},

	generateGridMatchExpression: function()
	{
		var matchExpressionObj = {};

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
		
		return matchExpressionObj;
	},

	updateGrid: function(matchExpressionObj, uid)
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

		this.itsUid = uid;
		this.itsDataStore.loadData({rows:gridData, total:gridData.length});
	},

	
	initComponent: function()
	{
		this.addEvents(
		{
			/**
			 * @event modified
			 * Fires after user modified the grid
			 * @param {com.actional.serverui.sitecriteria.CustomCriteriaTable} this
			 */
			modified: true
		});

		com.actional.serverui.sitecriteria.CustomCriteriaTable.superclass.initComponent.call(this);
	},
	
	constructor: function(config)
	{
		
		var criteriaTableComponent = this;
		
		this.itsUid = com.actional.serverui.sitecriteria.MultiSiteCriteria.itsUniqueIdCounter++;
		
		
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

		com.actional.serverui.sitecriteria.CustomCriteriaTable.superclass.constructor.call(this, Ext.applyIf(config,
		{
			style: { 'margin':4 },
			autoExpandColumn: 'value',
			store : this.itsDataStore,
			clicksToEdit: 1,
			selModel: new Ext.grid.RowSelectionModel(
			{
			}),
			height:200,
			width:400,
			listeners: Ext.applyIf(config.listeners,
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

				afteredit: criteriaTableComponent.onAfterGridEdit,
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
							criteriaTableComponent.onAfterGridEdit();
							grid.getView().refresh();
						}
					}
				},

				scope: criteriaTableComponent
			}),

			
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
						var record = criteriaTableComponent.itsDataStore.getAt(rowIndex);

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
						var record = criteriaTableComponent.itsDataStore.getAt(rowIndex);

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
							return "<i style='color:grey'>click to add condition</i>";
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
		}));
	}

});

com.actional.serverui.sitecriteria.MultiLocationSiteCriteriaDialog = Ext.extend(Ext.Window,
{
	/**
	 * @cfg {String} siteCtx
	 *
	 * The context is thing that the site matching is occuring for. This string is used when building the helptext.
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

	siteCtx : null,
	networkTreeObj : null,

	saveSettings : function()
	{
		var treeObj = this.networkTreeObj;

		var selection = {};

		selection.selectedSiteIds = this.networkTree.getChecked("id");;     
		
		selection.anyNodeEnabled = this.anyNodeCheckbox.getValue();

		

		if (selection.anyNodeEnabled)
		{
			
			

			var good = true;
			var f = function()
			{
			 	if(this.attributes.checked)
			 	{
			                if(this.attributes.level == 1 || !this.attributes.managed)
						good = false;			                
				}
			};
			this.networkTree.root.cascade(f);
			 
			if (!good)
			{
				alert("Site Matching does not apply to unmanaged sites or node-level sites. Please select " +
						"another site.");

				return false;
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
			 * @param {com.actional.serverui.sitecriteria.MultiLocationSiteCriteriaDialog} this
			 * @param {Object} selection object which contains:  selectedSiteIds, anyNodeEnabled, displayPath and displayIconHtml
			 */
			save: true,

			/**
			 * @event cancel
			 * Fires after user clicked Cancel
			 * @param {com.actional.serverui.sitecriteria.MultiLocationSiteCriteriaDialog} this
			 */
			cancel: true
		});

		com.actional.serverui.sitecriteria.MultiLocationSiteCriteriaDialog.superclass.initComponent.call(this);
	},

	setSelectedSiteIds: function(siteidlist)
	{
		var treeObj = this.networkTreeObj;

		if(!siteidlist || siteidlist.length == 0)
		{
			this.expandPathsAndSetChecked([]);
			return;
		}	

		var params = this.computeBaseHttpParams(treeObj);
	
		params.computePath = 1;
		params.id = siteidlist;
	
		Ext.Ajax.request(
	        {
	        	url: contextUrl('admin/networktree.jsrv'),
	                params: params,
	                method: 'POST',
	                scope: this,
	                callback: function(options, success, response)
	                {
        			var data = [];
                	
	        		if (success)
	        		{
		        		try
		        		{
			        		data = Ext.util.JSON.decode(response.responseText);
		        		}
		        		catch(e)
		        		{
		        			
		        		}
	        		}

				this.expandPathsAndSetChecked(data);
	                }
		});
	},

	/**
	 * 'paths' is an array of paths. Each "path" is an array of ids. 
	 * The first entry correspond to the top-level node.
	 */
	expandPathsAndSetChecked: function(paths)
	{
		var tree = this.networkTree;
		
		
		tree.collapseAll();
		
		
		tree.root.cascade(function(node)
		{
			node.ui.toggleCheck(false);
		});
		
		var topNode;
		var topNodePos;
		var toBeProcessed = paths.length;
		
		
		
		for(var i=0; i<paths.length; i++)
		{
			var path = paths[i];
			
			var pathStr = ":*";
			
			
			for(var j = 0; j<path.length - 1; j++)
			{
				pathStr += ":";
				pathStr += path[j];
			}	

			
			(function() 
			{		
				var nodeId = path[path.length-1];
			
	        		tree.expandPath(pathStr, 'id', function(bSuccess, oLastNode)
	        		{ 
	        			if(bSuccess)
	        			{
	        				var child = oLastNode.findChild('id', nodeId);
	        				if(child)
	        				{
	        					var nodePos = Ext.fly(child.ui.anchor).getOffsetsTo(tree.getTreeEl())[1];
	        					if(!topNode || nodePos < topNodePos)
	        					{
	        						topNode = child;
	        						topNodePos = nodePos;
	        					}
	        					
	        					child.ui.toggleCheck(true);
	        				}
	        			}
	        			
	        			toBeProcessed--;
	        			if(toBeProcessed == 0)
	        			{
	        				if(topNode)
	        					Ext.fly(topNode.ui.anchor).scrollIntoView(tree.getTreeEl());
	        			}
	        		});
	        	}.call(this));
        	}
	},

	constructor: function(config)
	{
		config = config || {};

		networkTreeObj = config.networkTreeObj;

		var me = this;

		com.actional.serverui.sitecriteria.MultiLocationSiteCriteriaDialog.superclass.constructor.call(this, Ext.applyIf(config,
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
				xtype: 'com.actional.ui.TristateTreePanel',
				ref: 'networkTree',
			        containerScroll: true,
			        pathSeparator: ':',
				root: {
					id: '*',
	      			  	nodeType: 'async',
	      			  	uiProvider: com.actional.ui.RootTreeNodeUI
	    			},
				flex: 1,
				loader: new Ext.tree.TreeLoader(
				{
					listeners: 
					{
						beforeload: function(treeLoader, node) 
						{
							var treeObj = config.networkTreeObj;

							treeLoader.baseParams = me.computeBaseHttpParams(treeObj);
					    	}
				    	},
					baseAttrs: { uiProvider: com.actional.ui.AsyncTristateNodeUI },
	       				dataUrl: contextUrl('admin/networktree.jsrv')
	        		})
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
	},

	computeBaseHttpParams: function(treeObj)	
	{
		var httpParams = { json:1 };
	
		if (treeObj.itsParamsList)
		{
			var params = treeObj.itsParamsList.split(',');
	
			var paramName, paramValue;
			for (var i = 0; i < params.length; i++)
			{
				paramName = params[i];
				paramValue = treeObj[paramName];
	
				if (paramName && paramValue)
					httpParams[paramName] = paramValue;
			}
		}
		
		return httpParams;
	}
});



Ext.reg('com.actional.serverui.sitecriteria.MultiSiteCriteria', com.actional.serverui.sitecriteria.MultiSiteCriteria);
