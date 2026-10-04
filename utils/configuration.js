module.exports = function requireConfiguration(env = process.env) {
    const required = ["ATLASDB_URL", "SESSION_SECRET", "CLOUD_NAME", "CLOUD_API_KEY", "CLOUD_API_SECRET"];
    const missing = required.filter((key) => !env[key]);
    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
    const port = Number(env.PORT || 8080);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("PORT must be an integer between 1 and 65535.");
    }
    return port;
};
