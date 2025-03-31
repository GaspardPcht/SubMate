module.exports = {
  expo: {
    name: "SubMate",
    slug: "submate",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/Logo/SubMate_logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/Logo/SubMate_logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gaspardpcht.submate",
      buildNumber: "5"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/Logo/SubMate_logo.png",
        backgroundColor: "#ffffff",
        resizeMode: "center",
        size: 512
      },
      package: "com.gaspardpcht.submate",
      versionCode: 5
    },
    web: {
      favicon: "./assets/Logo/SubMate_logo.png"
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: "48db2498-420e-4eb9-8aa6-a8a111e814f2"
      }
    },
    updates: {
      url: "https://u.expo.dev/48db2498-420e-4eb9-8aa6-a8a111e814f2"
    },
    runtimeVersion: {
      policy: "appVersion"
    }
  }
}; 