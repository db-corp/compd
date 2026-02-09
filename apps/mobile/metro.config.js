const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Watch the monorepo root so Metro can resolve convex/ and packages/
config.watchFolders = [path.resolve(__dirname, "../..")];

module.exports = config;
