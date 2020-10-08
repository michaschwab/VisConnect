import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';

export default {
    input: `./tests/protocol.test.ts`,
    plugins: [
        resolve(),
        commonJS({
            include: 'node_modules/**',
        }),
        typescript({lib: ['es5', 'es6', 'dom'], target: 'es5'}),
    ],
    output: {
        file: `visconnect-test-bundle.js`,
        format: 'cjs',
    },
};
