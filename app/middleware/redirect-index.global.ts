/**
 * Index Redirect Middleware - Route Management
 * 
 * Automatically redirects the root path "/" to the dashboard
 * to provide immediate access to the main application.
 * 
 * Author: Hamish Mitchell
 * Date: 18/08/2025
 */
export default defineNuxtRouteMiddleware((to) => {
    if (to.path == "/") {
        return navigateTo("/dashboard");
    }
});
