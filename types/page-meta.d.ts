/**
 * Page Meta Types - Route Enhancement
 * 
 * TypeScript declarations extending Nuxt's PageMeta and Vue Router
 * to support custom tagline property for breadcrumb navigation.
 */
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
