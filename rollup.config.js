const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript');

const config = {
  input: 'src/index.ts',
  output: {
    file: 'lib/promise.js',
    format: 'umd',
    name: 'Promise',
    sourcemap: true
  },
  plugins: [
    commonjs(),
    typescript()
  ]
};

module.exports = config;
