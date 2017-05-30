import * as emitter from 'ts-emitter';
import * as ts from 'typescript';

export class Collection<T extends ts.Node> {

  private root: ts.SourceFile;

  private collected: T[];

  public static createCollectionFromSource(source: string): Collection<ts.SourceFile> {
    const file = emitter.fromSource(source);
    return new Collection<ts.SourceFile>([file], file);
  }

  private constructor(collected: T[], root: ts.SourceFile) {
    this.root = root;
    this.collected = collected;
  }

  public find(kind: ts.SyntaxKind.Identifier, pattern?: {name: string}): Collection<ts.Identifier>;
  public find(kind: ts.SyntaxKind.FunctionDeclaration): Collection<ts.FunctionDeclaration>;
  public find(kind: ts.SyntaxKind, pattern?: any): Collection<ts.Node> {
    const marked: ts.Node[] = [];
    const visitor = (node: ts.Node) => {
      if (node.kind === kind) {
        if (pattern) {
          switch (node.kind) {
            case ts.SyntaxKind.Identifier:
              this.matchIdentifier(marked, node as ts.Identifier, pattern);
          }
        } else {
          marked.push(node);
        }
      } else {
        ts.forEachChild(node, visitor);
      }
    };
    this.collected.forEach(node => {
      ts.forEachChild(node, visitor);
    });
    return new Collection(marked, this.root);
  }

  private matchIdentifier(marked: ts.Node[], node: ts.Identifier, pattern: {name: string}): void {
    if (node.text === pattern.name) {
      marked.push(node);
    }
  }

  public filter(fn: (node: T) => boolean): Collection<T> {
    const marked: T[] = [];
    this.collected.forEach(node => {
      if (fn(node)) {
        marked.push(node);
      }
    });
    return new Collection(marked, this.root);
  }

  public replaceWith(fn: (node: T) => ts.Node): Collection<T> {
    const replacer = (context: ts.TransformationContext) => (rootNode: ts.SourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        const markedNode = this.collected.find(item => item === node);
        if (markedNode) {
          const replaced = fn(markedNode);
          (replaced as any).original = markedNode;
          if ((replaced as any).text && (replaced as any).text !== (markedNode as any).text) {
            (replaced as any).newText = (replaced as any).text;
          }
          return replaced;
        }
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(rootNode, visitor);
    };
    this.root = ts.transform(this.root, [replacer]).transformed[0];
    return this;
  }

  public size(): number {
    return this.collected.length;
  }

  public toSource(): string {
    return emitter.toSource(this.root);
  }
}
