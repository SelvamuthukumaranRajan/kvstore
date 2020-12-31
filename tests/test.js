const test = require("ava");

const kvstore = require("../src/index");
const store = new kvstore(".");

test("Valid#set", async (t) => {
  t.is(await store.set("lorem", "ipsum"), true);
});

test("Expire#set", async (t) => {
  t.is(await store.set("bar", "foo", 5000), true);
});

test("Valid#get", async (t) => {
  t.is(await store.get("lorem"), "ipsum");
});

test("Invalid#get", async (t) => {
  t.is(await store.get("foo"), false);
});

test("#delete", async (t) => {
  t.truthy(await store.delete("bar"));
});

test("Valid#has", async (t) => {
  t.truthy(await store.has("lorem"));
});

test("Invalid#has", async (t) => {
  t.falsy(await store.has("bar"));
});

test("#all", async (t) => {
  t.truthy(await store.all());
});

test("#cleanUp", async (t) => {
  t.truthy(await store.cleanUp());
});

test("#clear", async (t) => {
  t.truthy(await store.clear());
});
