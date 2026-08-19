declare module '@napi-rs/wasm-runtime' {
  export class WASI {
    constructor(options?: {
      version?: string;
      print?: (...args: unknown[]) => void;
      printErr?: (...args: unknown[]) => void;
    });
  }

  interface InstantiateOptions {
    context?: unknown;
    asyncWorkPoolSize?: number;
    childThread?: boolean;
    wasi: WASI;
    onCreateWorker?: () => Worker;
    overwriteImports?: (
      imports: Record<string, Record<string, WebAssembly.ImportValue>>,
    ) => Record<string, Record<string, WebAssembly.ImportValue>>;
    beforeInit?: (value: { instance: WebAssembly.Instance }) => void;
  }

  export function getDefaultContext(): unknown;
  export function instantiateNapiModuleSync(
    wasm: BufferSource | WebAssembly.Module,
    options: InstantiateOptions,
  ): {
    instance: WebAssembly.Instance;
    module: WebAssembly.Module;
    napiModule: { exports: Record<string, unknown> };
  };
}
