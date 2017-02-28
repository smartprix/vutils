/* eslint-disable guard-for-in, import/prefer-default-export */
function handleRes(res, resolve, reject) {
	const data = res.data || {};

	if (!data.errors || !data.errors.length) {
		if (resolve) {
			resolve(data.data);
		}
		else {
			reject(data);
		}

		return;
	}

	const fields = {};
	data.errors.forEach((error) => {
		if (error.fields) {
			for (const key in error.fields) {
				fields[key] = error.fields[key];
			}
		}
	});

	data.userErrors = fields;
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
