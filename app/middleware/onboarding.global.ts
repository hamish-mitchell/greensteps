// Redirect a logged in user to onboarding until they complete it.
export default defineNuxtRouteMiddleware(async (to) => {
  // Allow public routes without user or during auth flows
  const supabaseUser = useSupabaseUser();
  if (!supabaseUser.value) return;

  // Allowed routes without completion
  const allow = new Set(['/onboarding', '/login', '/confirm']);
  if (allow.has(to.path)) return;

  const supabase = useSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', supabaseUser.value.id)
    .single<{ onboarding_completed: boolean }>();

  if (!error && data && !data.onboarding_completed) {
    return navigateTo('/onboarding');
  }
});
