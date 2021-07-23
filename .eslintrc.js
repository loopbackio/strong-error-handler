module.exports = {
  extends: [
    '@loopback/eslint-config/eslintrc.js',
    // 'plugin:prettier/recommended',
  ],
  plugins: ['prettier'],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        /*
         * The mocha plugin reports the following signature as a violation of
         * `mocha/handle-done-callback` (misinterpreting `this` as `done`).
         *
         * See https://github.com/lo1tuma/eslint-plugin-mocha/issues/270
         *
         * ```ts
         * before(async function setupApplication(this: Mocha.Context) {
         *   this.timeout(6000);
         *   // ...
         * }
         * ```
         */
        'mocha/handle-done-callback': 'off',
      },
    },
  ],
};
