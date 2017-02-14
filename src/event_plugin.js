const Plugin = {
	install(Vue) {
		const bus = new Vue();
		Vue.prototype.$bus = bus;
		Vue.prototype.$$emit = (name, data = null) => bus.$emit(name, data);
		Vue.prototype.$$on = (name, cb) => bus.$on(name, cb);
		Vue.mixin({
			created() {
				const events = this.$options.events;
				if (!events) return;
				Object.keys(events).forEach((event) => {
					bus.$on(event, events[event].bind(this));
				});
			},
		});
	},
};

export default Plugin;
