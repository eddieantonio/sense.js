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

module.exports = {
  TrigramModel,
  tokenizeJavaScript,
};
