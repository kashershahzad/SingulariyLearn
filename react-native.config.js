module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null,
      },
    },
    // IAP is iOS-only in this app (Android uses Stripe). Excluding Android
    // avoids shipping Play Billing Library 7, which Play Console rejects.
    'react-native-iap': {
      platforms: {
        android: null,
      },
    },
  },
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/fonts'],
};
