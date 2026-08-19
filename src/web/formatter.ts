import {
  getDefaultContext,
  instantiateNapiModuleSync,
  WASI,
} from '@napi-rs/wasm-runtime';
import * as vscode from 'vscode';
import { ArktsFormatter, LoadFormatter } from '../extension-common';

interface OxcArkWasmExports {
  format: ArktsFormatter['format'];
}

async function loadWasmFormatter(extensionUri: vscode.Uri): Promise<ArktsFormatter> {
  if (!globalThis.crossOriginIsolated) {
    throw new Error('当前 VS Code Web 环境未启用跨源隔离，无法运行多线程 oxc-ark WASM');
  }

  const wasmUri = vscode.Uri.joinPath(extensionUri, 'out', 'web', 'oxk.wasm');
  const workerUri = vscode.Uri.joinPath(extensionUri, 'out', 'web', 'wasi-worker.js');
  const wasmBytes = await vscode.workspace.fs.readFile(wasmUri);
  const sharedMemory = new WebAssembly.Memory({
    initial: 4000,
    maximum: 65536,
    shared: true,
  });
  const wasi = new WASI({ version: 'preview1' });

  const { napiModule } = instantiateNapiModuleSync(wasmBytes, {
    context: getDefaultContext(),
    asyncWorkPoolSize: 4,
    wasi,
    onCreateWorker() {
      return new Worker(workerUri.toString(true), {
        name: 'arkts-formatter-wasi',
        type: 'module',
      });
    },
    overwriteImports(importObject) {
      importObject.env = {
        ...importObject.env,
        ...importObject.napi,
        ...importObject.emnapi,
        memory: sharedMemory,
      };
      return importObject;
    },
    beforeInit({ instance }) {
      for (const name of Object.keys(instance.exports)) {
        if (name.startsWith('__napi_register__')) {
          const register = instance.exports[name];
          if (typeof register === 'function') {
            register();
          }
        }
      }
    },
  });

  const exports = napiModule.exports as unknown as OxcArkWasmExports;
  if (typeof exports.format !== 'function') {
    throw new Error('oxc-ark WASM 中未找到 format 导出');
  }
  return { format: exports.format };
}

export function createWebFormatterLoader(extensionUri: vscode.Uri): LoadFormatter {
  let formatter: Promise<ArktsFormatter> | undefined;
  return () => {
    formatter ??= loadWasmFormatter(extensionUri);
    return formatter;
  };
}
