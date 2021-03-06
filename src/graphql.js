/* eslint-disable guard-for-in, import/prefer-default-export */
import pick from 'lodash/pick';
import isPlainObject from 'lodash/isPlainObject';
import forEach from 'lodash/forEach';

function getDefaultError() {
	return {
		global: {
			message: 'Unknown Error',
			keyword: 'unknown',
		},
	};
}

function handleRes(res, resolve, reject) {
	const data = res.data || {};

	if (!data.errors || !data.errors.length) {
		if (resolve) {
			resolve(data.data);
		}
		else {
			data.userErrors = getDefaultError();
			data.userErrorMessages = {global: data.userErrors.global.message};
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
		fields = getDefaultError();
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
	// casuses problems in markdiwn, so disabling for now
	// let matches;
	// const enumRegex = /(?:#|Enum::)([A-Z]+)/;

	if (value === null || value === undefined) return null;
	if (typeof value === 'number') return value;
	if (typeof value !== 'string') {
		if (isPlainObject(value)) {
			// recursively build it
			// eslint-disable-next-line no-use-before-define
			return `{${convertObjectToGqlArg(value)}}`;
		}

		return JSON.stringify(value);
	}

	// eslint-disable-next-line
	// if (matches = value.match(enumRegex)) return matches[1];
	return JSON.stringify(value);
}

function convertObjectToGqlArg(obj, pickProps) {
	if (pickProps) {
		obj = pick(obj, pickProps);
	}

	const output = [];
	forEach(obj, (value, key) => {
		output.push(`${key}: ${convertSingleArgToGql(value)}`);
	});

	return output.join(', ');
}

/**
 * convert an object to graphQL argument string
 * {a: "this", b: 2, c: "that"} => a: "this", b: 2, c: "that"
 * @param {Object} opts {pick: null, braces: false}
 * pick is an array of fields to pick from the object, other fields will be ignored
 * braces denotes whether to wrap all the fields in () or not (default: false)
 * curly denotes whether to wrap the result in curly braces if it's an object (default: false)
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
		if (Array.isArray(opts)) {
			opts = {pick: opts};
		}

		argStr = convertObjectToGqlArg(obj, opts.pick);

		if (opts.curly) {
			return `{${argStr}}`;
		}
	}

	if (opts.braces) {
		return argStr ? `(${argStr})` : ' ';
	}

	return argStr || '# no args <>\n';
}

/**
 * gqlTag is a graphql tag you can use while building graphql queries
 * it can be used as:
 * 	gqlTag`products(${args}) { ${fields} }`
 * 	gqlTag`products(id: ${id}, name: ${name}) { id name ${fields} }`
 *
 * here args is an object, fields can be a string / array, id / name can be of any type
 */
function gqlTag(strings, ...args) {
	let out = strings[0];
	for (let i = 1; i < strings.length; i++) {
		const arg = args[i - 1];
		const matches = strings[i - 1].match(/(:|\()\s*$/);
		if (matches) {
			// arg is a graphql argument
			if (matches[1] === ':') {
				// arg is a single graphql argument
				out += convertSingleArgToGql(arg);
			}
			else {
				// arg is an object of graphql arguments
				out += toGqlArg(arg);
			}
		}
		else if (arg) {
			// arg is a graphql field
			if (typeof arg === 'string') {
				out += arg;
			}
			else if (Array.isArray(arg)) {
				out += arg.filter(Boolean).join(' ');
			}
		}

		out += strings[i];
	}
	return out;
}

export {
	handleGraphqlRequest,
	toGqlArg,
	gqlTag,
	convertGraphql,
};
