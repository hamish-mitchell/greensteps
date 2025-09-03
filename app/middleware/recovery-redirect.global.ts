/*
 * Global middleware: if Supabase sends user to wrong path (e.g. / or /login) with ?code=<token>&type=recovery
 * normalize by redirecting to /reset-password preserving query so the reset page can exchange the code.
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
