






























function Observer_getObserverList(eventList, eventid, createIfNeeded)
{
	var oblist = eventList[eventid];

	if(oblist || !createIfNeeded)
		return oblist;

	oblist = [];
	oblist.observer_listid = eventid;

	eventList[eventid] = oblist;
	eventList[eventList.length] = oblist;

	return oblist;
}











function Observer_registerObserver(eventList, eventid, observerid, callbackfct)
{
	var oblist = Observer_getObserverList(eventList, eventid, true);

	if(!oblist[observerid])
		oblist[oblist.length] = observerid;

	oblist[observerid] = callbackfct;
}









function Observer_fireEvent(eventList, eventid, thethis, args)
{
	var oblist = Observer_getObserverList(eventList, eventid);

	if(!oblist)
		return;

	for(var i=oblist.length-1; i>=0; i--)
	{
		var observerid = oblist[i];

		if(!observerid)
			continue;

		var fct = oblist[observerid];
		if(typeof(fct) == "function")
		{
			if(!args)
				args = [];

			fct.apply(thethis, args);
		}
	}
}
