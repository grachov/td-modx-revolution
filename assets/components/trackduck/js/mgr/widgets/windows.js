TrackDuck.window.UpdateProject = function (config) {
	config = config || {};
	Ext.applyIf(config, {
		url: TrackDuck.config.connectorUrl,
		baseParams: {
			action: 'context/update'
		},
		width: 400,
		modal: true,
		fields: [{
			xtype: 'hidden',
			name: 'key'
		}, {
			xtype: 'textfield',
			anchor: '100%',
			fieldLabel: _('trackduck.context.project_id'),
			name: 'project_id',
			allowBlank: false
		}],
		closeAction: 'close',
		maximizable: false,
		collapsible: false,
		resizable: false
	});
	TrackDuck.window.UpdateProject.superclass.constructor.call(this, config);
};
Ext.extend(TrackDuck.window.UpdateProject, MODx.Window);
Ext.reg('trackduck-window-update-project', TrackDuck.window.UpdateProject);
