import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'
import promise from 'eslint-plugin-promise'
import preferArrow from 'eslint-plugin-prefer-arrow'
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'

const baseRules = {
  'arrow-body-style': ['warn', 'never'],
  'camelcase': [
    'warn',
    { allow: ['after_txid', 'token_holders_count', 'Geist_Mono', 'Geist_Sans'] },
  ],
  'complexity': ['warn', 10],
  'consistent-return': 'warn',
  'curly': ['warn', 'all'],
  'max-params': ['warn', 4],
  'new-cap': ['warn', { capIsNewExceptionPattern: '^Big$|^[A-Z][a-zA-Z0-9_]*$' }],
  'no-alert': 'warn',
  'no-console': 'warn',
  'no-else-return': 'warn',
  'no-multi-assign': 'error',
  'no-param-reassign': 'warn',
  'no-return-assign': 'warn',
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
  'no-use-before-define': 'error',
  'no-var': 'error',
  'object-shorthand': 'warn',
  'prefer-arrow/prefer-arrow-functions': [
    'warn',
    { disallowPrototype: false, singleReturnOnly: true },
  ],
  'prefer-template': 'warn',
  'promise/always-return': 'off',
  'promise/catch-or-return': ['error', { allowFinally: true }],
  'promise/no-nesting': 'off',
  'quotes': ['warn', 'single', { allowTemplateLiterals: false, avoidEscape: true }],
  'sort-destructure-keys/sort-destructure-keys': ['warn', { caseSensitive: false }],
  'sort-keys': ['warn', 'asc', { caseSensitive: false, natural: true }],
  // strict: omitido; TypeScript con strict en tsconfig ya lo cubre
}

const nextTsRules = {
  '@typescript-eslint/no-shadow': 'error',
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
  'no-shadow': 'off',
  'import/order': [
    'warn',
    {
      'alphabetize': { caseInsensitive: true, order: 'asc' },
      'groups': [['builtin', 'external'], ['internal', 'parent'], 'sibling'],
      'newlines-between': 'always',
    },
  ],
  'react/jsx-sort-props': 'warn',
  'react/no-unknown-property': 'error',
  'react/prop-types': 'off',
  'react/react-in-jsx-scope': 'off',
  'sort-imports': 'off',
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      promise,
      'prefer-arrow': preferArrow,
      'sort-destructure-keys': sortDestructureKeys,
    },
    rules: {
      ...promise.configs['flat/recommended'].rules,
      ...baseRules,
      ...nextTsRules,
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**']),
])

export default eslintConfig
