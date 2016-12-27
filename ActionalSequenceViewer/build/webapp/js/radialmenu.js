





















var radialmenu_globals =
{
	menuanimtimems: 75,
	menustarttime : 0,
	menucx : 0,
	menucy : 0,
	highlightedMenu : -1,
	menuvisible : false,
	menuInfo : undefined,
	item_identifier : undefined,
	isAnimating : false,

	slicedata:
	{
		trianglepos:
		{
			right_normal: 'right 0px',
			right_disabled: 'right -30px',
			right_highlight: 'right -60px',
			left_normal: '0px -90px',
			left_disabled: '0px -120px',
			left_highlight: '0px -150px'
		},

		4:
		{
			angleadjust: 45,
			img_width:  207,
			img_height: 166,
			circle_width:  194,
			circle_height: 148,
			slicexpos: [ 0, -207, -414, -621 ],
			sliceypos: { normal: 0, disabled: -166, highlight: -332 },
			text_horz_xdist: 55,
			text_vert_ydist: 44
		},

		6:
		{
			angleadjust: 0,
			img_width:  208,
			img_height: 166,
			circle_width: 208,
			circle_height: 150,
			slicexpos: [ 0, -208, -416, -624, -832, -1040 ],
			sliceypos: { normal: 0, disabled: -166, highlight: -332 },
			text_diag_ydist: 34,
			text_diag_xdist: 36,
			text_horz_xdist: 60
		}
	},

	SLICE6_NE: 0,
	SLICE6_E:  1,
	SLICE6_SE: 2,
	SLICE6_SW: 3,
	SLICE6_W:  4,
	SLICE6_NW: 5,

	SLICE4_N: 0,
	SLICE4_E: 1,
	SLICE4_S: 2,
	SLICE4_W: 3
};



























































































function radialPopupExample_SubmenuClick(menuInfo, menuEntry, item_identifier)
{
	return contextUrl( menuEntry.example_urlprefix + item_identifier );
}

function radialPopupExample_Submenu(menuInfo, menuEntry, item_identifier)
{
	var submenu = [];

	var submenuentry;

	submenuentry = {};

	submenuentry.htmlLabel = 'xyz';
	submenuentry.tooltip = 'jump to xyz site';
	submenuentry.url = 'http://www.google.com/search?btnI=lucky&q=xyz';

	submenu[submenu.length] = submenuentry;

	submenu[submenu.length] = { htmlLabel : "<hr>" };  

	for(var i=1;i<15;i++)
	{
		submenuentry = {};

		submenuentry.htmlLabel = 'abc' + i;
		submenuentry.tooltip = 'jump to abc' + i + ' site';
		submenuentry.url = 'http://www.google.com/search?btnI=lucky&q=abc'+i;

		if(i % 6 == 2)
		{
			submenuentry.disabled = true;
		}

		if(i % 3 != 1)
		{
			submenuentry.indent = 1;
		}

		if(i % 6 == 1)
		{
			submenuentry.istitle = true;
		}


		submenu[submenu.length] = submenuentry;
	}

	return submenu;
}

