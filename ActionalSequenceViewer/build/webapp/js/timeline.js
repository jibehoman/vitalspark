

















Ext.namespace('com.actional.serverui.timemanagement');

var DATEFORM_WIDTH = 185;
var LIVE_WIDTH = 60;
var MARGIN;


/**
 * The main container which houses the TimeLine flash control
 * and the 'ControlPanel' which is used to control it.
 *
 * @class com.actional.serverui.timemanagement.TimeLine
 * @extends Ext.Panel
 *
 * @lastrev fix35988 - updated to show times in the user selected timezone & locale;
 */
com.actional.serverui.timemanagement.TimeLine = Ext.extend(Ext.Panel,
{
    /**
     * @cfg {object} initialTimeInterval
     *
     * the initial time interval. Object containing 2 values:
     * 	startTime : (Number - epoch)
     *  endTime   : (Number - epoch)
     */

    /**
     * @cfg {Boolean} disableLive
     *
     * true to disable the "Live" functionality
     */

	/**
	 * @lastrev fix37829 - change background-color to black for dark theme
	 */
	constructor: function(config)
	{
		var eastPanelWidth = config.disableLive ? DATEFORM_WIDTH : DATEFORM_WIDTH + LIVE_WIDTH + 12;

		com.actional.serverui.timemanagement.TimeLine.superclass.constructor.call(this, Ext.applyIf(config,
		{
			border: false,
		    	layout: 'border',
		    	bodyStyle:
			{
				"background-color": (typeof getTheme == 'function') && getTheme() == 'dark'? '#161616': 'white'
			},
		    	height: 65,
		    	items:
		    	[
				{
					region: 'center',
					layout: 'fit',
					margins: '0 0 1 0',
					xtype: 'com.actional.Flash',
					swfUrl: contextUrl('images/TimeLine.swf?l='+PageState_pageid),  
					objectId: 'TimeLine'
				},
				{
					region: 'east',
					width: eastPanelWidth,
				    	id:'timemanagement.ControlPanel',
					margins: '0 0 0 10',
					xtype: 'com.actional.serverui.timemanagement.ControlPanel',
					border: false,
					initialTimeInterval: config.initialTimeInterval,
					disableLive: config.disableLive
				}
			]
		}));
	},

	initComponent : function()
	{
		com.actional.serverui.timemanagement.TimeLine.superclass.initComponent.call(this);
		Ext.EventManager.onWindowResize(this.doLayout, this);
	}
});

Ext.reg('com.actional.serverui.timemanagement.TimeLine', com.actional.serverui.timemanagement.TimeLine);


/**
 * The panel which has the 5min, 1h, 1d ... quick time range
 * setting links.
 *
 * @class com.actional.serverui.timemanagement.QuickTimes
 * @extends Ext.Container
 */
com.actional.serverui.timemanagement.QuickTimes = Ext.extend(Ext.Container,
{
	onRender: function(ct, pos)
	{
		var a1 = "document.getElementById('TimeLine').intervalSelectionChanged(";
		var a2 = ")";
		var min = 60 * 1000;
		var h = 60 * min;
		var d = 24 * h;
		var data =
		{
			links:
			[
				{
					name	:'5min',
					action  : a1 + (5 * min) + a2
				},
				{
					name	:'1h',
					action  : a1 + (h) + a2
				},
				{
					name	:'1d',
					action  : a1 + (d) + a2
				},
				{
					name	:'1w',
					action  : a1 + (7 * d) + a2
				},
				{
					name	:'1m',
					action  : a1 + (30 * d) + a2
				},
				{
					name	:'1q',
					action  : a1 + (90 * d) + a2
				},
				{
					name	:'1y',
					action  : a1 + (365 * d) + a2
				}
			]
		};

		var tpl = new Ext.XTemplate(
			    '<tpl for="links">',
			        '<a style="font-size:75%;" href="#" onClick="{action}; return false;">{name}</a>',
			        '&nbsp;&nbsp;',
			    '</tpl>'
    		);

		this.el = ct.createChild({tag:'div'});
		tpl.overwrite(this.el, data);
		com.actional.serverui.timemanagement.QuickTimes.superclass.onRender.call(this, ct, pos);
	}
});

Ext.reg('com.actional.serverui.timemanagement.QuickTimes', com.actional.serverui.timemanagement.QuickTimes);



