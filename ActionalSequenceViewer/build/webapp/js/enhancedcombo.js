

















Ext.namespace('com.actional.serverui');




/**
 * @class com.actional.serverui.EnhancedCombo
 * @extends Ext.form.ComboBox
 * @lastrev fix36813 - no need to overwrite the TriggerField.afterRender(...) method.
 */
com.actional.serverui.EnhancedCombo = Ext.extend(Ext.form.ComboBox,
{
	/**
	 * @cfg {Boolean} autoSelectOnLoad
	 *
	 * set to false to inhibit selecting an entry automatically after loading
	 */
	autoSelectOnLoad : true,

	/**
	 * @cfg {String} inactiveRowFlag
	 *
	 * Set to the name of a Field in the data Store whose value acts as a flag
	 * to select inactive rows. If the data resolves to true, the row will be inactive.
	 * This is typically used for inserting "headers rows".
	 *
	 * For this to work correctly, the combobox "template" must not emit
	 * html that contains an element with the 'itemSelector' class for the
	 * inactive rows.
	 */
	inactiveRowFlag : undefined,

	selectByValue : function(v, scrollIntoView)
	{
	        if(!Ext.isEmpty(v, true))
	        {
	            var r = this.findRecord(this.valueField || this.displayField, v);
	            if(r)
	            {
	                this.select(this.storeIndex2ViewIndex(this.store.indexOf(r)), scrollIntoView);
	                return true;
	            }
	        }
	        return false;
	},

	
	onLoad : function()
	{
		if(!this.hasFocus){
			return;
		}
		if(this.store.getCount() > 0){
			this.expand();
			this.restrictHeight();
			if(this.lastQuery == this.allQuery){
				if(this.editable){
					this.el.dom.select();
				}
				if(!this.selectByValue(this.value, true))
				{
					this.select(0, true);
				}
			}
			else
			{
				if(this.autoSelectOnLoad)
				{
					
					

					
					

					this.selectNext();
				}

	                	if(this.typeAhead && this.lastKey != Ext.EventObject.BACKSPACE && this.lastKey != Ext.EventObject.DELETE){
					this.taTask.delay(this.typeAheadDelay);
				}
			}
		}
		else
		{
			this.onEmptyResults();
		}
	},

	
	selectNext : function()
	{
		var ct = this.storeIndex2ViewIndex(this.store.getCount());

		if(ct > 0)
		{
			if(this.selectedIndex == -1)
			{
				this.select(0);
			}
			else if(this.selectedIndex < ct-1)
			{
				this.select(this.selectedIndex+1);
			}
		}
	},

	
	onViewClick : function(doFocus)
	{
		var viewIndex = this.view.getSelectedIndexes()[0];

		if(viewIndex == undefined)
		{
			
			return;
		}

		var storeIndex = this.viewIndex2StoreIndex(viewIndex);

		var r = this.store.getAt(storeIndex);
		if(r)
		{
			this.onSelect(r, viewIndex);
		}
		if(doFocus !== false)
		{
			this.el.focus();
		}
	},

	viewIndex2StoreIndex : function(index)
	{
		if(index < 0)
			return index;

		if(this.inactiveRowFlag)
		{
			var nbHeaders = 0;

			for(var i=0; i < this.store.getCount(); i++)
			{
				var elementHeader = this.store.getAt(i).get(this.inactiveRowFlag);

				if(elementHeader)
					nbHeaders++;

				if(i-nbHeaders == index)
				{
					break;
				}
			}

			index += nbHeaders;
		}

		return index;
	},

	storeIndex2ViewIndex : function(storeIndex)
	{
		if(storeIndex < 0)
			return storeIndex;

		var nbHeaders = 0;
		var viewIndex = storeIndex;

		if(this.inactiveRowFlag)
		{
			for(var i=0; i < this.store.getCount(); i++)
			{
				var elementHeader = this.store.getAt(i).get(this.inactiveRowFlag);

				if(elementHeader)
					viewIndex--;

				if(i == storeIndex)
				{
					break;
				}
			}
		}

		return viewIndex;
	}
});

Ext.reg('com.actional.serverui.EnhancedCombo', com.actional.serverui.EnhancedCombo);
