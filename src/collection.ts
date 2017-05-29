import * as emitter from 'ts-emitter';
import * as ts from 'typescript';

export class Collection<T extends ts.Node> {

  private root: ts.SourceFile;

  private _nodes: T[];

  public static createRootCollection(root: ts.SourceFile): Collection<ts.SourceFile> {
    return new Collection<ts.SourceFile>([root], root);
  }

  private constructor(nodes: T[], root: ts.SourceFile) {
    this.root = root;
    this._nodes = nodes;
  }

  public find(kind: ts.SyntaxKind.Identifier): Collection<ts.Identifier>;
  public find(kind: ts.SyntaxKind): Collection<ts.Node> {
    const marked: ts.Node[] = [];
    const visitor = (node: ts.Node) => {
      if (node.kind === kind) {
        marked.push(node);
      } else {
        ts.forEachChild(node, visitor);
      }
    };
    this.nodes.forEach(node => {
      ts.forEachChild(node, visitor);
    });
    return new Collection(marked, this.root);
  }

  public replaceWith(fn: (node: T) => T): Collection<T> {
    const replacer = (context: ts.TransformationContext) => (rootNode: ts.SourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        const markedNode = this.nodes.find(item => item === node);
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

  public get nodes(): T[] {
    return this._nodes;
  }

  public toSource(): string {
    return emitter.toSource(this.root);
  }
}
