const { getDefaultConfig } = require("expo/metro-config");

// Keep Metro scoped to this app. Watching the whole pnpm monorepo
// exceeds Windows watcher startup limits on this machine.
module.exports = getDefaultConfig(__dirname);
