const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for @/ path alias
config.resolver.alias = {
  '@': './',
};

module.exports = config;