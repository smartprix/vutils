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
			},
			beforeDestroy: function beforeDestroy() {
				var _this2 = this;

				var events = this.$options.events;
				if (!events) return;
				Object.keys(events).forEach(function (event) {
					bus.$off(event, events[event].bind(_this2));
				});
			}
		});
	}
};

/* eslint-disable guard-for-in */
var Plugin$4 = {
	install: function install(Vue) {
		Vue.mixin({
			created: function created() {
				if (this._watch) {
					for (var key in this._watch) {
						this.$watch(key, this._watch[key], { deep: true });
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

var mixin = {
	data: function data() {
		return {
			filters: {},
			_initialFilters: {},
			_assignFilters: 0,
			defaultSort: { prop: null, order: null },
			loadingSelfData: false
		};
	},
	created: function created() {
		var order = this.filters.order || null;

		// filter order must be ASC or DESC
		// table order must be ascending or descending
		var filterOrder = order;
		var tableOrder = order;
		if (order) {
			if (filterOrder === 'ascending') filterOrder = 'ASC';else if (filterOrder === 'descending') filterOrder = 'DESC';
			if (tableOrder === 'ASC') tableOrder = 'ascending';else if (tableOrder === 'DESC') tableOrder = 'descending';

			this.filters.order = filterOrder;
		}

		this.defaultSort = {
			prop: this.filters.sort || null,
			order: tableOrder
		};

		this._initialFilters = JSON.parse(JSON.stringify(this.filters));
		this.handleRouteChange();
	},


	methods: {
		_changeFiltersIntoRouteQuery: function _changeFiltersIntoRouteQuery() {
			var _this = this;

			var query = {};
			Object.keys(this.filters).forEach(function (key) {
				var filter = _this.filters[key];
				if (!filter) return;
				if (filter === _this._initialFilters[key]) return;
				if (typeof filter === 'string') {
					filter = filter.trim();
					if (!filter || filter === '0') return;
				} else if (Array.isArray(filter)) {
					filter = filter.join(',');
					var existing = (_this._initialFilters[key] || []).join(',');

					if (filter === existing) return;
					if (!filter) filter = 'null';
				}

				query[key] = filter;
			});

			return query;
		},
		getUrlQuery: function getUrlQuery() {
			var _this2 = this;

			if (!this.filters) return {};

			var obj = {};
			Object.keys(this.$route.query).forEach(function (key) {
				var paramValue = _this2.$route.query[key];
				if (!paramValue) return;
				if (!(key in _this2.filters)) return;

				if (paramValue === 'null') paramValue = '';

				if (Array.isArray(_this2.filters[key])) {
					obj[key] = paramValue.split(',');
				} else if (key === 'first' || key === 'after' || key === 'count' || key === 'page' || typeof _this2.filters[key] === 'number') {
					obj[key] = Number(paramValue) || 0;
				} else {
					obj[key] = paramValue;
				}
			});

			return obj;
		},
		handleRouteChange: function handleRouteChange() {
			if (this._assignFilters <= 0) {
				// we don't need to assign filters again
				// if this is called from handleFilterChange
				this.filters = Object.assign({}, this._initialFilters, this.getUrlQuery());
			}

			this._assignFilters = 0;

			if (!this.loadSelfData) {
				console.warn('You are using pagination mixin, ' + 'but you have not defined loadSelfData(filters) method');
				return;
			}

			var filters = void 0;
			if ('page' in this.filters || 'count' in this.filters) {
				var count = this.filters.count || 20;
				var page = Math.max(this.filters.page, 1);
				filters = Object.assign({}, this.filters, {
					first: count,
					after: count * (page - 1)
				});

				delete filters.page;
				delete filters.count;
			} else {
				filters = Object.assign({}, this.filters);
			}

			var stringified = JSON.stringify(filters);

			if (this._actualFilters && stringified === JSON.stringify(this._actualFilters)) {
				// no change in filters, hence return
				return;
			}

			this._actualFilters = JSON.parse(stringified);
			this.reloadSelfData();
		},
		reloadSelfData: function reloadSelfData() {
			var _this3 = this;

			if (!this.loadSelfData || !this._actualFilters) return;

			var result = this.loadSelfData(this._actualFilters);
			// if the result is a promise, set loadingSelfData to true
			if (result && result.then) {
				this.loadingSelfData = true;
				result.then(function () {
					_this3.loadingSelfData = false;
				}).catch(function (e) {
					_this3.loadingSelfData = false;
					console.error('Error While Loading Self Data', e);
				});
			}
		},
		handleSizeChange: function handleSizeChange(val) {
			this.filters.count = val;
			this.handleFilterChange();
		},
		handleCurrentChange: function handleCurrentChange(val) {
			this.filters.page = val;
			this.handleFilterChange();
		},
		handleSortChange: function handleSortChange(_ref) {
			var prop = _ref.prop,
			    order = _ref.order;

			if (order === 'ascending') order = 'ASC';else if (order === 'descending') order = 'DESC';

			this.filters.sort = prop;
			this.filters.order = order;
			this.handleFilterChange();

			return false;
		},
		handleFilterChange: function handleFilterChange() {
			this._assignFilters = Math.max(this._assignFilters, 1) + 1;

			this.$router.push({
				query: this._changeFiltersIntoRouteQuery()
			});
		}
	},

	watch: {
		$route: {
			deep: true,
			handler: function handler() {
				this._assignFilters--;
				this.handleRouteChange();
			}
		}
	}
};

function paginationMixin() {
	return mixin;
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

/* eslint-disable guard-for-in, import/prefer-default-export */
function getDefaultError() {
	return {
		global: {
			message: 'Unknown Error',
			keyword: 'unknown'
		}
	};
}

function handleRes(res, resolve, reject) {
	var data = res.data || {};

	if (!data.errors || !data.errors.length) {
		if (resolve) {
			resolve(data.data);
		} else {
			data.userErrors = getDefaultError();
			data.userErrorMessages = { global: data.userErrors.global.message };
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
		fields = getDefaultError();
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

function convertSingleArgToGql(value) {
	// casuses problems in markdiwn, so disabling for now
	// let matches;
	// const enumRegex = /(?:#|Enum::)([A-Z]+)/;

	if (value === null || value === undefined) return null;
	if (typeof value === 'number') return value;
	if (typeof value !== 'string') return JSON.stringify(value);
	// eslint-disable-next-line
	// if (matches = value.match(enumRegex)) return matches[1];
	return JSON.stringify(value);
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

	var argStr = '';

	if (!obj) {
		argStr = '';
	}
	if (!isPlainObject(obj)) {
		argStr = convertSingleArgToGql(obj);
	} else {
		if (Array.isArray(opts)) {
			opts = { pick: opts };
		}

		if (opts.pick) {
			obj = pick(obj, opts.pick);
		}

		var output = [];
		forEach(obj, function (value, key) {
			output.push(key + ': ' + convertSingleArgToGql(value));
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

export { paginationMixin, remove, update, addOrUpdate, handleGraphqlRequest, toGqlArg, convertGraphql };export default Plugin;
