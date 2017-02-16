const Plugin = {
	install(Vue) {
		Vue.mixin({
			beforeCreate() {
				const options = this.$options;
				if (options.vModel && !options.props.value) {
					options.props.value = {
						type: null,
						default: undefined,
					};
				}
			},

			data() {
				const data = {};
				const self = this;
				const options = this.$options;
				const props = this.$options.props || {};

				options.watch = options.watch || {};
				const watch = options.watch;

				// vModel
				const vModel = options.vModel;
				if (vModel) {
					const dataName = vModel === true ? 'currentValue' : vModel;
					data[dataName] = this.value;

					const previous1 = watch.value;
					watch.value = function (val, oldVal) {
						self[dataName] = val;
						if (previous1) previous1(val, oldVal);
					};

					const previous2 = watch[dataName];
					watch[dataName] = function (val, oldVal) {
						self.$emit('input', val);
						self.$emit('change', val);
						if (previous2) previous2(val, oldVal);
					};
				}

				// propModify
				for (const prop in props) {
					if (!props[prop].modify) continue;

					let dataName = props[prop].modify;
					if (dataName === true) {
						dataName = 'i' + prop.charAt(0).toUpperCase() + prop.slice(1);
					}

					data[dataName] =
						this[prop] === undefined ?
							undefined :
							JSON.parse(JSON.stringify(this[prop]));

					const previous3 = watch[prop];
					watch[prop] = function (val, oldVal) {
						self[dataName] =
							self[prop] === undefined ?
								undefined :
								JSON.parse(JSON.stringify(self[prop]));

						if (previous3) previous3(val, oldVal);
					};
				}

				// reEvents
				const reEvents = options.reEvents;
				if (reEvents) {
					Object.keys(reEvents).forEach((event) => {
						this.$on(event, e => this.$emit(reEvents[event], e));
					});
				}

				return data;
			},
		});
	},
};

export default Plugin;
