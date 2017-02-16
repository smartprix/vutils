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

var Plugin$4 = {
	install: function install(Vue) {
		Vue.mixin({
			beforeCreate: function beforeCreate() {
				var options = this.$options;
				if (options.vModel && !options.props.value) {
					options.props.value = {
						type: null,
						default: undefined
					};
				}
			},
			data: function data() {
				var _this = this;

				var data = {};
				var options = this.$options;
				var props = this.$options.props || {};

				options.watch = options.watch || {};
				var watch = options.watch;

				// vModel
				var vModel = options.vModel;
				if (vModel) {
					var dataName = vModel === true ? 'currentValue' : vModel;
					data[dataName] = this.value;

					var previous1 = watch.value;
					watch.value = function (val, oldVal) {
						this[dataName] = val;
						if (previous1) previous1(val, oldVal);
					};

					var previous2 = watch[dataName];
					watch[dataName] = function (val, oldVal) {
						this.$emit('input', val);
						this.$emit('change', val);
						if (previous2) previous2(val, oldVal);
					};
				}

				// propModify

				var _loop = function _loop(prop) {
					if (!props[prop].modify) return 'continue';

					var dataName = props[prop].modify;
					if (dataName === true) {
						dataName = 'i' + prop.charAt(0).toUpperCase() + prop.slice(1);
					}

					data[dataName] = JSON.parse(JSON.stringify(_this[prop]));

					var previous3 = watch[prop];
					watch[prop] = function (val, oldVal) {
						this[dataName] = JSON.parse(JSON.stringify(this[prop]));
						if (previous3) previous3(val, oldVal);
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

				return data;
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
