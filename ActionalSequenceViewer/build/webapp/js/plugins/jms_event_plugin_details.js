//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/plugins/jms_event_plugin_details.js $
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

Ext.ns('com.actional.pluginui');

/**
 * @class com.actional.pluginui.JMSEventPluginDetails
 * @extends Ext.grid.EditorGridPanel
 * Ext-based component to edit/display JMS Plugin Settings
 *
 * @lastrev fix39624 - SONAR: Critical: Duplicate property names not allowed in object literals
 */

com.actional.pluginui.JMSEventPluginDetails = Ext.extend(Ext.grid.EditorGridPanel,
{
	/**
     * @cfg {JSON} pluginData
     * JSON data store of JMS plugin settings
     */
	/**
     * @cfg {Array} jms_msg_fields_json_array
     * Array of JSON objects for message fields
     */
     /**
     * @cfg {String} idPrefix
     * id prefix for the grid
     */
	
    jms_type_store: undefined,
    jms_content_type_store: undefined,
    jms_agent_metrics_store: undefined,
    jms_msg_fields_store: undefined,
    itsPluginData: undefined,
    itsDataStore: undefined,
    itsIdPrefix: undefined,
    
    comboConfig: 
    {
        typeAhead: true,
        triggerAction: 'all',
        lazyRender:true,
        mode: 'local',
        editable: false,
        allowBlank: false
    },
    
    constructor: function (config)
    {
        config = config || {};
        
        var jmsContentTypeList = com.actional.DataStore.jmsContentTypes.getJmsContentTypeList();
        this.jms_content_type_store = 
        	new Ext.data.JsonStore(
            	{
            		idProperty: 'id',
            		root: 'rows',
            		fields:
            		[
            		 	{name : 'id'},
            			{name : 'name'}
            		],
       				data:
       				{
       					rows: jmsContentTypeList,
       					total: jmsContentTypeList.length
       				}
       			});
        
        var jmsValueTypeList = com.actional.DataStore.jmsValueTypes.getJmsValueTypeList();
        this.jms_type_store = 
        	new Ext.data.JsonStore(
               	{
               		idProperty: 'id',
               		root: 'rows',
               		fields:
               		[
               		 	{name : 'id'},
               			{name : 'name'}
               		],
           			data:
           			{
           				rows: jmsValueTypeList,
           				total: jmsValueTypeList.length
           			}
           		});
        
        var agentEventsList = com.actional.DataStore.agentEventInfoTypes.getAgentEventInfoTypeList();
        this.jms_agent_metrics_store = 
        	new Ext.data.JsonStore(
        	{
        		idProperty: 'id',
        		root: 'rows',
        		fields:
        		[
        		 	{name : 'id'},
        			{name : 'name'},
        			{name: 'defaultJmsType'}
        		],
   				data:
   				{
   					rows: agentEventsList,
   					total: agentEventsList.length
   				}
   			});
        
        this.jms_msg_fields_store =
        	new Ext.data.JsonStore(
                	{
                		root: 'rows',
                		fields:
                		[
                		 	{name : 'jms_msg_fields'}
                		],
           				data:
           				{
           					rows: config.jms_msg_fields_json_array,
           					total: config.jms_msg_fields_json_array.length
           				}
           			});
        
        this.itsPluginData = config.pluginData;
        this.itsIdPrefix = config.idPrefix;
        
        com.actional.pluginui.JMSEventPluginDetails.superclass.constructor.call(this, Ext.applyIf(config,
        {
            id: 'JMSEventPluginDetails_' + this.itsIdPrefix,
            store: new Ext.data.JsonStore(
            {
                fields: 
                [
                    {name: 'name'}, 
                    {name: 'type'}, 
                    {name: 'value'}, 
                    {name: 'contentType'}
                ]
            }),
            columns: [
                {
                    id: 'name',
                    width: 150,
                    header: 'Name',
                    dataIndex: 'name',
                    sortable: false,
                    menuDisabled: true,
                    editor: new Ext.form.TextField(
                    {
                        allowBlank: false,
                        submitValue: false
                    }),
                    renderer: function(value, metaData, record, rowIndex, colIndex, store)
                    {
                        if (isEmptyString(value))
                            return "<span style='font-style:italic;color:#65656d;'>&lt;click to add&gt;</span>";
                        else
                        	return value;
                    }
                },
                {
                    header: 'Type',
                    width: 150,
                    sortable : false,
                    dataIndex: 'type',
                    menuDisabled: true,
                    editor: Ext.apply(new Ext.form.ComboBox(this.comboConfig),
                    {
                        store: this.jms_type_store,
                        valueField: 'id',
                        displayField: 'name'
                    }),
                    renderer: function(value, metaData, record, rowIndex, colIndex, store)
                    {
                        var returnVal = com.actional.DataStore.jmsValueTypes.getJmsValueTypeName(value);
                        if (isEmptyString(returnVal))
                        	return value;
                        return returnVal;
                    }
                },
                {
                    id: 'value',
                    header: 'Value',
                    width: 200,
                    sortable : false,
                    dataIndex: 'value',
                    menuDisabled: true,
                    editor: new Ext.form.TextField(
                    {
                        allowBlank: false
                    }),
                    renderer: function(value, metaData, record, rowIndex, colIndex, store)
                    {
                    	if (record.get('type') == 'AGENT_EVENT_FIELD')
                    		return com.actional.DataStore.agentEventInfoTypes.getAgentEventInfoTypeName(value);
                    	else if (record.get('type') == 'MSG_FIELD')
                    	{
                    		var grid = Ext.getCmp('JMSEventPluginDetails_' + config.idPrefix);
                    		var index = grid.jms_msg_fields_store.findExact('jms_msg_fields', trim(value));
                    		
                    		grid.jms_msg_fields_store.clearFilter(true);
                    		
                    		if (index < 0)
                    		{
                    			return trim(value) + "&nbsp;<span style='font-style:italic;color:#65656d;'>(new)</span>";
                    		}
                   			return value;
                    	}
                   		return value;
                    }
                },
                {
                	id: 'contentType',
                    header: 'JMS Content Type',
                    width: 150,
                    dataIndex: 'contentType',
                    sortable: false,
                    menuDisabled: true,
                    editor: Ext.apply(new Ext.form.ComboBox(this.comboConfig),
                    { 
                    	store: this.jms_content_type_store, 
                    	valueField: 'id',
                    	displayField: 'name'
                    }),
                    renderer: function(value, metaData, record, rowIndex, colIndex, store)
                    {
                    	var returnVal = com.actional.DataStore.jmsContentTypes.getJmsContentTypeName(value);
                    	var defaultVal = returnVal + "&nbsp;<span style='font-style:italic;color:#65656d;'>(Default)</span>";
                    	if ('AGENT_EVENT_FIELD' == record.get('type'))
                    	{
                    		if (value == com.actional.DataStore.agentEventInfoTypes.getAgentEventInfoDefaultJmsType(record.get('value')))
                    		{
                    			return defaultVal;
                    		}
                    	}
                    	else
                    	{
                            if (value == 'STRING')
                            	return defaultVal;
                    	}
                    	return returnVal;
                    }
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
							return '<div class="x-tool x-tool-close"></div>';
					}
				}
            ],
            viewConfig:
            {
            	markDirty: false
            },
            listeners:
            {
                beforeedit: this.onBeforeEdit,
                afteredit: this.onAfterEdit,
                afterrender: this.onAfterRender,
                cellclick: this.onCellClick,
                scope: this
            },
            sm: new Ext.grid.RowSelectionModel(
            {
                singleSelect:true
            }),
            clicksToEdit: 1,
            height: 200,
            width: 720,
            renderTo: 'jsmPluginContentsDiv_' + this.itsIdPrefix
        }));
    },
    
    /**
     * Create ComboBox dynamically as column editors, as the store for each should be changes
     * based on the type selection.
     */
    onBeforeEdit: function (edit)
    {
    	var record = edit.record;
    	var isNewRecord = false;
    	
    	// Check if a new record is created
    	if (isEmptyString(record.data.type) && isEmptyString(record.data.contentType))
    	{
    		isNewRecord = true;
    	}
    	
    	if (isNewRecord)
    	{
    		if (edit.column != 0)
    		{
    			this.stopEditing(true);
    			return false;
    		}
    		else
    		{
    			return true;
    		}
    	}
    	/** When the "Value" field is changed,
    	 * 1. Provide ComboBox for Agent Event Field and Message Field with appropriate store.
    	 * 2. TextArea for Custom value */ 
        if (edit.column == 2)
        {
            var type = record.get('type');
            var valueType;
            var displayType;
            var store;
            var isCustom = false;
            var editable = false;
            
            if (type == 'AGENT_EVENT_FIELD')
            {
                valueType = 'id';
                displayType = 'name';
                store = this.jms_agent_metrics_store;
                editable = false;
            }
            else if (type == 'MSG_FIELD')
            {
                valueType = 'jms_msg_fields';
                displayType = 'jms_msg_fields';
                store = this.jms_msg_fields_store;
                editable = true;
            }
            else
            {
                isCustom = true;
            }
            
            var column = edit.grid.getColumnModel().getColumnById('value');
            
            if (isCustom)
            {
                column.editor = new Ext.form.TextArea(
                {
                    allowBlank: false
                });
            }
            else
            {
                column.editor = Ext.apply(new Ext.form.ComboBox(this.comboConfig),
                {
                    store: store,
                    valueField: valueType,
                    displayField: displayType,
                    editable: editable
                });
            }
        }
        /** 
         *  When the "JMS Content Type" field is changed,
    	 *  if Agent Event Field is selected, set its respective default JMS Content types as 'Default' for the ComboBox
    	 **/
        else if (edit.column == 3)
        {
        	var defaultJmsTypeValue;
        	if ('AGENT_EVENT_FIELD' == record.get('type'))
        	{
        		defaultJmsTypeValue = com.actional.DataStore.agentEventInfoTypes.getAgentEventInfoDefaultJmsType(record.get('value'));
        	}
        	else
        	{
        		defaultJmsTypeValue = 'STRING';
        	}
        	var count = this.jms_content_type_store.getCount();
        	var removeIndex = 0;
        	var newStoreData = new Array();
        	for (var i = 0; i < count; ++i)
        	{
        		var record1 = this.jms_content_type_store.getAt(i);
        		var displayValue = com.actional.DataStore.jmsContentTypes.getJmsContentTypeName(record1.data['id']);
        		if (defaultJmsTypeValue == record1.data['id'])
        		{
        			displayValue += " (Default)";
        		}
        		newStoreData.push({id: record1.data['id'], name: displayValue});
        	}
        	this.jms_content_type_store.loadData({rows:newStoreData, total:newStoreData.length});
        }
    },
    
    onAfterEdit: function(edit)
    {
    	var record = edit.record;
    	var isNewRecord = false;

    	// When new record is created, add it to the math expression string
    	if (isEmptyString(record.data.type) && isEmptyString(record.data.contentType))
    	{
    		isNewRecord = true;
    		
    		record.set('type', 'STRING_FORMATTER');
    		record.set('contentType', 'STRING');
    		
    		var newRecord = new Ext.data.Record();
			newRecord.data = {name:'', type:'', value:'', contentType:''};
			this.itsDataStore.insert(this.itsDataStore.getCount(), newRecord);
			this.updateMatchExpressionString();
        	return;
    	}

    	/**
    	 * When 'Type' value is changed, 
    	 * for Agent Event Field: set the first member of Agent Event Field list as "Value" and
    	 * 		its default JMS Content type in "JMS Content Type Column"  as default 
    	 * for Message Field: set the first member of Message Field list as "Value" and
    	 * 		its 'STRING' in "JMS Content Type Column" as default
    	 *  for Custom String: Do not alter the existing "Value", set 'STRING' as default for
    	 *      JMS Content Type
    	 */
    	if (edit.column == 1)
        {
            var newValue = record.get('value');
            var defaultJmsType = 'STRING';

            if (edit.value == 'MSG_FIELD')
            {
            	if (this.jms_msg_fields_store.getCount() != 0)
            		newValue = this.jms_msg_fields_store.getAt(0).get('jms_msg_fields');
            }
            else if (edit.value == 'AGENT_EVENT_FIELD')
            {
                newValue = this.jms_agent_metrics_store.getAt(0).get('id');
                defaultJmsType = com.actional.DataStore.agentEventInfoTypes.getAgentEventInfoDefaultJmsType(newValue);
            }

            record.set('contentType', defaultJmsType);
            record.set('value', newValue);
        }
    	/**
    	 * When 'Value' value is changed, 
    	 * for Agent Event Field: set its default JMS Content type in "JMS Content Type Column" as default 
    	 */
    	else if (edit.column == 2)
    	{
    		var type = record.get('type');
    		if (type == 'AGENT_EVENT_FIELD')
    		{
    			var value = record.get('value');
    			var defaultJmsType1 = com.actional.DataStore.agentEventInfoTypes.getAgentEventInfoDefaultJmsType(value);
    			record.set('contentType', defaultJmsType1);
    		}
    		else if (type == 'MSG_FIELD')
    		{
    			this.getView().refresh();
    		}
    	}
    	this.updateMatchExpressionString();
    },
    
    onAfterRender: function()
    {
    	this.itsPluginData.push({name:'', type:'', value:'', contentType:''});
    	this.itsDataStore = this.getStore();
    	this.itsDataStore.loadData(this.itsPluginData);
    	this.updateMatchExpressionString();
    	
    	this.el.on('mouseover', function(evt, el, obj)
		{
			Ext.fly(el).addClass('x-tool-close-over');
		}, el, { delegate: '.x-tool-close' });

		this.el.on('mouseout', function(evt, el, obj)
		{
			Ext.fly(el).removeClass('x-tool-close-over');
		}, el, { delegate: '.x-tool-close' });
    },
    
    onCellClick: function(grid, rowIndex, columnIndex, e)
    {
    	if(columnIndex == grid.getColumnModel().getIndexById('deleter'))
		{
			if(Ext.fly(e.getTarget()).hasClass('x-tool-close'))
			{
				var record = this.itsDataStore.getAt(rowIndex);
				this.itsDataStore.remove(record);
				grid.getView().refresh();
				this.updateMatchExpressionString();
			}
		}
    },
    
    updateMatchExpressionString: function()
    {
		var str = '';
		var count = this.itsDataStore.getCount() - 1;
		for(var i = 0; i < count; ++i)
		{
			if (!isEmptyString(str))
				str += '&';
			var record = this.itsDataStore.getAt(i);
			var obj = {};
			for(name in record.data)
			{
				obj[name + i] = record.data[name];
			}
			str += Ext.urlEncode(obj);
		}
        Ext.get('jsmPluginContentsExpression_' + this.itsIdPrefix).dom.value = str;
    }
   
});

