/* global test, expect, afterEach */
const execa = require('execa')
const path = require('path')

const CLI = path.resolve(__dirname, `./dist/src/index.js`)

test(`tscodeshift should run files relative to the current working directory`, () => {
  expect.assertions(1)
  return execa.shell(
    `cp mocha.fixture.to-copy mocha.fixture.ts && node ${CLI} -t ./dist/src/transforms/mocha.js 'mocha.fixture.ts' && cat mocha.fixture.ts`
  ).then((results) => {
    expect(results.stdout).toBe(`beforeAll(()=> {
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
});`)
  })
})

afterEach(() => {
  return execa.shell(`rm mocha.fixture.ts`)
})
