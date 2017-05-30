#!/usr/bin/env node
import * as fs from 'fs-extra';
import globby = require('globby');
import meow = require('meow');
import * as emitter from 'ts-emitter';
import { Collection } from './collection';
import * as types from './types';

const api = {
  tscodeshift: (source: string) => {
    return Collection.createRootCollection(emitter.fromSource(source));
  }
};

async function main(cli: meow.Result): Promise<void> {
  const transformPaths = [].concat(
    cli.flags['t'] || [],
    cli.flags['transform'] || []
  );
  const transforms: types.Transform[] = transformPaths.map(path => require(path).default);
  const paths = await globby(cli.input);
  paths.forEach(async path => {
    const source = (await fs.readFile(path)).toString();
    const result = applyTransforms(path, source, transforms);
    await fs.writeFile(path, result);
  });
}

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

const cli = meow(`
  Usage: tscodeshift <path>... [options]

  path     Files or directory to transform

  Options:
    -t FILE, --transform FILE   Path to the transform file. Can be either a local path or url  [./transform.js]
`);

main(cli)
.catch(e => {
  console.log('Failed to run tscodeshift.', e, e.stack);
  process.exit(1);
});
