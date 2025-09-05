/**
 * Onboarding Completion Composable - User Setup State
 * 
 * Centralized, cached fetch of the user's onboarding completion state.
 * Avoids running a Supabase query on every route navigation.
 * Usage: const { onboardingCompleted, ensureLoaded, markCompleted } = useOnboardingCompleted()
 */

export function useOnboardingCompleted() {
  const supabaseUser = useSupabaseUser();
  const supabase = useSupabaseClient();

  // null = unknown (not fetched yet), boolean once loaded
  const onboardingCompleted = useState<boolean | null>('onboardingCompleted', () => null);
  // Track an in‑flight promise so concurrent callers share it
  const loadingPromise = useState<Promise<boolean> | null>('onboardingCompletedPromise', () => null);

  async function fetchOnce(): Promise<boolean> {
    if (!supabaseUser.value) {
      onboardingCompleted.value = false; // treat as not completed (public routes can ignore)
      return false;
    }
    // If already loaded, return immediately
    if (onboardingCompleted.value !== null) return onboardingCompleted.value;
    if (loadingPromise.value) return loadingPromise.value;
    loadingPromise.value = (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', supabaseUser.value!.id)
        .single<{ onboarding_completed: boolean }>();
      if (!error && data) {
        onboardingCompleted.value = !!data.onboarding_completed;
      } else {
        // On error, default to true to avoid blocking normal navigation; log for debugging
        if (process.dev) console.warn('[onboarding] failed to load status', error);
        onboardingCompleted.value = true;
      }
      loadingPromise.value = null;
      return onboardingCompleted.value;
    })();
    return loadingPromise.value;
  }

  function ensureLoaded(): Promise<boolean> {
    return fetchOnce();
  }

  function markCompleted() {
    onboardingCompleted.value = true;
  }

  return { onboardingCompleted, ensureLoaded, markCompleted };
}
