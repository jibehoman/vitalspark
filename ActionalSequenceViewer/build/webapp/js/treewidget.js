





















var TreeWidget_UnChecked	= 0;
var TreeWidget_Checked		= 1;
var TreeWidget_Tristate		= 2;
var TreeWidget_Enabled		= 3;
var TreeWidget_Disabled		= 4;

var plusMinusImage;
var selIdPosition = 0;
var topIdPosition = 1;

var TreeWidget_plusImgCls;
var TreeWidget_minusImgCls;
var TreeWidget_checkedImgSrc;
var TreeWidget_uncheckedImgSrc;
var TreeWidget_disCheckedImgSrc;
var TreeWidget_disUncheckedImgSrc;

var TreeWidget_tristateImgSrc;
var TreeWidget_onRadioImgSrc;
var TreeWidget_offRadioImgSrc;
var TreeWidget_disOnRadioImgSrc;
var TreeWidget_disOffRadioImgSrc;

var unmanagedPrefix	= 'u_';		
var disabledPrefix	= 'd_';		
var prefixes = new Array(unmanagedPrefix, disabledPrefix);
var allPrefixes =
	new Array('', unmanagedPrefix, disabledPrefix,
			disabledPrefix + unmanagedPrefix,
			unmanagedPrefix + disabledPrefix);
var disabledPrefixes = new Array(disabledPrefix, disabledPrefix + unmanagedPrefix, unmanagedPrefix + disabledPrefix);
var managedPrefixes = new Array('', disabledPrefix);






var TreeWidget_Events = new Object();	

















































var debug = false;

function TreeViewOnClick(e, treeObj)
{
	
	var srcelem = (e.target) ? e.target : e.srcElement;
	if (srcelem && srcelem.className == 'button')
		return;

	if (srcelem.id == 'nodata_label')
		return;

	var context = buildContextFromEvent(treeObj, srcelem);

	if (eventIsPlusMinusClick(srcelem, context))
		return;

	if (eventIsCheckboxClick(srcelem, context))
		return;

	if (eventIsRadioButtonClick(srcelem, context))
		return;

	if (treeObj.itsId == 'from')
		context.itsTree.from = true;
	else if (treeObj.itsId == 'to')
		context.itsTree.to = true;
	else if (treeObj.itsId == 'where')
		context.itsTree.where = true;

	eventIsNodeTextClick(srcelem, context);

	return;
}

function eventIsPlusMinusClick(clickedel, context)
{
	plusMinusImage = null;

	if (!clickedel)
		return false;

	if (!clickedel.src)
		return false;

	var el = Ext.fly(clickedel);

	if (el.hasClass(TreeWidget_plusImgCls) || el.hasClass(TreeWidget_minusImgCls))
	{
		if (context.itsTree.disableCollapsing)
			return true;	

		plusMinusImage = clickedel;
		expandCollapseNode(context);
		return true;
	}

	return false;
}

function eventIsRadioButtonClick(srcelem, context)
{
	if (!srcelem)
		return false;

	if (!srcelem.src)
		return false;

	if (srcelem.src.indexOf("disabledoffradio.gif") >= 0)
		return true;

	if (srcelem.src.indexOf("disabledonradio.gif") >= 0)
		return true;

	if (srcelem.src.indexOf("onradio.gif") >= 0)
		return true;

	if (srcelem.src.indexOf("offradio.gif") >= 0)
	{
		updateRadioButtons(srcelem, context);
		return true;
	}

	
	return false;

}

function updateRadioButtons(srcelem, context)
{
	selectSingleRadioButton(srcelem, context.itsTree);
}





function selectSingleRadioButton(radioImg, treeObj)
{
	var parent = findMyParentNode(radioImg);

	if (!parent)
		return;

	var parentContext = buildContextFromTopElement(treeObj, parent);

	var onRadioImg = TreeWidget_onRadioImgSrc;
	var offRadioImg = TreeWidget_offRadioImgSrc;
	if (radioImg.src.indexOf("disabledoffradio.gif") >=0 || radioImg.src.indexOf("disabledonradio.gif") >=0)
	{
		onRadioImg = TreeWidget_disOnRadioImgSrc;
		offRadioImg = TreeWidget_disOffRadioImgSrc;
	}

	if (parentContext.children)
	{
		var child = parentContext.children.firstChild;
		while (child)
		{
			if (!child.firstChild)
				continue;

			var radio = findRadioButtonEl(child.firstChild.lastChild);

			if (radio && radio.src)
			{
				radio.src = offRadioImg;

				
				
				if (radio != radioImg)
					processRadioButtonDescendants(getFirstChild(child), TreeWidget_Disabled);
			}

			child = child.nextSibling;
		}
	}

	radioImg.src = onRadioImg;

	
	processRadioButtonDescendants(getFirstChild(findTopElement(radioImg)), TreeWidget_Enabled);
}





function processRadioButtonDescendants(child, changetoint)
{
	
	while (child && getIsValidTopElem(child))
	{
		
		if (child.firstChild)
		{
			
			
			
			

			
			var chkbxImg = findCheckboxEl(child.firstChild.lastChild);

			if (chkbxImg)
			{
				if (changetoint == TreeWidget_Enabled)
				{
					
					if (chkbxImg.src.indexOf("oncheckbox.gif") >= 0)
					{
						chkbxImg.src = TreeWidget_checkedImgSrc;
					}
					else if (chkbxImg.src.indexOf("offcheckbox.gif") >= 0)
					{
						chkbxImg.src = TreeWidget_uncheckedImgSrc;
					}
				}
				else if (changetoint == TreeWidget_Disabled)
				{
					if (chkbxImg.src.indexOf("oncheckbox.gif") >= 0)
					{
						chkbxImg.src = TreeWidget_disCheckedImgSrc;
					}
					else if (chkbxImg.src.indexOf("offcheckbox.gif") >= 0)
					{
						chkbxImg.src = TreeWidget_disUncheckedImgSrc;
					}
				}
			}

			
			
			processRadioButtonDescendants(getFirstChild(child), changetoint);
		}

		child = child.nextSibling;
	}
}

function eventIsCheckboxClick(srcelem, context)
{
	if (!srcelem)
		return false;

	if (!srcelem.src)
		return false;

	var changeto;
	var changetoint;

	if (srcelem.src.indexOf("disabledoffcheckbox.gif") >= 0)
		return true;
	if (srcelem.src.indexOf("disabledoncheckbox.gif") >= 0)
		return true;

	if (srcelem.src.indexOf("tristatecheckbox.gif") >= 0)
	{
		changeto = TreeWidget_uncheckedImgSrc;
		changetoint = TreeWidget_UnChecked;
		updateCheckedIds(srcelem, true, context.itsTree);
	}
	else if (srcelem.src.indexOf("oncheckbox.gif") >= 0)
	{
		changeto = TreeWidget_uncheckedImgSrc;
		changetoint = TreeWidget_UnChecked;
		updateCheckedIds(srcelem, true, context.itsTree);
	}
	else if (srcelem.src.indexOf("offcheckbox.gif") >= 0)
	{
		changeto = TreeWidget_checkedImgSrc;
		changetoint = TreeWidget_Checked;
		updateCheckedIds(srcelem, false, context.itsTree);
	}
	else
	{
		return false;		
	}

	updateCheckbox(srcelem, context, changeto, changetoint);
	return true;
}

