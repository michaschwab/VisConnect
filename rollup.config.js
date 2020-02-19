import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs'

export default [''].map((name, index) => ({
    input: `./main${name}.ts`,
    plugins: [
        resolve(),
        commonJS({
            include: 'node_modules/**'
        }),
        typescript({lib: ["es5", "es6", "dom"], target: "es5"})
    ],
    output: {
        file: `descvis-bundle${name}.js`,
        format: 'cjs'
    }
}));