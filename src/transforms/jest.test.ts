import { stripIndent } from 'common-tags';
import { applyTransforms } from '../transform';

import transform from './jest';

test('Convert mocha test to jest test', () => {
  const source = stripIndent`
    before(() => {
      // something
    });

    suite('Array', function() {
      setup(() => {
      });

      specify.skip('Array', function(done) {
        done();
      });
    });
  `;
  const expected = stripIndent`
    beforeAll(()=> {
      // something
    });

    describe('Array', function() {
      beforeEach(()=> {
      });

      it.skip('Array', function(done) {
        done();
      });
    });
  `;
  const actual = applyTransforms('path.ts', source, [transform]);
  expect(actual).toBe(expected);
});
