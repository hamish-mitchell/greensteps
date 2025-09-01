export interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  rank: number;
  state: string | null;
  you: boolean;
}

type Scope = 'friends' | 'regional' | 'global';

export function useLeaderboard(initialScope: Scope = 'global') {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const scope = ref<Scope>(initialScope);
  const entries = ref<LeaderboardEntry[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    if (!user.value) return;
    loading.value = true;
    error.value = null;
    try {
      if (scope.value === 'friends') {
        const { data: fr, error: frErr } = await supabase
          .from('friendships')
          .select('friend_id')
          .eq('user_id', user.value.id);
        if (frErr) throw frErr;
        const friendIds: string[] = (fr || []).map((f: any) => f.friend_id).filter(Boolean);
        if (!friendIds.length) {
          entries.value = [];
        } else {
          const { data: profiles, error: pErr } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, total_points, state, is_private')
            .in('id', friendIds.concat(user.value.id));
          if (pErr) throw pErr;
          entries.value = (profiles || [])
            .filter((p: any) => !p.is_private || p.id === user.value?.id)
            .sort((a: any, b: any) => b.total_points - a.total_points)
            .map((p: any, i: number) => ({
              id: p.id,
              display_name: p.display_name || 'Anon',
              avatar_url: p.avatar_url,
              total_points: p.total_points || 0,
              state: p.state,
              rank: i + 1,
              you: p.id === user.value?.id,
            }));
        }
      } else if (scope.value === 'regional') {
        const { data: me } = await supabase
          .from('profiles')
          .select('state')
          .eq('id', user.value.id)
          .single();
  const st = (me as any)?.state as string | undefined;
        if (!st) {
          entries.value = [];
        } else {
          const { data: profiles, error: pErr } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, total_points, state, is_private')
            .eq('state', st)
            .order('total_points', { ascending: false })
            .limit(50);
          if (pErr) throw pErr;
          entries.value = (profiles || [])
            .filter((p: any) => !p.is_private || p.id === user.value?.id)
            .map((p: any, i: number) => ({
              id: p.id,
              display_name: p.display_name || 'Anon',
              avatar_url: p.avatar_url,
              total_points: p.total_points || 0,
              state: p.state,
              rank: i + 1,
              you: p.id === user.value?.id,
            }));
        }
      } else {
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, total_points, state, is_private')
          .order('total_points', { ascending: false })
          .limit(50);
        if (pErr) throw pErr;
        entries.value = (profiles || [])
          .filter((p: any) => !p.is_private || p.id === user.value?.id)
          .map((p: any, i: number) => ({
            id: p.id,
            display_name: p.display_name || 'Anon',
            avatar_url: p.avatar_url,
            total_points: p.total_points || 0,
            state: p.state,
            rank: i + 1,
            you: p.id === user.value?.id,
          }));
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to load leaderboard';
    } finally {
      loading.value = false;
    }
  }

  function setScope(s: Scope) {
    scope.value = s;
    load();
  }

  watch(() => user.value?.id, (id) => { if (id) load(); }, { immediate: true });
  watch(scope, () => { load(); });

  return { scope, entries, loading, error, setScope, reload: load };
}