function radialPopupExampleBuildMenu()
{
	var menuInfo = { slicecount : 6 };

	menuInfo.onDismissFn = radialPopupExample_unhighlight_row;

	menuInfo[radialmenu_globals.SLICE6_NE] =
	{
		htmlLabel: "Details",
		tooltip: "Show custportal Details",
		disabled: true
	};

	var test3menu =
	[
		{
			htmlLabel: "Submenu1",
			tooltip: "Test 3 submenu tooltip",
			onClickFn: radialPopupExample_SubmenuClick,

			example_urlprefix: "portal/infrastructure_details.jsp?keyID="
		},
		{
			htmlLabel: "Submenu2",
			tooltip: "Test 3 submenu tooltip",
			disabled: true,
			onClickFn: radialPopupExample_SubmenuClick,

			example_urlprefix: "/portal/infrastructure_details.jsp?keyID="
		}
	];

	menuInfo[radialmenu_globals.SLICE6_E] =
	{
		htmlLabel: "Business",
		tooltip: "Test 3 tooltip",
		submenu: test3menu
	};

	menuInfo[radialmenu_globals.SLICE6_SE] =
	{
		htmlLabel: "Test2",
		tooltip: "Test 2 tooltip"
	};

	menuInfo[radialmenu_globals.SLICE6_NE] =
	{
		htmlLabel: "TestNE",
		tooltip: "Test NE tooltip"
	};

	menuInfo[radialmenu_globals.SLICE6_W] =
	{
		htmlLabel: "Test4",
		tooltip: "Test 4 tooltip",
		onClickFn: function(menuInfo, menuEntry, item_identifier)
		{
			return contextUrl( menuEntry.my_urlprefix + item_identifier );
		},
		my_urlprefix: "/portal/infrastructure_details.jsp?keyID="
	};

	menuInfo[radialmenu_globals.SLICE6_NW] =
	{
		htmlLabel: "Business",
		tooltip: "Test NW tooltip",
		onSubmenuFn: radialPopupExample_Submenu,
		url: '#'
	};

	return menuInfo;
}

var radialPopupExampleMenuInfo = radialPopupExampleBuildMenu();

function onRadialPopupExample(ev, item_identifier)
{
	radialPopupExample_highlight_row(item_identifier);

	
	radialPopupExampleMenuInfo[radialmenu_globals.SLICE6_SE].url = "\/lgserver\/portal\/infrastructure_details.jsp?keyID="+item_identifier;

	

	return radialmenu_showMenu(ev, radialPopupExampleMenuInfo, item_identifier);
}

function radialPopupExample_highlight_row(rowid)
{
	var rowEl = document.getElementById(rowid);

	if(rowEl)
		addClass(rowEl, 'radialmenu_row_highlight');
}

function radialPopupExample_unhighlight_row(menuInfo, item_identifier)
{
	var rowEl = document.getElementById(item_identifier);

	if(rowEl)
	{
		removeClass(rowEl, 'radialmenu_row_highlight');
		var aa = rowEl.className;
	}
}





function radialmenu_showMenu(e, menuInfo, item_identifier)
{
	
	radialmenu_dismiss();

	radialmenu_globals.menuInfo = menuInfo;
	radialmenu_globals.item_identifier = item_identifier;

	radialmenu_globals.menuvisible = true;

	radialmenu_globals.menustarttime = new Date().getTime();

	var mousepos = mousePos(e);

	radialmenu_globals.menucx = mousepos.x;
	radialmenu_globals.menucy = mousepos.y;

	radialmenu_globals.isAnimating = true;
	radialmenu_animMenu();
}

function radialmenu_animMenu()
{
	var curTime = new Date().getTime();

	var delta = (curTime - radialmenu_globals.menustarttime);
	var menuprogress;

	if(delta >= radialmenu_globals.menuanimtimems)
		menuprogress = 1;
	else
		menuprogress = delta / radialmenu_globals.menuanimtimems;

	radialmenu_showanimframe(menuprogress);

	if(menuprogress < 1)
		setTimeout('radialmenu_animMenu()', 1);
	else
		radialmenu_finalShowMenu();
}

function radialmenu_showanimframe(progress)
{
	var animElem = document.getElementById('radialmenu'+radialmenu_globals.menuInfo.slicecount+'_anim');

	if(!animElem)
		return;

	var slicedata = radialmenu_globals.slicedata[radialmenu_globals.menuInfo.slicecount];

	var w = Math.floor(slicedata.img_width * progress);
	var h = Math.floor(slicedata.img_height * progress);
	var x = radialmenu_globals.menucx - (w/2);
	var y = radialmenu_globals.menucy - (h/2);

	animElem.style.left = x + 'px';
	animElem.style.top = y + 'px';
	animElem.style.width = w + 'px';
	animElem.style.height = h + 'px';
	animElem.style.display = '';

	
}

