import * as ts from 'typescript';
import * as types from './types';

/**
 * Example tscodeshift transformer. Simply reverses the names of all
 * identifiers.
 */
export default function(file: types.File, api: types.API): string {
  const t = api.tscodeshift;

  return t(file.source)
    .find(ts.SyntaxKind.Identifier)
    .replaceWith(
      node => ts.createIdentifier(node.text.split('').reverse().join(''))
    )
    .toSource();
}
