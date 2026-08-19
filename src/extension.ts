import * as vscode from 'vscode';
import { resolveFormatterConfiguration } from './config';
import { computeMinimalReplacement } from './edit';

type OxcArkFormatter = typeof import('@ohos-rs/oxk/format');

let formatterModule: Promise<OxcArkFormatter> | undefined;

function loadFormatter(): Promise<OxcArkFormatter> {
  formatterModule ??= import('@ohos-rs/oxk/format');
  return formatterModule;
}

function fileNameFor(document: vscode.TextDocument): string {
  if (document.uri.scheme === 'file') {
    return document.uri.fsPath;
  }
  return document.fileName.endsWith('.ets') ? document.fileName : `${document.fileName}.ets`;
}

class ArktsFormattingProvider implements vscode.DocumentFormattingEditProvider {
  constructor(private readonly output: vscode.OutputChannel) {}

  async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    _formattingOptions: vscode.FormattingOptions,
    token: vscode.CancellationToken,
  ): Promise<vscode.TextEdit[]> {
    try {
      const resolved = await resolveFormatterConfiguration(document);
      if (token.isCancellationRequested) {
        return [];
      }

      const formatter = await loadFormatter();
      const original = document.getText();
      const result = await formatter.format(fileNameFor(document), original, resolved.options);

      if (token.isCancellationRequested) {
        return [];
      }

      if (result.errors.length > 0) {
        const configMessage = resolved.source ? ` (配置: ${resolved.source.toString(true)})` : '';
        throw new Error(`${result.errors.join('\n')}${configMessage}`);
      }

      const replacement = computeMinimalReplacement(original, result.code);
      if (!replacement) {
        return [];
      }

      return [
        vscode.TextEdit.replace(
          new vscode.Range(document.positionAt(replacement.start), document.positionAt(replacement.end)),
          replacement.text,
        ),
      ];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.output.appendLine(`[${new Date().toISOString()}] ${document.uri.toString(true)}`);
      this.output.appendLine(message);
      this.output.show(true);
      void vscode.window.showErrorMessage(`ArkTS Formatter: ${message.split('\n', 1)[0]}`);
      return [];
    }
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('ArkTS Formatter');
  const selector: vscode.DocumentSelector = [
    { language: 'arkts' },
    { language: 'ets' },
    { scheme: 'file', pattern: '**/*.ets' },
  ];

  context.subscriptions.push(
    output,
    vscode.languages.registerDocumentFormattingEditProvider(selector, new ArktsFormattingProvider(output)),
  );
}

export function deactivate(): void {}
