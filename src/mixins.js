function vModelMixin(prop) {
	let propName = 'currentValue';
	let propType = null;
	let defaultValue;

	if (typeof prop === 'string') {
		propName = prop;
	}
	else if (prop) {
		if (prop.name) propName = prop.name;
		if (prop.type) propType = prop.type;
		if (prop.default) defaultValue = prop.default;
	}

	return {
		props: {
			value: {
				type: propType,
				default: defaultValue,
			},
		},

		data() {
			return {
				[propName]: this.value,
			};
		},

		watch: {
			value(val) {
				this[propName] = val;
			},

			[propName](val) {
				this.$emit('input', val);
				this.$emit('change', val);
			},
		},
	};
}

function reEventMixin(events) {
	return {
		created() {
			Object.keys(events).forEach((event) => {
				this.$on(event, (data) => this.$emit(events[event], data));
			});
		},
	};
}

function singlePropModify(prop, iProp, obj) {
	let propName = 'i' + prop.charAt(0).toUpperCase() + prop.slice(1);
	obj.props[prop] = {};

	if (typeof iProp === 'string') {
		propName = iProp;
	}
	else if (iProp) {
		if (iProp.name) {
			propName = iProp.name;
		}
		if (iProp.type) {
			obj.props[prop].type = iProp.type;
		}
		if (iProp.default) {
			obj.props[prop].default = iProp.default;
		}
	}

	obj._data[propName] = prop;
	obj.watch[prop] = function () {
		this[propName] = JSON.parse(JSON.stringify(this[prop]));
	};
}

function propModifyMixin(props) {
	if (!props) return {};
	const obj = {
		props: {},
		_data: {},
		watch: {},
	};

	if (typeof props === 'string') {
		singlePropModify(props, null, obj);
	}
	else if (Array.isArray(props)) {
		for (const prop of props) {
			singlePropModify(prop, null, obj);
		}
	}
	else {
		Object.keys(props).forEach((prop) => {
			singlePropModify(prop, props[prop], obj);
		});
	}

	obj.data = function () {
		const data = {};
		Object.keys(obj._data).forEach((propName) => {
			data[propName] = JSON.parse(JSON.stringify(this[obj._data[propName]]));
		});
		return data;
	};

	return obj;
}

export {
	vModelMixin,
	reEventMixin,
	propModifyMixin,
};
