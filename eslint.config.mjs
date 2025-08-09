// Flat ESLint configuration
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { ignores: ['dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**', '**/*.js', '**/*.d.ts', 'e2e/**', 'prisma/seed.ts', 'scripts/**/*.ts'] },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    settings: {},
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommendedTypeChecked[0].rules,
      ...tseslint.configs.stylisticTypeChecked[0].rules,
      'no-unused-vars': 'off',  // Disable base rule in favor of TypeScript version
      'no-undef': 'off',  // TypeScript handles this
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  // Disable formatting rules handled by Prettier
  {
    rules: {
      ...prettier.rules,
    },
  },
  // Test file overrides
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  // Non-project type (config / scripts) - disable type-aware rules
  {
    files: [
      'jest.config.ts',
      'playwright.config.ts',
      'prisma/**/*.ts',
      'scripts/**/*.ts',
      '__tests__/**/*.ts',
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { projectService: false },
      globals: { ...globals.node },
    },
    rules: {
      // Relax some strict rules for scripts
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
