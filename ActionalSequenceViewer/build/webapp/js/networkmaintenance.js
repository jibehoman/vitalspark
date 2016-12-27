

















function NetworkMaintenance_onTreeSelection(src, treeObj)
{
}


function NetworkMaintenance_onPageLoad()
{
}











function NetworkMaintenance_addNewDateOptionField(dateObj)
{
	var selectElemID = "date";	
	var fieldID = "newDate";	

	
	var valueString = com.actional.util.TimeUtil.format(dateObj, com.actional.DataStore.localeInfo.getDatePattern());

	var selectElem = document.getElementById(selectElemID);
	if(selectElem)
	{
		var valueLength = selectElem.length;
		selectElem.options[valueLength] = new Option(valueString , valueLength );
		selectElem.selectedIndex = valueLength;

		var newDateElem = document.getElementById(fieldID);
		if (newDateElem)
			newDateElem.value= valueString;
	}
}