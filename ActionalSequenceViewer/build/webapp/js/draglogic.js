


























































var draglogic =
{
	init: function (elem)
    	{
    		var cursorElem = draglogic.getMoveCursorElem();
	        elem.onmousedown = draglogic.dragstart;
	        if (isNaN(parseInt(cursorElem.style.left))) cursorElem.style.left = "0px";
	        if (isNaN(parseInt(cursorElem.style.top)))  cursorElem.style.top = "0px";
	        elem.cursorstyle = "move";
	        elem.topmostzindex = 501;
        },
	dragstart: function (ev)
    	{
	        var elem = draglogic.obj = this;
	        if (typeof ev == "undefined") ev = window.event;

	        var mouseX = ev.clientX;
	        var mouseY = ev.clientY;

	        var cursorElemX = mouseX-(draglogic.CursorElemSize/2);
	        var cursorElemY = mouseY-(draglogic.CursorElemSize/2);

	        if(elem.onDragStart)
	        	elem.onDragStart.call(elem, ev, elem.onDragData);

    		var cursorElem = draglogic.getMoveCursorElem();
                cursorElem.style.cursor = elem.cursorstyle;
                cursorElem.style.left = cursorElemX + "px";
                cursorElem.style.top = cursorElemY + "px";
                cursorElem.style.height = draglogic.CursorElemSize;
                cursorElem.style.width = draglogic.CursorElemSize;
                cursorElem.style.zIndex = elem.topmostzindex;
                cursorElem.style.display = "block";

	        elem._startMouseX = mouseX;
	        elem._startMouseY = mouseY;
	        elem._startCursorElemX = cursorElemX;
	        elem._startCursorElemY = cursorElemY;

		
	        document.draglogic_mousemove = document.onmousemove;
	        document.draglogic_mouseup = document.onmouseup;
	        document.draglogic_onlosecapture = document.onlosecapture;
	        document.onmousemove = draglogic.dragmove;
	        document.onmouseup = draglogic.dragend;
	        document.onlosecapture = draglogic.dragend; 

	        
	        if(elem.setCapture)
			elem.setCapture();

	        return false;
	},
	dragmove: function (ev)
	{
    		var cursorElem = draglogic.getMoveCursorElem();
	        if (typeof ev == "undefined") ev = window.event;
	        var elem = draglogic.obj;

	        var mouseX = ev.clientX;
	        var mouseY = ev.clientY;

	        var elemx = parseInt(cursorElem.style.left);
	        var elemy = parseInt(cursorElem.style.top);

		var deltaX = mouseX - elem._startMouseX;
		var deltaY = mouseY - elem._startMouseY;

		var propevent = true;

		if(elem.onDragMove)
			propevent = elem.onDragMove.call(elem, deltaX, deltaY, ev, elem.onDragData);

		if(propevent && document.draglogic_mousemove)
	        	document.draglogic_mousemove.call(document, ev);

	        var cursorElemX = mouseX-(draglogic.CursorElemSize/2);
	        var cursorElemY = mouseY-(draglogic.CursorElemSize/2);

	        cursorElem.style.left = cursorElemX + "px";
	        cursorElem.style.top = cursorElemY + "px";

	        return false;
        },
	dragend: function (ev)
	{
    		var cursorElem = draglogic.getMoveCursorElem();
	        if (typeof ev == "undefined") ev = window.event;
	        var elem = draglogic.obj;

	        var mouseX = ev.clientX;
	        var mouseY = ev.clientY;

	        
	        if(elem.releaseCapture)
			elem.releaseCapture();

		
	        document.onmousemove = document.draglogic_mousemove;
	        document.onmouseup = document.draglogic_mouseup;
	        document.onlosecapture = document.draglogic_onlosecapture;
	        document.draglogic_mouseup = undefined;
	        document.draglogic_mousedown = undefined;
	        document.draglogic_onlosecapture = undefined;

		var deltaX = mouseX - elem._startMouseX;
		var deltaY = mouseY - elem._startMouseY;

		var propevent = true;

	        if(elem.onDragStop)
	        	propevent = elem.onDragStop.call(elem, deltaX, deltaY, ev, elem.onDragData);

		if(propevent && document.draglogic_mouseup)
	        	document.draglogic_mouseup.call(document, ev);

			cursorElem.style.left = "0px";
			cursorElem.style.top = "0px";
			cursorElem.style.display = "none";

	        draglogic.obj = null;
	},

	moveCursorElem: null,
	CursorElemSize: 50,

	getMoveCursorElem: function()
	{
		if (!draglogic.moveCursorElem)
		{
			draglogic.moveCursorElem = document.createElement("DIV");
			draglogic.moveCursorElem.style.display = "none";
			draglogic.moveCursorElem.style.position = "absolute";
			document.body.appendChild(draglogic.moveCursorElem);
		}

		return draglogic.moveCursorElem;
	}
};
