import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Disable inline style warnings - needed for dynamic width/height values in progress bars
  {
    rules: {
      "react/forbid-dom-props": "off",
      "react/forbid-component-props": "off",
      "react/style-prop-object": "off",
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
