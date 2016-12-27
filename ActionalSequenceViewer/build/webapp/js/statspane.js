

















Ext.namespace('com.actional.serverui.network');

/**
 *
 * @class com.actional.serverui.network.Statspane
 * @extends Ext.Panel
 *
 * @lastrev fix36369 - set networklayoutsensitive flag on summarygraphpane
 */
com.actional.serverui.network.Statspane = Ext.extend(Ext.Panel,
{
    /**
     * @cfg {String} domainid (Optional)
     *
     * The domainid to use. pass "EVENT" to make the controls wait for events to get
     * a domainid. For the main network, you do not need to define it (or use null)
     */

   /**
     * @cfg {String} disabletimeseries (Optional)
     *
     * pass true to disable seeing timeseries (used when we have no timeline like in
     * the alert analyzer or mindreef Workspace)
     */

    /**
     * @cfg {Boolean} noexternalhyperlinks (Optional) defaults to false
     *
     * Set to true to hide all hyperlinks that jump to other pages
     * in the product.
     *
     */

     /**
     * @cfg {Boolean} disabledormantinfo (Optional) defaults to false
     *
     * Set to true to hide the "dormant since.." hyperlink
     *
     */

	/**
	 * @lastrev fix36813 - set background color as white.
	 */
	constructor: function(config)
	{
		com.actional.serverui.network.Statspane.superclass.constructor.call(this, Ext.applyIf(config,
		{
			autoScroll:true,
			layout:'border',
			bodyStyle:
			{
				"background-color": "white"
			},
		    	items:
		    	[
			    	{
			    		region:'north',
					xtype: 'com.actional.serverui.network.NetworkSelectionDetails',
			        	noexternalhyperlinks: config.noexternalhyperlinks,
			        	disabledormantinfo: config.disabledormantinfo,
					domainid: config.domainid
				},
			    	{
			    		region:'center',
					xtype: 'com.actional.serverui.network.SummaryGraphPane',
					statsetid: config.statsetid,
					domainid: config.domainid,
					disabletimeseries: config.disabletimeseries,
					userPreferences: config.userPreferences,
					settingPrefix: config.settingPrefix,
					optionsManagerId:config.optionsManagerId,
					networklayoutsensitive: true
				}
			]
		}));

		this.on('resize',this.doResize);
	},
	doResize : function()
	{
		var networkSelDetails = Ext.getCmp('statspane_networkselectiondetails');
		if(networkSelDetails)
		{
			networkSelDetails.doResize();
		}
	}
});

Ext.reg('com.actional.serverui.network.Statspane', com.actional.serverui.network.Statspane);
