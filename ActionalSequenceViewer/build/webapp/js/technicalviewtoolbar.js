

















Ext.ns('com.actional.serverui.technicalview');
/**
 * This class represents the floating toolbar present on the technical view / alert analyzer.
 *
 * @lastrev fix38515 - new class
 */
com.actional.serverui.technicalview.TechnicalViewToolbar = Ext.extend(com.actional.ui.FloatingToolbar,
{
	constructor: function(config)
	{
		config = config || {};
		com.actional.serverui.technicalview.TechnicalViewToolbar.superclass.constructor.call(this, Ext.applyIf(config,
		{
			items:
			[
				{
					iconCls: 'x-tbar-loading',
					handler: this.onRefreshButtonClick,
					scope: this
				}
			],
			width: 30,
			autoPositionAt: [10, 0]
		}));

		OpenAjax.hub.subscribe('com.actional.serverui.statDomainChanged', this.onStatDomainChanged, this);
		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: this.getEventSource(),
			events	: ['com.actional.serverui.statDomainChanged']
		});
	},

	onStatDomainChanged: function(event, publisherData)
	{
		if (publisherData.source != this.getEventSource())
		{
			this.statDomainData = Ext.applyIf({}, publisherData);

			
			this.statDomainData.source = this.getEventSource();

			
			this.statDomainData.forceRefresh = true;
		}
	},

	onRefreshButtonClick: function()
	{
		
		OpenAjax.hub.publish('com.actional.serverui.siteSelectionChanged',
		{
			type:'nothing',
			source: this.getEventSource()
		});
		OpenAjax.hub.publish('com.actional.serverui.statDomainChanged', Ext.applyIf({}, this.statDomainData));
	},

	getEventSource: function()
	{
		if (!this.eventSource)
		{
			this.eventSource = 'technicalviewtoolbar-' + this.getId();
		}

		return this.eventSource;
	}
});

Ext.reg('com.actional.serverui.technicalview.TechnicalViewToolbar', com.actional.serverui.technicalview.TechnicalViewToolbar);