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

const esprima = require('esprima');
const assert = require('assert');


/**
 * Hard-code this n-gram order for now.
 */
const N_GRAM_ORDER = 3;


/**
 * A toy trigram model.
 */
class TrigramModel {
  constructor() {
    this._table = {};
  }

  /* TODO: predict(): give a token window, return a distribution. */
}

/**
 * ABC for yielding tokens.
 */
class Sentences {
  constructor(tokens) {
    this.tokens = tokens;
  }

  /**
   * Iterate over n-grams in this sentence.
   */
  *[Symbol.iterator]() {
    for (let i = 0; i < this.tokens.length; i++) {
      yield this.makeSentence(i);
    }
  }

  /**
   * Generates trigrams in the forwards direction.
   *
   * An adaptation of:
   * https://github.com/naturalness/sensibility/saner2018/sensibility/sentences.py
   */
  static *forward(tokens) {
    yield* new ForwardSentences(tokens);
  }

  get length() {
    return this.tokens.length;
  }
}

  /**
   * Generates forward trigrams.
   *
   * An translation of:
   * https://github.com/naturalness/sensibility/saner2018/sensibility/sentences.py#L81-L101
   */
class ForwardSentences extends Sentences {
  constructor(tokens) {
    super(tokens);
  }

  makeSentence(index) {
    const paddingToken = '<s>';
    const contextLength = N_GRAM_ORDER - 1;

    const tokens = this.tokens;
    assert.ok(0 <= index);
    assert.ok(index < tokens.length);

    const nextToken = tokens[index];
    const beginning = atLeast(0, index - contextLength);
    const realContext = tokens.slice(beginning, index);

    if (index < contextLength) {
      const padding = repeat(paddingToken, contextLength - index);
      return [Array.of(...padding, ...realContext), nextToken];
    } else {
      return [realContext, nextToken];
    }
  }
}

/**
 * Convert JavaScript source code (ES 5) to a list of tokens.
 */
function tokenizeJavaScript(sourceCode) {
  const tokens = esprima.tokenize(sourceCode);
  return tokens.map(({type, value}) => {
    switch (type) {
    case 'Punctuator':
    case 'Keyword':
      return value;
    case 'Identifier':
      return 'IDENTIFIER';
    default:
      throw new Error(`unknown token ${type}: ${value}`);
    }
  });
}

/**
 * Returns AT LEAST the minimum number specified.
 */
function atLeast(minimum, x) {
  // Dr. Hindle's favourite
  return Math.max(minimum, x);
}

/**
 * Yield the item /n/ times.
 */
function* repeat(item, n) {
  for (let i = 0; i < n; i++) {
    yield item;
  }
}

module.exports = {
  TrigramModel,
  tokenizeJavaScript,
  N_GRAM_ORDER,
  Sentences,
  ForwardSentences,
};
