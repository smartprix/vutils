const mixin = {
	data() {
		return {
			filters: {},
			defaultSort: {prop: null, order: null},
			loadingSelfData: false,
		};
	},

	created() {
		// defined underscored data here because otherwise we can't access them
		// https://vuejs.org/v2/api/#data
		this._initialFilters = {};
		this._assignFilters = 0;

		const order = this.filters.order || null;

		// filter order must be ASC or DESC
		// table order must be ascending or descending
		let filterOrder = order;
		let tableOrder = order;
		if (order) {
			if (filterOrder === 'ascending') filterOrder = 'ASC';
			else if (filterOrder === 'descending') filterOrder = 'DESC';
			if (tableOrder === 'ASC') tableOrder = 'ascending';
			else if (tableOrder === 'DESC') tableOrder = 'descending';

			this.filters.order = filterOrder;
		}

		this.defaultSort = {
			prop: this.filters.sort || null,
			order: tableOrder,
		};

		this._initialFilters = JSON.parse(JSON.stringify(this.filters));
		this.handleRouteChange();
	},

	methods: {
		_changeFiltersIntoRouteQuery() {
			const query = {};
			Object.keys(this.filters).forEach((key) => {
				let filter = this.filters[key];
				if (!filter) return;
				if (filter === this._initialFilters[key]) return;
				if (typeof filter === 'string') {
					filter = filter.trim();
					if (!filter || filter === '0') return;
				}
				else if (Array.isArray(filter)) {
					filter = filter.join(',');
					const existing = (this._initialFilters[key] || []).join(',');

					if (filter === existing) return;
					if (!filter) filter = 'null';
				}

				query[key] = filter;
			});

			return query;
		},

		getUrlQuery() {
			if (!this.filters) return {};

			const obj = {};
			Object.keys(this.$route.query).forEach((key) => {
				let paramValue = this.$route.query[key];
				if (!paramValue) return;
				if (!(key in this.filters)) return;

				if (paramValue === 'null') paramValue = '';

				if (Array.isArray(this.filters[key])) {
					obj[key] = paramValue.split(',');
				}
				else if (
					key === 'first' ||
					key === 'after' ||
					key === 'count' ||
					key === 'page' ||
					(typeof this.filters[key] === 'number')
				) {
					obj[key] = Number(paramValue) || 0;
				}
				else {
					obj[key] = paramValue;
				}
			});

			return obj;
		},

		handleRouteChange() {
			if (this._assignFilters <= 0) {
				// we don't need to assign filters again
				// if this is called from handleFilterChange
				this.filters = Object.assign(
					{},
					this._initialFilters,
					this.getUrlQuery(),
				);
			}

			this._assignFilters = 0;

			if (!this.loadSelfData) {
				console.warn('You are using pagination mixin, ' +
				'but you have not defined loadSelfData(filters) method');
				return;
			}

			let filters;
			if (('page' in this.filters) || ('count' in this.filters)) {
				const count = this.filters.count || 20;
				const page = Math.max(this.filters.page, 1);
				filters = Object.assign({}, this.filters, {
					first: count,
					after: count * (page - 1),
				});

				delete filters.page;
				delete filters.count;
			}
			else {
				filters = Object.assign({}, this.filters);
			}

			const stringified = JSON.stringify(filters);

			if (
				this._actualFilters &&
				stringified === JSON.stringify(this._actualFilters)
			) {
				// no change in filters, hence return
				return;
			}

			this._actualFilters = JSON.parse(stringified);
			this.reloadSelfData();
		},

		reloadSelfData() {
			if (!this.loadSelfData || !this._actualFilters) return;

			const result = this.loadSelfData(this._actualFilters);
			// if the result is a promise, set loadingSelfData to true
			if (result && result.then) {
				this.loadingSelfData = true;
				result.then(() => {
					this.loadingSelfData = false;
				}).catch((e) => {
					this.loadingSelfData = false;
					console.error('Error While Loading Self Data', e);
				});
			}
		},

		// To add general parameters in query which should be present in the route and not removed by pagination mixin
		getGeneralParameters() {
			const params = {};
			const generalParams = [
				'modals',
				'modalIds',
			];

			generalParams.forEach((param) => {
				if (param in this.$route.query) params[param] = this.$route.query[param];
			});

			return params;
		},

		handleSizeChange(val) {
			this.filters.count = val;
			this.handleFilterChange();
		},

		handleCurrentChange(val) {
			this.filters.page = val;
			this.handleFilterChange();
		},

		handleSortChange({prop, order}) {
			if (order === 'ascending') order = 'ASC';
			else if (order === 'descending') order = 'DESC';

			this.filters.sort = prop;
			this.filters.order = order;
			this.handleFilterChange();

			return false;
		},

		handleFilterChange() {
			this._assignFilters = Math.max(this._assignFilters, 1) + 1;

			this.$router.push({
				query: Object.assign(
					{},
					this._changeFiltersIntoRouteQuery(),
					this.getGeneralParameters(),
				)
			});
		},
	},

	watch: {
		$route: {
			deep: true,
			handler() {
				this._assignFilters--;
				this.handleRouteChange();
			},
		},
	},
};

function paginationMixin() {
	return mixin;
}

export default paginationMixin;
