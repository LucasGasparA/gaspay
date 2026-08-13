const { withDangerousMod, withAppBuildGradle } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * NDK 27 + CMake 3.22.1 (o que o Android SDK instala por padrão) não propaga
 * `ANDROID_STL=c++_shared` pro link final de `libappmodules.so` nesse setup —
 * o app builda mas crasha na abertura (ou o build falha antes, dependendo do
 * módulo) com símbolo de libc++ faltando (`std::string`, `std::thread`,
 * `__cxa_*`...). É bug de toolchain, não do código.
 *
 * `android/` é regenerado a cada `expo prebuild`/`expo run:android` do zero,
 * então a correção tem que ser reaplicada via config plugin — editar o
 * CMakeLists.txt gerado direto não sobrevive ao próximo prebuild.
 *
 * O próprio arquivo da react-native documenta esse mecanismo de override:
 * copiar `default-app-setup/CMakeLists.txt` pra `android/app/src/main/jni/`
 * e apontar `externalNativeBuild.cmake.path` pra lá.
 */
function withAndroidCxxSharedLink(config) {
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const jniDir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'jni');
      fs.mkdirSync(jniDir, { recursive: true });

      // Não assume `node_modules/react-native` relativo: com node-linker=hoisted
      // (monorepo pnpm) o pacote só existe fisicamente na raiz do workspace.
      const reactNativePkgJson = require.resolve('react-native/package.json', {
        paths: [projectRoot],
      });
      const sourceDir = path.join(
        path.dirname(reactNativePkgJson),
        'ReactAndroid',
        'cmake-utils',
        'default-app-setup',
      );

      fs.copyFileSync(path.join(sourceDir, 'OnLoad.cpp'), path.join(jniDir, 'OnLoad.cpp'));

      const cmakeContent = fs.readFileSync(path.join(sourceDir, 'CMakeLists.txt'), 'utf8');
      const patched = `${cmakeContent}\n\n# dindim: ver plugins/withAndroidCxxSharedLink.js\ntarget_link_libraries(appmodules c++_shared)\n`;
      fs.writeFileSync(path.join(jniDir, 'CMakeLists.txt'), patched);

      return config;
    },
  ]);

  config = withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('src/main/jni/CMakeLists.txt')) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*\{/,
        `android {\n    externalNativeBuild {\n        cmake {\n            path "src/main/jni/CMakeLists.txt"\n        }\n    }\n`,
      );
    }
    return config;
  });

  return config;
}

module.exports = withAndroidCxxSharedLink;
