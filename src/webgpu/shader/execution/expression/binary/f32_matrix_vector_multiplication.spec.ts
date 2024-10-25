export const description = `
Execution Tests for matrix-vector and vector-matrix f32 multiplication expression
`;

import { makeTestGroup } from '../../../../../common/framework/test_group.js';
import { GPUTest } from '../../../../gpu_test.js';
import { Type } from '../../../../util/conversion.js';
import { allInputSources, run } from '../expression.js';

import { binary, compoundBinary } from './binary.js';
import { d } from './f32_matrix_vector_multiplication.cache.js';

export const g = makeTestGroup(GPUTest);

g.test('matrix_vector')
  .specURL('https://www.w3.org/TR/WGSL/#floating-point-evaluation')
  .desc(
    `
Expression: x * y, where x is a matrix and y is a vector
Accuracy: Correctly rounded
`
  )
  .params(u =>
    u
      .combine('inputSource', allInputSources)
      .combine('cols', [2, 3, 4] as const)
      .combine('rows', [2, 3, 4] as const)
  )
  .fn(async t => {
    const cols = t.params.cols;
    const rows = t.params.rows;
    const cases = await d.get(
      t.params.inputSource === 'const'
        ? `mat${cols}x${rows}_vec${cols}_const`
        : `mat${cols}x${rows}_vec${cols}_non_const`
    );
    await run(
      t,
      binary('*'),
      [Type.mat(cols, rows, Type.f32), Type.vec(cols, Type.f32)],
      Type.vec(rows, Type.f32),
      t.params,
      cases
    );
  });

g.test('vector_matrix')
  .specURL('https://www.w3.org/TR/WGSL/#floating-point-evaluation')
  .desc(
    `
Expression: x * y, where x is a vector and y is is a matrix
Accuracy: Correctly rounded
`
  )
  .params(u =>
    u
      .combine('inputSource', allInputSources)
      .combine('cols', [2, 3, 4] as const)
      .combine('rows', [2, 3, 4] as const)
  )
  .fn(async t => {
    const cols = t.params.cols;
    const rows = t.params.rows;
    const cases = await d.get(
      t.params.inputSource === 'const'
        ? `vec${rows}_mat${cols}x${rows}_const`
        : `vec${rows}_mat${cols}x${rows}_non_const`
    );
    await run(
      t,
      binary('*'),
      [Type.vec(rows, Type.f32), Type.mat(cols, rows, Type.f32)],
      Type.vec(cols, Type.f32),
      t.params,
      cases
    );
  });

g.test('vector_matrix_compound')
  .specURL('https://www.w3.org/TR/WGSL/#floating-point-evaluation')
  .desc(
    `
Expression: x *= y, where x is a vector and y is is a matrix
Accuracy: Correctly rounded
`
  )
  .params(u => u.combine('inputSource', allInputSources).combine('dim', [2, 3, 4] as const))
  .fn(async t => {
    const cols = t.params.dim;
    const rows = t.params.dim;
    const cases = await d.get(
      t.params.inputSource === 'const'
        ? `vec${rows}_mat${cols}x${rows}_const`
        : `vec${rows}_mat${cols}x${rows}_non_const`
    );
    await run(
      t,
      compoundBinary('*='),
      [Type.vec(rows, Type.f32), Type.mat(cols, rows, Type.f32)],
      Type.vec(cols, Type.f32),
      t.params,
      cases
    );
  });
