import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default [''].map((name, index) => ({
    input: `./src/main${name}.ts`,
    plugins: [
        resolve(),
        commonJS({
            include: 'node_modules/**',
        }),
        typescript({lib: ['es5', 'es6', 'dom'], target: 'es5'}),
        sourcemaps(),
    ],
    output: {
        sourcemap: true,
        file: `visconnect-bundle${name}.js`,
        format: 'cjs',
    },
}));
