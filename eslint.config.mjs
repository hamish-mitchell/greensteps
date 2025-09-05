/**
 * ESLint Configuration - Code Quality Rules
 * 
 * Extends Nuxt's default ESLint configuration with custom ignores.
 * Excludes UI component library and legacy code from linting.
 */
// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt([
    {
        ignores: ["app/components/ui/**", ".old/**"],
    },
]);
