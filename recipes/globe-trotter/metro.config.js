const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Filament loads bundled .glb models as assets
config.resolver.assetExts.push("glb");

module.exports = config;
