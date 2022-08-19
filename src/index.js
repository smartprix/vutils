import filters from './filters';
import eventPlugin from './event_plugin';
import mixinPlugin from './mixins';
import paginationMixin from './paginationMixin';

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
export * from './jsurl';
export {
	paginationMixin,
};
