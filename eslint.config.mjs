// SPDX-FileCopyrightText: Copyright LoopBack contributors 2024.
// SPDX-License-Identifier: MIT
import {FlatCompat} from '@eslint/eslintrc';
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...compat.extends('loopback'),
  {
    languageOptions: {
      ecmaVersion: 'latest',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
];
