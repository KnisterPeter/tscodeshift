import { join } from 'path';
import transform from './identifiers.test-transform';
import { applyTransforms } from './index';

test('run identifiers.transform', async() => {
  const inputPath = join(process.cwd(), 'src', '__fixtures__', 'identifiers.ts');
  const result = await applyTransforms(inputPath, [transform]);

  expect(result.trim()).toBe('export function tset(): void {}');
});
