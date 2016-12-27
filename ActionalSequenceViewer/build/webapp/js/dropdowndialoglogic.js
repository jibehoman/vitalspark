































var DDD = {
	

	buttonMouseOver: function(elem)
	{
		if(!DDD.isEnabled(elem))
			return true;

		if(DDD.isContextOnDifferentElem(elem))
		{
			DDD.setPseudoClass(elem, "hover");
			return true;
		}

		DDD.setDDContextForButtonElem(elem);

		DDD.DDContext.mouseInsideButton = true;
		DDD.AbortDelayedDropdownAbort();

		if(DDD.isPopupShowing())
			DDD.setPseudoClass(elem, "push");
		else
			DDD.setPseudoClass(elem, "hover");

		return true;
	},

	buttonMouseOut: function(elem)
	{
		if(!DDD.isEnabled(elem))
			return true;

		if(DDD.isContextOnDifferentElem(elem))
		{
			DDD.setPseudoClass(elem, "normal");
			return true;
		}

		DDD.setDDContextForButtonElem(elem);

		DDD.DDContext.mouseInsideButton = false;

		if(DDD.DDContext.popup)
		{
			if(!DDD.isComboboxClicked() && !DDD.DDContext.popup.containsComboBoxId && !DDD.DDContext.popup.autoHideDisabled)
				DDD.DelayedDropdownAbort();
		}



		if(DDD.isPopupShowing())
			DDD.setPseudoClass(elem, "push");
		else
			DDD.setPseudoClass(elem, "normal");

		return true;
	},

	buttonMouseDown: function(elem)
	{
		if(!DDD.isEnabled(elem))
			return false;

		DDD.setDDContextForButtonElem(elem);

		DDD.DDContext.mouseInsideButton = true;

		if(DDD.isPopupShowing())
		{
			DDD.hidePopup();
			DDD.setPseudoClass(elem, "hover");
		}
		else
			DDD.dropdownShow();

		return true;
	},

	buttonKeyUp:function(elem, evt)
	{
		if(!DDD.isEnabled(elem))
			return false;
	},

	buttonKeyDown:function(elem, evt)
	{
		
		if (evt.keyCode==32)
		{

			DDD.setDDContextForButtonElem(elem);
			DDD.setPseudoClass(elem, "pushed");

			if(DDD.isPopupShowing())
			{
				DDD.hidePopup();
				DDD.setPseudoClass(elem, "normal");
			}
			else
				DDD.dropdownShow();

			return true;
		}
		return true;
	},

	buttonBlur: function(elem, evt)
	{
		if(DDD.isPopupShowing() && !DDD.isMouseInsidePopup() && !DDD.isMouseInsideButton())
		{
			DDD.hidePopup();	
			DDD.setPseudoClass(elem, "normal");
		}
	},

	

	popupMouseOver: function(elem)
	{
		if(DDD.DDContext /*&& DDD.DDContext.popup.id == elem.id*/)
		{
			DDD.DDContext.mouseInsidePopup = true;
			DDD.AbortDelayedDropdownAbort();
		}

		return true;
	},

	popupMouseOut: function(elem, NoDelayedAbort)
	{
		if(DDD.DDContext)
		{
			DDD.DDContext.mouseInsidePopup = false;
			if(!NoDelayedAbort && !DDD.isComboboxClicked())
				DDD.DelayedDropdownAbort();
		}

		return true;
	},

	

	bodyMouseDown: function(e)
	{
		
		var srcelem = (e.target) ? e.target : e.srcElement;
		if(DDD.DDContext && DDD.DDContext.popup &&
				    DDD.DDContext.popup.containsComboBoxId &&
				    DDD.DDContext.popup.containsComboBoxId(srcelem.id))
		{
			DDD.DDContext.comboboxClicked = true;
			DDD.AbortDelayedDropdownAbort();
			return true;
		}

		if(!DDD.isMouseInsidePopup() && !DDD.isMouseInsideButton())
		{
			DDD.hidePopup();
		}

		return true;
	},

	
	hidePopup: function()
	{
		if(!DDD.DDContext)
			return;

		DDD.AbortDelayedDropdownAbort();

		if(DDD.DDContext.popup)
			DDD.DDContext.popup.style.display = "none";

		
		
		
		
		if (Utils_isIE && typeof DDD.DDContext.iframe != 'undefined')
		{
			DDD.DDContext.iframe.style.display = "none";
		}

		if(DDD.DDContext.button)
			DDD.setPseudoClass(DDD.DDContext.button, "normal");

		DDD.DDContext = null;
	},

	dropdownNewContext: function(buttonelem)
	{
		var ctx = new Object();
		ctx.id = buttonelem.id;
		ctx.button = buttonelem;
		ctx.popup = document.getElementById(ctx.id + "_popup");
		ctx.popup.style.zIndex = 25;

		return ctx;
	},

	isContextOnDifferentElem: function(buttonelem)
	{
		if(!DDD.DDContext || DDD.DDContext.id != buttonelem.id)
			return true;

		return false;
	},

	setDDContextForButtonElem: function(buttonelem)
	{
		if(!DDD.DDContext)
		{
			DDD.DDContext = DDD.dropdownNewContext(buttonelem);
		}

		if(buttonelem.id != DDD.DDContext.id)
		{
			DDD.hidePopup();
			DDD.DDContext = DDD.dropdownNewContext(buttonelem);
		}
	},

	isMouseInsidePopup: function()
	{
		if(!DDD.DDContext)
			return false;

		if(DDD.DDContext.mouseInsidePopup)
			return true;

		return false;
	},

	isComboboxClicked: function()
	{
		if(!DDD.DDContext)
			return false;

		if(DDD.DDContext.comboboxClicked)
			return true;

		return false;
	},

	isMouseInsideButton: function()
	{
		if(!DDD.DDContext)
			return false;

		if(DDD.DDContext.mouseInsideButton)
			return true;

		return false;
	},

	isPopupShowing: function()
	{
		if(!DDD.DDContext)
			return false;

		if(!DDD.DDContext.popup)
			return false;

		if(DDD.DDContext.popup.style.display == "")
			return true;

		return false;
	},

	dropdownShow: function()
	{
		if(!DDD.DDContext)
			return;

		if(!DDD.DDContext.button || !DDD.DDContext.popup)
			return;

		DDD.setPseudoClass(DDD.DDContext.button, "push");

		if(!DDD.DDContext.popup.firstTimeInit && DDD.DDContext.popup.oninit)
		{
			DDD.DDContext.popup.firstTimeInit = true;
			DDD.DDContext.popup.oninit.call(DDD.DDContext.popup);
		}

		DDD.DDContext.popup.style.position = "absolute";
		DDD.DDContext.popup.style.left = "0px";
		DDD.DDContext.popup.style.visibility = "hidden";
		DDD.DDContext.popup.style.display = "";

		var buttonrect = getRect(DDD.DDContext.button);
		var popuprect = getRect(DDD.DDContext.popup);

		var top = buttonrect.top + buttonrect.height;
		var left = buttonrect.left + buttonrect.width - popuprect.width;

		var positionit = true;

		if(DDD.DDContext.popup.onshow)
		{
			var onshowcontext = {	top:top, left:left,
						popup: DDD.DDContext.popup, button: DDD.DDContext.button,
						buttonrect:buttonrect, popuprect:popuprect };

			positionit = DDD.DDContext.popup.onshow.call(DDD.DDContext.popup, onshowcontext);

			if(positionit)
			{
				top = onshowcontext.top;
				left = onshowcontext.left;
			}
		}

		if(positionit)
		{
			if(left < 5)
				left=5;

			DDD.DDContext.popup.style.top = "" + top + "px";
			DDD.DDContext.popup.style.left = "" + left + "px";
		}

		
		
		
		
		DDD.DDContext.popup.style.visibility = "visible";
		DDD.DDContext.popup.style.visibility = "hidden";
		if (Utils_isIE)
		{
			var iFrameElem;
			if (typeof DDD.DDContext.iframe != 'undefined')
				iFrameElem = DDD.DDContext.iframe;
			else
			{
				iFrameElem = document.createElement('iframe');
				iFrameElem.setAttribute('id',DDD.DDContext.id + '_frame');
				iFrameElem.setAttribute('scrolling','no');
				iFrameElem.setAttribute('frameborder','0');
				iFrameElem.setAttribute('src','javascript:false;');
				document.body.appendChild(iFrameElem);
				iFrameElem.style.zIndex = (0 + DDD.DDContext.popup.style.zIndex - 1);
				iFrameElem.style.position = 'absolute';
				iFrameElem.style.padding = '0px';
				iFrameElem.style.borderWidth = '0px';
			}

			iFrameElem.style.width = "" + DDD.DDContext.popup.offsetWidth + "px";
			iFrameElem.style.height = "" + DDD.DDContext.popup.offsetHeight + "px";
			iFrameElem.style.top = "" + top + "px";
			iFrameElem.style.left = "" + left + "px";

			DDD.DDContext.popup.style.top = "" + top + "px";

			iFrameElem.style.display = "block";
			DDD.DDContext.iframe = iFrameElem;
		}
		DDD.DDContext.popup.style.top = "" + top + "px";
		DDD.DDContext.popup.style.left = "" + left + "px";
		DDD.DDContext.popup.style.visibility = "visible";
	},

	AbortDelayedDropdownAbort: function()
	{
		if((DDD.DDContext) && (DDD.DDContext.timerid))
		{
			clearTimeout(DDD.DDContext.timerid);
			DDD.DDContext.timerid = null;
		}
	},

	DelayedDropdownAbort: function()
	{
		if(DDD.DDContext)
			DDD.DDContext.timerid = setTimeout("DDD.hidePopup()", 2000);
	},

	setPseudoClass: function (elem, pseudo)
	{
		var currentName = elem.className;
		var pos = currentName.lastIndexOf('_');
		if(pos <= 0)
		{
			
			elem.className = DDD.legacyPseudoClassMap[pseudo];
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
			
			return DDD.legacyPseudoClassMap[className];
		}

		return className.substr(pos+1);
	},

	isEnabled: function(elem)
	{
		return DDD.getPseudoClass(elem) != 'disabled';
	},

	setEnabledState: function(menuId, enabled)
	{
		var elem = document.getElementById(menuId);

	    	if(elem && DDD.isEnabled(elem) != enabled)
			DDD.setPseudoClass(elem, enabled ? 'normal' : 'disabled');
	},

	
	
	
	initButtonHandlers: function(buttonelem_id)
	{
		var buttonelem = document.getElementById(buttonelem_id);
		if (!buttonelem)
			return false;

		buttonelem.onmouseover = function() { if (typeof DDD != 'undefined') DDD.buttonMouseOver(this); };
		buttonelem.onmouseout = function() { if (typeof DDD != 'undefined') DDD.buttonMouseOut(this); };
		buttonelem.onmousedown = function(){ if (typeof DDD != 'undefined') DDD.buttonMouseDown(this); };
		buttonelem.onkeydown = function(evt){ if (typeof DDD != 'undefined') DDD.buttonKeyDown(this, DDD.getEvent(evt)); };
		buttonelem.onkeyup = function(evt){ if (typeof DDD != 'undefined') DDD.buttonKeyUp(this, DDD.getEvent(evt)); };
		buttonelem.onblur = function(evt) { if (typeof DDD != 'undefined') DDD.buttonBlur(this, DDD.getEvent(evt)); };
		return true;
	},

	
	
	
	initPopupHandlers: function(popupelem_id)
	{
		var popupelem = document.getElementById(popupelem_id);
		if (!popupelem)
			return false;

		var mouseover_fn = function(evt){ return DDD.popupMouseOver(this); };
		var mouseout_fn = function(evt){ return DDD.popupMouseOut(this); };

		if (Utils_isIE)
		{
			popupelem.onmouseenter = mouseover_fn;
			popupelem.onmouseleave = mouseout_fn;
		}
		else
		{
			popupelem.addEventListener("mouseover", mouseover_fn, true);
			popupelem.addEventListener("mouseout", mouseout_fn, true);
		}
		return true;
	},

	legacyPseudoClassMap: {button: 'normal', normal:'button',
				buttonhover: 'hover', hover:'buttonhover',
				buttondisabled:'disabled', disabled:'buttondisabled',
				buttonpush:'push', push:'buttonpush' },

	DDContext: null,

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