function updateCheckbox(srcelem, context, changeto, changetoint)
{
	srcelem.src = changeto;

	if(context != null && !context.nodeIsLeaf)
	{
		
		
		
		
		

		if(context.children != null)
		{
			
			processChildrenCheckboxes(context.children.firstChild, changeto, changetoint, context.itsTree);
		}
		else
		{

		}

		
		if (isRootItem(context.itsTree.itsId, context.topElem.id))
			return;

		if (context.topElem.parentElement)
			processParentCheckboxes(context.itsTree, context.topElem.parentElement);
		else if (context.topElem.parentNode)
			processParentCheckboxes(context.itsTree, context.topElem.parentNode);
	}
}

function updateCheckedIds(srcelem, remove, treeObj)
{
	
	if (treeObj.submitAllIds)
		return;

	if (remove)
	{
		if (!treeObj.CheckedIDs)
			return;

		var uncheckedID = findTopElement(srcelem);

		for (var i = 0; i < treeObj.CheckedIDs.length; i++)
		{
			if (TreeWidget_extractCleanId(treeObj.CheckedIDs[i], treeObj.itsId) ==
				TreeWidget_extractCleanId(uncheckedID.id, treeObj.itsId))
			{
				treeObj.CheckedIDs[i] = null;
			}
		}

		if (treeObj.cascadingEnabled)
		{
			processDescendantSelection(treeObj, uncheckedID, "remove");
			if (isImplicitlySelectedID(treeObj, uncheckedID.id))
				processAncestorSelection(treeObj, uncheckedID, "markSiblingsAsExplicitlySelected");
			processAncestorSelection(treeObj, uncheckedID, "update", "afterRemoval");
			if (debug) alert( renderSelectedTreeLists(treeObj) );
		}
	}
	else
	{
		
		
		var newlychecked = findTopElement(srcelem);

		
		

		if (treeObj.cascadingEnabled)
			processDescendantSelection(treeObj, newlychecked, "remove");

		if (!treeObj.TriStateIDs)
		{
			treeObj.TriStateIDs = new Array(1);
			treeObj.TriStateIDs[0] = null;
		}
		markAsExplicitlySelected(treeObj, newlychecked.id);

		if (treeObj.cascadingEnabled)
		{
			processAncestorSelection(treeObj, newlychecked, "update");
			if (debug) alert( renderSelectedTreeLists(treeObj) );
		}
	}
}

function eventIsNodeTextClick(clickedel, context)
{
	if (!clickedel)
		return false;

	if (TreeWidget_isDisabled(context))
		return false;

	
	if (context.itsTree.multiselect)
	{
		
		
		if (clickedel.id == "inner")
			handleEventAsControlClick(clickedel.lastChild, context);
		else if (clickedel.tagName == "SPAN")
			handleEventAsControlClick(clickedel, context);
		else if (clickedel.parentElement && clickedel.parentElement.tagName == 'SPAN')
			handleEventAsControlClick(clickedel.parentElement, context);

		return true;
	}

	if (imageClick(clickedel) || clickedel.id == "inner" || clickedel.tagName == 'SPAN' ||
		(clickedel.parentElement && clickedel.parentElement.tagName == 'SPAN'))
	{
		updateSingleSelection(clickedel, context);

		
		
		if (context.itsTree.overview)
			NetworkBrowser_selectionChanged('treeview', 'node', TreeWidget_extractCleanId(context.itsTree.SelectedID, context.itsTree.itsId));

		
		TreeWidget_notifyObservers(context.itsTree.itsId, 'treeselectionchanged', context.itsTree);

		return true;
	}

	return false;
}


function handleEventAsControlClick(lastElement, context)
{
	
	
	var radio = findRadioButtonEl(lastElement);

	if (radio)
		eventIsRadioButtonClick(radio, context);
	else
		eventIsCheckboxClick(findCheckboxEl(lastElement), context);
}






function TreeWidget_registerObserver(tree_id, event_id, observer_id, callbackfct)
{

	if (!TreeWidget_Events[tree_id])
		TreeWidget_Events[tree_id] = [];
	Observer_registerObserver(TreeWidget_Events[tree_id], event_id, observer_id, callbackfct);
}





function TreeWidget_notifyObservers(tree_id, event_id, thisObj)
{

	var eventObservers = TreeWidget_Events[tree_id];
	if (!eventObservers)
		eventObservers = [];
	Observer_fireEvent(eventObservers, 'treeselectionchanged', thisObj, [tree_id, event_id]);
}









function getElemPath(treeID, elem)
{
	var topElem = findTopElement(elem);

	if(!topElem)
		return;

	if (isAllOptionsElement(topElem))
		return extractTextFromElem(topElem);
	if (isRootItem(treeID, topElem.id ))
		return '/' + extractTextFromElem(topElem);
	else
	{
		var parentElem = getParent(topElem);
		if (!parentElem)
			return '{invalid item}';
		return getElemPath(treeID, parentElem) + '/' + extractTextFromElem(topElem);
	}
}


function getImageHTML(treeID, elem)
{
	if (!elem || !elem.tagName)
		return;
	var imgElem = null;
	if (isTreeIconImage(elem))
	{
		
		imgElem = elem;
	}
	else if (elem.tagName.toUpperCase() == "SPAN")
	{
		
		return getImageHTML(treeID, elem.previousSibling);
	}
	else if (elem.tagName.toUpperCase() == "DIV")
	{
		
		if (elem.firstChild.tagName.toUpperCase() == "DIV")
		{
			return getImageHTML(treeID, elem.firstChild);
		}
		else
		{

			var child = elem.lastChild;
			while (child)
			{
				if (isTreeIconImage(child))
					break;
				child = child.previousSibling;
			}
			imgElem = child;
		}
	}

	if (imgElem)
		return "<img src='" + imgElem.src + "'>";
	else
		return null;
}


function isTreeIconImage(elem)
{
	return elem && elem.tagName.toUpperCase() == "IMG" && elem.className == "treeicon";
}







function isAllOptionsElement(elem)
{
	if (elem.id.indexOf("ALL_OPTION_TREE") >= 0)
		return true;
	else
		return false;
}










function extractTextFromElem(elem)
{
	var topElem = findTopElement(elem);
	if (!topElem.firstChild.firstChild)
		return '{no child}';
	var firstChild = topElem.firstChild.firstChild;

	
	
	
	var textSpan = firstChild;
	while (textSpan.nextSibling)
		textSpan = textSpan.nextSibling;

	return textSpan.innerText;
}


function imageClick(srcelem)
{
	if (!srcelem)
		return false;

	if (!srcelem.src)
		return false;

	
	return true;
}

function buildContextFromEvent(treeObj, srcelem)
{
	var context;
	var topElem;

	topElem = findTopElement(srcelem);

	if(!topElem)
		return null;

	context = buildContextFromTopElement(treeObj, topElem);

	return context;
}

function findTopElement(elem)
{
	if(getIsValidTopElem(elem))
		return elem;

	
	if(!elem || elem.className == "loader")
		return null;

	return findTopElement(elem.parentNode);
}

function getIsValidTopElem(topElem)
{
	if(!topElem || !topElem.id)
		return false;

	if(topElem.id == 'inner')
		return false;

	if(topElem.tagName != 'DIV')
		return false;

	return	true;
}

function buildContextFromTopElement(treeObj, topElem)
{
	var context = new Object();

	context.itsTree = treeObj;

	context.topElem = topElem;
	context.children = null;  
				  
				  
	context.nodeIsLeaf = false;
	context.loader = null; 
	context.nextndx = 0;

	if(context.topElem != null)
	{
		context.nodeIsLeaf = false; 

		findInnerDiv(context);
		findChildren(context);


		if(context.innerDiv)
			context.nodeDiv = context.innerDiv;
		else
			context.nodeDiv = context.topElem;
	}

	return context;
}

