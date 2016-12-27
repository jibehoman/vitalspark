

















Ext.namespace('com.actional.serverui.portal');

/**
 *
 * @lastrev fix36507 - replacing "+" with "%20" since the Ex.urlDecode(..) does not handle "+"
 */
com.actional.serverui.portal.PartialRefreshController = function(config)
{
	this.itsStartTime = config.startTime;
	this.itsEndTime = config.endTime;
	this.itsBaseUrl = config.baseUrl;
	this.itsExtraParams = config.extraParams;

	com.actional.serverui.portal.PartialRefreshController_instance = this;

	OpenAjax.hub.subscribe('com.actional.serverui.timeSelectionChanged', function(eventid, publisherData)
	{
		var me = com.actional.serverui.portal.PartialRefreshController_instance;
		me.setTime(publisherData.selection_t0, publisherData.selection_t1,publisherData.isLive);
	}, {source:'partialrefresh'});

	OpenAjax.hub.subscribe("com.actional.serverui.EventRequest",
	{
		source:'partialrefresh',
		events: ['com.actional.serverui.timeSelectionChanged']
	}, {source:'partialrefresh'});
};

com.actional.serverui.portal.PartialRefreshController.prototype =
{
	itsStartTime: null,
	itsEndTime: null,
	itsLive: null,
	itsBaseUrl: null,
	itsCache: {},
	itsCacheOrder: [],

	setTime: function(startTime,endTime,isLive,noreload)
	{
		if(startTime != this.itsStartTime || endTime != this.itsEndTime)
		{
			this.itsStartTime = startTime;
			this.itsEndTime = endTime;
			this.itsLive = isLive;
			if(!noreload)
			{








					this.sendPartialRequestRefresh();

			}
		}
	},

	sendPartialRequestRefresh: function()
	{
		var querystring = window.location.search.substring(1);
		
		
		querystring = querystring.replace(/\+/gi,"%20");
		var params = Ext.urlDecode(querystring);

		Ext.apply(params,this.itsExtraParams);

		Ext.Ajax.request(
		{
			url: this.itsBaseUrl,
			callback : this.callback,
			scope: this,
			params: Ext.apply(params,
			{
				'Time.st': this.itsStartTime,
				'Time.et': this.itsEndTime,
				'Time.live': this.itsLive,
				ssl: (getProtocol() == 'https'),
				activex: (Ext.isIE)
			})
		});
	},

	callback: function(options, success, responseObj)
	{
		if(!success)
			return;

		var partialRefreshObject = eval("("+responseObj.responseText+")");





		this.update(partialRefreshObject);
	},

	/** @lastrev fix37484 - upgrade fusion chart */
	update: function(partialRefreshObject)
	{
		this.updateHtmlEntries(partialRefreshObject.htmlentries);
		this.runScriptEntries(partialRefreshObject.scriptentries);
	},

	updateHtmlEntries: function(htmlentries)
	{
		for(id in htmlentries)
		{
			var elem = Ext.get(id);
			if(elem)
				elem.update(htmlentries[id]);
		}
	},

	/** @lastrev fix37484 - new method - upgrade fusion chart */
	runScriptEntries: function(scriptentries)
	{
		for(var i=0;i<scriptentries.length;i++)
		{
			var script = scriptentries[i];
			
			eval(script);
		}
	}
	



































};


