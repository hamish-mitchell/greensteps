import tailwindcss from "@tailwindcss/vite";

// Nuxt configuration (hybrid SSR / SPA)
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15", // Nuxt compatibility lock
    devtools: { enabled: true },
    css: ["~/assets/css/tailwind.css"], // global styles (tailwind + custom)

    vite: {
        plugins: [tailwindcss()], // Tailwind via Vite plugin
    },

    // Temporarily removed '@nuxt/content' due to startup error; will re-add after fixing tips page implementation
    modules: ["@nuxt/eslint", "@nuxtjs/supabase", "shadcn-nuxt", "@nuxt/fonts"], // Supabase + lint

    supabase: {
        // Uses env vars (avoid hardcoding)
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_ANON_KEY,

        redirectOptions: {
            login: '/login',
            callback: '/confirm',
            exclude: ['/reset-password']
        }
    },

    runtimeConfig: {
        public: {
            // Exposed to client; duplication for backward compatibility
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
            SITE_URL: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        },
    },

    shadcn: {
        prefix: "",
        componentDir: "app/components/ui",
    },

    fonts: {
        defaults: {
            weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
            styles: ["normal", "italic"],
        },
    },

    
});