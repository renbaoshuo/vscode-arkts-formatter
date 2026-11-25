import assert from 'node:assert/strict';
import test from 'node:test';
import { format } from '@ohos-rs/oxk/format';

test('formats an ArkTS file with oxc-ark options', async () => {
  const result = await format('Index.ets', 'const message="hello"\n', {
    singleQuote: true,
    semi: false,
  });

  assert.deepEqual(result.errors, []);
  assert.match(result.code, /const message = 'hello'/);
});

test('formats an ArkTS 1.2 (Static ETS) file when lang is ets-static', async () => {
  const result = await format('Static.ets', 'final class Demo { final run(): void {} }\n', {
    lang: 'ets-static',
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.code, 'final class Demo {\n  final run(): void {}\n}\n');
});
