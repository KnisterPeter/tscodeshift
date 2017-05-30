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
