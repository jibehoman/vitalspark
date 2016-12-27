//=====================================================================================================================
// $HeadURL: https://subversion.devfactory.com/repos/actional/branches/act1001x/product/src/webapps.lg/lgserver/js/sequenceDiagram/canvasdashedline.js $
// Checked in by: $Author: mohamed.sahmoud $
// $Date: 2015-04-14 14:03:31 +0000 (Tue, 14 Apr 2015) $
// $Revision: 64893 $
//---------------------------------------------------------------------------------------------------------------------
// Copyright (c) 2011-2015. Aurea Software, Inc. All Rights Reserved.
//
// You are hereby placed on notice that the software, its related technology and services may be covered by one or
// more United States ("US") and non-US patents. A listing that associates patented and patent-pending products
// included in the software, software updates, their related technology and services with one or more patent numbers
// is available for you and the general public's access at www.aurea.com/legal/ (the "Patent Notice") without charge.
// The association of products-to-patent numbers at the Patent Notice may not be an exclusive listing of associations,
// and other unlisted patents or pending patents may also be associated with the products. Likewise, the patents or
// pending patents may also be associated with unlisted products. You agree to regularly review the products-to-patent
// number(s) association at the Patent Notice to check for updates.
//=====================================================================================================================

Ext.namespace('com.actional.sequence');

/**
 * @fileOverview draw dashed lines and curves on canvas  
 * 
 * This provides a means to draw using dashed lines. Dashed lines 
 * are continuous between drawing commands so dashes won't be interrupted when new lines
 * are drawn in succession. This includes both straight and curved lines. 
 *
 * The base operations are straight lines and quadratic/bezier curves. 
 * 
 * Bezier curves are approximated using four quadratic curves.
 * 
 * <p>
 *
 * <pre><code>
 * // create a DashedLine instance that will draw onto the specified 
 * // canvas "2d" context. dashes will be 10px long, spaces between will be 5
 * 
 * var dash = new com.actional.sequence.CanvasDashedLine(canvas_2d_context, 10, 5);
 * 
 * // draw a red square with dashed lines
 * 
 * canvas_2d_context.beginPath();
 * canvas_2d_context.strokeStyle('red');
 * dash.moveTo(50, 50);
 * dash.lineTo(100, 50);
 * dash.lineTo(100, 100);
 * dash.lineTo(50, 100);
 * dash.lineTo(50, 50);
 * canvas_2d_context.stroke();
 *
 * @lastrev fix37293 - Sequence Diagram: dashed line utility
 */
