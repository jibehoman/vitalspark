

















Ext.ns('com.actional.serverui.logs');



/**
 * This class renders the Request/Reply content panes.
 */
com.actional.serverui.logs.RequestReplyContentPane = Ext.extend(Ext.Panel,
{
	constructor: function(config)
	{
		var contentInfo = config.contentInfo;

		var tbar = undefined;

		if (contentInfo)
		{
			var contentType = '';
			if (contentInfo.contentType)
			{
				contentType += contentInfo.contentType;

				if (contentInfo.contentSize)
				{
					contentType += ' (' + contentInfo.contentSize  + ')';
				}
			}

			tbar = [];

			tbar.push(' ');

			tbar.push({text: 'Download', handler: function() { document.location.href = contentInfo.downloadUrl; }});

			tbar.push(' ');
			tbar.push('-');
			tbar.push(' ');

			if (contentInfo.isFastInfoset)
			{
				var downloadUrl = contentInfo.downloadUrl + "&convertToXml=true";
				tbar.push(
				{
					text: 'Download as xml',
					handler: function()
					{
						document.location.href = downloadUrl;
					}
				});

				tbar.push(' ');
				tbar.push('-');
				tbar.push(' ');
			}

			tbar.push({text: 'Examine Message', handler: window.viewOnClick, disabled: !contentInfo.enableExamineMessage});

			tbar.push(' ');
			tbar.push('-');
			tbar.push(' ');

			
			var enableAnalyzeButton = contentInfo.enableExamineMessage && (!config.requestOrReplyHasMtom);

			tbar.push({text: 'Analyze Message', handler: window.exportOnClick, disabled: !enableAnalyzeButton});

			tbar.push(' ');
			tbar.push('-');
			tbar.push(' ');


			
			tbar.push('->');
			tbar.push(contentType);
		}

		com.actional.serverui.logs.RequestReplyContentPane.superclass.constructor.call(this, Ext.applyIf(config,
		{
			bodyStyle:
			{
				'word-wrap': 'break-word'
			},
			html: contentInfo ? (contentInfo.content || '') : '<i style="padding: 5px; display: block;">No data</i>',
			autoHeight: true,
			tbar: tbar,
			collapsible: true
		}));
	}
});


Ext.reg('com.actional.serverui.logs.RequestReplyContentPane', com.actional.serverui.logs.RequestReplyContentPane);

/**
 * This class renders the attachments grid.
 */
com.actional.serverui.logs.AttachmentsGrid = Ext.extend(Ext.grid.GridPanel,
{
	constructor: function(config)
	{
		com.actional.serverui.logs.AttachmentsGrid.superclass.constructor.call(this, Ext.applyIf(config,
		{
			autoHeight: true,
			enableColumnMove: false,
			bodyStyle:
			{
				'padding-bottom': '1.5em'
			},
			store: new Ext.data.JsonStore(
			{
				fields: ['partId', 'contentType', 'url', 'size'],
				autoLoad: true,
				root: 'data',
				data:
				{
					data: config.attachments
				}
			}),
			columns:
			[
				{
					header: 'Part Id',
					dataIndex: 'partId',
					id: 'attachId',
					sortable: false,
					menuDisabled: true,
					renderer: function(value, metaData, record, rowIndex, colIndex, store)
					{
						return '<a href="' + record.get('url') + '">' +  value + '</a>';
					}
				},
				{
					header: 'Content Type',
					dataIndex: 'contentType',
					width: 140,
					fixed: true,
					menuDisabled: true,
					sortable: false
				},
				{
					header: 'Size',
					dataIndex: 'size',
					width: 100,
					fixed: true,
					menuDisabled: true,
					sortable: false
				}
			],
			disableSelection: true,
			autoExpandColumn: 'attachId',
			viewConfig:
			{
				scrollOffset: 0
			}
		}));
	}
});

Ext.reg('com.actional.serverui.logs.AttachmentsGrid', com.actional.serverui.logs.AttachmentsGrid);

/**
 * This class renders the application logs grid.
 */
com.actional.serverui.logs.ApplicationLogsGrid = Ext.extend(Ext.grid.GridPanel,
{
	constructor: function(config)
	{
		com.actional.serverui.logs.ApplicationLogsGrid.superclass.constructor.call(this, Ext.applyIf(config,
		{
			disableSelection: true,
			enableHdMenu: false,
			autoHeight: true,
			tbar:
			[
				{
					text: 'Explore Application Logs',
					handler: viewApplicationLogs,
					tooltip: 'View all Application Logs for this audit record'
				}
			],
			store: new Ext.data.JsonStore(
			{
				fields: ['date', 'loggerName', 'logLevel', 'className', 'methodName', 'message'],
				autoLoad: true,
				root: 'data',
				data:
				{
					data: config.logs
				}
			}),
			viewConfig:
			{
				forceFit: true,
				scrollOffset: 0
			},
			columns:
			[
				{
					header: config.headers[0],
					dataIndex: 'date',
					sortable: false,
					width: 1
				},
				{
					header: config.headers[1],
					dataIndex: 'loggerName',
					sortable: false,
					width: 1
				},
				{
					header: config.headers[2],
					dataIndex: 'logLevel',
					sortable: false,
					width: 1
				},
				{
					header: config.headers[3],
					dataIndex: 'className',
					sortable: false,
					width: 1
				},
				{
					header: config.headers[4],
					dataIndex: 'methodName',
					sortable: false,
					width: 1
				},
				{
					header: config.headers[5],
					dataIndex: 'message',
					sortable: false,
					width: 1
				}
			]
		}));
	}
});

Ext.reg('com.actional.serverui.logs.ApplicationLogsGrid', com.actional.serverui.logs.ApplicationLogsGrid);

