

















Ext.namespace('com.actional');


/**
 * @lastrev fix35882 - Path Explorer rendering enhancements. Add scrolling using "percentage" instead of position
 */
com.actional.CustomScrollbarFlash = Ext.extend(com.actional.Flash,
{
	itIsAwake : undefined,
	itsContentSize: undefined,

	/** if true, when resizing the content, the scrollbar position will stay
	 * at the same percentage instead of pixels */
	hasStablePercentageVertical: false,

	/** if true, when resizing the content, the scrollbar position will stay
	 * at the same percentage instead of pixels */
	hasStablePercentageHorizontal: false,

	itsScrollTop: undefined,
	itsScrollLeft: undefined,
	itsPercentVertical: 0,
	itsPercentHorizontal: 0,

	itsLastScrollTop: undefined,
	itsLastScrollLeft: undefined,
	itsLastPercentHorizontal: undefined,
	itsLastPercentVertical: undefined,

	constructor: function(config)
	{
		this.reset();

		com.actional.CustomScrollbarFlash.superclass.constructor.call(this, Ext.applyIf(config,
		{
		}));
	},

	reset: function()
	{
		this.itIsAwake = false;
		this.itsContentSize = {height : 10, width : 10};
		this.itsLastScrollTop = this.itsScrollTop = undefined;
		this.itsLastScrollLeft = this.itsScrollLeft = undefined;
		this.itsLastPercentVertical = this.itsPercentVertical = 0;
		this.itsLastPercentHorizontal = this.itsPercentHorizontal = 0;
	},

	/**
	 * @lastrev fix35559 - Path Explorer not showing in IE7
	 * 		modify creation ordering.
	 *		Create the Object (flash) on an dom object that
	 *		is already inserted in the document. Else flash
	 *		seems to "reset" or something like that under IE7.
	 */
	onRender: function(parent, position)
	{
		this.hideModeHack();

		var data = this.getTemplateData();

		var containerDiv = document.createElement('div');
		containerDiv.style.overflow = 'hidden';
		parent.dom.insertBefore(containerDiv, position);

		var tpl = this.getTemplate();

		
		tpl.overwrite(containerDiv, data, true);

		var ct_id = this.id;

		this.itsVScrollerElem = this.getVScrollerTemplate().append(containerDiv, {containerid:ct_id}, true);
		this.itsHScrollerElem = this.getHScrollerTemplate().append(containerDiv, {containerid:ct_id}, true);

		this.itsVScrollerElem.on(
		{
			'mouseover' : this.beginTrack,
			'mouseout'  : this.stopTrack,
			'mousemove' : this.syncContent,
			'mouseup'   : this.syncContent,
			'mousedown' : this.syncContent,
			scope: this
		});

		this.itsHScrollerElem.on(
		{
			'mouseover' : this.beginTrack,
			'mouseout'  : this.stopTrack,
			'mousemove' : this.syncContent,
			'mouseup'   : this.syncContent,
			'mousedown' : this.syncContent,
			scope: this
		});

		this.el = Ext.get(containerDiv);

		this.itsVScrollerElemSizer = Ext.get(ct_id+'_vscroller_sizer');
		this.itsHScrollerElemSizer = Ext.get(ct_id+'_hscroller_sizer');

		this.on('resize', this.containerResize);
	},

	
	
	setContentSize: function(w, h)
	{
		this.itIsAwake = true;

		this.itsContentSize = {width: w, height: h};

		this.rethinkScrollbars();
	},

	
	containerResize: function(thisEl, adjWidth, adjHeight, rawWidth, rawHeight )
	{
		this.rethinkScrollbars();
	},

	
	rethinkScrollbars: function()
	{
		var containerSize = this.getSize();

		
		
		

		var hasHScroller;
		var hasVScroller;

		
		var contentSize = this.itsContentSize;

		var scrollbarSize = computeScrollbarSize();

		if(contentSize.width <= containerSize.width)
		{
			if(contentSize.height <= containerSize.height)
			{
				
				
				hasHScroller = false;
				hasVScroller = false;
			}
			else
			{
				

				
				hasVScroller = true;

				if(contentSize.width > (containerSize.width - scrollbarSize.width))
				{
					
					
					hasHScroller = true;
				}
				else
				{
					hasHScroller = false;
				}
			}
		}
		else if(contentSize.height <= containerSize.height)
		{
			

			
			hasHScroller = true;

			if(contentSize.height > (containerSize.height - scrollbarSize.height))
			{
				
				
				hasVScroller = true;
			}
			else
			{
				hasVScroller = false;
			}
		}
		else
		{
			
			
			hasHScroller = true;
			hasVScroller = true;
		}

		
		
		
		

		var viewportheight;
		var hscrollerleft;
		var hscrollertop;

		if(hasHScroller)
		{
			viewportheight = containerSize.height - scrollbarSize.height;
			hscrollerleft = 0;
			hscrollertop = viewportheight;
		}
		else
		{
			viewportheight = containerSize.height;
			hscrollerleft = 0;
			hscrollertop = 0;
		}

		var viewportwidth;
		var vscrollerleft;
		var vscrollertop;

		if(hasVScroller)
		{
			viewportwidth = containerSize.width - scrollbarSize.width;
			vscrollerleft = viewportwidth;
			vscrollertop = 0;
		}
		else
		{
			viewportwidth = containerSize.width;
			vscrollerleft = 0;
			vscrollertop = 0;
		}

		
		
		
		

		if(hasHScroller)
		{
			this.itsHScrollerElem.applyStyles(
			{
				left: hscrollerleft,
				top: hscrollertop,
				width: viewportwidth,
				height: scrollbarSize.height,
				display: ''
			});

			if(this.hasStablePercentageHorizontal)
			{
				var leftpos = 0;

				if(contentSize.width > containerSize.width)
					leftpos = Math.round(this.itsPercentHorizontal * (contentSize.width - containerSize.width));

				this.itsHScrollerElem.dom.scrollLeft = leftpos;
			}

			this.itsHScrollerElemSizer.applyStyles(
			{
				width: contentSize.width,
				height: 1
			});
		}
		else
		{
			this.itsHScrollerElem.applyStyles(
			{
				left: 0,
				top: 0,
				width: 1,
				height: 1,
				display: 'none'
			});

			this.itsPercentHorizontal = 0;
			this.itsHScrollerElem.dom.scrollLeft = 0;

			this.itsHScrollerElemSizer.applyStyles(
			{
				width: 1,
				height: 1
			});
		}

		if(hasVScroller)
		{
			this.itsVScrollerElem.applyStyles(
			{
				left: vscrollerleft,
				top: vscrollertop,
				width: scrollbarSize.width,
				height: viewportheight,
				display: ''
			});

			if(this.hasStablePercentageVertical)
			{
				var toppos = 0;

				if(contentSize.height > containerSize.height)
					toppos = Math.round(this.itsPercentVertical * (contentSize.height - containerSize.height));

				this.itsVScrollerElem.dom.scrollTop = toppos;
			}

			this.itsVScrollerElemSizer.applyStyles(
			{
				width: 1,
				height: contentSize.height
			});
		}
		else
		{
			this.itsVScrollerElem.applyStyles(
			{
				left: 0,
				top: 0,
				width: 1,
				height: 1,
				display: 'none'
			});

			this.itsPercentVertical = 0;
			this.itsVScrollerElem.dom.scrollTop = 0;

			this.itsVScrollerElemSizer.applyStyles(
			{
				width: 1,
				height: 1
			});
		}

		
		
		

		this.setFlashRect(viewportwidth, viewportheight);

		
		
		

		this.syncContent(true);
	},

	syncContent:function(alsoCheckSize)
	{
		if(!this.itIsAwake)
			return;

		if( !alsoCheckSize &&
			this.itsScrollTop === this.itsVScrollerElem.dom.scrollTop &&
			this.itsScrollLeft === this.itsHScrollerElem.dom.scrollLeft)
		{
			return false;
		}

		this.itsScrollTop = this.itsVScrollerElem.dom.scrollTop;
		this.itsScrollLeft = this.itsHScrollerElem.dom.scrollLeft;

		this.sendOffset();
	},

	sendOffset : function()
	{
		var extelem = Ext.get(this.configuration.objectId);

		if(!extelem)
		{
			
			
			this.reset();
			return;
		}

		if(typeof (extelem.dom.setRootOffsetFromJavascript) != "function")
		{
			
			
			this.reset();
			return;
		}

		var containerSize = this.getSize();
		var contentSize = this.itsContentSize;

		this.itsPercentVertical = 0;

		if(contentSize.height > containerSize.height)
			this.itsPercentVertical = this.itsScrollTop / (contentSize.height - containerSize.height);

		this.itsPercentHorizontal = 0;
		if(contentSize.width > containerSize.width)
			this.itsPercentHorizontal = this.itsScrollLeft / (contentSize.width - containerSize.width);

		if(	this.itsScrollTop  == this.itsLastScrollTop &&
			this.itsScrollLeft == this.itsLastScrollLeft &&
			this.itsPercentHorizontal  == this.itsLastPercentHorizontal &&
			this.itsPercentVertical    == this.itsLastPercentVertical )
		{
			
			return;
		}

		extelem.dom.setRootOffsetFromJavascript(this.itsScrollLeft, this.itsScrollTop, this.itsPercentHorizontal, this.itsPercentVertical);

		this.itsLastScrollLeft = this.itsScrollLeft;
		this.itsLastScrollTop = this.itsScrollTop;
		this.itsLastPercentHorizontal = this.itsPercentHorizontal;
		this.itsLastPercentVertical = this.itsPercentVertical;

		return true;
	},

	trackingMouse: false,

	beginTrack: function()
	{
		this.trackingMouse = true;
		this.track();
	},

	track: function()
	{
		if(!this.trackingMouse)
			return;

		this.syncContent();

		this.track.defer(1,this);
	},

	stopTrack: function()
	{
		this.trackingMouse = false;
	},

	setFlashRect: function(w,h)
	{
		var swfelem = Ext.get(this.configuration.objectId);

		if(w <= 0 || h <= 0)
		{
			swfelem.applyStyles(
			{
				visibility : 'hidden',
				overflow : 'hidden',
				width : 1,
				height : 1
			});
		}
		else
		{
			swfelem.applyStyles(
			{
				overflow : 'hidden',
				visibility : '',
				width : w,
				height : h
			});
		}
	},

	getVScrollerTemplate : function()
	{
            	if(!com.actional.CustomScrollbarFlash.vscrollerTemplate)
            	{
	                com.actional.CustomScrollbarFlash.vscrollerTemplate = new Ext.XTemplate(
                		"<div id='{containerid}_vscroller' style='display:none;position:absolute;left:0px;top:0px;overflow:auto;width:0px;height:0px;'>",
					"<div id='{containerid}_vscroller_sizer' style='width:1px;height:0px;'></div>",
				"</div>");
		}

		return com.actional.CustomScrollbarFlash.vscrollerTemplate;
	},

	getHScrollerTemplate : function()
	{
            	if(!com.actional.CustomScrollbarFlash.hscrollerTemplate)
            	{
	                com.actional.CustomScrollbarFlash.hscrollerTemplate = new Ext.XTemplate(
				"<div id='{containerid}_hscroller' style='display:none;position:absolute;left:0px;top:0px;overflow:auto;width:0px;height:0px;'>",
					"<div id='{containerid}_hscroller_sizer' style='width:0px;height:1px;'></div>",
				"</div>");
		}

		return com.actional.CustomScrollbarFlash.hscrollerTemplate;
	}
});

Ext.reg('com.actional.CustomScrollbarFlash', com.actional.CustomScrollbarFlash);
