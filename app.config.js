export default {
  expo: {
    name: "eAttendance",
    slug: "my-app",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "y"
    },

    android: {
      package: "com.vikasverma_1999.myapp",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.USE_BIOMETRIC",
        "android.permission.ACCESS_NETWORK_STATE"
      ],
      googleServicesFile: "./google-services.json",
      config: {
        googleMaps: {
          apiKey: "AIzaSyAweUAuTOJmTdJsodlpSAN84kuO76LDWEY"
        }
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      softwareKeyboardLayoutMode: "pan"
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon-light.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            image: "./assets/images/splash-icon-dark.png",
            backgroundColor: "#000000"
          }
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow Attandance to use your location."
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification-icon.png"
        }
      ],
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true
          }
        }
      ]
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },

    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "6fa7c95d-469b-4f09-a6be-7eaf8a3f9ea4"
      },
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    }
  }
};
