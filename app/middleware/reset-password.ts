/**
 * Reset Password Middleware - Authentication Protection
 * 
 * Redirects authenticated users away from /reset-password unless they have
 * valid recovery context (recovery tokens). Prevents access conflicts.
 */
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();
  if (!user.value) return; // Only care if logged in

  // If user is logged in but arriving with a recovery token, allow updating password (e.g. they clicked link while logged in)
  const hasCode = to.query.code;
  const hash = (to.hash || '').replace(/^#/, '');
  const hashParams = new URLSearchParams(hash);
  const hasRecoveryHash = hashParams.get('access_token') && hashParams.get('type') === 'recovery';

  if (hasCode || hasRecoveryHash) return; // allow

  // Otherwise redirect them to dashboard (or index which redirects to dashboard)
  return navigateTo('/dashboard');
});
