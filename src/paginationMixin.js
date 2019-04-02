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

	// TODO: imcomplete
	// we need to all the filters from url on destroy
	// destroyed() {
	// 	// remove all the filters from url on destroy
	// 	const params = {};
	// 	const hasFilters = false;
	// 	Object.keys(this.$route.query).forEach((key) => {
	// 		if (!(key in this.filters)) {
	// 			params[key] = this.$route.query[key];
	// 		}
	// 		else {
	// 			hasFilters = true;
	// 		}
	// 	});

	// 	if (hasFilters) {
	// 		this.$router.push({query: params});
	// 	}
	// },

	methods: {
		_changeFiltersIntoRouteQuery(resetPage) {
			if (resetPage && this.filters.page) this.filters.page = 1;
			const query = {};
			Object.keys(this.filters).forEach((key) => {
				let filter = this.filters[key];
				if (filter === undefined || filter === null) return;
				if (filter === this._initialFilters[key]) return;
				if (typeof filter === 'string') {
					filter = filter.trim();
					if (!filter) return;
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
					obj[key] = paramValue ? paramValue.split(',') : [];
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
			this._filters = JSON.stringify(this.filters);

			this.reloadSelfData();
		},

		reloadSelfData() {
			if (!this.loadSelfData || !this._actualFilters) return;

			const ctx = {
				notifyError: true,
			};

			try {
				const filters = JSON.parse(JSON.stringify(this._actualFilters));
				const result = this.loadSelfData(filters, ctx);
				// if the result is a promise, set loadingSelfData to true
				if (result && result.then) {
					this.loadingSelfData = true;
					result.then(() => {
						this.loadingSelfData = false;
					}).catch((e) => {
						this.loadingSelfData = false;
						console.error('Error While Loading Self Data', e);

						let errorMessage = '';
						const joinStr = '<br>─────────<br>';
						if (!errorMessage && e.userErrorMessages) {
							const messages = Object.values(e.userErrorMessages).filter(Boolean);
							errorMessage = messages.length && messages.join(joinStr);
						}
						if (!errorMessage && e.userErrors) {
							const messages = Object.values(e.userErrors).map(err => err.message).filter(Boolean);
							errorMessage = messages.length && messages.join(joinStr);
						}
						if (!errorMessage && e.errors) {
							const messages = Object.values(e.errors).map(err => err.message).filter(Boolean);
							errorMessage = messages.length && messages.join(joinStr);
						}
						if (!errorMessage) {
							errorMessage = e.message || String(e);
						}

						if (ctx.notifyError && this.$notify) {
							this.$notify({
								title: 'Error',
								message: this.$createElement('div', {domProps: {innerHTML: errorMessage}}, ''),
								type: 'error',
								duration: 8000,
							});
						}
					});
				}
			}
			catch (e) {
				this.loadingSelfData = false;
				console.error('Error While Loading Self Data', e);

				if (ctx.notifyError && this.$notify) {
					this.$notify({
						title: 'Error',
						message: e.message || String(e),
						type: 'error',
						duration: 8000,
					});
				}
			}
		},

		// To add general parameters in query which should be present in the route
		// and not removed by pagination mixin
		getGeneralParameters() {
			const params = {};
			Object.keys(this.$route.query).forEach((key) => {
				if (!(key in this.filters)) {
					params[key] = this.$route.query[key];
				}
			});

			return params;
		},

		handleSizeChange(val) {
			this.filters.count = val;
			this.handleFilterChange();
		},

		handleCurrentChange(val) {
			this.filters.page = val;
			this.handleFilterChange(false); // when current page is changed resetPage must be false
		},

		handleSortChange({prop, order}) {
			if (order === 'ascending') order = 'ASC';
			else if (order === 'descending') order = 'DESC';

			this.filters.sort = prop;
			this.filters.order = order;
			this.handleFilterChange();

			return false;
		},

		handleFilterChange(resetPage = true) {
			if (this._filters && JSON.stringify(this.filters) === this._filters) {
				// nothing changed in filters actually, so we don't need to do anything
				return;
			}

			this._assignFilters = Math.max(this._assignFilters, 1) + 1;

			this.$router.push({
				query: Object.assign(
					{},
					this._changeFiltersIntoRouteQuery(resetPage),
					this.getGeneralParameters(),
				),
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
