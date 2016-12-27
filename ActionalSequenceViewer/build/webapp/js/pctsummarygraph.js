

















/**
 * This file will only be included only in case if the summary graph is being rendered in PCT dashboard.
 */

Ext.ns('com.actional.serverui');

/**
 * Flag to know if the StatisticDetailDialog has already been inited. We will need to initiate this dialog only once
 * because there might be multiple summary graphs sharing only one instance of detail graph.
 */
com.actional.serverui.statisticDetailDialogInited = false;

/**
 * The flag to know if the timeSelectionEventManager ( which publishes the custom timeSelectionEvent for the summary
 * graphs rendered in the PCT dashboard.
 */
com.actional.serverui.timeSelectionEventManagerInited = false;

/**
 * This a map with key as the timeselectionsource to which the a summary graph will listen the time selection change
 * event. the value will be an object with key 'selectionTime' & 'ctxTime'.
 */
com.actional.serverui.summaryGraphTimeSourceToContextMap = {};

Ext.applyIf(com.actional.serverui,
{
	/**
	 * This method will initialize the statistic detail dialog. Event if it is called multiple times it will
	 * initialize only once.
	 *
	 * @lastrev fix36500 - set the 'modifiesGlobalTimeSelection' to false as this is for PCT.
	 */
	initStatisticDetailDialog : function()
	{
		if (com.actional.serverui.statisticDetailDialogInited)
		{
			return;
		}
		new com.actional.serverui.StatisticDetailsDialog(
		{
			includeTitleBar: false,
			modifiesGlobalTimeSelection: false
		});

		com.actional.serverui.statisticDetailDialogInited = true;
	},

	/**
	 * This method will add the summaryGraphTimeSource and the selectionTime/ctxTime related to the summary graph.
	 */
	addCtxTimes : function (summaryGraphTimeSource, selectionTime, ctxTime)
	{
		var map = com.actional.serverui.summaryGraphTimeSourceToContextMap;
		map[summaryGraphTimeSource] = { selectionTime : selectionTime, ctxTime : ctxTime} ;
	},

	/**
	 * This method will add a listener to the newGatherInterval event.
	 */
	initNewGatherListener : function()
	{
		OpenAjax.hub.subscribe('com.actional.serverui.newGatherInterval', function(name, publisherData, subscriberData)
		{
			com.actional.serverui.publishTimeSelectionEvent();
		}, {source:'portletpage'});
	},

	/**
	 * This will publish the time selection event to all the summary graphs which have registered their
	 * selectionTime & ctxTime. The time selection event is published on the newGatherEvent. There should be
	 * a source tag through which the summary graph identifies if the timeselectionchange event is for it or not.
	 * The source tag value should the value for which the summary graph has registered the selectionTime &
	 * ctxTime.
	 *
	 * @lastrev fix37599 - delegate the real publish to publishTimeSelectionEventForSummaryId()
	 */
	publishTimeSelectionEvent : function()
	{
		for (var summaryId in com.actional.serverui.summaryGraphTimeSourceToContextMap)
		{
			com.actional.serverui.publishTimeSelectionEventForSummaryId(summaryId);
		}
	},

	/**
	 * This method publishes the time selection for the specific summary graph.
	 *
	 * @lastrev fix37599 - new method.
	 */
	publishTimeSelectionEventForSummaryId: function(summaryId)
	{
		var map = com.actional.serverui.summaryGraphTimeSourceToContextMap;

		if (!map[summaryId])
		{
			return;
		}

		var selectionTime = map[summaryId].selectionTime;
		var ctxTime = map[summaryId].ctxTime;

		
		if (AdminPage_LastGatherTime != null)
		{
			var et = AdminPage_LastGatherTime;
			var st = et - selectionTime ;
			var ctx_et = AdminPage_LastGatherTime;
			var ctx_st = ctx_et - ctxTime ;

			OpenAjax.hub.publish('com.actional.serverui.timeSelectionChanged',
			{
				selection_t0 : st,
				selection_t1 : et,
				context_t0 : ctx_st,
				context_t1 : ctx_et,
				isLive : true,
				source : summaryId
			}, summaryId);
		}
	},

	/**
	 * This method will initialize the TimeSelectionEventManager which will publish the time selection changes
	 * to the different summary graphs. Even if this method is called multiple times it will register only once.
	 *
	 * @lastrev fix37599 - updated code so the the event request can publish only to a specific summary graph.
	 */
	initTimeSelectionEventManager : function()
	{
		if (com.actional.serverui.timeSelectionEventManagerInited)
		{
			return;
		}

		com.actional.serverui.publishTimeSelectionEvent();

		com.actional.serverui.initNewGatherListener();

		OpenAjax.hub.subscribe('com.actional.util.EventRequest', function(name, publisherData, subscriberData)
		{
			if (publisherData.forSummaryId)
			{
				com.actional.serverui.publishTimeSelectionEventForSummaryId(publisherData.forSummaryId);
			}
			else if(publisherData.events.indexOf('com.actional.serverui.timeSelectionChanged') >= 0)
			{
				com.actional.serverui.publishTimeSelectionEvent();
			}
		}, {source:'portletpage'});

		com.actional.serverui.timeSelectionEventManagerInited  = true;
	}
});