function radialmenu_finalShowMenu()
{
	radialmenu_globals.isAnimating = false;

	var slicecount = radialmenu_globals.menuInfo.slicecount;

	for(var i=0; i<slicecount; i++)
	{
		var textelem = document.getElementById('radialmenu'+slicecount+'_text'+i);

		var html = '';
		var menuEntry = radialmenu_globals.menuInfo[i];

		if(menuEntry)
		{
			if(menuEntry.htmlLabel)
				html = menuEntry.htmlLabel;

			
			menuEntry.submenuCache = undefined;
		}

		textelem.innerHTML = html;

		if(radialmenu_hasSubmenu(i))
		{
			addClass(textelem, 'radial_menu_triangle');

			if(radialmenu_submenuNaturalLocationIsRight(i))
			{
				textelem.style.paddingRight = '8px';
				textelem.style.paddingLeft = '0px';
			}
			else
			{
				textelem.style.paddingRight = '0px';
				textelem.style.paddingLeft = '8px';
			}
		}
		else
		{
			removeClass(textelem, 'radial_menu_triangle');
			textelem.style.paddingRight = '0px';
			textelem.style.paddingLeft = '0px';
		}

		radialmenu_setslicehighlightstate(i, false);
	}

	radialmenu_positionlabels(1);

	var menuElem = document.getElementById('radialmenu' + slicecount);

	var x = radialmenu_globals.menucx - radialmenu_globals.slicedata[slicecount].img_width / 2;
	var y = radialmenu_globals.menucy - radialmenu_globals.slicedata[slicecount].img_height / 2;

	menuElem.style.left = x + 'px';
	menuElem.style.top = y + 'px';

	menuElem.style.visibility = 'visible';

	var animElem = document.getElementById('radialmenu'+radialmenu_globals.menuInfo.slicecount+'_anim');

	animElem.style.top = '-10000px';
	animElem.style.left = '-10000px';

	return true;
}

/**
 * @lastrev fix37512 - donot dismiss the radialmenu if the click happend on the radial menu - submenu (extjs menu)
 */
function radialmenu_bodyMouseDown(e)
{
	if(!radialmenu_globals.menuvisible)
		return false;

	if (!e) e = window.event;

	var oSrcElem = e.target || e.srcElement;

	if(oSrcElem == document.body)
		radialmenu_dismiss();
	else if(oSrcElem.id && oSrcElem.id.indexOf('radialmenu') >= 0)
		return;
	else if (radialmenu_isExtSubMenu(oSrcElem))
		return;
	else if(oSrcElem.className && oSrcElem.className.indexOf('radial') >= 0)
		return;

	radialmenu_dismiss();
}

/**
 * lastrev fix37512 - new method.
 */
function radialmenu_isExtSubMenu(elem)
{
	var el = Ext.fly(elem);

	el = el.findParent('a.x-menu-item', 5, true);

	if (el && el.id && el.id.indexOf('radialmenu') >= 0)
	{
		return true;
	}
	return false;
}

function radialmenu_dismiss(selectedmenu)
{
	if(!radialmenu_globals.menuvisible || radialmenu_globals.isAnimating)
		return;

	radialmenu_globals.menuvisible = false;

	if(radialmenu_globals.menuInfo.onDismissFn)
		radialmenu_globals.menuInfo.onDismissFn(radialmenu_globals.menuInfo, radialmenu_globals.item_identifier);

	radialmenu_hideSubmenu();

	var menuElem = document.getElementById('radialmenu' + radialmenu_globals.menuInfo.slicecount);
	if(menuElem)
	{
		menuElem.style.visibility = 'hidden';
		menuElem.style.top = '-10000px';
		menuElem.style.left = '-10000px';
	}

	radialmenu_globals.menuInfo = undefined;
}

