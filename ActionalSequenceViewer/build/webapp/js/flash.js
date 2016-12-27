

















Ext.namespace('com.actional.util');

/**
 * @class com.actional.Flash
 * @extends Ext.BoxComponent
 * Ext-based component to display a flash swf
 *
 */
com.actional.Flash = Ext.extend(Ext.BoxComponent,
{
    /**
     * @cfg {String} swfUrl
     * the url to the swf file
     */
    /**
     * @cfg (String) id [Optional] Ext Component id.
     */
    /**
     * @cfg {String} objectId [Optional]
     * the id (and the name) of the underlying <object> tag
     * A unique id will be generated if not passed in parameter
     *
     * this will be mirrored as a flashvars named 'objectid'
     */
    /**
     * @cfg {String} wmode [Optional]
     * the flash wmode option (window/opaque/transparent) (defaults to 'opaque')
     * (in flash 10+ there are new modes like 'direct' and 'gpu')
     */
    /**
     * @cfg {Object} flashvars [Optional]
     * the flashvars input options. Pass an object containing the list
     * of key/value string pairs to be encoded like a "url query string".
     */
    /**
     * @cfg {String} bgcolor [Optional]
     * the flash background color (defaults to white)
     */
    /**
     * @cfg {String} salign [Optional]
     * the flash stage align option (defaults to 'lt')
     */
    /**
     * @cfg {String} scale [Optional]
     * the flash scale option (defaults to 'noscale')
     */

	/**
	 *  * @constructor
 	 * @param {Object} config The configuration options.
 	 *
 	 * @lastrev fix35234 - introduced externalDragEnabled configuration
	 */
	constructor: function(config)
	{
		this.configuration = Ext.applyIf(config,
		{
			objectId : null,
			swfUrl:'',
			flashvars : {},
			wmode : 'opaque', //use 'transparent' in Google Chrome
			bgcolor : (typeof getTheme == 'function') && getTheme() == 'dark'? '#161616': '#FFFFFF',
			salign : 'lt',
			scale : 'noscale',
			menu : false,
			externalDragEnabled : (!Ext.isIE)
		});

		if(!this.configuration.objectId)
			this.configuration.objectId = this.getId() + "_swf";

		com.actional.Flash.superclass.constructor.call(this, this.configuration);
	},

	
	configuration: {},

	/** flash proxy to access instance properties */
	getProperty: function(name)
	{
		return this[name];
	},

	/** flash proxy to set instance properties */
	setProperty: function(name, value)
	{
		this[name] = value;
	},

	/**
	 * @lastrev fix35536 - re-organize for subclassing
	 */
	onRender: function(ct, position)
	{
		this.hideModeHack();

		var data = this.getTemplateData();

		var tpl = this.getTemplate();

		this.el = tpl.overwrite(ct, data, true);
	},

	
	hideModeHack: function()
	{
		this.findParentBy(function(parent)
		{
			parent.hideMode = 'offsets';
			return false;
		});
	},

	
	getTemplateData: function()
	{
		var flashvarsStr = "objectid="+this.configuration.objectId+"&cmpid="+this.getId()+"&urlctx="+contextUrl('')+'&theme=' +
												((typeof getTheme == 'function') ? getTheme():'default');

		var flashvarsobj = this.configuration.flashvars;

		for(var name in flashvarsobj)
		{
			if(flashvarsobj[name] == null) 
				continue;

			flashvarsStr += "&" + name + '=' + escape(flashvarsobj[name]);
		}

		return Ext.applyIf(
		{
			protocol: getProtocol(),
			flashvars: flashvarsStr,
			allowScriptAccess: 'always'
		}, this.configuration);
	},

	
	getTemplate: function()
	{
            	if(!com.actional.Flash.flashTemplate)
            	{
	                com.actional.Flash.flashTemplate = new Ext.XTemplate(
			 	'<object id="{objectId}" name="{objectId}" ',

			        '<tpl if="Ext.isIE">',
					' classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"\n',
					' codebase="{protocol}://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0"',
			        '</tpl>',
			        '<tpl if="!Ext.isIE">',
			            ' data="{swfUrl}" type="application/x-shockwave-flash"',
			        '</tpl>',
			    	'>\n',

			    	' <param name="allowScriptAccess" value="{allowScriptAccess}" />\n',
			    	' <param name="salign" value="{salign}"/>\n',
			    	' <param name="quality" value="high"/>\n',
			    	' <param name="wmode" value="{wmode}"/>\n',
			    	' <param name="bgcolor" value="{bgcolor}"/>\n',
			    	' <param name="scale" value="{scale}"/>\n',
			    	' <param name="menu" value="{menu}"/>\n',
			    	' <param name="flashvars" value="{flashvars}"/>\n',

			        '<tpl if="Ext.isIE">',
			        	' <param name="src" value="{swfUrl}"/>\n',
			        '</tpl>',
			        '<tpl if="!Ext.isIE">',
			        	'<p style="padding:10 10 10 10">Flash 9 or higher is required to run this.',
			        	' Get the latest version <a href="http://www.macromedia.com/downloads">here</a>.</p>\n',
			        '</tpl>',
				'</object>\n'
			);
            	}

		return com.actional.Flash.flashTemplate;
	}
});


