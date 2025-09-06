module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    browser: true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  ignorePatterns: [
    'dist/ScratchForm.js',
  ],
  overrides: [
    {
      // must use module.exports for bundler to set main function as global
      files: ['src/ScratchForm.js'],
      rules: { 'import/no-import-module-exports': 0 },
    },
    {
      files: ['build.mjs'],
      rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      },
    },
    {
      files: ['src/*'],
      rules: {
        'import/no-import-module-exports': 0,
        'import/extensions': 0,
      },
    },
  ],
};
