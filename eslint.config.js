import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      // Numbers and booleans in template literals are safe and readable — disable overly pedantic rule
      "@typescript-eslint/restrict-template-expressions": "off",
      // Async function signatures must stay async for API consistency even without await
      "@typescript-eslint/require-await": "off",
      // SSEServerTransport deprecation warning is known; keep using it for backward compat
      "@typescript-eslint/no-deprecated": "warn",
      // Overly strict for runtime defensive checks
      "@typescript-eslint/no-unnecessary-condition": "off",
      // Some type conversions serve as documentation of intent
      "@typescript-eslint/no-unnecessary-type-conversion": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js"],
  }
);