com.actional.Flash.callComponentInstance = function(cmpid, fctname, args)
{
	var cmpinstance = Ext.getCmp(cmpid);

	var scope = cmpinstance.scope;

	if(!scope)
		scope = cmpinstance;

	return cmpinstance[fctname].apply(scope, args);
};

Ext.reg('com.actional.Flash', com.actional.Flash);

/**
 * OpenAjax 1.0 / Flash bridge. Exposes OpenAjax API to Flash.
 * Works in conjunction with "OpenAjax.as" in ActionScript
 *
 * Note: None of these methods are meant to be called directly.
 */
com.actional.util.OpenAjaxFlashBridge =
{
	
	registeredCallbacks: {}, 
				 

	publish: function(name, publisherData)
	{
		OpenAjax.hub.publish(name, publisherData);
	},

	subscribe: function(name, callbackname, objectId, subscriberData)
	{
		
		this.unsubscribe(callbackname, objectId);

		var key = objectId + '_' + callbackname;

		var wrappedSubscriberData =
		{
			'callbackname':callbackname,
			'objectId':objectId,
			'subscriberData':subscriberData
		};

		var subscription = OpenAjax.hub.subscribe(name,
				com.actional.util.OpenAjaxFlashBridge.callback,
				com.actional.util.OpenAjaxFlashBridge, wrappedSubscriberData);

		wrappedSubscriberData.subscription = subscription;
		com.actional.util.OpenAjaxFlashBridge.registeredCallbacks[key] = wrappedSubscriberData;
	},

	
	callback: function(name, publisherData, wrappedSubscriberData)
	{
		var extelem = Ext.get(wrappedSubscriberData.objectId);

		if(!extelem)
		{


			
			
			this.unsubscribeAll(wrappedSubscriberData.objectId);
			return;
		}

		if(typeof (extelem.dom[wrappedSubscriberData.callbackname]) != "function")
		{


			if(Ext.isGecko && isInPct20()) 
			{
				
				
				
				

				this.unsubscribeAll.call(this, wrappedSubscriberData.objectId);
				
				this.restartFlashObject(wrappedSubscriberData.objectId);
			}
			else
			{
				
				
				this.unsubscribe(wrappedSubscriberData.callbackname,
						wrappedSubscriberData.objectId);
			}

			return;
		}

		extelem.dom[wrappedSubscriberData.callbackname](name, publisherData,
				wrappedSubscriberData.subscriberData);
	},

	restartFlashObject: function(objectid)
	{
		var bridge = com.actional.util.OpenAjaxFlashBridge;

		if(bridge.restarting[objectid])
			return;

		bridge.restarting[objectid] = true;

		var flash_extelem = Ext.get(objectid);




		
		var display = flash_extelem.getStyle("display");
		setTimeout(function() {
			flash_extelem.setStyle("display", "none");
			setTimeout(function() {
					var elem = Ext.get(objectid);

					if(elem)
						elem.setStyle("display", display);

					delete bridge.restarting[objectid];

				}, 50);
		},20);
	},

	restarting: {},

	unsubscribeAll: function(objectId)
	{
		var bridge = com.actional.util.OpenAjaxFlashBridge;

		var keyprefix = objectId + "_";
		for(var key in bridge.registeredCallbacks)
		{
			if(key.indexOf(keyprefix) == 0)
			{
				var wrappedSubscriberData = bridge.registeredCallbacks[key];
				bridge.unsubscribe(wrappedSubscriberData.callbackname,
					wrappedSubscriberData.objectId);
			}
		}
	},

	unsubscribe: function(callbackname, objectId)
	{
		var key = objectId + '_' + callbackname;

		var wrappedSubscriberData = com.actional.util.OpenAjaxFlashBridge.registeredCallbacks[key];

		if(!wrappedSubscriberData)
			return;

		delete com.actional.util.OpenAjaxFlashBridge.registeredCallbacks[key];

		OpenAjax.hub.unsubscribe(wrappedSubscriberData.subscription);
	}
};


/**
 * API to extend the reach of the flash mouse operations beyond the flash boundaries.
 * At worst the events are confined to the browser window, at best, it is the whole
 * desktop (IE only).
 *
 * public api callable from flash:
 *
 * startDrag(objectid)
 * cancelDrag(objectid)
 *
 * On flash side, the following externalInterfaces needs to exists:
 *
 * extDragMouseMove( eventObject ) -- called when user moves the mouse around
 * extDragMouseUp( eventObject )  -- called when user released the mouse button (drag finished)
 * extDragAbort()	-- called when some condition aborted the drag (should cancel the operation)
 *
 * eventObject:
 *      x:  	  flash-stage relative x position
 *      y:  	  flash-stage relative y position
 *      altKey:   true if altKey was pressed
 *      ctrlKey:  true if ctrlKey was pressed
 *      shiftKey: true if shiftKey was pressed
 * @lastrev fix35536 properly call extDragAbort when not tracking
 */
