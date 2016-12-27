

















Ext.namespace('com.actional.serverui');

/**
 *
 * @class com.actional.serverui.DisplayTypeCombo
 * @extends Ext.form.ComboBox
 *
 * @lastrev fix38156 - new class
 */
com.actional.serverui.DisplayTypeCombo = Ext.extend(Ext.form.ComboBox,
{
	itsNameComboStore : null,

	constructor: function(config)
	{
		var typeList = com.actional.DataStore.displaytypes.getDisplayTypesList();

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

			data : {rows:typeList, total:typeList.length}
		});

		com.actional.serverui.DisplayTypeCombo.superclass.constructor.call(this, Ext.applyIf(config,
		{
			store: this.itsNameComboStore,
			mode: 'local',
			displayField: 'name',
			valueField: 'id',
			iconClsField: 'iconstyle',
			typeAhead: true,
			triggerAction: 'all',
			editable: false,
			forceSelection: true,

			listeners:
			{
				render: function()
			        {
					var wrap = this.el.up('div.x-form-field-wrap');
					wrap.applyStyles({position:'relative'});
					this.el.addClass('act-icon-combo-input');
					this.icon = Ext.DomHelper.append(wrap,
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

	setIconCls: function()
	{
		var rec = this.itsNameComboStore.getById(this.getValue());
		if(rec)
		{
			this.icon.className = 'act-icon-combo-icon ' + rec.get(this.iconClsField);
		}
		else
		{
			this.icon.className = '';
		}
	},

	setValue: function(value)
	{
		com.actional.serverui.DisplayTypeCombo.superclass.setValue.call(this, value);
		this.setIconCls();
	}
});

Ext.reg('com.actional.serverui.DisplayTypeCombo', com.actional.serverui.DisplayTypeCombo);
