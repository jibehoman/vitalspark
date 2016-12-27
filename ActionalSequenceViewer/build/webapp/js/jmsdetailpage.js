

















/**
 * Used to retrieve the availability status of JMS consumer and producer.
 * @lastrev fix39915 - consumer cleanup
 */
function getStatus(keyId, operation)
{
	var url = '/ui/transport/jmsconfig.jsrv';
	Ext.Ajax.request(
	{
		url: contextUrl(url),
		params:
		{
			op : operation,
			id : keyId
		},
		method: 'GET',
		timeout: 180000,
		callback: function(options, success, response)
		{
			var data;
			if (Ext.util.JSON !== undefined)
				data = Ext.util.JSON.decode(response.responseText); 
			else
				data = Ext.JSON.decode(response.responseText);      

			if (!Ext.isEmpty(data) && options.params.op == 'getproducerstatus')
				setStatus(data, 'producerStatusImg','producerDescription');
			else if (!Ext.isEmpty(data) && options.params.op == 'getconsumerstatus')
				setStatus(data, 'consumerStatusImg','consumerDescription');
		}
	});
}

/**
 * @lastrev fix39915 - consumer cleanup
 */
function setStatus(data, imgId, descriptionId)
{
	if (!Ext.isEmpty(data))
	{
		if (data.isvalid == null)
		{
			document.getElementById(imgId).src = contextUrl('images/emptyball.gif');
		}
		else if (data.isvalid == true)
		{
			document.getElementById(imgId).src = contextUrl('images/greenball.gif');
		}
		else
		{
			document.getElementById(imgId).src = contextUrl('images/redball.gif');
		}
		document.getElementById(descriptionId).innerHTML = data.description;
	}
}