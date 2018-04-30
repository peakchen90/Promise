import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

const config = {
  input: 'src/index.js',
  output: {
    file: 'lib/promise.js',
    format: 'umd',
    name: 'Promise'
  },
  plugins: [
    resolve(),
    babel()
  ],
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  }
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(uglify())
}

export default config
