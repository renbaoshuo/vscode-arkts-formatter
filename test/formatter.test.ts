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
