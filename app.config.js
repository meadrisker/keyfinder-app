module.exports = {
  expo: {
    name: 'Keyring',
    slug: 'keyring',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    scheme: 'keyring',
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.meadrisker.keyring',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#0f6e56',
      },
      package: 'com.meadrisker.keyring',
    },
    plugins: [
      [
        'expo-camera',
        { cameraPermission: 'Keyring needs camera access to photograph keys.' },
      ],
      [
        'expo-image-picker',
        {
          cameraPermission: 'Keyring needs camera access to photograph keys.',
          photosPermission: 'Keyring needs photo library access to select key photos.',
        },
      ],
      'expo-secure-store',
      'expo-web-browser',
    ],
    extra: {
      apiBaseUrl: process.env.API_BASE_URL ?? 'https://keyfinder.meadriskersoftware.com',
    },
  },
};