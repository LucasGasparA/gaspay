const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Metro por padrão só observa o próprio pacote. `@financas/shared` vive fora
// dele, então precisa entrar no watch — senão o Metro nem sabe que o arquivo
// existe quando o import é resolvido.
config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// pnpm não hoisteia por padrão: cada pacote só enxerga suas próprias
// dependências via symlink. A busca hierárquica do Metro assume hoisting do
// npm/yarn clássico e pode resolver a versão errada de um pacote duplicado.
config.resolver.disableHierarchicalLookup = true;
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
