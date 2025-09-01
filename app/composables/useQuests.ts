export interface UserQuest {
  id: number; // user_quests.id
  quest_id: number;
  name: string;
  description: string | null;
  category: string | null;
  min_value: number | null;
  max_value: number | null;
  points_multiplier: number;
  progress: number | null;
  completed: boolean;
  completed_at: string | null;
  percent: number;
}

export interface QuestDefinition {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  min_value: number | null;
  max_value: number | null;
  points_multiplier: number;
}

export function useQuests() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const active = ref<UserQuest[]>([]);
  const completed = ref<UserQuest[]>([]);
  const discover = ref<QuestDefinition[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    if (!user.value) return;
    loading.value = true;
    error.value = null;
    try {
      const { data: uq, error: uqErr } = await supabase
        .from('user_quests')
        .select('id, quest_id, progress, completed, completed_at, quests:quests(id, name, description, category, min_value, max_value, points_multiplier)')
        .eq('user_id', user.value.id);
      if (uqErr) throw uqErr;
      const userQuests: UserQuest[] = (uq || []).map((r: any) => {
        const q = r.quests;
        const denom = (q.max_value ?? 0);
        const pct = denom > 0 && r.progress != null ? Math.min(100, Math.round((r.progress / denom) * 100)) : 0;
        return {
          id: r.id,
          quest_id: r.quest_id,
          name: q.name,
          description: q.description,
          category: q.category,
          min_value: q.min_value,
          max_value: q.max_value,
          points_multiplier: q.points_multiplier,
          progress: r.progress,
          completed: r.completed,
          completed_at: r.completed_at,
          percent: pct,
        };
      });
      active.value = userQuests.filter(q => !q.completed);
      completed.value = userQuests.filter(q => q.completed);
      const ownedQuestIds = new Set(userQuests.map(q => q.quest_id));
      const { data: allActive, error: allErr } = await supabase
        .from('quests')
        .select('id, name, description, category, min_value, max_value, points_multiplier')
        .eq('active', true);
      if (allErr) throw allErr;
      discover.value = (allActive || []).filter((q: any) => !ownedQuestIds.has(q.id));
    } catch (e: any) {
      error.value = e.message || 'Failed to load quests';
    } finally {
      loading.value = false;
    }
  }

  async function enroll(questId: number) {
    if (!user.value) return;
    // Cast to any to avoid type inference issue if generated types aren't present
    const payload: any = { user_id: user.value.id, quest_id: questId, progress: 0 };
    const { error: insErr } = await supabase.from('user_quests').insert(payload as any);
    if (insErr) {
      error.value = insErr.message;
    } else {
      await load();
    }
  }

  watch(() => user.value?.id, (id) => { if (id) load(); }, { immediate: true });

  return { active, completed, discover, loading, error, reload: load, enroll };
}
