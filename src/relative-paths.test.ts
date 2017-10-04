/* global test, expect, afterEach */
import execa = require('execa');
import * as path from 'path';
const shell = ((execa as any).shell);
const cwd = process.cwd();
const CLI = path.resolve(cwd, `./dist/src/index.js`);

interface Results {
  stdout: string;
}

const expectedFixture = `beforeAll(()=> {
  // something
});

beforeEach(()=> {
});

describe('Array', function() {
  beforeEach(()=> {
  });

  it('Array', (done: jest.DoneCallback) => {
    done();
  });

  it.skip('Array', function(done) {
    done();
  });
});

describe('', () => {
  it('', (done: jest.DoneCallback) => {
    done();
  });
});`;

test(`tscodeshift should run files relative to the current working directory`, () => {
  expect.assertions(1);
  return shell([
    `cp mocha.fixture.to-copy mocha.fixture.ts`,
    `node ${CLI} -t ./dist/src/transforms/mocha.js 'mocha.fixture.ts'`,
    `cat mocha.fixture.ts`
  ].join(` && `)).then((results: Results) => {
    expect(results.stdout).toBe(expectedFixture);
  });
});

afterEach(() => shell(`rm mocha.fixture.ts`));
