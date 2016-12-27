

















        function checkLicenseKey(txtobj)
        {
        	
        	

                var typedKey = txtobj.value;

		
		typedKey = typedKey.replace(/[ -]*/g, '');

		var newKey = '';

                for (i = 0; i < typedKey.length; i++)
                {
                        var charval = typedKey.charAt(i).toUpperCase();

			if(i%5 == 0 && i > 0)
			{
				newKey += '-';
                        }

			newKey += charval;
		}

                txtobj.value = newKey;
        }

	/**
	 * Reformats multiple keys in a multi line text box.
	 * Retains comments.
	 * @lastrev fix34206 - New funtion
	 */
	function checkLicenseKeys(txtobj)
        {
                var typedKey = txtobj.value;
		typedKey = typedKey.replace(/(\r\n|\r|\n)/g, '\n');
		var lines = typedKey.split("\n");
		var formattedKey = '';
		for (j = 0; j < lines.length; j++)
		{
			
			var line = lines[j].replace(/[ -]*/g, '');
			var commentregex = /^\s*(#.*|)$/;
			var licenseregex = /^\s*(\S+)\s*$/;
			if(commentregex.test(line))
			{

				
				formattedKey += lines[j];
				formattedKey += '\n';

			}
			else if(licenseregex.test(line))
			{
				var match = licenseregex.exec(line);
				var licensekey = match[1];
				var newKey = '';

	        	        for (i = 0; i < licensekey.length; i++)
        			{
					var charval = licensekey.charAt(i).toUpperCase();
					if(i%5 == 0 && i > 0)
					{
						newKey += '-';
	                    		}
					newKey += charval;
				}
				if(newKey.length > 0)
				{
					formattedKey += newKey;
					formattedKey += '\n';
				}
			}
		}
		if(formattedKey.length > 0)
		{
			formattedKey = formattedKey.substring(0,formattedKey.length-1);
		}
                txtobj.value = formattedKey;
        }

        function checkLocation(chkbox)
        {
                var flag;

                flag = !chkbox.checked;

		if ( chkbox.name == "HTTP")
		{
			chkbox.form.HTTPPort.disabled = flag;
			chkbox.form.HTTPLocation.disabled = flag;
		}
		else if ( chkbox.name == "HTTPS")
		{
			chkbox.form.HTTPSPort.disabled = flag;
			chkbox.form.HTTPSLocation.disabled = flag;
		}
		else if ( chkbox.name == "HTTPSAuth")
		{
			chkbox.form.HTTPSAuthPort.disabled = flag;
			chkbox.form.HTTPSAuthLocation.disabled = flag;
		}
		else if ( chkbox.name == "itsProtocolHTTP")
		{
			chkbox.form.itsPortHTTP.disabled = flag;
		}
		else if ( chkbox.name == "itsProtocolHTTPS")
		{
			chkbox.form.itsPortHTTPS.disabled = flag;
		}
		else if ( chkbox.name == "itsProtocolHTTPSAuth")
		{
			chkbox.form.itsPortHTTPSAuth.disabled = flag;
		}
	}

	function resetLocation(chkbox, flag1, flag12, flag2, flag22)
	{
		flag = flag1;
		chkbox.form.HTTPPort.disabled = flag;
		chkbox.form.isLocationHTTP.disabled = flag;
		chkbox.form.HTTPLocation.disabled = flag12;

		flag = flag2;
		chkbox.form.HTTPSPort.disabled = flag;
		chkbox.form.isLocationHTTPS.disabled = flag;
		chkbox.form.HTTPSLocation.disabled = flag22;
	}
