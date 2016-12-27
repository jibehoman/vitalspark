

















/**
 * @lastrev fix37770 - Add space between categopry and description field.
 */
Ext.namespace('com.actional.serverui.exporttocontroltower');

com.actional.serverui.exporttocontroltower.LocalizedNamesGrid = Ext.extend(Ext.grid.EditorGridPanel, {
    constructor: function(config){
        var store = new Ext.data.ArrayStore({
            autoDestroy: true,
            storeId: 'myStore',
            idIndex: 0,
            fields: ['languagecode', 'displayname']
        });


        mydata = config.dataForGrid;
        if (!mydata || mydata.length == 0 || mydata[0][0] != 'en')
            throw new Error("invalid grid data, must be non empty and with first language code as 'en'");



	store.loadData(mydata);
	var ctx = this;
        com.actional.serverui.exporttocontroltower.LocalizedNamesGrid.superclass.constructor.call(this, Ext.applyIf(config, {
            stripeRows: true,
            clicksToEdit: 1,
            store: store,
            width: 300,
            autoHeight: true,
            frame: false,
            iconCls: 'icon-grid',
            fieldLabel: 'Portlet Name',
            isFormField: true,
            tbar: [{
                text: "Add Localized Name",
                handler: function(){
                    var rec = new Ext.data.Record({
                        languagecode:"", displayname:''
                    });
                    store.add(rec);
                    ctx.startEditing(store.getCount() - 1, 0);
                }
            }],
            cm: new Ext.grid.ColumnModel({
                columns: [{
                    sortable: false,
                    header: "Language code",
                    dataIndex: 'languagecode',
                    width: 100,
                    editor: new Ext.form.TextField({
                        allowBlank: true
                    })
                }, {
                    sortable: false,
                    width: 300,
                    hidden: false,
                    header: "Display Name",
                    dataIndex: 'displayname',
                    allowBlank: true,
                    editor: new Ext.form.TextField({
                        allowBlank: true
                    })
                }],

                isCellEditable: function(col, row){
                    if (row == 0 && col == 0)
                        return false;

                    return true;
                }
            }),
            sm: new Ext.grid.RowSelectionModel(),
            viewConfig:{headersDisabled:true}
        }));

    }
});



com.actional.serverui.exporttocontroltower.PublishForm = Ext.extend(Ext.FormPanel, {




    constructor: function(config){
        var portletUrl = config.portletUrl;
        var location = config.location;
        var portletParams = config.portletParams;
        var settingsId = config.settingsId;
        var category = config.category;
        var description = config.description;
		var compName = config.compName;
		var isInPCT = config.isInPCT;
		var title = isInPCT ? "Publish as Portlet" : "Publish Portlet To Progress Control Tower";





        com.actional.serverui.exporttocontroltower.PublishForm.superclass.constructor.call(this, Ext.applyIf(config, {
            labelWidth: 200, 
            frame: false,
            bodyStyle: 'padding:5px 5px 0;border:0',
            title: title,
            defaults: {
                width: 400
            },
            defaultType: 'textfield',
            standardSubmit: true,
            method: 'POST',
            items: [{
				fieldLabel: 'Portlet Name',
				name: 'compName',
				id: 'compName',
				allowBlank: false,
				value: compName
			},{
				fieldLabel: 'Portlet Category',
				name: 'appName',
				id: 'appName',
				allowBlank: false,
				value: category,
				style: {
					marginTop: 2
				}
			}, new Ext.form.TextArea({
                fieldLabel: 'Description',
                name: 'description',
                id: 'description',
                allowBlank: true,
                value: description,
        		style: {
                    marginTop: 20
                },
				labelStyle: "margin-top: 20px"
            }), {
                xtype: 'hidden',
                name: 'pageid',
                id: 'pageid',
                value: 'exportportlet'
            }, {
                xtype: 'hidden',
                name: 'height',
                id: 'height'
            }, {
                xtype: 'hidden',
                name: 'urlfield',
                id: 'urlfield',
                value: portletUrl
            }, {
                xtype: 'hidden',
                name: "settingsId",
                id: "settingsId",
                value: settingsId
            }, {
                xtype: 'hidden',
                name: "location",
                id: "location",
                value: location
            }, {
                xtype: 'hidden',
                name: "portletParams",
                id: "portletParams",
                value: portletParams
            }, {
                xtype: 'hidden',
                name: "compNameForJavaScript",
                id: "compNameForJavaScript",
                value: ""
            }, {
        	xtype: 'hidden',
        	name: 'pt',
        	value: config.pt
            }, {
        	xtype: 'hidden',
        	name: 'isSummaryGraph',
        	value: config.isSummaryGraph
            }]
        }));
    }
});
