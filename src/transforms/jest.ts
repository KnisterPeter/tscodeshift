import * as ts from 'typescript';
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

export default function mochaToJest(file: File, api: API): string {
  const t = api.tscodeshift;
  const ast = t(file.source);

  Object.keys(methodMap).forEach(mochaMethod => {
    const jestMethod = methodMap[mochaMethod];

    ast
      .find(ts.SyntaxKind.CallExpression, {
        expression: {
          kind: ts.SyntaxKind.Identifier,
          text: mochaMethod
        }
      })
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
      ast
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
        })
        .get(node => (node.expression as ts.PropertyAccessExpression).expression)
        .replaceWith(() => ts.createIdentifier(jestMethod));
      ast
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
        })
        .get(node => (node.expression as ts.PropertyAccessExpression).name)
        .replaceWith(() => ts.createIdentifier(modifier));
    });
  });

  return ast.toSource();
}
