// Nuxt PageMeta and Vue Router meta augmentation for custom tagline support
declare module "#app" {
    interface PageMeta {
        /** Optional tagline shown in the app-shell header */
        tagline?: string;
    }
}

declare module "vue-router" {
    interface RouteMeta {
        /** Optional tagline shown in the app-shell header */
        tagline?: string;
    }
}

export {};