function radialmenu_setslicehighlightstate(sliceno, highlighted)
{
	var menuEntry = radialmenu_globals.menuInfo[sliceno];

	if(highlighted)
		radialmenu_setslicestate('highlight', sliceno);
	else
		radialmenu_setslicestate(radialmenu_isdisabled(sliceno)?'disabled':'normal', sliceno);
}

/**
 * @lastrev fix37559 - get the text color from the radialmenu_getTextColor() method.
 */
function radialmenu_setslicestate(state, sliceno)
{
	var slicecount = radialmenu_globals.menuInfo.slicecount;

	var elem = document.getElementById('radialmenu' + slicecount + '_slice' + sliceno);
	if(!elem)
		return;

	var slicedata = radialmenu_globals.slicedata[slicecount];
	var xypos = '' + slicedata.slicexpos[sliceno] + 'px ' +
			 slicedata.sliceypos[state] + 'px';

	elem.style.backgroundPosition = xypos;

	var textelem = document.getElementById('radialmenu'+slicecount + '_text' + sliceno);
	if(!textelem)
		return;
	textelem.style.color = radialmenu_getTextColor(state);

	if(radialmenu_hasSubmenu(sliceno))
	{
		var dir = radialmenu_submenuNaturalLocationIsRight(sliceno)?'right':'left';
		textelem.style.backgroundPosition = radialmenu_globals.slicedata.trianglepos[dir+'_'+state];
	}
}

function radialmenu_positionlabels(progress)
{
	var slicecount = radialmenu_globals.menuInfo.slicecount;

	var slicedata = radialmenu_globals.slicedata[slicecount];

	for(var i=0;i<slicecount;i++)
	{
		var textelem = document.getElementById('radialmenu'+slicecount+'_text'+i);
		var w = textelem.offsetWidth;
		var h = textelem.offsetHeight;
		var x;
		var y;

		if(slicecount == 6)
		{
			switch(i)
			{
				case 0: 
					x = - (w/2) + slicedata.text_diag_xdist;
					y = - h - slicedata.text_diag_ydist;
					break;
				case 1: 
					x = - (w/2) + slicedata.text_horz_xdist;
					y = - (h/2);
					break;
				case 2: 
					x = - (w/2) + slicedata.text_diag_xdist;
					y = slicedata.text_diag_ydist;
					break;
				case 3: 
					x = - (w/2) - slicedata.text_diag_xdist;
					y = slicedata.text_diag_ydist;
					break;
				case 4: 
					x = - (w/2) - slicedata.text_horz_xdist;
					y = - (h/2);
					break;
				case 5: 
					x = - (w/2) - slicedata.text_diag_xdist;
					y = - h - slicedata.text_diag_ydist;
					break;
			}
		}
		else if (slicecount == 4)
		{
			switch(i)
			{
				case 0: 
					x = - (w/2);
					y = - h - slicedata.text_vert_ydist;
					break;
				case 1: 
					x = - (w/2) + slicedata.text_horz_xdist;
					y = - (h/2);
					break;
				case 2: 
					x = - (w/2);
					y = slicedata.text_vert_ydist;
					break;
				case 3: 
					x = - (w/2) - slicedata.text_horz_xdist;
					y = - (h/2);
					break;
			}
		}

		x=Math.floor(x*progress);
		y=Math.floor(y*progress);

		x = x + (slicedata.img_width/2);
		y = y + (slicedata.img_height/2);

		textelem.style.left = x + 'px';
		textelem.style.top = y + 'px';
		setElementOpacity(textelem, 0.2 + 0.8*progress);
	}
}

