

















Ext.namespace('com.actional.serverui.network');

com.actional.serverui.network.MainNetworkBrowser = Ext.extend(com.actional.serverui.network.NetworkBrowser,
{

	constructor: function(config)
	{
		com.actional.serverui.network.MainNetworkBrowser.superclass.constructor.call(this, Ext.applyIf(config,
		{
		}));
	}
});

Ext.reg('com.actional.serverui.network.MainNetworkBrowser', com.actional.serverui.network.MainNetworkBrowser);


function getExtraLayoutOptionsParam()
{
	return '';
}

