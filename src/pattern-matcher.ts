import * as ts from 'typescript';

export function isPatternMatching(node: ts.Node, pattern: any): boolean {
  if (!matchProperty(node, 'kind', pattern)) {
    return false;
  }
  // tslint:disable-next-line cyclomatic-complexity
  switch (node.kind) {
    case ts.SyntaxKind.Identifier:
      return matchIdentifier(node as ts.Identifier, pattern);
    case ts.SyntaxKind.CallExpression:
      return matchCallExpression(node as ts.CallExpression, pattern);
    case ts.SyntaxKind.PropertyAccessExpression:
      return matchPropertyAccessExpression(node as ts.PropertyAccessExpression, pattern);
    case ts.SyntaxKind.FunctionExpression:
      return matchFunctionExpression(node as ts.FunctionExpression, pattern);
    case ts.SyntaxKind.TypeReference:
      return matchTypeReference(node as ts.TypeReferenceNode, pattern);
    default:
      throw new Error(`Pattern for ${ts.SyntaxKind[node.kind]} not implemented`);
  }
}

function matchFunctionExpression(_node: ts.FunctionExpression, _pattern: any): boolean {
  return true;
}

function matchPropertyAccessExpression(node: ts.PropertyAccessExpression, pattern: any): boolean {
  let matching = true;
  matching = matching && matchProperty(node, 'expression', pattern);
  matching = matching && matchProperty(node, 'name', pattern);
  return matching;
}

function matchIdentifier(node: ts.Identifier, pattern: {text: string}): boolean {
  return matchProperty(node, 'text', pattern);
}

function matchCallExpression(node: ts.CallExpression, pattern: any): boolean {
  return matchProperty(node, 'expression', pattern);
}

function matchTypeReference(node: ts.TypeReferenceNode, pattern: any): boolean {
  let matching = true;
  matching = matching && matchProperty(node, 'text', pattern);
  return matching;
}

// tslint:disable-next-line cyclomatic-complexity
function matchProperty(node: any, property: string, pattern: any, name = property): boolean {
  const patternValue = pattern[name];
  if (!patternValue) {
    return true;
  }
  const nodeValue = node[property];
  const hasValues = nodeValue && patternValue;
  if (typeof nodeValue === 'string' || typeof nodeValue === 'number') {
    if (nodeValue === patternValue) {
      return true;
    }
    return false;
  }
  return hasValues && isPatternMatching(node[property], pattern[name]);
}
