const fs = require("fs");
const os = require("os");
const { dirname, isAbsolute, join, resolve } = require("path");

const {
  constructValue,
  isExpired,
  isSizeExceeded,
  sanitizeValue,
} = require("./utils.js");

class Kvstore {
  constructor(store) {
    if (store === undefined) {
      store = join(os.homedir(), "kvstore", "store.json");
    } else if (typeof store !== "string" || store === "") {
      throw new TypeError(
        "Invalid store location. Kindly provide a valid path."
      );
    } else {
      if (store.substr(store.length - 5) !== ".json") {
        store = join(store, "kvstore", "store.json");
      }
      store = isAbsolute(store) ? store : join(process.cwd(), store);
    }

    if (fs.existsSync(store)) {
      this.store = store;
    } else {
      fs.mkdirSync(dirname(store), { recursive: true });
      fs.writeFileSync(store, "{}");
      this.store = store;
    }
    return true;
  }

  async set(key, value, expiresIn = "never") {
    if (key === undefined || value === undefined) {
      throw new TypeError("Key or value missing. Kindly specify both.");
    }

    if (
      (expiresIn !== "never" && typeof expiresIn !== "number") ||
      expiresIn <= 0
    ) {
      throw new TypeError(
        "Invalid expiration. Make sure it is > 0 and multiples of 1000(second)."
      );
    }

    if (typeof key !== "string" || key === "" || key.length > 32) {
      throw new TypeError(
        "Invalid key. Make sure it is String and <= 32 chars in length."
      );
    }

    value = sanitizeValue(value);

    if (!value || isSizeExceeded(value)) {
      throw new TypeError(
        "Invalid value. Make sure it is valid JSON and not exceeds 16KB in size."
      );
    }

    value = constructValue(value, expiresIn);

    try {
      const allowedSize = 1 * 1024 * 1024 * 1024; // 1 GiB
      let storeSize = (await fs.promises.stat(this.store)).size;

      if (storeSize > allowedSize) {
        await this.cleanUp();
        storeSize = (await fs.promises.stat(this.store)).size;
        if (storeSize > allowedSize) {
          throw new Error(
            "Store size exceeded. Further write not allowed until space free up"
          );
        }
      }

      let stream = JSON.parse(
        await fs.promises.readFile(resolve(this.store), "utf-8")
      );
      if (!stream.hasOwnProperty(key)) {
        stream[key] = value;
        await fs.promises.writeFile(
          resolve(this.store),
          JSON.stringify(stream)
        );
        return true;
      }
      throw new Error("key already exist. Try with different key.");
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async get(key) {
    if (key === undefined) {
      throw new TypeError("Key missing. Kindly specify.");
    }

    if (typeof key !== "string" || key === "" || key.length > 32) {
      throw new TypeError(
        "Invalid key. Make sure it is String and <= 32 chars in length."
      );
    }

    try {
      const stream = JSON.parse(
        await fs.promises.readFile(resolve(this.store), "utf-8")
      );
      if (stream[key] && !isExpired(stream[key])) {
        const { ["expiresIn"]: remove, ...rest } = stream[key];
        return rest.value;
      } else if (stream[key]) {
        await this.delete(key);
      }
      throw new Error("key does not exist or expired. Try with different key.");
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async delete(key) {
    if (key === undefined) {
      throw new TypeError("Key missing. Kindly specify.");
    }

    if (typeof key !== "string" || key === "" || key.length > 32) {
      throw new TypeError(
        "Invalid key. Make sure it is String and <= 32 chars in length."
      );
    }

    try {
      let stream = JSON.parse(
        await fs.promises.readFile(resolve(this.store), "utf-8")
      );
      if (stream.hasOwnProperty(key)) {
        const { [key]: remove, ...rest } = stream;
        await fs.promises.writeFile(resolve(this.store), JSON.stringify(rest));
        return true;
      }
      throw new Error("key does not exist or expired. Try with different key.");
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async has(key) {
    if (key === undefined) {
      throw new TypeError("Key missing. Kindly specify.");
    }

    if (typeof key !== "string" || key === "" || key.length > 32) {
      throw new TypeError(
        "Invalid key. Make sure it is String and <= 32 chars in length."
      );
    }

    try {
      let stream = JSON.parse(
        await fs.promises.readFile(resolve(this.store), "utf-8")
      );
      return stream.hasOwnProperty(key);
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async all() {
    try {
      return JSON.parse(
        await fs.promises.readFile(resolve(this.store), "utf-8")
      );
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async clear() {
    const empty = {};
    try {
      await fs.promises.writeFile(resolve(this.store), JSON.stringify(empty));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async cleanUp() {
    try {
      let stream = JSON.parse(
        await fs.promises.readFile(resolve(this.store), "utf-8")
      );
      const filtered = Object.entries(stream).filter(([, v]) => !isExpired(v));
      stream = Object.fromEntries(filtered);
      await fs.promises.writeFile(resolve(this.store), JSON.stringify(stream));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

module.exports = Kvstore;
