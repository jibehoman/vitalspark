

















/**
* The singleton object used to change the date from a text field.
* TODO: The component has to be expanded to encapsulate Play/Pause and granularity selection
* Public API :
*	init (dateTextBox);
*	getDate();
*	setDate(newDate);
*	getIsReadOnly();
*	setEnabled(isEnabled);
*	isEnabled();
*	isStatisticsPaused();
*	setStatisticsPaused(flag)
*	addDateChoiceChangeListener(listener);
*	removeDateChoiceChangeListener(listener);
*/
var DATE_CHOOSER =
	function()
	{
		
		var isReadOnly;

		
		var isStatsPaused = false;

		
		var dateField;

		
		
		var lastValidationId;

		
		
		var date = new Date(0);

		
		var editedDate;

		
		var listeners;

		
		
		var validatorFn = function()
			{
				editedDate = Date.parse(dateField.value);
				if(editedDate == null)
				{
					addClass(dateField, 'verror');
				}
				else
				{
					removeClass(dateField, 'verror');
				}
				lastValidationId = null;
			};

		
		
		var onChangeFn = function()
			{
				if(editedDate == null)
				{
					DATE_CHOOSER.setDate(date);
				}
				else
				{
					date = editedDate;
					for(var i=0; (listeners && i < listeners.length);i++)
					{
						listeners[i].dateChoiceChanged(editedDate);
					}
				}
			};

		
		return {

			/**
			* The methods to initialize the DATE_CHOOSER. This method should be called
			* before the  DATE_CHOOSER is used in the page
			* @param  dateTextBox - The text field which is edited
			* @param  updateEnabled - Whether the control can be updated in this page
			*/
			init :
				function(dateTextBox, updateEnabled)
				{
					if(dateTextBox)
					{

						dateField = dateTextBox;
						var validationScheduler = function()
							{
								
								if(lastValidationId)
								{
									clearTimeout(lastValidationId);
								}
								
								lastValidationId = setTimeout(validatorFn,100);
							};

						
						setEventHandler(dateField,'keyup', validationScheduler);
						setEventHandler(dateField,'mouseup', validationScheduler);

						
						setEventHandler(dateField,'change', onChangeFn);

						isReadOnly = (updateEnabled == false);
						this.setEnabled(!isReadOnly);
					}
				},

			/**
			* Get the current date of the component
			*/
			getDate :
				function()
				{
					return date;
				},

			/**
			* Set the date of the component.
			*/
			setDate :
				function(newDate)
				{

					if(!newDate)
					{
						return;
					}
					date = newDate;
					var today = new Date();

					var dateText;
					if ((newDate.getFullYear()==today.getFullYear())
						&& (newDate.getMonth()==today.getMonth())
						&& (newDate.getDate()==today.getDate()) )
					{
						dateText = getMeridiemHrMins(newDate) + " Today";
					}
					else
					{
						dateText = getMeridiemHrMins(newDate) + ' '
							+ date.toString("MM/dd/yyyy");
					}
					if (dateField)
					{
						removeClass(dateField, 'verror');
						dateField.value = dateText;
					}
				},

			/**
			* Gets the readOnly status
			*/
			getIsReadOnly :
				function()
				{
					return isReadOnly;
				},

			/**
			* Set the enablement state of the component. When disabled, the text field is non editable.
			*/
			 setEnabled :
			 	function(isEnabled)
			 	{
			 		if(dateField)
			 		{
			 			dateField.disabled = !isEnabled;
			 		}
			 	},

			/**
			* Accessor for the enablement state of DATE_CHOOSER
			*/
			 isEnabled :
			 	function(isEnabled)
			 	{
			 		return dateField && !dateField.disabled;
			 	},

			/**
			* Accessor for the Statistics-Paused
			*/
			 isStatisticsPaused :
			 	function()
			 	{
			 		return isStatsPaused;
			 	},

			/**
			* Statistics-Paused setter
			*/
			 setStatisticsPaused :
			 	function(flag)
			 	{
			 		isStatsPaused = flag;
			 	},

			/**
			* Add a date change listener. The object should have a method by the name
			* dateChoiceChanged. The new date is passed as argument to the method when the date is changed
			* through DATE_CHOOSER
			*/
			 addDateChoiceChangeListener :
			 	function(listener)
			 	{
			 		if(listener && listener.dateChoiceChanged &&
			 			Function == listener.dateChoiceChanged.constructor)
			 		{
			 			if(listeners == null)
			 			{
			 				listeners = new Array();
			 			}
			 			listeners.push(listener);
			 		}
			 	},

			/**
			* Remove a date change listener.
			*/
			 removeDateChoiceChangeListener :
			 	function(listener)
			 	{
			 		if(listeners && listener && listener.dateChoiceChanged &&
			 			Function == listener.dateChoiceChanged.constructor)
			 		{
						for(var i=0;i < listeners.length;i++)
						{
							if(listener == listeners[i])
							{
								listeners.splice(i);
							}
						}
			 		}
			 	}

			};
	}();


