import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";

export default [
  {
    ignores: ["**/dist", "**/node_modules"], // Ignore common output folders
  },
  // Base configuration shared by all
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"], // Match JavaScript and TypeScript files
    languageOptions: {
      ecmaVersion: "latest", // Use the latest ECMAScript syntax
      sourceType: "module", // Allow ECMAScript modules
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true }, // Enable JSX
      },
    },
    plugins: {
      prettier, // Add Prettier plugin
    },
    rules: {
      ...js.configs.recommended.rules,
      "prettier/prettier": "error", // Enforce Prettier formatting as an ESLint error
    },
  },
  // Client-specific configuration
  {
    files: ["client/**/*.{js,jsx,ts,tsx}"], // Files in the client workspace
    languageOptions: {
      globals: globals.browser, // Use browser-specific globals
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "react/prop-types": "off",
      "prettier/prettier": "error", // Enforce Prettier for client files
    },
  },
  // Server-specific configuration
  {
    files: ["server/**/*.{js,ts}"], // Files in the server workspace
    languageOptions: {
      globals: globals.node, // Use Node.js-specific globals
    },
    rules: {
      "no-console": "off", // Allow console logs for debugging
      "no-process-exit": "warn", // Warn about process.exit() usage
      "global-require": "off", // Allow require statements everywhere
      "prettier/prettier": "error", // Enforce Prettier for server files
    },
  },
];
