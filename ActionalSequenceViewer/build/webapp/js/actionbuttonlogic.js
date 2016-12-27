





















var ABL = {
	

	buttonMouseOver: function(elem)
	{
		if(!ABL.isEnabled(elem))
			return false;
		ABL.setABContextForButtonElem(elem);
		ABL.setPseudoClass(elem, "hover");
		return true;
	},

	buttonMouseOut: function(elem)
	{
		if(!ABL.isEnabled(elem))
			return false;
		ABL.setABContextForButtonElem(elem);
		ABL.setPseudoClass(elem, "normal");
		return true;
	},

	buttonMouseDown: function(elem)
	{
		if(!ABL.isEnabled(elem))
			return false;
		ABL.setABContextForButtonElem(elem);
		ABL.setPseudoClass(elem, "push");
		return true;
	},

	buttonMouseUp: function(elem)
	{
		if(!ABL.isEnabled(elem))
			return false;
		ABL.setABContextForButtonElem(elem);
		ABL.setPseudoClass(elem, "hover");
		return true;
	},

	buttonKeyDown:function(elem, evt)
	{
		if(!ABL.isEnabled(elem))
			return false;
		if (evt && evt.keyCode==32)
		{
			ABL.setABContextForButtonElem(elem);
			ABL.setPseudoClass(elem, "push");
		}
		return true;
	},

	buttonKeyUp: function(elem, evt)
	{
		if(!ABL.isEnabled(elem))
			return false;
		var currKeyCode = evt ? evt.keyCode : event.keyCode;
		if (evt.keyCode==32)
		{
			ABL.setABContextForButtonElem(elem);
			ABL.setPseudoClass(elem, "normal");
			return true;
		}
		else
			return false;
	},

	buttonBlur: function(elem, evt)
	{
		ABL.setPseudoClass(elem, "normal");
	},

	setPseudoClass: function (elem, pseudo)
	{
		var currentName = elem.className;
		var pos = currentName.lastIndexOf('_');
		if(pos <= 0)
		{
			
			elem.className = ABL.legacyPseudoClassMap[pseudo];
			return;
		}

		var prefix = currentName.substring(0,pos);
		elem.className = prefix + '_' + pseudo;
	},

	getPseudoClass: function(elem)
	{
		var className = elem.className;
		var pos = className.lastIndexOf('_');
		if(pos <= 0)
		{
			
			return ABL.legacyPseudoClassMap[className];
		}

		return className.substr(pos+1);
	},

	isEnabled: function(elem)
	{
		return ABL.getPseudoClass(elem) != 'disabled';
	},

	setEnabledState: function(menuId, enabled)
	{
		var elem = document.getElementById(menuId);

	    	if(elem && ABL.isEnabled(elem) != enabled)
			ABL.setPseudoClass(elem, enabled ? 'normal' : 'disabled');
	},

	setABContextForButtonElem: function(buttonelem)
	{
		if(!ABL.ABContext)
		{
			ABL.ABContext = ABL.createNewContext(buttonelem);
		}

		if(buttonelem.id != ABL.ABContext.id)
		{
			ABL.ABContext = ABL.createNewContext(buttonelem);
		}
	},

	
	
	
	
	initButtonHandlers: function(buttonelem_id, buttonaction)
	{
		var buttonelem = document.getElementById(buttonelem_id);
		if (!buttonelem)
			return false;

		buttonelem.onmouseover = function() { if (typeof ABL != 'undefined') ABL.buttonMouseOver(this); };
		buttonelem.onmouseout = function() { if (typeof ABL != 'undefined') ABL.buttonMouseOut(this); };
		buttonelem.onmousedown = function(){ if (typeof ABL != 'undefined') ABL.buttonMouseDown(this); };
		buttonelem.onmouseup = function(){ if (typeof ABL != 'undefined' && ABL.buttonMouseUp(this)) { eval(buttonaction + ";");} };
		buttonelem.onkeydown = function(evt){ if (typeof ABL != 'undefined') ABL.buttonKeyDown(this, ABL.getEvent(evt));};
		buttonelem.onkeyup = function(evt){ if (typeof ABL != 'undefined' && ABL.buttonKeyUp(this, ABL.getEvent(evt))) { eval(buttonaction + ";");} };
		buttonelem.onblur = function(evt) { if (typeof ABL != 'undefined') ABL.buttonBlur(this, ABL.getEvent(evt)); };
		return true;
	},

	createNewContext: function(buttonelem)
	{
		var ctx = new Object();
		ctx.id = buttonelem.id;
		ctx.button = buttonelem;
		ctx.popup = document.getElementById(ctx.id + "_popup");

		return ctx;
	},

	legacyPseudoClassMap: {button: 'normal', normal:'button',
				buttonhover: 'hover', hover:'buttonhover',
				buttondisabled:'disabled', disabled:'buttondisabled',
				buttonpush:'push', push:'buttonpush' },

	getEvent: function(evt)
	{
		if (typeof evt != "undefined")
			return evt;	
		else if (typeof event != "undefined")
			return event;	
		else
			return null;
	}
};
