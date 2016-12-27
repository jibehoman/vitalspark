

















Ext.namespace('com.actional.serverui');

/**
 *
 * @class com.actional.serverui.DashboardOptionsTab
 * @extends com.actional.serverui.OptionsTab
 */

var MYVIEWCOLUMNCOUNT_PROPERTY 	= "MyView_ColumnCount";

com.actional.serverui.DashboardOptionsTab = Ext.extend(com.actional.serverui.OptionsTab,
{
	itsNbColumns : 3,

	/**
	 * @lastrev fix36714 - make the column combo box non editable.
	 */
	constructor: function(config)
	{
		
		this.itsEventSourceName = 'dashboardoptionstab';
		this.itsTabName = (config.tabName) ? config.tabName : 'Display';
		this.itsNbColumns = config.nbCols;

		
		var column_store = new Ext.data.SimpleStore({
					autoDestroy: true,
					idIndex: 0,
					fields:
					[
						'text',
						{
							name: 'nb',
							type: 'int'
						}
					],
					data :
					[
						['1 column',  1],
						['2 columns', 2],
						['3 columns', 3],
						['4 columns', 4],
						['5 columns', 5],
						['6 columns', 6],
						['7 columns', 7],
						['8 columns', 8],
						['9 columns', 9],
						['10 columns', 10]
					]});

		var column_combo = new Ext.form.ComboBox({
					id: 'nbcols',
					store: column_store,
					fieldLabel: 'Number of columns',
					displayField: 'text',
					valueField: 'nb',
					value: this.itsNbColumns,
					width: 100,
					forceSelection: true,
					triggerAction: 'all',
					mode: 'local',
					listeners:
					{
						'select' : function()
						{
							this.itsIsModified = true;
							this.itsDialog.enableOkOnly();
						},
						scope: this
					},
					editable : false
		});

		com.actional.serverui.DashboardOptionsTab.superclass.constructor.call(this, Ext.applyIf(config,
		{
			id: 'dashboard-options-tab',
			title: this.itsTabName,
			layout: 'form',

			items: function()
			{
				var items = [ column_combo ];
				return items;
			}.call(this)
		}));
	},

	saveSettings : function()
	{
		if(!this.itsIsModified)
			return;

		
		var val = this.safeGetCmpValue('nbcols');
		if((val != null) && (val != this.itsNbColumns))
		{
			this.itsNbColumns = val;

			var url = window.location.href.split("?", 1)[0] + "?setcolumncount=" + this.itsNbColumns;
			window.location = url;
		}
	},

	revertSettings : function()
	{
		
		this.setCmpValue('nbcols', this.itsNbColumns);
	}
});

Ext.reg('com.actional.serverui.DashboardOptionsTab', com.actional.serverui.DashboardOptionsTab);
