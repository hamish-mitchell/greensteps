import tailwindcss from "@tailwindcss/vite";

// Nuxt configuration (hybrid SSR / SPA)
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15", // Nuxt compatibility lock
    devtools: { enabled: true },
    css: ["~/assets/css/tailwind.css"], // global styles (tailwind + custom)

    vite: {
        plugins: [tailwindcss()], // Tailwind via Vite plugin
    },

    modules: ["@nuxt/eslint", "@nuxtjs/supabase"], // Supabase + lint integration

    supabase: {
        // Uses env vars (avoid hardcoding)
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_ANON_KEY,
        redirect: false, // manual route handling after auth events
    },


    runtimeConfig: {
        public: {
            // Exposed to client; duplication for backward compatibility
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        },
    },
});
