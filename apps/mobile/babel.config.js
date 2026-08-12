module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Precisa ser o último plugin da lista.
    plugins: ['react-native-worklets/plugin'],
  };
};
