module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'react-refresh',
    '@typescript-eslint',
  ],
  rules: {
    // TypeScript 相关规则
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/prefer-as-const': 'off',
    
    // React 相关规则
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // 一般JavaScript规则
    'prefer-const': 'off',
    'no-unused-vars': 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    'no-empty': 'off',
    'no-irregular-whitespace': 'off',
    'no-case-declarations': 'off',
    'no-fallthrough': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'no-redeclare': 'off',
    'no-undef': 'off',
    'no-unreachable': 'off',
    'no-useless-escape': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'dist/**',
    'build/**',
    'node_modules/**',
    '*.config.js',
    '*.config.ts',
    'coverage/**',
    '.nyc_output/**',
    '.vscode/**',
    '.idea/**',
  ],
};