function radialmenu_backonclick(ev)
{
	if(radialmenu_globals.isAnimating)
		return false;

	var menuid = radialmenu_computeMouseMenuId(ev);

	radialmenu_highlightmenu(menuid);

	if(menuid == -1)
	{
		radialmenu_dismiss(menuid);
		return false;
	}

	if(radialmenu_isdisabled(menuid))
		return false;

	

	var menuEntry = radialmenu_globals.menuInfo[menuid];

	var url;

	if(menuEntry.onClickFn)
		url = menuEntry.onClickFn(radialmenu_globals.menuInfo, menuEntry, radialmenu_globals.item_identifier);
	else
		url = menuEntry.url;

	
	radialmenu_dismiss(menuid);

	if(!url)
		return false;

	window.location.href = url;

	return true;
}

function radialmenu_backmouseover(ev)
{
	if(radialmenu_globals.isAnimating || !radialmenu_globals.menuvisible)
		return;

	var menuid = radialmenu_computeMouseMenuId(ev);

	radialmenu_highlightmenu(menuid);
}

function radialmenu_backmousemove(ev)
{
	if(radialmenu_globals.isAnimating || !radialmenu_globals.menuvisible)
		return;

	var menuid = radialmenu_computeMouseMenuId(ev);

	radialmenu_highlightmenu(menuid);
}

function radialmenu_backmouseout(ev)
{
	if(radialmenu_globals.isAnimating)
		return;

	radialmenu_highlightmenu(-1);
}

function radialmenu_highlightmenu(menuid)
{
	if(radialmenu_globals.highlightedMenu == menuid  || !radialmenu_globals.menuvisible)
		return;

	if(radialmenu_globals.highlightedMenu >= 0)
	{
		radialmenu_setslicehighlightstate(radialmenu_globals.highlightedMenu, false);
	}

	var menuBackElem = document.getElementById('radialmenu'+radialmenu_globals.menuInfo.slicecount+'_back');


	
	var tooltip = '';
	if(menuid >= 0)
	{
		var menuEntry = radialmenu_globals.menuInfo[menuid];

		if(menuEntry)
		{
			if(menuEntry.onTooltipFn)
			{
				tooltip = menuEntry.onTooltipFn(radialmenu_globals.menuInfo, menuEntry, radialmenu_globals.item_identifier);
			}
			else if(menuEntry.tooltip)
			{
				tooltip = menuEntry.tooltip;
			}
		}
	}

	if(menuBackElem.title != tooltip)
	{
		menuBackElem.title = tooltip;

		if(Utils_isMozilla)
		{
			
			radialmenu_globals.isAnimating = true;
			menuBackElem.style.display = 'none';
			setTimeout('radialmenu_toggleForTooltipTrig()', 1);
		}
	}

	if(radialmenu_isdisabled(menuid))
		menuid = -1;

	if(menuid >= 0)
	{
		radialmenu_setslicehighlightstate(menuid, true);

		menuBackElem.style.cursor = 'pointer';

		radialmenu_hideSubmenu();

		if(radialmenu_hasSubmenu(menuid))
			radialmenu_showSubmenu(menuid);
	}
	else
	{
		menuBackElem.style.cursor = '';
	}

	radialmenu_globals.highlightedMenu = menuid;
}

function radialmenu_toggleForTooltipTrig()
{
	var menuBackElem = document.getElementById('radialmenu'+radialmenu_globals.menuInfo.slicecount+'_back');

	
	menuBackElem.style.display = '';
	radialmenu_globals.isAnimating = false;
}

function radialmenu_isdisabled(menuid)
{
	if(menuid < 0)
		return true;

	var menuEntry = radialmenu_globals.menuInfo[menuid];

	if(!menuEntry)
		return true;

	if(menuEntry.disabled)
		return true;

	return false;
}