function findInnerDiv(context)
{
	var elem = context.topElem.firstChild;

	while(elem != null)
	{
		if(elem.id == "inner")
		{
			context.innerDiv = elem;
			return;
		}

		elem = elem.nextSibling;
	}

	context.innerDiv = null;
}

function findChildren(context)
{
	if (!context)
		return;

	var kid = context.topElem.firstChild;

	while(kid != null)
	{
		if(kid.className == "childrenDiv")
		{
			context.children = kid;
			return;
		}

		kid = kid.nextSibling;
	}

	context.children = null;
}

function expandCollapseNode(context)
{
	if(context != null && !context.nodeIsLeaf)
	{
		if(context.children != null)
		{
			if(context.children.style.display == "none")
			{
				setNodeState(context, true);

				
			}
			else
			{
				setNodeState(context, false);
			}
		}
		else
		{
			startGettingChildren(context);
		}
	}
}

function processChildrenCheckboxes(child, changeto, changetoint, treeObj)
{
	
	if (!treeObj.downwardCheckboxCascadingEnabled)
		return;
	while (child && getIsValidTopElem(child))
	{
		
		if (child.firstChild)
		{
			
			var radio = findRadioButtonEl(child.firstChild.lastChild);

			if (radio)
			{
				
				if (changetoint == TreeWidget_Checked)
					processChildrenRadios(child, TreeWidget_Enabled);
				else
					processChildrenRadios(child, TreeWidget_Disabled);

				return;
			}

			
			
			var chkbx = findCheckboxEl(child.firstChild.lastChild);

			if (chkbx)			
				chkbx.src = changeto;

			if (changetoint == TreeWidget_Checked)
			{
				
				
				
				var checkedlen = treeObj.CheckedIDs ? treeObj.CheckedIDs.length : 0;
				for (var i = 0; i < checkedlen; i++)
				{
					var a = treeObj.CheckedIDs[i];
					var b = findTopElement(chkbx);
					b = b?b.id:b;
					if (a == b)
					{
						treeObj.CheckedIDs[i] = null;
						break;
					}
				}
			}

			
			var childrenDiv = child.firstChild.nextSibling;
			if (childrenDiv && childrenDiv.className == "childrenDiv")  
			{
				
				processChildrenCheckboxes(childrenDiv.firstChild, changeto, changetoint, treeObj);
			}
		}

		child = child.nextSibling;
	}
}






function processChildrenRadios(child, changetoint)
{
	while (child)
	{
		var radio = findRadioButtonEl(child.firstChild.lastChild);
		if (changetoint == TreeWidget_Enabled)
		{
			
			if (radio.src.indexOf("onradio.gif") >= 0)
			{
				radio.src = TreeWidget_onRadioImgSrc;
			}
			else if (radio.src.indexOf("offradio.gif") >= 0)
			{
				radio.src = TreeWidget_offRadioImgSrc;
			}
		}
		else if (changetoint == TreeWidget_Disabled)
		{
			
			if (radio.src.indexOf("onradio.gif") >= 0)
			{
				radio.src = TreeWidget_disOnRadioImgSrc;
			}
			else if (radio.src.indexOf("offradio.gif") >= 0)
			{
				radio.src = TreeWidget_disOffRadioImgSrc;
			}
		}

		
		if (radio.src.indexOf("onradio.gif") >= 0)
			processRadioButtonDescendants(getFirstChild(child), changetoint);
		else if (changetoint == TreeWidget_Enabled)
		{
			
			
			processRadioButtonDescendants(getFirstChild(child), TreeWidget_Disabled);
		}

		child = child.nextSibling;
	}
}


function findRadioButtonEl(child)
{
	
	
	
	var imgcount = 0;
	while (child && imgcount < 2)
	{
		if(child.src)		
		{
			if (imgcount && child.src.indexOf('radio') >= 0)
				return child;
			imgcount++;
		}

		child = child.previousSibling;
	}

	return null;
}

function findCheckboxEl(child)
{
	
	
	

	var imgcount = 0;
	while (child && imgcount < 2)
	{
		if(child.src)		
		{
			if (imgcount && child.src.indexOf('checkbox') >= 0)
				return child;
			imgcount++;
		}

		child = child.previousSibling;
	}
}

function evaluateKidsCheckboxState(treeObj, parent)
{
	var isUnChecked = false;
	var isChecked = false;
	var isTristate = false;

	var childrenDiv = parent.lastChild;
	var childID = childrenDiv.firstChild;

	while (childID)
	{
		var childelement = childID.firstChild;

		while (childelement)
		{
			var checkbox = findCheckboxEl(childelement.lastChild);
			if (checkbox && checkbox.src)
			{
				if (checkbox.src.indexOf("offcheckbox.gif") >= 0)
					isUnChecked = true;
				else if (checkbox.src.indexOf("oncheckbox.gif") >= 0)
					isChecked = true;
				else if (checkbox.src.indexOf("tristatecheckbox.gif") >= 0)
					isTristate = true;
			}
			else
			{
				
				
				
				if (treeObj.dependenciesMode)
				{
					if (TreeWidget_checkedImgSrc == evaluateKidsCheckboxState(treeObj, childID))
					{
						isChecked = true;
					}
				}
			}

			childelement = childelement.nextSibling;
		}

		childID = childID.nextSibling;
	}

	
	
	if (treeObj.dependenciesMode)
	{
		if (isChecked)
			return TreeWidget_checkedImgSrc;

		return TreeWidget_uncheckedImgSrc;
	}

	if (isTristate || (isUnChecked && isChecked))
		return TreeWidget_tristateImgSrc;
	else if (isUnChecked)
		return TreeWidget_uncheckedImgSrc;

	return TreeWidget_checkedImgSrc;
}

function processParentCheckboxes(treeObj, thischilddiv)
{
	
	if (!treeObj.upwardCheckboxCascadingEnabled)
		return;

	
	var imgcount = 0;
	var currentCheckBox = -1;

	
	var thisparentIDdiv = thischilddiv.parentElement?thischilddiv.parentElement:thischilddiv.parentNode;

	if (!getIsValidTopElem(thisparentIDdiv))
		return;

	
	
	var changeParentToSrc = evaluateKidsCheckboxState(treeObj, thisparentIDdiv);

	
	
	if (treeObj.dependenciesMode && changeParentToSrc == TreeWidget_uncheckedImgSrc &&
		!isExportTypeID(treeObj.itsId, thisparentIDdiv.id))
	{
		return;
	}

	var thisparentinnerdiv = thisparentIDdiv.firstChild;

	if (!thisparentinnerdiv)
		return;

	var checkbox = findCheckboxEl(thisparentinnerdiv.lastChild);

	if (checkbox && checkbox.src)
	{
		
		
		
		
		if (checkbox.src.indexOf(changeParentToSrc) == -1)
		{
			checkbox.src = changeParentToSrc;

			if (isRootItem(treeObj.itsId, thisparentIDdiv.id))
				return;
		}
	}

	
	var parentEl = findMyParentNode(thisparentinnerdiv);

	if (parentEl)
		processParentCheckboxes(treeObj, parentEl.lastChild);
}

function findMyParentNode(innerel)
{
	var myTopNode = findTopElement(innerel);

	if (document.all)
		return findTopElement(myTopNode.parentElement);

	return findTopElement(myTopNode.parentNode);
}

