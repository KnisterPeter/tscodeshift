#!/usr/bin/env node
import * as fs from 'fs-extra';
import globby = require('globby');
import meow = require('meow');
import { applyTransforms } from './transform';
import * as types from './types';

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
    if (result !== source) {
      await fs.writeFile(path, result);
    }
  });
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
