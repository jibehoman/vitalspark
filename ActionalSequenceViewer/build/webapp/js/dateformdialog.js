

















Ext.namespace('com.actional.serverui.timemanagement');

/**
 * The form panel dialog which has the From, To date fields inside a dialog.
 * It pops up over the from/to date fields so that its 'from' textfield lies exactly
 * on top of 'from' textfield  of date form
 *
 * @class com.actional.serverui.timemanagement.DateFormDialog
 * @extends Ext.Window
 *
 * @lastrev fix36813 - decrease the width of textfields as it causes layout issues with IE.
 */
com.actional.serverui.timemanagement.DateFormDialog = Ext.extend(Ext.Window,
{
	constructor: function(config)
	{
		config = config || {};
		com.actional.serverui.timemanagement.DateFormDialog.superclass.constructor.call(this,Ext.applyIf(config,
		{
			draggable: false,
			resizable: false,
			animCollapse: false,
			layout: 'form',
			modal: true,
			width: 215,
			closeAction: 'hide',
			plain: true,
			items:
			[
				{
					xtype: 'form',
					border: false,
					bodyStyle: 'padding: 5px',
				        labelWidth: 30,
				        defaults:
				        {
						width: 145,
						allowBlank: false
					},
				        
				        itemCls : 'x-form-margin-item',
				        defaultType: 'com.actional.util.SelectionTextField',
				        items:
				        [
				        	{
				                	fieldLabel: 'From',
				                	name: 'DateFormDialog.fromDate',
				                	id: 'DateFormDialog.fromDate',
				                	to:'DateFormDialog.toDate', 
				                	vtype: 'fromToDates',
				                	validateOther: true,
				                	listeners:
							{
								specialkey: this.enterHandler,
								scope: this
							}
				            	},
				            	{
				                	fieldLabel: 'To',
				                	name: 'DateFormDialog.toDate',
				                	id: 'DateFormDialog.toDate',
				                	from:'DateFormDialog.fromDate', 
				                	vtype: 'fromToDates',
				                	validateOther: true,
				                	listeners:
							{
								specialkey: this.enterHandler,
								scope: this
							}
				            	}
					]
				}
			],
	                buttons:
	                [
		                {
		                	id: 'DateFormDialog.ok',
		                	text: 'OK',
		                	handler: this.onOk,
		                	scope: this
		                },
		                {
		                	id: 'DateFormDialog.cancel',
		                	text: 'Cancel',
		                	handler: this.onCancel,
		                	scope: this

		                }
	                ],
	                listeners:
	                {
				render: this.init,
				show: this.showListener,
				scope:this
	                }
		}));
	},

	
	init: function()
	{
		this.mask.on('click', this.onCancel, this);
		
		this.mask.setStyle('opacity', 0);

		this.dateFormFromField = Ext.getCmp(this.fromDateId);
		this.dateFormToField = Ext.getCmp(this.toDateId);

		this.dialogFromDateField = this.findById('DateFormDialog.fromDate');
		this.dialogToDateField = this.findById('DateFormDialog.toDate');

		this.dialogFromDateField.on('valid', this.onValidTextfield, this);
		this.dialogFromDateField.on('invalid', this.onInValidTextfield, this);

		this.dialogToDateField.on('valid', this.onValidTextfield, this);
		this.dialogToDateField.on('invalid', this.onInValidTextfield, this);

		
		
		Ext.getCmp(this.controlPanelId).on('move', this.moveListener, this);
	},

	/**
	 * if from/to textfields have a valid value then enable the 'ok' button
	 *
	 * private
	 */
	onValidTextfield: function(textfield)
	{
		if (textfield.id == 'DateFormDialog.fromDate')
		{
			this.fromDateFieldIsValid = true;
		}
		else if (textfield.id == 'DateFormDialog.toDate')
		{
			this.toDateFieldIsValid = true;
		}

		this.updateOkButton();
	},

	/**
	 * if from field / to field has invalid value then disable the 'ok' button
	 *
	 * private
	 */
	onInValidTextfield: function(textfield)
	{
		if (textfield.id == 'DateFormDialog.fromDate')
		{
			this.fromDateFieldIsValid = false;
		}
		else if (textfield.id == 'DateFormDialog.toDate')
		{
			this.toDateFieldIsValid = false;
		}
		this.updateOkButton();
	},

	/**
	 * this method enables the 'ok' button if both from & to fields have valid value &
	 * disables them if they are invalid.
	 *
	 * private
	 */
	updateOkButton: function()
	{
		if (!this.okButton)
		{
			this.okButton = Ext.getCmp('DateFormDialog.ok');
		}

		if (this.hasValidFromAndToFields())
		{
			this.okButton.enable();
		}
		else
		{
			this.okButton.disable();
		}
	},

	/**
	 * this method returns true if both the from & to fields have a valid value
	 *
	 */
	hasValidFromAndToFields: function()
	{
		return this.fromDateFieldIsValid && this.toDateFieldIsValid;
	},

	/**
	 * this method repositions the dialog so that the from/to fields of this dialog are placed
	 * exactly over the from/to fields of the original form
	 *
	 * private
	 */
	rePositionDialog: function()
	{
		var dateFieldPosition = this.dateFormFromField.getPosition();

		var dialogDateFieldPosition = this.dialogFromDateField.getPosition();
		var dialogPosition = this.getPosition();

		var posX = dialogPosition[0] - (dialogDateFieldPosition[0] - dateFieldPosition[0]);
		var posY = dialogPosition[1] - (dialogDateFieldPosition[1] - dateFieldPosition[1]);

		this.setPagePosition(posX, posY);
	},

	/**
	 * This method is overwritten to focus one of the textfield's when the dialog is shown.
	 * By default it tries to focus the dialog which causes the selection in the text fields to be lost. So
	 * the default behavior is overwritten to focus the text-selected the textfield.
	 *
	 * The field selectedTextFieldType identifies textfield in which the text has been selected.
	 *
	 * @lastrev fix37009 - new method.
	 */
	focus: function()
	{
		if (this.selectedTextFieldType == 'to')
		{
			this.dialogToDateField.focus(false, true);
		}
		else
		{
			this.dialogFromDateField.focus(false, true);
		}
	},

	/**
	 * this method puts the focus the textfield based on the argument and also selects
	 * the text based on the start/end values provided in the arguments
	 *
	 * @lastrev fix37009 - signature updated.
	 */
	grabFocus: function(caretStart, caretEnd)
	{
		if (this.selectedTextFieldType == 'from')
		{
			this.dialogFromDateField.focus(false, true);
			this.dialogFromDateField.selectText(caretStart, caretEnd);
		}
		else if (this.selectedTextFieldType == 'to')
		{
			this.dialogToDateField.focus(false, true);
			this.dialogToDateField.selectText(caretStart, caretEnd);
		}
	},

	/**
	 * this method ensures that the dialog is correctly positioned when it is shown
	 * and updates the values of the dialog from/to fields to values of from/to fields
	 * of the DateForm
	 */
	showListener: function()
	{
		this.rePositionDialog();

		this.dialogFromDateField.setRawValue(this.dateFormFromField.getValue());
		this.dialogToDateField.setRawValue(this.dateFormToField.getValue());

		this.dialogFromDateField.validate();
	},

	
	enterHandler: function(textfield, e)
	{
		if(e.getKey() == e.ENTER)
		{
			this.onOk();
		}
	},

	/**
	 * @lastrev fix35988 - value -> date -> TDate. This TDate's millis is used for publishing the event
	 */
	onOk: function()
	{
		
		
		var rawD1 = this.dialogFromDateField.getRawValue();
		var d1 = com.actional.serverui.timemanagement.dateFromString(rawD1);
		var rawD2 = this.dialogToDateField.getRawValue();
		var d2 = com.actional.serverui.timemanagement.dateFromString(rawD2);

		
		if (d1)
		{
			d1 = com.actional.util.TDateBridge.dateToTDate(d1, rawD1.toUpperCase().indexOf("TODAY") > -1);
		}

		if (d2)
		{
			d2 = com.actional.util.TDateBridge.dateToTDate(d2, rawD2.toUpperCase().indexOf("TODAY") > -1);
		}


		if(d1 && d2 &&  d2.getTime() > d1.getTime() && this.hasValidFromAndToFields())
		{
			OpenAjax.hub.publish('com.actional.serverui.timeSelectionChanged',
			{
				selection_t0: d1.getTime(),
				selection_t1: d2.getTime(),
				source: 'dateformDialog'
				
			});

			
			this.hide();
		}
	},

	
	onCancel: function()
	{
		this.hide();
	},

	moveListener: function(panel, x, y)
	{
		this.rePositionDialog();
	}
});