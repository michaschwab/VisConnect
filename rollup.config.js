import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';

export default [''].map((name, index) => ({
    input: `./src/main${name}.ts`,
    plugins: [
        resolve(),
        commonJS({
            include: 'node_modules/**',
        }),
        typescript({lib: ['es5', 'es6', 'dom'], target: 'es5'}),
    ],
    output: {
        file: `visconnect-bundle${name}.js`,
        format: 'cjs',
    },
}));
