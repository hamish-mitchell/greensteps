/**
 * SSR Width Plugin - Client-Server Rendering Consistency
 * 
 * Provides consistent width values for SSR to prevent hydration mismatches.
 * Used by shadcn-vue components for responsive behavior.
 */
import { provideSSRWidth } from "@vueuse/core";

/*
 * Provide SSR width for shadcn-vue components
 */
export default defineNuxtPlugin((nuxtApp) => {
    provideSSRWidth(1024, nuxtApp.vueApp);
});
