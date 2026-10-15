// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/.expo/**",
      "**/coverage/**"
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/consistent-type-imports": "warn",
      // Express Request tipini genişletmek için `declare global { namespace Express }` gerekli.
      "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  },
  {
    // React Native statik görselleri yalnızca require() ile paketleyebilir.
    files: ["apps/mobile/**"],
    rules: { "@typescript-eslint/no-require-imports": "off" }
  }
);
