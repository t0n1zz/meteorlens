/**
 * Metro config: resolve Node built-in "util" to the npm polyfill.
 * Required by @coral-xyz/anchor (used by @meteora-ag/dlmm).
 */
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  util: path.resolve(__dirname, "shim/util.js"),
};

// Ensure @meteora-ag/dlmm is transpiled (needed for web)
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
