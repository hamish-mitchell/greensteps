/**
 * Quests Composable - Gamification System
 * 
 * Manages user quests, challenges, and progress tracking.
 * Handles quest completion, rewards, and progress updates.
 * 
 * Author: Hamish Mitchell
 * Date: 18/08/2025
 */
import { useEventBus } from "@vueuse/core";

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
    // Event bus for quest completion so UI layers can react (confetti, toasts, etc.)
    const questCompletedBus = useEventBus<{ quest: UserQuest }>(
        "quest:completed"
    );

    async function load() {
        if (!user.value) return;
        loading.value = true;
        error.value = null;
        try {
            const { data: uq, error: uqErr } = await supabase
                .from("user_quests")
                .select(
                    "id, quest_id, progress, completed, completed_at, quests:quests(id, name, description, category, min_value, max_value, points_multiplier)"
                )
                .eq("user_id", user.value.id);
            if (uqErr) throw uqErr;
            const userQuests: UserQuest[] = (uq || []).map((r: any) => {
                const q = r.quests;
                const denom = q.max_value ?? 0;
                const pct =
                    denom > 0 && r.progress != null
                        ? Math.min(100, Math.round((r.progress / denom) * 100))
                        : 0;
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
            active.value = userQuests.filter((q) => !q.completed);
            completed.value = userQuests.filter((q) => q.completed);
            const ownedQuestIds = new Set(userQuests.map((q) => q.quest_id));
            const { data: allActive, error: allErr } = await supabase
                .from("quests")
                .select(
                    "id, name, description, category, min_value, max_value, points_multiplier"
                )
                .eq("active", true);
            if (allErr) throw allErr;
            discover.value = (allActive || []).filter(
                (q: any) => !ownedQuestIds.has(q.id)
            );
        } catch (e: any) {
            error.value = e.message || "Failed to load quests";
        } finally {
            loading.value = false;
        }
    }

    async function enroll(questId: number) {
        if (!user.value) return;
        // Cast to any to avoid type inference issue if generated types aren't present
        const payload: any = {
            user_id: user.value.id,
            quest_id: questId,
            progress: 0,
        };
        const { error: insErr } = await supabase
            .from("user_quests")
            .insert(payload as any);
        if (insErr) {
            error.value = insErr.message;
        } else {
            await load();
        }
    }

    async function incrementProgress(userQuestId: number, delta = 1) {
        if (!user.value) return;
        // optimistic update
        const uq = [...active.value];
        const idx = uq.findIndex((q) => q.id === userQuestId);
        if (idx === -1) return;
        const target = { ...uq[idx] } as UserQuest; // clone
        const newProgress = (target.progress ?? 0) + delta;
        const max = target.max_value ?? null;
        const isCompleted = max != null && newProgress >= max;
        target.progress = newProgress;
        target.completed = isCompleted;
        target.percent = max
            ? Math.min(100, Math.round((newProgress / max) * 100))
            : 0;
        if (isCompleted) {
            // remove from active and push to completed
            active.value = uq.filter((q) => q.id !== userQuestId);
            completed.value = [...completed.value, target];
            // Fire completion event (client only)
            if (typeof window !== "undefined") {
                questCompletedBus.emit({ quest: target });
            }
        } else {
            uq[idx] = target;
            active.value = uq;
        }
        const { error: updErr } = await (supabase as any)
            .from("user_quests")
            .update({ progress: newProgress, completed: isCompleted })
            .eq("id", userQuestId)
            .eq("user_id", user.value.id);
        if (updErr) {
            error.value = updErr.message;
            // reload to rollback
            await load();
        }
    }

    async function cancelQuest(userQuestId: number) {
        if (!user.value) return;
        const { error: delErr } = await supabase
            .from("user_quests")
            .delete()
            .eq("id", userQuestId)
            .eq("user_id", user.value.id);
        if (delErr) {
            error.value = delErr.message;
        } else {
            await load();
        }
    }

    watch(
        () => user.value?.id,
        (id) => {
            if (id) load();
        },
        { immediate: true }
    );

    return {
        active,
        completed,
        discover,
        loading,
        error,
        reload: load,
        enroll,
        incrementProgress,
        cancelQuest,
    };
}
