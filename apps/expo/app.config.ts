import { ExpoConfig, ConfigContext } from "@expo/config";

const CLERK_PUBLISHABLE_KEY =
  "pk_test_cmVsYXhpbmctYnVubnktNjEuY2xlcmsuYWNjb3VudHMuZGV2JA";

const defineConfig = (_ctx: ConfigContext): ExpoConfig => ({
  name: "Przepisne2",
  slug: "przepisne2",
  version: "1.1.0",
  scheme: "przepisne2.app",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "your.bundle.identifier",
  },
  android: {
    package: "com.przepisne2.app",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#ffffff",
    },
  },
  extra: {
    eas: {
      projectId: "733c1c3e-931d-47c1-b8ce-b75cdffcacc1",
    },
    CLERK_PUBLISHABLE_KEY,
  },
  plugins: ["./expo-plugins/with-modify-gradle.js"],
});

export default defineConfig;
