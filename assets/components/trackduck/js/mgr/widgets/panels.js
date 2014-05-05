TrackDuck.panel.Home = function (config) {
	config = config || {};
	Ext.apply(config, {
		baseCls: 'modx-formpanel',
		cls: 'container form-with-labels',
		bodyStyle: '',
		items: [{
			html: '<h2>' + _('trackduck.title') + '</h2>',
			border: false,
			cls: 'modx-page-header'
		}, {
			layout: 'form',
			items: [{
				html: '<p>' + _('trackduck.intro') + '</p>',
				border: false,
				bodyCssClass: 'panel-desc'
			}, {
				id: 'trackduck-browser-message-panel',
				hidden: true,
				html: '<p>' + _('trackduck.browser.not_supported') + '</p>',
				border: false,
				bodyCssClass: 'panel-desc'
			}, {
				id: 'trackduck-extensions-panel',
				hidden: true,
				border: false,
				items: [{
					html: '<p>' + _('trackduck.extension.intro') + '</p>',
					border: false,
					bodyCssClass: 'panel-desc'
				}, {
					layout: 'hbox',
					height: 40,
					minHeight: 40,
					layoutConfig: {
						padding: 5,
						pack: 'start',
						align: 'middle'
					},
					border: false,
					defaults: {
						style: {
							position: 'absolute'
						},
						margins: '0 5 0 0'
					},
					items: [{
						xtype: 'button',
						text: _('trackduck.extension.firefox'),
						handler: this.showExtensionPage.createDelegate(this, ['firefox']),
						browser: 'firefox',
						flex: 1
					}, {
						xtype: 'button',
						text: _('trackduck.extension.chrome'),
						handler: this.showExtensionPage.createDelegate(this, ['chrome']),
						browser: 'chrome',
						flex: 1,
						margins: 0
					}]
				}]
			}, {
				id: 'trackduck-login-panel',
				hidden: true,
				layout: 'hbox',
				height: 40,
				minHeight: 40,
				layoutConfig: {
					padding: 5,
					pack: 'start',
					align: 'middle'
				},
				border: false,
				defaults: {
					style: {
						position: 'absolute'
					},
					margins: '0 5 0 0'
				},
				items: [{
					xtype: 'button',
					text: _('trackduck.signup.google'),
					handler: this.showLoginPage.createDelegate(this, ['google']),
					flex: 1
				}, {
					xtype: 'button',
					text: _('trackduck.signup.facebook'),
					handler: this.showLoginPage.createDelegate(this, ['facebook']),
					flex: 1
				}, {
					xtype: 'button',
					text: _('trackduck.signup.email'),
					handler: this.showLoginPage.createDelegate(this, ['email']),
					flex: 1,
					margins: 0
				}]
			}, {
				id: 'trackduck-contexts-panel',
				hidden: true,
				border: false,
				bodyStyle: 'padding: 5px',
				items: []
			}]
		}],
		listeners: {
			afterrender: {
				fn: this.checkLoginStatus,
				scope: this
			}
		}
	});
	TrackDuck.panel.Home.superclass.constructor.call(this, config);
};
Ext.extend(TrackDuck.panel.Home, MODx.Panel, {
	checkLoginStatus: function () {
		var contexts = TrackDuck.config.contexts || {};
		if (contexts.length) {
			TrackDuck.getSettings(contexts[0].url, this.handleLoginStatus.createDelegate(this, [
				Ext.MessageBox.wait(_('trackduck.signup.checking_status'), _('please_wait'))
			], true));
		}
	},
	handleLoginStatus: function (status, responseCode, error, data, message) {
		if (error) {
			message && message.hide();
			MODx.msg.alert(_('error'), _('trackduck.signup.error'));
		} else {
			var panel;
			var show = true;
			var supported = true;
			switch (status) {
				case TrackDuck.NOT_SUPPORTED:
					panel = Ext.getCmp('trackduck-browser-message-panel');
					panel && panel.setVisible(true);
					supported = false;
					break;
				case TrackDuck.NOT_LOGGED:
					panel = Ext.getCmp('trackduck-login-panel');
					panel && panel.setVisible(true);
					show = false;
					break;
			}
			if (show) {
				this.showExtensionsPanel();
				this.showGrid(supported);
			}
			message && message.hide();
		}
	},
	showLoginPage: function (type) {
		var urls = TrackDuck.config.loginUrls || {};
		if (urls.hasOwnProperty(type)) {
			window.location.href = urls[type] + '?redirect=' + encodeURIComponent(TrackDuck.config.returnUrl || window.location.href);
		}
	},
	showExtensionPage: function (type) {
		var urls = TrackDuck.config.extensionUrls || {};
		if (urls.hasOwnProperty(type)) {
			window.open(urls[type], '_blank');
		}
	},
	showExtensionsPanel: function () {
		var panel = Ext.getCmp('trackduck-extensions-panel');
		if (panel) {
			var buttons;
			if (Ext.isGecko || Ext.isGecko2 || Ext.isGecko3) {
				buttons = panel.find('browser', 'chrome');
			} else {
				if (Ext.isChrome) {
					buttons = panel.find('browser', 'firefox');
				}
			}
			if (buttons) {
				Ext.each(buttons, function (button) {
					button.setDisabled(true);
				});
			}
			panel.setVisible(true);
		}
	},
	showGrid: function (corsSupported) {
		var panel = Ext.getCmp('trackduck-contexts-panel');
		if (panel) {
			var grid = panel.add({
				xtype: 'trackduck-grid-contexts',
				corsSupported: corsSupported
			});
			panel.setVisible(true);
		}
	}
});
Ext.reg('trackduck-panel-home', TrackDuck.panel.Home);