function setNodeState(context, isExpanded)
{
	var tagId;

	if (!plusMinusImage)
		return;

	if(isExpanded)
	{
		Ext.fly(plusMinusImage).replaceClass(TreeWidget_plusImgCls, TreeWidget_minusImgCls);
		context.children.style.display = "";

		if(context.loader)
			context.loader.style.display = "";
	}
	else
	{
		Ext.fly(plusMinusImage).replaceClass(TreeWidget_minusImgCls, TreeWidget_plusImgCls);
		context.children.style.display = "none";

		if(context.loader)
			context.loader.style.display = "none";
	}
}

function updateSingleSelection(elem, context)
{
	if ( (context && context.itsTree.multiselect) || !elem)
		return;

	
	var topel = findTopElement(elem);
	if (!topel)
		return;

	var elemID = topel.id;

	if(elemID == "treedata_" + context.itsTree.itsId)
		return;

	if (context.itsTree.SelectedID && context.itsTree.SelectedID == elemID)
		return;

	
	
	if (context.itsTree.isDimensionMbrTree || context.itsTree.isDimensionTree)
	{
		var innerdiv = findInnerDivForID(elemID, context.itsTree);
		if (innerdiv && innerdiv.lastChild && innerdiv.firstChild)
		{
			var isparent = false;

			var el = Ext.fly(innerdiv.firstChild);
			if (el.hasClass(TreeWidget_plusImgCls) || el.hasClass(TreeWidget_minusImgCls))
				isparent = true;

			
			
			

			var isDimension = false;
			var child = innerdiv.lastChild;
			while (child)
			{
				if (child.className && child.className == "treeicon" &&
					child.src && child.src.indexOf('dimension') >= 0)
				{
					isDimension = true;
					break;
				}

				child = child.previousSibling;
			}

			
			if (context.itsTree.isDimensionMbrTree)
			{
				if (isDimension && isparent)
					return;
			}
			else 
			{
				if (!isDimension || !isparent)
					return;
			}
		}
	}

	if (context.itsTree.SelectedID && context.itsTree.SelectedID != KEYID_FOR_NONE)
	{
		clearSingleSelectionStyle(context.itsTree);
	}

	if (context)
	{
		findInnerDiv(context);
		elem = context.innerDiv?context.innerDiv.lastChild:elem;
	}

	setSingleSelectionStyle(elem, elemID, context.itsTree);
}

function TreeWidget_deSelectSingleSelection(treeObj)
{
	if (treeObj.multiselect || !treeObj.SelectedID)
		return;

	clearSingleSelectionStyle(treeObj);
}

function clearSingleSelectionStyle(treeObj)
{
	var innerdiv = findInnerDivForID(treeObj.SelectedID, treeObj);
	var selectedItem;
	if (innerdiv)
		selectedItem = innerdiv.lastChild; 

	if (!selectedItem || selectedItem.tagName != 'SPAN')
		return;	

	
	Ext.fly(selectedItem).removeClass('act-tree-widget-selected-node-text');

	treeObj.SelectedID = "";
}

function setSingleSelectionStyle(elem, id, treeObj)
{
	if (!elem)
		return;

	
	Ext.fly(elem).addClass('act-tree-widget-selected-node-text');

	treeObj.SelectedID = id;
}

function setPreSelectedSingleSelection(treeObj)
{
	if (!treeObj.SelectedID)
		return;

	var elem = findInnerDivForID(treeObj.SelectedID, treeObj);

	if (!elem)
		return;

	var topel = findTopElement(elem);
	if (!topel)
		return;

	setSingleSelectionStyle(elem.lastChild, topel.id, treeObj);
}

function setPreSelectedMultiSelection(treeObj)
{
	if (!treeObj.CheckedIDs)
		return;

	if (treeObj.cascadingEnabled)
	{
		setPreSelectedMultiSelectionWithCascading(treeObj);
		return;
	}

	for (var i = 0; i < treeObj.CheckedIDs.length; i++)
	{
		var elem = findInnerDivForID(treeObj.CheckedIDs[i], treeObj);

		if (!elem)
			continue;

		
		
		var chkbx = findCheckboxEl(elem.lastChild);

		if (chkbx)			
			chkbx.src = TreeWidget_checkedImgSrc;
	}
}

function setPreSelectedMultiSelectionWithCascading(treeObj)
{
	if (!treeObj.CheckedIDs)
		return;

	var selectedIds = new Array();

	
	
	while (treeObj.CheckedIDs.length > 0)
	{
		selectedIds.push(treeObj.CheckedIDs.shift());
	}

	while (selectedIds.length > 0)
	{
		var selId = selectedIds.shift();

		var innerDiv = findInnerDivForID(selId, treeObj);

		if (!innerDiv)
			continue;

		
		
		var radio = findRadioButtonEl(innerDiv.lastChild);

		if (radio)
		{
			selectSingleRadioButton(radio, treeObj);

			
			var parent = findMyParentNode(radio);

			if (!parent)
				continue;

			selectCheckbox(parent.firstChild, treeObj, buildContextFromTopElement(treeObj, parent));
		}
		else
		{
			selectCheckbox(innerDiv, treeObj, buildContextFromEvent(treeObj, innerDiv));
		}
	}
}

function selectCheckbox(innerDiv, treeObj, context)
{
	
	
	var checkBox = findCheckboxEl(innerDiv.lastChild);

	if (!checkBox)
		return;

	
	updateCheckbox(checkBox, context, TreeWidget_checkedImgSrc, TreeWidget_Checked);
}

function TreeWidget_expandHiddenSelectionIfNeeded(selectionid, treeObj)
{
	var innerdiv = findInnerDivForID(selectionid, treeObj);
	if (innerdiv)
	{
		var context = buildContextFromEvent(treeObj, innerdiv);

		updateSingleSelection(innerdiv.lastChild, context);
		return;
	}
	else  
	{
		EnumParentIdsAsync(selectionid, acceptIDsToExpandRequest, abortExpandRequest, treeObj, true);
	}
}

function findInnerDivForID(selID, treeObj)
{
	var selectedTopElement = findTopElemFromId(treeObj, selID);

	if (!selectedTopElement)
		return null;

	return selectedTopElement.firstChild;
}

function getMoreNodes(context)
{
	if(context.children.id != null)
		context.nextndx = context.children.id;
}

function startGettingChildren(context)
{
	var chbx = setupInnerDivAndChildrenDiv(context);
	var ischecked = chbx && chbx.src.indexOf("oncheckbox.gif") >= 0;

	

	

	context.nextndx = 0;

	EnumAsync(getUid(context.topElem), acceptExpandRequest, context, ischecked);
}

function getUid(topElem)
{
	if(!getIsValidTopElem(topElem))
		return null;

	return topElem.id;
}

function setupInnerDivAndChildrenDiv(context)
{
	var childrenNode;

	if(!context.innerDiv)
	{
		var divelem;

		divelem = document.createElement('DIV');
		divelem.id = 'inner';

		nodelist = context.topElem.childNodes;

		while(context.topElem.firstChild)
		{
			var node = context.topElem.firstChild;

			node = context.topElem.removeChild(node);
			divelem.appendChild(node);
		}

		context.topElem.appendChild(divelem);

		context.innerDiv = divelem;
		context.nodeDiv = divelem;
	}

	if(context.children)
	{
		context.children.parentNode.removeChild(context.children);
	}

	childrenNode = document.createElement('DIV');
	childrenNode.className = 'childrenDiv';

	childrenNode.style.marginLeft = '16px';

	context.topElem.appendChild(childrenNode);

	context.children = childrenNode;

	
	
	return findCheckboxEl(context.innerDiv.lastChild);
}

