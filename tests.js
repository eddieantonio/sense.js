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

assert.equal(sense.tokenizeJavaScript(simple).length, (() => {
  let model = new sense.TrigramModel(sense.ForwardSentences);

  model.learn(sense.tokenizeJavaScript(simple));

  return model.size;
})());


const train = `
$(document).ready(function () {
  $('form').submit(function (evt) {
    evt.preventDefault();
    $.ajax('/herp/derp', {
      method: 'GET',
      datatype: 'JSON',
      success: function () {
        alert('We did it!');
      },
      error: function () {
        alert('Boo! ajax failed');
      }
    });
  });
});
`;

/* A test case with a syntax error on line 5. */
const test = `$(document).ready(function () {
  $('button').click(function () {
    console.log('We did it!');
  };
});
`;

/* Test cross-entropies of infinity. */
(() => {
  let model = new sense.TrigramModel(sense.ForwardSentences);
  model.learn(sense.tokenizeJavaScript(train));

  let natural = model.computeContextCrossEntropy(['}', ')'], ';');
  let unnatural = model.computeContextCrossEntropy(['NUMBER', ')'], 'var');

  console.log(model);
  assert.ok(natural < Infinity);
  assert.ok(unnatural > natural);
})();

console.log('Test ok!');
/* eslint no-console: 0 */