com.actional.util.ExtDragTracking =
{
	itsEventsInstalled: false,
	isTracking: false,
	itsObjectId: null,

	
	startDrag: function(id)
	{
		var me = com.actional.util.ExtDragTracking;

		if(me.isTracking)
		{
			
			Ext.get(me.itsObjectId).dom.extDragAbort();
		}

		me.itsObjectId = id;
		me.installEvents();
		me.isTracking = true;
	},

	
	cancelDrag: function(id)
	{
		var me = com.actional.util.ExtDragTracking;

		if(!me.isTracking)
			return;

		if(me.itsObjectId != id)
			return; 

		me.isTracking = false;

		me.uninstallEvents();
	},

	installEvents: function()
	{
		if(this.itsEventsInstalled)
			return;

		Ext.EventManager.on(Ext.getBody(), 'mousemove', this.onBodyMouseMove, this);
		Ext.EventManager.on(Ext.getBody(), 'mouseup', this.onBodyMouseUp, this);

		this.itsEventsInstalled = true;
	},

	uninstallEvents: function(ev)
	{
		if(!this.itsEventsInstalled)
			return;

		Ext.EventManager.un(Ext.getBody(), 'mousemove', this.onBodyMouseMove);
		Ext.EventManager.un(Ext.getBody(), 'mouseup', this.onBodyMouseUp);

		this.itsEventsInstalled = false;
	},

	onBodyMouseMove: function(ev)
	{
		if(this.isTracking)
		{
			var elem = Ext.get(this.itsObjectId);

			
			

			if(!elem )
			{
				this.onAbortTracking();
				return;
			}

			var elemBox = elem.getBox();
			var eventXy = ev.getXY();

			var elemX =  eventXy[0] - elemBox.x;
			var elemY =  eventXy[1] - elemBox.y;

			if((elemX > 0) && (elemY > 0) && (elemX < elemBox.width) && (elemY < elemBox.height))
			{
				return;
			}

			elem.dom.extDragMouseMove({
				x: elemX,
				y: elemY,
				altKey: ev.altKey,
				ctrlKey: ev.ctrlKey,
				shiftKey: ev.shiftKey});
		}
	},

	onBodyMouseUp: function(ev)
	{
		if(this.isTracking)
		{

			this.isTracking = false;
			this.uninstallEvents();

			var elem = Ext.get(this.itsObjectId);

			if(!elem)
			{
				this.onAbortTracking();
				return;
			}

			var elemXy = elem.getXY();
			var eventXy = ev.getXY();

			elem.dom.extDragMouseUp({
				x: eventXy[0] - elemXy[0],
				y: eventXy[1] - elemXy[1],
				altKey: ev.altKey,
				ctrlKey: ev.ctrlKey,
				shiftKey: ev.shiftKey});
		}
	},

	onAbortTracking: function()
	{
		if(this.isTracking)
		{
			var elem = Ext.get(this.itsObjectId);

			if(elem)
				elem.dom.extDragAbort();

			this.isTracking = false;

			this.uninstallEvents();
		}
	}
};

/**
 * @class com.actional.WindowWithFlash
 * @extends Ext.Window
 * A window that can host a flash component while taking care
 * of the mouse coordinate problem in Firefox. (overlapping
 * scrollable regions fools the mouse coordinates in Flash)
 *
 *
 * NOTE: this is not working properly just yet.
 */
com.actional.WindowWithFlash = Ext.extend(Ext.Window,
{
	hackDivZIndex: null,
	hackDivEl : null,

	constructor: function(config)
	{
		com.actional.WindowWithFlash.superclass.constructor.call(this, Ext.applyIf(config,
		{
			enableflashhack: Ext.isGecko,
			hideMode:'offsets'
		}));



	},

	renderHackDiv: function(elem)
	{
		if(!this.enableflashhack)
			return;

		
		if(!this.hackDivZIndex)
			this.hackDivZIndex = this.getEl().getStyle('z-index') - 3;

	        var el = document.createElement('div');

	        el.style.position = 'absolute';
	        el.style.top = '0px';
	        el.style.left = '0px';
	        el.style.width = '100%';
	        el.style.height = '100%';
	        el.style.visible = 'hidden';
	        el.style.zIndex = this.hackDivZIndex;

	        this.hackDivEl = Ext.get(Ext.getBody().appendChild(el));
	},

	destroyHackDiv : function()
	{
		if(this.hackDivEl)
		{
			this.hackDivEl.remove();
			this.hackDivZIndex = null;
		}
	}
/*
	setZIndex : function(index)
	{
		com.actional.WindowWithFlash.superclass.setZIndex.call(this, index);

		if(this.enableflashhack)
		{
			this.hackDivZIndex = index-1;
			if(this.hackDivEl)
				this.hackDivEl.setStyle('z-index', this.hackDivZIndex);
		}
	}
*/
});

Ext.reg('com.actional.WindowWithFlash', com.actional.WindowWithFlash);
