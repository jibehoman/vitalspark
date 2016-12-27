





















function NGSOSelectionDialog_setPopupWidthToButtonWith_onshow(onshowcontext)
{
	
	onshowcontext.left = onshowcontext.buttonrect.left - 1;
	onshowcontext.popup.style.width = onshowcontext.buttonrect.width - 5;

	
	var treecontainer = document.getElementById(onshowcontext.button.getAttribute("id") + '_container');
	if(treecontainer)
		treecontainer.style.width = onshowcontext.buttonrect.width - 10;
	return true;
}

function NGSOSelectionDialog_onTreeSelectionChanged(tree_id)
{
	NGSOSelectionDialog_updateLabel(this);
}

function NGSOSelectionDialog_buttonnormal(dialog_id)
{
	var buttonElem = document.getElementById(dialog_id + "_center");
	if (buttonElem)
		buttonElem.style.backgroundColor='';
}

function NGSOSelectionDialog_init(dialog_id)
{
	
	var popupelem = document.getElementById(dialog_id + "_popup");
	if(popupelem)
		popupelem.onshow = NGSOSelectionDialog_setPopupWidthToButtonWith_onshow;

	
	TreeWidget_registerObserver(dialog_id, 'treeselectionchanged', 'ngso_dialog', NGSOSelectionDialog_onTreeSelectionChanged);

	
	NGSOSelectionDialog_buttonnormal(dialog_id);
}





function NGSOSelectionDialog_updateLabel(treeObj)
{
	if (treeObj.SelectedID && treeObj.SelectedID != KEYID_FOR_NONE)
	{
		var elem = document.getElementById(treeObj.SelectedID);
		if (elem)
		{
			NGSOSelectionDialog_updateNameForSelectedItem(treeObj, getElemPath(treeObj.itsId, elem), getImageHTML(treeObj.itsId, elem));
		}
	}
}






function NGSOSelectionDialog_updateNameForSelectedItem(treeObj, displayName, imageHTML)
{
	if (!treeObj.CheckedIDs)
	{
		
		var name_id = treeObj.itsId + "Name";
		var name_elem = document.getElementById(name_id);
		if (name_elem != null && displayName)
		{
			if (imageHTML)
			{
				name_elem.innerHTML = imageHTML + "&nbsp;" + escapeHTML(displayName);
			}
			else
			{
				name_elem.innerHTML = escapeHTML(displayName);
			}
			if (DDD)
				DDD.hidePopup();
		}
	}
}