function TreeWidget_extractCleanId(id, treeId)
{
	var strippedId = id;
	var idprefix = treeId + '_';
	if (id && id.indexOf(idprefix) == 0)
		strippedId = id.substring(idprefix.length);

	var prefixStripped;
	var currentPrefix;
	do
	{
		prefixStripped = false;
		for (prefixIdx = 0; prefixIdx < prefixes.length; prefixIdx++)
		{
			currentPrefix = prefixes[prefixIdx];
			if (strippedId && strippedId.indexOf(currentPrefix) == 0)
			{
				strippedId = strippedId.substring(currentPrefix.length);
				prefixStripped = true;
			}
		}
	} while (prefixStripped);

	return strippedId;
}

function TreeWidget_getCleanId(context)
{
	return TreeWidget_extractCleanId(context.topElem.id, context.itsTree.itsId);
}

function TreeWidget_setTreeProperty(treeObj, property, value)
{
	if (!treeObj || !property)
		return;

	treeObj[property] = value;
}



function TreeWidget_isDisabled(context)
{
	var topel = context.topElem;
	if (!topel)
		return false;

	var elemID = topel.id;

	var idprefix = context.itsTree.itsId + '_';

	
	if (elemID && elemID.indexOf(idprefix) == 0)
		elemID = elemID.substring(idprefix.length);

	for (i = 0; i < disabledPrefixes.length; i++)
	{
		if (elemID && elemID.indexOf(disabledPrefixes[i]) == 0)
			return true;
	}

	return false;
}


function isManagedID(treeId, keyid)
{
	if (!keyid)
		return false;

	for (idx = 0; idx < managedPrefixes.length; idx++)
	{
		if (keyid.indexOf(managedPrefixes[idx]) == 0
		    && document.getElementById(treeId + '_' + managedPrefixes[idx] + keyid))
			return true;
	}

	return false;
}




function isExportTypeID(treeId, keyId)
{
	var cleanId = TreeWidget_extractCleanId(keyId, treeId);
	var prefix = cleanId.substr(0, 2);

	return prefix == "c_" || prefix == "r_";
}


function isRootItem(treeId, keyid)
{
	var elem = findTopElemFromId_withTreeid(treeId, keyid);

	if (elem && elem.parentElement)
		return ((elem.parentElement.id) == ("treedata_" + treeId));
	else if (elem && elem.parentNode)
		return ((elem.parentNode.id) == ("treedata_" + treeId));
	return false;
}


function findRootItem(treeId)
{
	var treeDataElem = document.getElementById("treedata_" + treeId);

	if (!treeDataElem)
		return null;

	var rootElem = treeDataElem.firstChild;

	if (rootElem)
		return rootElem;
}

function findTopElemFromId(treeObj, itemId)
{
	return findTopElemFromId_withTreeid(treeObj.itsId, itemId);
}



function findTopElemFromId_withTreeid(treeId, itemId)
{
	var cleanElemId = TreeWidget_extractCleanId(itemId, treeId);

	var treePrefix = treeId + '_';

	var topElem;
	for (i = 0; i < allPrefixes.length; i++)
	{
		topElem = document.getElementById(treePrefix + allPrefixes[i] + cleanElemId);

		if (topElem)
			return topElem;
	}

	return topElem;
}

function EnumAsync(uniqueid, acceptFn, context, ischecked)
{
	notifyStart(context.itsTree);
	var urlstring = buildBaseUrl(uniqueid, ischecked, context.itsTree)+ "&networktree=";
	urlstring += ((context.itsTree.isDimensionMbrTree || context.itsTree.isDimensionTree)?"false":"true");

	return XMLHttp_GetAsyncRequest(urlstring, acceptHandler, getHandlerDataObject(context, acceptFn, null), abortHandler);
}

function EnumParentIdsAsync(uniqueid, acceptFn, abortFn, aTree, ischecked)
{
	notifyStart(aTree);
	aTree.nodeIdForParentExpansion = uniqueid;
	var urlstring = buildBaseUrl(uniqueid, false, aTree)+ "&networktree=true"+'&findIdsToExpand=true';

	return XMLHttp_GetAsyncRequest(urlstring, acceptHandler, getHandlerDataObject(aTree, acceptFn, abortFn), abortHandler, 'findparentids');
}

function EnumForceExpandAsync(uniqueid, acceptFn, abortFn, aTree, ischecked)
{
	notifyStart(aTree);
	var urlstring = buildBaseUrl(uniqueid, ischecked, aTree)+ "&networktree=true" + '&forceExpand=true';

	return XMLHttp_GetAsyncRequest(urlstring, acceptHandler, getHandlerDataObject(aTree, acceptFn, abortFn), abortHandler, 'forceexpand');
}

function reloadTree(aTree)
{
	notifyStart(aTree);
	var params = buildUrlEncodedParamList(null, false, aTree)+ "&networktree=true&reloadTree=true";
	params = params + "&treeState=" + encodeURI(composeCurrentTreeState(aTree));

	return XMLHttp_PostAsyncRequest(
			getContextUrl(),
			params,
			acceptHandler,
			getHandlerDataObject(aTree, acceptReloadRequest, null),
			abortHandler,
			'realoadtree',
			false);
}

function buildBaseUrl(uniqueid, ischecked, treeObj)
{
	return getContextUrl() + "?" + buildUrlEncodedParamList(uniqueid, ischecked, treeObj);
}

function getContextUrl()
{
	return contextUrl("admin/networktree.jsrv");
}

function buildUrlEncodedParamList(uniqueid, ischecked, treeObj)
{
	var paramList = '';
	var needSeparator = false;

	if (treeObj.itsParamsList)
	{
		var params = treeObj.itsParamsList.split(',');

		var paramName, paramValue;
		for (var i = 0; i < params.length; i++)
		{
			paramName = params[i];
			paramValue = treeObj[paramName];

			if (paramName && paramValue)
			{
				if (needSeparator)
					paramList += "&";
				paramList += paramName + "=" + paramValue;
				needSeparator = true;
			}
		}
	}

	
	if (uniqueid)
	{
		if (needSeparator)
			paramList += "&";
		paramList += "uniqueid=" + TreeWidget_extractCleanId(uniqueid, treeObj.itsId);
		needSeparator = true;
	}

	if (ischecked)
	{
		if (needSeparator)
			paramList += "&";

		paramList += "ischecked=" + ischecked;
	}

	return paramList;
}




function notifyStart(treeObj)
{
	
	
	if (!treeObj || !treeObj.notification_container_id)
		return;

	if (!treeObj.reqCount)
		treeObj.reqCount = 0;
	treeObj.reqCount = treeObj.reqCount + 1;

	var imageSrc = treeObj.loadingImageSrc;
	if (!imageSrc)
		imageSrc = 'loading.gif';
	var loadingHtml = "<img src='" + imageSrc + "'>";

	setInnerHtmlToElementWithId(treeObj.notification_container_id, loadingHtml);
}




function notifyEnd(dataObj)
{
	if (!dataObj)
		return;

	var treeObj = dataObj;
	if (!dataObj.notification_container_id)
	{
		
		if (dataObj.itsTree && dataObj.itsTree.notification_container_id)
			treeObj = dataObj.itsTree;
		else
		{
			
			
			return;
		}
	}
	

	treeObj.reqCount = treeObj.reqCount - 1;
	if (treeObj.reqCount > 0)
		return;

	setInnerHtmlToElementWithId(treeObj.notification_container_id, "");
}








function getHandlerDataObject(data, userAcceptFn, userAbortFn)
{
	return { itsData: data, itsAcceptFn: userAcceptFn, itsAbortFn: userAbortFn };
}










