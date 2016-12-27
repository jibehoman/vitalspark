

















Ext.namespace("com.actional.serverui");

/** <!-- ------------------------------------------------------------------------------------ -->
 * Exposes the list of Managed Agents to javascript.<br>
 *
 * Works in conjunction with AgentListDataSet.java<br>
 *
 * AgentList structure contains:
 * <ul>
 * <li>id:  <Integer>
 * <li>name: <displayable name> (e.g. "BEA WebLogic", "Queue" or "System of record")
 * <li>iconstyle: the css style class name to have a background image showing that icon
 * </ul>
 *
 * @class com.actional.serverui.AgentListDataSet
 * @extends com.actional.datastore.PreloadedDataSet
 *
 * @lastrev fix38877 - new class
 */
com.actional.serverui.AgentListDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	agentLookup: null,

	/**
	 *
	 * @param {Array} dataObj -- list of agents
	 */
	preload: function(dataObj)
	{
		var lookup = {};

		for(var i=0; i<dataObj.length; i++)
		{
			var agentItem = dataObj[i];

			lookup[agentItem.id] = agentItem;
		}

		this.agentLookup = lookup;

		com.actional.serverui.AgentListDataSet.superclass.preload.call(this, dataObj);
	},

	getAgentList: function()
	{
		return this.getData();
	},

	getAgent: function(agentid)
	{
		this.assertReady();

		var type = this.agentLookup[agentid];

		if(!type)
			throw "Agent " + agentid + " not found";

		return type;
	},

	/**
	 *
	 * @param {String} agentid
	 * @return {String}
	 */
	getAgentName: function(agentid)
	{
		return this.getAgent(agentid).name;
	}
});


com.actional.serverui.AgentListDataSet.ID = "agentlist";


com.actional.serverui.AgentListDataSet.EVENT_DATASETCHANGED =
	com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(com.actional.serverui.AgentListDataSet.ID);

