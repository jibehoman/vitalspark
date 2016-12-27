

















Ext.namespace('com.actional.serverui');

/**
 *
 * @class com.actional.serverui.AgentPickerList
 * @extends Ext.form.ComboBox
 *
 * @lastrev fix38877 - new class
 */
com.actional.serverui.AgentPickerList = Ext.extend(Ext.form.ComboBox,
{
	itsNameComboStore : null,
	itsIcon : null,

	constructor: function(config)
	{
		if(!config)
			config = {};
		
		var agentList = com.actional.DataStore.agentlist.getAgentList();

		
		agentList.unshift(com.actional.serverui.AgentPickerList.itemAll);

		this.itsNameComboStore = new Ext.data.JsonStore(
		{
			idProperty: 'id',
			root: 'rows',
			fields :
				[{
					name : 'id'
				},
				{
					name : 'iconstyle'
				},
				{
					name : 'name'
				}],

			data : {rows:agentList, total:agentList.length}
		});

		com.actional.serverui.AgentPickerList.superclass.constructor.call(this, Ext.applyIf(config,
		{
			store: this.itsNameComboStore,
			mode: 'local',
			displayField: 'name',
			valueField: 'id',
			iconClsField: 'iconstyle',
			typeAhead: true,
			triggerAction: 'all',
			editable: true,
			forceSelection: true,

			listeners:
			{
				render: function()
			        {
					var wrap = this.el.up('div.x-form-field-wrap');
					wrap.applyStyles({position:'relative'});
					this.el.addClass('act-icon-combo-input');
					this.itsIcon = Ext.DomHelper.append(wrap,
					{
						tag: 'div', style:'position:absolute'
					});
			        }
			},
			scope: this
		}));

		this.tpl = '<tpl for="."><div class="x-combo-list-item' +
				' act-icon-combo-item {' +
				this.iconClsField +
				'}">{' +
				this.displayField +
				'}</div></tpl>';
	},

	updateIconCls: function()
	{
		if(!this.itsIcon)
			return;
		
		var rec = this.itsNameComboStore.getById(this.getValue());
		if(rec)
		{
			this.itsIcon.className = 'act-icon-combo-icon ' + rec.get(this.iconClsField);
		}
		else
		{
			this.itsIcon.className = '';
		}
	},

	setValue: function(value)
	{
		com.actional.serverui.AgentPickerList.superclass.setValue.call(this, value);
		this.updateIconCls();
	}
});

com.actional.serverui.AgentPickerList.itemAll = {id:'*',iconstyle:'act-icon-combo-all',name:'All Interceptors'};

com.actional.serverui.AgentPickerList.getAgent = function(id)
{
	if(id == '*')
		return com.actional.serverui.AgentPickerList.itemAll;
	
	return com.actional.DataStore.agentlist.getAgent(id);
};

Ext.reg('com.actional.serverui.AgentPickerList', com.actional.serverui.AgentPickerList);
