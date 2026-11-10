// Bluetooth Classic (SPP) não existe no iOS sem MFi; o módulo nativo crasha ao iniciar
// (cast forçado de UISupportedExternalAccessoryProtocols). Fica só no Android.
module.exports = {
  dependencies: {
    "react-native-bluetooth-classic": { platforms: { ios: null } },
  },
};
