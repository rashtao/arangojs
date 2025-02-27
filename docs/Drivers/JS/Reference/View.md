# View API

These functions implement the
[HTTP API for manipulating views](https://docs.arangodb.com/latest/HTTP/Views/index.html).

{% hint 'info' %}
Views were introduced in ArangoDB 3.4 and are not supported by earlier versions
of ArangoDB.
{% endhint %}

## view.exists

`async view.exists(): boolean`

Checks whether the view exists.

**Examples**

```js
const db = new Database();
const view = db.arangoSearchView("some-view");
const result = await view.exists();
// result indicates whether the view exists
```

### view.get

`async view.get(): Object`

Retrieves general information about the view.

**Examples**

```js
const db = new Database();
const view = db.arangoSearchView("some-view");
const data = await view.get();
// data contains general information about the view
```

### view.properties

`async view.properties(): Object`

Retrieves the view's properties.

**Examples**

```js
const db = new Database();
const view = db.arangoSearchView("some-view");
const data = await view.properties();
// data contains the view's properties
```

## view.create

`async view.create([properties]): Object`

Creates a view with the given _properties_ for this view's name,
then returns the server response.

**Arguments**

- **properties**: `Object` (optional)

  For more information on the _properties_ object, see the
  [HTTP API documentation for creating views](https://docs.arangodb.com/latest/HTTP/Views/ArangoSearch.html).

**Examples**

```js
const db = new Database();
const view = db.arangoSearchView("potatoes");
await view.create();
// the arangosearch view "potatoes" now exists
```

## view.setProperties

`async view.setProperties(properties): Object`

Updates the properties of the view.

**Arguments**

- **properties**: `Object`

  For information on the _properties_ argument see the
  [HTTP API for modifying views](https://docs.arangodb.com/latest/HTTP/Views/ArangoSearch.html).

**Examples**

```js
const db = new Database();
const view = db.arangoSearchView("some-view");
const result = await view.setProperties({ consolidationIntervalMsec: 123 });
assert.equal(result.consolidationIntervalMsec, 123);
```

## view.replaceProperties

`async view.replaceProperties(properties): Object`

Replaces the properties of the view.

**Arguments**

- **properties**: `Object`

  For information on the _properties_ argument see the
  [HTTP API for modifying views](https://docs.arangodb.com/latest/HTTP/Views/ArangoSearch.html).

**Examples**

```js
const db = new Database();
const view = db.arangoSearchView("some-view");
const result = await view.replaceProperties({ consolidationIntervalMsec: 234 });
assert.equal(result.consolidationIntervalMsec, 234);
```

## view.rename

`async view.rename(name): Object`

Renames the view. The _View_ instance will automatically update its
name when the rename succeeds.

**Examples**

```js
const db = new Database();
const view = db.arangoSearchView("some-view");
const result = await view.rename("new-view-name");
assert.equal(result.name, "new-view-name");
assert.equal(view.name, result.name);
// result contains additional information about the view
```

## view.drop

`async view.drop(): Object`

Deletes the view from the database.

**Examples**

```js
const db = new Database();
const view = db.arangoSearchView("some-view");
await view.drop();
// the view "some-view" no longer exists
```
