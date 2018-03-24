const assert = require('assert');

const sense = require('.');

/**
 * Tests
 */

const simple = `function hello() {
}
`;

assert.deepEqual([
  'function', 'IDENTIFIER', '(', ')', '{', '}'
],
  sense. tokenizeJavaScript(simple)
);

console.log('Test ok!');
/* eslint no-console: 0 */
