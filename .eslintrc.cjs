module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'android', 'ios'],
  parser: '@typescript-eslint/parser',
  plugins: ['unused-imports'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off',
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'react/prop-types': 'off',
    'no-console': ['warn', { allow: ['log', 'info', 'warn', 'error'] }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
