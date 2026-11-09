const { withAppBuildGradle } = require('@expo/config-plugins');

// O template do Expo usa proguard-android.txt, que desliga as otimizações do R8.
module.exports = (config) =>
  withAppBuildGradle(config, (config) => {
    const c = config.modResults.contents;
    if (!c.includes('proguard-android-optimize.txt')) {
      if (!c.includes('getDefaultProguardFile("proguard-android.txt")')) {
        throw new Error('withR8Optimize: getDefaultProguardFile("proguard-android.txt") não encontrado em android/app/build.gradle.');
      }
      config.modResults.contents = c.replace('"proguard-android.txt"', '"proguard-android-optimize.txt"');
    }
    return config;
  });
