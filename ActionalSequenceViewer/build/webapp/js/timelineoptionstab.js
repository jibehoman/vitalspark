

















Ext.namespace('com.actional.serverui');

/**
 *
 * @class com.actional.serverui.TimelineOptionsTab
 * @extends Ext.Panel
 */
com.actional.serverui.TimelineOptionsTab = Ext.extend(Ext.Panel,
{
	constructor: function(config)
	{			
		com.actional.serverui.TimelineOptionsTab.superclass.constructor.call(this, Ext.applyIf(config,
		{
			title:'Timeline',
			layout:'form',
			defaults: {width: 400},
			defaultType: 'radio',
    
			items: 
			{
				xtype: 'radiogroup',
				fieldLabel: 'Background Statistic',
				itemCls: 'x-check-group-alt',
				columns: 1,
				defaults: {autoShow: true},
				
				items: 
				[
					{boxLabel: 'Do not display any statistic', name: 'timeline-background-stat', inputValue: 1},
					{boxLabel: 'Display the overall network call volume', name: 'timeline-background-stat', inputValue: 2, checked: true},
					{boxLabel: 'Display a specific statistic', name: 'timeline-background-stat', inputValue: 3}
				]
			}
		}));
	}
	
});

Ext.reg('com.actional.serverui.TimelineOptionsTab', com.actional.serverui.TimelineOptionsTab);
