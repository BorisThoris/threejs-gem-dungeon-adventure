import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', 'scripts/**', 'code_examples/**']
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // ===== CRITICAL REACT & PERFORMANCE RULES =====
      
      // React Hooks Rules - CRITICAL for React functionality
      'react-hooks/rules-of-hooks': 'error',           // Prevents hooks from being called conditionally
      'react-hooks/exhaustive-deps': 'warn',          // Warns about missing dependencies (performance)
      
      // React Refresh - CRITICAL for development
      'react-refresh/only-export-components': 'error', // Errors on fast refresh issues
      
      // ===== PERFORMANCE & MEMORY LEAKS =====
      
      // Critical performance issues
      'no-case-declarations': 'error',                // Prevents variable hoisting issues in switch cases
      
      // ===== TYPE SAFETY (Only Critical Issues) =====
      
      // Only error on truly dangerous type issues
      '@typescript-eslint/no-explicit-any': 'warn',   // Warn about 'any' usage (can cause runtime errors)
      
      // ===== DISABLED RULES (Too Strict for Development) =====
      
      // Disable overly strict rules that don't affect functionality
      '@typescript-eslint/no-unused-vars': 'off',     // Disabled - too noisy, use IDE or other tools
      'no-empty-pattern': 'off',                      // Disabled - not critical
      
      // ===== ADDITIONAL PERFORMANCE RULES =====
      
      // Prevent common performance pitfalls
      'no-var': 'warn',                               // Warn about var usage (scope issues)
      'prefer-const': 'warn',                         // Warn about let when const could be used
      
      // ===== REACT-SPECIFIC PERFORMANCE =====
      
      // These would be React-specific rules if we had the plugin
      // 'react/jsx-no-bind': 'warn',                // Warn about inline functions in JSX
      // 'react/jsx-no-constructed-context-values': 'warn', // Warn about object creation in context
    },
  },
]
