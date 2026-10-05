const assert = require("node:assert/strict");
const test = require("node:test");

const getShellEnv = require("../shell-env.js");

test("resolves the environment for a shell", async () => {
    const shell = process.platform === "win32"
        ? process.env.ComSpec
        : process.env.SHELL || "/bin/sh";
    const env = await getShellEnv(shell);

    assert.equal(typeof env, "object");
    assert.ok(env.PATH || env.Path);
});
