

















Ext.namespace('com.actional.serverui');

/** @lastrev fix36355 - new control */
com.actional.serverui.BPStateSelect = Ext.extend(com.actional.serverui.EnhancedCombo,
{
	constructor: function(config)
	{
		var search_ds = new Ext.data.JsonStore({
			url: contextUrl('admin/bpstateselect.jsrv'),
			root: 'rows',
			idProperty: 'id',
			fields: [
				{name: 'id'},
				{name: 'sectionheader'},
				{name: 'statename'},
				{name: 'summarytext'},
				{name: 'bptype'},
				{name: 'bpname'},
				{name: 'bpdescription'}
			]
		});

		
		var resultTpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<tpl if="sectionheader" >',
					'<div class="search-separator">',
						'<b>{bpname}</b>',
						'<tpl if="bptype || bpdescription" >',
							'&nbsp;&bull;&nbsp;<i>',
						'</tpl>',
						'<tpl if="bptype" >',
							'{bptype}',
						'</tpl>',
						'<tpl if="bptype && bpdescription" >',
							'&nbsp;&bull;&nbsp;',
						'</tpl>',
						'<tpl if="bpdescription" >',
							'{bpdescription}',
						'</tpl>',
						'<tpl if="bptype || bpdescription" >',
							'</i>',
						'</tpl>',
					'</div>',
				'</tpl>',
				'<tpl if="!sectionheader" >',
					'<div class="x-combo-list-item">',
						'<tpl if="id==KEYID_FOR_NONE" >',
							'<i>&lt;None&gt; (no limitation)</i>',
						'</tpl>',
						'<tpl if="id!=KEYID_FOR_NONE" >',
							'{statename}',
						'</tpl>',
					'</div>',
				'</tpl>',
			'</tpl>',
			{
				disableFormats: true,
				compiled: true
			}
		);

		com.actional.serverui.BPStateSelect.superclass.constructor.call(this, Ext.applyIf(config,
		{
			mode: 'remote',
		        store: search_ds,

		        triggerAction: 'all',
		        displayField: 'summarytext',
		        inactiveRowFlag: 'sectionheader',
		        valueField: 'id',
		        editable: false,

		        width: 400,
		        loadingText: 'Please wait...',
		        maxHeight: 1000,
		        resizable: true,
		        tpl: resultTpl
		}));
	}
});

Ext.reg('com.actional.serverui.BPStateSelect', com.actional.serverui.BPStateSelect);
