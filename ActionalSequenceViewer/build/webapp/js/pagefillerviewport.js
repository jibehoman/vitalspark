

















Ext.namespace('com.actional.ui');

/**
 * @class com.actional.ui.PageFillerViewPort
 *
 * Provide a "ViewPort"-like functionality but for a "partial" coverage of the
 * window but still keep resizing if the window resizes.
 * (i.e. expand up to the edge of the window on the right and bottom, but leave
 * the top/left position as is).
 *
 * Usage: use with PageFillerViewPort.java
 *
 * @extends Ext.Container
 */
com.actional.ui.PageFillerViewPort = Ext.extend(Ext.Panel,
{
	constructor: function(config)
	{
		com.actional.ui.PageFillerViewPort.superclass.constructor.call(this, Ext.applyIf(config,
		{
			border:false,
			renderTo: 'act_pagefillerviewport'
		}));
	},

	initComponent : function()
	{
		com.actional.ui.PageFillerViewPort.superclass.initComponent.call(this);

		var elem = Ext.get(this.renderTo);

		elem.dom.scroll = 'no';

		Ext.EventManager.onWindowResize(this.resizePanel, this);

		new Ext.util.DelayedTask().delay(1,this.resizePanelToWindow,this);
	},

	resizePanelToWindow: function()
	{
		this.resizePanel(Ext.lib.Dom.getViewWidth(), Ext.lib.Dom.getViewHeight());
	},

	resizePanel : function(w, h)
	{
		var elem = this.getEl();

		h -= elem.getTop();
		w -= elem.getLeft();

		if(h < 10)
			h = 10;
		if(w < 10)
			w = 10;

		this.setSize(w,h);
	}
});

Ext.reg('com.actional.ui.PageFillerViewPort', com.actional.ui.PageFillerViewPort);
