'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mixins = require('./mixins');

Object.keys(_mixins).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function () {
			return _mixins[key];
		}
	});
});

var _helpers = require('./helpers');

Object.keys(_helpers).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function () {
			return _helpers[key];
		}
	});
});

var _filters = require('./filters');

var _filters2 = _interopRequireDefault(_filters);

var _event_plugin = require('./event_plugin');

var _event_plugin2 = _interopRequireDefault(_event_plugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Plugin = {
	install(Vue) {
		Vue.use(_event_plugin2.default);
		Vue.use(_filters2.default);
	}
};

exports.default = Plugin;