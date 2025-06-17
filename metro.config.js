const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./globals.css" });
module.exports = {
  resolver: {
    unstable_conditionNames: ['browser', 'require', 'react-native'],
  },
};

module.exports = config;
