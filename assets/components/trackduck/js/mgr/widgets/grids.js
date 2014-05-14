TrackDuck.grid.Contexts = function (config) {
	config = config || {};
	var fields = [
		'key',
		'url',
		'project_id'
	];
	var record = Ext.data.Record.create(fields);
	var contexts = [];
	Ext.each(TrackDuck.config.contexts, function (context) {
		contexts.push(new record(context, context.key));
	});
	Ext.applyIf(config, {
		url: TrackDuck.config.connectorUrl,
		autoHeight: true,
		fields: fields,
		paging: true,
		remoteSort: false,
		columns: [{
			header: _('trackduck.context.key'),
			dataIndex: 'key',
			width: 50,
			sortable: true
		}, {
			header: _('trackduck.context.url'),
			dataIndex: 'url',
			sortable: true
		}, {
			header: _('trackduck.context.project_id'),
			dataIndex: 'project_id',
			width: 50,
			sortable: true,
			hidden: !TrackDuck.config.expertMode,
			hideable: TrackDuck.config.expertMode
		}, {
			header: _('trackduck.context.enabled'),
			dataIndex: 'project_id',
			width: 30,
			sortable: true,
			renderer: this.renderYesNo
		}, {
			header: _('trackduck.context.actions'),
			width: 40,
			dataIndex: 'project_id',
			renderer: {
				fn: this.renderProjectButtons,
				scope: this
			}
		}],
		autoExpandColumn: 'url'
	});
	TrackDuck.grid.Contexts.superclass.constructor.call(this, config);
	this.getStore().add(contexts);
};
Ext.extend(TrackDuck.grid.Contexts, MODx.grid.LocalGrid, {
	getMenu: function () {
		if (!TrackDuck.config.expertMode) {
			return [];
		}
		var record = this.menu.record;
		var hasProjectId = record.project_id !== '';
		var menu = [{
			text: _('trackduck.action.' + (hasProjectId ? 'change_project' : 'set_project')),
			scope: this,
			handler: this.updateProject
		}, '-'];
		if (hasProjectId) {
			menu.push({
				text: _('trackduck.action.disable'),
				scope: this,
				handler: this.disableProject
			});
		} else {
			menu.push({
				text: _('trackduck.action.enable'),
				scope: this,
				handler: this.enableProject
			});
		}
		return menu;
	},
	showLogin: function () {
		MODx.load({
			xtype: 'trackduck-window-login'
		}).show();
	},
	updateProject: function () {
		var record = this.getStore().getById(this.menu.record.key);
		if (!record) {
			return;
		}
		MODx.load({
			xtype: 'trackduck-window-update-project',
			record: record.data,
			listeners: {
				success: {
					fn: function (result) {
						var response = (result && result.a && result.a.result && result.a.result.object) || {};
						if (response.project_id) {
							record.set('project_id', response.project_id);
							record.commit();
						}
					},
					scope: this
				}
			}
		}).show();
	},
	disableProject: function (record) {
		this.changeProject(record);
	},
	enableProject: function (record) {
		record = this.getRecord(record);
		if (!record) {
			return;
		}
		var self = this;
		var message = Ext.MessageBox.wait(_('trackduck.signup.checking_status'), _('please_wait'));
		TrackDuck.getSettings(record.get('url'), function (status, responseCode, error, data) {
			message.hide();
			switch (status) {
				case TrackDuck.NOT_SUPPORTED:
					break;
				case TrackDuck.OK:
					self.changeProject(record, data.projectId);
					break;
				case TrackDuck.NOT_LOGGED:
					self.showLogin();
					break;
				default:
					self.createProject(record);
			}
		});
	},
	changeProject: function (record, project_id) {
		record = this.getRecord(record);
		if (!record) {
			return;
		}
		var message = Ext.MessageBox.wait(_('saving'), _('please_wait'));
		MODx.Ajax.request({
			url: this.url,
			params: {
				action: 'context/update',
				key: record.id,
				project_id: project_id || ''
			},
			callback: function () {
				message.hide();
			},
			listeners: {
				success: {
					fn: function (response) {
						record.set('project_id', (response.object || {}).project_id || '');
						record.commit();
					}
				}
			}
		});
	},
	createProject: function (record) {
		Ext.Msg.confirm(_('warning'), _('trackduck.project.create_confirmation'), function (e) {
			if (e == 'yes') {
				window.open(TrackDuck.config.createProjectUrl + '?url=' + encodeURIComponent(record.get('url')), '_blank');
			}
		});
	},
	renderProjectButtons: function (value, meta, record) {
		var id = Ext.id();
		var hasProjectId = record.get('project_id') !== '';
		this.createButton.defer(1, this, [
			hasProjectId ? _('trackduck.action.disable') : _('trackduck.action.enable'),
			id,
			(hasProjectId ? this.disableProject : this.enableProject).createDelegate(this, [
				record
			])
		]);
		return '<div id="' + id + '"></div>';
	},
	createButton: function (text, id, handler) {
		var button = new Ext.Button({
			text: text,
			scope: this,
			handler: handler
		});
		button.render(document.body, id);
	},
	getRecord: function (record) {
		if (!record) {
			record = this.menu.record;
		}
		if (!record) {
			return null;
		}
		if (record instanceof Ext.data.Record) {
			return record;
		}
		return this.getStore().getById(record.key || '');
	},
	renderYesNo: function (value, meta) {
		if (value === '') {
			meta.css = 'red';
			return _('no');
		}
		meta.css = 'green';
		return _('yes');
	}
});
Ext.reg('trackduck-grid-contexts', TrackDuck.grid.Contexts);
