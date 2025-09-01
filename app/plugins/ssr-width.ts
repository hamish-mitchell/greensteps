import { provideSSRWidth } from "@vueuse/core";

/*
 * Provide SSR width for shadcn-vue components
 */
export default defineNuxtPlugin((nuxtApp) => {
    provideSSRWidth(1024, nuxtApp.vueApp);
});
