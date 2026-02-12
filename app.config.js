/**
 * Expo config. Loads EXPO_PUBLIC_HELIUS_API_KEY from env for RPC.
 * For Solana Seeker / dApp Store: build with EAS or local APK per docs.
 */
export default {
  expo: {
    name: "DLMM Position Dashboard",
    slug: "dlmm-dashboard",
    version: "0.1.0",
    orientation: "portrait",
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
