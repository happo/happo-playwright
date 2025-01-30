import globals from 'globals';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';

export default tseslint.config(
  {
    // Note: there should be no other properties in this object
    ignores: ['.next/*', 'dist/*'],
  },

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
);
