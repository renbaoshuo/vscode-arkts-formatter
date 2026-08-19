import * as vscode from 'vscode';
import {
  FormatterOptions,
  mergeFormatterOptions,
  normalizeFormatterOptions,
  parseFormatterConfig,
} from './config-core';

const CONFIG_NAMES = ['.oxfmtrc.json', '.oxfmtrc.jsonc'] as const;

export interface ResolvedFormatterConfiguration {
  options: FormatterOptions;
  source?: vscode.Uri;
}

async function isFile(uri: vscode.Uri): Promise<boolean> {
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    return Boolean(stat.type & (vscode.FileType.File | vscode.FileType.SymbolicLink));
  } catch {
    return false;
  }
}

function documentDirectory(uri: vscode.Uri): vscode.Uri {
  return vscode.Uri.joinPath(uri.with({ query: '', fragment: '' }), '..');
}

function normalizedUriPath(uri: vscode.Uri): string {
  return vscode.Uri.joinPath(uri.with({ query: '', fragment: '' }), '.').path;
}

function isAbsoluteFilePath(value: string): boolean {
  return value.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\');
}

function resolveExplicitConfig(
  configuredPath: string,
  document: vscode.TextDocument,
  folder: vscode.WorkspaceFolder | undefined,
): vscode.Uri {
  if (isAbsoluteFilePath(configuredPath) && document.uri.scheme === 'file') {
    return vscode.Uri.file(configuredPath);
  }

  const base = folder?.uri ?? documentDirectory(document.uri);
  return vscode.Uri.joinPath(base, configuredPath);
}

async function findNearestConfig(
  document: vscode.TextDocument,
  folder: vscode.WorkspaceFolder | undefined,
): Promise<vscode.Uri | undefined> {
  if (!folder || document.uri.scheme !== folder.uri.scheme || document.uri.authority !== folder.uri.authority) {
    return undefined;
  }

  const boundary = normalizedUriPath(folder.uri);
  let current = documentDirectory(document.uri);

  while (current.path === boundary || current.path.startsWith(`${boundary}/`)) {
    for (const name of CONFIG_NAMES) {
      const candidate = vscode.Uri.joinPath(current, name);
      if (await isFile(candidate)) {
        return candidate;
      }
    }

    if (current.path === boundary) {
      break;
    }

    const parent = vscode.Uri.joinPath(current, '..');
    if (parent.path === current.path) {
      break;
    }
    current = parent;
  }

  return undefined;
}

async function readConfig(uri: vscode.Uri): Promise<FormatterOptions> {
  const bytes = await vscode.workspace.fs.readFile(uri);
  const text = new TextDecoder('utf-8').decode(bytes);
  return parseFormatterConfig(text, uri.toString(true));
}

export async function resolveFormatterConfiguration(
  document: vscode.TextDocument,
): Promise<ResolvedFormatterConfiguration> {
  const configuration = vscode.workspace.getConfiguration('arktsFormatter', document.uri);
  const settingsOptions = normalizeFormatterOptions(configuration.get('config', {}));
  const configuredPath = configuration.get<string>('configPath', '').trim();
  const folder = vscode.workspace.getWorkspaceFolder(document.uri);

  let source: vscode.Uri | undefined;
  if (configuredPath) {
    source = resolveExplicitConfig(configuredPath, document, folder);
    if (!(await isFile(source))) {
      throw new Error(`找不到指定的格式化配置文件: ${source.toString(true)}`);
    }
  } else {
    source = await findNearestConfig(document, folder);
  }

  const fileOptions = source ? await readConfig(source) : undefined;
  const options = mergeFormatterOptions(settingsOptions, fileOptions);

  return { options, source };
}
