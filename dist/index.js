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
		Vue.bus = bus;
		Vue.prototype.$bus = bus;
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

var Plugin$4 = {
	install: function install(Vue) {
		Vue.mixin({
			beforeCreate: function beforeCreate() {
				var options = this.$options;

				// vModel
				if (options.vModel) {
					options.props = options.props || {};
					options.propsData = options.propsData || {};

					if (!options.props.value) {
						options.props.value = {};
					}

					if (!options.propsData.value) {
						options.propsData.value = options._parentVnode.data.domProps.value;
					}
				}
			},
			created: function created() {
				if (this._watch) {
					for (var key in this._watch) {
						this.$watch(key, this._watch[key]);
					}
				}
			},
			data: function data() {
				var _this = this;

				var _data = {};
				var _watch = this._watch = {};
				var options = this.$options;
				var props = options.props || {};

				// vModel
				var vModel = options.vModel;
				if (vModel) {
					var dataName = vModel === true ? 'currentValue' : vModel;
					_data[dataName] = this.value;

					_watch['value'] = function (val, oldVal) {
						this[dataName] = val;
					};

					_watch[dataName] = function (val, oldVal) {
						this.$emit('input', val);
						this.$emit('change', val);
					};
				}

				// propModify

				var _loop = function _loop(prop) {
					if (!props[prop].modify) return 'continue';

					var dataName = props[prop].modify;
					if (dataName === true) {
						dataName = 'i' + prop.charAt(0).toUpperCase() + prop.slice(1);
					}

					_data[dataName] = _this[prop] === undefined ? undefined : JSON.parse(JSON.stringify(_this[prop]));

					_watch[prop] = function (val, oldVal) {
						this[dataName] = this[prop] === undefined ? undefined : JSON.parse(JSON.stringify(this[prop]));
					};
				};

				for (var prop in props) {
					var _ret = _loop(prop);

					if (_ret === 'continue') continue;
				}

				// reEvents
				var reEvents = options.reEvents;
				if (reEvents) {
					Object.keys(reEvents).forEach(function (event) {
						_this.$on(event, function (e) {
							return _this.$emit(reEvents[event], e);
						});
					});
				}

				return _data;
			}
		});
	}
};

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
		Vue.use(Plugin$4);
	}
};

export { remove, update, addOrUpdate };export default Plugin;
