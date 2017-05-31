import * as ts from 'typescript';
import { Collection } from './collection';
import * as types from './types';

const api = {
  tscodeshift: (source: string|ts.Node) => {
    if (typeof source === 'string') {
      return Collection.fromSource(source);
    } else {
      return Collection.fromNode(source);
    }
  }
};

/* @internal */
export function applyTransforms(path: string, source: string, transforms: types.Transform[]): string {
  const file: types.File = {
    path,
    source
  };
  return transforms
    .reduce((file, transform) => {
      return {
        path: file.path,
        source: transform(file, api)
      };
    }, file)
    .source;
}
