

















 /**
  * @lastrev fix37865 - set background of doc explicitely to white because of dark theme
  */
Ext.onReady(function(){
	var win;
	var doclink = Ext.get('_helpdoc');
	var helpbx = Ext.get('_helpmenu');

	if (!helpbx)
		return;

	helpbx.on('click', function(){
	        var hlp = new Ext.Panel({
	            region: 'center',
	            margins:'3 3 3 0',
	            header: false,
		    html: '<iframe style="background:white;" width=100% height=100% src="' + doclink.dom.value + '" scrolling="yes" frameborder="0"></iframe>'
	        });

		if (!win)
		{
	            win = new Ext.Window({
		            title: 'Context Help Dialog',
		            closable:true,
		            closeAction:'hide',
		            width:600,
		            height:350,
		            plain:true,
		            layout: 'fit',
		            autoScroll:false,

		            items: [hlp]
		        });
		}

	        win.show(this);
    	});
});