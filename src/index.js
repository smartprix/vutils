import filters from './filters';
import eventPlugin from './event_plugin';
import mixinPlugin from './mixins';

const Plugin = {
	install(Vue) {
		Vue.use(eventPlugin);
		Vue.use(filters);
		Vue.use(mixinPlugin);
	},
};

export default Plugin;
export * from './helpers';
export * from './graphql';
