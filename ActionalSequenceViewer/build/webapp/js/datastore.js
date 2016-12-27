

















Ext.namespace("com.actional.datastore");

/**
 * Main class with static members only (singleton).
 *
 * Works in conjunction with DataStore.java
 *
 */
com.actional.DataStore =
{
	
	addDataSet: function(dataSetType)
	{
		var me = com.actional.DataStore;

		var id = dataSetType.ID;

		if(me[id])
			return;

		var dataSet = new dataSetType(me);

		dataSet.id = id;

		me[id] = dataSet;
	}
};

/**
 * Base class for all DataSets
 *
 * @class com.actional.datastore.BaseDataSet
 * @extends Object
 */
com.actional.datastore.BaseDataSet = Ext.extend(Object,
{
	/** fill in automatically from the ID constant of the subclass */
	id: null
});

/**
 * PreloadedDataSet classes is meant to have all its data loaded at page load.
 *
 * The data can also be modified (in which case an event is sent which essentially
 * indicate to no longer "trust" the previously read data).
 *
 * @class com.actional.datastore.PreloadedDataSet
 * @extends com.actional.datastore.BaseDataSet
 */

com.actional.datastore.PreloadedDataSet = Ext.extend(com.actional.datastore.BaseDataSet,
{
	openajaxsubscription: null,
	data: null,

	assertReady: function()
	{
		if(this.data == null)
			throw "DataSet '" + this.id + "' has not been preloaded yet";
	},

	getData: function()
	{
		this.assertReady();
		return this.data;
	},

	/**
	 * When the dataset changes (i.e. preload called), the callback will be called.
	 *
	 * Typical usage example:
	 *
	 * com.actional.DataStore.<datasetid>.onDataSetChanged(function()
	 * {
	 * 	
	 * 	var data = com.actional.DataStore.<datasetid>.xxxx();
	 * }, this);  <- scope is optional
	 *
	 * Note that if this is occuring on a component that can be destroyed, unDataSetChanged() must be called
	 * appropriately else your object will "leak".
	 *
	 * @param {Function} callback
	 * @param {Object} [Optional] scope object (the this inside the function)
	 * @return subscription (to pass to unDataSetChanged())
	 */
	onDataSetChanged: function(callback, scope, callersource)
	{
		var eventname = com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(this.id);

		var subscription = OpenAjax.hub.subscribe(eventname, callback, scope, {'source':callersource});

		if(this.openajaxsubscription != null)
		{
			
			OpenAjax.hub.publish('com.actional.util.EventRequest', {'source':this.id, events:[eventname]});
		}

		return subscription;
	},

	/**
	 * Unsubscribe from the dataset event. This is important to call if your component
	 * gets destroyed.
	 *
	 * @param {subscription} subscription object  - return value of onDataSetChanged()
	 */
	unDataSetChanged: function(subscription)
	{
		OpenAjax.hub.unsubscribe(subscription);
	},

	/**
	 * default initialization method. Will fill the internal "data" member and
	 * send an event when we have new data.<br>
	 *
	 * @param {Object} dataobj default data object
	 */
	preload: function(dataobj)
	{
		this.data = dataobj;

		this.broadcastDataChanged();

		if(this.openajaxsubscription == null)
		{
			this.openajaxsubscription = OpenAjax.hub.subscribe(
				'com.actional.util.EventRequest',
				function(name, publisherData)
				{
					if(publisherData.events.indexOf(
						com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(this.id))
						>= 0)
					{
						this.broadcastDataChanged();
					}
				},
				this, {source:this.id});
		}
	},

	broadcastDataChanged: function()
	{
		OpenAjax.hub.publish(com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName(this.id),
		{
			source:this.id,
			data:this.getDataToMirror()
		});
	},

	getDataToMirror: function()
	{
		return this.getData();
	}
});


com.actional.datastore.PreloadedDataSet.computeDataSetChangedEventName = function(id)
{
	return 'com.actional.DataStore.'+id+'.DataSetChanged';
};

/**
 *
 * @class com.actional.datastore.ServerCachingDataSet
 * @extends com.actional.datastore.BaseDataSet
 */
com.actional.datastore.ServerCachingDataSet = Ext.extend(com.actional.datastore.BaseDataSet,
{
});
