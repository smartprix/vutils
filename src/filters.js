function round(number, precision = 0) {
	if (!precision) return Math.round(number);
	const factor = 10 ** precision;
	const tempNumber = number * factor;
	const roundedTempNumber = Math.round(tempNumber);
	return roundedTempNumber / factor;
}

const Plugin = {
	install(Vue) {
		Vue.filter('round', (value, precision = 0) => round(value, precision));
		Vue.filter('formatNumber', (value, precision = 0) => value.toLocaleString(value, {minimumFractionDigits: precision}));
	},
};

export default Plugin;
