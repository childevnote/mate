const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Enable symlinks for workspace packages (monorepo support)
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: "./global.css" });
