

















Ext.namespace('com.actional.ui');

/**
* Support code to handle a "tri-state" tree panel.
*
* @class com.actional.ui.TristateTreePanel
* @extends Ext.tree.TreePanel
*
* @lastrev fix39152 - new file
*/
com.actional.ui.TristateTreePanel = Ext.extend(Ext.tree.TreePanel, 
{
	constructor: function(config)
	{
		com.actional.ui.TristateTreePanel.superclass.constructor.call(this, Ext.applyIf(config,
		{
		        autoScroll:true,
		        containerScroll: true,
		        rootVisible: false
		}));
	},
	
	initComponent: function()
	{
		this.eventModel = new com.actional.ui.TristateTreeEventModel(this);

		com.actional.ui.TristateTreePanel.superclass.initComponent.call(this);
	},
	
	getChecked: function(a, startNode)
	{
		startNode = startNode || this.root;
		var r = [];
		var f = function()
		{
			if(this.ui.getChecked())
			{
				r.push(!a ? this : (a == 'id' ? this.id : this.attributes[a]));
			}
		};
		
		startNode.cascade(f);
		return r;
	}
});

com.actional.ui.TristateTreeEventModel = Ext.extend(Ext.tree.TreeEventModel, 
{
	initEvents :function()
	{
		var el = this.tree.getTreeEl();
		el.on('click', this.delegateClick, this);
		if(this.tree.trackMouseOver !== false)
		{
			el.on('mouseover', this.delegateOver, this);
			el.on('mouseout', this.delegateOut, this);
		}
		el.on('mousedown', this.delegateDown, this);
		el.on('mouseup', this.delegateUp, this);
		el.on('dblclick', this.delegateDblClick, this);
		el.on('contextmenu', this.delegateContextMenu, this);
	},
	delegateOver :function(e, t)
	{
		if(!this.beforeEvent(e))
		{
			return;
		}
		if(this.lastEcOver)
		{
			this.onIconOut(e, this.lastEcOver);
			delete this.lastEcOver;
		}
		if(this.lastCbOver)
		{
			this.onCheckboxOut(e, this.lastCbOver);
			delete this.lastCbOver;
		}
		if(e.getTarget('.x-tree-ec-icon', 1))
		{
			this.lastEcOver = this.getNode(e);
			this.onIconOver(e, this.lastEcOver);
		}
		else if(e.getTarget('.x-tree-checkbox', 1))
		{
			this.lastCbOver = this.getNode(e);
			this.onCheckboxOver(e, this.lastCbOver);
		}
		if(this.getNodeTarget(e))
		{
			this.onNodeOver(e, this.getNode(e));
		}
	},
	delegateOut :function(e, t)
	{
		if(!this.beforeEvent(e))
		{
			return;
		}
		var n;
		if(e.getTarget('.x-tree-ec-icon', 1))
		{
			n = this.getNode(e);
			this.onIconOut(e, n);
			if(n == this.lastEcOver)
			{
				delete this.lastEcOver;
			}
		}
		else if(e.getTarget('.x-tree-checkbox', 1))
		{
			n = this.getNode(e);
			this.onCheckboxOut(e, n);
			if(n == this.lastCbOver)
			{
				delete this.lastCbOver;
			}
		}
		t = this.getNodeTarget(e);
		if(t && !e.within(t, true))
		{
			this.onNodeOut(e, this.getNode(e));
		}
	},
	delegateDown :function(e, t)
	{
		if(!this.beforeEvent(e))
		{
			return;
		}
		if(e.getTarget('.x-tree-checkbox', 1))
		{
			this.onCheckboxDown(e, this.getNode(e));
		}
	},
	delegateUp :function(e, t)
	{
		if(!this.beforeEvent(e))
		{
			return;
		}
		if(e.getTarget('.x-tree-checkbox', 1))
		{
			this.onCheckboxUp(e, this.getNode(e));
		}
	},
	delegateClick :function(e, t)
	{
		if(!this.beforeEvent(e)){
			return;
		}
		if(e.getTarget('.x-tree-checkbox', 1))
		{
			this.onCheckboxClick(e, this.getNode(e));
		}
		else if(e.getTarget('.x-tree-ec-icon', 1))
		{
			this.onIconClick(e, this.getNode(e));
		}
		else if(this.getNodeTarget(e))
		{
			console.log(this.getNodeTarget(e));
			this.onNodeClick(e, this.getNode(e));
		}
	},
	onCheckboxClick :function(e, node)
	{
		node.ui.onCheckboxClick();
	},
	onCheckboxOver :function(e, node)
	{
		node.ui.onCheckboxOver();
	},
	onCheckboxOut :function(e, node)
	{
		node.ui.onCheckboxOut();
	},
	onCheckboxDown :function(e, node)
	{
		node.ui.onCheckboxDown();
	},
	onCheckboxUp :function(e, node)
	{
		node.ui.onCheckboxUp();
	}
});

Ext.reg('com.actional.ui.TristateTreePanel', com.actional.ui.TristateTreePanel);
