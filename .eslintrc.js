module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'standard',
    "plugin:flowtype/recommended"
  ],
  plugins: [
    "flowtype"
  ],
  globals: {},
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-unused-vars': 1,
    'space-before-function-paren': 0,
    'eol-last': 0,
    'padded-blocks': 0,
    'new-cap': 0,
    'eqeqeq': 0,
    'no-new': 0,
    'spaced-comment': 0,
    'handle-callback-err': 0,
    'no-useless-escape': 0
  }
}