/**
 * @class com.actional.pluginui.JMSEventMonitoringPluginDisplayDetails
 * @extends Ext.grid.GridPanel
 * Ext-based component to display JMS Plugin Settings
 *
 * @lastrev fix39624 - SONAR: Critical: Duplicate property names not allowed in object literals
 */

com.actional.pluginui.JMSEventPluginDisplayDetails = Ext.extend(Ext.grid.GridPanel, 
{
	itsDivId: undefined,
	itsPluginData: undefined,
	
	constructor: function (config)
	{
		config = config || {};

		this.itsPluginData = config.pluginData;
		this.itsDivId = config.divId;

		com.actional.pluginui.JMSEventPluginDisplayDetails.superclass.constructor.call(this, Ext.applyIf(config, {
			id: 'JMSEventPluginDisplayDetails',
			store: new Ext.data.JsonStore(
			{
				fields: [
					{name: 'name'},
					{name: 'type'},
					{name: 'value'},
					{name: 'contentType'}
				],
				data: this.itsPluginData
			}),
			columns: [
				{
					id: 'name',
					width: 150,
					header: 'Name',
					dataIndex: 'name',
					sortable: false,
					menuDisabled: true
				}, 
				{
					header: 'Type',
					width: 150,
					sortable: false,
					dataIndex: 'type',
					menuDisabled: true,
					renderer: function (value, metaData, record, rowIndex, colIndex, store)
					{
						var returnVal = com.actional.DataStore.jmsValueTypes.getJmsValueTypeName(value);
						
						if (isEmptyString(returnVal))
							return value;
						
						return returnVal;
					}
				},
				{
					id: 'value',
					header: 'Value',
					width: 200,
					sortable: false,
					dataIndex: 'value',
					menuDisabled: true,
					renderer: function(value, metaData, record, rowIndex, colIndex, store)
                    {
                    	if (record.get('type') == 'AGENT_EVENT_FIELD')
                    		return com.actional.DataStore.agentEventInfoTypes.getAgentEventInfoTypeName(value);
                    	return value;
                    }
				}, 
				{
					id: 'contentType',
					header: 'JMS Content Type',
					width: 150,
					dataIndex: 'contentType',
					sortable: false,
					menuDisabled: true,
					renderer: function (value, metaData, record, rowIndex, colIndex, store)
					{
						var returnVal = com.actional.DataStore.jmsContentTypes.getJmsContentTypeName(value);
						var defaultVal = returnVal + "&nbsp;<span style='font-style:italic;color:#65656d;'>(Default)</span>";
						if ('AGENT_EVENT_FIELD' == record.get('type'))
						{
							if (value == com.actional.DataStore.agentEventInfoTypes.getAgentEventInfoDefaultJmsType(record.get('value')))
							{
								return defaultVal;
							}
						}
						else
						{
							if (value == 'STRING') 
								return defaultVal;
						}
						return returnVal;
					}
				}
			],
			viewConfig:
			{
				markDirty: false
			},
			sm: new Ext.grid.RowSelectionModel(
			{
				singleSelect: true
			}),
			height: 200,
			width: 690,
			renderTo: this.itsDivId
		}));
	}
});
