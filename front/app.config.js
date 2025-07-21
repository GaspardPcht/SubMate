module.exports = {
  expo: {
    name: "SubMate",
    slug: "submate",
    version: "1.0.21",
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
      buildNumber: "22",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: [
          "remote-notification"
        ]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/Logo/SubMate_logo.png",
        backgroundColor: "#ffffff",
        resizeMode: "center",
        size: 512
      },
      package: "com.gaspardpcht.submate",
      versionCode: 22
    },
    web: {
      favicon: "./assets/Logo/SubMate_logo.png"
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff",
          sounds: [
            "./assets/notification-sound.wav"
          ]
        }
      ]
    ],
    extra: {
      apiUrl: "https://sub-mate-back.vercel.app",
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