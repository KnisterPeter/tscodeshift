import * as ts from 'typescript';
import { Collection } from './collection';

export type Transform = (file: File, api: API) => string;

export interface File {
  path: string;
  source: string;
}

export interface API {
  tscodeshift: TSCodeShift;
}

export interface TSCodeShift {
  (source: string): Collection<ts.SourceFile>;
}
