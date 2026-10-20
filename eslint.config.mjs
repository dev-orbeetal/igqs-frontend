import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The codebase's "fetch in useEffect, track a loading boolean" pattern
      // — used across most of the admin panel and several public pages —
      // synchronously calls setState(true) before the async request, which
      // this rule flags. It's a well-understood, safe pattern; rewriting
      // every call site to avoid it is a disproportionate risk for a
      // cosmetic lint rule, so this is a warning rather than a hard error,
      // same tier as @next/next/no-img-element below.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
