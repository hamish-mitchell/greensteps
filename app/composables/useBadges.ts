export interface UserBadge {
  badge_id: number;
  awarded_at: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export function useBadges() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const badges = ref<UserBadge[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

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
      badges.value = data.map((r: any) => ({
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