function radialmenu_computeMouseMenuId(ev)
{
       if (typeof ev == "undefined") ev = window.event;

	var slicecount = radialmenu_globals.menuInfo.slicecount;

	var slicedata = radialmenu_globals.slicedata[slicecount];

	var backwidth = slicedata.circle_width;
	var backheight = slicedata.circle_height;

	var ratio = backwidth/backheight;

	var mousepos = mousePos(ev);

	var mouseX = mousepos.x - radialmenu_globals.menucx;
	var mouseY = mousepos.y - radialmenu_globals.menucy;

	
	var distance = Math.sqrt((mouseX*mouseX)+(mouseY*mouseY));

	if(distance < 10)
		return -1;

	
	mouseY = mouseY * ratio;

	
	distance = Math.sqrt((mouseX*mouseX)+(mouseY*mouseY));

	var maxdistance = (backwidth/2) - 4;

	if(distance > maxdistance)
		return -1;

	
	var angle = atand(mouseX,mouseY) + 90;

	angle += slicedata.angleadjust;

	if(angle >= 360)
		angle -= 360;

	menuid = Math.floor(angle*slicecount/360);

	return menuid;
}

function atand(x,y)
{
	if(Math.abs(x)<0.001)
	{
		if(Math.abs(y)<0.001)
			return 0;

		if(y>0)
			return 90;
		if(y<0)
			return 270;
	}

	if (x>0)
	{
		if (y>=0)
			return 180*Math.atan(y/x)/Math.PI;
		else
			return 180*Math.atan(y/x)/Math.PI-(-1)*360;
	}

	if (x<0)
	{
		if (y>=0)
			return 180-180*Math.atan(-y/x)/Math.PI;
		else
			return -180-(-1)*180*Math.atan(y/x)/Math.PI-(-1)*360;
	}
}

function radialmenu_hasSubmenu(menuid)
{
	if(menuid < 0)
		return -1;

	var menuEntry = radialmenu_globals.menuInfo[menuid];

	if(!menuEntry)
		return false;

	if(menuEntry.onSubmenuFn || menuEntry.submenu)
		return true;

	return false;
}


/** <!-- ================================================================================================== -->
 * @lastrev fix37512 - replace the submenu with extjs menu.
 * <!-- ------------------------------------------------------------------------------------------------ --> */
function radialmenu_showSubmenu(menuid)
{
	var menuEntry = radialmenu_globals.menuInfo[menuid];

	if(!menuEntry)
		return;

	var subMenu;

	if(menuEntry.submenuCache)
	{
		subMenu = menuEntry.submenuCache;
	}
	else
	{
		if(menuEntry.onSubmenuFn)
			subMenu = menuEntry.onSubmenuFn(radialmenu_globals.menuInfo, menuEntry, radialmenu_globals.item_identifier);
		else
			subMenu = menuEntry.submenu;

		menuEntry.submenuCache = subMenu;
	}

	if(!subMenu)
		return;

	var submenuElemId = 'radialmenu'+radialmenu_globals.menuInfo.slicecount+'_submenu'+menuid;

	var subMenuCmp = radialmenu_submenu_build(menuid, submenuElemId, subMenu);

	radialmenu_globals.curSubmenuId = submenuElemId;

	if (!subMenuCmp)
	{
		return;
	}

	subMenuCmp.render();

	var pos = radialmenu_compute_submenu_position(menuid, menuEntry, subMenuCmp);

	var subx = pos.x;
	var suby = pos.y;

	subMenuCmp.showAt([subx, suby]);
}

/**
 * @lastrev fix37512 - use the extjs menu component's width to calculate the position.
 */
function radialmenu_compute_submenu_position(menuid, menuEntry, submenuCmp)
{
	var labelElem = document.getElementById('radialmenu'+radialmenu_globals.menuInfo.slicecount+'_text'+menuid);

	var px = 0;
	var py = 0;

	if(radialmenu_submenuNaturalLocationIsRight(menuid))
	{
		px = labelElem.offsetLeft + labelElem.offsetWidth;
		py = labelElem.offsetTop;
	}
	else
	{
		px = labelElem.offsetLeft - submenuCmp.getWidth();
		py = labelElem.offsetTop;
	}

	py -= 6; 

	var centeroffsetx = radialmenu_globals.slicedata[radialmenu_globals.menuInfo.slicecount].img_width / 2;
	var centeroffsety = radialmenu_globals.slicedata[radialmenu_globals.menuInfo.slicecount].img_height / 2;

	px = px - centeroffsetx + radialmenu_globals.menucx;
	py = py - centeroffsety + radialmenu_globals.menucy;

	

	return { x:px, y:py };
}

