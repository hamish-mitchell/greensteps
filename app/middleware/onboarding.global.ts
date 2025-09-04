/*
 * Redirect a logged in user to "/onboarding" until they complete it
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const supabaseUser = useSupabaseUser();
  if (!supabaseUser.value) return; // not logged in

  // Allowed routes without completion
  // Routes that should be accessible even if onboarding not yet complete OR during auth flows
  const allow = new Set(['/onboarding', '/login', '/confirm', '/reset-password', '/ai-demo']);
  if (allow.has(to.path)) return;

  const { onboardingCompleted, ensureLoaded } = useOnboardingCompleted();

  // If unknown, perform (single) fetch. This will only block the *first* guarded navigation.
  if (onboardingCompleted.value === null) {
    await ensureLoaded();
  }

  if (onboardingCompleted.value === false) {
    return navigateTo('/onboarding');
  }
});
