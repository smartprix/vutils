function round(number) {
	var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	if (!precision) return Math.round(number);
	var factor = Math.pow(10, precision);
	var tempNumber = number * factor;
	var roundedTempNumber = Math.round(tempNumber);
	return roundedTempNumber / factor;
}

var Plugin$2 = {
	install: function install(Vue) {
		Vue.filter('round', function (value) {
			var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
			return round(value, precision);
		});
		Vue.filter('formatNumber', function (value) {
			var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
			return value.toLocaleString(value, { minimumFractionDigits: precision });
		});
	}
};

var Plugin$3 = {
	install: function install(Vue) {
		var bus = new Vue();
		Vue.prototype.$bus = bus;
		Vue.prototype.$$emit = function (name) {
			var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
			return bus.$emit(name, data);
		};
		Vue.prototype.$$on = function (name, cb) {
			return bus.$on(name, cb);
		};
		Vue.mixin({
			created: function created() {
				var _this = this;

				var events = this.$options.events;
				if (!events) return;
				Object.keys(events).forEach(function (event) {
					bus.$on(event, events[event].bind(_this));
				});
			}
		});
	}
};

function vModelMixin(prop) {
	var _watch;

	var propName = 'currentValue';
	var propType = null;
	var defaultValue = void 0;

	if (typeof prop === 'string') {
		propName = prop;
	} else if (prop) {
		if (prop.name) propName = prop.name;
		if (prop.type) propType = prop.type;
		if (prop.default) defaultValue = prop.default;
	}

	return {
		props: {
			value: {
				type: propType,
				default: defaultValue
			}
		},

		data: function data() {
			var _ref;

			return _ref = {}, _ref[propName] = this.value, _ref;
		},


		watch: (_watch = {
			value: function value(val) {
				this[propName] = val;
			}
		}, _watch[propName] = function (val) {
			this.$emit('input', val);
			this.$emit('change', val);
		}, _watch)
	};
}

function reEventMixin(events) {
	return {
		created: function created() {
			var _this = this;

			Object.keys(events).forEach(function (event) {
				_this.$on(event, function (data) {
					return _this.$emit(events[event], data);
				});
			});
		}
	};
}

function singlePropModify(prop, iProp, obj) {
	var propName = 'i' + prop.charAt(0).toUpperCase() + prop.slice(1);
	obj.props[prop] = {};

	if (typeof iProp === 'string') {
		propName = iProp;
	} else if (iProp) {
		if (iProp.name) {
			propName = iProp.name;
		}
		if (iProp.type) {
			obj.props[prop].type = iProp.type;
		}
		if (iProp.default) {
			obj.props[prop].default = iProp.default;
		}
	}

	obj._data[propName] = prop;
	obj.watch[prop] = function () {
		this[propName] = JSON.parse(JSON.stringify(this[prop]));
	};
}

function propModifyMixin(props) {
	if (!props) return {};
	var obj = {
		props: {},
		_data: {},
		watch: {}
	};

	if (typeof props === 'string') {
		singlePropModify(props, null, obj);
	} else if (Array.isArray(props)) {
		for (var _iterator = props, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
			var _ref2;

			if (_isArray) {
				if (_i >= _iterator.length) break;
				_ref2 = _iterator[_i++];
			} else {
				_i = _iterator.next();
				if (_i.done) break;
				_ref2 = _i.value;
			}

			var prop = _ref2;

			singlePropModify(prop, null, obj);
		}
	} else {
		Object.keys(props).forEach(function (prop) {
			singlePropModify(prop, props[prop], obj);
		});
	}

	obj.data = function () {
		var _this2 = this;

		var data = {};
		Object.keys(obj._data).forEach(function (propName) {
			data[propName] = JSON.parse(JSON.stringify(_this2[obj._data[propName]]));
		});
		return data;
	};

	return obj;
}

/**
 * Remove an element from an array (vue compatible)
 * This is reactive, means it notifies vue of changes in the array
 * @param  {Array} arr  The array to remove elements from
 * @param  {Number|Function} func index of the element or a function
 * which returns true for the elements to be removed
 */
function remove(arr, func) {
	if (typeof func === 'number') {
		arr.splice(func, 1);
		return;
	}

	for (var i = 0; i < arr.length; i++) {
		if (func(arr[i])) {
			arr.splice(i, 1);
		}
	}
}

/**
 * Replace an element in an array (vue compatible)
 * This is reactive, means it notifies vue of changes in the array
 * @param {Array} arr  The array in which the element is to replace
 * @param {Number} index The position of the element which is to be replaced
 * @param {Object} value The value which replaces the current value
 */
function update(arr, index, value) {
	if (typeof index === 'number') {
		arr.splice(index, 1, value);
		return;
	}

	for (var i = 0; i < arr.length; i++) {
		if (index(arr[i])) {
			arr.splice(i, 1, value);
			return;
		}
	}
}

/**
 * Replace an element in an array (vue compatible) or adds it if it doesn't exist
 * This is reactive, means it notifies vue of changes in the array
 * @param {Array} arr  The array in which the element is to replace
 * @param {Object} value The value which replaces the current value
 * @param {Number} func function which returns true for the elements to be replaced, or
 * it can be a property name by which search will be performed. By default it is `id`
 */
function addOrUpdate(arr, value) {
	var func = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'id';

	if (typeof func === 'string') {
		var key = func;
		func = function func(item) {
			return item[key] === value[key];
		};
	}

	for (var i = 0; i < arr.length; i++) {
		if (func(arr[i])) {
			arr.splice(i, 1, value);
			return;
		}
	}

	arr.push(value);
}

var Plugin = {
	install: function install(Vue) {
		Vue.use(Plugin$3);
		Vue.use(Plugin$2);
	}
};

export { vModelMixin, reEventMixin, propModifyMixin, remove, update, addOrUpdate };export default Plugin;