function radialmenu_submenuNaturalLocationIsRight(menuid)
{
	return (menuid < (radialmenu_globals.menuInfo.slicecount/2));
}

/**
 * @lastrev fix37512 - use extjs api to hide the menu.
 */
function radialmenu_hideSubmenu()
{
	if(!radialmenu_globals.curSubmenuId)
		return;

	var subMenuCmp = Ext.getCmp(radialmenu_globals.curSubmenuId);
	subMenuCmp.hide();

	radialmenu_globals.curSubmenuId = undefined;
}

/**
 * @lastrev fix37559 - if no submenuEntry for next items.
 */
function radialmenu_submenu_build(menuid, id, subMenu)
{
	var radialSubMenu = Ext.getCmp(id);
	if (!radialSubMenu)
	{
		radialSubMenu = new Ext.menu.Menu({id: id, cls: 'ext-menu-no-vseperator'});
	}

	radialSubMenu.removeAll(true);

	for (var i = 0; i < subMenu.length; i++)
	{
		var submenuEntry = subMenu[i];

		if (!submenuEntry)
		{
			continue;
		}

		if (submenuEntry.htmlLabel == "<hr>")
		{
			radialSubMenu.add('-');
		}
		else
		{
			var isLink = !submenuEntry.disabled && !submenuEntry.istitle;

			var tooltip = null;

			if(submenuEntry.onTooltipFn)
			{
				tooltip = submenuEntry.onTooltipFn(radialmenu_globals.menuInfo, submenuEntry, radialmenu_globals.item_identifier);
			}
			else if(submenuEntry.tooltip)
			{
				tooltip = submenuEntry.tooltip;
			}

			if (!tooltip)
			{
				tooltip = '';
			}

			var menuItem = {} ;

			menuItem.id = id + '_' + i;

			
			menuItem.text = "<span ext:qtip='" + tooltip + "' >" + submenuEntry.htmlLabel + "</span>";

			if (submenuEntry.istitle)
			{
				menuItem.text = '<b>' + submenuEntry.htmlLabel + '</b>';
				menuItem.activeClass = '';
				menuItem.href = '';
				menuItem.disabled = true;
				menuItem.disabledClass = '';
				menuItem.cls = 'ext-menu-header-item';
			}

			
			menuItem.style =
			{
				'padding-left' : '5px'
			}

			
			if (submenuEntry.disabled)
			{
				menuItem.disabled = true;
			}

			if (isLink)
			{
				menuItem.handler = radialmenu_submenu_onclick.createDelegate(window, [menuid, i]);
			}

			radialSubMenu.add(menuItem);
		}
	}

	return radialSubMenu;
}

/**
 * @lastrev fix37512 - remove unused parameter.
 */
function radialmenu_submenu_onclick(menuid, submenuid)
{
	
	var submenuEntry;

	if(!radialmenu_globals.menuInfo ||
	   !radialmenu_globals.menuInfo[menuid] ||
	   !radialmenu_globals.menuInfo[menuid].submenuCache)
	{
		return false;
	}

	submenuEntry = radialmenu_globals.menuInfo[menuid].submenuCache[submenuid];

	if(!submenuEntry)
		return false;

	var url;
	if(submenuEntry.onClickFn)
		url = submenuEntry.onClickFn(radialmenu_globals.menuInfo, submenuEntry, radialmenu_globals.item_identifier);
	else
		url = submenuEntry.url;

	
	radialmenu_dismiss(); 

	if(url)
		window.location.href = url;

	return false;
}
