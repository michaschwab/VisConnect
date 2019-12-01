import typescript from 'rollup-plugin-typescript';

export default {
    input: './descvis.ts',
    plugins: [
        typescript({lib: ["es5", "es6", "dom"], target: "es5"})
    ],
    output: {
        file: 'descvis-bundle.js',
        format: 'cjs'
    }
}