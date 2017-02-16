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

```js
export default {
	vModel: true,
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
```

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
