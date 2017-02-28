/* eslint-disable guard-for-in, import/prefer-default-export */
const defaultError = {global: {message: 'Unknown Error', keyword: 'unknown'}};

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

export {
	handleGraphqlRequest,
};
