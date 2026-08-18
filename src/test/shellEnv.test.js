const assert = require("node:assert/strict");
const test = require("node:test");

const getShellEnv = require("../shell-env.js");

test("resolves the environment for a shell", async () => {
    const env = await getShellEnv(process.env.SHELL || "/bin/sh");

    assert.equal(typeof env, "object");
    assert.ok(env.PATH);
});
