

















Ext.namespace('com.actional.ui');

/**
* Support code to handle a "tri-state" tree Node. Meant to works with TristateTreePanel.
* 
* @class com.actional.ui.TristateNodeUI
* @extends com.actional.ui.TristateNormalNodeUI
*
* @class com.actional.ui.AsyncTristateNodeUI
* @extends Ext.extend(com.actional.ui.TristateNodeUI
*
* @lastrev fix39152 - new file
*/
com.actional.ui.TristateNodeUI = Ext.extend(Ext.tree.TreeNodeUI,
{
	grayedValue: null,
	atLeastOneChildrenIsChecked: undefined,
	
	constructor: function(node)
	{
		com.actional.ui.TristateNodeUI.superclass.constructor.call(this, node);
		
		if(node.attributes.checked === this.grayedValue)
			this.atLeastOneChildrenIsChecked = true;
	},
	
	onDisableChange: function(node, state)
	{
		this.disabled = state;
		this[state ? 'addClass' :'removeClass']("x-tree-node-disabled");
	},

	initEvents: function()
	{
		this.node.on("move", this.onMove, this);
		if(this.node.disabled)
		{
			this.disabled = true;
			this.addClass("x-tree-node-disabled");
		}
		
		if(this.node.hidden)
		{
			this.hide();
		}
		
		var ot = this.node.getOwnerTree();
		var dd = ot.enableDD || ot.enableDrag || ot.enableDrop;
		if(dd && (!this.node.isRoot || ot.rootVisible))
		{
			Ext.dd.Registry.register(this.elNode, 
			{
				node:this.node,
				handles:this.getDDHandles(),
				isHandle:false
			});
		}
	},
	
	onDblClick: function(e)
	{
		e.preventDefault();
		if(this.disabled)
		{
			return;
		}
		
		if(!this.animating && this.node.isExpandable() && !e.getTarget('.x-tree-checkbox', 1))
		{
			this.node.toggle();
		}
		this.fireEvent("dblclick", this.node, e);
	},
	
	onCheckChange: function()
	{
		this.updateIcon();
		
		this.fireEvent('checkchange', this.node, this.node.attributes.checked);
		
		
		
		var p = this.node;
		
		while((p = p.parentNode) && p.getUI().updateIcon && p.getUI().checkbox) 
		{
			p.getUI().computeChildrenStatus();
			p.getUI().updateIcon();
		}
	},
	
	toggleCheck: function(checked)
	{
		if(!this.checkbox)
		{
			return false;
		}

		if(checked === undefined)
		{
			checked = !this.isChecked();
		}

		if(checked !== this.node.attributes.checked)
		{			
			this.node.attributes.checked = checked;
			this.onCheckChange();
		}
		
		return checked;
	},
	
	onCheckboxClick: function() 
	{
		if(!this.disabled)
		{
			this.toggleCheck();
		}
	},
	onCheckboxOver: function() 
	{
		this.addClass('x-tree-checkbox-over');
	},
	onCheckboxOut: function() 
	{
		this.removeClass('x-tree-checkbox-over');
	},
	onCheckboxDown: function() 
	{
		this.addClass('x-tree-checkbox-down');
	},
	onCheckboxUp: function() 
	{
		this.removeClass('x-tree-checkbox-down');
	},
	renderElements: function(n, a, targetNode, bulkRender)
	{
		this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() :'';
		var cb = a.checked !== undefined;
		var href = a.href ? a.href :Ext.isGecko ? "" :"#";
		var buf = ['<li class="x-tree-node"><div ext:tree-node-id="',n.id,'" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls,'" unselectable="on">',
			'<span class="x-tree-node-indent">',this.indentMarkup,"</span>",
			'<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />',
			cb ? ('<img src="'+this.emptyIcon+'" class="x-tree-checkbox'+(a.checked === true ? ' x-tree-node-checked' :(a.checked !== false ? ' x-tree-node-grayed' :''))+'" />') :'',
			'<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon',(a.icon ? " x-tree-node-inline-icon" :""),(a.iconCls ? " "+a.iconCls :""),'" unselectable="on" />',
			'<a hidefocus="on" class="x-tree-node-anchor" href="',href,'" tabIndex="1" ',
			a.hrefTarget ? ' target="'+a.hrefTarget+'"' :"", '><span unselectable="on">',n.text,"</span></a></div>",
			'<ul class="x-tree-node-ct" style="display:none;"></ul>',
			"</li>"].join('');
		var nel;
		if(bulkRender !== true && n.nextSibling && (nel = n.nextSibling.ui.getEl()))
		{
			this.wrap = Ext.DomHelper.insertHtml("beforeBegin", nel, buf);
		}
		else
		{
			this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf);
		}
		this.elNode = this.wrap.childNodes[0];
		this.ctNode = this.wrap.childNodes[1];
		var cs = this.elNode.childNodes;
		this.indentNode = cs[0];
		this.ecNode = cs[1];
		this.iconNode = cs[2];
		var index = 3;
		if(cb)
		{
			this.checkbox = cs[2];
			index++;
		}
		this.anchor = cs[index];
		this.textNode = cs[index].firstChild;
	},
	
	isChecked: function()
	{
		return this.checkbox
			? (Ext.fly(this.checkbox).hasClass('x-tree-node-checked')
				? true
				:Ext.fly(this.checkbox).hasClass('x-tree-node-grayed')
					? this.grayedValue
					:false)
			:false;
	},
	
	getChecked: function() 
	{
		return this.node.attributes.checked;
	},

	computeChildrenStatus: function()
	{
		var n = this.node;
		
		
		
		

		this.atLeastOneChildrenIsChecked = false;

		this.node.eachChild(function(n)
		{
			if(n.getUI().atLeastOneChildrenIsChecked ||
				n.attributes.checked !== false)
			{
				this.atLeastOneChildrenIsChecked = true;
				return false;
			}
		}, this);
	},
	
	updateIcon: function()
	{
		var cb = this.checkbox;
		if(!cb)
		{
			return false;
		}
		
		var n = this.node;

		var checked = n.attributes.checked;

		if(!checked)
		{
			
			
			
			
			
			
			if(this.atLeastOneChildrenIsChecked)
				checked = this.grayedValue;
		}
		
		if(checked === true)
		{
			Ext.fly(cb).replaceClass('x-tree-node-grayed', 'x-tree-node-checked');
		} 
		else if(checked !== false)
		{
			Ext.fly(cb).replaceClass('x-tree-node-checked', 'x-tree-node-grayed');
		}
		else 
		{
			Ext.fly(cb).removeClass(['x-tree-node-checked', 'x-tree-node-grayed']);
		}
	}	
});

com.actional.ui.AsyncTristateNodeUI = Ext.extend(com.actional.ui.TristateNodeUI,
{
});

com.actional.ui.RootTreeNodeUI = Ext.extend(Ext.tree.RootTreeNodeUI,
{
	getChecked: function() { return false; }
});
