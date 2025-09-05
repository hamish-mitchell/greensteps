/**
 * Badge system composable for GreenSteps application
 * 
 * Manages user achievements and badges earned through completing quests
 * and reaching environmental milestones. Badges provide gamification 
 * elements to encourage continued engagement with sustainable practices.
 * 
 * @author GreenSteps Team
 */

/**
 * User badge interface representing an earned achievement
 * Contains both the user-specific data (when awarded) and the badge definition
 */
export interface UserBadge {
  badge_id: number;
  awarded_at: string; // ISO timestamp when badge was earned
  code: string; // Unique badge identifier
  name: string; // Display name for the badge
  description: string | null; // Achievement description
  icon: string | null; // Icon identifier or URL
}

/**
 * Database row structure for badge queries
 * Includes the joined badges table data for efficient querying
 */
interface BadgeDbRow {
  badge_id: number;
  awarded_at: string;
  badges: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    icon: string | null;
  };
}

/**
 * Badge management composable
 * 
 * Provides reactive state and functions for:
 * - Loading user's earned badges
 * - Automatic refresh when user changes
 * - Error handling for badge operations
 */
export function useBadges() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const badges = ref<UserBadge[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Refreshes the user's badge collection from the database
   * 
   * Fetches all badges earned by the current user, ordered by
   * most recently awarded first. Joins with the badges table
   * to get the full badge definitions.
   */
  async function refresh() {
    if (!user.value) return;
    loading.value = true;
    error.value = null;
    const { data, error: dbError } = await supabase
      .from('user_badges')
      .select('badge_id:badge_id, awarded_at, badges:badges(id, code, name, description, icon)')
      .eq('user_id', user.value.id)
      .order('awarded_at', { ascending: false });
    if (dbError) {
      error.value = dbError.message;
    } else if (data) {
      badges.value = (data as BadgeDbRow[]).map((r) => ({
        badge_id: r.badge_id,
        awarded_at: r.awarded_at,
        code: r.badges.code,
        name: r.badges.name,
        description: r.badges.description,
        icon: r.badges.icon,
      }));
    }
    loading.value = false;
  }

  watch(() => user.value?.id, (id) => { if (id) refresh(); }, { immediate: true });

  return { badges, loading, error, refresh };
}
