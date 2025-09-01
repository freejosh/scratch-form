module.exports = {
  root: true,
  extends: 'airbnb',
  env: {
    browser: true,
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
  ],
};
