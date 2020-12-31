<div align="center">

# KVstore (Key-value store)

✨ A dead simple key-value JSON-based persistent lightweight database. ✨

</div>

## Features

- 📝 Uses JSON files to modify and write key-value elements as JSON-objects.
- 👌 **Easy to use** JSON database.
- 🚫 **Prevents JSON corruption** with native node JS 'fs' APIs.
- 0️⃣ Zero dependency
- 🕊️ **Lightweight** package with an unpacked size of **13.2 kB**.
- 🖥️ Requires **Node.js v12.x** or greater

## Install 💾

**Node.js v12.x or greater is required for this package to work.**

```js
npm install kvstore
```

## Basic Usage 📑

```js
const kvstore = require("kvstore");
const store = new kvstore("."); // optional path paramneter

(async () => {
  // Set new key value pair without expiration - Never
  await store.set("foo", "bar");
  // Set new key value pair with expiration - 5 secs
  await store.set("lorem", "ipsum", 5000);

  // Get existing key
  console.log(await store.get("foo")); // bar
  // Get non existing or expired key
  console.log(await store.get("lorem")); // false - msg ['key does not exist or expired. Try with different key.']

  // Delete existing key
  console.log(await store.delete("foo")); // true

  // check given key exist
  console.log(await store.has("foo")); // false

  // Returns whole store
  console.log(await store.all()); // { object of the whole store contents }

  // Delte all expired keys - eviction policy
  console.log(await store.cleanUp()); // true

  // Clearing the whole store
  await store.clear();
})();
```

## License

This package is open sourced under the [MIT License](https://github.com/SelvamuthukumaranRajan/kvstore/blob/master/LICENSE.md).