function acceptHandler(response, dataObject, status, statusText)
{
	if (!dataObject)
		return;

	var acceptFn = dataObject.itsAcceptFn;
	var userData = dataObject.itsData;

	notifyEnd(userData);

	if (acceptFn)
		acceptFn(response, userData, status, statusText);
}










function abortHandler(dataObject)
{
	if (!dataObject)
		return;

	var abortFn = dataObject.itsAbortFn;
	var userData = dataObject.itsData;

	notifyEnd(userData);

	if (abortFn)
		abortFn(userData);
}

function acceptExpandRequest(reply, context, status, statustext)
{
	findChildren(context);





	if(context.children != null)
	{
		var nextNode;

		setNodeState(context, true);

		
		if (status != 200)
		{
			var rexp = /\+/g;
			appendReply(context.children, '<i style="color:red">Failed contacting server:</i> ' + statustext.replace(rexp, ' '));
		}
		else
			appendReply(context.children, reply);

		nextNode = findNextNode(context);
		
		

		if(nextNode != null)
		{
			context.children.id = nextNode.id;
			nextNode.parentNode.removeChild(nextNode);

			context.children.haskids = context.children.id >= 0;

			
		}
		else
		{
			context.children.haskids = null;
		}
	}
	else
	{
		alert("html page error");
	}
}

function acceptIDsToExpandRequest(reply, aTree, status, statustext)
{
	
	if (status != 200)
	{
		var topElContext = findTopNodeContextForForcedExpand(aTree);
		if (!topElContext)
			return;
		var rexp = /\+/g;
		appendReply(topElContext.children, '<i style="color:red">Failed contacting server:</i> ' + statustext.replace(rexp, ' '));
	}

	var array = eval(reply);

	if (!array)
		return;

	var topNodeID;
	
	for (var i = array.length-1; i >= 0; i--)
	{
		
		var innerdiv = findInnerDivForID(array[i], aTree);
		if (innerdiv)
		{
			array[i+1] = null;
			topNodeID = array[i];
		}
	}

	aTree.parentIds = new Array();
	aTree.parentIds[selIdPosition] = aTree.nodeIdForParentExpansion;
	aTree.parentIds[topIdPosition]= topNodeID;

	EnumForceExpandAsync(aTree.nodeIdForParentExpansion + '&expandArray='+array, acceptForceExpandRequest, abortExpandRequest, aTree, true);
}

function findTopNodeContextForForcedExpand(aTree)
{
	if (!aTree || !aTree.parentIds)
		return;
	var topelInnerdiv = findInnerDivForID(aTree.parentIds[topIdPosition], aTree);
	if (topelInnerdiv)
	{
		
		var plusminus = topelInnerdiv.firstChild;
		if (plusminus && plusminus.src)
		{
			Ext.fly(plusminus).replaceClass(TreeWidget_plusImgCls, TreeWidget_minusImgCls);
		}
	}

	return buildContextFromEvent(aTree, topelInnerdiv);
}

function acceptForceExpandRequest(reply, aTree, status, statustext)
{
	if (!reply || !aTree || !aTree.parentIds)
		return;

	var context = findTopNodeContextForForcedExpand(aTree);
	if (!context)
		return;

	context.itsTree = aTree;
	setupInnerDivAndChildrenDiv(context);
	context.nextndx = 0;

	acceptExpandRequest(reply, context, status, statustext);

	var selinnerdiv = findInnerDivForID(aTree.parentIds[selIdPosition], context.itsTree);
	if (selinnerdiv)
	{
		var elCtx = buildContextFromEvent(aTree, selinnerdiv);
		updateSingleSelection(selinnerdiv.lastChild, elCtx);
	}
}

function findNextNode(context)
{
	var kid = context.children.lastChild;

	while(kid != null)
	{
		if(kid.className == "Next")
		{
			return kid;
		}

		kid = kid.prevSibling;
	}

	return null;
}

function abortExpandRequest(context)
{


	setNodeState(context, false);


}

function acceptReloadRequest(reply, userData, status, statusText)
{
	if (status != 200)
	{
		return; 
	}

	treeViewSpan = document.getElementById('treedata_' + userData.itsId);
	treeViewSpan.innerHTML = reply;
	updateTreeSelection(userData);
}

function composeCurrentTreeState(treeObj)
{
	var currentElemState = '';

	var rootElem = findRootItem(treeObj.itsId);
	while (rootElem && getIsValidTopElem(rootElem))
	{
		currentElemState = currentElemState + extractTreeState(treeObj, rootElem);

		rootElem = rootElem.nextSibling;
	}

	return currentElemState;
}

function extractTreeState(treeObj, elem)
{
	var currentElemState = '';

	
	if (getFirstChild(elem))
	{
		
		currentElemState += TreeWidget_extractCleanId(elem.id, treeObj.itsId) + '|';

		var child = getFirstChild(elem);
		while (child)
		{
			currentElemState += extractTreeState(treeObj, child);
			child = child.nextSibling;
		}
	}

	return currentElemState;
}

function appendReply(elem, reply)
{
	if(elem && !elem.firstChild)
	{
		if (document.layers)
		{
			elem.document.write(reply);
			elem.document.close();
		}
		else if ((document.all || document.getElementById) && typeof(elem.innerHTML) != 'undefined')
		{
			elem.innerHTML = reply;
		}
		else
		{
			alert('Failed to perform node expansion - incompatible Browser');
		}
	}
	else
	{
		if ((document.all || document.getElementById) && typeof(elem.innerHTML) != 'undefined')
		{
			elem.innerHTML += reply;
		}
		else
		{
			alert('Failed to perform node expansion - incompatible Browser');
		}
	}
}


function TreeWidget_onPageLoad(treeObj)
{
	TreeWidget_plusImgCls		= "act-tree-widget-plus-image";
	TreeWidget_minusImgCls		= "act-tree-widget-minus-image";
	TreeWidget_checkedImgSrc	= contextUrl("images/oncheckbox.gif");
	TreeWidget_uncheckedImgSrc	= contextUrl("images/offcheckbox.gif");
	TreeWidget_disCheckedImgSrc	= contextUrl("images/disabledoncheckbox.gif");
	TreeWidget_disUncheckedImgSrc	= contextUrl("images/disabledoffcheckbox.gif");
	TreeWidget_tristateImgSrc 	= contextUrl("images/tristatecheckbox.gif");

	TreeWidget_onRadioImgSrc	= contextUrl("images/onradio.gif");
	TreeWidget_offRadioImgSrc	= contextUrl("images/offradio.gif");
	TreeWidget_disOnRadioImgSrc	= contextUrl("images/disabledonradio.gif");
	TreeWidget_disOffRadioImgSrc	= contextUrl("images/disabledoffradio.gif");

	var treeview = document.getElementById(treeObj.itsId + '_container');

	if(treeview.addEventListener)
	{
		
		treeview.addEventListener("click", function (event) { return TreeViewOnClick(event, treeObj); }, true);
	}
	else
	{
		treeview.onclick = function () { return TreeViewOnClick(event, treeObj); };
	}

	updateTreeSelection(treeObj);
}

function updateTreeSelection(treeObj)
{

	if (treeObj.multiselect)
		setPreSelectedMultiSelection(treeObj);
	else
	{
		setPreSelectedSingleSelection(treeObj);

		
		TreeWidget_notifyObservers(treeObj.itsId, 'treeselectionchanged', treeObj);
	}

	
	
	
	
	
	
	if (treeObj.dependenciesMode)
		fixInitialRadioStates(treeObj);
}