lcom.actional.sequence.CanvasDashedLine = function(contextParam, onLengthParam, offLengthParam) 
{
	/**
	 * The canvas 2d context in which drawings are to be made
	 */
	var context;

	/**
	 * A value representing the accuracy used in determining the length
	 * of curves. This will affect the "variability" of the dash lengths 
	 * within curves. 
	 */
	var itsCurveLengthAccuracy = 6;  // fast = 2, good = 6 

	var isLine;
	var overflow;
	var offLength;
	var onLength;
	var dashLength;
	var pen;  // current pen position in the canvas context 
	var drawDashedLines;

	// Output of sliceXxx() methods. For optimization purposes.
	var sliceOutCx;
	var sliceOutCy;
	var sliceOutEx;
	var sliceOutEy;

	// public methods

	function resetDashes()
	{
		isLine = true;
		overflow = 0;
	}

	function enableDashes()
	{
		resetDashes();
		drawDashedLines = true;
	}

	function disableDashes()
	{
		drawDashedLines = false;
	}

	/**
	 * Sets new lengths for dash sizes
	 * @param onLength Length of visible dash lines.
	 * @param offLength Length of space between dash lines.
	 * @return nothing
	 */
	function setDash(onLength, offLength) 
	{
		onLength = onLength;
		offLength = offLength;
		dashLength = onLength + offLength;
	}

	/**
	 * A value representing the accuracy used in determining the length
	 * of curves. This will affect the "variability" of the dash 
	 * lengths within curves. Lower this to speed up drawing. 
	 * 6 generally gives good results.
	 */
	function setCurveLengthAccuracy(accuracy)
	{
		if(accuracy < 2)
			accuracy = 2;
		
		itsCurveLengthAccuracy = accuracy;
	}

	/**
	 * Moves the current drawing position in context to (x, y).
	 */
	function moveTo(x, y) 
	{
		contextMoveTo(x, y);
	}
	
	/**
	 * Draws a dashed line in context using the current line style from the current drawing position
	 * to (x, y); the current drawing position is then set to (x, y).
	 * 
	 * Note: signature is compatible with the 2d context canvas
	 *
	 */
	function lineTo(x,y) 
	{
		if(!drawDashedLines)
		{
			contextLineTo(x,y);
			return;
		}

		var dx = x-pen.x, dy = y-pen.y;
		var a = Math.atan2(dy, dx);
		var ca = Math.cos(a), sa = Math.sin(a);
		var segLength = lineLength(dx, dy);
		if (overflow > 0)
		{
			if (overflow > segLength)
			{
				if (isLine) 
					contextLineTo(x, y);
				else 
					contextMoveTo(x, y);
				overflow -= segLength;
				return;
			}
			
			if (isLine) 
				contextLineTo(pen.x + ca*overflow, pen.y + sa*overflow);
			else 
				contextMoveTo(pen.x + ca*overflow, pen.y + sa*overflow);
			segLength -= overflow;
			overflow = 0;
			isLine = !isLine;
			if (segLength == 0) 
				return;
		}
		var fullDashCount = Math.floor(segLength/dashLength);
		if (fullDashCount > 0)
		{
			var onx = ca*onLength, ony = sa*onLength;
			var offx = ca*offLength, offy = sa*offLength;

			if (isLine)
				drawInnerLineToDashesIsLine(fullDashCount, onx, offx, ony, offy);
			else
				drawInnerLineToDashesIsNotLine(fullDashCount, onx, offx, ony, offy);

			segLength -= dashLength*fullDashCount;
		}
		if (isLine)
		{
			if (segLength > onLength)
			{
				contextLineTo(pen.x+ca*onLength, pen.y+sa*onLength);
				contextMoveTo(x, y);
				overflow = offLength-(segLength-onLength);
				isLine = false;
			}
			else
			{
				contextLineTo(x, y);
				if (segLength == onLength)
				{
					overflow = 0;
					isLine = !isLine;
				}
				else
				{
					overflow = onLength-segLength;
					contextMoveTo(x, y);
				}
			}
		}
		else
		{
			if (segLength > offLength)
			{
				contextMoveTo(pen.x+ca*offLength, pen.y+sa*offLength);
				contextLineTo(x, y);
				overflow = onLength-(segLength-offLength);
				isLine = true;
			}
			else
			{
				contextMoveTo(x, y);
				if (segLength == offLength)
				{
					overflow = 0;
					isLine = !isLine;
				}
				else 
					overflow = offLength-segLength;
			}
		}
	}

	/**
	 * Draws a dashed curve in context using the current line style from the current drawing position to
	 * (x, y) using the control point specified by (cx, cy). The current drawing position is then set
	 * to (x, y).
	 *
	 * Note: signature is compatible with the 2d context canvas
	 */
	function quadraticCurveTo(cx, cy, x, y) 
	{
		if(!drawDashedLines)
		{
			contextCurveTo(cx,cy,x,y);
			return;
		}

		var sx = pen.x;
		var sy = pen.y;
		var segLength = curveLength(sx, sy, cx, cy, x, y);
		var t = 0;
		var t2 = 0;
		if (overflow > 0)
		{
			if (overflow > segLength)
			{
				if (isLine) 
					contextCurveTo(cx, cy, x, y);
				else 
					contextMoveTo(x, y);
				overflow -= segLength;
				return;
			}
			
			t = overflow/segLength;
			curveSliceUpTo(sx, sy, cx, cy, x, y, t);

			if (isLine) 
				contextCurveTo(sliceOutCx, sliceOutCy, sliceOutEx, sliceOutEy);
			else 
				contextMoveTo(sliceOutEx, sliceOutEy);
			
			overflow = 0;
			isLine = !isLine;
			
			if (!segLength) 
				return;
		}
		
		var remainLength = segLength - segLength*t;
		var fullDashCount = Math.floor(remainLength/dashLength);
		var ont = onLength/segLength;
		var offt = offLength/segLength;
		
		if (fullDashCount > 0)
		{
			if (isLine)
				t = drawInnerDashesIsLine(fullDashCount, sx, sy, cx, cy, x, y, t, t2, ont, offt);
			else
				t = drawInnerDashesIsNotLine(fullDashCount, sx, sy, cx, cy, x, y, t, t2, ont, offt);
		}
		
		remainLength = segLength - segLength*t;
		if (isLine)
		{
			if (remainLength > onLength)
			{
				t2 = t + ont;
				curveSlice(sx, sy, cx, cy, x, y, t, t2);
				contextCurveTo(sliceOutCx, sliceOutCy, sliceOutEx, sliceOutEy);
				contextMoveTo(x, y);
				overflow = offLength-(remainLength-onLength);
				isLine = false;
			}
			else
			{
				curveSliceFrom(sx, sy, cx, cy, x, y, t);
				contextCurveTo(sliceOutCx, sliceOutCy, sliceOutEx, sliceOutEy);
				if (segLength == onLength)
				{
					overflow = 0;
					isLine = !isLine;
				}
				else
				{
					overflow = onLength-remainLength;
					contextMoveTo(x, y);
				}
			}
		}
		else
		{
			if (remainLength > offLength)
			{
				t2 = t + offt;
				curveSliceEnd(sx, sy, cx, cy, x, y, t, t2);
				contextMoveTo(sliceOutEx, sliceOutEy);
				curveSliceFrom(sx, sy, cx, cy, x, y, t2);
				contextCurveTo(sliceOutCx, sliceOutCy, sliceOutEx, sliceOutEy);

				overflow = onLength-(remainLength-offLength);
				isLine = true;
			}
			else
			{
				contextMoveTo(x, y);
				
				if (remainLength == offLength)
				{
					overflow = 0;
					isLine = !isLine;
				}
				else 
					overflow = offLength-remainLength;
			}
		}

	}

	/**
	 * Note: signature is compatible with the 2d context canvas
	 *  
	 * Cx, Cy -- first control point 
	 * Dx, Dy -- second control point 
	 * Ex, Ey -- ending anchor 
	 */
	function bezierCurveTo(Cx, Cy, Dx, Dy, Ex, Ey)
	{
		var Sx = pen.y; 
		var Sy = pen.x;
		
		// calculates useful vectors and base points
		
		// SC is the vector from S to C  
		var SCx = Cx - Sx;
		var SCy = Cy - Sy;
	
		// ED is the vector from E to D
		var EDx = Dx - Ex;
		var EDy = Dy - Ey;
	
		// A is the 3/4 point on segment S->C 
		var Ax = Sx + SCx * 0.75;
		var Ay = Sy + SCy * 0.75;
	
		// B is the 3/4 point on segment E-> D
		var Bx = Ex + EDx * 0.75;
		var By = Ey + EDy * 0.75;
		
		// AB is the vector from A to B
		var ABx = Bx - Ax;
		var ABy = By - Ay;
	
		// d be the 1/16 of the E->S segment size
		var dx = (Ex - Sx)/16;
		var dy = (Ey - Sy)/16;
	
		// calculates the 4 control points
		
		// C1 is the 3/8 point on segment S->C
		var C1x = Sx + SCx * 0.375;
		var C1y = Sy + SCy * 0.375;
		
		// C2 is the 3/8 point on segment A->B minus d
		var C2x = Ax + ABx * 0.375 - dx;
		var C2y = Ay + ABy * 0.375 - dy;
	
		// C3 is the 3/8 point on segment B->A plus d
		// (computing using 5/8 point of segment A->B)
		var C3x = Ax + ABx * 0.625 + dx;
		var C3y = Ay + ABy * 0.625 + dy;
	
		// C4 is the 3/8 point on segment E->D
		var C4x = Ex + EDx * 0.375;
		var C4y = Ey + EDy * 0.375;
		
		// calculates the 3 anchor points
		
		// A1 is the middle point between C1 and C2 	(see inline first curveTo)
		// A2 is the middle point between A and B 		(see inline second curveTo)
		// A3 is the middle point between C3 and C4 	(see inline third curveTo)
	
		// draw the four quadratic subsegments
		quadraticCurveTo(C1x, C1y, /*A1x*/ C1x + (C2x-C1x)/2,	/*A1y*/ C1y + (C2y-C1y)/2);
		quadraticCurveTo(C2x, C2y, /*A2x*/ Ax + ABx/2, 		/*A2y*/ Ay + ABy/2 );
		quadraticCurveTo(C3x, C3y, /*A3x*/ C3x + (C4x-C3x)/2,	/*A3y*/ C3y + (C4y-C3y)/2 );
		quadraticCurveTo(C4x, C4y, Ex, Ey);
	}
	
	
	// private methods

	function drawInnerDashesIsLine(fullDashCount,
					sx, sy, cx, cy,
					x, y,
					t, t2, ont, offt )
	{
		// tight loop - this is where all the time is spent
		while (fullDashCount-- > 0)
		{
			// dash
			t2 = t + ont;

			if (t == 0)
			{
				curveSliceUpTo(sx, sy, cx, cy, x, y, t2);
				context.quadraticCurveTo(sliceOutCx, sliceOutCy, sliceOutEx, sliceOutEy);
			}
			else if (t2 == 1)
			{
				curveSliceFrom(sx, sy, cx, cy, x, y, t);
				context.quadraticCurveTo(sliceOutCx, sliceOutCy, sliceOutEx, sliceOutEy);
			}
			else
			{
				var cy1 = sy + (cy-sy)*t2;
				var ey = cy1 + ((cy - cy1 + (y-cy)*t2))*t2;
				var cx1 = sx + (cx-sx)*t2;
				var ex = cx1 + ((cx - cx1 + (x-cx)*t2))*t2;

				context.quadraticCurveTo(cx1 + (ex-cx1)*t/t2, cy1 + (ey-cy1)*t/t2, ex, ey);
			}

			t = t2;

			// space
			t += offt;
			context.moveTo( sx + ((cx*2 - (sx*2)+ ((sx + x - cx*2)*t)) *t),
								sy + ((cy*2 - (sy*2)+ ((sy + y - cy*2)*t)) *t));

		}

		return t;
	}

	// this is exactly like above but the order of "dash, space" is reversed in the loop
	function drawInnerDashesIsNotLine(fullDashCount,
					sx, sy, cx, cy,
					x, y,
					t, t2, ont, offt )
	{
		// tight loop - this is where all the time is spent
		while (fullDashCount-- > 0)
		{
			// space
			t += offt;
			context.moveTo(	sx + ((cx*2 - (sx*2)) * t) + ((sx + x - cx*2) *t*t),
								sy + ((cy*2 - (sy*2)) * t) + ((sy + y - cy*2) *t*t));

			// dash
			t2 = t + ont;
			if (t == 0)
			{
				curveSliceUpTo(sx, sy, cx, cy, x, y, t2);
				context.quadraticCurveTo(sliceOutCx, sliceOutCy, sliceOutEx, sliceOutEy);
			}
			else if (t2 == 1)
			{
				curveSliceFrom(sx, sy, cx, cy, x, y, t);
				context.quadraticCurveTo(sliceOutCx, sliceOutCy, sliceOutEx, sliceOutEy);
			}
			else
			{
				var cy1 = sy + (cy-sy)*t2;
				var ey = cy1 + ((cy - cy1 + (y-cy)*t2))*t2;
				var cx1 = sx + (cx-sx)*t2;
				var ex = cx1 + ((cx - cx1 + (x-cx)*t2))*t2;

				context.quadraticCurveTo(cx1 + (ex-cx1)*t/t2, cy1 + (ey-cy1)*t/t2, ex, ey);
			}
			t = t2;
		}

		return t;
	}

	function drawInnerLineToDashesIsLine(fullDashCount,
						onx, offx,
						ony, offy )
	{
		var x = pen.x;
		var y = pen.y;

		while(fullDashCount-- > 0)
		{
			x+=onx;
			y+=ony;

			context.lineTo(x, y);

			x+=offx;
			y+=offy;

			context.moveTo(x, y);
		}

		pen.x = x;
		pen.y = y;
	}

	// same as above but the sequence "On-Off" is reversed in the loop
	function drawInnerLineToDashesIsNotLine(fullDashCount,
						onx, offx,
						ony, offy )
	{
		var x = pen.x;
		var y = pen.y;

		while(fullDashCount-- > 0)
		{
			x+=offx;
			y+=offy;

			context.moveTo(x, y);

			x+=onx;
			y+=ony;

			context.lineTo(x, y);
		}

		pen.x = x;
		pen.y = y;
	}

	function lineLength(sx, sy, ex, ey) 
	{
		if (arguments.length == 2) return Math.sqrt(sx*sx + sy*sy);
		var dx = ex - sx;
		var dy = ey - sy;
		return Math.sqrt(dx*dx + dy*dy);
	}

	/**
	 * Approximate the total length of a quadratic curve.
	 */
	function curveLength(sx, sy, cx, cy, ex, ey)
	{
		var total = 0;
		var tx = sx;
		var ty = sy;
		var px, py, t, it, a, b, c;
		var n = itsCurveLengthAccuracy;
		for (var i = 1; i<=n; i++)
		{
			t = i/n;
			it = 1-t;
			a = it*it;
			b = 2*t*it;
			c = t*t;
			px = a*sx + b*cx + c*ex;
			py = a*sy + b*cy + c*ey;

			// compute the length between p(x,y) and t(x,y)
			var dx = px - tx;
			var dy = py - ty;
			total += Math.sqrt(dx*dx + dy*dy);

			tx = px;
			ty = py;
		}

		return total;
	}
	
	function curveSlice(sx, sy, cx, cy, ex, ey, t1, t2)
	{
		var mid;

		if (t1 == 0)
		{
			curveSliceUpTo(sx, sy, cx, cy, ex, ey, t2);
			return;
		}
		else if (t2 == 1)
		{
			curveSliceFrom(sx, sy, cx, cy, ex, ey, t1);
			return;
		}

		mid = cx + (ex-cx)*t2;
		cx = sx + (cx-sx)*t2;
		sliceOutEx = ex = cx + (mid-cx)*t2;

		mid = cy + (ey-cy)*t2;
		cy = sy + (cy-sy)*t2;
		sliceOutEy = ey = cy + (mid-cy)*t2;

		t1 /= t2;

		sliceOutCy = cy + (ey-cy)*t1;
		sliceOutCx = cx + (ex-cx)*t1;
	}

	// same as above but does not return Cx/Cy
	function curveSliceEnd(sx, sy, cx, cy, ex, ey, t1, t2)
	{
		if (t1 == 0)
		{
			curveSliceUpTo(sx, sy, cx, cy, ex, ey, t2);
			return;
		}
		else if (t2 == 1)
		{
			curveSliceFrom(sx, sy, cx, cy, ex, ey, t1);
			return;
		}

		cx *= 2;
		sliceOutEx = sx + ((cx - (sx*2) + ((sx + ex - cx) *t2)) * t2);

		cy *= 2;
		sliceOutEy = sy + ((cy - (sy*2) + ((sy + ey - cy) *t2)) * t2);
	}

	function curveSliceUpTo(sx, sy, cx, cy, ex, ey, t)
	{
		if(t == 1)
		{
			sliceOutCx	= cx;
			sliceOutCy	= cy;
			sliceOutEx	= ex;
			sliceOutEy	= ey;
			return;
		}

		var mid = cx + (ex-cx)*t;
		sliceOutCx = cx = sx + (cx-sx)*t;
		sliceOutEx = cx + (mid-cx)*t;

		mid = cy + (ey-cy)*t;
		sliceOutCy = cy = sy + (cy-sy)*t;
		sliceOutEy = cy + (mid-cy)*t;
	}

	function curveSliceFrom(sx, sy, cx, cy, ex, ey, t)
	{
		sliceOutCx = cx + (ex-cx)*t;
		sliceOutCy = cy + (ey-cy)*t;
		sliceOutEx = ex;
		sliceOutEy = ey;
	}

	function contextMoveTo(x, y) {
		pen = {x:x, y:y};
		context.moveTo(x, y);
	}
	
	function contextLineTo(x, y) {
		if (x == pen.x && y == pen.y) return;
		pen = {x:x, y:y};
		context.lineTo(x, y);
	}
	
	function contextCurveTo(cx, cy, x, y) {
		if (cx == x && cy == y && x == pen.x && y == pen.y) return;
		pen = {x:x, y:y};
		context.quadraticCurveTo(cx, cy, x, y);
	}

	/**
	 * re-construct a dashedline
	 * @param onLength Length of visible dash lines.
	 * @param offLength Length of space between dash lines.
	 * @return nothing
	 */
	function resetDash(canvas_2d_context, onLength, offLength) 
	{
		context = canvas_2d_context;
		setDash(onLength, offLength);
		isLine = true;
		overflow = 0;
		pen = {x:0, y:0};
		drawDashedLines = true;
	}

	resetDash(contextParam, onLengthParam, offLengthParam);
	
	return ({
		moveTo:moveTo,
		lineTo:lineTo,
		bezierCurveTo:bezierCurveTo,
		quadraticCurveTo:quadraticCurveTo,
		setDash:setDash,
		setCurveLengthAccuracy:setCurveLengthAccuracy
	});
};
