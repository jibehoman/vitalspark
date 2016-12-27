







































var UserSettings_servletBaseURL; 




var UserSettings_Scopes =
{
	
	
	
	
	
	HISTORY:
	{
		id:'HISTORY',
		read: UserSettings_HistoryRead,
		write: UserSettings_HistoryWrite,
		load: UserSettings_HistoryLoadSettings,
		cache: null,
		saveDelayMs: 100,
		timeoutId: null
	},

	
	
	
	
	
	
	
	
	URL:
	{
		id:'URL',
		read: UserSettings_UrlRead,
		write: UserSettings_UrlWrite,
		load: UserSettings_UrlLoadSettings,
		cache: null,
		saveDelayMs: 100,
		timeoutId: null

	},

	
	
	
	
	
	
	
	
	
	
	
	
	
	HTTPSESSION:
	{
		id:'HTTPSESSION',
		read: null,
		write: UserSettings_SessionWrite,
		load: null,
		cache: null,
		saveDelayMs: 2000,
		timeoutId: null
	},

	
	
	
	
	
	
	
	PAGECOOKIE:
	{
		id:'PAGECOOKIE',
		read: UserSettings_PageCookieRead,
		write: UserSettings_PageCookieWrite,
		load: UserSettings_PageCookieLoadSettings,
		cache: null,
		saveDelayMs: 100,
		timeoutId: null
	},

	
	
	
	
	
	GLOBALCOOKIE:
	{
		id:'GLOBALCOOKIE',
		read: UserSettings_GlobalCookieRead,
		write: UserSettings_GlobalCookieWrite,
		load: UserSettings_GlobalCookieLoadSettings,
		cache: null,
		saveDelayMs: 100,
		timeoutId: null
	},

	
	
	
	
	
	USERPREFERENCES:
	{
		id:'USERPREFERENCES',
		read: null,
		write: UserSettings_UserPrefWrite,
		load: null,
		cache: null,
		saveDelayMs: 200,
		timeoutId: null
	}
};

/**
 * return the value for this user settings.  null returned if none found or other problem/error.
 *
 * @param scope can either be a string (i.e. 'URL') or the scope object
 */
function UserSettings_Read(scope, id)
{
	if(typeof(scope) == 'string')
		scope = UserSettings_Scopes[scope];

	if(!scope || !id)
		return null;

	var readfct = scope.read;

	if(!readfct)
		return null;

	return readfct.call(this, id);
}

/**
 * Sets the value for this user settings.  false returned on problem/error.
 * @param scope can either be a string (i.e. 'URL') or the scope object
 * @param saveNow pass true to force to trig saving the settings right-away
 * @param afterSaveNowFct is a callback function that is called when the settings
 * 	have been saved completely. This is only valid when saveNow == true
 *
 * @lastrev fix36080 - add afterSaveNowFct
 */
function UserSettings_Write(scope, id, value, saveNow, afterSaveNowFct)
{
	if(typeof(scope) == 'string')
		scope = UserSettings_Scopes[scope];

	if(!scope || !id)
		return false;

	var writefct = scope.write;

	if(!writefct)
		return false;

	return writefct.call(this, id, value, saveNow, afterSaveNowFct);
}





function UserSettings_getCache(scope)
{
	if (!scope.cache)
	{
		
		scope.cache = new Object();

		if (scope.load)
			scope.load.call(this);
	}

	return scope.cache;
}




function UserSettings_HistoryRead(id)
{
	return UserSettings_ReadFromCache(UserSettings_Scopes.HISTORY, id);
}

function UserSettings_HistoryWrite(id, value, saveNow, afterSaveFct)
{
	return UserSettings_WriteToCache(UserSettings_Scopes.HISTORY, id, value,
					UserSettings_HistorySaveSettings, saveNow, afterSaveFct);
}

function UserSettings_HistorySaveSettings(afterSaveFct)
{
	var cache = UserSettings_getCache(UserSettings_Scopes.HISTORY);
	var settingsString = '';
	for (settingId in cache)
	{
		settingsString += escape(settingId) + '=' + escape(cache[settingId]) + '&';
	}

	if (settingsString.length > 0 && settingsString.charAt(settingsString.length - 1) == '&')
		settingsString = settingsString.substring(0, settingsString.length - 1);

	var settingsInput = document.getElementById('user_settings');

	if (settingsInput && settingsInput.type == 'hidden')
	{
		settingsInput.value = settingsString;
	}

	if(afterSaveFct) afterSaveFct();
}

function UserSettings_HistoryLoadSettings()
{
	var settingsInput = document.getElementById('user_settings');

	if (!settingsInput || settingsInput.type != 'hidden')
		return;

	var settingsString = settingsInput.value;

	if (!settingsString)
		return;

	var cache = UserSettings_getCache(UserSettings_Scopes.HISTORY);

	var historySettings = settingsString.split('&');
	for(var i=0; i<historySettings.length; ++i)
	{
		var pair = historySettings[i].split('=');
		cache[unescape(pair[0])] = unescape(pair[1]);
	}
}




