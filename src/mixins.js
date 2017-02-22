const Plugin = {
	install(Vue) {
		Vue.mixin({
			beforeCreate() {
				const options = this.$options;

				// vModel
				if (options.vModel) {
					if (!options.props.value) {
						options.props.value = {};
					}

					if (!options.propsData.value) {
						options.propsData.value = options._parentVnode.data.domProps.value;
					}
				}
			},

			created() {
				if (this._watch) {
					for (const key in this._watch) {
						this.$watch(key, this._watch[key]);
					}
				}
			},

			data() {
				const _data = {};
				const _watch = this._watch = {};
				const options = this.$options;
				const props = options.props || {};

				// vModel
				const vModel = options.vModel;
				if (vModel) {
					const dataName = vModel === true ? 'currentValue' : vModel;
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
				for (const prop in props) {
					if (!props[prop].modify) continue;

					let dataName = props[prop].modify;
					if (dataName === true) {
						dataName = 'i' + prop.charAt(0).toUpperCase() + prop.slice(1);
					}

					_data[dataName] =
						this[prop] === undefined ?
							undefined :
							JSON.parse(JSON.stringify(this[prop]));

					_watch[prop] = function (val, oldVal) {
						this[dataName] =
							this[prop] === undefined ?
								undefined :
								JSON.parse(JSON.stringify(this[prop]));
					};
				}

				// reEvents
				const reEvents = options.reEvents;
				if (reEvents) {
					Object.keys(reEvents).forEach((event) => {
						this.$on(event, e => this.$emit(reEvents[event], e));
					});
				}

				return _data;
			},
		});
	},
};

export default Plugin;
