// @ts-check

import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig({
  files: ["src/**/*.ts", "tests/**/*.ts"],
  extends: [
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    tseslint.configs.recommendedTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
});
