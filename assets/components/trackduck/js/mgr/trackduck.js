var TrackDuck = function (config) {
	config = config || {};
	TrackDuck.superclass.constructor.call(this, config);
};

Ext.extend(TrackDuck, Ext.Component, {
	UNKNOWN: 1,
	OK: 2,
	NOT_SUPPORTED: 3,
	NOT_LOGGED: 4,
	NO_PROJECT: 5,
	page: {},
	window: {},
	grid: {},
	panel: {},
	config: {},
	tabs: {},
	forms: {},
	createCORSRequest: function (method, url) {
		var xhr = new XMLHttpRequest();
		if ('withCredentials' in xhr) {
			xhr.open(method, url, true);
		} else {
			xhr = null;
		}
		return xhr;
	},
	getSettings: function (url, callback) {
		url = TrackDuck.config.settingsUrl + '?url=' + encodeURIComponent(url);
		if (!Ext.isFunction(callback)) {
			callback = function () {
			};
		}
		var xhr = TrackDuck.createCORSRequest('GET', url);
		if (xhr === null) {
			callback(TrackDuck.NOT_SUPPORTED, 0, null, null);
			return;
		}
		xhr.onload = function () {
			var status = TrackDuck.UNKNOWN;
			var error = null;
			var data = null;
			var responseStatus = 0;
			var response = {};
			if (xhr.status === 200) {
				try {
					response = JSON.parse(xhr.responseText);
				} catch (e) {
					callback(status, xhr.status, e, data);
					return;
				}
				if (response.status) {
					responseStatus = response.status;
				}
			} else {
				responseStatus = xhr.status;
			}
			switch (responseStatus) {
				case 200:
					status = TrackDuck.OK;
					data = {
						projectId: response.projectId || ''
					};
					break;
				case 403:
					status = TrackDuck.NO_PROJECT;
					break;
				case 401:
					status = TrackDuck.NOT_LOGGED;
					break;
				default:
					error = new Error('TrackDuck API Exception: ' + xhr.responseText);
			}
			callback(status, xhr.status, error, data);
		};
		xhr.onerror = function (e) {
			callback(TrackDuck.UNKNOWN, 0, new Error('Error ' + e.target.status + ' occurred while receiving the document.'), null);
		};
		xhr.withCredentials = true;
		xhr.send();
	}
});
Ext.reg('trackduck', TrackDuck);
TrackDuck = new TrackDuck;