function fixInitialRadioStates(treeObj)
{
	setInitialRadioStates(findRootItem(treeObj.itsId));
}

function setInitialRadioStates(child)
{
	while (child && getIsValidTopElem(child))
	{
		
		if (child.firstChild)
		{
			
			var radioImg = findRadioButtonEl(child.firstChild.lastChild);

			if (radioImg)
			{
				processChildrenRadios(child, TreeWidget_Enabled);

				
				return;
			}

			
			var chkbxImg = findCheckboxEl(child.firstChild.lastChild);
			if (chkbxImg)
			{
				
				setInitialRadioStates(getFirstChild(child));
			}
		}

		child = child.nextSibling;
	}
}

function SelectUnselectNode(context)
{
	UnselectAllNodes();
	SelectNode(context.topElem);
}

function UnselectAllNodes()
{
	var entries = getSelectedEntries();

	for(var i=0; i < entries.length; i++)
	{
		UnselectSelEntryAndDependencies(entries[i]);
	}
}

function SelectNode(topNode)
{
	var selEntry = buildSelEntryParentChain(topNode);

	AddSelEntryAndDependencies(selEntry);

	ConnectNodesToDom(selEntry);
}


function UnselectNode(topNode)
{
	var selEntry = findSelectedEntryInNodeChain(topNode.selEntry);

	if(!selEntry)
		return;

	UnselectSelEntryAndDependencies(selEntry);
}

function processSelectedItems(treeObj)
{
	if (!treeObj)
		return false;

	if (treeObj.multiselect)
	{
		
		if (treeObj.submitAllIds)
			return processAllSelected(treeObj);

		if (!treeObj.CheckedIDs)
			return false;

		var id = treeObj.itsTitle + 'ArrayAsString';
		var expr = [];
		for (var i = 0; i < treeObj.CheckedIDs.length; i++)
		{
			if(treeObj.CheckedIDs[i] != '')
				expr.push(TreeWidget_extractCleanId(treeObj.CheckedIDs[i], treeObj.itsId));
		}

		var treeVar = document.getElementById(id);
		if (!treeVar)
			return false;
			
		var exprStr = expr.join(',');
		treeVar.value = exprStr;
	}
	else
	{
			var id1  = treeObj.itsTitle;
			var treeVar1 = document.getElementById(id1);
			if (!treeVar1)
				return false;

			if (treeObj.SelectedID)
				treeVar1.value = TreeWidget_extractCleanId(treeObj.SelectedID, treeObj.itsId);
			else
				treeVar1.value = KEYID_FOR_NONE;
	}

	return true;
}

function TreeWidget_singleSelectMode_selection(treeObj)
{
	if (treeObj.SelectedID)
		return TreeWidget_extractCleanId(treeObj.SelectedID, treeObj.itsId);
	else
		return KEYID_FOR_NONE;
}


function TreeWidget_multiSelectMode_selection(treeObj)
{
	var expr = [];

	if (treeObj.submitAllIds)
	{
		var rootElem = findRootItem(treeObj.itsId);
		expr = extractAllSelectedItems(treeObj, rootElem, expr);
	}	
	else
	{
		if (treeObj.CheckedIDs)
		{
			for (var i = 0; i < treeObj.CheckedIDs.length; i++)
			{
				if(treeObj.CheckedIDs[i])
					expr.push(TreeWidget_extractCleanId(treeObj.CheckedIDs[i], treeObj.itsId));
			}
		}
	}
	
	return expr;
}


function processAllSelected(treeObj)
{
	var id = treeObj.itsTitle + 'ArrayAsString';

	var rootElem = findRootItem(treeObj.itsId);

	var expr = extractAllSelectedItems(treeObj, rootElem, []);

	var treeVar = document.getElementById(id);

	if (!treeVar)
		return false;

	var exprStr = expr.join(',');		

	treeVar.value = exprStr;

	return true;
}

function extractAllSelectedItems(treeObj, child, expr)
{
	while (child && getIsValidTopElem(child))
	{
		
		if (child.firstChild)
		{
			var radio = findRadioButtonEl(child.firstChild.lastChild);

			if (radio)
			{
				
				if (radio.src.indexOf("onradio.gif") >= 0 && radio.src.indexOf("disabledonradio.gif") < 0)
				{
					expr.push(TreeWidget_extractCleanId(child.id, treeObj.itsId));
				}
			}
			else
			{
				
				var chkbx = findCheckboxEl(child.firstChild.lastChild);

				
				if ( chkbx && chkbx.src.indexOf("oncheckbox.gif") >= 0 &&
					chkbx.src.indexOf("disabledoncheckbox.gif") < 0 &&
					!isExportTypeID(treeObj.itsId, child.id) )
				{
					expr.push(TreeWidget_extractCleanId(child.id, treeObj.itsId));
				}
			}

			
			var childrenDiv = child.firstChild.nextSibling;
			if (childrenDiv && childrenDiv.className == "childrenDiv")  
			{
				
				expr = extractAllSelectedItems(treeObj, childrenDiv.firstChild, expr);
			}
		}

		child = child.nextSibling;
	}

	return expr;
}






function setDownwardCascadingCheckboxSelections(treeObj, val)
{
	treeObj.downwardCheckboxCascadingEnabled = val;
}






function setUpwardCascadingCheckboxSelections(treeObj, val)
{
	treeObj.upwardCheckboxCascadingEnabled = val;
}









function setCascadingEnabled(treeObj, val)
{
	treeObj.cascadingEnabled = val;
}







function setCascadingLevel(treeObj, val)
{
	treeObj.cascadingLevel = val;
}

function findCurrentLevel(treeObj, elem)
{
	if (isRootItem(treeObj.itsId, elem.id))
		return 0;
	else
		return 1 + findCurrentLevel(treeObj, getParent(elem));
}









function scrollToElement(elementId, treeObj)
{
	var container	= document.getElementById(treeObj.itsId + '_container');
	var mainDiv	= document.getElementById(treeObj.itsId + '_' + elementId);

	if (!container || !mainDiv)
		return;

	container.scrollTop = mainDiv.offsetTop - container.clientHeight / 3;

	changeBlinkState(mainDiv.id, 0);
}



function changeBlinkState(mainDivId, counter)
{
	var mainDiv = document.getElementById(mainDivId);
	innerDiv = mainDiv.firstChild;

	if (!innerDiv || innerDiv.id != 'inner' || !innerDiv.lastChild)
		return;

	var elem = innerDiv.lastChild;

	
	if (counter > 5)
	{
		return;
	}

	
	if (counter % 2 == 0)
	{
		elem.style.visibility = "hidden";
	}
	else
	{
		elem.style.visibility = "visible";
	}

	
	setTimeout("changeBlinkState('" + mainDivId + "', " + (counter + 1) + ")", 200);
}












function processDescendantSelection(treeObj, elem, operation)
{
	if (operation == "remove")
	{
		
		if (isExplicitlySelectedID(treeObj, elem.id))
		{
			treeObj.CheckedIDs = removeFromArray(treeObj, treeObj.CheckedIDs, elem.id);
		}
		
		else if (isTristateID(treeObj, elem.id))
		{
			treeObj.TriStateIDs = removeFromArray(treeObj, treeObj.TriStateIDs, elem.id);
		}
	}

	
	if (getFirstChild(elem))
	{
		var child = getFirstChild(elem);
		while (child)
		{
			processDescendantSelection(treeObj, child, operation);
			child = child.nextSibling;
		}
	}
}