function UserSettings_UrlRead(id)
{
	return UserSettings_ReadFromCache(UserSettings_Scopes.URL, id);
}

function UserSettings_UrlWrite(id, value, saveNow, afterSaveFct)
{
	return UserSettings_WriteToCache(UserSettings_Scopes.URL, id, value,
					UserSettings_UrlSaveSettings, saveNow, afterSaveFct);
}

function UserSettings_UrlSaveSettings(afterSaveFct)
{
	var cache = UserSettings_getCache(UserSettings_Scopes.URL);
	var settingsString = buildUrlEscapedSettingsString(cache);

	
	var url = location.href;

	url = url.replace(/#.*/, '');

	if (settingsString.length > 0)
		url += "#" + settingsString;

	
	
	
	location.replace(url);
	location.replace(url);

	if(afterSaveFct) afterSaveFct();
}

function UserSettings_UrlLoadSettings()
{
	var url = location.href;

	hashIndex = url.indexOf('#');

	if (hashIndex < 0)
		return;

	settingsString = url.substring(hashIndex + 1);

	if (!settingsString)
		return;

	var cache = UserSettings_getCache(UserSettings_Scopes.URL);

	var urlSettings = settingsString.split('&');
	for(var i = 0; i < urlSettings.length; ++i)
	{
		var pair = urlSettings[i].split('=');
		cache[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	}
}





function UserSettings_SessionWrite(id, value, saveNow, afterSaveFct)
{
	return UserSettings_WriteToCache(UserSettings_Scopes.HTTPSESSION, id, value,
					UserSettings_SessionSaveSettings, saveNow, afterSaveFct);
}

function UserSettings_SessionFlush(afterSaveFct)
{
	UserSettings_SessionSaveSettings(afterSaveFct);
}


function UserSettings_SessionSaveSettings(afterSaveFct)
{
	var cache = UserSettings_getCache(UserSettings_Scopes.HTTPSESSION);

	
	UserSettings_Scopes.HTTPSESSION.cache = new Object();

	var settingsString = buildUrlEscapedSettingsString(cache);

	if (!settingsString)
	{
		if(afterSaveFct) afterSaveFct();
		return;
	}

	var servletUrl = contextUrl(UserSettings_servletBaseURL + '?scope=HTTPSESSION&' + settingsString);

	
	XMLHttp_GetAsyncRequest(servletUrl, afterSaveFct, null, null, "saveSessionSettings");
}



function UserSettings_PageCookieRead(id)
{
	return UserSettings_ReadFromCache(UserSettings_Scopes.PAGECOOKIE, id);
}

function UserSettings_PageCookieWrite(id, value, saveNow, afterSaveFct)
{
	return UserSettings_WriteToCache(UserSettings_Scopes.PAGECOOKIE, id, value,
					UserSettings_PageCookieSaveSettings, saveNow, afterSaveFct);
}


function UserSettings_PageCookieSaveSettings(afterSaveFct)
{
	
	
	
	var path = CookieAccess.getCurrentPath();
	UserSettings_CookieSave(UserSettings_getCache(UserSettings_Scopes.PAGECOOKIE),
					'UserSettings_PageCookie', path);

	if(afterSaveFct) afterSaveFct();
}

function UserSettings_PageCookieLoadSettings()
{
	UserSettings_CookieLoad(UserSettings_getCache(UserSettings_Scopes.PAGECOOKIE),
					'UserSettings_PageCookie');
}




function UserSettings_GlobalCookieRead(id)
{
	return UserSettings_ReadFromCache(UserSettings_Scopes.GLOBALCOOKIE, id);
}

function UserSettings_GlobalCookieWrite(id, value, saveNow, afterSaveFct)
{
	return UserSettings_WriteToCache(UserSettings_Scopes.GLOBALCOOKIE, id, value,
					UserSettings_GlobalCookieSaveSettings, saveNow, afterSaveFct);
}

function UserSettings_GlobalCookieSaveSettings(afterSaveFct)
{
	UserSettings_CookieSave(UserSettings_getCache(UserSettings_Scopes.GLOBALCOOKIE),
					'UserSettings_GlobalCookie', '/');

	if(afterSaveFct) afterSaveFct();
}

function UserSettings_GlobalCookieLoadSettings()
{
	UserSettings_CookieLoad(UserSettings_getCache(UserSettings_Scopes.GLOBALCOOKIE),
					'UserSettings_GlobalCookie');
}




function UserSettings_CookieSave(cache, cookieName, cookiePath)
{
	
	var settingsString = '';
	for (settingId in cache)
	{
		settingsString += escapeReservedSymbols(settingId) + '=' +
					escapeReservedSymbols(cache[settingId]) + '&';
	}

	if (settingsString.length > 0 && settingsString.charAt(settingsString.length - 1) == '&')
		settingsString = settingsString.substring(0, settingsString.length - 1);

	var options = new Object();
	
	var expirationDate = new Date();
	expirationDate.setFullYear(expirationDate.getFullYear() + 1);
	options['expires'] = expirationDate;
	options['path'] = cookiePath;

	
	if (settingsString)
		CookieAccess.set(cookieName, settingsString, options);
	else
		CookieAccess.remove(cookieName, options);
}

function UserSettings_CookieLoad(cache, cookieName)
{
	var settingsString = CookieAccess.get(cookieName);

	if (!settingsString)
		return;

	var cookieSettings = settingsString.split('&');
	for(var i = 0; i < cookieSettings.length; ++i)
	{
		var pair = cookieSettings[i].split('=');
		cache[unescapeReservedSymbols(pair[0])] = unescapeReservedSymbols(pair[1]);
	}
}




function UserSettings_UserPrefWrite(id, value, saveNow, afterSaveFct)
{
	return UserSettings_WriteToCache(UserSettings_Scopes.USERPREFERENCES, id, value,
					UserSettings_UserPrefSaveSettings, saveNow, afterSaveFct);
}


function UserSettings_UserPrefSaveSettings(afterSaveFct)
{
	var cache = UserSettings_getCache(UserSettings_Scopes.USERPREFERENCES);

	var prefsString = buildUrlEscapedSettingsString(cache);

	if (!prefsString)
	{
		if(afterSaveFct) afterSaveFct();
		return;
	}

	var servletUrl = contextUrl(UserSettings_servletBaseURL + '?scope=USERPREFERENCES&' + prefsString);

	
	XMLHttp_GetAsyncRequest(servletUrl, afterSaveFct, null, null, "savePreferenceSettings");
}

/**
 * This is a temporary API, a better integration should be provided
 *
 * The callbackfct is passed an object with the key/value pairs.
 *
 * @param scopeid scope id string USERPREFERENCES or HTTPSESSION
 * @param keys array of setting keys to read
 * @param callbackfct the function to call when the information is available
 * @param callbackscope the scope of the callbackfct (optional)
 *
 * @lastrev fix37148 - remove extra '/' before passing to contextUrl() method.
 */
function UserSettings_ReadFromServer(scopeid, keys, callbackfct, callbackscope)
{
	
	Ext.Ajax.request(
	{
		url: contextUrl('portal/usersettings.jsrv'),
		method: 'GET',
		params:
		{
			'scope': scopeid,
			'read': keys
		},
		'scope': callbackscope,
		callback : function(options, success, responseObject)
		{
			if(!success)
				return;

			var result = eval(responseObject.responseText);

			callbackfct.call(this, result);
		}
	} );

}



function UserSettings_ReadFromCache(scope, id)
{
	if (typeof(id) != 'string')
		return null;

	value = UserSettings_getCache(scope)[id];

	
	if (!value)
		return null;

	return value;
}

function UserSettings_WriteToCache(scope, id, value, delayedSaveFunction, saveNow, saveNowCallBack)
{
	if (!id || typeof(id) != 'string')
		return false;

	if (!value || typeof(value) != 'string')
		return false;

	var cache = UserSettings_getCache(scope);

	cache[id] = value;

	if (scope.timeoutId)
	{
		clearTimeout(scope.timeoutId);
		scope.timeoutId = null;
	}

	if (saveNow)
	{
		delayedSaveFunction(saveNowCallBack);
	}
	else
	{
		var delay = scope.saveDelayMs;

		if (!delay)
			delay = 100;

		scope.timeoutId = setTimeout(function() {delayedSaveFunction(null);}, delay);
	}

	return true;
}

function buildUrlEscapedSettingsString(cache)
{
	var settingsString = '';

	for (settingId in cache)
	{
		if (settingsString)
			settingsString += '&';

		settingsString += encodeURIComponent(settingId) + '=' +
					encodeURIComponent(cache[settingId]);
	}

	return settingsString;
}


function escapeReservedSymbols(str)
{
	if (!str || typeof(str) != 'string')
		return null;

	str = str.replace(/@/g, '@at');

	str = str.replace(/=/g, '@eq');
	str = str.replace(/&/g, '@amp');

	return str;
}


function unescapeReservedSymbols(str)
{
	if (!str || typeof(str) != 'string')
		return null;

	str = str.replace(/@eq/g, '=');
	str = str.replace(/@amp/g, '&');

	str = str.replace(/@at/g, '@');

	return str;
}
