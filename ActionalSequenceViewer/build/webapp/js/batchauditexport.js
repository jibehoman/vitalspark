

















Ext.onReady(function()
{
});

function showBatchExchangeComponent()
{
	gIsExport = "BATCH";
	exportExchange();
}

function enableBatchPageLaunchButton(enableButton)
{
 	var b2Array = document.forms.auditListModel.auditListModelLaunch_Team_Server;

	for (var x = 0; x < b2Array.length; x++)
	{
		var btn = b2Array[x];
		if (!btn)
		 	return;

		btn.disabled = !enableButton;
		if (btn.disabled)
			btn.className = 'disabled' + buttonClass;
		else
			btn.className = buttonClass;
	}
}
