/*
 * Copyright (C) 2018  Eddie Antonio Santos <easantos@ualberta.ca>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Simple tests for sensibility.
 *
 * TODO: use ava.
 * TODO: property-based testing.
 */
const assert = require('assert');

const sense = require('.');


const simple = `function hello() {
}
`;

/* Simple tokenization. */
assert.deepEqual(
  ['function', 'IDENTIFIER', '(', ')', '{', '}'],
  sense.tokenizeJavaScript(simple)
);

/* Simple tri-grams. */
assert.deepEqual(
  [
    [['<s>', '<s>'], 'function'],
    [['<s>', 'function'], 'IDENTIFIER'],
    [['function', 'IDENTIFIER'], '('],
    [['IDENTIFIER', '('], ')'],
    [['(', ')'], '{'],
    [[')', '{'], '}'],
  ],
  Array.from(sense.Sentences.forwards(
    sense.tokenizeJavaScript(simple)
  ))
);

/* Backwards tri-grams. */
assert.deepEqual(
  [
    [['IDENTIFIER', '('], 'function'],
    [['(', ')'], 'IDENTIFIER'],
    [[')', '{'], '('],
    [['{', '}'], ')'],
    [['}', '</s>'], '{'],
    [['</s>', '</s>'], '}'],
  ],
  Array.from(sense.Sentences.backwards(
    sense.tokenizeJavaScript(simple)
  ))
);


console.log('Test ok!');
/* eslint no-console: 0 */
