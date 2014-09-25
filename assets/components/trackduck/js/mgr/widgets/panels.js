TrackDuck.panel.Home = function (config) {
	config = config || {};
	var supported = TrackDuck.createCORSRequest() !== null;
	Ext.apply(config, {
		border: false,
		cls: 'container',
		bodyStyle: '',
		items: [{
			html: '<h2>' + _('trackduck.title') + '</h2>',
			border: false,
			cls: 'modx-page-header'
		}, {
			layout: MODx.modx23 ? 'form' : 'anchor',
			border: true,
			items: [{
				html: '<p>' + _('trackduck.intro') + '</p>',
				border: false,
				bodyCssClass: 'panel-desc'
			}, {
				hidden: supported,
				html: '<p>' + _('trackduck.browser.not_supported') + '</p>',
				border: false,
				bodyCssClass: 'panel-desc'
			}, {
				border: false,
				items: [{
					html: '<p>' + _('trackduck.extension.intro') + '</p>',
					border: false,
					bodyCssClass: 'panel-desc'
				}, {
					layout: 'hbox',
					height: MODx.modx23 ? 45 : 40,
					minHeight: MODx.modx23 ? 45 : 40,
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
						disabled: Ext.isChrome,
						flex: 1
					}, {
						xtype: 'button',
						text: _('trackduck.extension.chrome'),
						handler: this.showExtensionPage.createDelegate(this, ['chrome']),
						disabled: Ext.isGecko || Ext.isGecko2 || Ext.isGecko3,
						flex: 1,
						margins: 0
					}]
				}]
			}, {
				border: false,
				hidden: !supported,
				bodyStyle: 'padding: 5px' + (MODx.modx23 ? ' 0 0 0' : ''),
				items: supported ? [{
					xtype: 'trackduck-grid-contexts',
					cls: MODx.modx23 ? 'main-wrapper' : ''
				}] : []
			}]
		}]
	});
	TrackDuck.panel.Home.superclass.constructor.call(this, config);
};
Ext.extend(TrackDuck.panel.Home, MODx.FormPanel, {
	showExtensionPage: function (type) {
		var urls = TrackDuck.config.extensionUrls || {};
		if (urls.hasOwnProperty(type)) {
			window.open(urls[type], '_blank');
		}
	}
});
Ext.reg('trackduck-panel-home', TrackDuck.panel.Home);
