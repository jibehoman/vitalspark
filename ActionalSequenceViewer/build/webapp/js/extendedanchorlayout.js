

















Ext.ns('com', 'com.actional', 'com.actional.util');

/**
 * @lastrev fix36813 - getAnchorViewSize(...) method has been removed; use getLayoutTargetSize() instead.
 */
com.actional.util.ExtendedAnchorLayout = Ext.extend(Ext.layout.AnchorLayout, {
    
    onLayout : function(ct, target){
        com.actional.util.ExtendedAnchorLayout.superclass.onLayout.call(this, ct, target);

        var size = this.getLayoutTargetSize();

        var w = size.width, h = size.height;

        if(w < 20 || h < 20){
            return;
        }

        
        var aw, ah;
        if(ct.anchorSize){
            if(typeof ct.anchorSize == 'number'){
                aw = ct.anchorSize;
            }else{
                aw = ct.anchorSize.width;
                ah = ct.anchorSize.height;
            }
        }else{
            aw = ct.initialConfig.width;
            ah = ct.initialConfig.height;
        }

        var cs = ct.items.items, len = cs.length, i, c, a, cw, ch;
        for(i = 0; i < len; i++){
            c = cs[i];
            if(c.anchor){
                a = c.anchorSpec;
                if(!a){ 
                    var vs = c.anchor.split(' ');
                    c.anchorSpec = a = {
                        right: this.parseAnchor(vs[0], c.initialConfig.width, aw),
                        bottom: this.parseAnchor(vs[1], c.initialConfig.height, ah)
                    };
                }
                cw = a.right ? this.adjustWidthAnchor(a.right(w), c) : undefined;
                ch = a.bottom ? this.adjustHeightAnchor(a.bottom(h), c) : undefined;

		if(cw || ch){
		    if (ch && this.relative){
		        ch -= c.el.getOffsetsTo(ct.el)[1];
		    }
		    c.setSize(cw || undefined, ch || undefined);
		}
            }
        }
    },

    
    parseAnchor : function(a, start, cstart){
        if(a && a != 'none'){
            if(/^(r|right|b|bottom)$/i.test(a)){   
                var diff = cstart - start;
                return function(v)
                {
                	return v - diff;
                };
            }else if(a.indexOf('%') != -1){
                var ratio = parseFloat(a.replace('%', ''))*.01;   
                return function(v)
                {
			return Math.floor(v*ratio);
                };
            }else{
                a = parseInt(a, 10);
                if(!isNaN(a)){                            
                    return function(v)
                    {
			return v + a;
                    };
                }
            }
        }
        return false;
    }
});
Ext.Container.LAYOUTS['extendedanchor'] = com.actional.util.ExtendedAnchorLayout;