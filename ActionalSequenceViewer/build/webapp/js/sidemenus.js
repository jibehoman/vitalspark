

















Ext.namespace("com.actional.serverui");

/**
 * @lastrev fix37568 - Actional side support for 3rd level nav
 * contains menuid, its menus, and selectedMenu.
 * used in sidemenudropdown.js
 * Each menu has name and url.
 * @class com.actional.serverui.SideMenusDataSet
 * @extends com.actional.datastore.PreloadedDataSet
 */
com.actional.serverui.SideMenusDataSet = Ext.extend(com.actional.datastore.PreloadedDataSet,
{
	/**
	 *
	 * @param {Array} dataObj -- contains menuid, its menus, and selectedMenu.
	 */
	preload: function(dataObj)
	{
		com.actional.serverui.SideMenusDataSet.superclass.preload.call(this, dataObj);
	},

	getData: function()
	{
		return this.data.data;
	},



	getSelectedMenu: function()
	{
		return this.data.selectedMenu;
	}
});

com.actional.serverui.SideMenusDataSet.ID = "sideMenus";