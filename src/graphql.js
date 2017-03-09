/* eslint-disable guard-for-in, import/prefer-default-export */
import pick from 'lodash/pick';
import isPlainObject from 'lodash/isPlainObject';
import forEach from 'lodash/forEach';

const defaultError = {
	global: {
		message: 'Unknown Error',
		keyword: 'unknown',
	},
};

function handleRes(res, resolve, reject) {
	const data = res.data || {};

	if (!data.errors || !data.errors.length) {
		if (resolve) {
			resolve(data.data);
		}
		else {
			data.userErrors = defaultError;
			data.userErrorMessages = {global: defaultError.global.message};
			reject(data);
		}

		return;
	}

	let fields = {};
	data.errors.forEach((error) => {
		if (error.fields) {
			for (const key in error.fields) {
				fields[key] = error.fields[key];
			}
		}
	});

	// no user errors sent by server
	if (!Object.keys(fields).length) {
		fields = defaultError;
	}

	data.userErrors = fields;
	data.userErrorMessages = {};
	for (const key in fields) {
		data.userErrorMessages[key] = (fields[key] && fields[key].message) || 'Error';
	}

	reject(data);
}

/*
 * convert graphql request into a valid one by removing
 * unnecessary things
 */
function convertGraphql(graphql) {
	const emptyBracketRegex = /\(\s*# no args <>\n\s*\)/g;
	return graphql.replace(emptyBracketRegex, ' ');
}

function handleGraphqlRequest(graphqlRequest) {
	return new Promise((resolve, reject) => {
		graphqlRequest
			.then((res) => {
				handleRes(res, resolve, reject);
			})
			.catch((res) => {
				handleRes(res, null, reject);
			});
	});
}

function convertSingleArgToGql(value) {
	let matches;
	const enumRegex = /(?:#|Enum::)([A-Z]+)/;

	if (value === null || value === undefined) return value;
	if (typeof value !== 'string') return value;
	// eslint-disable-next-line
	if (matches = value.match(enumRegex)) return matches[1];
	return JSON.stringify(value);
}

/**
 * convert an object to graphQL argument string
 * {a: "this", b: 2, c: "that"} => a: "this", b: 2, c: "that"
 * @param {Object} opts {pick: null, braces: false}
 * pick is an array of fields to pick from the object, other fields will be ignored
 * braces denotes whether to wrap all the fields in () or not (default: false)
 * @param  {Object} obj
 * @return {String} graphQL argument string
 */
function toGqlArg(obj, opts = {}) {
	let argStr = '';

	if (!obj) {
		argStr = '';
	}
	if (!isPlainObject(obj)) {
		argStr = convertSingleArgToGql(obj);
	}
	else {
		if (opts.pick) {
			obj = pick(obj, opts.pick);
		}

		const output = [];
		forEach(obj, (value, key) => {
			output.push(`${key}: ${convertSingleArgToGql(value)}`);
		});

		argStr = output.join(', ');
	}

	if (opts.braces) {
		return argStr ? `(${argStr})` : ' ';
	}

	return argStr || '# no args <>\n';
}

export {
	handleGraphqlRequest,
	toGqlArg,
	convertGraphql,
};
