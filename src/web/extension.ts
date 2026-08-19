import * as vscode from 'vscode';
import { activateFormatter } from '../extension-common';
import { createWebFormatterLoader } from './formatter';

export function activate(context: vscode.ExtensionContext): void {
  activateFormatter(context, createWebFormatterLoader(context.extensionUri));
}

export function deactivate(): void {}
