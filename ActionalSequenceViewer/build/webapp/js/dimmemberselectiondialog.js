


















Ext.ns('com.actional.serverui');

/**
 * This Dialog renders the dimension members of the given dimension Id. It renders them in a Ext.Window.
 *
 * @lastrev fix38039 - new class.
 */
com.actional.serverui.DimMemberSelectionDialog = Ext.extend(Ext.Window,
{
	/**
	 * @cfg {function} okHandler
	 * This method is called with the selected dimMemberId as the parameter when the "Ok" button of
	 * the window is pressed.
	 */

	constructor: function(config)
	{
		var sm = new Ext.grid.RowSelectionModel(
		{
			singleSelect: true,
			listeners:
			{
				selectionchange: this.onRowSelection,
				scope: this
			}
		});

		com.actional.serverui.DimMemberSelectionDialog.superclass.constructor.call(this, Ext.applyIf(config,
		{
			title: '...',
			modal: true,
			height: 400,
			width: 600,
			closeAction: 'hide',
			layout: 'fit',
			items:
			[
				{
					xtype: 'grid',
					title: '...',
					ref: 'selectionGrid',
					store: new Ext.data.JsonStore(
					{
						url: contextUrl('portal/dimmembers.jsrv'),
						root: 'dimMembers',
						idProperty: 'id',
						fields: ['id', 'name', 'description', 'value'],
						sortInfo:
						{
							field: 'name',
							direction: 'ASC'
						}
					}),
					colModel: new Ext.grid.ColumnModel(
					{
						columns:
						[
							{
								header: 'Name',
								width: 150,
								sortable: true,
								dataIndex: 'name'
							},
							{
								header: 'Description',
								width: 150,
								sortable: false,
								dataIndex: 'description'
							},
							{
								header: 'Value',
								width: 300,
								sortable: false,
								dataIndex: 'value'
							}
						]
					}),
					viewConfig:
					{
						forceFit: true
					},
					sm: sm,
					loadMask: true
				}
			],
			buttons:
			[
				{
					text: 'Ok',
					ref: '../okButton',
					disabled: true,
					handler: this.onOkClicked.createDelegate(this)
				},
				{
					text: 'Cancel',
					handler: this.hide.createDelegate(this, [])
				}
			]
		}));
	},

	updateDimensionAndShow: function(dimId, dimName)
	{
		this.dimId = dimId;
		this.selectionGrid.getStore().setBaseParam('id', dimId);
		this.selectionGrid.getStore().load({});
		this.setTitle('Choose a ' + dimName + ' to filter by');
		this.selectionGrid.setTitle(dimName + ' Members');
		this.show();
	},

	onRowSelection: function(sm)
	{
		if (sm.getSelected())
		{
			this.selectedRowId = sm.getSelected().get('id');
			this.okButton.enable();
		}
		else
		{
			this.okButton.disable();
		}
	},

	onOkClicked: function()
	{
		this.okHandler.call(this, this.selectedRowId);
	}
});

Ext.reg('com.actional.serverui.DimMemberSelectionDialog', com.actional.serverui.DimMemberSelectionDialog);
