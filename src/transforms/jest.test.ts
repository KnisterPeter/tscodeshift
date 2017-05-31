import { stripIndent } from 'common-tags';
import { applyTransforms } from '../transform';

import transform from './jest';

test('Convert mocha test to jest test', () => {
  const source = stripIndent`
    before(() => {
      // something
    });

    beforeEach(() => {
    });

    suite('Array', function() {
      setup(() => {
      });

      test('Array', (done: MochaDone) => {
        done();
      });

      specify.skip('Array', function(done) {
        done();
      });
    });

    describe('', () => {
      it('', (done: MochaDone) => {
      });
    });
  `;
  const expected = stripIndent`
    beforeAll(()=> {
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
      });
    });
  `;
  const actual = applyTransforms('path.ts', source, [transform]);
  expect(actual).toBe(expected);
});
