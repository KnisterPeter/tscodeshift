import * as emitter from 'ts-emitter';
import * as ts from 'typescript';
import { Collection } from './collection';

describe('Collection', () => {
  describe('#fromNode', () => {
    it('should return a valid Collection given a source AST', () => {
      const node = emitter.fromSource(`var a: number = 0;`);
      const actual = Collection.fromNode(node).size();
      expect(actual).toBe(1);
    });
  });
  describe('#find', () => {
    describe('with SyntaxKind.Identifier', () => {
      it('should collect all Identifers', () => {
        const source = `
          function ident1(): void {}
          class Ident2 {}
          let ident3: string|undefined;
          const ident4 = () => undefined;
        `;
        const collection = Collection.fromSource(source);

        const actual = collection
          .find(ts.SyntaxKind.Identifier)
          .size();

        expect(actual).toBe(5);
      });

      it('should collect all Identifers match the given pattern', () => {
        const source = `
          function fn1(a: string): void {}
          function fn2(a: string): void {}
        `;
        const collection = Collection.fromSource(source);

        const actual = collection
          .find(ts.SyntaxKind.Identifier, {text: 'a'})
          .size();

        expect(actual).toBe(2);
      });
    });
    describe('with SyntaxKind.CallExpression', () => {
      it('should collect all expressions matching the given callee', () => {
        const source = `
          const a = function() {}.bind(this);
          const b = function() {}.bound(this);
          b.bind(this);
        `;
        const collection = Collection.fromSource(source);
        const actual = collection
          .find(ts.SyntaxKind.CallExpression, {
            expression: {
              expression: {
                kind: ts.SyntaxKind.FunctionExpression
              },
              name: {
                text: 'bind'
              }
            }
          })
          .size();

        expect(actual).toBe(1);
      });
    });
  });
  describe('#filter', () => {
    it('should return a collection of nodes matching the given filter', () => {
      const source = `
        function fn1(a: string): void {}
        function fn2(a: string): void {}
      `;
      const collection = Collection.fromSource(source);

      const actual = collection
        .find(ts.SyntaxKind.FunctionDeclaration)
        .filter(node => node.name!.text === 'fn1')
        .size();

      expect(actual).toBe(1);
    });
  });
  describe('#get', () => {
    it('should return a subtree of found nodes', () => {
      const source = `
        function fn1(a: string): void {}
        function fn2(a: string): void {}
      `;
      const collection = Collection.fromSource(source);

      const actual = collection
        .find(ts.SyntaxKind.FunctionDeclaration)
        .get(node => node.name)
        .size();

      expect(actual).toBe(2);
    });
  });
});
