const test = require("ava");

const kvstore = require('../src/index');
const store = new kvstore('.');

test("Valid#set", async (t) => {
    t.is(await store.set("lorem", "ipsum"), true);
});