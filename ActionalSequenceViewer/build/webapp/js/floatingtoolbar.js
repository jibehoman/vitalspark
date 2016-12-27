

















Ext.ns('com.actional.ui');

/**
 * This toolbar is plugin which can used on any panel to show the toolbar floating on the panel. It can be configured
 * to always automatically position relative to the parent component or manually position it where ever it is required.
 *
 * @lastrev fix38515 - new class
 */
com.actional.ui.FloatingToolbar = Ext.extend(Ext.Toolbar,
{
	/**
	 * @cfg (Array) autoPositionAt [x, y] - an array of to numbers. When this value is provided the toolbar
	 * is always automatically positioned in such a way that it is y distant from top & x distant from right
	 * relative to the parent Component. If this value is not present then it is the creator's responsibility to
	 * call the setPosition() method to position the toolbar.
	 */
	constructor: function(config)
	{
		config = config || {};
		com.actional.ui.FloatingToolbar.superclass.constructor.call(this, Ext.applyIf(config,
		{
			style:
			{
				border: 'none',
				background: 'transparent',
				position: 'absolute'
			}
		}));

		this.on('show', this.autoPositionOnResize, this);
	},

	init: function(parentComponent)
	{
		this.itsParentComponent = parentComponent;

		if (this.itsParentComponent.rendered)
		{
			var el = this.itsParentComponent.getEl();
			this.render(el);
			if (this.autoPositionAt)
			{
				this.autoPositionOnResize();
				this.itsParentComponent.on('resize', this.autoPositionOnResize, this);
			}
		}
		else
		{
			
			this.itsParentComponent.on('render', this.init, this, {single: true});
		}
	},

	
	autoPositionOnResize: function()
	{
		var parentSize = this.itsParentComponent.getSize();
		var size = this.getSize();
		var autoPos = this.autoPositionAt;
		this.setPosition(parentSize.width - size.width - autoPos[0], autoPos[1]);
	}
});

Ext.reg('com.actional.ui.FloatingToolbar', com.actional.ui.FloatingToolbar);
