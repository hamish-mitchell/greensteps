/**
 * Recovery Redirect Middleware - Authentication Flow Handler
 * 
 * Global middleware that normalizes Supabase recovery URLs.
 * Redirects users to /reset-password when recovery tokens are present
 * regardless of which path Supabase initially sent them to.
 * 
 * Author: Hamish Mitchell
 * Date: 18/08/2025
 */
export default defineNuxtRouteMiddleware((to) => {
  // Already on correct page
  if (to.path === '/reset-password') return;

  const code = to.query.code as string | undefined;
  const type = (to.query.type as string | undefined)?.toLowerCase();
  if (!code) return; // nothing to do
  if (type && type !== 'recovery') return; // different flow (e.g. signup, invite)

  return navigateTo({
    path: '/reset-password',
    query: { code, ...(type ? { type } : {}) }
  });
});
