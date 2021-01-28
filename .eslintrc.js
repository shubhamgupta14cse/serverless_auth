module.exports = {
  root: true,
  extends: 'airbnb-base',
  plugins: ['import'],
  settings: {
    'import/core-modules': ['aws-sdk']
  },
  env: {
    node: true,
    jest: true
  },
  rules: {
    'array-bracket-spacing': [
      'error',
      'always',
      {
        objectsInArrays: false,
        arraysInArrays: false
      }
    ],
    'arrow-parens': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'func-names': 'off',
    'operator-linebreak': 'off',
    'implicit-arrow-linebreak': 'off',
    camelcase: 'off',
    semi: ['error', 'never']
  }
}
