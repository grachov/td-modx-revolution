TrackDuck.grid.Contexts = function (config) {
	config = config || {};
	Ext.applyIf(config, {
		url: TrackDuck.config.connectorUrl,
		corsSupported: false,
		autoHeight: true,
		fields: [
			'key',
			'url',
			'project_id',
			'enabled'
		],
		contextRecord: [{
			name: 'key'
		}, {
			name: 'url'
		}, {
			name: 'project_id'
		}, {
			name: 'enabled'
		}],
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
			sortable: true
		}, {
			header: _('trackduck.context.enabled'),
			dataIndex: 'enabled',
			width: 30,
			sortable: true,
			renderer: this.rendYesNo
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
				store.add(new grid.contextRecord(context, context.key));
				total--;
				if (total < 1) {
					grid.loadMask.hide();
				}
			};
			Ext.each(contexts, function (context) {
				if (context.project_id) {
					addRecord(context);
				} else {
					TrackDuck.getSettings(context.url, function (status, responseCode, error, data) {
						if (status === TrackDuck.OK) {
							MODx.Ajax.request({
								url: grid.url,
								params: {
									action: 'context/update',
									key: context.key,
									project_id: data.projectId
								},
								listeners: {
									success: {
										fn: function () {
											context.project_id = data.projectId;
											addRecord(context);
										}
									},
									failure: {
										fn: function () {
											addRecord(context);
										}
									}
								}
							});
						} else {
							addRecord(context);
						}
					});
				}
			});
		}
	},
	getMenu: function () {
		var record = this.menu.record;
		var hasProjectId = record.project_id !== '';
		var menu = [{
			text: _('trackduck.action.' + (hasProjectId ? 'change_project' : 'set_project')),
			scope: this,
			handler: this.changeProject
		}, '-'];
		if (record.enabled) {
			menu.push({
				text: _('trackduck.action.disable'),
				scope: this,
				handler: this.disableProject
			});
		} else {
			menu.push({
				text: _('trackduck.action.enable'),
				scope: this,
				handler: hasProjectId ? this.enableProject : this.createProject
			});
		}
		return menu;
	},
	changeProject: function () {
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
	disableProject: function () {
		this.changeProjectStatus(false);
	},
	enableProject: function () {
		this.changeProjectStatus(true);
	},
	changeProjectStatus: function (status) {
		var record = this.getStore().getById(this.menu.record.key);
		if (!record) {
			return;
		}
		MODx.Ajax.request({
			url: this.url,
			params: {
				action: 'context/update',
				key: record.id,
				enabled: status ? 1 : 0
			},
			listeners: {
				success: {
					fn: function () {
						record.set('enabled', status);
						record.commit();
					}
				}
			}
		});
	},
	createProject: function () {
		window.location.href = TrackDuck.config.createProjectUrl + '?url=' + encodeURIComponent(this.menu.record.url);
	}
});
Ext.reg('trackduck-grid-contexts', TrackDuck.grid.Contexts);
