/*
 * Redirect index to dashboard.
 * The index page is used for semantics in code
 * and showing debug data in development.
 */
export default defineNuxtRouteMiddleware((to) => {
    if (to.path == "/") {
        return navigateTo("/dashboard");
    }
});
