TrackDuck.grid.Contexts = function (config) {
	config = config || {};
	Ext.applyIf(config, {
		url: TrackDuck.config.connectorUrl,
		corsSupported: false,
		autoHeight: true,
		fields: [
			'key',
			'url',
			'project_id'
		],
		contextRecord: [
			'key',
			'url',
			'project_id'
		],
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
			renderer: this.rendYesNo
		}, {
			header: _('trackduck.context.actions'),
			width: 40,
			dataIndex: 'project_id',
			renderer: {
				fn: this.renderProjectButtons,
				scope: this
			}
		}],
		autoExpandColumn: 'url',
		listeners: {
			afterrender: {
				fn: this.addContexts,
				scope: this
			}
		}
	});
	TrackDuck.grid.Contexts.superclass.constructor.call(this, config);
	this.contextRecord = Ext.data.Record.create(config.contextRecord);
};
Ext.extend(TrackDuck.grid.Contexts, MODx.grid.LocalGrid, {
	addContexts: function () {
		var grid = this;
		var store = grid.getStore();
		var contexts = TrackDuck.config.contexts || [];
		var total = contexts.length;
		if (total) {
			grid.loadMask.show();
			var addRecord = function (context) {
				if (context.key) {
					store.add(new grid.contextRecord(context, context.key));
				}
				total--;
				if (total < 1) {
					grid.loadMask.hide();
				}
			};
			Ext.each(contexts, function (context) {
				if (context.project_id == -1) {
					context.project_id = '';
					addRecord(context);
					return;
				}
				TrackDuck.getSettings(context.url, function (status, responseCode, error, data) {
					if (status === TrackDuck.OK) {
						if (context.project_id == data.projectId) {
							addRecord(context);
						} else {
							MODx.Ajax.request({
								url: grid.url,
								params: {
									action: 'context/update',
									key: context.key,
									project_id: data.projectId
								},
								listeners: {
									success: {
										fn: function (response) {
											addRecord(response.object || {});
										}
									},
									failure: {
										fn: function (response) {
											addRecord(response.object || {});
										}
									}
								}
							});
						}
					} else {
						context.project_id = '';
						addRecord(context);
					}
				});
			});
		}
	},
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
	updateProject: function () {
		var record = this.getStore().getById(this.menu.record.key);
		if (!record) {
			return;
		}
		var w = MODx.load({
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
		});
		w.setTitle(_('trackduck.project.update'));
		w.show();
	},
	disableProject: function (record) {
		this.changeProject(record, -1);
	},
	enableProject: function (record) {
		record = this.getRecord(record);
		if (!record) {
			return;
		}
		var self = this;
		TrackDuck.getSettings(record.get('url'), function (status, responseCode, error, data) {
			if (status === TrackDuck.OK) {
				self.changeProject(record, data.projectId);
			} else {
				self.createProject(record);
			}
		});
	},
	changeProject: function (record, project_id) {
		record = this.getRecord(record);
		if (!record) {
			return;
		}
		MODx.Ajax.request({
			url: this.url,
			params: {
				action: 'context/update',
				key: record.id,
				project_id: project_id || ''
			},
			listeners: {
				success: {
					fn: function (response) {
						var projectId = (response.object || {}).project_id || '';
						record.set('project_id', projectId == -1 ? '' : projectId);
						record.commit();
					}
				}
			}
		});
	},
	createProject: function (record) {
		window.location.href = TrackDuck.config.createProjectUrl + '?url=' + encodeURIComponent(record.get('url'));
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
		if (record instanceof this.contextRecord) {
			return record;
		}
		return this.getStore().getById(record.key || '');
	},
	rendYesNo: function (value, meta) {
		if (value === '') {
			meta.css = 'red';
			return _('no');
		}
		meta.css = 'green';
		return _('yes');
	}
});
Ext.reg('trackduck-grid-contexts', TrackDuck.grid.Contexts);
