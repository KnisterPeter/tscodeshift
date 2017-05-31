import * as emitter from 'ts-emitter';
import * as ts from 'typescript';
import { isPatternMatching } from './pattern-matcher';

export class Collection<T extends ts.Node, R extends ts.Node> {

  private _root: Collection<R, R>|undefined;

  protected collected: T[];

  public static fromSource(source: string): Collection<ts.SourceFile, ts.SourceFile> {
    const file = emitter.fromSource(source);
    return new Collection<ts.SourceFile, ts.SourceFile>([file]);
  }

  public static fromNode<T extends ts.Node>(node: T): Collection<T, T> {
    return new Collection<T, T>([node]);
  }

  private constructor(collected: T[], root?: Collection<R, R>) {
    this._root = root;
    this.collected = collected;
  }

  private get root(): Collection<R, R> {
    return this._root || (this as any);
  }

  protected get rootNode(): R {
    return this.root.collected[0];
  }

  protected set rootNode(node: R) {
    this.root.collected[0] = node;
  }

  public find(kind: ts.SyntaxKind.Identifier, pattern?: IdentifierPattern): Collection<ts.Identifier, R>;
  public find(kind: ts.SyntaxKind.FunctionDeclaration): Collection<ts.FunctionDeclaration, R>;
  public find(kind: ts.SyntaxKind.FunctionExpression): Collection<ts.FunctionExpression, R>;
  public find(kind: ts.SyntaxKind.CallExpression, pattern?: CallExpressionPattern): Collection<ts.CallExpression, R>;
  public find(kind: ts.SyntaxKind.VariableDeclarationList): Collection<ts.VariableDeclarationList, R>;
  public find(kind: ts.SyntaxKind.VariableDeclaration): Collection<ts.VariableDeclaration, R>;
  public find(kind: ts.SyntaxKind, pattern?: any): Collection<ts.Node, R> {
    const marked: ts.Node[] = [];
    const visitor = (node: ts.Node) => {
      if (node.kind === kind) {
        if (pattern && isPatternMatching(node, pattern)) {
          marked.push(node);
        } else if (!pattern) {
          marked.push(node);
        } else {
          ts.forEachChild(node, visitor);
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

  public get<U extends ts.Node>(fn: (node: T) => U|undefined): Collection<U, R> {
    const marked: U[] = [];
    this.collected.forEach(node => {
      const result = fn(node);
      if (result) {
        marked.push(result);
      }
    });
    return new Collection<U, R>(marked, this.root);
  }

  public filter(fn: (node: T) => boolean): Collection<T, R> {
    const marked: T[] = [];
    this.collected.forEach(node => {
      if (fn(node)) {
        marked.push(node);
      }
    });
    return new Collection(marked, this.root);
  }

  public replaceWith(fn: (node: T) => ts.Node): this {
    const replacer = (context: ts.TransformationContext) => (rootNode: R) => {
      const visitor = (node: ts.Node): ts.Node => {
        const markedNode = this.collected.find(item => item === node);
        if (markedNode) {
          const replaced = fn(markedNode);
          if (replaced !== markedNode) {
            (replaced as any).original = markedNode;
            if ((replaced as any).text && (replaced as any).text !== (markedNode as any).text) {
              (replaced as any).newText = (replaced as any).text;
            }
          }
          return replaced;
        }
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(rootNode, visitor);
    };
    this.rootNode = ts.transform(this.rootNode, [replacer]).transformed[0];
    return this;
  }

  public forEach(fn: (node: T) => void): this {
    this.collected.forEach(node => fn(node));
    return this;
  }

  public size(): number {
    return this.collected.length;
  }

  public toSource(): string {
    if (this.rootNode.kind !== ts.SyntaxKind.SourceFile) {
      throw new Error(`toSource() could only be called on collections of type `
        + `'SourceFile' but this is of type '${ts.SyntaxKind[this.rootNode.kind]}'`);
    }
    return emitter.toSource(this.rootNode as any);
  }
}

export interface IdentifierPattern {
  text: string;
}

export interface CallExpressionPattern {
  expression: any;
}
