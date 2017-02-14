import filters from './filters';
import eventPlugin from './event_plugin';

const Plugin = {
	install(Vue) {
		Vue.use(eventPlugin);
		Vue.use(filters);
	},
};

export default Plugin;
export * from './mixins';
export * from './helpers';
