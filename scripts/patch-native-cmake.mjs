#!/usr/bin/env node
/**
 * NDK 27 + CMake 3.22.1 nesse setup não propaga `ANDROID_STL=c++_shared` pro
 * link final de alguns módulos nativos — o build falha em runtime com
 * "undefined symbol: std::__ndk1::..." (basic_string, thread, __cxa_*, etc.),
 * porque a lib C++ do NDK nunca entra no `target_link_libraries`.
 *
 * `pnpm install` reescreve node_modules do zero, então isso precisa reaplicar
 * toda vez — daí rodar como `postinstall` em vez de editar e esquecer.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const patches = [
  {
    file: 'node_modules/react-native-worklets/android/CMakeLists.txt',
    from: 'target_link_libraries(worklets android log ReactAndroid::reactnative\n                      ReactAndroid::jsi fbjni::fbjni)',
    to: 'target_link_libraries(worklets android log ReactAndroid::reactnative\n                      ReactAndroid::jsi fbjni::fbjni c++_shared)',
  },
  {
    file: 'node_modules/react-native-reanimated/android/CMakeLists.txt',
    from: 'react-native-worklets::worklets)',
    to: 'react-native-worklets::worklets\n  c++_shared)',
  },
  {
    file: 'node_modules/react-native-screens/android/CMakeLists.txt',
    from: 'target_link_libraries(rnscreens\n    ReactAndroid::reactnative\n    ReactAndroid::jsi\n    fbjni::fbjni\n    android\n)',
    to: 'target_link_libraries(rnscreens\n    ReactAndroid::reactnative\n    ReactAndroid::jsi\n    fbjni::fbjni\n    android\n    c++_shared\n)',
  },
  {
    file: 'node_modules/expo-modules-core/android/cmake/common.cmake',
    from: 'target_link_libraries(\n  EXPO_COMMON\n  INTERFACE\n  ReactAndroid::jsi\n  fbjni::fbjni\n  ReactAndroid::reactnative\n)',
    to: 'target_link_libraries(\n  EXPO_COMMON\n  INTERFACE\n  ReactAndroid::jsi\n  fbjni::fbjni\n  ReactAndroid::reactnative\n  c++_shared\n)',
  },
  {
    file: 'node_modules/react-native-gesture-handler/android/src/main/jni/CMakeLists.txt',
    from: 'target_link_libraries(\n  ${PACKAGE_NAME}\n  ReactAndroid::reactnative\n  ReactAndroid::jsi\n  fbjni::fbjni\n)',
    to: 'target_link_libraries(\n  ${PACKAGE_NAME}\n  ReactAndroid::reactnative\n  ReactAndroid::jsi\n  fbjni::fbjni\n  c++_shared\n)',
  },
  {
    file: 'node_modules/react-native-safe-area-context/android/src/main/jni/CMakeLists.txt',
    from: '          fbjni\n          jsi\n          reactnative\n  )',
    to: '          fbjni\n          jsi\n          reactnative\n          c++_shared\n  )',
  },
  {
    file: 'node_modules/react-native-safe-area-context/android/src/main/jni/CMakeLists.txt',
    from: '          turbomodulejsijni\n          yoga\n  )',
    to: '          turbomodulejsijni\n          yoga\n          c++_shared\n  )',
  },
  {
    // Alvo separado do `android/CMakeLists.txt` (já corrigido acima): esse é
    // o `react_codegen_rnscreens`, buildado como .so próprio (não OBJECT).
    file: 'node_modules/react-native-screens/android/src/main/jni/CMakeLists.txt',
    from: 'target_link_libraries(\n  ${LIB_TARGET_NAME}\n  ReactAndroid::reactnative\n  ReactAndroid::jsi\n  fbjni::fbjni\n)',
    to: 'target_link_libraries(\n  ${LIB_TARGET_NAME}\n  ReactAndroid::reactnative\n  ReactAndroid::jsi\n  fbjni::fbjni\n  c++_shared\n)',
  },
  {
    file: 'node_modules/react-native-svg/android/src/main/jni/CMakeLists.txt',
    from: 'target_link_libraries(\n  react_codegen_rnsvg\n  fbjni\n)',
    to: 'target_link_libraries(\n  react_codegen_rnsvg\n  fbjni\n  c++_shared\n)',
  },
];

for (const { file, from, to } of patches) {
  const fullPath = path.join(root, file);
  let content;
  try {
    content = readFileSync(fullPath, 'utf8');
  } catch {
    console.warn(`[patch-native-cmake] pulei ${file} (não encontrado — pacote não instalado?)`);
    continue;
  }

  if (content.includes(to)) {
    console.log(`[patch-native-cmake] ${file} já está com c++_shared`);
    continue;
  }

  if (!content.includes(from)) {
    console.warn(
      `[patch-native-cmake] ${file} mudou de formato — a substituição esperada não bateu, ajuste o script.`,
    );
    continue;
  }

  writeFileSync(fullPath, content.replace(from, to));
  console.log(`[patch-native-cmake] corrigi ${file}`);
}
