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

const assert = require('assert');
const esprima = require('esprima');


/**
 * Hard-code this n-gram order for now.
 */
const N_GRAM_ORDER = 3;


/**
 * A toy trigram model.
 */
class TrigramModel {
  constructor(sentenceFactory) {
    assert.ok(new sentenceFactory([]) instanceof Sentences);
    this.sentenceFactory = sentenceFactory;
    /*
     * Maps contexts to a bag of words (counter) for each adjacent token.
     * e.g.,
     * Map([
     *  [['I', 'love'], {you: 13, bacon: 2, the: 6}],
     *  [['I', 'got'],  {distracted: 4, '900exp': 1, caught: 1}],
     *  [['I', 'want'],  {a: 14, to: 7}]
     * ])
     */
    this._table = new Map();
  }

  /* TODO: predict(): give a token window, return a distribution. */

  learn(tokens) {
    let sentences = new this.sentenceFactory(tokens);
    for (let [context, adjacent] of sentences) {
      let counter = this._table.get(context) || new BagOfWords;
      counter.increase(adjacent);
      this._table.set(context, counter);
    }
  }

  computeContextCrossEntropy(context, adjacent) {
    assert.equal(N_GRAM_ORDER - 1, context.length);
    let bag = this._table.get(context);

    /* The context has never been seen in the corpus: */
    if (!bag) {
      return Infinity;
    }

    return bag.crossEntropyOf(adjacent);
  }

  get size() {
    return this._table.size;
  }
}

/**
 * Counts words.
 * Can return probability distributions.
 */
class BagOfWords {
  constructor() {
    this._bag = {};
  }

  /**
   * @return this
   */
  increase(token) {
    this._bag[token] = 1 + (this._bag[token] || 0);
    return this;
  }
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
  static *forwards(tokens) {
    yield* new ForwardSentences(tokens);
  }

  /**
   * Generates trigrams in the backwards direction.
   *
   * An adaptation of:
   * https://github.com/naturalness/sensibility/saner2018/sensibility/sentences.py
   */
  static *backwards(tokens) {
    yield* new BackwardSentences(tokens);
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
class BackwardSentences extends Sentences {
  constructor(tokens) {
    super(tokens);
  }

  makeSentence(index) {
    const paddingToken = '</s>';
    const contextLength = N_GRAM_ORDER - 1;

    const tokens = this.tokens;
    assert.ok(0 <= index);
    assert.ok(index < tokens.length);

    const prevToken = tokens[index];
    const cStart = index + 1;
    const cEnd = cStart + contextLength;
    const realContext = tokens.slice(cStart, cEnd);

    if (cEnd > tokens.length) {
      const padding = repeat(paddingToken, cEnd - tokens.length);
      return [Array.of(...realContext, ...padding), prevToken];
    } else {
      return [realContext, prevToken];
    }
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
    case 'String':
      return 'STRING';
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
  BackwardSentences,
};
