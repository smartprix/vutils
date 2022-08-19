import JSURL from 'jsurl2';

export function stringify(str) {
	return JSURL.stringify(str, {rich: true, short: true});
}

export function parse(str) {
	return JSURL.parse(str, {deURI: true});
}

export function toFilterQueryString(obj) {
	if (!obj) return '';
	return Object.keys(obj).map(key => `${key}=${stringify(key)}`).join('&');
}

export function toFilterUrl(path, query = {}) {
	const qs = toFilterQueryString(query);
	if (!qs) return path;
	return path + (path.includes('?') ? '?' : '&') + qs;
}
