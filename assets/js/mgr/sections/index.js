Ext.onReady(function () {
	MODx.load({
		xtype: 'trackduck-page-home'
	});
});

TrackDuck.page.Home = function (config) {
	config = config || {};
	Ext.applyIf(config, {
		components: [{
			xtype: 'trackduck-panel-home',
			renderTo: 'trackduck-panel-home-div'
		}]
	});
	TrackDuck.page.Home.superclass.constructor.call(this, config);
};
Ext.extend(TrackDuck.page.Home, MODx.Component);
Ext.reg('trackduck-page-home', TrackDuck.page.Home);
