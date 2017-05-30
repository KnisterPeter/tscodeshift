import * as ts from 'typescript';
import { Collection } from './collection';

describe('Collection#find', () => {
  describe('with SyntaxKind.Identifier', () => {
    it('should collect all Identifers', () => {
      const source = `
        function ident1(): void {}
        class Ident2 {}
        let ident3: string|undefined;
        const ident4 = () => undefined;
      `;
      const collection = Collection.createCollectionFromSource(source);

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
      const collection = Collection.createCollectionFromSource(source);

      const actual = collection
        .find(ts.SyntaxKind.Identifier, {name: 'a'})
        .size();

      expect(actual).toBe(2);
    });
  });
});
describe('Collection#filter', () => {
  it('should return a collection of nodes matching the given filter', () => {
    const source = `
      function fn1(a: string): void {}
      function fn2(a: string): void {}
    `;
    const collection = Collection.createCollectionFromSource(source);

    const actual = collection
      .find(ts.SyntaxKind.FunctionDeclaration)
      .filter(node => node.name!.text === 'fn1')
      .size();

    expect(actual).toBe(1);
  });
});