function processAncestorSelection(treeObj, elem, operation, arg)
{
	
	if (isRootItem(treeObj.itsId, elem.id))
		return;

	
	if (findCurrentLevel(treeObj, elem) <= treeObj.cascadingLevel)
		return;

	var parentElem = getParent(elem);
	if (!parentElem)
		return;

	
	
	if (operation == "update")
	{
		if (allChildrenExplicitlySelected(treeObj, parentElem) && (arg!="afterRemoval"))
		{
			
			
			markAsExplicitlySelected(treeObj, parentElem.id);
		}
		
		
		else if (isExplicitlySelectedID(treeObj, parentElem.id) && (arg!="afterRemoval"))
		{
			
			
		}
		else if (hasAtLeastOneExplicitlySelectedDescendant(treeObj, parentElem))
			markAsPartlySelected(treeObj, parentElem.id);
		else
			markAsNotSelected(treeObj, parentElem.id);
	}

	
	
	
	
	
	
	
	if (operation == "markSiblingsAsExplicitlySelected")
	{
		if (isImplicitlySelectedID(treeObj, elem.id))
		{
			var firstSibling = elem;

			
			while (firstSibling.previousSibling)
				firstSibling = firstSibling.previousSibling;

			var sibling = firstSibling;
			while (sibling)
			{
				if (sibling.id != elem.id)
					markAsExplicitlySelected(treeObj, sibling.id);
				sibling = sibling.nextSibling;
			}
		}
	}

	processAncestorSelection(treeObj, parentElem, operation, arg);
}








function allChildrenExplicitlySelected(treeObj, elem)
{
	if (!getFirstChild(elem))
		return false;
	var child = getFirstChild(elem);

	if (!child)
	{
		return false;
	}
	
	else
	{
		while (child && getIsValidTopElem(child))
		{
			var isExplicitlySelectedElement = isExplicitlySelectedID(treeObj, child.id);
			if (!isExplicitlySelectedElement)
			{
				
				return false;
			}

			child = child.nextSibling;
		}
		
		return true;
	}
}






function getFirstChild(elem)
{
	if (elem && elem.firstChild && elem.firstChild.nextSibling && elem.firstChild.nextSibling.firstChild)
		return elem.firstChild.nextSibling.firstChild;
	else
		return null;
}






function getParent(elem)
{
	var childrendiv = elem.parentElement?elem.parentElement:elem.parentNode;
	if (childrendiv)
		return childrendiv.parentElement?childrendiv.parentElement:childrendiv.parentNode;
	else
		return null;
}







function hasAtLeastOneExplicitlySelectedDescendant(treeObj, elem)
{
	if (!getFirstChild(elem))
		return false;
	var child = getFirstChild(elem);
	while (child)
	{
		if (isExplicitlySelectedID(treeObj, child.id))
			return true;
		child = child.nextSibling;
	}
	return false;
}







function isTristateID(treeObj, keyID)
{
	return arrayContains(treeObj, treeObj.TriStateIDs, keyID);
}







function isExplicitlySelectedID(treeObj, keyID)
{
	return arrayContains(treeObj, treeObj.CheckedIDs, keyID);
}






function isImplicitlySelectedID(treeObj, keyID)
{
	if (isExplicitlySelectedID(treeObj, keyID))
		return false;
	var elem = findTopElemFromId(treeObj, keyID);
	if (isRootItem(treeObj.itsId, elem.id))
		return false;
	if (findCurrentLevel(treeObj, elem) <= treeObj.cascadingLevel)
		return;
	var parentElem = getParent(elem);
	if (isExplicitlySelectedID(treeObj, parentElem.id))
	{
		return true;
	}
	else
		return isImplicitlySelectedID(treeObj, parentElem.id);
}







function markAsExplicitlySelected(treeObj, keyID)
{
	var elem = findTopElemFromId(treeObj, keyID);
	if (treeObj.cascadingEnabled)
		processDescendantSelection(treeObj, elem, "remove");
	treeObj.CheckedIDs = addToArray(treeObj, treeObj.CheckedIDs, keyID);
	treeObj.TriStateIDs = removeFromArray(treeObj, treeObj.TriStateIDs, keyID);
}





function markAsPartlySelected(treeObj, keyID)
{
	treeObj.TriStateIDs = addToArray(treeObj, treeObj.TriStateIDs, keyID);
	treeObj.CheckedIDs = removeFromArray(treeObj, treeObj.CheckedIDs, keyID);
}





function markAsNotSelected(treeObj, keyID)
{
	treeObj.TriStateIDs = removeFromArray(treeObj, treeObj.TriStateIDs, keyID);
	treeObj.CheckedIDs = removeFromArray(treeObj, treeObj.CheckedIDs, keyID);
}











function arrayContains(treeObj, arrayObj, elem)
{
	if ((!arrayObj) || (!elem))
		return false;
	for (var i=0;i<arrayObj.length;i++)
		if (TreeWidget_extractCleanId(arrayObj[i], treeObj.itsId) == TreeWidget_extractCleanId(elem, treeObj.itsId))
			return true;
	return false;
}







function removeFromArray(treeObj, arrayObj, elem)
{
	if ((!arrayObj) || (!elem))
		return arrayObj;
	for (var i=0;i<arrayObj.length;i++)
	{
		if (TreeWidget_extractCleanId(arrayObj[i], treeObj.itsId) == TreeWidget_extractCleanId(elem, treeObj.itsId))
			arrayObj[i] = null;
	}
	return arrayObj;
}







function addToArray(treeObj, arrayObj, elem)
{
	if (arrayContains(treeObj, arrayObj, elem))
		return arrayObj;
	if (!arrayObj)
		arrayObj = new Array(1);
	if (!elem)
		return arrayObj;
	for (var i=0;i<arrayObj.length;i++)
	{
		if (!arrayObj[i])
		{
			arrayObj[i] = elem;
			return arrayObj;
		}
	}
	arrayObj[arrayObj.length] = elem;
	return arrayObj;
}




function renderStringArray(arrayObj)
{
	if (!arrayObj)
		return "\nnull";
	var str = "\n";
	for (var i=0;i<arrayObj.length;i++)
	{
		str = str + i + ": " + arrayObj[i];

		if (i<arrayObj.length-1)
			str = str + "\n";
	}
	return str;
}




function renderSelectedTreeLists(treeObj)
{
	if (!treeObj)
		return "\nnull";

	var str = "";

	if (treeObj.CheckedIDs)
	{
		str = str + "\nCheckedIDs:\n";
		for (var i=0;i<treeObj.CheckedIDs.length;i++)
		{
			str = str + i + ": " + treeObj.CheckedIDs[i];
			var elem = findTopElemFromId_withTreeid(treeObj.itsId, treeObj.CheckedIDs[i]);
			if (treeObj.CheckedIDs[i] && elem & elem.innerText)
				str = str + " (" + elem.innerText + ")";
			if (i<treeObj.CheckedIDs.length-1)
				str = str + "\n";
		}
	}
	if (treeObj.TriStateIDs)
	{
		str = str + "\n\nTriStateIDs:\n";
		for (var j=0;j<treeObj.TriStateIDs.length;j++)
		{
			str = str + j + ": " + treeObj.TriStateIDs[j];
			var elem1 = findTopElemFromId_withTreeid(treeObj.itsId, treeObj.TriStateIDs[j]);
			if (treeObj.TriStateIDs[j] & elem1 && elem1.innerText)
				str = str + " (" + elem1.innerText + ")";
			if (j<treeObj.TriStateIDs.length-1)
				str = str + "\n";
		}
	}
	return str;
}
