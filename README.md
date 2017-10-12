# vutils
Utilities for VueJS

## How To Use
```bash
yarn add vutils  # or npm install vutils --save
```

```js
import Vue from 'vue';
import VueUtils from 'vutils';

Vue.use(VueUtils);
```

```js
// for using helper functions
import {remove, update, addOrUpdate} from 'vutils';

function saveUser(state, user) {
	addOrUpdate(state.users, user, 'id');
}

function deleteUser(state, user) {
	remove(state.users, item => item.id === user.id);
}
```

## Extra Options
### vModel
This will help you to define components which use v-model to sync data with parent component. By default it'll define a property named `currentValue` on the component, which you can modify and it'll automatically emit `input` and `change` events, so that data can be synced with parent component.

Note that if you're using vModel, you need to define `value` as a prop of the component.

```js
export default {
	vModel: true,
	props: {
		value: {},
	},
	methods: {
		someMethod() {
			this.currentValue = 'updated value';
		}
	}
};
```

```js
// using a custom name instead of currentValue
export default {
	vModel: 'shown',
	props: {
		value: {
			type: Boolean,
			default: true,
		}
	},
	methods: {
		someMethod() {
			this.shown = false;
		}
	}
};
```
### Prop Modify
Since Vue doesn't allow us to modify the props directly, this can be used to define data which will keep in sync with the props and can be modified. You need to add `modify: true` to the props you wish to modify.

```js
export default {
	props: {
		shown: {
			type: Boolean,
			modify: true,
		},
		formData: {
			type: Object,
			modify: 'user',
		},
	},

	methods: {
		someMethod() {
			this.iShown = false;
			this.user = {
				name: 'hello'
			};
		},
	},
};
```

By default it'll define a data property with the name `i{CapitalizedPropName}`. You can override that by giving a string instead of `true` in the modify parameter.

**NOTE**: It automatically clones the property whenever it is modified, so you don't need to worry about changing the original (parent) property in case the property is an object.

### reEvents
This will re-emit the same event with a different name.

```js
export default {
	reEvents: {save: 'done'},
	methods: {
		someMethod() {
			// this will emit both save and done event
			this.$emit('save');
		},
	},
};
```

## Event Plugin
You can define global event handling in `events`.  
Emit global events using `this.$$emit`.  
You can also listen for global events using `this.$$on(eventName, () => {})`

```js
export default {
	events: {
		someGlobalEvent(e) {
			// do something
		},
	},
};

// In some other component
export default {
	methods: {
		someMethod(e) {
			this.$$emit('someGlobalEvent');
		},
	},
};
```

## Pagination Mixin
Pagination mixin helps in doing pagination and filtering.  

It defines some methods in the component.  
`handleFilterChange`: call this whenever a filter is changed  
`handleSizeChange`: call this when items per page has changed  
`handleCurrentChange`: call this when the current page has changed  
`handleSortChange`: call this when sorting parameter changes  
`reloadSelfData`: call this to reload the data in the page  

And some data variables:  
`defaultSort`: indicates the default sorting parameter of the component  
`loadingSelfData`: indicates if the data of the component is loading or not.  


You need to define a method called `loadSelfData(filters)` in your
component methods which loads the data of the component. Ideally this
method should return a promise.

You also need to define a data variable named `filters`, which should be
an object and it denotes the filters that the component supports and their
default values.

```html
<template>
	<ela-content-layout padding="0">
		<div slot="head">
			<h3>Brands</h3>
		</div>

		<div slot="filters">
			<el-row type="flex">
				<ela-filter-item label="Status" :span="5">
					<el-select
						size="small"
						clearable
						v-model="filters.status"
						@change="handleFilterChange">
						<el-option value="Active">Active</el-option>
						<el-option value="Inactive">Inactive</el-option>
					</el-select>
				</ela-filter-item>
				<ela-filter-item label="Search" :span="6" float="right">
					<el-input
						icon="search"
						size="small"
						v-model="filters.search"
						@click="handleFilterChange"
						@keyup.native.enter="handleFilterChange">
					</el-input>
				</ela-filter-item>
			</el-row>
		</div>

		<el-table
			:data="brands.nodes"
			style="width: 100%"
			stripe border
			:default-sort="defaultSort"
			@sort-change="handleSortChange"
			v-loading="loadingSelfData">
			<el-table-column prop="id" label="Id" width="60" sortable></el-table-column>
			<el-table-column prop="name" label="Name"></el-table-column>
			<el-table-column prop="status" label="Status" width="100"></el-table-column>
		</el-table>

		<div slot="foot">
			<div class="footer-right">
				<el-pagination
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
					:current-page="filters.page"
					:page-sizes="[20, 50, 100, 250, 500]"
					:page-size="filters.count"
					layout="total, sizes, prev, pager, next, jumper"
					:total="brands.totalCount">
			    </el-pagination>
			</div>
		</div>
	</ela-content-layout>
</template>

<script>
import {paginationMixin} from 'vutils';

export default {
	name: 'Brands',
	mixins: [
		paginationMixin(),
	],

	data() {
		return {
			brands: {},
			filters: {
				search: '',
				status: '',
				sort: '',
				order: '',
				page: 1,
				count: 20,
			},
		};
	},

	methods: {
		loadSelfData(filters) {
			return this.$api.getBrands(filters).then((brands) => {
				this.brands = brands;
			});
		},
	},

	events: {
		brandMutated() {
			this.reloadSelfData();
		},
	},
};
</script>
```

## Filters
### `round(precision)`
Round a number.

### `formatNumber(precision)`
Format a number using commas and all.

## Helpers
### `remove(arr, index)`
Remove an element from an array (vue compatible).  
This is reactive, means it notifies vue of changes in the array.  
`index` can be the index of the element or a function which returns true for the elements to be removed.

### `update(arr, index, value)`
Replace an element in an array (vue compatible).  
This is reactive, means it notifies vue of changes in the array.  
`index` can be the index of the element or a function which returns true for the element to be replaced.  

### `addOrUpdate(arr, value, func)`
Replace an element in an array (vue compatible) or adds it if it doesn't exist.  
This is reactive, means it notifies vue of changes in the array.  
`value` is the value which replaces the current value.
`func` is a function which returns true for the element to be replaced, or it can be a property name by which search will be performed. By default it is `id`.

### `handleGraphqlRequest(request)`
Given a request promise, this function will handle the incoming response from a graphql server and return a promise which handles errors appropriately.

It'll merge all fields from the `fields` key of errors array and put them in `userErrors` key of response.

```js
import Axios from 'axios';
import startsWith from 'lodash/startsWith';
import {handleGraphqlRequest} from 'gqutils';

const GRAPHQL_ENDPOINT = '/api';

function graphqlReqest(query) {
	return handleGraphqlRequest(Axios.post(GRAPHQL_ENDPOINT, {query}));
}

function query(graphqlQuery) {
	if (!startsWith(graphqlQuery, 'query')) {
		graphqlQuery = `query { ${graphqlQuery} }`;
	}

	return graphqlReqest(graphqlQuery);
}

function mutation(graphqlQuery) {
	if (!startsWith(graphqlQuery, 'mutation')) {
		graphqlQuery = `mutation { ${graphqlQuery} }`;
	}

	return graphqlReqest(graphqlQuery);
}
```
