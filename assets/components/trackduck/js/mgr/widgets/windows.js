TrackDuck.window.UpdateProject = function (config) {
	config = config || {};
	Ext.applyIf(config, {
		title: _('trackduck.project.update'),
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

TrackDuck.window.Login = function (config) {
	config = config || {};
	Ext.applyIf(config, {
		title: _('trackduck.signup'),
		width: 400,
		modal: true,
		items: [{
			html: '<p>' + _('trackduck.signup.intro') + '</p>',
			border: false,
			bodyCssClass: 'panel-desc'
		}, {
			layout: 'anchor',
			border: false,
			padding: '5px 5px 0 5px',
			defaults: {
				style: {
					marginBottom: '5px'
				}
			},
			items: [{
				xtype: 'button',
				text: _('trackduck.signup.google'),
				handler: this.showLoginPage.createDelegate(this, ['google']),
				anchor: '100%'
			}, {
				xtype: 'button',
				text: _('trackduck.signup.facebook'),
				handler: this.showLoginPage.createDelegate(this, ['facebook']),
				anchor: '100%'
			}, {
				xtype: 'button',
				text: _('trackduck.signup.email'),
				handler: this.showLoginPage.createDelegate(this, ['email']),
				anchor: '100%'
			}]
		}],
		closeAction: 'close',
		maximizable: false,
		collapsible: false,
		resizable: false
	});
	TrackDuck.window.Login.superclass.constructor.call(this, config);
};
Ext.extend(TrackDuck.window.Login, Ext.Window, {
	showLoginPage: function (type) {
		var urls = TrackDuck.config.loginUrls || {};
		if (urls.hasOwnProperty(type)) {
			window.location.href = urls[type] + '?redirect=' + encodeURIComponent(TrackDuck.config.returnUrl || window.location.href);
		}
		this.close();
	}
});
Ext.reg('trackduck-window-login', TrackDuck.window.Login);
