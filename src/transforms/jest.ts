import * as ts from 'typescript';
import { Collection } from '../collection';
import { File, API } from '../types';

const methodMap: { [key: string]: string } = {
  suite: 'describe',
  context: 'describe',
  specify: 'it',
  test: 'it',
  before: 'beforeAll',
  beforeEach: 'beforeEach',
  setup: 'beforeEach',
  after: 'afterAll',
  afterEach: 'afterEach',
  teardown: 'afterEach',
  suiteSetup: 'beforeAll',
  suiteTeardown: 'afterAll'
};

// const jestMethodsWithDescriptionsAllowed = new Set(['it', 'describe']);

const methodModifiers = ['only', 'skip'];

// function hasBinding(name, scope) {
//     if (!scope) {
//         return false;
//     }

//     const bindings = Object.keys(scope.getBindings()) || [];
//     if (bindings.indexOf(name) >= 0) {
//         return true;
//     }

//     return scope.isGlobal ? false : hasBinding(name, scope.parent);
// }

function findFunctionCall(ast: Collection<ts.Node, ts.Node>, mochaMethod: string):
    Collection<ts.CallExpression, ts.Node> {
  return ast
    .find(ts.SyntaxKind.CallExpression, {
      expression: {
        kind: ts.SyntaxKind.Identifier,
        text: mochaMethod
      }
    });
}

function findMochaMethodsWithModifier(ast: Collection<ts.Node, ts.Node>, mochaMethod: string, modifier: string):
    Collection<ts.CallExpression, ts.Node> {
  return ast
    .find(ts.SyntaxKind.CallExpression, {
      expression: {
        kind: ts.SyntaxKind.PropertyAccessExpression,
        expression: {
          kind: ts.SyntaxKind.Identifier,
          text: mochaMethod
        },
        name: {
          kind: ts.SyntaxKind.Identifier,
          text: modifier
        }
      }
    });
}

export default function mochaToJest(file: File, api: API): string {
  const t = api.tscodeshift;
  const ast = t(file.source);

  [...Object.keys(methodMap), 'it', 'test'].forEach(method => {
    findFunctionCall(ast, method)
      .find(ts.SyntaxKind.TypeReference, {
        typeName: {
          kind: ts.SyntaxKind.Identifier,
          text: 'MochaDone'
        }
      })
      .get(node => node.typeName)
      .replaceWith(() => {
        return ts.createQualifiedName(
          ts.createIdentifier('jest'),
          ts.createIdentifier('DoneCallback')
        );
      });
  });

  Object.keys(methodMap).forEach(mochaMethod => {
    const jestMethod = methodMap[mochaMethod];

    findFunctionCall(ast, mochaMethod)
      // .filter(({ scope }) => !hasBinding(mochaMethod, scope))
      .get(node => node.expression)
      .replaceWith(() => {
        // let args = node.arguments;
        // if (!jestMethodsWithDescriptionsAllowed.has(jestMethod)) {
        //     args = args.filter(a => a.kind !== ts.SyntaxKind.LiteralType);
        // }
        return ts.createIdentifier(jestMethod);
      });

    methodModifiers.forEach(modifier => {
      findMochaMethodsWithModifier(ast, mochaMethod, modifier)
        .get(node => (node.expression as ts.PropertyAccessExpression).expression)
        .replaceWith(() => ts.createIdentifier(jestMethod));
      findMochaMethodsWithModifier(ast, mochaMethod, modifier)
        .get(node => (node.expression as ts.PropertyAccessExpression).name)
        .replaceWith(() => ts.createIdentifier(modifier));
    });
  });

  return ast.toSource();
}
