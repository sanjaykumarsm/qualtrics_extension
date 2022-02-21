module.exports = {
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
    'parser': 'babel-eslint',
    'ecmaFeatures': {
      'jsx': true,
    }
  },
  'env': {
    'es6': true,
    'node': true,
    'mocha': true,
    'browser': true,
  },
  'extends': [ 'eslint:recommended', 'plugin:react/recommended' ],
  'plugins': [
    'json-format'
  ],
  'settings': {
    'react': {
      'version': 'detect'
    },
    'json/sort-package-json': false,
    'json/ignore-files': [ '**/package-lock.json' ],
  },
  'rules': {
    'indent': [
      'error',
      2,
      {
        'MemberExpression': 1,
        'SwitchCase': 1
      }
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'space-before-blocks': [
      'error',
      'always'
    ],
    'comma-spacing': [
      'error',
      { 'before': false, 'after': true }
    ],
    'comma-style': [
      'error', 'last'
    ],
    'comma-dangle': 'off',
    'key-spacing': [
      'error', {
        'afterColon': true,
        'mode': 'strict',
      }
    ],
    'prefer-const': [
      'off',
    ],
    'no-var': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': [
      'error',
      { 'before': true, 'after': true }
    ],
    'space-infix-ops': [
      'error'
    ],
    'keyword-spacing': [
      'error',
      {
        'after': true,
        'overrides': {
          'if': { 'after': false },
          'switch': { 'after': false },
          'for': { 'after': false },
          'while': { 'after': false },
          'catch': { 'after': false },
        }
      }
    ],
    'semi-spacing': [
      'error',
      {
        'after': true
      }
    ],
    'object-shorthand': [ 'error', 'properties' ],
    'eqeqeq': [ 'error', 'always' ],
    'no-trailing-spaces': [ 'error' ],
    'eol-last': [ 'error', 'always' ],
    'no-case-declarations': [ 'off' ],
    'object-curly-spacing': [ 'error', 'always' ],
    'array-bracket-spacing': [ 'error', 'always', { 'objectsInArrays': false, 'arraysInArrays': false }],
    'space-in-parens': [ 'error' ],
    'no-multiple-empty-lines': [ 'error', { 'max': 1, 'maxBOF': 1 }],
    'newline-per-chained-call': 'off',
    'brace-style': [ 2 ],
    'space-before-function-paren': [ 'error', {
      'named': 'never',
      'anonymous': 'never',
      'asyncArrow': 'always'
    }],
    'no-unused-vars': [ 'error', {
      args: 'none' // reason: preserve fn interfaces, eg: const onClick = (data, event) => {/* ... */};
    }],
    'react/display-name': 0,
    'react/prop-types': 0,
  }
};
