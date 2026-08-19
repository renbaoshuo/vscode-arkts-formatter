import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDirectory = join(root, 'out', 'web');
const wasmPackageDirectory = join(root, 'node_modules', '@ohos-rs', 'oxk-wasm32-wasi');
const isWebTarget = process.argv.includes('--web') || process.env.VSCE_TARGET === 'web';

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

if (!isWebTarget) {
  writeFileSync(
    join(outputDirectory, 'extension.js'),
    `'use strict';\nexports.activate = function () {\n  throw new Error('This VSIX is for the native VS Code extension host.');\n};\n`,
  );
  process.exit(0);
}

const wasmPath = join(wasmPackageDirectory, 'oxk.wasm32-wasi.wasm');
const workerPath = join(wasmPackageDirectory, 'wasi-worker-browser.mjs');
if (!existsSync(wasmPath) || !existsSync(workerPath)) {
  throw new Error(
    'Missing @ohos-rs/oxk-wasm32-wasi. Run `yarn install --frozen-lockfile --ignore-platform --force` before building the web target.',
  );
}

await Promise.all([
  build({
    entryPoints: [join(root, 'src', 'web', 'extension.ts')],
    outfile: join(outputDirectory, 'extension.js'),
    bundle: true,
    external: ['vscode'],
    platform: 'browser',
    format: 'cjs',
    target: 'es2022',
    minify: true,
    legalComments: 'eof',
    define: {
      global: 'globalThis',
    },
  }),
  build({
    entryPoints: [workerPath],
    outfile: join(outputDirectory, 'wasi-worker.js'),
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: 'es2022',
    minify: true,
    legalComments: 'eof',
    define: {
      global: 'globalThis',
    },
  }),
]);

copyFileSync(wasmPath, join(outputDirectory, 'oxk.wasm'));
console.log('Built VS Code Web extension in out/web');
