const Plugin = {
	install(Vue) {
		const bus = new Vue();
		Vue.bus = bus;
		Vue.prototype.$bus = bus;
		Vue.mixin({
			created() {
				const events = this.$options.events;
				if (!events) return;

				this.$options.boundEvents = {};
				for (const event of Object.keys(events)) {
					this.$options.boundEvents[event] = events[event].bind(this);
				}

				Object.keys(events).forEach((event) => {
					bus.$on(event, this.$options.boundEvents[event]);
				});
			},
			beforeDestroy() {
				const events = this.$options.events;
				if (!events) return;
				Object.keys(events).forEach((event) => {
					bus.$off(event, this.$options.boundEvents[event]);
				});
			},
		});
	},
};

export default Plugin;
