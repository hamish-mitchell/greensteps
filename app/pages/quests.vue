<script setup lang="ts">
definePageMeta({
    layout: "app-shell",
    tagline: "Complete quests to earn points and grow your streak",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

interface Quest {
    id: number;
    name: string;
    description: string;
    category: string;
    min_value: number;
    max_value: number;
    points_multiplier: number; // added
}

interface UserQuest {
    id: number;
    user_id: string;
    quest_id: number;
    value: number;
    progress: number;
    created_at?: string;
}

const quests = ref<Quest[]>([])
const activeQuests = ref<UserQuest[]>([])
const completedQuests = ref<UserQuest[]>([])

const {data} = await supabase
    .from("quests")
    .select("*")

let activeQuestsData: UserQuest[] | null = [];
if (user.value?.id) {
    const { data: fetchedActive } = await supabase
        .from("user_quests")
        .select("*")
        .eq("user_id", user.value.id);
    activeQuestsData = fetchedActive;
}

quests.value = data || [];
activeQuests.value = activeQuestsData?.filter(quest => quest.progress < quest.value) || [];
completedQuests.value = activeQuestsData?.filter(quest => quest.progress >= quest.value) || [];

// helper for quick quest lookup
const questsMap = computed<Record<number, Quest>>(() =>
    Object.fromEntries(quests.value.map(q => [q.id, q]))
);

// refresh function
async function refreshUserQuests() {
    if (!user.value?.id) return;
    const { data: fetched } = await supabase
        .from("user_quests")
        .select("*")
        .eq("user_id", user.value.id);
    const list = fetched || [];
    activeQuests.value = list.filter(q => q.progress < q.value);
    completedQuests.value = list.filter(q => q.progress >= q.value);
}

async function startQuest(questId: number) {
    if (!user.value?.id) return;
    const quest = quests.value.find(q => q.id === questId);
    if (!quest) return;
    const { error } = await supabase
        .from("user_quests")
        // @ts-expect-error
        .insert({ user_id: user.value.id, quest_id: quest.id, value: quest.min_value, progress: 0 });
    if (error) {
        console.error("Error starting quest:", error.message);
    } else {
        await refreshUserQuests();
    }
}

// increment progress + award points if completed
async function incrementQuest(userQuestId: number) {
    if (!user.value?.id) return;
    // find in local state
    const uq = [...activeQuests.value, ...completedQuests.value].find(q => q.id === userQuestId);
    if (!uq) return;
    if (uq.progress >= uq.value) return; // already complete
    const newProgress = Math.min(uq.progress + 1, uq.value);
    const { data: updated, error } = await supabase
        .from("user_quests")
        .update({ progress: newProgress })
        .eq("id", uq.id)
        .select()
        .single();
    if (error) {
        console.error("Error updating quest progress:", error.message);
        return;
    }
    const justCompleted = uq.progress < uq.value && newProgress >= uq.value;
    if (justCompleted) {
        const quest = questsMap.value[uq.quest_id];
        if (quest) {
            const pointsAwarded = uq.value * (quest.points_multiplier || 1);
            // fetch current total_points
            const { data: profile, error: profileErr } = await supabase
                .from("profiles")
                .select("total_points")
                .eq("id", user.value.id)
                .single();
            if (!profileErr) {
                const current = profile?.total_points || 0;
                const { error: updErr } = await supabase
                    .from("profiles")
                    .update({ total_points: current + pointsAwarded })
                    .eq("id", user.value.id);
                if (updErr) console.error("Error updating points:", updErr.message);
            } else {
                console.error("Error fetching profile:", profileErr.message);
            }
        }
    }
    await refreshUserQuests();
}
</script>

<template>
    <div>
        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
            <div class="gap-4 flex flex-col">
                <!-- Start buttons -->
                <Button v-for="quest in quests" :key="quest.id" @click="startQuest(quest.id)">
                    Start Quest "{{ quest.name }}"
                </Button>

                <div class="mt-4">
                    <h2 class="font-bold">Active Quests</h2>
                    <div v-if="activeQuests.length === 0" class="text-sm text-muted-foreground">No active quests.</div>
                    <div v-for="uq in activeQuests" :key="uq.id" class="border rounded p-2 flex items-center justify-between gap-2">
                        <div class="flex-1">
                            <div class="font-medium">
                                {{ questsMap[uq.quest_id]?.name || 'Quest #' + uq.quest_id }}
                            </div>
                            <div class="text-xs text-muted-foreground">
                                Progress: {{ uq.progress }} / {{ uq.value }}
                            </div>
                        </div>
                        <Button size="sm" @click="incrementQuest(uq.id)">
                            +1
                        </Button>
                    </div>
                </div>

                <div class="mt-4">
                    <h2 class="font-bold">Completed Quests</h2>
                    <div v-if="completedQuests.length === 0" class="text-sm text-muted-foreground">No completed quests.</div>
                    <ul>
                        <li v-for="uq in completedQuests" :key="uq.id" class="text-sm">
                            {{ questsMap[uq.quest_id]?.name || 'Quest #' + uq.quest_id }} ({{ uq.value }})
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
