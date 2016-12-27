
























function extscript_docwrite()
{
	if(window.docobj)
	{
		document.write(window.docobj);
		window.docobj = null;
	}
}

function extscript_eval()
{
	if(window.externaleval)
	{
		eval(window.externaleval);
		window.externaleval = null;
	}
}

extscript_docwrite();
extscript_eval();
