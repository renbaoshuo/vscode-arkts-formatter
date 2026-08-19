import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeFormatterOptions, normalizeFormatterOptions, parseFormatterConfig } from '../src/config-core';

test('parses JSONC formatter configuration', () => {
  const config = parseFormatterConfig(
    `{
      // Comments and trailing commas are supported.
      "$schema": "https://example.invalid/schema.json",
      "singleQuote": true,
      "printWidth": 100,
    }`,
    '.oxfmtrc.jsonc',
  );

  assert.deepEqual(config, { singleQuote: true, printWidth: 100 });
});

test('file options take precedence over VS Code settings per key', () => {
  const options = mergeFormatterOptions(
    { singleQuote: false, printWidth: 80 },
    { singleQuote: true, semi: false },
  );

  assert.deepEqual(options, { singleQuote: true, printWidth: 80, semi: false });
});

test('normalizes invalid settings values to an empty object', () => {
  assert.deepEqual(normalizeFormatterOptions(null), {});
  assert.deepEqual(normalizeFormatterOptions(['not', 'an', 'object']), {});
});

test('rejects non-object formatter configuration', () => {
  assert.throws(() => parseFormatterConfig('[]', '.oxfmtrc.json'), /顶层值必须是 JSON 对象/);
});
