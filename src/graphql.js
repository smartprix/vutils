/* eslint-disable guard-for-in, import/prefer-default-export */
function handleRes(res, resolve, reject) {
	if (!res.errors || !res.errors.length) {
		resolve(res.data);
		return;
	}

	const fields = {};
	res.errors.forEach((error) => {
		if (error.fields) {
			for (const key in error.fields) {
				fields[key] = error.fields[key];
			}
		}
	});
	res.userErrors = fields;
	reject(res);
}

function handleGraphqlRequest(graphqlRequest) {
	return new Promise((resolve, reject) => {
		graphqlRequest
			.then((res) => {
				handleRes(res, resolve, reject);
			})
			.catch((res) => {
				if (!res.errors || !res.errors.length) {
					reject(res);
				}
				else {
					handleRes(res, resolve, reject);
				}
			});
	});
}

export {
	handleGraphqlRequest,
};