/**
 * 'fromToDates'  is the validation type which validates whether
 * from / to dates in the date form are valid and form a valid time
 * range.
 * @lastrev fix35509 - validating the 'other' field as well to check valid date range
 */
Ext.apply(Ext.form.VTypes, {
    fromToDates : function(val, field) {

    	var date =	com.actional.serverui.timemanagement.dateFromString(val);

    	if(!date)
    	{
    		return false;
    	}

	var valid;
	var otherField;
        if (field.to)
        {
        	otherField = Ext.getCmp(field.to);
		var toDate = com.actional.serverui.timemanagement.dateFromString(otherField.getRawValue());
		valid = (toDate && date.getTime() < toDate.getTime());
        }
        else if (field.from)
        {
        	otherField = Ext.getCmp(field.from);
		var fromDate = com.actional.serverui.timemanagement.dateFromString(otherField.getRawValue());
		valid = (fromDate && date.getTime() > fromDate.getTime());
        }

        if(valid)
        {
        	field.clearInvalid();

        	if (field.validateOther)
        	{
        		otherField.validateOther = false;
        		otherField.validate();
        		otherField.validateOther = true;
        	}

        }
        return valid;
    }
});


/**
 * The form panel which has the From, To date fields.
 * setting links.
 *
 * @class com.actional.serverui.timemanagement.DateForm
 * @extends Ext.FormPanel
 */
