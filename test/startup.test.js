const test = require("node:test");
const assert = require("node:assert/strict");

test("server startup checks configuration before opening database connections", async () => {
    const keys = ["ATLASDB_URL", "SESSION_SECRET", "CLOUD_NAME", "CLOUD_API_KEY", "CLOUD_API_SECRET", "PORT"];
    const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
    try {
        process.env.ATLASDB_URL = "mongodb://invalid.example/roomlo";
        process.env.CLOUD_NAME = "cloud";
        process.env.CLOUD_API_KEY = "key";
        process.env.CLOUD_API_SECRET = "secret";
        delete process.env.SESSION_SECRET;
        const { startServer } = require("../app");
        await assert.rejects(startServer(), /Missing required environment variables: SESSION_SECRET/);
    } finally {
        for (const key of keys) {
            if (previous[key] === undefined) delete process.env[key];
            else process.env[key] = previous[key];
        }
    }
});
