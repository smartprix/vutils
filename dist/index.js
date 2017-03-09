import pick from 'lodash/pick';
import isPlainObject from 'lodash/isPlainObject';
import forEach from 'lodash/forEach';

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

/* eslint-disable guard-for-in */
var Plugin$4 = {
	install: function install(Vue) {
		Vue.mixin({
			beforeCreate: function beforeCreate() {
				var options = this.$options;

				// vModel
				if (options.vModel) {
					// options.props = options.props || {};
					// options.propsData = options.propsData || {};

					if (!options.props.value) {
						options.props.value = {};
					}

					if (!options.propsData.value) {
						var domProps = options._parentVnode.data.domProps;
						options.propsData.value = domProps && domProps.value;
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

					_watch.value = function (val) {
						this[dataName] = val;
					};

					_watch[dataName] = function (val) {
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

					_watch[prop] = function () {
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

/* eslint-disable guard-for-in, import/prefer-default-export */
var defaultError = {
	global: {
		message: 'Unknown Error',
		keyword: 'unknown'
	}
};

function handleRes(res, resolve, reject) {
	var data = res.data || {};

	if (!data.errors || !data.errors.length) {
		if (resolve) {
			resolve(data.data);
		} else {
			data.userErrors = defaultError;
			data.userErrorMessages = { global: defaultError.global.message };
			reject(data);
		}

		return;
	}

	var fields = {};
	data.errors.forEach(function (error) {
		if (error.fields) {
			for (var key in error.fields) {
				fields[key] = error.fields[key];
			}
		}
	});

	// no user errors sent by server
	if (!Object.keys(fields).length) {
		fields = defaultError;
	}

	data.userErrors = fields;
	data.userErrorMessages = {};
	for (var key in fields) {
		data.userErrorMessages[key] = fields[key] && fields[key].message || 'Error';
	}

	reject(data);
}

/*
 * convert graphql request into a valid one by removing
 * unnecessary things
 */
function convertGraphql(graphql) {
	var emptyBracketRegex = /\(\s*# no args <>\n\s*\)/g;
	return graphql.replace(emptyBracketRegex, ' ');
}

function handleGraphqlRequest(graphqlRequest) {
	return new Promise(function (resolve, reject) {
		graphqlRequest.then(function (res) {
			handleRes(res, resolve, reject);
		}).catch(function (res) {
			handleRes(res, null, reject);
		});
	});
}

/**
 * convert an object to graphQL argument string
 * {a: "this", b: 2, c: "that"} => a: "this", b: 2, c: "that"
 * @param {Object} opts {pick: null, braces: false}
 * pick is an array of fields to pick from the object, other fields will be ignored
 * braces denotes whether to wrap all the fields in () or not (default: false)
 * @param  {Object} obj
 * @return {String} graphQL argument string
 */
function toGqlArg(obj) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var enumRegex = /(?:#|Enum::)([A-Z]+)/;
	var matches = void 0;
	var argStr = '';

	if (!obj) {
		argStr = '';
	}
	if (!isPlainObject(obj)) {
		// eslint-disable-next-line
		if (matches = obj.match(enumRegex)) argStr = matches[1];else argStr = JSON.stringify(obj);
	} else {
		if (opts.pick) {
			obj = pick(obj, opts.pick);
		}

		var output = [];
		forEach(obj, function (value, key) {
			// eslint-disable-next-line
			if (matches = value.match(enumRegex)) value = matches[1];else value = JSON.stringify(value);

			output.push(key + ': ' + value);
		});

		argStr = output.join(', ');
	}

	if (opts.braces) {
		return argStr ? '(' + argStr + ')' : ' ';
	}

	return argStr || '# no args <>\n';
}

var Plugin = {
	install: function install(Vue) {
		Vue.use(Plugin$3);
		Vue.use(Plugin$2);
		Vue.use(Plugin$4);
	}
};

export { remove, update, addOrUpdate, handleGraphqlRequest, toGqlArg, convertGraphql };export default Plugin;