com.actional.serverui.timemanagement.DateForm = Ext.extend(Ext.FormPanel,
{
	/**
	 * @cfg {object} initialTimeInterval
	 *
	 * the initial time interval. Object containing 2 values:
	 * startTime : (Number - epoch)
	 *  endTime   : (Number - epoch)
	 */

	/**
	 * @cfg {Boolean} disableLive
	 *
	 * true to disable the "Live" functionnality
	 */

	/**
	 * @lastrev fix36813 - decrease the size of the textfields as it causes layout issues in IE.
	 */
	constructor: function(config)
	{
		com.actional.serverui.timemanagement.DateForm.superclass.constructor.call(this,Ext.applyIf(config,
		{
			id: 'timemanagement.DateForm',
			border: false,
		        labelWidth: 30,
		        defaults: {width: 145},
		        
		        itemCls : 'x-form-margin-item',
		        defaultType: 'com.actional.util.SelectionTextField',
			listeners:
			{
		        	render : this.init,
		        	scope:this
			},
		        items:
		        [
		        	{
		                	fieldLabel: 'From',
		                	name: 'fromDate',
		                	id: 'fromDate',
		                	readOnly: true,
		                	hasEditHooks: false
		            	},
		            	{
		                	fieldLabel: 'To',
		                	name: 'toDate',
		                	id: 'toDate',
		                	readOnly: true,
		                	hasEditHooks: false
		            	}
			]
		}));

	},

	
	initialized:false,

	/**
	* private
	* Subscribes to events and requests for a
	* 'com.actional.serverui.newGatherInterval' to intialize itself
	* and the TimeLine
	*/
	init: function()
	{
		OpenAjax.hub.subscribe('com.actional.serverui.newGatherInterval', function(name, event)
		{
			if(!this.initialized)
				this.initialize(event.lastinterval);
		}, this, {source:'dateform'});

		OpenAjax.hub.subscribe('com.actional.serverui.timeSelectionChanged',
			this.timeSelectionChangeHandler, this, {source:'dateform'});

		
		OpenAjax.hub.publish('com.actional.util.EventRequest',
		{
			source	: 'dateform',
			events	: ['com.actional.serverui.newGatherInterval']
		});

	},

	/**
	 * finish the initialization.
	 * Called only once and after the first newGatherInterval event has been received
	 *
	 * If time state is not there (first ever run in this machine),
	 * creates a live time state (1 hr duration).
	 * It intializes timeLine and acts as the owner
	 * of the  'com.actional.serverui.timeSelectionChanged' event
	 *
	 * @param {int} now  endTime of the last gather interval
	 * @lastrev fix35362 - sub to com.actional.util.EventRequest moved ahead of first publish
	 */
	
	initialize: function(now)
	{
		
		if(!this.initialized)
		{
			this.initialized = true;

			var timeState;

			if(this.initialTimeInterval)
			{
				timeState =
				{
					startTime: this.initialTimeInterval.startTime,
					endTime: this.initialTimeInterval.endTime,
					isLive: false
				};

				if(this.isValidTimeState(timeState))
					this.setTimeState(timeState);
				else
					timeState = undefined;
			}

			if(!timeState)
			{
				timeState = this.getTimeState();
			}

			if(!timeState)
			{
				
				
				timeState = {};
				timeState.isLive = true;
				timeState.startTime = now - 60 * 60 * 1000; 
				timeState.endTime = now;
				this.setTimeState(timeState);
			}

			if(this.disableLive)
				timeState.isLive = false;


			OpenAjax.hub.subscribe('com.actional.util.EventRequest', function(name, publisherData)
			{
				if(publisherData.events.indexOf('com.actional.serverui.timeSelectionChanged') >= 0)
				{
					this.fireTimeSelectionEvent();
				}
			}, this, {source:'dateform'});

			if(timeState.isLive)
			{
				this.fireLiveSelectionChange(timeState, now);
			}
			else
			{
				this.fireTimeSelectionEvent(timeState);
			}

		}
	},

	/**
	 * private
	 *
	 * Edit hooks for the From, To text fields are the event listeners
	 * which prop up the fake edit dialog when the receive input focus.
	 * This function inits the mouse and focus events
	 * on the From/To textfields
	 *
	 * @lastrev fix35768 - new function
	 */
	initEditHooks: function()
	{
		var fromDate = this.findById('fromDate');
		var toDate = this.findById('toDate');

		var fromDateEl = fromDate.el;
		var toDateEl = toDate.el;

		fromDateEl.on('mousedown', function()
		{
			this.onDateFormTextFieldMouseDown.apply(this, [fromDate]);
		}, this);

		fromDateEl.on('mouseup', function()
		{
			this.onDateFormTextFieldMouseUp.apply(this, [fromDate]);
		}, this);

		fromDateEl.on('focus', function()
		{
			this.onDateFormTextFieldFocus.apply(this, [fromDate]);
		}, this);

		toDateEl.on('mousedown', function()
		{
			this.onDateFormTextFieldMouseDown.apply(this, [toDate]);
		}, this);

		toDateEl.on('mouseup', function()
		{
			this.onDateFormTextFieldMouseUp.apply(this, [toDate]);
		}, this);

		toDateEl.on('focus', function()
		{
			this.onDateFormTextFieldFocus.apply(this, [toDate]);
		}, this);

		fromDate.hasEditHooks = toDate.hasEditHooks = true;

	},

	/**
	* private
	* Retrieve the selection_t0, selection_t1 and isLive status from the
	* global cookie
	*/
	getTimeState: function()
	{
		var startTime = UserSettings_Read(UserSettings_Scopes.GLOBALCOOKIE, 'Time.st');
		var endTime = UserSettings_Read(UserSettings_Scopes.GLOBALCOOKIE, 'Time.et');
		var isLive =  UserSettings_Read(UserSettings_Scopes.GLOBALCOOKIE, 'Time.live');

		if(!startTime || !endTime)
		{
			return null;
		}

		var timestate =
		{
			startTime: parseInt(startTime),
			endTime: parseInt(endTime),
			isLive: 'true' == isLive
		};

		if (!this.isValidTimeState(timestate))
			return null;

		return timestate;
	},

	isValidTimeState: function(timestate)
	{
		
		var delta = timestate.endTime - timestate.startTime;

		if(	delta <= 10000 ||  
			delta > (10 * 365 * 24 * 60 * 60 * 1000)) 
		{
			return false;
		}

		return true;
	},

	/**
	* private
	* Save the selection_t0, selection_t1 and isLive status to the
	* global cookie
	*/
	setTimeState: function(timeState)
	{
		if (!timeState)
		{
			return;
		}

		if (timeState.isLive != undefined)
		{
			UserSettings_Write(UserSettings_Scopes.GLOBALCOOKIE,
				'Time.live', String(timeState.isLive), !timeState.startTime || !timeState.endTime);
		}

		if (timeState.startTime && timeState.endTime)
		{
			UserSettings_Write(UserSettings_Scopes.GLOBALCOOKIE,
				'Time.st', String(timeState.startTime));

			UserSettings_Write(UserSettings_Scopes.GLOBALCOOKIE,
				'Time.et', String(timeState.endTime), true);
		}
	},

	
	fireTimeSelectionEvent: function(timeState)
	{
		if (!timeState)
		{
			timeState = this.getTimeState();
		}

		if (timeState)
		{
			OpenAjax.hub.publish('com.actional.serverui.timeSelectionChanged',
			{
				selection_t0: timeState.startTime,
				selection_t1: timeState.endTime,
				isLive: timeState.isLive,
				source: 'dateform'
			});
		}
	},

	
	fireLiveSelectionChange: function(timeState, now)
	{
		
		var duration = timeState.endTime - timeState.startTime;
		timeState.endTime = now;
		timeState.startTime = now - duration;
		this.setTimeState(timeState);
		this.fireTimeSelectionEvent(timeState);
	},

	/**
	 * private
	 * @lastrev fix35768 - remove validation on text fields; init edithooks for the fields if required
	 */
	timeSelectionChangeHandler: function(name, event)
	{
		var fromField =  this.findById('fromDate');
		fromField.setRawValue(this.toText(event.selection_t0));

		var toField = this.findById('toDate');
		toField.setRawValue(this.toText(event.selection_t1));


		if (!fromField.hasEditHooks)
		{
			
			this.initEditHooks();
		}

		var timeState = {};

		timeState.startTime = event.selection_t0;
		timeState.endTime = event.selection_t1;
		timeState.isLive = event.isLive;
		this.setTimeState(timeState);

		if(this.disableLive)
			return;

		
		
		

		var btn = Ext.getCmp('timemanagement.PlayPauseButton');
		if(!btn)
			return;

		if(!btn.isVisible())
		{
			btn.show();
		}

		if(event.isLive)
		{
			btn.setIconClass('action-pause');
			btn.setText('Pause');
			document.getElementById('timemanagement.StatusLive').style.display = '';
			document.getElementById('timemanagement.StatusPaused').style.display = 'none';
		}
		else
		{
			btn.setIconClass('action-play');
			btn.setText('Live');
			document.getElementById('timemanagement.StatusLive').style.display = 'none';
			document.getElementById('timemanagement.StatusPaused').style.display = '';
		}
	},

	/**
	* Public API. When called, will fire a
	* 'com.actional.serverui.timeSelectionChanged' event with the
	* isLive value which is a not of its current value.
	*/
	toggleLiveState: function()
	{
		var timeState = this.getTimeState();
		if(timeState)
		{
			timeState.isLive = !timeState.isLive;
			this.fireTimeSelectionEvent(timeState);
		}
	},

	
	toText: function(time)
	{
		var date =  com.actional.util.TDateBridge.tDateTimeToDate(time);
		var today = com.actional.util.TDateBridge.tDateTimeToDate();

		var format = com.actional.DataStore.localeInfo.getShortDateTime(true);
		var dateText;
		if ((date.getFullYear()==today.getFullYear())
			&& (date.getMonth()==today.getMonth())
			&& (date.getDate()==today.getDate()))
		{
			format = com.actional.DataStore.localeInfo.getShortTime(true);
			dateText = date.toString(format) + " Today";
		}
		else
		{
			dateText = date.toString(format);
		}
		return dateText;
	},


	/**
	 * @lastrev fix35768 - handler from mouse down on from/to fields of date form
	 */
	onDateFormTextFieldMouseDown: function(textfield)
	{
		this.dateFormTextFieldKeyDown = true;
	},

	/**
	 * @lastrev fix37009 - update the dialog.selectedTextFieldType before calling the updated dialog.grabFocus(...)
	 */
	onDateFormTextFieldMouseUp: function(textfield)
	{
		this.dateFormTextFieldKeyDown = false;

		var pos = textfield.getSelectionRange();
		textfield.clearSelection();

		var dialog = this.getDateFormDialog();


		if (textfield.id == 'fromDate')
		{
			dialog.selectedTextFieldType = 'from';
		}
		else
		{
			dialog.selectedTextFieldType = 'to';
		}

		dialog.show();
		dialog.grabFocus(pos[0], pos[1]);
	},

	/**
	 * Takes care of tab in focus. If mouse is already down on this element,
	 * this method is no op.
	 * @lastrev fix35768 - handler from focus on from/to fields of date form
	 */
	onDateFormTextFieldFocus: function(textfield)
	{
		if (!this.dateFormTextFieldKeyDown)
		{
			var dialog = this.getDateFormDialog();

			dialog.show();

			var length = textfield.getRawValue().length;

			if (textfield.id == 'fromDate')
			{
				dialog.grabFocus('from', 0, length);
			}
			else if (textfield.id == 'toDate')
			{
				dialog.grabFocus('to', 0, length);
			}
		}
	},

	/**
	 * @lastrev fix35768 - new method
	 */
	getDateFormDialog: function()
	{
		if (!this.dateFormDialog)
		{
			this.dateFormDialog = new com.actional.serverui.timemanagement.DateFormDialog(
			{
				fromDateId: 'fromDate',
				toDateId: 'toDate',
				controlPanelId: 'timemanagement.ControlPanel'
			});
		}

		return this.dateFormDialog;
	}
});

