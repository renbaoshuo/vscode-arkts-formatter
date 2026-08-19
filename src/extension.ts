import * as vscode from 'vscode';
import { activateFormatter, ArktsFormatter } from './extension-common';

let formatterModule: Promise<ArktsFormatter> | undefined;

function loadFormatter(): Promise<ArktsFormatter> {
  formatterModule ??= import('@ohos-rs/oxk/format');
  return formatterModule;
}

export function activate(context: vscode.ExtensionContext): void {
  activateFormatter(context, loadFormatter);
}

export function deactivate(): void {}
