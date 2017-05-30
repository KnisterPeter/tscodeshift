import { stripIndent } from 'common-tags';
import * as ts from 'typescript';
import { applyTransforms } from './index';
import * as types from './types';

test('run identifiers transform', () => {
  /**
   * Example tscodeshift transformer. Simply reverses the names of all
   * identifiers.
   */
  function identifiersTransform(file: types.File, api: types.API): string {
    const t = api.tscodeshift;

    return t(file.source)
      .find(ts.SyntaxKind.Identifier)
      .replaceWith(
        node => ts.createIdentifier(node.text.split('').reverse().join(''))
      )
      .toSource();
  }
  const source = stripIndent`
    export function test(): void {
      var abc;
    }
  `;
  const expected = stripIndent`
    export function tset(): void {
      var cba;
    }
  `;

  const actual = applyTransforms('path.ts', source, [identifiersTransform]);

  expect(actual).toBe(expected);
});
