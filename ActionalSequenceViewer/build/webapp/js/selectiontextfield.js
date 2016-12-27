

















Ext.namespace('com.actional.util');

/**
 * A custom textfield which has methods to retrieve the current
 * selected text range and clear the current selected text range
 *
 * @class com.actional.util.CustomTextField
 * @extends Ext.form.TextField
 *
 * @lastrev fix35768 - new class
 */
com.actional.util.SelectionTextField = Ext.extend(Ext.form.TextField,
{
	/**
	 * this method returns the position of the selected
	 *
	 * @return Array [start, end] start & end positions of the selected text; defaults to [0, 0]
 	 */
	getSelectionRange: function()
	{
		if (this.el && this.el.dom)
		{
			var tf = this.el.dom;
			var tfValueLength = tf.value.length;

			if (document.selection && document.selection.createRange) 
			{
				
				
				
				

				var range = document.selection.createRange();

				var start = 0, end = 0;
				var moved;

				moved = range.moveStart('character', -tfValueLength);
				range.moveStart('character', -moved);

				start = -moved;

				end = range.moveEnd('character', tfValueLength);
				range.moveEnd('character',-end);

				end = tfValueLength - end;

				return [start, end];
			}
			else if (tf.setSelectionRange) 
			{
				var readOnlyState = tf.readOnly;

				
				
				
				tf.readOnly = false;
				var range1 = [tf.selectionStart, tf.selectionEnd];

				
				tf.readOnly = readOnlyState;

				return range1;
			}
		}

		return [0, 0];
	},

	/**
	 * this method clears the selected text in this textfield
	 */
	clearSelection: function()
	{
		if (this.el && this.el.dom)
		{
			var tf = this.el.dom;
			if (tf.setSelectionRange)
			{
				tf.setSelectionRange(0, 0);
			}
			else if (document.selection && document.selection.createRange)
			{
				var range = document.selection.createRange();

				var tfValueLength = tf.value.length;

				range.moveStart('character', -tfValueLength);
				range.moveEnd('character', -tfValueLength);
				range.select();
			}
		}
	}
});

Ext.reg('com.actional.util.SelectionTextField', com.actional.util.SelectionTextField);