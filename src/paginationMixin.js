const mixin = {
	data() {
		return {
			filters: {},
			_initialFilters: {},
			defaultSort: {prop: null, order: null},
			loadingSelfData: false,
		};
	},

	created() {
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
					if (!filter.length) return;
					filter = filter.join(',');
				}

				query[key] = filter;
			});

			return query;
		},

		getUrlQuery() {
			if (!this.filters) return {};

			const obj = {};
			Object.keys(this.$route.query).forEach((key) => {
				const paramValue = this.$route.query[key];
				if (!paramValue) return;

				if (Array.isArray(this.filters[key])) {
					obj[key] = paramValue.split(',');
				}
				else if (
					key === 'first' ||
					key === 'after' ||
					key === 'count' ||
					key === 'page'
				) {
					obj[key] = parseInt(paramValue, 10);
				}
				else {
					obj[key] = paramValue;
				}
			});

			return obj;
		},

		handleRouteChange() {
			const initialFiltersClone =
				JSON.parse(JSON.stringify(this._initialFilters));

			this.filters = Object.assign(
				initialFiltersClone,
				this.getUrlQuery(),
			);

			if (this.loadSelfData) {
				const count = this.filters.count || 20;
				const page = Math.max(this.filters.page, 1);
				const filters = Object.assign({}, this.filters, {
					first: count,
					after: count * (page - 1),
				});

				delete filters.page;
				delete filters.count;

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
			}
			else {
				console.warn('You are using pagination mixin, ' +
				'but you have not defined loadSelfData(filters) method');
			}
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

		changePage() {
			this.filters.first = this.itemsPerPage;
			this.filters.after = (this.itemsPerPage * (this.page - 1));
			this.$router.push({
				query: this._changeFiltersIntoRouteQuery(),
			});
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
			this.$router.push({
				query: this._changeFiltersIntoRouteQuery(),
			});
		},
	},

	watch: {
		$route: {
			deep: true,
			handler() {
				this.handleRouteChange();
			},
		},
	},
};

function paginationMixin() {
	return mixin;
}

export default paginationMixin;
