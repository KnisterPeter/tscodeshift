import * as emitter from 'ts-emitter';
import * as ts from 'typescript';
import { isPatternMatching } from './pattern-matcher';

export class Collection<T extends ts.Node> {

  private root: T;

  private collected: T[];

  public static fromSource(source: string): Collection<ts.SourceFile> {
    const file = emitter.fromSource(source);
    return new Collection([file], file);
  }

  public static fromNode<T extends ts.Node>(node: T): Collection<T> {
    return new Collection([node], node);
  }

  private constructor(collected: T[], root: T) {
    this.root = root;
    this.collected = collected;
  }

  public find(kind: ts.SyntaxKind.Identifier, pattern?: IdentifierPattern): Collection<ts.Identifier>;
  public find(kind: ts.SyntaxKind.FunctionDeclaration): Collection<ts.FunctionDeclaration>;
  public find(kind: ts.SyntaxKind.FunctionExpression): Collection<ts.FunctionExpression>;
  public find(kind: ts.SyntaxKind.CallExpression, pattern?: CallExpressionPattern): Collection<ts.CallExpression>;
  public find(kind: ts.SyntaxKind, pattern?: any): Collection<ts.Node> {
    const marked: ts.Node[] = [];
    const visitor = (node: ts.Node) => {
      if (node.kind === kind) {
        if (pattern && isPatternMatching(node, pattern)) {
          marked.push(node);
        } else if (!pattern) {
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
    const replacer = (context: ts.TransformationContext) => (rootNode: T) => {
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
    if (this.root.kind !== ts.SyntaxKind.SourceFile) {
      throw new Error(`toSource() could only be called on collections of type `
        + `'ts.SourceFile' but this is of type '${ts.SyntaxKind[this.root.kind]}'`);
    }
    return emitter.toSource(this.root as any);
  }
}

export interface IdentifierPattern {
  text: string;
}

export interface CallExpressionPattern {
  expression: any;
}
