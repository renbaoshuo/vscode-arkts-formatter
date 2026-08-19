import { parse, ParseError, printParseErrorCode } from 'jsonc-parser';

export type FormatterOptions = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseFormatterConfig(text: string, source: string): FormatterOptions {
  const errors: ParseError[] = [];
  const value: unknown = parse(text, errors, {
    allowEmptyContent: false,
    allowTrailingComma: true,
    disallowComments: false,
  });

  if (errors.length > 0) {
    const details = errors.map((error) => `${printParseErrorCode(error.error)} at offset ${error.offset}`).join(', ');
    throw new Error(`无法解析 ${source}: ${details}`);
  }

  if (!isRecord(value)) {
    throw new Error(`${source} 的顶层值必须是 JSON 对象`);
  }

  const { $schema: _schema, ...options } = value;
  return options;
}

export function normalizeFormatterOptions(value: unknown): FormatterOptions {
  return isRecord(value) ? { ...value } : {};
}

export function mergeFormatterOptions(
  settingsOptions: FormatterOptions,
  fileOptions?: FormatterOptions,
): FormatterOptions {
  return fileOptions ? { ...settingsOptions, ...fileOptions } : { ...settingsOptions };
}
