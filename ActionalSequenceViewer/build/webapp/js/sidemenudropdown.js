

















/**
 * created a drop down for side menu in pct top bar. Only for config side pages.
 * @lastrev fix37594 - no drop down for watchlist also
 */
Ext.onReady(
		function()
		{
			var hasMenus = false;
			var menus = new Ext.data.SimpleStore({
				fields: ['label','url'],
				data : []
			});
			var selected;
			var menuid = "";

			com.actional.DataStore.sideMenus.onDataSetChanged(function()
			{
			var data = com.actional.DataStore.sideMenus.data.menus;
			selected = com.actional.DataStore.sideMenus.data.selectedMenu;
			menuid = com.actional.DataStore.sideMenus.data.menuid;

			var storearray = [];

			for(var i=0;i<data.length; i++)
			{
				var item = data[i];
				storearray[i] = [item.label, item.url];
			}

			menus.loadData(storearray);

			if(menus.getCount() > 0)
				hasMenus = true;
			});


			
			if (!hasMenus || (menuid.indexOf("manage_") == 0) || (menuid.indexOf("watchlist_") == 0))
					return;

			var cb = new Ext.form.ComboBox({
					renderTo:'pctcombobox',
					mode:'local',
					displayField:'label',
					valueField:'url',
						editable:false,
			            		triggerAction:'all',
			            		forceSelection: true,
						listeners:
							{
							'select' : function(combo, record)
								{window.location.href = record.data.url;}
						},
						store: menus});

			cb.setValue(selected);
		}
);