const Plugin = {
	install(Vue) {
		const bus = new Vue();
		Vue.bus = bus;
		Vue.prototype.$bus = bus;
		Vue.mixin({
			created() {
				const events = this.$options.events;
				if (!events) return;
				Object.keys(events).forEach((event) => {
					bus.$on(event, events[event].bind(this));
				});
			},
			beforeDestroy() {
				const events = this.$options.events;
				if (!events) return;
				Object.keys(events).forEach((event) => {
					bus.$off(event, events[event].bind(this));
				});
			},
		});
	},
};

export default Plugin;
