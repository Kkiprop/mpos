/**
 * React Native CLI / Gradle Plugin configuration.
 *
 * The new React Native Gradle Plugin expects `project.android.packageName`
 * in the config output for autolinking. We also mirror the value under
 * `reactNativeHost.android.packageName` / `appName` for compatibility.
 */
module.exports = {
  project: {
    android: {
      packageName: 'com.example.mposmobile',
    },
  },
  reactNativeHost: {
    android: {
      appName: 'app',
      packageName: 'com.example.mposmobile',
    },
  },
};
