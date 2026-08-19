import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);

const targetBindings = {
  'darwin-arm64': '@ohos-rs/oxk-darwin-arm64',
  'darwin-x64': '@ohos-rs/oxk-darwin-x64',
  'linux-arm64': '@ohos-rs/oxk-linux-arm64-gnu',
  'linux-armhf': '@ohos-rs/oxk-linux-arm-gnueabihf',
  'linux-x64': '@ohos-rs/oxk-linux-x64-gnu',
  'alpine-arm64': '@ohos-rs/oxk-linux-arm64-musl',
  'alpine-x64': '@ohos-rs/oxk-linux-x64-musl',
  'win32-arm64': '@ohos-rs/oxk-win32-arm64-msvc',
  'win32-x64': '@ohos-rs/oxk-win32-x64-msvc',
  web: '@ohos-rs/oxk-wasm32-wasi',
};

function isMusl() {
  if (process.platform !== 'linux') {
    return false;
  }

  const report = process.report?.getReport();
  return !report?.header?.glibcVersionRuntime;
}

function detectTarget() {
  if (process.platform === 'darwin' && (process.arch === 'arm64' || process.arch === 'x64')) {
    return `darwin-${process.arch}`;
  }

  if (process.platform === 'win32' && (process.arch === 'arm64' || process.arch === 'x64')) {
    return `win32-${process.arch}`;
  }

  if (process.platform === 'linux') {
    const family = isMusl() ? 'alpine' : 'linux';
    if (process.arch === 'arm') {
      if (family === 'alpine') {
        throw new Error('oxc-ark does not publish an Alpine ARM32 binding');
      }
      return 'linux-armhf';
    }
    if (process.arch === 'arm64' || process.arch === 'x64') {
      return `${family}-${process.arch}`;
    }
  }

  throw new Error(`Unsupported packaging platform: ${process.platform}-${process.arch}`);
}

async function verifyNativeFormatter(bindingPackage) {
  const packagePath = join(root, 'node_modules', ...bindingPackage.split('/'), 'package.json');
  if (!existsSync(packagePath)) {
    throw new Error(`Missing ${bindingPackage}. Run yarn install on the target platform before packaging.`);
  }

  const { format } = require('@ohos-rs/oxk/format');
  const result = await format('PackageCheck.ets', 'const value=1\n', {
    semi: false,
  });
  if (result.errors.length > 0 || !result.code.includes('const value = 1')) {
    throw new Error(`oxc-ark packaging smoke test failed: ${result.errors.join('\n')}`);
  }
}

const detectedTarget = detectTarget();
const requestedTarget = process.argv[2] || process.env.VSCE_TARGET || detectedTarget;
if (requestedTarget !== 'web' && requestedTarget !== detectedTarget) {
  throw new Error(
    `VSCE_TARGET=${requestedTarget} does not match the current runtime (${detectedTarget}). ` +
      'Build native VSIX packages on matching runners.',
  );
}

const bindingPackage = targetBindings[requestedTarget];
if (!bindingPackage) {
  throw new Error(`No oxc-ark binding mapping for VS Code target ${requestedTarget}`);
}

if (requestedTarget === 'web') {
  const wasmPath = join(root, 'node_modules', ...bindingPackage.split('/'), 'oxk.wasm32-wasi.wasm');
  if (!existsSync(wasmPath)) {
    throw new Error(
      `Missing ${bindingPackage}. Run yarn install --frozen-lockfile --ignore-platform --force before packaging web.`,
    );
  }
  await WebAssembly.compile(readFileSync(wasmPath));
} else {
  await verifyNativeFormatter(bindingPackage);
}

const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const outputDirectory = join(root, 'dist');
const outputPath = join(outputDirectory, `${manifest.name}-${manifest.version}-${requestedTarget}.vsix`);
mkdirSync(outputDirectory, { recursive: true });

const vsceEntry = join(root, 'node_modules', '@vscode', 'vsce', 'vsce');
if (!existsSync(vsceEntry)) {
  throw new Error('Cannot find @vscode/vsce. Run `yarn install` first.');
}

const vsceArguments = [vsceEntry, 'package', '--yarn', '--target', requestedTarget, '--out', outputPath];
if (requestedTarget === 'web') {
  vsceArguments.push('--ignoreFile', join(root, '.vscodeignore.web'), '--no-dependencies');
}

const result = spawnSync(process.execPath, vsceArguments, {
  cwd: root,
  env: { ...process.env, VSCE_TARGET: requestedTarget },
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Created ${outputPath}`);