/**
* Temporary function used to set the time-range on the DATE_CHOOSER.
* The DATE_CHOOSER's time is set to the endTime of the timeRangeObj.
* The states of the DATE_CHOOSER's statistics-paused field, prev, next, play-pause buttons
* are set according to whether the timeRangeObj is a 'mostrecent' one or not.
* There is a dependancy on NetworkBrowser_enableTimeSelectionPrevNextControls etc. But this will
* go away once the TimeLine API is defined.
*/
function DateChooser_setTimeRange(timeRangeObj)
{
	if (typeof timeRangeObj != 'undefined')
	{
		if(timeRangeObj.type == 'range')
		{
			if(!DATE_CHOOSER.getIsReadOnly())
			{
				DATE_CHOOSER.setEnabled(true);
			}
			DATE_CHOOSER.setDate(new Date(timeRangeObj.endTime));
			NetworkBrowser_enableTimeSelectionPrevNextControls();
		}
		else
		{
			
			
			var enabled = (AdminPage_LastGatherTime)?true:false;
			DATE_CHOOSER.setEnabled(enabled);
			NetworkBrowser_disableTimeSelectionPrevNextControls();
		}
	}

	if(NetworkBrowser_UserTimeSelection.type == 'mostrecent')
	{
		DATE_CHOOSER.setStatisticsPaused(false);
	}
	else
	{
		DATE_CHOOSER.setStatisticsPaused(true);
	}
	DateChooser_updatePlayPauseUI();
}

/**
* Enable or disable the DATE_CHOOSER and controls
*/
function DateChooser_setEnabled(enabled)
{
	DATE_CHOOSER.setEnabled(enabled);
	if (enabled)
		NetworkBrowser_enableTimeSelectionPrevNextControls();
	else
		NetworkBrowser_disableTimeSelectionPrevNextControls();

	DateChooser_setPlayPauseUIEnabled(enabled);
}

/**
* Handler to react to play-pause press.
*/
function DateChooser_onPlayPausePressed()
{

	if (DATE_CHOOSER.isStatisticsPaused())
	{
		
		DATE_CHOOSER.setStatisticsPaused(false);
		if (typeof NetworkBrowser_userTimeSelectionChanged != "undefined")
			NetworkBrowser_userTimeSelectionChanged( "historydlg", "mostrecent" );
	}
	else
	{
		
		DATE_CHOOSER.setStatisticsPaused(true);
		if (typeof NetworkBrowser_userTimeSelectionChanged != "undefined")
			NetworkBrowser_userTimeSelectionChanged( "historydlg", "holdcurrent" );
	}
	DateChooser_updatePlayPauseUI();
}

/**
* Updates the play-pause button.
*/
function DateChooser_updatePlayPauseUI()
{
	btnImage = document.getElementById('playPauseImg');
	if(!btnImage)
		return;
	if(DATE_CHOOSER.isStatisticsPaused())
	{
		btnImage.src = contextUrl('images/net_menu_time_cur.gif');
		btnImage.title = 'Resume Statistics Display';
	}
	else
	{
		btnImage.src = contextUrl('images/net_menu_time_past.gif');
		btnImage.title = 'Pause Statistics Display';
	}
}

/**
* Enables/Disables and updates the play-pause button.
*/
function DateChooser_setPlayPauseUIEnabled(enabled)
{
	var btnImage = document.getElementById('playPauseImg');
	if (btnImage)
	{
		if(enabled)
		{
			DateChooser_updatePlayPauseUI();
		}
		else
		{
			if(DATE_CHOOSER.isStatisticsPaused())
			{
				btnImage.src = contextUrl('images/net_menu_time_cur_off.gif');
			}
			else
			{
				btnImage.src = contextUrl('images/net_menu_time_past_off.gif');
			}
		}
	DDD.setEnabledState('PlayPauseButton', enabled);
	}
}

/**
* The DATE-CHANGE listener function. FOR NOW, put in in the global namespace. ie, the window object is the
* listener. The code is copy pasted from HistoryDialog_handleApply(dateObj)
* TODO: Move this logic to the timline's JS Object later. Also, phase out
* HistoryDialog_handleApply(dateObj);
*/
function dateChoiceChanged(dateObj)
{
	if (typeof NetworkBrowser_userTimeSelectionChanged != "undefined")
	{
		
		
		if (GlobalCalendar_isGlobalCalendarShowing())
			NetworkBrowser_userTimeSelectionChanged("historydlg", "globalinterval", DateUtil_userDate2serverTime( dateObj ));
		else if (GlobalCalendar_isNetworkBrowserShowing())
			NetworkBrowser_userTimeSelectionChanged("historydlg", "interval", DateUtil_userDate2serverTime( dateObj ));
	}
}
