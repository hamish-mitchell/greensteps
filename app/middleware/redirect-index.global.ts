/**
 * Index Redirect Middleware - Route Management
 * 
 * Automatically redirects the root path "/" to the dashboard
 * to provide immediate access to the main application.
 */
export default defineNuxtRouteMiddleware((to) => {
    if (to.path == "/") {
        return navigateTo("/dashboard");
    }
});
