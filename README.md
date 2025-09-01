# scratch-form

A small vanilla JavaScript library for two-way form data binding.

- Supports array & object notation in field names
- Supports dynamically added/removed fields
- No special syntax or classes
- No dependencies

## Installation
Include the library directly on your page to access `window.ScratchForm`:

```html
<script src="https://cdn.jsdelivr.net/npm/scratch-form/dist/ScratchForm.js"></script>
```

or install to your project:
```
npm install scratch-form
```
```js
import ScratchForm from 'scratch-form';
```

## Usage
```html
<form name="my-form">
  <input name="field" value="value" />
</form>
```
```js
const formEl = document.forms['my-form']; // or `getElementById`, etc.
const data = new ScratchForm(formEl, options); // { field: 'value' }
data.field = 'new value'; // <input> element value will sync
```

See the [demo](https://freejosh.github.io/scratch-form/) for a kitchen-sink form that covers most use-cases.

Deep objects & arrays are accessible like normal (e.g. `data.obj.arr[1]`), and also through accessors using the form name notation (e.g. `data['obj[arr][1]']`). However, to change a deep value you _must_ use form name notation as deep objects & arrays are _not_ bound to the form.

## Options
- `onChange(name, value, node, obj)` - Called after the data changes
  - `name` - The name of the changed field. Will match the HTML `name`, except implied arrays (`name[]`) will be filled with the actual index
  - `value` - The changed value
  - `node` - The HTML node that changed
  - `obj` - The underlying data object holding all values (not bound to the form)
- `event` (default: `input`) - Binds to the form using this event name
