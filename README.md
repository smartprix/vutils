# vutils
Utilities for VueJS

## Mixins
### `vModelMixin()`
This mixin will help you to define components which use v-model to sync data with parent component. By default it'll define a property named `currentValue` on the component, which you can modify and it'll automatically emit `input` and `change` events, so that data can be synced with parent component.

```js
// In component
import {vModelMixin} from 'vutils';

export default {
	mixins: [
		vModelMixin(),
	],

	methods: {
		someMethod() {
			this.currentValue = 'updated value';
		}
	}
};
```

`vModelMixin` can take a string or object as an input.  
Use `vModelMixin(propName)` if you want to use some other name instead of `currentValue`. `vModelMixin('formData');`
Use `vModelMixin({name, type, default})` if you want to define type and default value of the property.

### `propModifyMixin()`
Since Vue doesn't allow us to modify the props directly, this mixin can be used to define data which will keep in sync with the props and can be modified.

```js
import {propModifyMixin} from 'vutils';

export default {
	mixins: [
		propModifyMixin(['shown', 'formData']),
	],

	methods: {
		someMethod() {
			this.iShown = false;
			this.iFormData = {
				name: 'hello'
			};
		},
	},
};
```

By default it'll define a data property with the name `i{CapitalizedPropName}`. You can override that.

```js
// for a single property
propModifyMixin('shown');

// for multiple properties
propModifyMixin(['shown', 'formData']);

// for defining custom names
propModifyMixin({shown: 'modalShown', formData: 'user'});

// for defining types and default values
propModifyMixin({
	shown: {
		type: Boolean,
		default: true,
	},

	formData: {
		name: 'user',
	},
});
```

### `reEventMixin()`
This mixin will re-emit the same event with a different name.

```js
import {reEventMixin} from 'vutils';

export default {
	mixins: [
		reEventMixin({save: 'done'}),
	],

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