Ext.reg('com.actional.serverui.timemanagement.DateForm', com.actional.serverui.timemanagement.DateForm);


/**
 * The panel which contains the QuickTimes, DateForm and
 * the Button/Status Area of the TimeLine control
 *
 * @class com.actional.serverui.timemanagement.ControlPanel
 * @extends Ext.FormPanel
 */
com.actional.serverui.timemanagement.ControlPanel = Ext.extend(Ext.Panel,
{
	/**
 	 *@cfg {object} initialTimeInterval
	 *
	 * the initial time interval. Object containing 2 values:
	 * 	startTime : (Number - epoch)
	 *  endTime   : (Number - epoch)
	 */

	/**
	 * @cfg {Boolean} disableLive
	 *
	 * true to disable the "Live" functionnality
	 */

	/**
	 * @lastrev fix37829 - change background-color to black for dark theme
	 */
	constructor: function(config)
	{
		com.actional.serverui.timemanagement.ControlPanel.superclass.constructor.call(this, Ext.applyIf(config,
		{
			layout: 'border',
			bodyStyle:
			{
				"background-color": (typeof getTheme == 'function') && getTheme() == 'dark'? '#161616': 'white'
			},
			items:
			[
				
				{
					region:'north',
					id:'timemanagement.QuickTimes',
					style: 'padding-left: 32px',
					xtype:'com.actional.serverui.timemanagement.QuickTimes'
				},

				
				{
					region:'center',
				        width: DATEFORM_WIDTH,
				        id: 'timemanagement.DateForm',
					xtype: 'com.actional.serverui.timemanagement.DateForm',
					initialTimeInterval: config.initialTimeInterval,
					disableLive: config.disableLive
				},
				{
					
					region: 'east',
					xtype: 'panel',
					width: LIVE_WIDTH,
					border: false,
					hidden: config.disableLive,
					margins: '0 0 0 12',
					id: 'timemanagement.LiveArea',
					items:
					[
						{
							xtype:'panel',
							border: false,
							height: 26,
							bodyStyle: 'text-align: center',

							
							html:"<img id='timemanagement.StatusLive' " +
								"src='"+contextUrl('/images/play24.png') +
								"' title='Live'  style='display:none;'>" +

								"<img id='timemanagement.StatusPaused' " +
								"src='"+contextUrl('/images/pause_orange24.png')+
								"' title='Paused' style='display:none;'>"
						},

						
						{
							id: 'timemanagement.PlayPauseButton',
							xtype: 'button',
							cls: 'x-btn-text-smallicon',
							hidden: true,
							minWidth: 59,
							listeners:
							{
								click: function()
								{
									Ext.getCmp('timemanagement.DateForm').
										toggleLiveState();
								}
							}
						}
					]

				}
			]
		}));

	}
});

/**
 *
 * @ lastrev fix36980 -  Issue with time selection in network overview
 */
com.actional.serverui.timemanagement.dateFromString = function(dateString)
	{
		if (typeof dateString != 'string')
		{
			return null;
		}
		dateString = dateString.trim();

		var format = com.actional.DataStore.localeInfo.getShortDateTime(true);

		var date = Date.parseExact(dateString, format);

		if (date)
		{
			return date;
		}

		
		
		if (dateString.indexOf('Today') > -1)
		{
			var isToday = true;
			dateString = dateString.replace(/Today/g,'').trim();
		}
		format = com.actional.DataStore.localeInfo.getShortTime(true);
		date = Date.parseExact(dateString, format);

		if (date)
		{
			
			
			if(isToday)
				date.setDate(new Date().getDate());

			return date;
		}

		
		return Date.parse(dateString);
	};

Ext.reg('com.actional.serverui.timemanagement.ControlPanel', com.actional.serverui.timemanagement.ControlPanel);
