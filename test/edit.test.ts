import assert from 'node:assert/strict';
import test from 'node:test';
import { computeMinimalReplacement } from '../src/edit';

test('returns no replacement for unchanged text', () => {
  assert.equal(computeMinimalReplacement('same', 'same'), undefined);
});

test('computes a minimal middle replacement', () => {
  assert.deepEqual(computeMinimalReplacement('const x=1;\n', 'const x = 1;\n'), {
    start: 7,
    end: 8,
    text: ' = ',
  });
});

test('handles a final newline insertion', () => {
  assert.deepEqual(computeMinimalReplacement('value', 'value\n'), {
    start: 5,
    end: 5,
    text: '\n',
  });
});
