/**
 * Expo config. Web-first; Solana Seeker / mobile when you run build for iOS/Android.
 * Loads EXPO_PUBLIC_HELIUS_API_KEY from env for RPC.
 */
export default {
  expo: {
    name: "DLMM Position Dashboard",
    slug: "dlmm-dashboard",
    version: "0.1.0",
    orientation: "default",
    userInterfaceStyle: "dark",
    scheme: "dlmm-dashboard",
    splash: { resizeMode: "contain", backgroundColor: "#0f0f14" },
    assetBundlePatterns: ["**/*"],
    ios: { supportsTablet: true, bundleIdentifier: "com.dlmm.dashboard" },
    android: {
      adaptiveIcon: { backgroundColor: "#0f0f14" },
      package: "com.dlmm.dashboard",
    },
    extra: {
      EXPO_PUBLIC_HELIUS_API_KEY: process.env.EXPO_PUBLIC_HELIUS_API_KEY,
    },
  },
};
