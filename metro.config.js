const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable symlink support for pnpm's node_modules structure
config.resolver.unstable_enableSymlinks = true;

// Explicitly tell Metro where to find node_modules.
// With pnpm hoisted mode this is the project root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Add the pnpm virtual store so Metro can resolve packages through symlinks
config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.resolve(__dirname, 'node_modules/.pnpm'),
];

module.exports = config;
